/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SavedPaymentMethodType } from '@/lib/api/checkout-details';

import PaymentMethodSelection from './PaymentMethodSelection';

// Mock payment method components
jest.mock('../payment-methods/ApplePayButton', () => ({
  __esModule: true,
  default: ({
    disabled,
    onClick,
  }: {
    disabled?: boolean;
    onClick: () => void;
    variant?: string;
  }) => (
    <button data-testid="apple-pay-button" disabled={disabled} onClick={onClick}>
      Apple Pay
    </button>
  ),
}));

jest.mock('../payment-methods/GooglePayButton', () => ({
  __esModule: true,
  default: ({
    disabled,
    onClick,
  }: {
    disabled?: boolean;
    onClick: () => void;
    variant?: string;
  }) => (
    <button data-testid="google-pay-button" disabled={disabled} onClick={onClick}>
      Google Pay
    </button>
  ),
}));

jest.mock('../payment-methods/CreditCardButton', () => ({
  __esModule: true,
  default: ({
    disabled,
    onClick,
  }: {
    disabled?: boolean;
    onClick: () => void;
    variant?: string;
  }) => (
    <button data-testid="credit-card-button" disabled={disabled} onClick={onClick}>
      Credit Card
    </button>
  ),
}));

jest.mock('../payment-forms/PayPalPayment', () => ({
  __esModule: true,
  default: ({
    disabled,
    onComplete,
  }: {
    amount: string;
    currencyCode: string;
    disabled?: boolean;
    isVisible?: boolean;
    onCancel: () => void;
    onComplete: (
      nonce: string,
      details: { email: string; firstName: string; lastName: string; zipCode: string }
    ) => void;
    onError: (error: Error) => void;
    skipTermsValidation?: boolean;
  }) => (
    <button
      data-testid="paypal-button"
      disabled={disabled}
      onClick={() =>
        onComplete('paypal-nonce', {
          email: 'paypal@test.com',
          firstName: 'PayPal',
          lastName: 'User',
          zipCode: '12345',
        })
      }
    >
      PayPal
    </button>
  ),
}));

describe('PaymentMethodSelection', () => {
  const defaultProps = {
    amount: '99.00',
    currencyCode: 'USD',
    onPayPalCancel: jest.fn(),
    onPayPalComplete: jest.fn(),
    onPayPalError: jest.fn(),
    onSelectApplePay: jest.fn(),
    onSelectCreditCard: jest.fn(),
    onSelectGooglePay: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Reset navigator.userAgent to default (non-Android)
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      writable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('renders title', () => {
      render(<PaymentMethodSelection {...defaultProps} />);

      expect(screen.getByText('Select your payment method')).toBeInTheDocument();
    });

    it('renders all payment method buttons', () => {
      render(<PaymentMethodSelection {...defaultProps} />);

      expect(screen.getByTestId('apple-pay-button')).toBeInTheDocument();
      expect(screen.getByTestId('google-pay-button')).toBeInTheDocument();
      expect(screen.getByTestId('paypal-button')).toBeInTheDocument();
      expect(screen.getByTestId('credit-card-button')).toBeInTheDocument();
    });

    it('renders with light variant by default', () => {
      render(<PaymentMethodSelection {...defaultProps} />);

      const title = screen.getByText('Select your payment method');
      expect(title).toHaveClass('text-brand-text');
    });

    it('renders with dark variant styling', () => {
      render(<PaymentMethodSelection {...defaultProps} variant="dark" />);

      const title = screen.getByText('Select your payment method');
      expect(title).toHaveClass('text-white');
    });

    it('hides Apple Pay on Android devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
        writable: true,
      });

      render(<PaymentMethodSelection {...defaultProps} />);

      expect(screen.queryByTestId('apple-pay-button')).not.toBeInTheDocument();
    });

    it('shows Apple Pay on non-Android devices', () => {
      render(<PaymentMethodSelection {...defaultProps} />);

      expect(screen.getByTestId('apple-pay-button')).toBeInTheDocument();
    });
  });

  describe('payment method selection', () => {
    it('calls onSelectApplePay when Apple Pay is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PaymentMethodSelection {...defaultProps} />);

      await user.click(screen.getByTestId('apple-pay-button'));

      expect(defaultProps.onSelectApplePay).toHaveBeenCalled();
    });

    it('calls onSelectGooglePay when Google Pay is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PaymentMethodSelection {...defaultProps} />);

      await user.click(screen.getByTestId('google-pay-button'));

      expect(defaultProps.onSelectGooglePay).toHaveBeenCalled();
    });

    it('calls onSelectCreditCard when Credit Card is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PaymentMethodSelection {...defaultProps} />);

      await user.click(screen.getByTestId('credit-card-button'));

      expect(defaultProps.onSelectCreditCard).toHaveBeenCalled();
    });

    it('calls onPayPalComplete with nonce and details', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PaymentMethodSelection {...defaultProps} />);

      await user.click(screen.getByTestId('paypal-button'));

      expect(defaultProps.onPayPalComplete).toHaveBeenCalledWith('paypal-nonce', {
        email: 'paypal@test.com',
        firstName: 'PayPal',
        lastName: 'User',
        zipCode: '12345',
      });
    });
  });

  describe('processing state', () => {
    it('disables buttons while processing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PaymentMethodSelection {...defaultProps} />);

      await user.click(screen.getByTestId('apple-pay-button'));

      // Buttons should be disabled immediately after click
      expect(screen.getByTestId('apple-pay-button')).toBeDisabled();
      expect(screen.getByTestId('google-pay-button')).toBeDisabled();
      expect(screen.getByTestId('credit-card-button')).toBeDisabled();
    });

    it('re-enables buttons after timeout', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PaymentMethodSelection {...defaultProps} />);

      await user.click(screen.getByTestId('apple-pay-button'));

      // Buttons disabled
      expect(screen.getByTestId('apple-pay-button')).toBeDisabled();

      // Fast-forward 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Buttons should be enabled again
      expect(screen.getByTestId('apple-pay-button')).not.toBeDisabled();
    });

    it('resets processing state when visibility changes to hidden', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { rerender } = render(<PaymentMethodSelection {...defaultProps} isVisible />);

      // Click a button to trigger processing state
      await user.click(screen.getByTestId('apple-pay-button'));

      // Buttons should be disabled (processing)
      expect(screen.getByTestId('apple-pay-button')).toBeDisabled();

      // Hide the component (before the 1-second timeout)
      rerender(<PaymentMethodSelection {...defaultProps} isVisible={false} />);

      // Show the component again
      rerender(<PaymentMethodSelection {...defaultProps} isVisible />);

      // Buttons should be enabled - processing state was reset
      expect(screen.getByTestId('apple-pay-button')).not.toBeDisabled();
      expect(screen.getByTestId('google-pay-button')).not.toBeDisabled();
      expect(screen.getByTestId('credit-card-button')).not.toBeDisabled();
    });

    it('cancels stale timeouts when visibility changes to prevent race condition', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { rerender } = render(<PaymentMethodSelection {...defaultProps} isVisible />);

      // Step 1: Click Apple Pay (starts 1s timeout)
      await user.click(screen.getByTestId('apple-pay-button'));
      expect(screen.getByTestId('apple-pay-button')).toBeDisabled();

      // Step 2: Advance 500ms (timeout still pending)
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Step 3: Hide the component (should clear the pending timeout)
      rerender(<PaymentMethodSelection {...defaultProps} isVisible={false} />);

      // Step 4: Show the component again immediately
      rerender(<PaymentMethodSelection {...defaultProps} isVisible />);

      // Step 5: Click Credit Card (starts a new 1s timeout)
      await user.click(screen.getByTestId('credit-card-button'));
      expect(screen.getByTestId('credit-card-button')).toBeDisabled();

      // Step 6: Advance 600ms (would trigger the stale Apple Pay timeout if not cleared)
      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Buttons should STILL be disabled - the stale timeout shouldn't have reset processing
      // (1100ms total has passed, so original timeout would have fired at 1000ms)
      expect(screen.getByTestId('credit-card-button')).toBeDisabled();

      // Step 7: Advance remaining 400ms to complete Credit Card's timeout
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Now buttons should be enabled
      expect(screen.getByTestId('credit-card-button')).not.toBeDisabled();
    });
  });

  describe('saved payment method', () => {
    const savedPaymentMethod = {
      cardBrand: 'Visa',
      expirationDate: '12/25',
      id: 'pm-123',
      lastFourDigits: '4242',
      type: SavedPaymentMethodType.CREDIT_CARD,
    };

    it('does not show saved payment notice when no saved method', () => {
      render(<PaymentMethodSelection {...defaultProps} />);

      expect(screen.queryByText(/You have a saved payment method/)).not.toBeInTheDocument();
    });

    it('does not show saved payment notice when no callback', () => {
      render(<PaymentMethodSelection {...defaultProps} savedPaymentMethod={savedPaymentMethod} />);

      expect(screen.queryByText(/You have a saved payment method/)).not.toBeInTheDocument();
    });

    it('shows saved payment notice when both method and callback are provided', () => {
      const onUseSavedPayment = jest.fn();

      render(
        <PaymentMethodSelection
          {...defaultProps}
          onUseSavedPayment={onUseSavedPayment}
          savedPaymentMethod={savedPaymentMethod}
        />
      );

      expect(screen.getByText('You have a saved payment method')).toBeInTheDocument();
      expect(screen.getByText(/Use saved payment/)).toBeInTheDocument();
      expect(screen.getByText(/Visa/)).toBeInTheDocument();
      expect(screen.getByText(/4242/)).toBeInTheDocument();
    });

    it('calls onUseSavedPayment when link is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onUseSavedPayment = jest.fn();

      render(
        <PaymentMethodSelection
          {...defaultProps}
          onUseSavedPayment={onUseSavedPayment}
          savedPaymentMethod={savedPaymentMethod}
        />
      );

      await user.click(screen.getByText(/Use saved payment/));

      expect(onUseSavedPayment).toHaveBeenCalled();
    });

    it('applies light theme styling to saved payment notice', () => {
      const onUseSavedPayment = jest.fn();

      const { container } = render(
        <PaymentMethodSelection
          {...defaultProps}
          onUseSavedPayment={onUseSavedPayment}
          savedPaymentMethod={savedPaymentMethod}
          variant="light"
        />
      );

      // Check that light theme classes exist in the container
      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      const noticeDiv = container.querySelector('.border-blue-200');
      expect(noticeDiv).toBeInTheDocument();
      expect(noticeDiv).toHaveClass('bg-blue-50');
    });

    it('applies dark theme styling to saved payment notice', () => {
      const onUseSavedPayment = jest.fn();

      render(
        <PaymentMethodSelection
          {...defaultProps}
          onUseSavedPayment={onUseSavedPayment}
          savedPaymentMethod={savedPaymentMethod}
          variant="dark"
        />
      );

      // Check that saved payment link has dark theme styling
      const savedPaymentLink = screen.getByRole('button', { name: /use saved payment/i });
      expect(savedPaymentLink).toHaveClass('text-blue-400');
    });
  });

  describe('visibility', () => {
    it('sets aria-hidden false when visible', () => {
      const { container } = render(<PaymentMethodSelection {...defaultProps} isVisible={true} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveAttribute('aria-hidden', 'false');
    });

    it('sets aria-hidden true when not visible', () => {
      const { container } = render(<PaymentMethodSelection {...defaultProps} isVisible={false} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveAttribute('aria-hidden', 'true');
    });

    it('defaults to visible', () => {
      const { container } = render(<PaymentMethodSelection {...defaultProps} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveAttribute('aria-hidden', 'false');
    });
  });

  describe('props passing', () => {
    it('passes amount and currencyCode to PayPal', () => {
      // PayPal mock receives these props - verify component renders
      render(<PaymentMethodSelection {...defaultProps} amount="199.99" currencyCode="EUR" />);

      expect(screen.getByTestId('paypal-button')).toBeInTheDocument();
    });

    it('passes skipTermsValidation to PayPal', () => {
      render(<PaymentMethodSelection {...defaultProps} skipTermsValidation={true} />);

      expect(screen.getByTestId('paypal-button')).toBeInTheDocument();
    });
  });
});
