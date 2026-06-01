import { PrismaClient } from '@/generated/prisma/client';
import test, { expect } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

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

test('should show error message when prompt create duplicate title', async ({
  page,
}) => {
  const duplicateTitle = 'Duplicate Title';
  const content = `E2E Content ${Date.now()}`;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  await prisma.prompt.deleteMany({ where: { title: duplicateTitle } });
  await prisma.prompt.create({ data: { title: duplicateTitle, content } });
  await prisma.$disconnect();

  // Now, try to create another prompt with the same title
  await page.goto('/new');
  await page.fill('input[name="title"]', duplicateTitle);
  await page.fill('textarea[name="content"]', content);
  await page.getByRole('button', { name: /salvar/i }).click();

  await page.waitForSelector('text=Este prompt já existe', {
    state: 'visible',
    timeout: 15000,
  });
  await expect(page.getByRole('heading', { name: duplicateTitle })).toHaveCount(
    1
  );
});
