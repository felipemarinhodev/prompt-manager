import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

export class DeletePromptUseCase {
  constructor(private repository: PromptRepository) {}

  async execute(id: string): Promise<void> {
    const exists = await this.repository.findById(id);

    if (!exists) {
      throw new Error('PROMPT_NOT_FOUND');
    }

    await this.repository.delete(id);
  }
}
