import { PromptForm } from '@/components/prompts';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

const refreshMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const createActionMock = jest.fn();
jest.mock('@/app/actions/prompt.actions', () => ({
  createPromptAction: (...args: unknown[]) => createActionMock(...args),
}));

// const successMock = jest.fn();
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const makeSut = () => {
  return render(<PromptForm />);
};

describe('PromptForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    createActionMock.mockReset();
    refreshMock.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();
  });

  it('should create a prompt successfully', async () => {
    const successMessage = 'Prompt criado com sucesso';
    createActionMock.mockResolvedValueOnce({
      success: true,
      message: successMessage,
    });
    makeSut();

    const titleInput = screen.getByPlaceholderText('Título do prompt');
    const contentInput = screen.getByPlaceholderText(
      'Digite o conteúdo do prompt...'
    );

    const submitButton = screen.getByRole('button', { name: /salvar/i });

    await user.type(titleInput, 'Test Prompt');
    await user.type(contentInput, 'This is a test prompt content.');
    await user.click(submitButton);

    expect(createActionMock).toHaveBeenCalledWith({
      title: 'Test Prompt',
      content: 'This is a test prompt content.',
    });
    expect(refreshMock).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(successMessage);
  });
  it('should show an error when the creation action fails', async () => {
    const errorMessage = 'Falha ao criar o prompt';
    createActionMock.mockResolvedValueOnce({
      success: false,
      message: errorMessage,
    });
    makeSut();

    const titleInput = screen.getByPlaceholderText('Título do prompt');
    const contentInput = screen.getByPlaceholderText(
      'Digite o conteúdo do prompt...'
    );

    const submitButton = screen.getByRole('button', { name: /salvar/i });

    await user.type(titleInput, 'Test Prompt');
    await user.type(contentInput, 'This is a test prompt content.');
    await user.click(submitButton);

    expect(refreshMock).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });
  it('should show message when the form is submitted with empty fields', async () => {
    makeSut();

    const submitButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitButton);

    expect(screen.getByText('O título é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('O conteúdo é obrigatório')).toBeInTheDocument();
    expect(createActionMock).not.toHaveBeenCalled();
  });
});
