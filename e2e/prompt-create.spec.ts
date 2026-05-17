import test, { expect } from '@playwright/test';

test('should create a new prompt successfully', async ({ page }) => {
  const uniqueTitle = `E2E Prompt ${Date.now()}`;
  const uniqueContent = `E2E Content ${Date.now()}`;

  await page.goto('/new');
  await expect(page.getByPlaceholder('Título do prompt')).toBeVisible();

  await page.fill('input[name="title"]', uniqueTitle);
  await page.fill('textarea[name="content"]', uniqueContent);

  await page.getByRole('button', { name: /salvar/i }).click();

  await page.waitForSelector('text=Prompt criado com sucesso', {
    state: 'visible',
    timeout: 15000,
  });
});
