import { en } from './en';
import { pl } from './pl';

export const bindShortWords = <T>(value: T): T => {
  if (typeof value === 'string') return value.replace(/(?<=^|[\s(„])([aiouwzAIOUWZ])\s+/g, '$1 ') as T;
  if (Array.isArray(value)) return value.map(bindShortWords) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, bindShortWords(item)])) as T;
  }
  return value;
};

export const dictionaries = { pl: bindShortWords(pl), en };

export type Lang = keyof typeof dictionaries;

export const languages: Record<Lang, { short: string; name: string }> = {
  pl: { short: 'PL', name: 'Polski' },
  en: { short: 'EN', name: 'English' },
};

export const routes = {
  home: { pl: '/', en: '/en/' },
  residences: { pl: '/rezydencje/', en: '/en/residences/' },
  process: { pl: '/jak-pracujemy/', en: '/en/how-we-work/' },
  privacy: { pl: '/polityka-prywatnosci/', en: '/en/privacy-policy/' },
  terms: { pl: '/regulamin/', en: '/en/terms/' },
} as const;

export type RouteKey = keyof typeof routes;

export const formatPrice = (value: number, lang: Lang) => {
  const amount = new Intl.NumberFormat(dictionaries[lang].numberLocale).format(value);
  return lang === 'pl' ? `${amount}\u00a0PLN` : `PLN\u00a0${amount}`;
};

export const countLabel = (count: number, lang: Lang) => {
  const forms = dictionaries[lang].residences.count;
  return `${count} ${forms[new Intl.PluralRules(dictionaries[lang].numberLocale).select(count)] ?? forms.other}`;
};

export type LocalizedPaths = Record<Lang, string>;

export const residencePaths = (id: string): LocalizedPaths => ({
  pl: `/rezydencje/${id}/`,
  en: `/en/residences/${id}/`,
});
