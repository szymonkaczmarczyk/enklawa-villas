import { gsap } from 'gsap';
import { bindDialog, closeDialog, openDialog } from './dialogs';
import { reducedMotion } from './scroll';

type Path = 'buy' | 'sell';
type Step = 'choose' | 'details' | 'done';
type Validated = 'name' | 'contact';

interface DossierCopy {
  email: string;
  choices: Record<Path, string>;
  details: Record<Path, { title: string; note: string; noteHint: string }>;
  copy: string;
  copied: string;
  mail: {
    subject: Record<Path, string>;
    path: string;
    property: string;
    name: string;
    contact: string;
    note: string;
    signature: string;
  };
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
const isPhone = (value: string) => /^\+?[\d\s()-]+$/.test(value) && value.replace(/\D/g, '').length >= 9;

const validators: Record<Validated, (value: string) => boolean> = {
  name: (value) => value.trim().length >= 2,
  contact: (value) => isEmail(value.trim()) || isPhone(value.trim()),
};

const isPath = (value: string | undefined): value is Path => value === 'buy' || value === 'sell';

export function initDossier() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-dossier]');
  if (!dialog) return;
  bindDialog(dialog, true);

  const copy = JSON.parse(dialog.dataset.copy ?? '{}') as DossierCopy;
  const find = <T extends HTMLElement>(selector: string) => dialog.querySelector<T>(selector)!;
  const steps: Record<Step, HTMLElement> = {
    choose: find('[data-step="choose"]'),
    details: find('[data-step="details"]'),
    done: find('[data-step="done"]'),
  };
  const form = find<HTMLFormElement>('[data-form]');
  const fields = {
    name: find<HTMLInputElement>('#dossier-name'),
    contact: find<HTMLInputElement>('#dossier-contact'),
    note: find<HTMLTextAreaElement>('#dossier-note'),
  };
  const contextBox = find('[data-context]');
  const copyLabel = find('[data-copy-label]');
  const copyStatus = find('[data-copy-status]');

  let path: Path = 'buy';
  let context = '';
  let message = '';
  let attempted = false;

  const show = (step: Step) => {
    (Object.keys(steps) as Step[]).forEach((key) => {
      steps[key].hidden = key !== step;
    });
    dialog.dataset.current = step;
    dialog.scrollTop = 0;
    if (!reducedMotion) {
      gsap.fromTo(steps[step], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
    }
    steps[step].querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  };

  const choose = (next: Path) => {
    path = next;
    find('[data-details-title]').textContent = copy.details[next].title;
    find('[data-note-label]').textContent = copy.details[next].note;
    find('[data-note-hint]').textContent = copy.details[next].noteHint;
    show('details');
  };

  const setError = (name: Validated, invalid: boolean) => {
    fields[name].setAttribute('aria-invalid', String(invalid));
    find(`[data-error="${name}"]`).hidden = !invalid;
  };

  const firstInvalid = () => {
    const invalid = (Object.keys(validators) as Validated[]).filter((name) => {
      const failed = !validators[name](fields[name].value);
      setError(name, failed);
      return failed;
    });
    return invalid[0] ?? null;
  };

  const reset = () => {
    form.reset();
    attempted = false;
    setError('name', false);
    setError('contact', false);
  };

  document.addEventListener('click', (event) => {
    const trigger = (event.target as Element).closest<HTMLElement>('[data-dossier-open]');
    if (!trigger) return;
    context = trigger.dataset.dossierContext ?? '';
    find('[data-context-value]').textContent = context;
    contextBox.hidden = !context;
    openDialog(dialog);
    const requested = trigger.dataset.dossierOpen;
    if (isPath(requested)) choose(requested);
    else show('choose');
  });

  dialog.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      if (isPath(button.dataset.choice)) choose(button.dataset.choice);
    });
  });

  dialog.addEventListener('keydown', (event) => {
    if (steps.choose.hidden || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === '1') choose('buy');
    if (event.key === '2') choose('sell');
  });

  find('[data-dossier-back]').addEventListener('click', () => show('choose'));

  dialog.querySelectorAll('[data-dossier-close]').forEach((button) => {
    button.addEventListener('click', () => closeDialog(dialog));
  });

  dialog.addEventListener('close', () => {
    if (dialog.dataset.current === 'done') reset();
  });

  form.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    if (attempted && (target.name === 'name' || target.name === 'contact')) {
      setError(target.name, !validators[target.name](target.value));
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    attempted = true;
    const invalid = firstInvalid();
    if (invalid) {
      fields[invalid].focus();
      return;
    }

    const note = fields.note.value.trim();
    message = [
      `${copy.mail.path}: ${copy.choices[path]}`,
      ...(context ? [`${copy.mail.property}: ${context}`] : []),
      `${copy.mail.name}: ${fields.name.value.trim()}`,
      `${copy.mail.contact}: ${fields.contact.value.trim()}`,
      ...(note ? [`${copy.mail.note}: ${note}`] : []),
      '',
      copy.mail.signature,
    ].join('\n');

    const subject = context ? `${copy.mail.subject[path]} | ${context}` : copy.mail.subject[path];
    window.location.href = `mailto:${copy.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    show('done');
  });

  find('[data-copy-message]').addEventListener('click', () => {
    navigator.clipboard?.writeText(message).then(() => {
      copyLabel.textContent = copy.copied;
      copyStatus.textContent = copy.copied;
      window.setTimeout(() => {
        copyLabel.textContent = copy.copy;
        copyStatus.textContent = '';
      }, 2400);
    });
  });
}
