/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ApplePayButton from './ApplePayButton';

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: { [key: string]: unknown; alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...props} />
  ),
}));

// Mock asset URL helper
jest.mock('@/lib/utils/asset-url', () => ({
  assetUrl: (path: string) => path,
}));

describe('ApplePayButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders button with Apple Pay image', () => {
      render(<ApplePayButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      const image = screen.getByAltText('Apple Pay');

      expect(button).toBeInTheDocument();
      expect(image).toBeInTheDocument();
    });

    it('renders with light variant by default', () => {
      render(<ApplePayButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-black');
      expect(button).toHaveClass('text-white');
    });

    it('renders with dark variant styling', () => {
      render(<ApplePayButton onClick={mockOnClick} variant="dark" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('text-black');
    });

    it('uses correct icon for light variant', () => {
      render(<ApplePayButton onClick={mockOnClick} variant="light" />);

      const image = screen.getByAltText('Apple Pay');
      expect(image).toHaveAttribute('src', '/images/apple-pay-icon.png');
    });

    it('uses correct icon for dark variant', () => {
      render(<ApplePayButton onClick={mockOnClick} variant="dark" />);

      const image = screen.getByAltText('Apple Pay');
      expect(image).toHaveAttribute('src', '/images/apple-pay-icon-black.svg');
    });
  });

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      render(<ApplePayButton onClick={mockOnClick} />);

      await user.click(screen.getByRole('button'));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      render(<ApplePayButton disabled onClick={mockOnClick} />);

      await user.click(screen.getByRole('button'));

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('applies disabled attribute when disabled', () => {
      render(<ApplePayButton disabled onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies disabled styles when disabled', () => {
      render(<ApplePayButton disabled onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('is not disabled by default', () => {
      render(<ApplePayButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has type button', () => {
      render(<ApplePayButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('has appropriate data attributes for tracking', () => {
      render(<ApplePayButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-element_id', 'apple_pay');
      expect(button).toHaveAttribute('data-element_type', 'button');
      expect(button).toHaveAttribute('data-page_section', 'express_checkout');
    });
  });
});
