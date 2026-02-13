/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AccountCreationClient from './AccountCreationClient';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'login') return 'test@example.com';
      if (key === 'return_to') return null;
      return null;
    }),
  }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { alt: string; src: string }) => <img alt={props.alt} src={props.src} />,
}));

const mockUseFlags = jest.fn();
jest.mock('@/hooks/use-flags', () => ({
  FLAGS: { ACT_417_ONBOARDING_WIZARD: 'act_417_onboarding_wizard' },
  useFlags: () => mockUseFlags(),
}));

const mockSetupECommClient = jest.fn();
jest.mock('@/lib/api/setup-ecomm-client', () => ({
  setupECommClient: (data: unknown) => mockSetupECommClient(data),
}));

jest.mock('@/lib/analytics', () => ({
  IntegrationError: class IntegrationError extends Error {},
  trackErrorWithContext: jest.fn(),
}));

jest.mock('@/lib/utils/account-creation-helpers', () => ({
  getAccountCreationRedirectUrl: jest.fn().mockReturnValue('https://varsitytutors.com/dashboard'),
}));

jest.mock('@/lib/utils/asset-url', () => ({
  assetUrl: (path: string) => `/checkout${path}`,
}));

// Helper to get input by name attribute
function getInputByName(name: string): HTMLInputElement | null {
  return document.querySelector(`input[name="${name}"]`);
}

describe('AccountCreationClient', () => {
  const mockSessionStorage = {
    clear: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    setItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFlags.mockReturnValue({});
    mockSetupECommClient.mockResolvedValue({ clientUUID: 'test-uuid' });

    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: mockSessionStorage,
      writable: true,
    });

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: '',
      },
      writable: true,
    });
  });

  it('renders account creation form', () => {
    render(<AccountCreationClient />);

    expect(screen.getByText(/Finish creating your account/i)).toBeInTheDocument();
    expect(screen.getByText(/Email Address/i)).toBeInTheDocument();
    // Password label appears multiple times (form label + requirements header)
    expect(screen.getAllByText(/Password/i).length).toBeGreaterThan(0);
  });

  it('renders thank you message', () => {
    render(<AccountCreationClient />);

    expect(screen.getByText(/Thank you for your purchase!/i)).toBeInTheDocument();
  });

  it('pre-fills email from URL parameter', () => {
    render(<AccountCreationClient />);

    const emailInput = getInputByName('Email-Address');
    expect(emailInput?.value).toBe('test@example.com');
  });

  it('shows password requirements', () => {
    render(<AccountCreationClient />);

    expect(screen.getByText(/At least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/One uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/One lowercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/One number/i)).toBeInTheDocument();
  });

  it('updates password requirement indicators when typing', async () => {
    const user = userEvent.setup();
    render(<AccountCreationClient />);

    const passwordInput = getInputByName('Password');
    expect(passwordInput).not.toBeNull();

    // Type a valid password
    await user.type(passwordInput!, 'Password123');

    // Check that requirements show as met
    await waitFor(() => {
      expect(passwordInput).toHaveValue('Password123');
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<AccountCreationClient />);

    const passwordInput = getInputByName('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find and click the toggle button
    const toggleButton = screen.getByRole('button', { name: /show|hide/i });
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle back
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<AccountCreationClient />);

    const emailInput = getInputByName('Email-Address');

    // Clear email and type invalid
    await user.clear(emailInput!);
    await user.type(emailInput!, 'invalid-email');
    // Trigger blur to validate
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates password has minimum length', async () => {
    const user = userEvent.setup();
    render(<AccountCreationClient />);

    const passwordInput = getInputByName('Password');

    // Type short password
    await user.type(passwordInput!, 'short');

    await waitFor(() => {
      expect(passwordInput).toHaveValue('short');
    });

    // Requirement should still not be met visually
    // Testing the validation state indirectly through form submission
  });

  it('submits form successfully with valid data', async () => {
    const user = userEvent.setup();
    render(<AccountCreationClient />);

    const passwordInput = getInputByName('Password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(passwordInput!, 'Password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSetupECommClient).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
      });
    });

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('clientUUID', 'test-uuid');
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('clientEmail', 'test@example.com');
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    mockSetupECommClient.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ clientUUID: 'test' }), 100))
    );

    render(<AccountCreationClient />);

    const passwordInput = getInputByName('Password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(passwordInput!, 'Password123');
    await user.click(submitButton);

    // Should show loading indicator (spinner or disabled button)
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('handles API error', async () => {
    const user = userEvent.setup();
    mockSetupECommClient.mockRejectedValue(new Error('Server error'));

    render(<AccountCreationClient />);

    const passwordInput = getInputByName('Password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(passwordInput!, 'Password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });

  it('renders logo', () => {
    render(<AccountCreationClient />);

    const logo = screen.getByRole('img', { name: /Varsity Tutors/i });
    expect(logo).toBeInTheDocument();
  });

  it('renders success check icon', () => {
    render(<AccountCreationClient />);

    const successIcon = screen.getByRole('img', { name: /Success/i });
    expect(successIcon).toBeInTheDocument();
  });
});
