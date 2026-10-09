import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const source = 'videos/intro2.mp4';
const frameCount = 192;
const outputRoot = 'public/frames';

const sets = [
  { name: 'landscape', prepare: (image) => image.resize(1280, 720) },
  { name: 'portrait', prepare: (image) => image.extract({ left: 656, top: 0, width: 608, height: 1080 }) },
];

const workDir = mkdtempSync(path.join(tmpdir(), 'enklawa-frames-'));

try {
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', source, '-q:v', '1', path.join(workDir, '%04d.jpg')]);
  const rawFrames = readdirSync(workDir).filter((file) => file.endsWith('.jpg')).sort();
  const picked = Array.from({ length: frameCount }, (_, index) =>
    rawFrames[Math.round((index * (rawFrames.length - 1)) / (frameCount - 1))],
  );

  for (const set of sets) {
    const target = path.join(outputRoot, set.name);
    mkdirSync(target, { recursive: true });

    const written = new Set();
    let bytes = 0;
    for (const [index, file] of picked.entries()) {
      const name = `${String(index + 1).padStart(4, '0')}.webp`;
      await set
        .prepare(sharp(path.join(workDir, file)))
        .webp({ quality: 48, effort: 6, smartSubsample: true })
        .toFile(path.join(target, name));
      written.add(name);
      bytes += statSync(path.join(target, name)).size;
    }
    readdirSync(target)
      .filter((file) => !written.has(file))
      .forEach((file) => rmSync(path.join(target, file)));
    console.log(`${set.name}: ${picked.length} klatek, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
  }

  writeFileSync('src/data/frames.json', `${JSON.stringify({ count: frameCount, path: '/frames' }, null, 2)}\n`);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
