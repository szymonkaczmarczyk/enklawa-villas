import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://enklawavillas.com',
  vite: {
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis'],
    },
  },
});
