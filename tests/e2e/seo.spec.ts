import { expect, test } from '@playwright/test';

const pages = ['/', '/en/', '/regulamin/', '/en/terms/', '/polityka-prywatnosci/', '/en/privacy-policy/', '/rezydencje/cypel/', '/en/residences/cypel/'];

test('każda strona ma unikalny tytuł i opis', async ({ page }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const path of pages) {
    await page.goto(path);
    titles.add(await page.title());
    descriptions.add((await page.locator('meta[name="description"]').getAttribute('content')) ?? '');
  }
  expect(titles.size).toBe(pages.length);
  expect(descriptions.size).toBe(pages.length);
});

test('mapa strony zawiera wszystkie podstrony', async ({ request }) => {
  const body = await (await request.get('/sitemap.xml')).text();
  expect(body.match(/<loc>/g)).toHaveLength(22);
  expect(body).toContain('https://enklawavillas.com/en/residences/skaly/');
});

test('robots.txt wskazuje mapę strony', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toContain('Sitemap: https://enklawavillas.com/sitemap.xml');
});

test('nieistniejący adres pokazuje własną stronę 404', async ({ page }) => {
  await page.goto('/nie-ma-takiej-strony/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tego adresu nie ma w naszym portfolio.');
});

test('słowo „dossier” nie pojawia się w treści strony', async ({ page }) => {
  for (const path of pages) {
    await page.goto(path);
    expect(await page.locator('body').innerText()).not.toMatch(/dossier/i);
  }
});
