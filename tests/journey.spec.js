const { test, expect } = require('@playwright/test');

async function createUserAccount(page) {
  await page.goto('/');
  await page.getByText('Pular', { exact: true }).click();
  await page.getByRole('tab', { name: 'Criar conta' }).click();
  await page.getByRole('radio', { name: 'Conta de Usuário' }).click();
  await page.getByLabel('Nome').fill('Explorador Jornada');
  await page.getByLabel('E-mail').fill(`jornada-${Date.now()}@dine.test`);
  await page.locator('input[aria-label="Senha"]').fill('senha-segura-123');
  await page.getByRole('button', { name: 'Criar minha conta', exact: true }).click();
  await expect(page.getByText('Explorar', { exact: true }).last()).toBeVisible();
}

test('records real actions and shows the complete Dine Journey', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await createUserAccount(page);

  await page.getByRole('button', { name: /^Salvar .* nos favoritos$/ }).first().click();
  await expect(page.getByRole('alert')).toContainText('De Olho');
  await page.getByRole('button', { name: /^Salvar .* nos favoritos$/ }).first().click();
  await page.getByRole('button', { name: /^Salvar .* nos favoritos$/ }).first().click();
  await expect(page.getByRole('alert')).toContainText('Missão concluída!');

  await page.reload();
  await expect(page.getByRole('tab', { name: 'Ir para Perfil' })).toBeVisible();
  await page.getByRole('tab', { name: 'Ir para Perfil' }).click();
  await page.getByRole('button', { name: 'Abrir Jornada no Dine' }).click();

  await expect(page.getByText('Jornada no Dine', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Mascote Dine levantando o troféu da Jornada')).toBeVisible();
  await expect(page.getByText('Missões da semana', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Monte seu roteiro, 3 de 3')).toBeVisible();
  await expect(page.getByText('Missão concluída: Monte seu roteiro', { exact: true })).toBeVisible();
  await expect(page.getByText('Conquista: De Olho', { exact: true })).toBeVisible();
  await expect(page.getByText('Restaurante salvo', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('+25', { exact: true })).toBeVisible();
  await expect(page.getByText('+5', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Benefícios da jornada', { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
