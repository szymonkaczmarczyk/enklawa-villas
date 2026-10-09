import { reducedMotion } from './scroll';

export function initResidenceFilm() {
  const film = document.querySelector<HTMLVideoElement>('[data-residence-film]');
  if (!film?.dataset.src || reducedMotion) return;
  film.addEventListener('playing', () => film.classList.add('is-playing'), { once: true });
  film.src = film.dataset.src;
  film.play().catch(() => undefined);
}
