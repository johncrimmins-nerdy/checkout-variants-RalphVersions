/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';

import Spinner from './Spinner';

describe('Spinner', () => {
  it('renders a spinning element', () => {
    const { container } = render(<Spinner />);

    expect(container.firstChild).toHaveClass('animate-spin', 'rounded-full');
  });

  describe('size variants', () => {
    it('applies medium size by default', () => {
      const { container } = render(<Spinner />);

      expect(container.firstChild).toHaveClass('h-12', 'w-12', 'border-4');
    });

    it('applies small size', () => {
      const { container } = render(<Spinner size="sm" />);

      expect(container.firstChild).toHaveClass('h-5', 'w-5', 'border-2');
    });

    it('applies large size', () => {
      const { container } = render(<Spinner size="lg" />);

      expect(container.firstChild).toHaveClass('h-16', 'w-16', 'border-4');
    });
  });

  describe('theme variants', () => {
    it('applies light theme by default', () => {
      const { container } = render(<Spinner />);

      expect(container.firstChild).toHaveClass('border-gray-200', 'border-t-brand-selection');
    });

    it('applies dark theme classes', () => {
      const { container } = render(<Spinner theme="dark" />);

      expect(container.firstChild).toHaveClass('border-white/20', 'border-t-accent-cyan');
    });
  });

  it('accepts custom className', () => {
    const { container } = render(<Spinner className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
