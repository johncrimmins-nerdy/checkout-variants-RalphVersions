/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreditCardForm from './CreditCardForm';

// Mock dependencies
jest.mock('@/lib/analytics', () => ({
  trackCardFieldBlur: jest.fn(),
  trackCardFieldFocused: jest.fn(),
}));

const mockUseBraintreeClient = jest.fn();
jest.mock('@/lib/payment/useBraintreeClient', () => ({
  useBraintreeClient: () => mockUseBraintreeClient(),
}));

jest.mock('@/lib/styles/theme', () => ({
  getFloatingLabelWrapperClass: jest.fn().mockReturnValue('wrapper-class'),
}));

// Mock braintree-web
const mockHostedFieldsCreate = jest.fn();
const mockHostedFieldsTokenize = jest.fn();
jest.mock('braintree-web', () => ({
  hostedFields: {
    create: (opts: unknown) => mockHostedFieldsCreate(opts),
  },
}));

// Helper to get input by name attribute
function getInputByName(name: string): HTMLInputElement | null {
  return document.querySelector(`input[name="${name}"]`);
}

describe('CreditCardForm', () => {
  const defaultProps = {
    onBack: jest.fn(),
    onComplete: jest.fn(),
  };

  const mockGetState = jest.fn();
  const mockClear = jest.fn();

  const mockHostedFieldsInstance = {
    clear: mockClear,
    getState: mockGetState,
    on: jest.fn(),
    teardown: jest.fn().mockResolvedValue(undefined),
    tokenize: mockHostedFieldsTokenize,
  };

  const createValidHostedFieldsState = () => ({
    fields: {
      cvv: { isEmpty: false, isValid: true },
      expirationDate: { isEmpty: false, isValid: true },
      number: { isEmpty: false, isValid: true },
    },
  });

  const createEmptyHostedFieldsState = () => ({
    fields: {
      cvv: { isEmpty: true, isValid: false },
      expirationDate: { isEmpty: true, isValid: false },
      number: { isEmpty: true, isValid: false },
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseBraintreeClient.mockReturnValue({
      client: { getVersion: jest.fn() },
      error: null,
      isLoading: false,
    });

    mockHostedFieldsCreate.mockResolvedValue(mockHostedFieldsInstance);
    mockHostedFieldsTokenize.mockResolvedValue({ nonce: 'credit-card-nonce' });
    mockGetState.mockReturnValue(createValidHostedFieldsState());
  });

  it('renders credit card form with all fields', async () => {
    render(<CreditCardForm {...defaultProps} />);

    // Check for name fields using text content
    expect(screen.getByText(/First name/i)).toBeInTheDocument();
    expect(screen.getByText(/Last name/i)).toBeInTheDocument();
    expect(screen.getByText(/Zip code/i)).toBeInTheDocument();

    // Check for hosted field labels
    expect(screen.getByText(/Card number/i)).toBeInTheDocument();
    expect(screen.getByText(/Exp\. date/i)).toBeInTheDocument();
    expect(screen.getByText(/CVV/i)).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<CreditCardForm {...defaultProps} />);

    expect(screen.getByText(/Pay with credit card/i)).toBeInTheDocument();
  });

  it('renders back button', async () => {
    render(<CreditCardForm {...defaultProps} />);

    const backButton = screen.getByRole('button', { name: /different payment method/i });
    expect(backButton).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreditCardForm {...defaultProps} />);

    const backButton = screen.getByRole('button', { name: /different payment method/i });
    await user.click(backButton);

    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('renders submit button', async () => {
    render(<CreditCardForm {...defaultProps} />);

    // Submit button shows "Loading..." while fields are loading
    const submitButton = screen.getByRole('button', { name: /loading|complete your purchase/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('shows loading state when Braintree client is loading', () => {
    mockUseBraintreeClient.mockReturnValue({
      client: null,
      error: null,
      isLoading: true,
    });

    render(<CreditCardForm {...defaultProps} />);

    // Form should still render
    expect(screen.getByText(/First name/i)).toBeInTheDocument();
  });

  it('shows error message when client has error', () => {
    mockUseBraintreeClient.mockReturnValue({
      client: null,
      error: new Error('Client failed'),
      isLoading: false,
    });

    render(<CreditCardForm {...defaultProps} />);

    expect(screen.getByText(/Client failed/i)).toBeInTheDocument();
  });

  it('initializes hosted fields when client is available', async () => {
    render(<CreditCardForm {...defaultProps} />);

    await waitFor(() => {
      expect(mockHostedFieldsCreate).toHaveBeenCalled();
    });

    const createConfig = mockHostedFieldsCreate.mock.calls[0][0];
    expect(createConfig).toHaveProperty('client');
    expect(createConfig).toHaveProperty('fields');
    expect(createConfig.fields).toHaveProperty('number');
    expect(createConfig.fields).toHaveProperty('expirationDate');
    expect(createConfig.fields).toHaveProperty('cvv');
  });

  it('applies dark theme styles', () => {
    const { container } = render(<CreditCardForm {...defaultProps} variant="dark" />);

    // Check for dark theme elements
    expect(container.innerHTML).toContain('text-white');
  });

  it('applies light theme styles by default', () => {
    const { container } = render(<CreditCardForm {...defaultProps} />);

    // Check for light theme elements
    expect(container.innerHTML).toContain('text-brand-text');
  });

  it('handles name input changes', async () => {
    const user = userEvent.setup();
    render(<CreditCardForm {...defaultProps} />);

    const firstNameInput = getInputByName('First-Name');
    const lastNameInput = getInputByName('Last-Name');

    expect(firstNameInput).not.toBeNull();
    expect(lastNameInput).not.toBeNull();

    await user.type(firstNameInput!, 'John');
    await user.type(lastNameInput!, 'Doe');

    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
  });

  it('handles postal code input changes', async () => {
    const user = userEvent.setup();
    render(<CreditCardForm {...defaultProps} />);

    const postalCodeInput = getInputByName('postal-code');

    expect(postalCodeInput).not.toBeNull();
    await user.type(postalCodeInput!, '12345');

    expect(postalCodeInput).toHaveValue('12345');
  });

  it('sets aria-hidden based on isVisible prop', () => {
    const { container, rerender } = render(<CreditCardForm {...defaultProps} isVisible />);

    expect(container.innerHTML).toContain('aria-hidden="false"');

    rerender(<CreditCardForm {...defaultProps} isVisible={false} />);
    expect(container.innerHTML).toContain('aria-hidden="true"');
  });

  it('sets tabIndex based on isVisible prop', () => {
    const { rerender } = render(<CreditCardForm {...defaultProps} isVisible />);

    const firstNameInput = getInputByName('First-Name');
    expect(firstNameInput?.getAttribute('tabIndex')).not.toBe('-1');

    rerender(<CreditCardForm {...defaultProps} isVisible={false} />);
    expect(firstNameInput?.getAttribute('tabIndex')).toBe('-1');
  });

  describe('form validation', () => {
    it('shows validation error when submitting with empty regular fields', async () => {
      const user = userEvent.setup();
      render(<CreditCardForm {...defaultProps} />);

      await waitFor(() => {
        expect(mockHostedFieldsCreate).toHaveBeenCalled();
      });

      const submitButton = screen.getByRole('button', { name: /complete your purchase/i });
      await user.click(submitButton);

      expect(
        screen.getByText(/please enter your first name, last name, and zip code/i)
      ).toBeInTheDocument();
    });

    it('shows validation error for empty hosted fields', async () => {
      const user = userEvent.setup();
      mockGetState.mockReturnValue(createEmptyHostedFieldsState());

      render(<CreditCardForm {...defaultProps} />);

      await waitFor(() => {
        expect(mockHostedFieldsCreate).toHaveBeenCalled();
      });

      // Fill regular fields
      const firstNameInput = getInputByName('First-Name');
      const lastNameInput = getInputByName('Last-Name');
      const postalCodeInput = getInputByName('postal-code');

      await user.type(firstNameInput!, 'John');
      await user.type(lastNameInput!, 'Doe');
      await user.type(postalCodeInput!, '12345');

      const submitButton = screen.getByRole('button', { name: /complete your purchase/i });
      await user.click(submitButton);

      expect(
        screen.getByText(/please enter your card number, expiration date, and cvv/i)
      ).toBeInTheDocument();
    });

    it('shows validation error for invalid hosted fields', async () => {
      const user = userEvent.setup();
      mockGetState.mockReturnValue({
        fields: {
          cvv: { isEmpty: false, isValid: true },
          expirationDate: { isEmpty: false, isValid: false },
          number: { isEmpty: false, isValid: true },
        },
      });

      render(<CreditCardForm {...defaultProps} />);

      await waitFor(() => {
        expect(mockHostedFieldsCreate).toHaveBeenCalled();
      });

      // Fill regular fields
      const firstNameInput = getInputByName('First-Name');
      const lastNameInput = getInputByName('Last-Name');
      const postalCodeInput = getInputByName('postal-code');

      await user.type(firstNameInput!, 'John');
      await user.type(lastNameInput!, 'Doe');
      await user.type(postalCodeInput!, '12345');

      const submitButton = screen.getByRole('button', { name: /complete your purchase/i });
      await user.click(submitButton);

      expect(screen.getByText(/please enter a valid expiration date/i)).toBeInTheDocument();
    });

    it('calls onComplete when all fields are valid', async () => {
      const user = userEvent.setup();
      render(<CreditCardForm {...defaultProps} />);

      await waitFor(() => {
        expect(mockHostedFieldsCreate).toHaveBeenCalled();
      });

      // Fill regular fields
      const firstNameInput = getInputByName('First-Name');
      const lastNameInput = getInputByName('Last-Name');
      const postalCodeInput = getInputByName('postal-code');

      await user.type(firstNameInput!, 'John');
      await user.type(lastNameInput!, 'Doe');
      await user.type(postalCodeInput!, '12345');

      const submitButton = screen.getByRole('button', { name: /complete your purchase/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onComplete).toHaveBeenCalledWith('credit-card-nonce', {
          email: '',
          firstName: 'John',
          lastName: 'Doe',
          postalCode: '12345',
        });
      });
    });

    it('registers validityChange and notEmpty event handlers on hosted fields', async () => {
      render(<CreditCardForm {...defaultProps} />);

      await waitFor(() => {
        expect(mockHostedFieldsCreate).toHaveBeenCalled();
      });

      const onCalls = mockHostedFieldsInstance.on.mock.calls;
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

    it('resets button from Processing to idle when onComplete throws an error', async () => {
      const user = userEvent.setup();
      const mockOnComplete = jest.fn().mockRejectedValue(new Error('Payment processing failed'));

      render(<CreditCardForm {...defaultProps} onComplete={mockOnComplete} />);

      await waitFor(() => {
        expect(mockHostedFieldsCreate).toHaveBeenCalled();
      });

      // Fill all required fields
      const firstNameInput = getInputByName('First-Name');
      const lastNameInput = getInputByName('Last-Name');
      const postalCodeInput = getInputByName('postal-code');

      await user.type(firstNameInput!, 'John');
      await user.type(lastNameInput!, 'Doe');
      await user.type(postalCodeInput!, '12345');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /complete your purchase/i });
      await user.click(submitButton);

      // Verify onComplete was called (tokenization succeeded)
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });

      // Button should reset back to idle state after error
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete your purchase/i })).toBeInTheDocument();
      });

      // Error message should be displayed
      expect(screen.getByText(/payment processing failed/i)).toBeInTheDocument();
    });

    it('resets button from Processing to idle when tokenization fails', async () => {
      const user = userEvent.setup();
      mockHostedFieldsTokenize.mockRejectedValue(new Error('Card declined'));

      render(<CreditCardForm {...defaultProps} />);

      await waitFor(() => {
        expect(mockHostedFieldsCreate).toHaveBeenCalled();
      });

      // Fill all required fields
      const firstNameInput = getInputByName('First-Name');
      const lastNameInput = getInputByName('Last-Name');
      const postalCodeInput = getInputByName('postal-code');

      await user.type(firstNameInput!, 'John');
      await user.type(lastNameInput!, 'Doe');
      await user.type(postalCodeInput!, '12345');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /complete your purchase/i });
      await user.click(submitButton);

      // Button should reset back to idle state after tokenization error
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete your purchase/i })).toBeInTheDocument();
      });

      // Error message should be displayed
      expect(screen.getByText(/card declined/i)).toBeInTheDocument();
    });

    it('resets processing state when form becomes hidden', async () => {
      const user = userEvent.setup();
      // Make onComplete hang forever to simulate stuck processing
      const mockOnComplete = jest.fn().mockImplementation(() => new Promise(() => {}));

      const { rerender } = render(
        <CreditCardForm {...defaultProps} isVisible onComplete={mockOnComplete} />
      );

      await waitFor(() => {
        expect(mockHostedFieldsCreate).toHaveBeenCalled();
      });

      // Fill all required fields
      const firstNameInput = getInputByName('First-Name');
      const lastNameInput = getInputByName('Last-Name');
      const postalCodeInput = getInputByName('postal-code');

      await user.type(firstNameInput!, 'John');
      await user.type(lastNameInput!, 'Doe');
      await user.type(postalCodeInput!, '12345');

      // Submit the form to trigger processing state
      const submitButton = screen.getByRole('button', { name: /complete your purchase/i });
      await user.click(submitButton);

      // Wait for onComplete to be called
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });

      // Hide the form (simulates user navigating away)
      rerender(<CreditCardForm {...defaultProps} isVisible={false} onComplete={mockOnComplete} />);

      // Show the form again
      rerender(<CreditCardForm {...defaultProps} isVisible onComplete={mockOnComplete} />);

      // Button should be in idle state, not stuck on "Processing..."
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete your purchase/i })).toBeInTheDocument();
      });
    });
  });
});
