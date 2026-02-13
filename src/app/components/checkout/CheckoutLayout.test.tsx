/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import CheckoutLayout from './CheckoutLayout';

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: { [key: string]: unknown; alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...props} />
  ),
}));

// Mock CheckoutHero component
jest.mock('@/app/components/checkout/CheckoutHero', () => ({
  __esModule: true,
  default: () => <div data-testid="checkout-hero">Checkout Hero</div>,
}));

// Mock EscapeHatchButton component
jest.mock('@/app/components/checkout/EscapeHatchButton', () => ({
  __esModule: true,
  default: () => (
    <button data-testid="escape-hatch-button" type="button">
      ?
    </button>
  ),
}));

// Mock Container component
jest.mock('@/components/layout', () => ({
  Container: ({
    children,
    className,
    maxWidth,
  }: {
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
  }) => (
    <div className={className} data-maxwidth={maxWidth} data-testid="container">
      {children}
    </div>
  ),
}));

// Mock asset URL helper
jest.mock('@/lib/utils/asset-url', () => ({
  assetUrl: (path: string) => path,
}));

describe('CheckoutLayout', () => {
  describe('rendering', () => {
    it('renders children content', () => {
      render(
        <CheckoutLayout>
          <div data-testid="checkout-form">Form Content</div>
        </CheckoutLayout>
      );

      expect(screen.getByTestId('checkout-form')).toBeInTheDocument();
      expect(screen.getByText('Form Content')).toBeInTheDocument();
    });

    it('renders Varsity Tutors logo in header', () => {
      render(
        <CheckoutLayout>
          <div>Content</div>
        </CheckoutLayout>
      );

      const logo = screen.getByAltText('Varsity Tutors');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/images/vt-logo.svg');
    });

    it('renders CheckoutHero component', () => {
      render(
        <CheckoutLayout>
          <div>Content</div>
        </CheckoutLayout>
      );

      expect(screen.getByTestId('checkout-hero')).toBeInTheDocument();
    });

    it('renders Container with correct maxWidth', () => {
      render(
        <CheckoutLayout>
          <div>Content</div>
        </CheckoutLayout>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveAttribute('data-maxwidth', '1440px');
    });

    it('renders escape hatch button', () => {
      render(
        <CheckoutLayout>
          <div>Content</div>
        </CheckoutLayout>
      );

      expect(screen.getByTestId('escape-hatch-button')).toBeInTheDocument();
    });
  });

  describe('layout structure', () => {
    it('has correct header styling', () => {
      const { container } = render(
        <CheckoutLayout>
          <div>Content</div>
        </CheckoutLayout>
      );

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      const header = container.querySelector('header');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('border-gray-200');
      expect(header).toHaveClass('bg-white');
    });
  });

  describe('accessibility', () => {
    it('has semantic header element', () => {
      const { container } = render(
        <CheckoutLayout>
          <div>Content</div>
        </CheckoutLayout>
      );

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });
  });
});
