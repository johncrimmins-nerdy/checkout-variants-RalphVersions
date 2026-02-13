/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PayPalButton from './PayPalButton';

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

describe('PayPalButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders button with PayPal image', () => {
      render(<PayPalButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      const image = screen.getByAltText('PayPal');

      expect(button).toBeInTheDocument();
      expect(image).toBeInTheDocument();
    });

    it('renders with PayPal yellow background', () => {
      render(<PayPalButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[#FFC439]');
    });

    it('uses correct PayPal logo', () => {
      render(<PayPalButton onClick={mockOnClick} />);

      const image = screen.getByAltText('PayPal');
      expect(image).toHaveAttribute('src', '/images/paypal-button-checkout-logo.svg');
    });
  });

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      render(<PayPalButton onClick={mockOnClick} />);

      await user.click(screen.getByRole('button'));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      render(<PayPalButton disabled onClick={mockOnClick} />);

      await user.click(screen.getByRole('button'));

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('applies disabled attribute when disabled', () => {
      render(<PayPalButton disabled onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies disabled styles when disabled', () => {
      render(<PayPalButton disabled onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('is not disabled by default', () => {
      render(<PayPalButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has type button', () => {
      render(<PayPalButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});
