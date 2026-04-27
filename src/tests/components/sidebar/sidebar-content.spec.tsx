import { SidebarContent } from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('SidebarContent', () => {
  it('should render the button to create a new prompt', () => {
    render(<SidebarContent />);
    expect(screen.getByRole('complementary')).toBeVisible();
    expect(
      screen.getByRole('button', { name: /novo prompt/i })
    ).toBeInTheDocument();
  });
});
