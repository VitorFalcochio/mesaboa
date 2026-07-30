const { test, expect } = require('@playwright/test');

async function createLocalAccount(page) {
  await page.goto('/');
  await page.getByText('Pular', { exact: true }).click();
  await page.getByRole('tab', { name: 'Criar conta' }).click();
  await page.getByLabel('Nome').fill('Teste Revisao');
  await page.getByLabel('E-mail').fill(`revisao-${Date.now()}@dine.test`);
  await page.locator('input[aria-label="Senha"]').fill('senha-segura-123');
  await page.getByRole('button', { name: 'Criar minha conta', exact: true }).click();
  await expect(page.getByText('Explorar', { exact: true }).last()).toBeVisible();
}

test('opens a social post before navigating to its restaurant', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await createLocalAccount(page);
  await page.getByRole('tab', { name: 'Ir para Feed' }).click();

  await page.getByRole('button', { name: /Abrir publicacao de/ }).first().click();
  await expect(page.getByText('Publicacao', { exact: true })).toBeVisible();
  await expect(page.getByText('Publicado em', { exact: true })).toBeVisible();
  await expect(page.getByText('Comentarios', { exact: true })).toBeVisible();

  await page.getByLabel('Adicionar comentario').fill('Quero conhecer este lugar.');
  await page.getByRole('button', { name: 'Publicar comentario' }).click();
  await expect(page.getByText('Quero conhecer este lugar.', { exact: true }).last()).toBeVisible();

  await page.getByRole('button', { name: /Abrir perfil de/ }).click();
  await expect(page.getByText('Publicacoes', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Abrir publicacao de/ }).first().click();
  await expect(page.getByText('Publicacao', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Fechar publicacao' }).click();
  await expect(page.getByText('Publicacoes', { exact: true })).toBeVisible();

  expect(pageErrors).toEqual([]);
});
