import {
  SidebarContent,
  type SidebarContentProps,
} from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
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
});
