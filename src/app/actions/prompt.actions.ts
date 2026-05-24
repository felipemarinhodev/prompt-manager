'use server';

import { prisma } from '@/lib/prisma';

import {
  CreatePromptDTO,
  createPromptSchema,
} from '@/core/application/prompts/create-prompt.dto';
import { CreatePromptUseCase } from '@/core/application/prompts/create-prompt.use-case';
import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompts.use-case';
import {
  UpdatePromptDTO,
  updatePromptDtoSchema,
} from '@/core/application/prompts/update-prompt.dto';
import { UpdatePromptUseCase } from '@/core/application/prompts/update-prompt.use-case';
import type { PromptSummary } from '@/core/domain/prompts/prompt.entity';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import z from 'zod';

type SearchFormState = {
  message?: string;
  prompts?: PromptSummary[];
  success: boolean;
};

type FormState = {
  errors?: unknown;
  message?: string;
  prompts?: PromptSummary[];
  success: boolean;
};

export async function createPromptAction(data: CreatePromptDTO) {
  const validated = createPromptSchema.safeParse(data);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);

    return {
      success: false,
      message: 'Erro de validação',
      errors: fieldErrors,
    };
  }

  try {
    const repository = new PrismaPromptRepository(prisma);
    const useCase = new CreatePromptUseCase(repository);
    await useCase.execute(validated.data);
  } catch (error) {
    const _error = error as Error;

    if (_error.message === 'PROMPT_ALREADY_EXISTS') {
      return {
        success: false,
        message: 'Este prompt já existe',
      };
    }

    return {
      success: false,
      message: 'Falha ao criar o prompt',
    };
  }

  return {
    success: true,
    message: 'Prompt criado com sucesso',
  };
}

export async function deletePromptAction(id: string): Promise<FormState> {
  if (!id) {
    return { success: false, message: 'ID do prompt é obrigatório' };
  }

  try {
    const repository = new PrismaPromptRepository(prisma);
    const useCase = new DeletePromptUseCase(repository);
    await useCase.execute({ id });

    return {
      success: true,
      message: 'Prompt removido com sucesso!',
    };
  } catch (error) {
    const _error = error as Error;
    if (_error.message === 'PROMPT_NOT_FOUND') {
      return {
        success: false,
        message: 'Prompt não encontrado',
      };
    }

    return {
      success: false,
      message: 'Falha ao remover o prompt',
    };
  }
}

export async function updatePromptAction(
  data: UpdatePromptDTO
): Promise<FormState> {
  const validated = updatePromptDtoSchema.safeParse(data);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    return {
      success: false,
      message: 'Erro de validação',
      errors: fieldErrors,
    };
  }

  try {
    const repository = new PrismaPromptRepository(prisma);
    const useCase = new UpdatePromptUseCase(repository);
    await useCase.execute(validated.data);

    return {
      success: true,
      message: 'Prompt atualizado com sucesso',
    };
  } catch (error) {
    const _error = error as Error;
    if (_error.message === 'PROMPT_NOT_FOUND') {
      return {
        success: false,
        message: 'Prompt não encontrado',
      };
    }

    return {
      success: false,
      message: 'Falha ao atualizar o prompt',
    };
  }
}

export async function searchPromptAction(
  _prev: SearchFormState,
  formaData: FormData
): Promise<SearchFormState> {
  const term = String(formaData.get('q') ?? '').trim();

  const repository = new PrismaPromptRepository(prisma);
  const useCase = new SearchPromptsUseCase(repository);

  try {
    const result = await useCase.execute(term);

    const summaries = result.map(({ id, title, content }) => ({
      id,
      title,
      content,
    }));

    return {
      success: true,
      prompts: summaries,
    };
  } catch {
    return {
      success: false,
      message: 'Falha ao buscar os prompts. Por favor, tente novamente.',
    };
  }
}
