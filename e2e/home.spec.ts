import { test, expect, type Page } from '@playwright/test';

test('should load initial page', async ({ page }: { page: Page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /selecione um prompt/i })
  ).toBeVisible();
  await expect(
    page.getByText(
      /escolha um prompt da lista ao lado para visualizar e editar/i
    )
  ).toBeVisible();
});
