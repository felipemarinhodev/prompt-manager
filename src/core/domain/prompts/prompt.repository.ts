import { CreatePromptDTO } from '@/core/application/prompts/create-prompt.dto';
import { Prompt } from './prompt.entity';

export interface PromptRepository {
  create(data: CreatePromptDTO): Promise<void>;
  findById(id: string): Promise<Prompt | null>;
  findByTitle(title: string): Promise<Prompt | null>;
  findMany(): Promise<Prompt[]>;
  searchMany(term: string): Promise<Prompt[]>;
  update(id: string, data: Partial<CreatePromptDTO>): Promise<Prompt>;
}
