import { PrismaClient } from '@/generated/prisma/client';
import test, { expect } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';

test('should edit a prompt successfully through UI', async ({ page }) => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const now = new Date();
  const originalTitle = `E2E Edit Original ${now}`;
  const updatedTitle = `E2E Edit Updated ${now}`;
  const originalContent = 'Content';
  const updatedContent = 'Updated Content';

  const created = await prisma.prompt.create({
    data: {
      title: originalTitle,
      content: originalContent,
    },
  });

  await prisma.$disconnect();

  await page.goto(`/${created.id}`);

  await expect(page.getByPlaceholder('Título do prompt')).toBeVisible();
  await page.fill('input[name="title"]', updatedTitle);
  await page.fill('textarea[name="content"]', updatedContent);
  await page.getByRole('button', { name: 'Salvar' }).click();

  // Wait for the success message to appear
  await page.waitForSelector('text=Prompt atualizado com sucesso', {
    state: 'visible',
    timeout: 15000,
  });

  await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible();
  await expect(page.locator('input[name="title"]')).toHaveValue(updatedTitle);
});
