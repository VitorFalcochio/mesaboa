const { test, expect } = require('@playwright/test');

async function createLocalAccount(page) {
  await page.goto('/');
  await page.getByText('Pular', { exact: true }).click();
  await page.getByRole('tab', { name: 'Criar conta' }).click();
  await page.getByRole('radio', { name: 'Conta de Dono de restaurante' }).click();
  await page.getByLabel('Nome').fill('Restaurante Teste');
  await page.getByLabel('E-mail').fill(`restaurante-${Date.now()}@dine.test`);
  await page.locator('input[aria-label="Senha"]').fill('senha-segura-123');
  await page.getByRole('button', { name: 'Criar minha conta', exact: true }).click();
  await expect(page.getByText('Etapa 1 de 4')).toBeVisible();
}

test('validates and advances through restaurant registration steps', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await createLocalAccount(page);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Informe o nome do estabelecimento.')).toBeVisible();

  await page.getByLabel('Nome do estabelecimento').fill('Cantina do Bairro');
  await page.getByText('Italiana', { exact: true }).click();
  await page.getByLabel('Bairro').fill('Centro');
  await page.getByLabel('Descrição').fill('Massas artesanais e receitas de família.');
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page.getByText('Etapa 2 de 4')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Informe o endereço completo.')).toBeVisible();
  await expect(page.getByText('Informe WhatsApp ou telefone.')).toBeVisible();
  await expect(page.getByText('Rascunho salvo automaticamente')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Painel do parceiro', { exact: true })).toBeVisible();
  await expect(page.getByText('Configure seu primeiro restaurante', { exact: true })).toBeVisible();

  expect(pageErrors).toEqual([]);
});
