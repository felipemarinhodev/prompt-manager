import { CreatePromptUseCase } from '@/core/application/prompts/create-prompt.use-case';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';
import { create } from 'domain';

const makeRepository = (overrides: Partial<PromptRepository>) => {
  const base = {
    create: jest.fn(async () => undefined),
  };

  return { ...base, ...overrides } as PromptRepository;
};

describe('CreatePromptUseCase', () => {
  it('should create a new prompt when it does not already exist', async () => {
    const repository = makeRepository({
      findByTitle: jest.fn().mockResolvedValue(null),
    });
    const useCase = new CreatePromptUseCase(repository);

    const input = {
      title: 'New Prompt',
      content: 'This is a new prompt.',
    };

    await expect(useCase.execute(input)).resolves.toBeUndefined();
    expect(repository.create).toHaveBeenCalledWith(input);
  });
  it('should fail with PROMPT_ALREADY_EXISTS when the title already exists', async () => {
    const repository = makeRepository({
      findByTitle: jest.fn().mockResolvedValue({
        id: 'existing-id',
        title: 'New Prompt',
        content: 'Existing content',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    });
    const useCase = new CreatePromptUseCase(repository);

    const input = {
      title: 'New Prompt',
      content: 'This is a new prompt.',
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      'PROMPT_ALREADY_EXISTS'
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});
