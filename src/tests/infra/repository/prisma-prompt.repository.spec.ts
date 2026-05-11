import { CreatePromptDTO } from '@/core/application/prompts/create-prompt.dto';
import { Prompt } from '@/core/domain/prompts/prompt.entity';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import { de } from '@faker-js/faker';

type PromptDelegateMock = {
  create: jest.MockedFunction<
    (args: { dta: CreatePromptDTO }) => Promise<void>
  >;
  findFirst: jest.MockedFunction<
    (args: {
      where: { title: string };
    }) => Promise<Pick<Prompt, 'id' | 'title' | 'content'> | null>
  >;
  findMany: jest.MockedFunction<
    (args: {
      where?: {
        OR: [
          { title?: { contains: string; mode: 'insensitive' } },
          { content?: { contains: string; mode: 'insensitive' } },
        ];
      };
      orderBy?: { createdAt: 'asc' | 'desc' };
    }) => Promise<Prompt[]>
  >;
};

type PrismaMock = {
  prompt: PromptDelegateMock;
};

function createMockPrisma() {
  const mock: PrismaMock = {
    prompt: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };
  return mock as unknown as PrismaClient & PrismaMock;
}

describe('PrismaPromptRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repository: PrismaPromptRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repository = new PrismaPromptRepository(prisma);
  });

  describe('create', () => {
    it('should call the create method with the correct data', async () => {
      const data: CreatePromptDTO = {
        title: 'New Prompt',
        content: 'New Content',
      };
      prisma.prompt.create.mockResolvedValue(undefined);

      await repository.create(data);

      expect(prisma.prompt.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('findByTitle', () => {
    it('should call the findFirst method with the correct where clause and return the prompt', async () => {
      const title = 'Existing Prompt';
      const expectedPrompt: Pick<Prompt, 'id' | 'title' | 'content'> = {
        id: '1',
        title,
        content: 'Content',
      };
      prisma.prompt.findFirst.mockResolvedValue(expectedPrompt);

      const result = await repository.findByTitle(title);
      expect(prisma.prompt.findFirst).toHaveBeenCalledWith({
        where: { title },
      });
      expect(result).toEqual(expectedPrompt);
    });
  });

  describe('findMany', () => {
    it('should order by createdAt in descending order and map the results correctly', async () => {
      const now = new Date();

      const input = [
        {
          id: '1',
          title: 'Prompt 1',
          content: 'Content 1',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '2',
          title: 'Prompt 2',
          content: 'Content 2',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.findMany();

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toEqual(input);
    });
  });

  describe('searchMany', () => {
    it('should search by empty term and not sent the where clause', async () => {
      const now = new Date();

      const input = [
        {
          id: '1',
          title: 'Prompt 1',
          content: 'Content 1',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany('       ');

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });
    it('should search by term and set where clause', async () => {
      const now = new Date();

      const input = [
        {
          id: '1',
          title: 'Prompt 1',
          content: 'Content 1',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany('   prompt 1    ');

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'prompt 1', mode: 'insensitive' } },
            { content: { contains: 'prompt 1', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });
  });
});
