/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';

import PayPalPayment from './PayPalPayment';

// Mock dependencies
jest.mock('@/lib/analytics', () => ({
  trackElementClicked: jest.fn(),
}));

const mockInitPayPal = jest.fn();
jest.mock('@/lib/payment/init-paypal', () => ({
  initPayPal: (client: unknown) => mockInitPayPal(client),
}));

const mockUseBraintreeClient = jest.fn();
jest.mock('@/lib/payment/useBraintreeClient', () => ({
  useBraintreeClient: () => mockUseBraintreeClient(),
}));

jest.mock('@/lib/utils/asset-url', () => ({
  assetUrl: (path: string) => `/checkout${path}`,
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { alt: string; src: string }) => <img alt={props.alt} src={props.src} />,
}));

describe('PayPalPayment', () => {
  const defaultProps = {
    amount: '99.99',
    currencyCode: 'USD',
    disabled: false,
    onCancel: jest.fn(),
    onComplete: jest.fn(),
    onError: jest.fn(),
  };

  const mockPaypalInstance = {
    createPayment: jest.fn().mockResolvedValue('payment-id'),
    tokenizePayment: jest.fn().mockResolvedValue({
      details: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        shippingAddress: { postalCode: '12345' },
      },
      nonce: 'paypal-nonce',
    }),
  };

  const mockPaypalButtons = jest.fn().mockReturnValue({
    render: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for Braintree client
    mockUseBraintreeClient.mockReturnValue({
      client: { getVersion: jest.fn() },
      error: null,
      isLoading: false,
    });

    // Default mock for PayPal init
    mockInitPayPal.mockResolvedValue(mockPaypalInstance);

    // Mock PayPal SDK on window
    Object.defineProperty(window, 'paypal', {
      configurable: true,
      value: {
        Buttons: mockPaypalButtons,
      },
      writable: true,
    });
  });

  afterEach(() => {
    (window as { paypal?: unknown }).paypal = undefined;
  });

  it('shows loading placeholder while Braintree client is loading', () => {
    mockUseBraintreeClient.mockReturnValue({
      client: null,
      error: null,
      isLoading: true,
    });

    render(<PayPalPayment {...defaultProps} />);

    // Should show PayPal placeholder image
    expect(screen.getByRole('img', { name: 'PayPal' })).toBeInTheDocument();
  });

  it('shows loading placeholder while PayPal initializes', () => {
    render(<PayPalPayment {...defaultProps} />);

    // Initially shows placeholder
    expect(screen.getByRole('img', { name: 'PayPal' })).toBeInTheDocument();
  });

  it('initializes PayPal when Braintree client is available', async () => {
    render(<PayPalPayment {...defaultProps} />);

    await waitFor(() => {
      expect(mockInitPayPal).toHaveBeenCalled();
    });
  });

  it('renders PayPal button container with correct attributes', () => {
    const { container } = render(<PayPalPayment {...defaultProps} />);

    // Check data attributes are present in the rendered HTML
    expect(container.innerHTML).toContain('data-element_id="paypal_button"');
    expect(container.innerHTML).toContain('data-element_type="button"');
    expect(container.innerHTML).toContain('data-page_section="express_checkout"');
  });

  it('sets aria-hidden based on isVisible prop', () => {
    const { container, rerender } = render(<PayPalPayment {...defaultProps} isVisible />);

    // Check aria-hidden attribute
    expect(container.innerHTML).toContain('aria-hidden="false"');

    rerender(<PayPalPayment {...defaultProps} isVisible={false} />);
    expect(container.innerHTML).toContain('aria-hidden="true"');
  });

  it('applies disabled styles when disabled prop is true', async () => {
    const { container } = render(<PayPalPayment {...defaultProps} disabled />);

    // The container with ref should have disabled styles
    // The component applies 'pointer-events-none' class when disabled
    expect(container.innerHTML).toContain('pointer-events-none');
  });

  it('does not initialize PayPal when Braintree client is not available', () => {
    mockUseBraintreeClient.mockReturnValue({
      client: null,
      error: null,
      isLoading: false,
    });

    render(<PayPalPayment {...defaultProps} />);

    expect(mockInitPayPal).not.toHaveBeenCalled();
  });

  it('handles PayPal SDK not loading', async () => {
    (window as { paypal?: unknown }).paypal = undefined;

    // We need to simulate the timeout scenario
    jest.useFakeTimers();

    render(<PayPalPayment {...defaultProps} />);

    // Fast-forward through the waiting period
    for (let i = 0; i < 50; i++) {
      jest.advanceTimersByTime(100);
    }

    jest.useRealTimers();

    // PayPal init should have been called but SDK wasn't available
    // Component should still render without crashing
    expect(screen.getByRole('img', { name: 'PayPal' })).toBeInTheDocument();
  });

  describe('PayPal button callbacks', () => {
    it('calls PayPal.Buttons with correct configuration', async () => {
      render(<PayPalPayment {...defaultProps} />);

      await waitFor(() => {
        expect(mockPaypalButtons).toHaveBeenCalled();
      });

      const buttonsConfig = mockPaypalButtons.mock.calls[0][0];

      expect(buttonsConfig).toHaveProperty('createBillingAgreement');
      expect(buttonsConfig).toHaveProperty('onApprove');
      expect(buttonsConfig).toHaveProperty('onCancel');
      expect(buttonsConfig).toHaveProperty('onError');
      expect(buttonsConfig).toHaveProperty('onInit');
      expect(buttonsConfig.fundingSource).toBe('paypal');
      expect(buttonsConfig.style).toEqual({
        borderRadius: 6,
        color: 'gold',
        height: 54,
        label: 'paypal',
      });
    });
  });
});
