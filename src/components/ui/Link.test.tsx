/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import Link from './Link';

describe('Link', () => {
  it('renders children', () => {
    render(<Link href="#">Link Text</Link>);

    expect(screen.getByText('Link Text')).toBeInTheDocument();
  });

  it('renders as an anchor element', () => {
    render(<Link href="https://example.com">Link</Link>);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  describe('theme variants', () => {
    it('applies light theme by default', () => {
      render(<Link href="#">Link</Link>);

      expect(screen.getByRole('link')).toHaveClass('text-blue-600');
    });

    it('applies dark theme classes', () => {
      render(
        <Link href="#" theme="dark">
          Link
        </Link>
      );

      expect(screen.getByRole('link')).toHaveClass('text-accent-cyan');
    });
  });

  describe('link variants', () => {
    it('applies primary variant by default', () => {
      render(<Link href="#">Link</Link>);

      expect(screen.getByRole('link')).toHaveClass('text-blue-600');
    });

    it('applies secondary variant classes for light theme', () => {
      render(
        <Link href="#" variant="secondary">
          Link
        </Link>
      );

      expect(screen.getByRole('link')).toHaveClass('text-gray-600');
    });

    it('applies secondary variant classes for dark theme', () => {
      render(
        <Link href="#" theme="dark" variant="secondary">
          Link
        </Link>
      );

      expect(screen.getByRole('link')).toHaveClass('text-white/50');
    });

    it('applies primary dark variant', () => {
      render(
        <Link href="#" theme="dark" variant="primary">
          Link
        </Link>
      );

      expect(screen.getByRole('link')).toHaveClass('text-accent-cyan');
    });
  });

  it('accepts custom className', () => {
    render(
      <Link className="custom-class" href="#">
        Link
      </Link>
    );

    expect(screen.getByRole('link')).toHaveClass('custom-class');
  });

  it('passes through additional anchor attributes', () => {
    render(
      <Link href="https://example.com" rel="noopener" target="_blank">
        External Link
      </Link>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
  });
});
