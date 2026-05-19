import z from 'zod';

export const updatePromptDtoSchema = z.object({
  id: z.string().min(1, 'O ID é obrigatório'),
  title: z.string().min(1, 'O título é obrigatório'),
  content: z.string().min(1, 'O conteúdo é obrigatório'),
});

export type UpdatePromptDTO = z.infer<typeof updatePromptDtoSchema>;
