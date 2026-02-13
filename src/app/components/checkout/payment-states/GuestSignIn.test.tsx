/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import GuestSignIn from './GuestSignIn';

// Helper to get input by name attribute (Input component uses floating labels without proper htmlFor)
const getInputByName = (name: string) =>
  // eslint-disable-next-line testing-library/no-node-access
  document.querySelector(`input[name="${name}"]`) as HTMLInputElement;

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { [key: string]: unknown; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// Mock analytics
const mockTrackUserLoginFailed = jest.fn();
jest.mock('@/lib/analytics', () => ({
  trackUserLoginFailed: (reason: string) => mockTrackUserLoginFailed(reason),
}));

// Mock authenticate API
const mockAuthenticateUser = jest.fn();
jest.mock('@/lib/api/authenticate-user', () => ({
  authenticateUser: (email: string, password: string) => mockAuthenticateUser(email, password),
}));

// Mock asset URL helper
jest.mock('@/lib/utils/asset-url', () => ({
  assetUrl: (path: string) => path,
}));

describe('GuestSignIn', () => {
  const mockOnSignInSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders sign in form with all fields', () => {
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
      expect(getInputByName('Email-Address')).toBeInTheDocument();
      expect(getInputByName('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
      expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    });

    it('renders forgot password link with correct href', () => {
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const forgotLink = screen.getByText('Forgot password?');
      expect(forgotLink).toHaveAttribute('href', 'https://www.varsitytutors.com/passwords/forgot');
      expect(forgotLink).toHaveAttribute('target', '_blank');
      expect(forgotLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders with light variant by default', () => {
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const title = screen.getByText('Sign in to continue');
      expect(title).toHaveClass('text-brand-text');
    });

    it('renders with dark variant styling', () => {
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} variant="dark" />);

      const title = screen.getByText('Sign in to continue');
      expect(title).toHaveClass('text-white');
    });
  });

  describe('password visibility toggle', () => {
    it('hides password by default', () => {
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const passwordInput = getInputByName('Password');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('toggles password visibility when eye button is clicked', async () => {
      const user = userEvent.setup();
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const passwordInput = getInputByName('Password');
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Initially hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide again
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('form submission', () => {
    it('handles successful sign in', async () => {
      const user = userEvent.setup();
      mockAuthenticateUser.mockResolvedValue({ userID: 'user-123' });

      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const emailInput = getInputByName('Email-Address');
      const passwordInput = getInputByName('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthenticateUser).toHaveBeenCalledWith('test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(mockOnSignInSuccess).toHaveBeenCalledWith('user-123');
      });
    });

    it('shows loading state during sign in', async () => {
      const user = userEvent.setup();
      mockAuthenticateUser.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ userID: 'user-123' }), 100))
      );

      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const emailInput = getInputByName('Email-Address');
      const passwordInput = getInputByName('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Should show loading text
      expect(screen.getByRole('button', { name: 'Signing in...' })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(mockOnSignInSuccess).toHaveBeenCalled();
      });
    });

    it('handles invalid credentials error', async () => {
      const user = userEvent.setup();
      mockAuthenticateUser.mockResolvedValue({ error: 'invalid_credentials' });

      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const emailInput = getInputByName('Email-Address');
      const passwordInput = getInputByName('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Invalid email or password. Please try again.')
        ).toBeInTheDocument();
      });

      expect(mockTrackUserLoginFailed).toHaveBeenCalledWith('invalid_credentials');
      expect(mockOnSignInSuccess).not.toHaveBeenCalled();
    });

    it('handles API error', async () => {
      const user = userEvent.setup();
      mockAuthenticateUser.mockRejectedValue(new Error('Network error'));

      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const emailInput = getInputByName('Email-Address');
      const passwordInput = getInputByName('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
      });

      expect(mockTrackUserLoginFailed).toHaveBeenCalledWith('Network error');
      expect(mockOnSignInSuccess).not.toHaveBeenCalled();
    });

    it('handles non-Error exception', async () => {
      const user = userEvent.setup();
      mockAuthenticateUser.mockRejectedValue('Unknown error');

      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const emailInput = getInputByName('Email-Address');
      const passwordInput = getInputByName('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
      });

      expect(mockTrackUserLoginFailed).toHaveBeenCalledWith('unknown_error');
    });

    it('clears error when form is resubmitted', async () => {
      const user = userEvent.setup();
      mockAuthenticateUser
        .mockResolvedValueOnce({ error: 'invalid_credentials' })
        .mockResolvedValueOnce({ userID: 'user-123' });

      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const emailInput = getInputByName('Email-Address');
      const passwordInput = getInputByName('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      // First attempt - fail
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Invalid email or password. Please try again.')
        ).toBeInTheDocument();
      });

      // Second attempt - success
      await user.clear(passwordInput);
      await user.type(passwordInput, 'correctpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText('Invalid email or password. Please try again.')
        ).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockOnSignInSuccess).toHaveBeenCalledWith('user-123');
      });
    });
  });

  describe('input handling', () => {
    it('updates email value on change', async () => {
      const user = userEvent.setup();
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const emailInput = getInputByName('Email-Address') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('updates password value on change', async () => {
      const user = userEvent.setup();
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const passwordInput = getInputByName('Password') as HTMLInputElement;
      await user.type(passwordInput, 'mypassword');

      expect(passwordInput.value).toBe('mypassword');
    });

    it('shows validation error when email is empty on submit', async () => {
      const user = userEvent.setup();
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const passwordInput = getInputByName('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      await user.type(passwordInput!, 'password123');
      await user.click(submitButton);

      expect(screen.getByText(/please enter your email address/i)).toBeInTheDocument();
    });

    it('shows validation error when password is empty on submit', async () => {
      const user = userEvent.setup();
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const emailInput = getInputByName('Email-Address');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      await user.type(emailInput!, 'test@example.com');
      await user.click(submitButton);

      expect(screen.getByText(/please enter your password/i)).toBeInTheDocument();
    });

    it('shows validation error for both fields when empty on submit', async () => {
      const user = userEvent.setup();
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      await user.click(submitButton);

      expect(screen.getByText(/please enter your email address and password/i)).toBeInTheDocument();
    });

    it('clears validation error as fields are filled', async () => {
      const user = userEvent.setup();
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      const emailInput = getInputByName('Email-Address');
      const passwordInput = getInputByName('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      // Submit empty form to trigger validation
      await user.click(submitButton);
      expect(screen.getByText(/please enter your email address and password/i)).toBeInTheDocument();

      // Fill email - should update error to only mention password
      await user.type(emailInput!, 'test@example.com');
      expect(screen.getByText(/please enter your password/i)).toBeInTheDocument();

      // Fill password - error should be cleared
      await user.type(passwordInput!, 'password123');
      expect(screen.queryByText(/please enter/i)).not.toBeInTheDocument();
    });
  });

  describe('dark theme error styling', () => {
    it('applies dark theme error styling', async () => {
      const user = userEvent.setup();
      mockAuthenticateUser.mockResolvedValue({ error: 'invalid_credentials' });

      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} variant="dark" />);

      const emailInput = getInputByName('Email-Address');
      const passwordInput = getInputByName('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Invalid email or password. Please try again.')
        ).toBeInTheDocument();
      });

      // Error text should have dark theme styling (text class is on inner element)
      const errorText = screen.getByText('Invalid email or password. Please try again.');
      expect(errorText).toHaveClass('text-red-200');
    });
  });

  describe('accessibility', () => {
    it('has proper form structure', () => {
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Sign in to continue');
    });

    it('has proper input names for autofill', () => {
      render(<GuestSignIn onSignInSuccess={mockOnSignInSuccess} />);

      expect(getInputByName('Email-Address')).toHaveAttribute('name', 'Email-Address');
      expect(getInputByName('Password')).toHaveAttribute('name', 'Password');
    });
  });
});
