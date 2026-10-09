import { glob, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

const stripSystemFiles = {
  name: 'strip-system-files',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const root = fileURLToPath(dir);
      for await (const file of glob('**/{.DS_Store,Thumbs.db,._*}', { cwd: root })) {
        await rm(new URL(file, dir));
      }
    },
  },
};

export default defineConfig({
  site: 'https://enklawavillas.com',
  integrations: [stripSystemFiles],
  vite: {
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis'],
    },
  },
});
