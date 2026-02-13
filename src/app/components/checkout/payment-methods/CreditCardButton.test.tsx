/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreditCardButton from './CreditCardButton';

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    className,
    src,
    ...props
  }: {
    [key: string]: unknown;
    alt: string;
    className?: string;
    src: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} className={className} src={src} {...props} />
  ),
}));

// Mock asset URL helper
jest.mock('@/lib/utils/asset-url', () => ({
  assetUrl: (path: string) => path,
}));

describe('CreditCardButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders button with credit card text and icon', () => {
      render(<CreditCardButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /credit card/i });
      const image = screen.getByAltText('Credit Card');

      expect(button).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(screen.getByText('Credit Card')).toBeInTheDocument();
    });

    it('renders with light variant by default', () => {
      render(<CreditCardButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('border-black');
      expect(button).toHaveClass('text-brand-text');
    });

    it('renders with dark variant styling', () => {
      render(<CreditCardButton onClick={mockOnClick} variant="dark" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('border-white');
      expect(button).toHaveClass('text-white');
    });

    it('applies brightness filter to icon in light variant', () => {
      render(<CreditCardButton onClick={mockOnClick} variant="light" />);

      const image = screen.getByAltText('Credit Card');
      expect(image).toHaveClass('brightness-0');
    });

    it('does not apply brightness filter to icon in dark variant', () => {
      render(<CreditCardButton onClick={mockOnClick} variant="dark" />);

      const image = screen.getByAltText('Credit Card');
      expect(image).not.toHaveClass('brightness-0');
    });
  });

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      render(<CreditCardButton onClick={mockOnClick} />);

      await user.click(screen.getByRole('button'));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      render(<CreditCardButton disabled onClick={mockOnClick} />);

      await user.click(screen.getByRole('button'));

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('applies disabled attribute when disabled', () => {
      render(<CreditCardButton disabled onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies disabled styles when disabled', () => {
      render(<CreditCardButton disabled onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('is not disabled by default', () => {
      render(<CreditCardButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has type button', () => {
      render(<CreditCardButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('has appropriate data attributes for tracking', () => {
      render(<CreditCardButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-element_id', 'credit_card');
      expect(button).toHaveAttribute('data-element_type', 'button');
      expect(button).toHaveAttribute('data-page_section', 'express_checkout');
    });

    it('has accessible name from text content', () => {
      render(<CreditCardButton onClick={mockOnClick} />);

      expect(screen.getByRole('button', { name: /credit card/i })).toBeInTheDocument();
    });
  });
});
