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

test('finds restaurant address by street and by CEP', async ({ page }) => {
  await page.route('**/viacep.com.br/ws/**', async (route) => {
    const isCepLookup = route.request().url().includes('/15015110/');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(isCepLookup ? {
        cep: '15015-110',
        logradouro: 'Rua Siqueira Campos',
        complemento: '',
        bairro: 'Boa Vista',
        localidade: 'São José do Rio Preto',
        uf: 'SP'
      } : [{
        cep: '15015-200',
        logradouro: 'Rua Voluntários de São Paulo',
        complemento: '',
        bairro: 'Centro',
        localidade: 'São José do Rio Preto',
        uf: 'SP'
      }])
    });
  });
  await page.route('**/nominatim.openstreetmap.org/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ lat: '-20.81123', lon: '-49.37561' }])
    });
  });

  await createLocalAccount(page);
  await page.getByLabel('Nome do estabelecimento').fill('Bistrô Endereço Certo');
  await page.getByText('Italiana', { exact: true }).click();
  await page.getByLabel('Bairro').fill('Centro');
  await page.getByLabel('Descrição').fill('Cozinha autoral no centro da cidade.');
  await page.getByRole('button', { name: 'Continuar' }).click();

  const addressField = page.getByLabel('CEP ou endereço');
  await addressField.fill('Rua Voluntários de São Paulo, 3745');
  await expect(page.getByText('Selecione a opção correta para confirmar o endereço.')).toBeVisible();
  await page.getByRole('button', { name: /Usar endereço Rua Voluntários de São Paulo, 3745/ }).click();
  await expect(page.getByText('Endereço confirmado', { exact: true })).toBeVisible();
  await expect(addressField).toHaveValue(/Rua Voluntários de São Paulo, 3745/);

  await addressField.fill('15015-110');
  await expect(page.getByText('CEP encontrado. Agora informe o número do restaurante.')).toBeVisible();
  await page.getByLabel('Número').fill('230');
  await page.getByRole('button', { name: 'Buscar e confirmar endereço' }).click();
  await expect(page.getByText('Endereço confirmado', { exact: true })).toBeVisible();
  await expect(addressField).toHaveValue(/Rua Siqueira Campos, 230/);
});
