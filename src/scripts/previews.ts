import { reducedMotion } from './scroll';

const fade = 700;

function bindPreview(card: HTMLElement, video: HTMLVideoElement, loopWhileWanted: boolean) {
  let wanted = false;

  const start = () => {
    wanted = true;
    if (video.ended) video.currentTime = 0;
    video.play().catch(() => undefined);
  };

  const stop = () => {
    wanted = false;
    video.classList.remove('is-playing');
    window.setTimeout(() => {
      if (wanted) return;
      video.pause();
      video.currentTime = 0;
    }, fade);
  };

  video.addEventListener('playing', () => video.classList.add('is-playing'));

  video.addEventListener('ended', () => {
    video.classList.remove('is-playing');
    if (!loopWhileWanted) {
      wanted = false;
      return;
    }
    window.setTimeout(() => {
      if (!wanted) return;
      video.currentTime = 0;
      video.play().catch(() => undefined);
    }, fade);
  });

  return { start, stop, card };
}

export function initPreviews() {
  if (reducedMotion) return;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const previews = Array.from(document.querySelectorAll<HTMLElement>('[data-card]')).flatMap((card) => {
    const video = card.querySelector<HTMLVideoElement>('[data-card-video]');
    return video ? [bindPreview(card, video, canHover)] : [];
  });

  if (canHover) {
    previews.forEach(({ card, start, stop }) => {
      card.addEventListener('pointerenter', start);
      card.addEventListener('pointerleave', stop);
      card.addEventListener('focusin', start);
      card.addEventListener('focusout', stop);
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const preview = previews.find(({ card }) => card === entry.target);
        if (!preview) return;
        if (entry.intersectionRatio >= 0.6) preview.start();
        else preview.stop();
      });
    },
    { threshold: 0.6 },
  );
  previews.forEach(({ card }) => observer.observe(card));
}
