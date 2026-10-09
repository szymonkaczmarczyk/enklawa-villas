import { gsap } from 'gsap';
import { lockScroll, reducedMotion, unlockScroll } from './scroll';

const closing = new WeakSet<HTMLDialogElement>();

const enterOffset = (dialog: HTMLDialogElement) => (reducedMotion ? 0 : Number(dialog.dataset.enter ?? 0));

export function openDialog(dialog: HTMLDialogElement) {
  if (dialog.open) return;
  dialog.showModal();
  lockScroll();
  gsap.fromTo(
    dialog,
    { opacity: 0, x: enterOffset(dialog) },
    { opacity: 1, x: 0, duration: reducedMotion ? 0.2 : 0.7, ease: 'expo.out' },
  );
}

export function closeDialog(dialog: HTMLDialogElement) {
  if (!dialog.open || closing.has(dialog)) return Promise.resolve();
  closing.add(dialog);
  return new Promise<void>((resolve) => {
    gsap.to(dialog, {
      opacity: 0,
      x: enterOffset(dialog) / 2,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: () => {
        dialog.close();
        closing.delete(dialog);
        unlockScroll();
        resolve();
      },
    });
  });
}

export function bindDialog(dialog: HTMLDialogElement, closeOnBackdrop: boolean) {
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDialog(dialog);
  });
  if (!closeOnBackdrop) return;
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });
}
