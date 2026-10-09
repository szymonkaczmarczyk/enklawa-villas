import { expect, test } from '@playwright/test';
import { finishIntro, horizontalOverflow, openHomeWithoutIntro } from './helpers';

test('intro gra raz i odsłania hero z wezwaniem do działania', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-intro-mode', 'play');
  await finishIntro(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Przestrzeń, której nie da się powtórzyć.');
  await expect(page.locator('[data-hero]').getByRole('button', { name: 'Umów rozmowę' })).toBeVisible();
  await expect(page.locator('[data-hero-video]')).toHaveJSProperty('loop', false);
});

test('przejście z innej podstrony na stronę główną pomija intro', async ({ page }) => {
  await page.goto('/regulamin/');
  await page.getByRole('link', { name: 'Wróć na stronę główną' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-intro-mode', 'play');
  await expect(page.locator('[data-intro]')).toHaveCount(0);
});

test('scrollytelling rysuje klatki na canvas podczas przewijania', async ({ page }) => {
  const frames: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/frames/')) frames.push(request.url());
  });
  await openHomeWithoutIntro(page);
  await page.locator('[data-scrolly]').scrollIntoViewIfNeeded();
  await expect.poll(() => frames.length, { timeout: 15_000 }).toBeGreaterThan(150);
  const painted = await page.locator('[data-canvas]').evaluate((canvas: HTMLCanvasElement) => canvas.width > 0);
  expect(painted).toBe(true);
});

test('strona główna mieści się w szerokości telefonu @mobile', async ({ page }) => {
  await openHomeWithoutIntro(page);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test('na telefonie ładuje się połowa klatek @mobile', async ({ page }) => {
  const frames = new Set<string>();
  page.on('request', (request) => {
    if (request.url().includes('/frames/')) frames.add(request.url());
  });
  await openHomeWithoutIntro(page);
  await page.locator('[data-scrolly]').scrollIntoViewIfNeeded();
  await expect.poll(() => frames.size, { timeout: 15_000 }).toBe(96);
  expect([...frames].every((url) => url.includes('/frames/portrait/'))).toBe(true);
});

test('ograniczony ruch wyłącza intro i filmy', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/reduced/);
  await expect(page.locator('[data-hero-video]')).not.toHaveAttribute('src', /.+/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await context.close();
});

test('strona nic nie zapisuje w przeglądarce', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.goto('/rezydencje/cypel/');
  const stored = await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie]);
  expect(stored).toEqual([0, 0, '']);
});
