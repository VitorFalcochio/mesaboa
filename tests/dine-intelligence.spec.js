const { test, expect } = require('@playwright/test');

async function createUserAccount(page) {
  await page.goto('/');
  await page.getByText('Pular', { exact: true }).click();
  await page.getByRole('tab', { name: 'Criar conta' }).click();
  await page.getByRole('radio', { name: 'Conta de Usuário' }).click();
  await page.getByLabel('Nome').fill('Grupo Dine Match');
  await page.getByLabel('E-mail').fill(`match-${Date.now()}@dine.test`);
  await page.locator('input[aria-label="Senha"]').fill('senha-segura-123');
  await page.getByRole('button', { name: 'Criar minha conta', exact: true }).click();
  await expect(page.getByText('Explorar', { exact: true }).last()).toBeVisible();
}

test('understands natural-language discovery on Explore and Map', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await createUserAccount(page);

  const exploreSearch = page.getByPlaceholder('Descreva o lugar que você procura...');
  await exploreSearch.fill('lugar romântico para jantar');
  await expect(page.getByText('Dine entendeu', { exact: true })).toBeVisible();
  await expect(page.getByText('Clima romântico', { exact: true })).toBeVisible();

  await page.getByRole('tab', { name: 'Ir para Mapa' }).click();
  await expect(page.getByPlaceholder('Descreva o lugar que você procura...')).toHaveValue('lugar romântico para jantar');
  await expect(page.getByText('Dine entendeu', { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('creates a group Dine Match and ranks compatible restaurants', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await createUserAccount(page);

  await page.getByRole('button', { name: 'Abrir Dine Match' }).click();
  await expect(page.getByText('Menos indecisão.')).toBeVisible();
  await page.getByText('Date romântico', { exact: true }).click();
  await page.getByText('Italiana', { exact: true }).click();
  await page.getByRole('button', { name: 'Encontrar o Dine Match' }).click();

  await expect(page.getByText('Deu Match!', { exact: true })).toBeVisible();
  await expect(page.getByText('Melhor Match', { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
