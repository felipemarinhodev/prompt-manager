import test, { expect } from '@playwright/test';

test.describe('Sidebar Responsiveness', () => {
  test('Mobile: menu hamburger button should open and close the sidebar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');

    const openButton = page.getByLabel(/Abrir menu/i);
    await expect(openButton).toBeVisible();
    await expect(openButton).toHaveAttribute('aria-expanded', 'false');

    await openButton.click();
    await expect(openButton).toHaveAttribute('aria-expanded', 'true');

    const aside = page.getByRole('complementary');
    await expect(aside).toBeInViewport();

    const closeButton = page.getByLabel('Fechar menu');
    await expect(closeButton).toBeInViewport();
    await expect(page.getByPlaceholder('Buscar prompts...')).toBeInViewport();

    await closeButton.click();
    await expect(openButton).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('complementary')).not.toBeInViewport();
    await expect(page.getByLabel('Fechar menu')).not.toBeInViewport();
    await expect(
      page.getByPlaceholder('Buscar prompts...')
    ).not.toBeInViewport();
  });

  test('Desktop: menu hamburger button should be hidden and sidebar should be visible', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto('/');

    await expect(page.getByLabel(/Abrir menu/i)).toBeHidden();
    await expect(page.getByPlaceholder('Buscar prompts...')).toBeInViewport();

    await expect(
      page.getByRole('button', { name: /minimizar sidebar/i })
    ).toBeVisible();
    await expect(page.getByLabel(/fechar menu/i)).toBeHidden();

    await expect(
      page.getByRole('heading', { name: /selecione um prompt/i })
    ).toBeVisible();
  });
});
