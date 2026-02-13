/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SavedPaymentMethodType } from '@/lib/api/checkout-details';

import SavedPaymentMethodForm from './SavedPaymentMethod';

// Mock braintree-web
const mockClear = jest.fn();
const mockTokenize = jest.fn();
const mockOn = jest.fn();
const mockGetState = jest.fn();
const mockHostedFieldsCreate = jest.fn();

jest.mock('braintree-web', () => ({
  hostedFields: {
    create: (config: unknown) => mockHostedFieldsCreate(config),
  },
}));

const createValidCvvState = () => ({
  fields: {
    cvv: { isEmpty: false, isValid: true },
  },
});

const createEmptyCvvState = () => ({
  fields: {
    cvv: { isEmpty: true, isValid: false },
  },
});

const createInvalidCvvState = () => ({
  fields: {
    cvv: { isEmpty: false, isValid: false },
  },
});

// Mock the Braintree client hook
const mockUseBraintreeClient = jest.fn();
jest.mock('@/lib/payment/useBraintreeClient', () => ({
  useBraintreeClient: () => mockUseBraintreeClient(),
}));

describe('SavedPaymentMethodForm', () => {
  const defaultProps = {
    onComplete: jest.fn().mockResolvedValue(undefined),
    onUseDifferentMethod: jest.fn(),
    savedPaymentMethod: {
      cardBrand: 'Visa',
      expirationDate: '12/25',
      id: 'pm-123',
      lastFourDigits: '4242',
      type: SavedPaymentMethodType.CREDIT_CARD,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock: client loading
    mockUseBraintreeClient.mockReturnValue({
      client: null,
      error: null,
      isLoading: true,
    });

    // Default hosted fields mock
    mockHostedFieldsCreate.mockResolvedValue({
      clear: mockClear,
      getState: mockGetState,
      on: mockOn,
      tokenize: mockTokenize,
    });

    mockGetState.mockReturnValue(createValidCvvState());
  });

  describe('rendering', () => {
    it('renders saved card information', () => {
      render(<SavedPaymentMethodForm {...defaultProps} />);

      expect(screen.getByText('VISA')).toBeInTheDocument();
      expect(screen.getByText(/ending in 4242/)).toBeInTheDocument();
      expect(screen.getByText('Exp 12/25')).toBeInTheDocument();
    });

    it('renders CVV input field container', () => {
      render(<SavedPaymentMethodForm {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /complete your purchase|loading/i })
      ).toBeInTheDocument();
    });

    it('renders "use different payment method" link', () => {
      render(<SavedPaymentMethodForm {...defaultProps} />);

      expect(screen.getByText('Use a different payment method')).toBeInTheDocument();
    });

    it('renders with light variant by default', () => {
      const { container } = render(<SavedPaymentMethodForm {...defaultProps} />);

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      const form = container.querySelector('form');
      expect(form).not.toHaveClass('rounded-xl');
    });

    it('renders with dark variant styling', () => {
      const { container } = render(<SavedPaymentMethodForm {...defaultProps} variant="dark" />);

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      const form = container.querySelector('form');
      expect(form).toHaveClass('rounded-xl');
      expect(form).toHaveClass('border');
    });

    it('renders title in dark variant', () => {
      render(<SavedPaymentMethodForm {...defaultProps} variant="dark" />);

      expect(screen.getByText('Complete your purchase')).toBeInTheDocument();
    });
  });

  describe('card brand styling', () => {
    it('applies Visa color class', () => {
      render(<SavedPaymentMethodForm {...defaultProps} />);

      const brandText = screen.getByText('VISA');
      expect(brandText).toHaveClass('text-[#1A1F71]');
    });

    it('applies Mastercard color class', () => {
      render(
        <SavedPaymentMethodForm
          {...defaultProps}
          savedPaymentMethod={{ ...defaultProps.savedPaymentMethod, cardBrand: 'Mastercard' }}
        />
      );

      const brandText = screen.getByText('MASTERCARD');
      expect(brandText).toHaveClass('text-[#EB001B]');
    });

    it('applies Amex color class', () => {
      render(
        <SavedPaymentMethodForm
          {...defaultProps}
          savedPaymentMethod={{ ...defaultProps.savedPaymentMethod, cardBrand: 'amex' }}
        />
      );

      const brandText = screen.getByText('AMEX');
      expect(brandText).toHaveClass('text-[#006FCF]');
    });

    it('applies default color for unknown brand', () => {
      render(
        <SavedPaymentMethodForm
          {...defaultProps}
          savedPaymentMethod={{ ...defaultProps.savedPaymentMethod, cardBrand: undefined }}
        />
      );

      const brandText = screen.getByText('CARD');
      expect(brandText).toHaveClass('text-gray-600');
    });
  });

  describe('loading states', () => {
    it('shows loading button when client is loading', () => {
      mockUseBraintreeClient.mockReturnValue({
        client: null,
        error: null,
        isLoading: true,
      });

      render(<SavedPaymentMethodForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument();
    });

    it('disables submit button when loading', () => {
      mockUseBraintreeClient.mockReturnValue({
        client: null,
        error: null,
        isLoading: true,
      });

      render(<SavedPaymentMethodForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
    });
  });

  describe('error handling', () => {
    it('displays client error', () => {
      mockUseBraintreeClient.mockReturnValue({
        client: null,
        error: new Error('Client init failed'),
        isLoading: false,
      });

      render(<SavedPaymentMethodForm {...defaultProps} />);

      expect(screen.getByText('Client init failed')).toBeInTheDocument();
    });

    it('applies dark theme error styling', () => {
      mockUseBraintreeClient.mockReturnValue({
        client: null,
        error: new Error('Error'),
        isLoading: false,
      });

      render(<SavedPaymentMethodForm {...defaultProps} variant="dark" />);

      // Error text should have dark theme styling
      const errorText = screen.getByText('Error');
      expect(errorText).toHaveClass('text-red-200');
    });
  });

  describe('interactions', () => {
    it('calls onUseDifferentMethod when link is clicked', async () => {
      const user = userEvent.setup();
      render(<SavedPaymentMethodForm {...defaultProps} />);

      await user.click(screen.getByText('Use a different payment method'));

      expect(defaultProps.onUseDifferentMethod).toHaveBeenCalled();
    });
  });

  describe('visibility', () => {
    it('sets aria-hidden false when visible', () => {
      const { container } = render(<SavedPaymentMethodForm {...defaultProps} isVisible={true} />);

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      const form = container.querySelector('form');
      expect(form).toHaveAttribute('aria-hidden', 'false');
    });

    it('sets aria-hidden true when not visible', () => {
      const { container } = render(<SavedPaymentMethodForm {...defaultProps} isVisible={false} />);

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      const form = container.querySelector('form');
      expect(form).toHaveAttribute('aria-hidden', 'true');
    });

    it('sets negative tabIndex when not visible', () => {
      const { container } = render(<SavedPaymentMethodForm {...defaultProps} isVisible={false} />);

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('tabIndex', '-1');
      });
    });
  });

  describe('accessibility', () => {
    it('has tracking data attributes on submit button', () => {
      render(<SavedPaymentMethodForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /complete your purchase|loading/i });
      expect(submitButton).toHaveAttribute('data-element_id', 'submit_credit_card');
      expect(submitButton).toHaveAttribute('data-element_type', 'button');
      expect(submitButton).toHaveAttribute('data-page_section', 'express_checkout');
    });

    it('has tracking data attributes on change method button', () => {
      render(<SavedPaymentMethodForm {...defaultProps} />);

      const changeButton = screen.getByText('Use a different payment method');
      expect(changeButton).toHaveAttribute('data-element_id', 'change_payment_method');
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      mockUseBraintreeClient.mockReturnValue({
        client: { getVersion: jest.fn() },
        error: null,
        isLoading: false,
      });
    });

    it('shows validation error when CVV is empty on submit', async () => {
      const user = userEvent.setup();
      mockGetState.mockReturnValue(createEmptyCvvState());

      render(<SavedPaymentMethodForm {...defaultProps} />);

      const submitButton = await screen.findByRole('button', { name: /complete your purchase/i });
      await user.click(submitButton);

      expect(screen.getByText(/please enter your security code/i)).toBeInTheDocument();
    });

    it('shows validation error when CVV is invalid on submit', async () => {
      const user = userEvent.setup();
      mockGetState.mockReturnValue(createInvalidCvvState());

      render(<SavedPaymentMethodForm {...defaultProps} />);

      const submitButton = await screen.findByRole('button', { name: /complete your purchase/i });
      await user.click(submitButton);

      expect(screen.getByText(/please enter a valid security code/i)).toBeInTheDocument();
    });

    it('registers validityChange and notEmpty event handlers', async () => {
      mockUseBraintreeClient.mockReturnValue({
        client: { getVersion: jest.fn() },
        error: null,
        isLoading: false,
      });

      render(<SavedPaymentMethodForm {...defaultProps} />);

      // Wait for hosted fields to be created
      expect(
        await screen.findByRole('button', { name: /complete your purchase/i })
      ).toBeInTheDocument();

      const onCalls = mockOn.mock.calls;
      const eventNames = onCalls.map((call: [string, unknown]) => call[0]);

      expect(eventNames).toContain('focus');
      expect(eventNames).toContain('blur');
      expect(eventNames).toContain('validityChange');
      expect(eventNames).toContain('notEmpty');
    });
  });

  describe('processing state recovery', () => {
    // Suppress expected console.error for error handling tests
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    afterAll(() => {
      consoleErrorSpy.mockRestore();
    });

    beforeEach(() => {
      mockUseBraintreeClient.mockReturnValue({
        client: { getVersion: jest.fn() },
        error: null,
        isLoading: false,
      });
    });

    it('resets button from Processing to idle when onComplete throws an error', async () => {
      const user = userEvent.setup();
      const mockOnComplete = jest.fn().mockRejectedValue(new Error('Payment processing failed'));
      mockTokenize.mockResolvedValue({ nonce: 'test-nonce' });

      render(<SavedPaymentMethodForm {...defaultProps} onComplete={mockOnComplete} />);

      // Wait for hosted fields to be ready
      const submitButton = await screen.findByRole('button', { name: /complete your purchase/i });
      await user.click(submitButton);

      // Verify onComplete was called (tokenization succeeded)
      expect(mockOnComplete).toHaveBeenCalledWith('test-nonce');

      // Button should reset back to idle state after error
      expect(
        await screen.findByRole('button', { name: /complete your purchase/i })
      ).toBeInTheDocument();
    });

    it('resets button from Processing to idle when tokenization fails', async () => {
      const user = userEvent.setup();
      mockTokenize.mockRejectedValue(new Error('CVV verification failed'));

      render(<SavedPaymentMethodForm {...defaultProps} />);

      // Wait for hosted fields to be ready
      const submitButton = await screen.findByRole('button', { name: /complete your purchase/i });
      await user.click(submitButton);

      // Button should reset back to idle state after tokenization error
      expect(
        await screen.findByRole('button', { name: /complete your purchase/i })
      ).toBeInTheDocument();

      // Error message should be displayed
      expect(screen.getByText(/invalid security code/i)).toBeInTheDocument();
    });

    it('resets processing state when form becomes hidden', async () => {
      const user = userEvent.setup();
      // Make onComplete hang forever to simulate stuck processing
      const mockOnComplete = jest.fn().mockImplementation(() => new Promise(() => {}));
      mockTokenize.mockResolvedValue({ nonce: 'test-nonce' });

      const { rerender } = render(
        <SavedPaymentMethodForm {...defaultProps} isVisible onComplete={mockOnComplete} />
      );

      // Wait for hosted fields to be ready
      const submitButton = await screen.findByRole('button', { name: /complete your purchase/i });
      await user.click(submitButton);

      // Wait for onComplete to be called
      expect(mockOnComplete).toHaveBeenCalled();

      // Hide the form (simulates user navigating away)
      rerender(
        <SavedPaymentMethodForm {...defaultProps} isVisible={false} onComplete={mockOnComplete} />
      );

      // Show the form again
      rerender(<SavedPaymentMethodForm {...defaultProps} isVisible onComplete={mockOnComplete} />);

      // Button should be in idle state, not stuck on "Processing..."
      expect(
        await screen.findByRole('button', { name: /complete your purchase/i })
      ).toBeInTheDocument();
    });
  });
});
