import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { lockScroll, reducedMotion, scrollToTarget, targetFromHash, unlockScroll } from './scroll';

gsap.registerPlugin(SplitText);

const timing = { canPlay: 2800, playing: 1200, headline: 3.2, skippedHeadline: 0.5 };
const skipEvents = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

function canPlay(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return Promise.resolve();
  return new Promise<void>((resolve) => {
    video.addEventListener('canplay', () => resolve(), { once: true });
    video.addEventListener('error', () => resolve(), { once: true });
    window.setTimeout(resolve, timing.canPlay);
  });
}

function startFilm(video: HTMLVideoElement | null) {
  if (!video?.src || video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return Promise.resolve(false);
  return new Promise<boolean>((resolve) => {
    const timer = window.setTimeout(() => resolve(false), timing.playing);
    video.addEventListener(
      'playing',
      () => {
        window.clearTimeout(timer);
        resolve(true);
      },
      { once: true },
    );
    video.play().catch(() => {
      window.clearTimeout(timer);
      resolve(false);
    });
  });
}

function revealHeadline(hero: HTMLElement, delay: number) {
  const split = SplitText.create(hero.querySelector<HTMLElement>('[data-hero-title]')!, { type: 'lines' });
  gsap
    .timeline({ delay, onComplete: () => split.revert() })
    .from(split.lines, { opacity: 0, filter: 'blur(14px)', yPercent: 30, duration: 1.5, ease: 'expo.out', stagger: 0.12 })
    .from(
      hero.querySelectorAll('[data-hero-item]'),
      { opacity: 0, filter: 'blur(10px)', y: 16, duration: 1.2, ease: 'power3.out', stagger: 0.1 },
      0.35,
    );
}

export function playIntro() {
  const intro = document.querySelector<HTMLElement>('[data-intro]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!intro || !hero || reducedMotion) return Promise.resolve();

  const video = hero.querySelector<HTMLVideoElement>('[data-hero-video]');
  if (document.documentElement.dataset.introMode !== 'play') {
    intro.remove();
    video?.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
    video?.play().catch(() => undefined);
    const target = targetFromHash(location.hash);
    if (target) requestAnimationFrame(() => scrollToTarget(target, true));
    return Promise.resolve();
  }

  const brand = intro.querySelector<HTMLElement>('[data-intro-brand]');
  const lines = intro.querySelectorAll<HTMLElement>('[data-intro-line]');
  video?.addEventListener('playing', () => video.classList.add('is-playing'));
  lockScroll();

  const plate = gsap
    .timeline()
    .from(lines, { scaleY: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08 }, 0)
    .from(brand, { opacity: 0, filter: 'blur(16px)', scale: 0.96, duration: 1.3, ease: 'power3.out' }, 0.2);

  let userSkipped = false;
  let skip = () => {};
  const skipped = new Promise<void>((resolve) => {
    skip = () => {
      userSkipped = true;
      plate.progress(1);
      resolve();
    };
  });
  skipEvents.forEach((type) => window.addEventListener(type, skip, { once: true, passive: true }));

  const ready = Promise.all([plate.then(), video?.src ? canPlay(video) : undefined, document.fonts.ready]);

  return Promise.race([ready, skipped])
    .then(() => startFilm(video))
    .then(
      (filmStarted) =>
        new Promise<void>((resolve) => {
          skipEvents.forEach((type) => window.removeEventListener(type, skip));
          revealHeadline(hero, filmStarted && !userSkipped ? timing.headline : timing.skippedHeadline);
          gsap
            .timeline({
              onComplete: () => {
                document.documentElement.classList.remove('is-intro');
                intro.remove();
                unlockScroll();
                const target = targetFromHash(location.hash);
                if (target) scrollToTarget(target, true);
                resolve();
              },
            })
            .to(brand, { scale: 1.6, opacity: 0, filter: 'blur(8px)', duration: 1.1, ease: 'power2.in' }, 0)
            .to(lines, { opacity: 0, duration: 0.6, ease: 'power1.out' }, 0)
            .to(intro, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, 0.25);
        }),
    );
}
