import { expect, test, type Page } from '@playwright/test';

export async function finishIntro(page: Page) {
  await expect(page.locator('[data-intro]')).toHaveCount(0, { timeout: 20_000 });
}

export async function openHomeWithoutIntro(page: Page, path = '/') {
  const base = test.info().project.use.baseURL!;
  await page.goto(path, { referer: new URL('/regulamin/', base).href });
}

export async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}
