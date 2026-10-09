import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';
import { clips } from './clips.mjs';

const stills = [2.2, 4.6, 7.2];
const stillsFor = { pinie: [4.4, 5.9, 7.6] };
const quiet = ['-hide_banner', '-loglevel', 'error', '-y'];

mkdirSync('public/video', { recursive: true });
mkdirSync('src/assets/residences', { recursive: true });

for (const clip of clips) {
  const film = `public/video/residence-${clip.name}.mp4`;
  execFileSync(ffmpeg, [
    ...quiet,
    '-i', clip.source,
    '-an',
    '-vf', 'scale=1600:-2',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '25',
    '-profile:v', 'high',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    film,
  ]);
  const moments = stillsFor[clip.name] ?? stills;
  moments.forEach((second, index) => {
    execFileSync(ffmpeg, [
      ...quiet,
      '-ss', String(second),
      '-i', clip.source,
      '-frames:v', '1',
      '-q:v', '2',
      `src/assets/residences/${clip.name}-${index + 1}.jpg`,
    ]);
  });
  console.log(`${clip.name}: film ${(statSync(film).size / 1024 / 1024).toFixed(2)} MB, ${moments.length} kadry`);
}
