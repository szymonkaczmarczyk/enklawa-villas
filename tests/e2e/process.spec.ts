import { expect, test } from '@playwright/test';
import { horizontalOverflow, openHomeWithoutIntro } from './helpers';

test('strona „Jak pracujemy” ma cztery etapy, trzy zasady i pytania', async ({ page }) => {
  await page.goto('/jak-pracujemy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jak pracujemy');
  await expect(page.locator('.step')).toHaveCount(4);
  await expect(page.locator('.principle')).toHaveCount(3);
  await expect(page.locator('.faq__item')).toHaveCount(5);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://enklawavillas.com/en/how-we-work/');
});

test('przycisk nad linią zgięcia otwiera okno zapytania', async ({ page }) => {
  await page.goto('/jak-pracujemy/');
  const cta = page.getByRole('main').getByRole('button', { name: 'Umów rozmowę' });
  await expect(cta).toBeInViewport();
  await cta.click();
  await expect(page.locator('dialog[open]')).toBeVisible();
});

test('pytanie rozwija odpowiedź z linkiem do listy rezydencji', async ({ page }) => {
  await page.goto('/jak-pracujemy/');
  const item = page.locator('.faq__item', { hasText: 'Gdzie działacie?' });
  await item.locator('summary').click();
  await expect(item).toHaveAttribute('open', '');
  await item.getByRole('link', { name: 'Zobacz wszystkie rezydencje' }).click();
  await expect(page).toHaveURL('/rezydencje/');
});

test('nawigacja w nagłówku prowadzi do „Jak pracujemy”', async ({ page }) => {
  await openHomeWithoutIntro(page);
  await page.getByRole('navigation', { name: 'Nawigacja główna' }).getByRole('link', { name: 'Jak pracujemy' }).click();
  await expect(page).toHaveURL('/jak-pracujemy/');
});

test('angielska wersja ma własne teksty', async ({ page }) => {
  await page.goto('/en/how-we-work/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('How we work');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('strona „Jak pracujemy” mieści się w szerokości telefonu @mobile', async ({ page }) => {
  await page.goto('/jak-pracujemy/');
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await expect(page.getByRole('main').getByRole('button', { name: 'Umów rozmowę' })).toBeInViewport();
});
