const { test, expect } = require('@playwright/test');

async function createUserAccount(page) {
  await page.goto('/');
  await page.getByText('Pular', { exact: true }).click();
  await page.getByRole('tab', { name: 'Criar conta' }).click();
  await page.getByRole('radio', { name: 'Conta de Usuário' }).click();
  await page.getByLabel('Nome').fill('Cliente Reserva');
  await page.getByLabel('E-mail').fill(`reserva-${Date.now()}@dine.test`);
  await page.locator('input[aria-label="Senha"]').fill('senha-segura-123');
  await page.getByRole('button', { name: 'Criar minha conta', exact: true }).click();
  await expect(page.getByText('Explorar', { exact: true }).last()).toBeVisible();
}

test('creates a native reservation and shows it in the user account', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('dialog', (dialog) => dialog.accept());

  await createUserAccount(page);
  await page.getByRole('button', { name: /^Abrir restaurante / }).first().click();
  await page.getByRole('button', { name: 'Reservar', exact: true }).click();
  await expect(page.getByText('Reserva pelo Dine', { exact: true })).toBeVisible();

  const dateButtons = page.getByRole('button', { name: /^Reservar em / });
  let foundSlot = false;
  for (let index = 0; index < await dateButtons.count(); index += 1) {
    await dateButtons.nth(index).click();
    const slots = page.getByRole('button', { name: /\d{2}:\d{2}, \d+ lugares/ });
    if (await slots.count()) {
      await slots.first().click();
      foundSlot = true;
      break;
    }
  }
  expect(foundSlot).toBe(true);

  await page.getByLabel('Telefone para contato').fill('(17) 99999-9999');
  await page.getByRole('button', { name: 'Confirmar reserva', exact: true }).click();
  await expect(page.getByText('Reserva confirmada!', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Mascote Dine comemorando a reserva')).toBeVisible();
  await page.getByRole('button', { name: 'Ver minhas reservas', exact: true }).click();

  await expect(page.getByText('Minhas reservas', { exact: true })).toBeVisible();
  await expect(page.getByText('Confirmada', { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
