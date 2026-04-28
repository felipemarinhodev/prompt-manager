import { SidebarContent } from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const makeSut = () => {
  render(<SidebarContent />);
};

describe('SidebarContent', () => {
  it('should render the button to create a new prompt', () => {
    makeSut();
    expect(screen.getByRole('complementary')).toBeVisible();
    expect(
      screen.getByRole('button', { name: /novo prompt/i })
    ).toBeInTheDocument();
  });
});

describe('SidebarContent - Collapsed State', () => {
  const user = userEvent.setup();
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
