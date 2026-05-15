import { PromptCard, type PromptCardProps } from '@/components/prompts';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';

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
});
