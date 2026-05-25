import { DeletePromptUseCase } from '@/core/application/prompts/delete-prompt.use-case';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

const makeRepository = (overrides: Partial<PromptRepository> = {}) => {
  const base = {
    delete: jest.fn(async () => {}),
    findById: jest.fn(async () => null),
  };
  return { ...base, ...overrides } as PromptRepository;
};

describe('DeletePromptUseCase', () => {
  it('should delete a prompt successfully', async () => {
    const now = new Date();
    const prompt = {
      id: 'existing-id',
      title: 'Old Prompt',
      content: 'This is an old prompt.',
      createdAt: now,
      updatedAt: now,
    };
    const repository = makeRepository({
      findById: jest.fn().mockResolvedValue(prompt),
      delete: jest.fn().mockResolvedValue(undefined),
    });
    const useCase = new DeletePromptUseCase(repository);
    const result = await useCase.execute('existing-id');

    expect(result).toBeUndefined();

    expect(repository.delete).toHaveBeenCalledTimes(1);
    expect(repository.delete).toHaveBeenCalledWith(prompt.id);
  });

  it('should throw the error PROMPT_NOT_FOUND when there is no prompt', async () => {
    const repository = makeRepository();
    const useCase = new DeletePromptUseCase(repository);

    await expect(useCase.execute('non-existing-id')).rejects.toThrow(
      'PROMPT_NOT_FOUND'
    );
  });
});
