import {
  SidebarContent,
  type SidebarContentProps,
} from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';

jest.mock('@/app/actions/prompt.actions', () => ({
  searchPromptAction: jest
    .fn()
    .mockResolvedValue({ success: true, prompts: [] }),
}));

const pushMock = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => mockSearchParams,
}));

const initialPrompts = [
  {
    id: '1',
    title: 'Prompt 1',
    content: 'Content for prompt 1',
  },
];

const makeSut = (
  { prompts = initialPrompts }: SidebarContentProps = {} as SidebarContentProps
) => {
  render(<SidebarContent prompts={prompts} />);
};

describe('SidebarContent', () => {
  const user = userEvent.setup();

  describe('SidebarContent - Base', () => {
    it('should render the button to create a new prompt', () => {
      makeSut();
      expect(screen.getByRole('complementary')).toBeVisible();
      expect(
        screen.getByRole('button', { name: /novo prompt/i })
      ).toBeInTheDocument();
    });

    it('should render the prompts list', () => {
      const input = [
        {
          id: '1',
          title: 'Prompt 1',
          content: 'Content for prompt 1',
        },
        {
          id: '2',
          title: 'Prompt 2',
          content: 'Content for prompt 2',
        },
      ];
      makeSut({ prompts: input });
      expect(screen.getByText(input[0].title)).toBeInTheDocument();
      expect(screen.getAllByRole('paragraph')).toHaveLength(input.length);
    });

    it('should update the search field when the user types in it', async () => {
      const text = 'IA';
      makeSut();
      const searchInput = screen.getByPlaceholderText(/buscar prompts.../i);
      expect(searchInput).toBeInTheDocument();

      await user.type(searchInput, text);
      expect(searchInput).toHaveValue(text);
    });
  });

  describe('SidebarContent - Collapsed State', () => {
    it('should render the expanded and show the button to minimize', () => {
      makeSut();
      const aside = screen.getByRole('complementary');
      expect(aside).toBeVisible();

      const collapseButton = screen.getByRole('button', {
        name: /Minimizar sidebar/i,
      });
      expect(collapseButton).toBeVisible();
      const expandButton = screen.queryByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).not.toBeInTheDocument();
    });
    it('should render the collapsed and show the button to expand', async () => {
      makeSut();
      const collapseButton = screen.getByRole('button', {
        name: /Minimizar sidebar/i,
      });
      await user.click(collapseButton);

      const expandButton = screen.getByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).toBeVisible();
      expect(collapseButton).not.toBeInTheDocument();
    });

    it('should show the create new prompt button when the sidebar is collapsed', async () => {
      makeSut();
      const collapseButton = screen.getByRole('button', {
        name: /Minimizar sidebar/i,
      });
      await user.click(collapseButton);

      const newPromptButton = screen.getByRole('button', {
        name: /novo prompt/i,
      });
      expect(newPromptButton).toBeVisible();
    });
    it('should not show the prompts list when the sidebar is collapsed', async () => {
      makeSut();
      const collapseButton = screen.getByRole('button', {
        name: /Minimizar sidebar/i,
      });
      await user.click(collapseButton);

      const promptsList = screen.queryByRole('navigation', {
        name: /lista de prompts/i,
      });
      expect(promptsList).not.toBeInTheDocument();
    });
  });

  describe('SidebarContent - Navigation', () => {
    it('should navigate to the new prompt page `\/new` when the new prompt button is clicked', async () => {
      makeSut();
      const newPromptButton = screen.getByRole('button', {
        name: /novo prompt/i,
      });
      await user.click(newPromptButton);
      expect(pushMock).toHaveBeenCalledWith('/new');
    });
  });

  describe('SidebarContent - Search', () => {
    it('should navigate with codified URL when the user types in the search field', async () => {
      makeSut();
      const text = 'A B';

      const searchInput = screen.getByPlaceholderText(/buscar prompts.../i);
      await user.type(searchInput, text);
      expect(pushMock).toHaveBeenCalled();

      const lastCall = pushMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe('/?q=A%20B');
    });
    it('should clear the URL when the user clears the search field', async () => {
      makeSut();
      const text = 'A B';
      const searchInput = screen.getByPlaceholderText(/buscar prompts.../i);
      await user.type(searchInput, text);
      await user.clear(searchInput);

      const lastCall = pushMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe('/');
    });
  });

  it('should initialize the search field with the query from the URL', () => {
    const text = 'ABC';
    const searchParams = new URLSearchParams(`q=${text}`);
    mockSearchParams = searchParams;
    makeSut();

    const searchInput = screen.getByPlaceholderText(/buscar prompts.../i);
    expect(searchInput).toHaveValue(text);
  });
});
