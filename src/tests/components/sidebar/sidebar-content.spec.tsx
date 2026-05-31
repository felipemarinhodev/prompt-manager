import {
  SidebarContent,
  type SidebarContentProps,
} from '@/components/sidebar/sidebar-content';
import { render, screen, waitFor } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

jest.mock('@/app/actions/prompt.actions', () => ({
  searchPromptAction: jest
    .fn()
    .mockResolvedValue({ success: true, prompts: [] }),
}));

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const setQueryMock = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('nuqs', () => ({
  useQueryState: (key: string) => {
    const [value, setValue] = useState(mockSearchParams.get(key) ?? '');
    const setQuery = (nextValue: string) => {
      setQueryMock(nextValue);
      setValue(nextValue);
    };
    return [value, setQuery] as const;
  },
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

  describe('SidebarContent - Responsiveness', () => {
    it('should render the button to open the menu on mobile and open and close the menu when clicked', async () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      expect(aside.className).toMatch('-translate-x-full');

      const openButton = screen.getByRole('button', { name: /abrir menu/i });
      await user.click(openButton);

      expect(aside.className).toMatch('translate-x-0');

      const closeButton = screen.getByRole('button', { name: /fechar menu/i });
      await user.click(closeButton);

      expect(aside.className).toMatch('-translate-x-full');
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
    it('should expand the sidebar when the expand button is clicked', async () => {
      makeSut();
      const collapseButton = screen.getByRole('button', {
        name: /Minimizar sidebar/i,
      });
      await user.click(collapseButton);

      const expandButton = screen.getByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).toBeVisible();
      await user.click(expandButton);

      expect(
        screen.getByRole('button', {
          name: /Minimizar sidebar/i,
        })
      ).toBeVisible();
      expect(
        screen.queryByRole('button', {
          name: /expandir sidebar/i,
        })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('navigation', { name: /lista de prompts/i })
      ).toBeInTheDocument();
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
      expect(setQueryMock).toHaveBeenCalled();

      const lastCall = setQueryMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe(text);

      await user.clear(searchInput);
      const lastClearCall = setQueryMock.mock.calls.at(-1);
      expect(lastClearCall?.[0]).toBe('');
    });
    it('should submit the form when the user types in the search field', async () => {
      const submitSpy = jest
        .spyOn(HTMLFormElement.prototype, 'requestSubmit')
        .mockImplementation(() => undefined);
      makeSut();

      const searchInput = screen.getByPlaceholderText(/buscar prompts.../i);
      await user.type(searchInput, 'IA');
      expect(submitSpy).toHaveBeenCalled();
      submitSpy.mockRestore();
    });
    it('should clear the URL when the user clears the search field', async () => {
      makeSut();
      const text = 'A B';
      const searchInput = screen.getByPlaceholderText(/buscar prompts.../i);
      await user.type(searchInput, text);
      await user.clear(searchInput);

      const lastCall = setQueryMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe('');
    });
  });

  it('should automatically submit when assembling a query if there is one', async () => {
    const submitSpy = jest
      .spyOn(HTMLFormElement.prototype, 'requestSubmit')
      .mockImplementation(() => undefined);

    const text = 'text';
    const searchParams = new URLSearchParams(`q=${text}`);
    mockSearchParams = searchParams;
    makeSut();

    expect(submitSpy).toHaveBeenCalled();
    submitSpy.mockRestore();
  });

  it('should initialize the search field with the query from the URL', async () => {
    const text = 'ABC';
    const searchParams = new URLSearchParams(`q=${text}`);
    mockSearchParams = searchParams;
    makeSut();

    const searchInput = screen.getByPlaceholderText(/buscar prompts.../i);
    await waitFor(() => expect(searchInput).toHaveValue(text));
  });
});
