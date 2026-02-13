/**
 * @jest-environment jsdom
 */
import { act, render, screen, waitFor } from '@testing-library/react';

import type { CheckoutDetailsResponse, SavedPaymentMethodType } from '@/lib/api/checkout-details';

import { initApplePay } from '@/lib/payment/init-apple-pay';
import { initGooglePay } from '@/lib/payment/init-google-pay';
import { useBraintreeClient } from '@/lib/payment/useBraintreeClient';

import PaymentMethodSelector from './PaymentMethodSelector';

// Type the mocks
const mockInitApplePay = initApplePay as jest.Mock;
const mockInitGooglePay = initGooglePay as jest.Mock;
const mockUseBraintreeClient = useBraintreeClient as jest.Mock;

// Mock payment initialization modules
jest.mock('@/lib/payment/init-apple-pay', () => ({
  initApplePay: jest.fn(),
}));

jest.mock('@/lib/payment/init-google-pay', () => ({
  initGooglePay: jest.fn(),
}));

jest.mock('@/lib/payment/useBraintreeClient', () => ({
  useBraintreeClient: jest.fn(),
}));

// Mock all other dependencies
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { alt: string; src: string }) => <img alt={props.alt} src={props.src} />,
}));

jest.mock('@/hooks/use-flags', () => ({
  FLAGS: { ECOMM_587_PURCHASE_RETRY: 'ecomm_587_purchase_retry' },
  useFlags: () => ({}),
}));

jest.mock('@/lib/context/SessionContextProvider', () => ({
  useSessionContext: () => ({
    isLeadResubmissionFlow: false,
  }),
}));

jest.mock('@/lib/analytics', () => ({
  IntegrationError: class IntegrationError extends Error {},
  trackErrorWithContext: jest.fn(),
  UserBehaviorError: class UserBehaviorError extends Error {},
}));

import { purchaseMembership } from '@/lib/api/purchase-membership';

const mockPurchaseMembership = purchaseMembership as jest.Mock;
jest.mock('@/lib/api/purchase-membership', () => ({
  purchaseMembership: jest.fn(),
}));

jest.mock('@/lib/payment/utils', () => ({
  buildPurchaseArgs: jest.fn(),
  getEffectivePurchasable: jest.fn().mockReturnValue({
    currencyCode: 'USD',
    entitledHours: 4,
    id: 'test-purchasable',
    name: 'Test Package',
    priceCents: 29900,
    type: 'CATALOG_ITEM',
  }),
  isCardExpired: jest.fn().mockReturnValue(false),
  validateTermsAccepted: jest.fn(),
}));

jest.mock('@/lib/utils/checkout-helpers', () => ({
  getRedirectUrl: jest.fn().mockReturnValue('/success'),
}));

jest.mock('@/lib/utils/asset-url', () => ({
  assetUrl: (path: string) => `/checkout${path}`,
}));

// Mock RecaptchaService to avoid waiting for reCAPTCHA script
jest.mock('@/lib/services/recaptcha-service', () => ({
  __esModule: true,
  default: {
    execute: jest.fn().mockResolvedValue('mock-recaptcha-token'),
    init: jest.fn(),
    isReady: jest.fn().mockReturnValue(true),
  },
}));

// Track PaymentMethodSelection props for initialization state tests and handler access
let capturedPaymentMethodSelectionProps: {
  isApplePayInitializing?: boolean;
  isGooglePayInitializing?: boolean;
  onPayPalComplete?: (
    nonce: string,
    details: { email: string; firstName: string; lastName: string; zipCode: string }
  ) => void;
  onSelectApplePay?: () => void;
  onSelectGooglePay?: () => void;
} = {};

// Mock child components
jest.mock('@/app/components/checkout/payment-forms/CreditCardForm', () => ({
  __esModule: true,
  default: () => <div data-testid="credit-card-form">Credit Card Form</div>,
}));

jest.mock('@/app/components/checkout/payment-states/GuestSignIn', () => ({
  __esModule: true,
  default: ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => (
    <div data-testid="guest-sign-in" onClick={onLoginSuccess}>
      Guest Sign In
    </div>
  ),
}));

jest.mock('@/app/components/checkout/payment-states/PaymentMethodSelection', () => ({
  __esModule: true,
  default: (props: {
    isApplePayInitializing?: boolean;
    isGooglePayInitializing?: boolean;
    onPayPalComplete?: (
      nonce: string,
      details: { email: string; firstName: string; lastName: string; zipCode: string }
    ) => void;
    onSelectApplePay?: () => void;
    onSelectGooglePay?: () => void;
  }) => {
    capturedPaymentMethodSelectionProps = props;
    return (
      <div
        data-apple-pay-initializing={props.isApplePayInitializing}
        data-google-pay-initializing={props.isGooglePayInitializing}
        data-testid="payment-method-selection"
      >
        Payment Method Selection
      </div>
    );
  },
}));

jest.mock('@/app/components/checkout/payment-states/SavedPaymentMethod', () => ({
  __esModule: true,
  default: () => <div data-testid="saved-payment-method">Saved Payment Method</div>,
}));

jest.mock('@/app/components/checkout/PricingCard', () => ({
  __esModule: true,
  default: () => <div data-testid="pricing-card">Pricing Card</div>,
}));

jest.mock('@/app/components/checkout/RecaptchaNotice', () => ({
  __esModule: true,
  default: () => <div data-testid="recaptcha-notice">Recaptcha Notice</div>,
}));

jest.mock('@/app/components/checkout/TermsCheckbox', () => ({
  __esModule: true,
  default: () => <div data-testid="terms-checkbox">Terms Checkbox</div>,
}));

// Create a fake Braintree client for testing
const mockBraintreeClient = { fake: 'braintree-client' };

// Create fake Apple Pay instance
const mockApplePayInstance = { fake: 'apple-pay-instance' };

// Create fake Google Pay instances
const mockGooglePayInstance = { fake: 'google-pay-instance' };
const mockGooglePayClient = { fake: 'google-pay-client' };

describe('PaymentMethodSelector', () => {
  beforeEach(() => {
    // Reset captured props
    capturedPaymentMethodSelectionProps = {};

    // Default: Braintree client is loading
    mockUseBraintreeClient.mockReturnValue({
      client: null,
      error: null,
      isLoading: true,
      reinitialize: jest.fn(),
    });

    // Default: Apple Pay resolves to undefined (not available)
    mockInitApplePay.mockResolvedValue(undefined);

    // Default: Google Pay resolves with null instances (not available)
    mockInitGooglePay.mockResolvedValue({
      googlePayClient: null,
      googlePayInstance: null,
    });

    // Default: Reset getEffectivePurchasable to return a non-package purchasable
    const { getEffectivePurchasable } = jest.requireMock('@/lib/payment/utils');
    getEffectivePurchasable.mockReturnValue({
      currencyCode: 'USD',
      entitledHours: 4,
      id: 'test-purchasable',
      name: 'Test Package',
      priceCents: 29900,
      type: 'CATALOG_ITEM',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const guestCheckoutData: CheckoutDetailsResponse = {
    __typename: 'CheckoutReadyForGuest',
    purchasable: {
      currencyCode: 'USD',
      entitledHours: 5,
      id: 'item-1',
      name: '5 Hours',
      priceCents: 25000,
      type: 'CATALOG_ITEM',
    },
  };

  const authenticatedCheckoutData: CheckoutDetailsResponse = {
    __typename: 'CheckoutReadyForAuthenticatedUser',
    buyer: { firstName: 'John', id: 'buyer-123' },
    purchasable: {
      currencyCode: 'USD',
      entitledHours: 10,
      id: 'item-2',
      name: '10 Hours',
      priceCents: 50000,
      type: 'CATALOG_ITEM',
    },
    savedPaymentMethod: {
      cardBrand: 'Visa',
      id: 'pm-1',
      lastFourDigits: '4242',
      type: 'CREDIT_CARD' as SavedPaymentMethodType,
    },
  };

  const autoAuthenticatedCheckoutData: CheckoutDetailsResponse = {
    __typename: 'CheckoutReady',
    buyer: { firstName: 'Jane', id: 'buyer-456' },
    purchasable: {
      currencyCode: 'USD',
      entitledHours: 5,
      id: 'item-3',
      name: '5 Hours',
      priceCents: 25000,
      type: 'CATALOG_ITEM',
    },
  };

  it('renders guest sign-in for CheckoutReadyForGuest', () => {
    render(<PaymentMethodSelector checkoutData={guestCheckoutData} />);

    expect(screen.getByTestId('guest-sign-in')).toBeInTheDocument();
    expect(screen.getByTestId('pricing-card')).toBeInTheDocument();
    expect(screen.getByTestId('terms-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('recaptcha-notice')).toBeInTheDocument();
  });

  it('renders saved payment method form for authenticated user with saved payment', () => {
    render(<PaymentMethodSelector checkoutData={authenticatedCheckoutData} />);

    // For authenticated users with saved payment, it should show saved payment method
    expect(screen.getByTestId('saved-payment-method')).toBeInTheDocument();
  });

  it('hides saved payment method for package purchases (backend does not support)', () => {
    // Mock getEffectivePurchasable to return a package
    const { getEffectivePurchasable } = jest.requireMock('@/lib/payment/utils');
    getEffectivePurchasable.mockReturnValue({
      currencyCode: 'USD',
      entitledHours: 10,
      hasInstallments: true,
      id: 'package-item',
      isPackage: true,
      name: 'Package 10 Hours',
      priceCents: 200000,
      type: 'QUOTE',
    });

    render(<PaymentMethodSelector checkoutData={authenticatedCheckoutData} />);

    // For packages, saved payment method should NOT be shown (backend limitation)
    // Should show payment method selection instead
    expect(screen.queryByTestId('saved-payment-method')).not.toBeInTheDocument();
    expect(screen.getByTestId('payment-method-selection')).toBeVisible();
  });

  it('hides saved payment method for quotes with installments', () => {
    // Mock getEffectivePurchasable to return a quote with installments (but not marked as package)
    const { getEffectivePurchasable } = jest.requireMock('@/lib/payment/utils');
    getEffectivePurchasable.mockReturnValue({
      currencyCode: 'USD',
      entitledHours: 10,
      hasInstallments: true,
      id: 'installment-item',
      isPackage: false,
      name: 'Installment Plan',
      priceCents: 200000,
      type: 'QUOTE',
    });

    render(<PaymentMethodSelector checkoutData={authenticatedCheckoutData} />);

    // For installment plans, saved payment method should NOT be shown (backend limitation)
    expect(screen.queryByTestId('saved-payment-method')).not.toBeInTheDocument();
    expect(screen.getByTestId('payment-method-selection')).toBeVisible();
  });

  it('renders payment method selection for auto-authenticated user', () => {
    render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

    expect(screen.getByTestId('payment-method-selection')).toBeInTheDocument();
  });

  it('hides pricing card when hidePricingCard is true', () => {
    render(<PaymentMethodSelector checkoutData={guestCheckoutData} hidePricingCard />);

    expect(screen.queryByTestId('pricing-card')).not.toBeInTheDocument();
  });

  it('shows pricing card by default', () => {
    render(<PaymentMethodSelector checkoutData={guestCheckoutData} />);

    expect(screen.getByTestId('pricing-card')).toBeInTheDocument();
  });

  it('shows recaptcha notice', () => {
    render(<PaymentMethodSelector checkoutData={guestCheckoutData} />);

    expect(screen.getByTestId('recaptcha-notice')).toBeInTheDocument();
  });

  describe('theme variants', () => {
    it('applies light theme by default', () => {
      const { container } = render(<PaymentMethodSelector checkoutData={guestCheckoutData} />);

      // Check that component renders without errors - light is default
      expect(container).toBeInTheDocument();
    });

    it('applies dark theme when specified', () => {
      const { container } = render(
        <PaymentMethodSelector checkoutData={guestCheckoutData} variant="dark" />
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('terms and conditions', () => {
    it('renders terms checkbox', () => {
      render(<PaymentMethodSelector checkoutData={guestCheckoutData} />);

      expect(screen.getByTestId('terms-checkbox')).toBeInTheDocument();
    });
  });

  describe('signin flow', () => {
    it('shows saved payment method after signin when user has saved payment', () => {
      // Start as guest
      const { rerender } = render(<PaymentMethodSelector checkoutData={guestCheckoutData} />);

      // Initially shows guest sign-in
      expect(screen.getByTestId('guest-sign-in')).toBeInTheDocument();

      // After signin, checkout data changes to authenticated with saved payment
      rerender(<PaymentMethodSelector checkoutData={authenticatedCheckoutData} />);

      // Should now show saved payment method (visible, not hidden)
      const savedPaymentMethod = screen.getByTestId('saved-payment-method');
      expect(savedPaymentMethod).toBeInTheDocument();
      expect(savedPaymentMethod).toBeVisible();
    });

    it('shows payment selection after signin when user has no saved payment', () => {
      // Start as guest
      const { rerender } = render(<PaymentMethodSelector checkoutData={guestCheckoutData} />);

      // Initially shows guest sign-in
      expect(screen.getByTestId('guest-sign-in')).toBeInTheDocument();

      // After signin, checkout data changes to authenticated without saved payment
      const authenticatedNoSavedPayment: CheckoutDetailsResponse = {
        __typename: 'CheckoutReadyForAuthenticatedUser',
        buyer: { firstName: 'John', id: 'buyer-123' },
        purchasable: {
          currencyCode: 'USD',
          entitledHours: 10,
          id: 'item-2',
          name: '10 Hours',
          priceCents: 50000,
          type: 'CATALOG_ITEM',
        },
        savedPaymentMethod: null,
      };

      rerender(<PaymentMethodSelector checkoutData={authenticatedNoSavedPayment} />);

      // Should show payment selection (visible, not hidden)
      const paymentSelection = screen.getByTestId('payment-method-selection');
      expect(paymentSelection).toBeInTheDocument();
      expect(paymentSelection).toBeVisible();
    });
  });

  describe('Apple Pay initialization', () => {
    it('passes isApplePayInitializing=true while Braintree client is loading', () => {
      // Braintree client still loading
      mockUseBraintreeClient.mockReturnValue({
        client: null,
        error: null,
        isLoading: true,
        reinitialize: jest.fn(),
      });

      render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

      expect(capturedPaymentMethodSelectionProps.isApplePayInitializing).toBe(true);
    });

    it('passes isApplePayInitializing=true while Apple Pay is initializing', async () => {
      // Braintree client ready, but Apple Pay hasn't resolved yet
      let resolveApplePay: (value: unknown) => void = () => {};
      mockInitApplePay.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveApplePay = resolve;
          })
      );

      mockUseBraintreeClient.mockReturnValue({
        client: mockBraintreeClient,
        error: null,
        isLoading: false,
        reinitialize: jest.fn(),
      });

      render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

      // Apple Pay is still initializing
      expect(capturedPaymentMethodSelectionProps.isApplePayInitializing).toBe(true);

      // Resolve Apple Pay
      await act(async () => {
        resolveApplePay(mockApplePayInstance);
      });

      // Now Apple Pay is ready
      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.isApplePayInitializing).toBe(false);
      });
    });

    it('marks Apple Pay as ready when initApplePay returns an instance', async () => {
      // Apple Pay available
      mockInitApplePay.mockResolvedValue(mockApplePayInstance);

      mockUseBraintreeClient.mockReturnValue({
        client: mockBraintreeClient,
        error: null,
        isLoading: false,
        reinitialize: jest.fn(),
      });

      render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.isApplePayInitializing).toBe(false);
      });
    });

    it('marks Apple Pay as ready when initApplePay returns undefined (not available)', async () => {
      // Apple Pay not available - returns undefined
      mockInitApplePay.mockResolvedValue(undefined);

      mockUseBraintreeClient.mockReturnValue({
        client: mockBraintreeClient,
        error: null,
        isLoading: false,
        reinitialize: jest.fn(),
      });

      render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

      // Should still mark as ready (not stuck in loading)
      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.isApplePayInitializing).toBe(false);
      });
    });

    it('marks Apple Pay as ready when initApplePay throws an error', async () => {
      // Apple Pay initialization fails with an error
      mockInitApplePay.mockRejectedValue(new Error('Apple Pay not supported'));

      mockUseBraintreeClient.mockReturnValue({
        client: mockBraintreeClient,
        error: null,
        isLoading: false,
        reinitialize: jest.fn(),
      });

      render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

      // Should still mark as ready (not stuck in loading)
      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.isApplePayInitializing).toBe(false);
      });
    });
  });

  describe('Google Pay initialization', () => {
    it('passes isGooglePayInitializing=true while Braintree client is loading', () => {
      // Braintree client still loading
      mockUseBraintreeClient.mockReturnValue({
        client: null,
        error: null,
        isLoading: true,
        reinitialize: jest.fn(),
      });

      render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

      expect(capturedPaymentMethodSelectionProps.isGooglePayInitializing).toBe(true);
    });

    it('passes isGooglePayInitializing=true while Google Pay is initializing', async () => {
      // Braintree client ready, but Google Pay hasn't resolved yet
      let resolveGooglePay: (value: unknown) => void = () => {};
      mockInitGooglePay.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveGooglePay = resolve;
          })
      );

      mockUseBraintreeClient.mockReturnValue({
        client: mockBraintreeClient,
        error: null,
        isLoading: false,
        reinitialize: jest.fn(),
      });

      render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

      // Google Pay is still initializing
      expect(capturedPaymentMethodSelectionProps.isGooglePayInitializing).toBe(true);

      // Resolve Google Pay
      await act(async () => {
        resolveGooglePay({
          googlePayClient: mockGooglePayClient,
          googlePayInstance: mockGooglePayInstance,
        });
      });

      // Now Google Pay is ready
      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.isGooglePayInitializing).toBe(false);
      });
    });

    it('marks Google Pay as ready when initGooglePay returns instances', async () => {
      // Google Pay available
      mockInitGooglePay.mockResolvedValue({
        googlePayClient: mockGooglePayClient,
        googlePayInstance: mockGooglePayInstance,
      });

      mockUseBraintreeClient.mockReturnValue({
        client: mockBraintreeClient,
        error: null,
        isLoading: false,
        reinitialize: jest.fn(),
      });

      render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.isGooglePayInitializing).toBe(false);
      });
    });

    it('marks Google Pay as ready when initGooglePay returns null instances (not available)', async () => {
      // Google Pay not available - returns null instances
      mockInitGooglePay.mockResolvedValue({
        googlePayClient: null,
        googlePayInstance: null,
      });

      mockUseBraintreeClient.mockReturnValue({
        client: mockBraintreeClient,
        error: null,
        isLoading: false,
        reinitialize: jest.fn(),
      });

      render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

      // Should still mark as ready (not stuck in loading)
      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.isGooglePayInitializing).toBe(false);
      });
    });

    it('marks Google Pay as ready when initGooglePay throws an error', async () => {
      // Google Pay initialization fails with an error
      mockInitGooglePay.mockRejectedValue(new Error('Google Pay not supported'));

      mockUseBraintreeClient.mockReturnValue({
        client: mockBraintreeClient,
        error: null,
        isLoading: false,
        reinitialize: jest.fn(),
      });

      render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

      // Should still mark as ready (not stuck in loading)
      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.isGooglePayInitializing).toBe(false);
      });
    });
  });

  describe('combined initialization states', () => {
    it('shows both as initializing while Braintree loads', () => {
      mockUseBraintreeClient.mockReturnValue({
        client: null,
        error: null,
        isLoading: true,
        reinitialize: jest.fn(),
      });

      render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

      expect(capturedPaymentMethodSelectionProps.isApplePayInitializing).toBe(true);
      expect(capturedPaymentMethodSelectionProps.isGooglePayInitializing).toBe(true);
    });

    it('shows both as ready when both payment methods initialize successfully', async () => {
      mockInitApplePay.mockResolvedValue(mockApplePayInstance);
      mockInitGooglePay.mockResolvedValue({
        googlePayClient: mockGooglePayClient,
        googlePayInstance: mockGooglePayInstance,
      });

      mockUseBraintreeClient.mockReturnValue({
        client: mockBraintreeClient,
        error: null,
        isLoading: false,
        reinitialize: jest.fn(),
      });

      render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.isApplePayInitializing).toBe(false);
        expect(capturedPaymentMethodSelectionProps.isGooglePayInitializing).toBe(false);
      });
    });

    it('shows both as ready even when both payment methods are unavailable', async () => {
      // Both unavailable
      mockInitApplePay.mockResolvedValue(undefined);
      mockInitGooglePay.mockResolvedValue({
        googlePayClient: null,
        googlePayInstance: null,
      });

      mockUseBraintreeClient.mockReturnValue({
        client: mockBraintreeClient,
        error: null,
        isLoading: false,
        reinitialize: jest.fn(),
      });

      render(<PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} />);

      // Should mark both as ready (not stuck in loading state)
      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.isApplePayInitializing).toBe(false);
        expect(capturedPaymentMethodSelectionProps.isGooglePayInitializing).toBe(false);
      });
    });
  });

  describe('processing state recovery', () => {
    // Suppress expected console.error for error handling tests
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    afterAll(() => {
      consoleErrorSpy.mockRestore();
    });

    beforeEach(() => {
      // Set up ready state for payment methods
      mockUseBraintreeClient.mockReturnValue({
        client: mockBraintreeClient,
        error: null,
        isLoading: false,
        reinitialize: jest.fn(),
      });

      mockInitApplePay.mockResolvedValue(mockApplePayInstance);
      mockInitGooglePay.mockResolvedValue({
        googlePayClient: mockGooglePayClient,
        googlePayInstance: mockGooglePayInstance,
      });

      // Mock validateTermsAccepted to return success
      const { validateTermsAccepted } = jest.requireMock('@/lib/payment/utils');
      validateTermsAccepted.mockReturnValue({ valid: true });
    });

    it('removes processing overlay when PayPal payment fails', async () => {
      // Mock purchase to fail
      mockPurchaseMembership.mockRejectedValue(new Error('PayPal payment failed'));

      render(
        <PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} skipTermsValidation />
      );

      // Wait for payment methods to initialize
      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.onPayPalComplete).toBeDefined();
      });

      // Trigger PayPal completion (this simulates PayPal SDK returning successfully)
      await act(async () => {
        capturedPaymentMethodSelectionProps.onPayPalComplete?.('paypal-nonce', {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          zipCode: '12345',
        });
      });

      // Processing overlay should NOT be visible after error (state was reset)
      await waitFor(() => {
        expect(screen.queryByText('Processing payment...')).not.toBeInTheDocument();
      });

      // Error message should be displayed
      expect(screen.getByText(/paypal payment failed/i)).toBeInTheDocument();
    });

    it('removes processing overlay when Google Pay payment fails', async () => {
      // Create a mock Google Pay client that returns payment data
      const mockGooglePayClientWithData = {
        loadPaymentData: jest.fn().mockResolvedValue({
          email: 'test@example.com',
          paymentMethodData: {
            info: {
              billingAddress: {
                name: 'Test User',
                postalCode: '12345',
              },
            },
          },
        }),
      };

      const mockGooglePayInstanceWithParse = {
        createPaymentDataRequest: jest.fn().mockReturnValue({
          allowedPaymentMethods: [{ parameters: {} }],
        }),
        parseResponse: jest.fn().mockResolvedValue({ nonce: 'google-pay-nonce' }),
      };

      mockInitGooglePay.mockResolvedValue({
        googlePayClient: mockGooglePayClientWithData,
        googlePayInstance: mockGooglePayInstanceWithParse,
      });

      // Mock purchase to fail
      mockPurchaseMembership.mockRejectedValue(new Error('Google Pay payment failed'));

      render(
        <PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} skipTermsValidation />
      );

      // Wait for payment methods to initialize
      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.onSelectGooglePay).toBeDefined();
      });

      // Trigger Google Pay selection
      await act(async () => {
        capturedPaymentMethodSelectionProps.onSelectGooglePay?.();
      });

      // Processing overlay should NOT be visible after error (state was reset)
      await waitFor(() => {
        expect(screen.queryByText('Processing payment...')).not.toBeInTheDocument();
      });

      // Error message should be displayed
      expect(screen.getByText(/google pay payment failed/i)).toBeInTheDocument();
    });

    it('removes processing overlay when Google Pay is canceled by user', async () => {
      // Create a mock Google Pay client that simulates user cancellation
      const mockGooglePayClientCanceled = {
        loadPaymentData: jest.fn().mockRejectedValue({ statusCode: 'CANCELED' }),
      };

      const mockGooglePayInstanceWithCreate = {
        createPaymentDataRequest: jest.fn().mockReturnValue({
          allowedPaymentMethods: [{ parameters: {} }],
        }),
      };

      mockInitGooglePay.mockResolvedValue({
        googlePayClient: mockGooglePayClientCanceled,
        googlePayInstance: mockGooglePayInstanceWithCreate,
      });

      render(
        <PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} skipTermsValidation />
      );

      // Wait for payment methods to initialize
      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.onSelectGooglePay).toBeDefined();
      });

      // Trigger Google Pay selection (user will cancel)
      await act(async () => {
        capturedPaymentMethodSelectionProps.onSelectGooglePay?.();
      });

      // Processing overlay should NOT be visible after cancel (state was reset)
      await waitFor(() => {
        expect(screen.queryByText('Processing payment...')).not.toBeInTheDocument();
      });

      // No error message for user cancellation
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    it('shows error message when Apple Pay instance is not available', async () => {
      // Apple Pay not available
      mockInitApplePay.mockResolvedValue(undefined);

      render(
        <PaymentMethodSelector checkoutData={autoAuthenticatedCheckoutData} skipTermsValidation />
      );

      // Wait for payment methods to initialize
      await waitFor(() => {
        expect(capturedPaymentMethodSelectionProps.onSelectApplePay).toBeDefined();
      });

      // Trigger Apple Pay selection when not available
      await act(async () => {
        capturedPaymentMethodSelectionProps.onSelectApplePay?.();
      });

      // Should show error message (not stuck in processing)
      await waitFor(() => {
        expect(screen.getByText(/apple pay is not available/i)).toBeInTheDocument();
      });

      // Processing overlay should not be visible
      expect(screen.queryByText('Processing payment...')).not.toBeInTheDocument();
    });
  });
});
