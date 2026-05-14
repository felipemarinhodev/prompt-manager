import { CopyButton, type CopyButtonProps } from '@/components/button-actions';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

const writeTextMock = jest.fn();
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const makeSut = ({ content = '' }: CopyButtonProps = {} as CopyButtonProps) => {
  return render(<CopyButton content={content} />);
};
describe('CopyButton', () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  beforeEach(() => {
    writeTextMock.mockReset();
    Object.defineProperty(global.navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });
    jest.useFakeTimers({ legacyFakeTimers: true });
  });

  it('should disable the button when content is empty', async () => {
    makeSut();
    const button = screen.getByRole('button', { name: /copiar/i });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(writeTextMock).not.toHaveBeenCalled();
  });
  it('should change the button label to "Copiado" and come back to "Copy" after 2 seconds', async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    const content = 'Test content';
    makeSut({ content });
    const button = screen.getByRole('button', { name: /copiar/i });
    await user.click(button);

    expect(
      await screen.findByRole('button', { name: /copiado/i })
    ).toBeVisible();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(
      screen.queryByRole('button', { name: /copiado/i })
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /copiar/i })
    ).toBeVisible();
  });
  it('should show a toast of error when the copy action fails', async () => {
    const errorMessage = 'Failed to copy';
    const error = new Error(errorMessage);

    jest
      .spyOn(global.navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(error);
    const content = 'Test content';
    makeSut({ content });

    const button = screen.getByRole('button', { name: /copiar/i });
    await user.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        `Erro ao copiar o texto: ${errorMessage}`
      );
    });
    expect(screen.getByRole('button', { name: /copiar/i })).toBeVisible();
  });
  it('should clear the timer when the component is unmounted', async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    const clearSpy = jest.spyOn(window, 'clearTimeout');
    const content = 'Test content';
    makeSut({ content });
    const button = screen.getByRole('button', { name: /copiar/i });
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /copiado/i })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /copiado/i }));

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
