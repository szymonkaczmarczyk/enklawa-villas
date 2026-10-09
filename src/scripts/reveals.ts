import { gsap } from 'gsap';

export function initReveals() {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
    gsap.from(element, {
      opacity: 0,
      y: 32,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: element, start: 'top 90%', once: true },
    });
  });

  const grid = document.querySelector<HTMLElement>('[data-standard-grid]');
  if (grid) {
    gsap
      .timeline({ scrollTrigger: { trigger: grid, start: 'top 82%', once: true } })
      .from(grid.querySelectorAll('[data-standard-rule]'), { scale: 0, duration: 1.4, ease: 'expo.out', stagger: 0.12 })
      .from(
        grid.querySelectorAll('[data-standard-part]'),
        { opacity: 0, y: 24, duration: 1, ease: 'power3.out', stagger: 0.05 },
        0.1,
      );
  }

  gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card) => {
    const media = card.querySelector<HTMLElement>('[data-card-media]');
    const body = card.querySelector<HTMLElement>('[data-card-body]');
    if (!media || !body) return;
    gsap
      .timeline({ scrollTrigger: { trigger: card, start: 'top 85%', once: true } })
      .from(media, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      .from(media.querySelector('picture'), { scale: 1.16, duration: 1.8, ease: 'expo.out' }, 0.2)
      .from(body, { opacity: 0, y: 24, duration: 1, ease: 'power3.out', clearProps: 'transform' }, 0.7);
  });
}
