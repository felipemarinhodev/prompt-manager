import { CreatePromptDTO } from '@/core/application/prompts/create-prompt.dto';
import { UpdatePromptDTO } from '@/core/application/prompts/update-prompt.dto';
import { Prompt } from '@/core/domain/prompts/prompt.entity';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';

type PromptDelegateMock = {
  create: jest.MockedFunction<
    (args: { dta: CreatePromptDTO }) => Promise<void>
  >;
  delete: jest.MockedFunction<
    (args: { where: { id: string } }) => Promise<void>
  >;
  findUnique: jest.MockedFunction<
    (args: { where: { id: string } }) => Promise<Prompt | null>
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
  update: jest.MockedFunction<
    (args: {
      where: { id: string };
      data: Partial<UpdatePromptDTO>;
    }) => Promise<Prompt>
  >;
};

type PrismaMock = {
  prompt: PromptDelegateMock;
};

function createMockPrisma() {
  const mock: PrismaMock = {
    prompt: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
  describe('delete', () => {
    it('should call the delete method with the correct id', async () => {
      const id = '1';
      prisma.prompt.delete.mockResolvedValue(undefined);

      await repository.delete(id);

      expect(prisma.prompt.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });
  describe('findById', () => {
    it('should search by id and return the prompt', async () => {
      const id = '1';
      const expectedPrompt: Prompt = {
        id,
        title: 'Existing Prompt',
        content: 'Content',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.prompt.findUnique.mockResolvedValue(expectedPrompt);

      const result = await repository.findById(id);
      expect(prisma.prompt.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(expectedPrompt);
    });
    it('should search by id and return null if not found', async () => {
      const id = 'non-existing-id';
      prisma.prompt.findUnique.mockResolvedValue(null);

      const result = await repository.findById(id);
      expect(prisma.prompt.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toBeNull();
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
  describe('update', () => {
    it('should update the prompt with the correct data', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'Updated Prompt',
        content: 'Updated Content',
        createdAt: now,
        updatedAt: now,
      };

      await prisma.prompt.update.mockResolvedValue(input);

      const result = await repository.update(input.id, {
        title: input.title,
        content: input.content,
      });

      expect(prisma.prompt.update).toHaveBeenCalledWith({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content,
        },
      });
      expect(result).toEqual(input);
    });
    it('should update the prompt with partial data (only title)', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'Updated Prompt',
        content: 'Updated Content',
        createdAt: now,
        updatedAt: now,
      };

      await prisma.prompt.update.mockResolvedValue(input);

      const result = await repository.update(input.id, {
        title: input.title,
      });

      expect(prisma.prompt.update).toHaveBeenCalledWith({
        where: { id: input.id },
        data: {
          title: input.title,
        },
      });
      expect(result).toEqual(input);

      const call = prisma.prompt.update.mock.calls[0][0];
      expect(call.where).toEqual({ id: input.id });
      expect(call.data).toEqual({ title: input.title });
      expect('content' in call.data).toBe(false);
    });
    it('should update the prompt with partial data (only content)', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: '',
        content: 'Updated Content',
        createdAt: now,
        updatedAt: now,
      };

      await prisma.prompt.update.mockResolvedValue(input);

      const result = await repository.update(input.id, {
        content: input.content,
      });

      expect(prisma.prompt.update).toHaveBeenCalledWith({
        where: { id: input.id },
        data: {
          content: input.content,
        },
      });
      expect(result).toEqual(input);

      const call = prisma.prompt.update.mock.calls[0][0];
      expect(call.where).toEqual({ id: input.id });
      expect(call.data).toEqual({ content: input.content });
      expect('title' in call.data).toBe(false);
    });
  });
});
