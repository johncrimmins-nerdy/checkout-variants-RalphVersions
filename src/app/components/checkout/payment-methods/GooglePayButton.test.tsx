/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import GooglePayButton from './GooglePayButton';

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

describe('GooglePayButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders button with Google Pay image', () => {
      render(<GooglePayButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      const image = screen.getByAltText('Google Pay');

      expect(button).toBeInTheDocument();
      expect(image).toBeInTheDocument();
    });

    it('renders with light variant by default', () => {
      render(<GooglePayButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-black');
      expect(button).toHaveClass('text-white');
    });

    it('renders with dark variant styling', () => {
      render(<GooglePayButton onClick={mockOnClick} variant="dark" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('text-black');
    });

    it('uses correct icon for light variant', () => {
      render(<GooglePayButton onClick={mockOnClick} variant="light" />);

      const image = screen.getByAltText('Google Pay');
      expect(image).toHaveAttribute('src', '/images/google-pay-logo.png');
    });

    it('uses correct icon for dark variant', () => {
      render(<GooglePayButton onClick={mockOnClick} variant="dark" />);

      const image = screen.getByAltText('Google Pay');
      expect(image).toHaveAttribute('src', '/images/google-pay-icon-black.svg');
    });
  });

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      render(<GooglePayButton onClick={mockOnClick} />);

      await user.click(screen.getByRole('button'));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      render(<GooglePayButton disabled onClick={mockOnClick} />);

      await user.click(screen.getByRole('button'));

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('applies disabled attribute when disabled', () => {
      render(<GooglePayButton disabled onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies disabled styles when disabled', () => {
      render(<GooglePayButton disabled onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('is not disabled by default', () => {
      render(<GooglePayButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has type button', () => {
      render(<GooglePayButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('has appropriate data attributes for tracking', () => {
      render(<GooglePayButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-element_id', 'google_pay');
      expect(button).toHaveAttribute('data-element_type', 'button');
      expect(button).toHaveAttribute('data-page_section', 'express_checkout');
    });
  });
});
