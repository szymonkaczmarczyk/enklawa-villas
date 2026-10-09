import { bindDialog, closeDialog, openDialog } from './dialogs';
import { scrollToTarget, targetFromHash } from './scroll';

export function initMenu() {
  const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
  const trigger = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (!menu || !trigger) return;

  bindDialog(menu, false);
  trigger.setAttribute('aria-expanded', 'false');

  trigger.addEventListener('click', () => {
    openDialog(menu);
    trigger.setAttribute('aria-expanded', 'true');
  });

  menu.addEventListener('close', () => trigger.setAttribute('aria-expanded', 'false'));

  menu.querySelector('[data-menu-close]')?.addEventListener('click', () => closeDialog(menu));
  menu.querySelector('[data-dossier-open]')?.addEventListener('click', () => closeDialog(menu));

  menu.querySelectorAll<HTMLAnchorElement>('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', async (event) => {
      const url = new URL(link.href);
      const target = url.pathname === location.pathname ? targetFromHash(url.hash) : null;
      if (!target) return;
      event.preventDefault();
      await closeDialog(menu);
      scrollToTarget(target);
      history.pushState(null, '', url.hash);
    });
  });
}
