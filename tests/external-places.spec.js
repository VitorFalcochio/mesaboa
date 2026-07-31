const { test, expect } = require('@playwright/test');

async function createUserAccount(page) {
  await page.goto('/');
  await page.getByText('Pular', { exact: true }).click();
  await page.getByRole('tab', { name: 'Criar conta' }).click();
  await page.getByRole('radio', { name: 'Conta de Usuário' }).click();
  await page.getByLabel('Nome').fill('Explorador do mapa');
  await page.getByLabel('E-mail').fill(`mapa-${Date.now()}@dine.test`);
  await page.locator('input[aria-label="Senha"]').fill('senha-segura-123');
  await page.getByRole('button', { name: 'Criar minha conta', exact: true }).click();
  await expect(page.getByText('Explorar', { exact: true }).last()).toBeVisible();
}

test('keeps external places map-only and clearly distinct from Dine partners', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await createUserAccount(page);
  await page.getByRole('tab', { name: 'Ir para Mapa' }).click();

  await expect(page.getByText('Parceiro Dine', { exact: true })).toBeVisible();
  await expect(page.getByText('Ainda não parceiro', { exact: true })).toBeVisible();

  const externalMarker = page.getByRole('button', { name: /^Selecionar local não verificado / }).first();
  await expect(externalMarker).toBeVisible();
  await externalMarker.click();

  const openExternal = page.getByRole('button', { name: /^Abrir local não verificado / });
  await expect(openExternal).toBeVisible();
  await openExternal.click();

  await expect(page.getByText('Ainda não parceiro do Dine', { exact: true }).last()).toBeVisible();
  await expect(page.getByText(/não possui perfil, avaliações, cardápio ou reservas/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Como chegar', exact: true }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Este restaurante é seu?', exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('zooms the web map with a two-finger pinch gesture', async ({ page }) => {
  await createUserAccount(page);
  await page.getByRole('tab', { name: 'Ir para Mapa' }).click();

  const gestureLayer = page.getByTestId('partner-map-gesture-layer');
  await expect(gestureLayer).toBeVisible();
  const initialTileUrl = await gestureLayer.locator('img').first().getAttribute('src');
  await gestureLayer.evaluate((element) => {
    const dispatchTouches = (type, points) => {
      const touches = points.map(({ id, x, y }) => new Touch({
        identifier: id,
        target: element,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y
      }));
      element.dispatchEvent(new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        touches,
        targetTouches: touches,
        changedTouches: touches
      }));
    };
    dispatchTouches('touchstart', [{ id: 1, x: 120, y: 180 }, { id: 2, x: 190, y: 180 }]);
    dispatchTouches('touchmove', [{ id: 1, x: 35, y: 180 }, { id: 2, x: 275, y: 180 }]);
    dispatchTouches('touchend', []);
  });

  await expect.poll(async () => gestureLayer.locator('img').first().getAttribute('src')).not.toBe(initialTileUrl);
});

test('collects verified business data before sending a restaurant claim', async ({ page }) => {
  const pageErrors = [];
  const dialogs = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.accept();
  });

  await page.goto('/');
  await page.getByText('Pular', { exact: true }).click();
  await page.getByRole('tab', { name: 'Criar conta' }).click();
  await page.getByRole('radio', { name: 'Conta de Dono de restaurante' }).click();
  await page.getByLabel('Nome').fill('Responsável Legal');
  await page.getByLabel('E-mail').fill(`claim-${Date.now()}@dine.test`);
  await page.locator('input[aria-label="Senha"]').fill('senha-segura-123');
  await page.getByRole('button', { name: 'Criar minha conta', exact: true }).click();

  await page.getByLabel('Nome do estabelecimento').fill('Bacio di Latte');
  const claimSuggestion = page.getByRole('button', { name: 'Solicitar acesso ao local Bacio di Latte' }).first();
  await expect(claimSuggestion).toBeVisible();
  await claimSuggestion.click();

  await expect(page.getByText('O acesso só será liberado após a análise dos dados pela Central Admin.')).toBeVisible();
  await page.getByLabel('Telefone com DDD').fill('(17) 99999-1234');
  await page.getByLabel('CNPJ da empresa').fill('04.252.011/0001-10');
  await page.getByRole('button', { name: 'Enviar solicitação', exact: true }).click();

  await expect(page.getByText('Painel do parceiro', { exact: true })).toBeVisible();
  expect(dialogs.every((message) => !message.includes('CNPJ válido'))).toBeTruthy();
  expect(pageErrors).toEqual([]);
});
