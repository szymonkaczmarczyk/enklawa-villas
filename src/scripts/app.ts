import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initDossier } from './dossier';
import { playIntro } from './intro';
import { initMenu } from './menu';
import { initPreviews } from './previews';
import { initReveals } from './reveals';
import { reducedMotion, scrollToTarget, targetFromHash } from './scroll';
import { initScrolly } from './scrolly';
import { initSliders } from './slider';

const scrolly = document.querySelector<HTMLElement>('[data-scrolly]');
playIntro().then(() => {
  if (!scrolly) return;
  initScrolly(scrolly);
  ScrollTrigger.refresh();
});

initMenu();
initDossier();
initPreviews();
initSliders();
if (!reducedMotion) initReveals();

document.addEventListener('click', (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
  if (!link || link.closest('dialog') || link.classList.contains('skip-link')) return;
  const url = new URL(link.href);
  const target = url.pathname === location.pathname ? targetFromHash(url.hash) : null;
  if (!target) return;
  event.preventDefault();
  scrollToTarget(target);
  history.pushState(null, '', url.hash);
});

document.fonts.ready.then(() => ScrollTrigger.refresh());
