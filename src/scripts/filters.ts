import { ScrollTrigger } from 'gsap/ScrollTrigger';

const groups = ['country', 'setting'] as const;

type Group = (typeof groups)[number];
type Selection = Record<Group, string>;
type Item = { element: HTMLElement } & Selection;

export function initFilters() {
  const form = document.querySelector<HTMLFormElement>('[data-filters]');
  const status = document.querySelector<HTMLElement>('[data-filter-status]');
  if (!form || !status) return;

  const items: Item[] = [...document.querySelectorAll<HTMLElement>('[data-filter-item]')].map((element) => ({
    element,
    country: element.dataset.country!,
    setting: element.dataset.setting!,
  }));
  const inputs = [...form.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
  const forms: Record<string, string> = JSON.parse(status.dataset.forms!);
  const plural = new Intl.PluralRules(document.documentElement.lang);

  const matches = (item: Item, selection: Selection) =>
    groups.every((group) => selection[group] === 'all' || item[group] === selection[group]);
  const countFor = (selection: Selection) => items.filter((item) => matches(item, selection)).length;
  const selected = () =>
    Object.fromEntries(groups.map((group) => [group, (form.elements.namedItem(group) as RadioNodeList).value])) as Selection;

  const apply = () => {
    const selection = selected();
    items.forEach((item) => (item.element.hidden = !matches(item, selection)));
    inputs.forEach((input) => {
      const count = countFor({ ...selection, [input.name]: input.value });
      input.disabled = count === 0;
      input.closest('label')!.querySelector('[data-filter-count]')!.textContent = String(count);
    });
    const visible = countFor(selection);
    status.textContent = `${visible} ${forms[plural.select(visible)] ?? forms.other}`;

    const url = new URL(location.href);
    groups.forEach((group) =>
      selection[group] === 'all' ? url.searchParams.delete(group) : url.searchParams.set(group, selection[group]),
    );
    history.replaceState(history.state, '', url);
    ScrollTrigger.refresh();
  };

  const params = new URLSearchParams(location.search);
  inputs.forEach((input) => {
    if (params.get(input.name) === input.value) input.checked = true;
  });
  if (countFor(selected()) === 0) inputs.forEach((input) => (input.checked = input.value === 'all'));

  form.addEventListener('change', apply);
  apply();
}
