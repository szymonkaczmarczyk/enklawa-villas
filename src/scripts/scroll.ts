import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

export const lenis = reducedMotion ? null : new Lenis({ lerp: 0.09 });

if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

let locks = 0;

export function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  lenis?.stop();
  document.documentElement.classList.add('is-locked');
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  lenis?.start();
  document.documentElement.classList.remove('is-locked');
}

export function scrollToTarget(target: HTMLElement, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target, { immediate });
    return;
  }
  target.scrollIntoView({ block: 'start' });
}

export function targetFromHash(hash: string) {
  return hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
}
