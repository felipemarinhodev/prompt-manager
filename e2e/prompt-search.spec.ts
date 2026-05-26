import { PrismaClient } from '@/generated/prisma/client';
import test, { expect } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';

test.describe('Search prompt (Success)', () => {
  test('filter prompt list by search text typed in search input', async ({
    page,
  }) => {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });

    const prisma = new PrismaClient({ adapter });

    const uniqueAlphaTitle = `E2E Search Alpha Prompt ${Date.now()}`;
    const uniqueBetaTitle = `E2E Search Beta Prompt ${Date.now()}`;
    await prisma.prompt.createMany({
      data: [
        {
          title: uniqueAlphaTitle,
          content: 'Alpha content for search test.',
        },
        {
          title: uniqueBetaTitle,
          content: 'Beta content for search test.',
        },
      ],
    });
    await prisma.$disconnect();

    await page.goto('/');

    const searchInput = await page.getByPlaceholder('Buscar prompts...');
    await expect(searchInput).toBeVisible();

    await searchInput.fill(uniqueAlphaTitle);
    await expect(page.getByText(uniqueAlphaTitle)).toHaveCount(1);

    await searchInput.fill(uniqueBetaTitle);
    await expect(page.getByText(uniqueBetaTitle)).toHaveCount(1);

    const notExist = `E2E Search NotExist Prompt ${Date.now()}`;
    await searchInput.fill(notExist);
    await expect(page.getByText(notExist)).toHaveCount(0);
  });
});
