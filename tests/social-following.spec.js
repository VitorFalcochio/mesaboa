const { test, expect } = require('@playwright/test');

async function createLocalAccount(page) {
  await page.goto('/');
  await page.getByText('Pular', { exact: true }).click();
  await page.getByRole('tab', { name: 'Criar conta' }).click();
  await page.getByRole('radio', { name: 'Conta de Usuário' }).click();
  await page.getByLabel('Nome').fill('Explorador Social');
  await page.getByLabel('E-mail').fill(`social-${Date.now()}@dine.test`);
  await page.locator('input[aria-label="Senha"]').fill('senha-segura-123');
  await page.getByRole('button', { name: 'Criar minha conta', exact: true }).click();
  await expect(page.getByText('Explorar', { exact: true }).last()).toBeVisible();
}

test('follows an author and shows their posts in Following', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await createLocalAccount(page);
  await page.getByRole('tab', { name: 'Ir para Feed' }).click();

  await page.getByRole('button', { name: /Abrir publicacao de/ }).first().click();
  await page.getByRole('button', { name: /Abrir perfil de/ }).click();

  const followButton = page.getByRole('button', { name: /^Seguir / });
  const followedAuthor = (await followButton.getAttribute('aria-label')).replace(/^Seguir /, '');
  await followButton.click();
  await expect(page.getByRole('button', { name: `Deixar de seguir ${followedAuthor}` })).toBeVisible();

  await page.getByRole('button', { name: 'Voltar ao feed' }).click();
  await page.getByText('Seguindo', { exact: true }).click();
  await expect(page.getByRole('button', { name: new RegExp(`Abrir publicacao de ${followedAuthor}`) }).first()).toBeVisible();

  expect(pageErrors).toEqual([]);
});

test('shows an honest empty activity state for a new account', async ({ page }) => {
  await createLocalAccount(page);
  await page.getByRole('button', { name: /Abrir notifica/ }).click();
  await expect(page.getByText('Curtidas, comentários e novos seguidores aparecerão aqui.')).toBeVisible();
  await page.getByRole('tab', { name: 'Lugares' }).click();
  await expect(page.getByText('Nenhuma atividade em lugares ainda.')).toBeVisible();
});
