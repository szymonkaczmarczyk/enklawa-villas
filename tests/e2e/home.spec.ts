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

test('odświeżenie zasłania stronę planszą intro, kliknięcie w link nie', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  const covered = () => page.evaluate(() => document.documentElement.classList.contains('is-reloading'));
  await page.evaluate(() => navigation.dispatchEvent(new Event('navigate')));
  await page.evaluate(() => window.dispatchEvent(new Event('beforeunload')));
  await page.waitForTimeout(50);
  expect(await covered()).toBe(false);
  await page.waitForTimeout(600);
  await page.evaluate(() => window.dispatchEvent(new Event('beforeunload')));
  await expect.poll(covered).toBe(true);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow')));
  expect(await covered()).toBe(false);
});

test('uszkodzona kotwica w adresie nie psuje skryptów strony', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const hash of ['#%', '#%E0%A4%A', '#%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E']) {
    await page.goto('about:blank');
    await page.goto(`/${hash}`);
    await page.locator('[data-dossier-open]').first().click();
    await expect(page.locator('dialog[open]')).toBeVisible();
  }
  expect(errors).toEqual([]);
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

test('scrollytelling pokazuje dwie sceny po przeciwnych stronach, druga znika przed 80% toru', async ({ page }) => {
  await openHomeWithoutIntro(page);
  const beats = page.locator('[data-beat]');
  await expect(beats).toHaveCount(2);
  await expect(beats.nth(0)).toHaveAttribute('data-side', 'end');
  await expect(beats.nth(1)).toHaveAttribute('data-side', 'start');
  const track = await page.locator('[data-track]').evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { top: box.top + window.scrollY, height: box.height };
  });
  const viewport = page.viewportSize()!.height;
  const opacities = async (fraction: number) => {
    await page.evaluate((y) => window.scrollTo(0, y), track.top - viewport + track.height * fraction);
    await page.waitForTimeout(1500);
    return beats.evaluateAll((elements) => elements.map((element) => Math.round(Number(getComputedStyle(element).opacity))));
  };
  expect(await opacities(0.2)).toEqual([1, 0]);
  expect(await opacities(0.56)).toEqual([0, 1]);
  expect(await opacities(0.82)).toEqual([0, 0]);
});
