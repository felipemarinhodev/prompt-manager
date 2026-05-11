import {
  createPromptAction,
  searchPromptAction,
} from '@/app/actions/prompt.actions';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));

const mockedCreateExecute = jest.fn();
jest.mock('@/core/application/prompts/create-prompt.use-case', () => ({
  CreatePromptUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedCreateExecute,
  })),
}));

const mockedSearchExecute = jest.fn();
jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedSearchExecute,
  })),
}));

describe('Server Actions: Prompt', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
    mockedCreateExecute.mockReset();
  });

  describe('CreatePromptAction', () => {
    it('should create a prompt successfully', async () => {
      mockedCreateExecute.mockResolvedValue(undefined);

      const data = {
        title: 'New Prompt',
        content: 'Content of the new prompt',
      };
      const result = await createPromptAction(data);

      expect(mockedCreateExecute).toHaveBeenCalledWith(data);
      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Prompt criado com sucesso');
    });
    it('should return an validation error when the data is empty', async () => {
      const data = {
        title: '',
        content: '',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Erro de validação');
      expect(result?.errors).toEqual({
        title: ['O título é obrigatório'],
        content: ['O conteúdo é obrigatório'],
      });
    });
    it('should return an error when the prompt already exists', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('PROMPT_ALREADY_EXISTS'));

      const data = {
        title: 'Existing Prompt',
        content: 'Content',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Este prompt já existe');
    });
    it('should return a generic error when the creation fails', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('UNKNOWN_ERROR'));

      const data = {
        title: 'New Prompt',
        content: 'Content',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Falha ao criar o prompt');
    });
  });

  describe('SearchPromptAction', () => {
    it('should return success when the term of search is not empty', async () => {
      const input = [{ id: '1', title: 'AI', content: 'Content' }];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append('q', 'AI');

      const result = await searchPromptAction({ success: true }, formData);
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });
    it('should return success and list all prompts when the search term is empty', async () => {
      const input = [
        { id: '1', title: 'First', content: 'Content 01' },
        { id: '2', title: 'Second', content: 'Content 02' },
      ];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append('q', '');

      const result = await searchPromptAction({ success: true }, formData);
      expect(result.success).toBeDefined();
    });
    it('should return an generic error when the search fails', async () => {
      const error = new Error('UNKOWN');
      mockedSearchExecute.mockRejectedValue(error);

      const formData = new FormData();
      formData.append('q', 'error');

      const result = await searchPromptAction({ success: true }, formData);
      expect(result.success).toBe(false);
      expect(result.prompts).toBe(undefined);
      expect(result.message).toBe(
        'Falha ao buscar os prompts. Por favor, tente novamente.'
      );
    });

    it('should trim the search term before executing the search', async () => {
      const input = [{ id: '1', title: 'First', content: 'Content 01' }];

      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append('q', '   title 01    ');

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('title 01');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('should return all prompts when the search term is empty', async () => {
      const input = [
        { id: '1', title: 'First', content: 'Content 01' },
        { id: '2', title: 'Second', content: 'Content 02' },
      ];

      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });
  });
});
