import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';
import { clips } from './clips.mjs';

const seconds = 5;
const quiet = ['-hide_banner', '-loglevel', 'error', '-y'];

mkdirSync('public/video', { recursive: true });
mkdirSync('src/assets/properties', { recursive: true });

for (const clip of clips) {
  const video = `public/video/${clip.name}.mp4`;
  execFileSync(ffmpeg, [
    ...quiet,
    '-ss', String(clip.start),
    '-i', clip.source,
    '-t', String(seconds),
    '-an',
    '-vf', 'scale=1280:-2',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '26',
    '-profile:v', 'high',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    video,
  ]);
  execFileSync(ffmpeg, [...quiet, '-ss', String(clip.start), '-i', clip.source, '-frames:v', '1', '-q:v', '1', `src/assets/properties/${clip.name}.jpg`]);
  console.log(`${clip.name}: ${(statSync(video).size / 1024 / 1024).toFixed(2)} MB`);
}
