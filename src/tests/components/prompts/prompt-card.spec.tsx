import { PromptCard, type PromptCardProps } from '@/components/prompts';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

const deleteMock = jest.fn();
jest.mock('@/app/actions/prompt.actions', () => ({
  deletePromptAction: (id: string) => deleteMock(id),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const pushMock = jest.fn();
jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({
      href,
      children,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      prefetch,
      ...props
    }: {
      href: string;
      children: React.ReactNode;
      prefetch?: boolean;
    }) => {
      return (
        <a
          href={href}
          {...props}
          onClick={(e) => {
            e.preventDefault();
            pushMock(href);
          }}
        >
          {children}
        </a>
      );
    },
  };
});

const makeSut = ({ prompt }: PromptCardProps) => {
  return render(<PromptCard prompt={prompt} />);
};

describe('PromptCard', () => {
  const user = userEvent.setup();

  const prompt = { id: '1', title: 'Test Prompt', content: 'Test Content' };
  it('should render the link with the correct href', () => {
    makeSut({ prompt });

    const link = screen.getByRole('link');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `/${prompt.id}`);
  });
  it('should redirect to the correct page when the link is clicked', async () => {
    makeSut({ prompt });
    const link = screen.getByRole('link');

    await user.click(link);

    expect(pushMock).toHaveBeenCalledWith(`/${prompt.id}`);
  });

  it('should open the dialog when the deletion is clicked', async () => {
    makeSut({ prompt });

    const deleteButton = screen.getByRole('button', {
      name: /remover prompt/i,
    });
    await user.click(deleteButton);

    expect(screen.getByText('Remover Prompt')).toBeInTheDocument();
  });

  it('should remove successfully and show a success message(Toast)', async () => {
    deleteMock.mockResolvedValueOnce({
      success: true,
      message: 'Prompt removido com sucesso!',
    });
    makeSut({ prompt });

    const deleteButton = screen.getByRole('button', {
      name: /remover prompt/i,
    });
    await user.click(deleteButton);

    await user.click(
      screen.getByRole('button', { name: /confirmar remoção/i })
    );

    expect(toast.success).toHaveBeenCalledWith('Prompt removido com sucesso!');
  });

  it('should show an error message(Toast) when the action fails', async () => {
    const errorMessage = 'Erro ao remover o prompt';
    deleteMock.mockResolvedValue({
      success: false,
      message: errorMessage,
    });
    makeSut({ prompt });
    const deleteButton = screen.getByRole('button', {
      name: /remover prompt/i,
    });
    await user.click(deleteButton);

    await user.click(
      screen.getByRole('button', { name: /confirmar remoção/i })
    );

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should fail to remove and show an error message(Toast)', async () => {
    const errorMessage = 'Erro ao remover o prompt';
    deleteMock.mockRejectedValue(new Error(errorMessage));
    render(<PromptCard prompt={prompt} />);

    await user.click(screen.getByRole('button'));

    await user.click(
      screen.getByRole('button', { name: /confirmar remoção/i })
    );

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });
});
