/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import Card from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card Content</Card>);

    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  describe('theme variants', () => {
    it('applies light theme by default', () => {
      const { container } = render(<Card>Content</Card>);

      expect(container.firstChild).toHaveClass('bg-white');
    });

    it('applies dark theme classes', () => {
      const { container } = render(<Card theme="dark">Content</Card>);

      expect(container.firstChild).toHaveClass('bg-luminex-card-50');
    });
  });

  describe('card variants', () => {
    it('applies default variant by default', () => {
      const { container } = render(<Card>Content</Card>);

      expect(container.firstChild).toHaveClass('rounded-xl');
    });

    it('applies inline variant classes', () => {
      const { container } = render(<Card variant="inline">Content</Card>);

      expect(container.firstChild).toHaveClass('border-b');
    });

    it('applies dark inline variant', () => {
      const { container } = render(
        <Card theme="dark" variant="inline">
          Content
        </Card>
      );

      expect(container.firstChild).toHaveClass('border-white/10');
    });

    it('applies light inline variant', () => {
      const { container } = render(
        <Card theme="light" variant="inline">
          Content
        </Card>
      );

      expect(container.firstChild).toHaveClass('border-gray-200');
    });
  });

  it('accepts custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
