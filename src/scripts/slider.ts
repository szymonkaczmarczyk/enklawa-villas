import { reducedMotion } from './scroll';

const dragThreshold = 6;
const flickSpeed = 0.4;

export function initSliders() {
  document.querySelectorAll<HTMLElement>('[data-slider]').forEach((slider) => {
    const track = slider.querySelector<HTMLElement>('[data-slider-track]');
    const previous = slider.querySelector<HTMLButtonElement>('[data-slider-previous]');
    const next = slider.querySelector<HTMLButtonElement>('[data-slider-next]');
    if (!track || !previous || !next) return;

    const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth';
    const items = () => Array.from(track.children) as HTMLElement[];
    const offsetOf = (item: HTMLElement) => item.offsetLeft - items()[0].offsetLeft;

    const update = () => {
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };

    const nearestIndex = () => {
      const offsets = items().map(offsetOf);
      return offsets.reduce((best, offset, index) =>
        Math.abs(offset - track.scrollLeft) < Math.abs(offsets[best] - track.scrollLeft) ? index : best, 0);
    };

    const goTo = (index: number) => {
      const list = items();
      const target = list[Math.max(0, Math.min(list.length - 1, index))];
      track.scrollTo({ left: offsetOf(target), behavior });
    };

    previous.addEventListener('click', () => goTo(nearestIndex() - 1));
    next.addEventListener('click', () => goTo(nearestIndex() + 1));

    let drag: { pointer: number; startX: number; startScroll: number; lastX: number; lastTime: number; speed: number; moved: boolean } | null = null;
    let swallowClick = false;

    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      drag = { pointer: event.pointerId, startX: event.clientX, startScroll: track.scrollLeft, lastX: event.clientX, lastTime: event.timeStamp, speed: 0, moved: false };
    });

    track.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.pointer) return;
      const distance = event.clientX - drag.startX;
      if (!drag.moved && Math.abs(distance) < dragThreshold) return;
      if (!drag.moved) {
        drag.moved = true;
        track.setPointerCapture(event.pointerId);
        track.classList.add('is-dragging');
      }
      const elapsed = Math.max(1, event.timeStamp - drag.lastTime);
      drag.speed = (event.clientX - drag.lastX) / elapsed;
      drag.lastX = event.clientX;
      drag.lastTime = event.timeStamp;
      track.scrollLeft = drag.startScroll - distance;
    });

    const release = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointer) return;
      const { moved, speed } = drag;
      drag = null;
      if (!moved) return;
      swallowClick = true;
      setTimeout(() => {
        swallowClick = false;
      });
      track.classList.remove('is-dragging');
      if (Math.abs(speed) < flickSpeed) {
        goTo(nearestIndex());
        return;
      }
      const passed = items().filter((item) => offsetOf(item) <= track.scrollLeft + 1).length - 1;
      goTo(speed < 0 ? passed + 1 : passed);
    };

    track.addEventListener('pointerup', release);
    track.addEventListener('pointercancel', release);
    track.addEventListener(
      'click',
      (event) => {
        if (!swallowClick) return;
        swallowClick = false;
        event.preventDefault();
        event.stopPropagation();
      },
      true,
    );
    track.addEventListener('dragstart', (event) => event.preventDefault());
    track.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(track);
    update();
  });
}
