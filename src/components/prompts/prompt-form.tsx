'use client';

import { createPromptAction } from '@/app/actions/prompt.actions';
import {
  CreatePromptDTO,
  createPromptSchema,
} from '@/core/application/prompts/create-prompt.dto';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export const PromptForm = () => {
  const router = useRouter();
  const form = useForm<CreatePromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const submit = async (data: CreatePromptDTO) => {
    const result = await createPromptAction(data);

    console.log('submit - result:', result);

    if (!result.success) {
      return;
    }

    router.refresh();
  };

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(submit)}>
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
