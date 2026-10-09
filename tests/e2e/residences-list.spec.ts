import { expect, test, type Page } from '@playwright/test';
import { horizontalOverflow, openHomeWithoutIntro } from './helpers';

const cards = (page: Page) => page.locator('[data-filter-item]:visible');
const choose = (page: Page, label: string) => page.locator('.filter', { hasText: label }).click();

test('lista pokazuje wszystkie rezydencje z linkami do podstron', async ({ page }) => {
  await page.goto('/rezydencje/');
  await expect(cards(page)).toHaveCount(8);
  await expect(page.getByRole('status')).toHaveText('8 rezydencji');
  await expect(page.getByRole('heading', { level: 2, name: 'Rezydencja na cyplu' })).toBeVisible();
  await expect(page.locator('a[href="/rezydencje/skaly/"]')).toHaveCount(1);
});

test('filtr kraju zawęża listę, trafia do adresu i wyłącza puste opcje', async ({ page }) => {
  await page.goto('/rezydencje/');
  await choose(page, 'Polska');
  await expect(cards(page)).toHaveCount(3);
  await expect(page.getByRole('status')).toHaveText('3 rezydencje');
  await expect(page).toHaveURL('/rezydencje/?country=poland');
  await expect(page.getByRole('radio', { name: /Wśród lasów i wzgórz/ })).toBeDisabled();
  await choose(page, 'Nad morzem');
  await expect(cards(page)).toHaveCount(1);
  await expect(page.getByRole('status')).toHaveText('1 rezydencja');
  await expect(page).toHaveURL('/rezydencje/?country=poland&setting=sea');
});

test('adres z filtrem otwiera zawężoną listę, a niemożliwe połączenie pokazuje wszystko', async ({ page }) => {
  await page.goto('/rezydencje/?setting=mountains');
  await expect(cards(page)).toHaveCount(3);
  await expect(page.getByRole('radio', { name: /W górach/ })).toBeChecked();
  await page.goto('/rezydencje/?country=poland&setting=countryside');
  await expect(cards(page)).toHaveCount(8);
  await expect(page).toHaveURL('/rezydencje/');
});

test('powrót z podstrony zachowuje wybrane filtry', async ({ page }) => {
  await page.goto('/rezydencje/');
  await choose(page, 'Hiszpania');
  await cards(page).first().locator('.card__overlay').click();
  await expect(page).toHaveURL(/\/rezydencje\/(cypel|skaly)\/$/);
  await page.goBack();
  await expect(page.getByRole('radio', { name: /Hiszpania/ })).toBeChecked();
  await expect(cards(page)).toHaveCount(2);
});

test('angielska lista ma własne teksty i odmianę', async ({ page }) => {
  await page.goto('/en/residences/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Residences');
  await choose(page, 'Italy');
  await expect(page.getByRole('status')).toHaveText('1 residence');
});

test('strona główna prowadzi do listy rezydencji', async ({ page }) => {
  await openHomeWithoutIntro(page);
  await page.getByRole('link', { name: 'Zobacz wszystkie rezydencje' }).click();
  await expect(page).toHaveURL('/rezydencje/');
});

test('lista mieści się w szerokości telefonu, a filtry mają duże pola dotyku @mobile', async ({ page }) => {
  await page.goto('/rezydencje/');
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  const heights = await page.locator('.filter').evaluateAll((labels) => labels.map((label) => label.getBoundingClientRect().height));
  expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
});
