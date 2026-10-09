import { expect, test } from '@playwright/test';

const pages = ['/', '/en/', '/rezydencje/', '/en/residences/', '/jak-pracujemy/', '/en/how-we-work/', '/regulamin/', '/en/terms/', '/polityka-prywatnosci/', '/en/privacy-policy/', '/rezydencje/cypel/', '/en/residences/cypel/'];

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
  expect(body.match(/<loc>/g)).toHaveLength(26);
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

test('każdy link i nagłówek ma dostępną nazwę', async ({ page }) => {
  for (const path of pages) {
    await page.goto(path);
    await page.evaluate(() => document.querySelectorAll('details').forEach((details) => (details.open = true)));
    await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished)));
    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll('a, h1, h2, h3, h4, h5, h6')]
        .filter((element) => {
          if ((element as HTMLElement).innerText?.trim()) return false;
          if (element.getAttribute('aria-label')?.trim()) return false;
          const ids = element.getAttribute('aria-labelledby')?.trim().split(' ') ?? [];
          if (ids.some((id) => document.getElementById(id)?.innerText.trim())) return false;
          return ![...element.querySelectorAll('img')].some((image) => image.getAttribute('alt')?.trim());
        })
        .map((element) => element.outerHTML.slice(0, 80)),
    );
    expect(unnamed, path).toEqual([]);
  }
});

test('każda strona ma favicon, ikonę iPhone i manifest, a pliki istnieją', async ({ page, request }) => {
  for (const path of [...pages, '/nie-ma-takiej-strony/']) {
    await page.goto(path);
    await expect(page.locator('link[rel="icon"][href="/favicon.ico"]'), path).toHaveCount(1);
    await expect(page.locator('link[rel="icon"][href="/favicon.svg"]'), path).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]'), path).toHaveAttribute('href', '/apple-touch-icon.png');
    await expect(page.locator('link[rel="manifest"]'), path).toHaveAttribute('href', '/site.webmanifest');
  }
  for (const file of ['/favicon.ico', '/favicon.svg', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png', '/site.webmanifest']) {
    expect((await request.get(file)).status(), file).toBe(200);
  }
});

test('dane strukturalne są poprawne i bez pól do uzupełnienia', async ({ page }) => {
  for (const path of pages) {
    await page.goto(path);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(scripts, path).toHaveLength(1);
    expect(scripts[0], path).not.toMatch(/\[\[|000 00 00/);
    const graph: Record<string, unknown>[] = JSON.parse(scripts[0])['@graph'];
    const types = graph.map((node) => node['@type']);
    expect(types, path).toContain('RealEstateAgent');
    if (path === '/' || path === '/en/') expect(types, path).toContain('WebSite');
    if (path.includes('/cypel/')) {
      expect(types, path).toEqual(expect.arrayContaining(['RealEstateListing', 'SingleFamilyResidence', 'BreadcrumbList']));
      const breadcrumb = graph.find((node) => node['@type'] === 'BreadcrumbList')!;
      expect(breadcrumb.itemListElement, path).toHaveLength(3);
      const residence = graph.find((node) => node['@type'] === 'SingleFamilyResidence')!;
      expect(residence.floorSize, path).toEqual({ '@type': 'QuantitativeValue', value: 1150, unitCode: 'MTK' });
      expect(residence.address, path).toMatchObject({ addressCountry: path.startsWith('/en/') ? 'Spain' : 'Hiszpania' });
    }
  }
});
