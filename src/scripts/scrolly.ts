import { gsap } from 'gsap';
import { reducedMotion } from './scroll';

const narrative = { beatIn: 0.12, beatOut: 0.52, fade: 0.1 };
const portraitQuery = '(max-aspect-ratio: 4/5)';
const decodeSpan = { ahead: 40, behind: 12 };
const lightQuery = '(max-width: 767px), (max-height: 480px)';
const lightStride = 2;

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

function prefersLightSequence() {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return matchMedia(lightQuery).matches || Boolean(connection?.saveData) || /2g|3g/.test(connection?.effectiveType ?? '');
}

type Sequence = ReturnType<typeof createSequence>;

function createSequence(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-canvas]')!;
  const context = canvas.getContext('2d')!;
  const total = Number(root.dataset.frameCount);
  const count = prefersLightSequence() ? Math.ceil(total / lightStride) : total;
  const fileNumber = (index: number) => Math.round((index * (total - 1)) / (count - 1)) + 1;
  const folder = `${root.dataset.framePath}/${matchMedia(portraitQuery).matches ? 'portrait' : 'landscape'}`;
  const blobs: Blob[] = [];
  const bitmaps = new Map<number, ImageBitmap>();
  const decoding = new Set<number>();
  let position = 0;
  let direction = 1;
  let drawn = -1;
  let frameWidth = 0;
  let frameHeight = 0;

  const windowRange = () => {
    const base = Math.floor(position);
    const before = direction > 0 ? decodeSpan.behind : decodeSpan.ahead;
    const after = direction > 0 ? decodeSpan.ahead : decodeSpan.behind;
    return [Math.max(0, base - before), Math.min(count - 1, base + after)];
  };

  const nearest = (index: number) => {
    for (let distance = 0; distance < count; distance += 1) {
      if (bitmaps.has(index - distance)) return index - distance;
      if (bitmaps.has(index + distance)) return index + distance;
    }
    return -1;
  };

  const paint = (bitmap: ImageBitmap, alpha: number) => {
    const scale = Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height);
    const width = bitmap.width * scale;
    const height = bitmap.height * scale;
    context.globalAlpha = alpha;
    context.drawImage(bitmap, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  };

  const render = () => {
    const base = Math.floor(position);
    const index = nearest(base);
    if (index < 0) return;
    paint(bitmaps.get(index)!, 1);
    const next = bitmaps.get(base + 1);
    const blend = position - base;
    if (index === base && next && blend > 0.01) paint(next, blend);
    context.globalAlpha = 1;
    drawn = index;
  };

  const resize = () => {
    if (!frameWidth) return;
    const cover = Math.max(canvas.clientWidth / frameWidth, canvas.clientHeight / frameHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 1 / cover);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    context.imageSmoothingQuality = 'high';
    render();
  };

  const decode = (index: number) => {
    const blob = blobs[index];
    if (!blob || bitmaps.has(index) || decoding.has(index)) return null;
    decoding.add(index);
    return createImageBitmap(blob).then(
      (bitmap) => {
        decoding.delete(index);
        const [from, to] = windowRange();
        if (index < from || index > to) {
          bitmap.close();
          return;
        }
        bitmaps.set(index, bitmap);
        if (!frameWidth) {
          frameWidth = bitmap.width;
          frameHeight = bitmap.height;
          resize();
          return;
        }
        const base = Math.floor(position);
        if (drawn !== base || index === base + 1) render();
      },
      () => {
        decoding.delete(index);
      },
    );
  };

  const schedule = () => {
    const [from, to] = windowRange();
    bitmaps.forEach((bitmap, index) => {
      if (index >= from - 2 && index <= to + 2) return;
      bitmap.close();
      bitmaps.delete(index);
    });
    const jobs: Promise<void>[] = [];
    for (let index = from; index <= to; index += 1) {
      const job = decode(index);
      if (job) jobs.push(job);
    }
    return jobs;
  };

  new ResizeObserver(resize).observe(canvas);

  for (let index = 0; index < count; index += 1) {
    fetch(`${folder}/${String(fileNumber(index)).padStart(4, '0')}.webp`)
      .then((response) => response.blob())
      .then(
        (blob) => {
          blobs[index] = blob;
          schedule();
        },
        () => undefined,
      );
  }

  return {
    count,
    seek(next: number) {
      if (next === position) return;
      direction = next > position ? 1 : -1;
      position = next;
      schedule();
      render();
    },
  };
}

function bindNarrative(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-track]')!;
  const beat = root.querySelector<HTMLElement>('[data-beat]')!;
  const shift = reducedMotion ? 0 : 56;

  gsap
    .timeline({
      defaults: { ease: 'none', duration: narrative.fade },
      scrollTrigger: { trigger: track, start: 'top bottom', end: 'bottom bottom', scrub: reducedMotion ? true : 0.5 },
    })
    .fromTo(beat, { opacity: 0, y: shift }, { opacity: 1, y: 0 }, narrative.beatIn)
    .to(beat, { opacity: 0, y: -shift }, narrative.beatOut)
    .set({}, {}, 1);
}

function bindFrames(root: HTMLElement, sequence: Sequence) {
  const playhead = { frame: 0 };
  gsap.to(playhead, {
    frame: sequence.count - 1,
    ease: 'none',
    scrollTrigger: {
      trigger: root.querySelector<HTMLElement>('[data-track]'),
      start: 'top bottom',
      endTrigger: root.querySelector<HTMLElement>('[data-standard]'),
      end: 'top 35%',
      scrub: 0.5,
    },
    onUpdate: () => sequence.seek(playhead.frame),
  });
}

export function initScrolly(root: HTMLElement) {
  bindNarrative(root);
  if (reducedMotion) return;
  bindFrames(root, createSequence(root));
}
