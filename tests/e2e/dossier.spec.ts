import { expect, test } from '@playwright/test';
import { openHomeWithoutIntro } from './helpers';

test('formularz zapytania prowadzi przez wybór, walidację i potwierdzenie', async ({ page }) => {
  await openHomeWithoutIntro(page);
  await page.locator('header').getByRole('button', { name: 'Umów rozmowę' }).click();
  const dialog = page.locator('[data-dossier]');
  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: /Powierzam rezydencję/ }).click();
  await expect(dialog.getByRole('heading', { name: 'Powierzasz rezydencję' })).toBeVisible();

  await dialog.getByRole('button', { name: 'Wyślij zapytanie' }).click();
  await expect(dialog.getByText('Podaj imię i nazwisko.')).toBeVisible();
  await expect(dialog.getByLabel('Imię i nazwisko')).toBeFocused();

  await dialog.getByLabel('Imię i nazwisko').fill('Jan Testowy');
  await dialog.getByLabel('Telefon lub e-mail').fill('12');
  await dialog.getByRole('button', { name: 'Wyślij zapytanie' }).click();
  await expect(dialog.getByText(/co najmniej 9 cyfr/)).toBeVisible();

  await dialog.getByLabel('Telefon lub e-mail').fill('jan@example.com');
  await dialog.getByRole('button', { name: 'Wyślij zapytanie' }).click();
  await expect(dialog.getByRole('heading', { name: 'Wiadomość jest gotowa' })).toBeVisible();

  await dialog.getByRole('button', { name: 'Wróć do strony' }).click();
  await expect(dialog).toBeHidden();
});

test('okno zamyka się klawiszem Escape', async ({ page }) => {
  await openHomeWithoutIntro(page);
  await page.locator('header').getByRole('button', { name: 'Umów rozmowę' }).click();
  await expect(page.locator('[data-dossier]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-dossier]')).toBeHidden();
});
