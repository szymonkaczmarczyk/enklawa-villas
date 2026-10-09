import { expect, test } from '@playwright/test';
import { openHomeWithoutIntro } from './helpers';

test.beforeEach(async ({ page }) => {
  await openHomeWithoutIntro(page);
});

test('przycisk na karcie otwiera okno z kontekstem obiektu', async ({ page }) => {
  const card = page.locator('.portfolio__grid [data-card]').first();
  await card.scrollIntoViewIfNeeded();
  await card.getByRole('button', { name: /Zapytaj o obiekt/ }).click();
  const dialog = page.locator('[data-dossier]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-context-value]')).toHaveText('Rezydencja na cyplu, Minorka, Hiszpania');
  await expect(page).toHaveURL('/');
});

test('kliknięcie w zdjęcie karty prowadzi na podstronę rezydencji', async ({ page }) => {
  const card = page.locator('.portfolio__grid [data-card]').first();
  await card.scrollIntoViewIfNeeded();
  const media = (await card.locator('[data-card-media]').boundingBox())!;
  await page.mouse.click(media.x + media.width / 2, media.y + media.height / 2);
  await expect(page).toHaveURL('/rezydencje/cypel/');
});

test('slider przewija się strzałkami i przeciąganiem bez otwierania podstrony', async ({ page }) => {
  const track = page.locator('[data-slider-track]');
  await track.scrollIntoViewIfNeeded();
  const previous = page.locator('[data-slider-previous]');
  const next = page.locator('[data-slider-next]');
  await expect(previous).toBeDisabled();
  await next.click();
  await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await expect(previous).toBeEnabled();

  await previous.click();
  await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBe(0);

  const box = (await track.boundingBox())!;
  const y = box.y + box.height / 3;
  await page.mouse.move(box.x + box.width * 0.6, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.45, y, { steps: 8 });
  await page.mouse.move(box.x + box.width * 0.3, y, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await expect(page).toHaveURL('/');
});
