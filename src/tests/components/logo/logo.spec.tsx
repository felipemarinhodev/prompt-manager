import { Logo } from '@/components/logo';
import { render, screen } from '@/lib/test-utils';

describe('Logo', () => {
  it('should render the logo component and should redirect to the homepage on click', () => {
    render(<Logo />);

    const link = screen.getByRole('link', { name: /PROMPTs/i });

    expect(link).toBeVisible();
    expect(link).toHaveAttribute('href', '/');
  });
});
