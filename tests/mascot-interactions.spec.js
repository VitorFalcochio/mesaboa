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

test('shows the mascot campaign carousel in Explore', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await createUserAccount(page);
  await expect(page.getByRole('button', { name: 'Abrir destaque Hoje combina com burger' })).toBeVisible();
  await page.getByRole('button', { name: /^(Destaque atual|Mostrar destaque) 1 de 4$/ }).click();
  await page.waitForTimeout(700);
  const campaignCarousel = page.getByLabel('Destaques do Dine');
  await campaignCarousel.hover();
  await page.mouse.wheel(354, 0);
  await expect(page.getByRole('button', { name: 'Destaque atual 2 de 4' })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('updates the feed photo count and dot while scrolling the gallery', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await createUserAccount(page);
  await page.getByRole('tab', { name: 'Ir para Feed' }).click();
  const gallery = page.getByLabel(/^Galeria de .+, [2-4] fotos$/).first();
  await expect(gallery).toBeVisible();
  const imageWrap = gallery.locator('xpath=..');
  const initialCount = imageWrap.getByText(/^1\/[2-4]$/);
  await expect(initialCount).toBeVisible();
  const total = (await initialCount.textContent()).split('/')[1];
  await gallery.hover();
  await page.mouse.wheel(390, 0);
  await expect(imageWrap.getByText(`2/${total}`, { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('celebrates social feed reactions with the mascot toast', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('dialog', (dialog) => dialog.accept());

  await createUserAccount(page);
  await page.getByRole('tab', { name: 'Ir para Feed' }).click();
  await page.getByLabel(/^Curtir publicacao de /).first().click();

  await expect(page.getByRole('alert')).toContainText('Curtida enviada');
  await expect(page.getByLabel('Mascote Dine comemorando curtida enviada')).toBeVisible();
  await expect(page.getByLabel(/^Remover curtida da publicacao de /).first()).toBeVisible();
  expect(pageErrors).toEqual([]);
});
