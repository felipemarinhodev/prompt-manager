import { searchPromptAction } from '@/app/actions/prompt.actions';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));

const mockedSearchExecute = jest.fn();

jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedSearchExecute,
  })),
}));

describe('Server Actions: Prompt', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
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
