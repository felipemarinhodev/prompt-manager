import { UpdatePromptDTO } from '@/core/application/prompts/update-prompt.dto';
import { UpdatePromptUseCase } from '@/core/application/prompts/update-prompt.use-case';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

const makeRepository = (override: Partial<PromptRepository>) => {
  const base = {
    update: jest.fn(async (id: string, data: Partial<UpdatePromptDTO>) => ({
      id,
      title: data.title || '',
      content: data.content || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    findById: jest.fn(async () => null),
  };
  return { ...base, ...override } as PromptRepository;
};

describe('UpdatePromptUseCase', () => {
  it('should update a prompt successfully', async () => {
    const idPrompt = 'existing-id';
    const updateTitle = 'Updated Prompt';
    const updateContent = 'This is an updated prompt.';
    const now = new Date();
    const repository = makeRepository({
      findById: jest.fn().mockResolvedValue({
        id: idPrompt,
        title: 'Old Prompt',
        content: 'This is an old prompt.',
        createdAt: now,
        updatedAt: now,
      }),
      update: jest.fn().mockResolvedValue({
        id: idPrompt,
        title: updateTitle,
        content: updateContent,
        createdAt: now,
        updatedAt: new Date(),
      }),
    });

    const useCase = new UpdatePromptUseCase(repository);

    const input: UpdatePromptDTO = {
      id: idPrompt,
      title: updateTitle,
      content: updateContent,
    };

    const result = await useCase.execute(input);

    expect(result).toMatchObject(input);
    expect(repository.update).toHaveBeenCalledWith(input.id, {
      title: input.title,
      content: input.content,
    });
  });

  it('should throw the error PROMPT_NOT_FOUND when there is no prompt', async () => {
    const idPrompt = 'existing-id';
    const updateTitle = 'Updated Prompt';
    const updateContent = 'This is an updated prompt.';

    const repository = makeRepository({});
    const useCase = new UpdatePromptUseCase(repository);

    const input: UpdatePromptDTO = {
      id: idPrompt,
      title: updateTitle,
      content: updateContent,
    };

    await expect(useCase.execute(input)).rejects.toThrow('PROMPT_NOT_FOUND');
    expect(repository.update).not.toHaveBeenCalled();
  });
});
