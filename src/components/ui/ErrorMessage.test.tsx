/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders children', () => {
    render(<ErrorMessage>Something went wrong</ErrorMessage>);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  describe('theme variants', () => {
    it('applies light theme by default', () => {
      const { container } = render(<ErrorMessage>Error</ErrorMessage>);

      expect(container.firstChild).toHaveClass('bg-red-50');
      expect(screen.getByText('Error')).toHaveClass('text-red-700');
    });

    it('applies dark theme classes', () => {
      const { container } = render(<ErrorMessage theme="dark">Error</ErrorMessage>);

      expect(container.firstChild).toHaveClass('bg-red-500/20');
      expect(screen.getByText('Error')).toHaveClass('text-red-200');
    });
  });

  it('accepts custom className', () => {
    const { container } = render(<ErrorMessage className="custom-class">Error</ErrorMessage>);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has proper structure with container and text', () => {
    const { container } = render(<ErrorMessage>Error message</ErrorMessage>);

    // Container div with border and padding
    expect(container.firstChild).toHaveClass('rounded-lg', 'border', 'p-3');

    // Inner paragraph with text
    const paragraph = screen.getByText('Error message');
    expect(paragraph.tagName).toBe('P');
  });
});
