const { test, expect } = require('@playwright/test');

async function createUserAccount(page) {
  await page.goto('/');
  await page.getByText('Pular', { exact: true }).click();
  await page.getByRole('tab', { name: 'Criar conta' }).click();
  await page.getByRole('radio', { name: 'Conta de Usuário' }).click();
  await page.getByLabel('Nome').fill('Cliente Favorito');
  await page.getByLabel('E-mail').fill(`favorito-${Date.now()}@dine.test`);
  await page.locator('input[aria-label="Senha"]').fill('senha-segura-123');
  await page.getByRole('button', { name: 'Criar minha conta', exact: true }).click();
  await expect(page.getByText('Explorar', { exact: true }).last()).toBeVisible();
}

test('celebrates a newly favorited restaurant without blocking navigation', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('dialog', (dialog) => dialog.accept());

  await createUserAccount(page);
  const favoriteButton = page.getByRole('button', { name: /^Salvar .* nos favoritos$/ }).first();
  await favoriteButton.click();

  await expect(page.getByRole('alert')).toContainText('Boa escolha!');
  await expect(page.getByRole('alert')).toContainText('+10 pontos');
  await expect(page.getByLabel('Mascote Dine comemorando o favorito')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Remover .* dos favoritos$/ }).first()).toBeVisible();
  expect(pageErrors).toEqual([]);
});
