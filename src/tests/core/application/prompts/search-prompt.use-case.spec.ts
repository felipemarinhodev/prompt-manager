import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompts.use-case';
import { Prompt } from '@/core/domain/prompts/prompt.entity';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

describe('SearchPromptAction', () => {
  const input: Prompt[] = [
    {
      id: '1',
      title: 'First',
      content: 'Content 01',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Second',
      content: 'Content 02',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const repository: PromptRepository = {
    findMany: async () => input,
    searchMany: async (term) =>
      input.filter(
        (prompt) =>
          prompt.title.toLowerCase().includes(term.toLowerCase()) ||
          prompt.content.toLowerCase().includes(term.toLowerCase())
      ),
  };
  it('should return all prompts when the search term is empty', async () => {
    const useCase = new SearchPromptsUseCase(repository);
    const result = await useCase.execute('');
    expect(result).toHaveLength(input.length);
  });

  it('should return the prompts that match the search term in the title or content', async () => {
    const useCase = new SearchPromptsUseCase(repository);
    const query = 'first';

    const results = await useCase.execute(query);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });
  it('should clean the empty spaces in the search term and return all prompts', async () => {
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue([]);

    const repositoryWithSpy: PromptRepository = {
      ...repository,
      searchMany,
      findMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpy);

    const query = '    ';

    const results = await useCase.execute(query);

    expect(results).toHaveLength(2);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });

  it('should search term with empty spaces, handle with trimming and return the correct prompts', async () => {
    const firstElement = input.slice(0, 1);

    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue(firstElement);

    const repositoryWithSpy: PromptRepository = {
      ...repository,
      searchMany,
      findMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpy);

    const query = '  second  ';

    const result = await useCase.execute(query);

    expect(result).toMatchObject(firstElement);
    expect(searchMany).toHaveBeenCalledWith(query.trim());
    expect(findMany).not.toHaveBeenCalled();
  });

  it('should handle with an undefined or null term and return all prompts', async () => {
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue([]);

    const repositoryWithSpy: PromptRepository = {
      ...repository,
      searchMany,
      findMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpy);

    const query = undefined as unknown as string;

    const result = await useCase.execute(query);

    expect(result).toMatchObject(input);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });
});
