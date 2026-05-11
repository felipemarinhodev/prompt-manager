'use client';

import { Controller, useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  CreatePromptDTO,
  createPromptSchema,
} from '@/core/application/prompts/create-prompt.dto';
import { zodResolver } from '@hookform/resolvers/zod';

export const PromptForm = () => {
  const form = useForm<CreatePromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  return (
    <form className="space-y-6">
      <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
        <Button type="submit" size="sm">
          Salvar
        </Button>
      </header>
      <Controller
        name="title"
        control={form.control}
        render={({ field }) => (
          <Input
            {...field}
            placeholder="Título do prompt"
            variant="transparent"
            size="lg"
            autoFocus
          />
        )}
      />

      <Controller
        name="content"
        control={form.control}
        render={({ field }) => (
          <Textarea
            {...field}
            placeholder="Digite o conteúdo do prompt..."
            variant="transparent"
            size="lg"
          />
        )}
      />
    </form>
  );
};
