import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';

const source = 'videos/intro1.mp4';
const quiet = ['-hide_banner', '-loglevel', 'error', '-y'];

const framings = [
  { name: 'landscape', filter: 'scale=1920:-2' },
  { name: 'portrait', filter: 'crop=608:1080:656:0' },
];

const encoders = {
  mp4: ['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'],
  webm: ['-c:v', 'libvpx-vp9', '-crf', '33', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p'],
};

const megabytes = (file) => `${(statSync(file).size / 1024 / 1024).toFixed(2)} MB`;

mkdirSync('public/video', { recursive: true });
mkdirSync('src/assets/hero', { recursive: true });

for (const framing of framings) {
  const sizes = Object.entries(encoders).map(([extension, settings]) => {
    const file = `public/video/hero-${framing.name}.${extension}`;
    execFileSync(ffmpeg, [...quiet, '-i', source, '-an', '-vf', framing.filter, ...settings, file]);
    return `${extension} ${megabytes(file)}`;
  });
  console.log(`hero-${framing.name}: ${sizes.join(', ')}`);
  execFileSync(ffmpeg, [...quiet, '-sseof', '-0.1', '-i', source, '-vf', framing.filter, '-frames:v', '1', '-q:v', '1', `src/assets/hero/${framing.name}.jpg`]);
}
