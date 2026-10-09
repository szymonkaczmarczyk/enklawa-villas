import { expect, test } from '@playwright/test';
import { horizontalOverflow } from './helpers';

const ids = ['cypel', 'toskania', 'tatry', 'pinie', 'klif', 'baltyk', 'pawilon', 'skaly'];

for (const id of ids) {
  test(`podstrona ${id} ma treść, galerię i przełącznik języka`, async ({ page }) => {
    const response = await page.goto(`/rezydencje/${id}/`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.residence__gallery img')).toHaveCount(3);
    for (const image of await page.locator('main img').all()) {
      expect(await image.getAttribute('alt')).not.toBeNull();
    }
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://enklawavillas.com/rezydencje/${id}/`);
    await expect(page.locator('.header__lang a[hreflang="en"]')).toHaveAttribute('href', `/en/residences/${id}/`);
  });
}

test('film na podstronie gra i nie zapętla się', async ({ page }) => {
  await page.goto('/rezydencje/tatry/');
  const film = page.locator('[data-residence-film]');
  await expect(film).toHaveClass(/is-playing/, { timeout: 15_000 });
  await expect(film).toHaveJSProperty('loop', false);
});

test('link „Wszystkie rezydencje” wraca do portfolio bez intro', async ({ page }) => {
  await page.goto('/rezydencje/klif/');
  await page.getByRole('link', { name: 'Wszystkie rezydencje' }).click();
  await expect(page).toHaveURL('/#rezydencje');
  await expect(page.locator('[data-intro]')).toHaveCount(0);
  await expect.poll(() => page.locator('#rezydencje').evaluate((section) => Math.abs(section.getBoundingClientRect().top)), { timeout: 10_000 }).toBeLessThan(120);
});

test('nawigacja „Następna rezydencja” przechodzi po kolei i zawija na koniec', async ({ page }) => {
  await page.goto('/rezydencje/skaly/');
  await page.getByRole('navigation', { name: 'Następna rezydencja' }).getByRole('link').click();
  await expect(page).toHaveURL('/rezydencje/cypel/');
});

test('angielska podstrona ma własne teksty', async ({ page }) => {
  await page.goto('/en/residences/baltyk/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Baltic coast residence');
  await expect(page.getByText('PLN 18,500,000').first()).toBeVisible();
});

test('podstrona rezydencji mieści się w szerokości telefonu @mobile', async ({ page }) => {
  await page.goto('/rezydencje/pinie/');
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await expect(page.getByRole('button', { name: 'Zapytaj o obiekt' }).first()).toBeInViewport();
});
