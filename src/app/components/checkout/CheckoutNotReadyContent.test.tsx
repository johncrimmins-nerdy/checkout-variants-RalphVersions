/**
 * Tests for CheckoutNotReadyContent component
 * Error states displayed when checkout is not ready
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckoutNotReadyContent from './CheckoutNotReadyContent';

// Mock checkout tracking
jest.mock('@/lib/analytics/checkout-tracking', () => ({
  trackUserEmailAlreadyExists: jest.fn(),
}));

describe('CheckoutNotReadyContent', () => {
  const mockNewRelic = {
    addPageAction: jest.fn(),
    noticeError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (window as { newrelic?: typeof mockNewRelic }).newrelic = mockNewRelic;

    // Mock document.referrer
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: '',
      writable: true,
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        hostname: 'www.varsitytutors.com',
        href: 'https://www.varsitytutors.com/checkout',
        pathname: '/checkout',
        search: '?q=test',
      },
      writable: true,
    });

    // Mock history
    Object.defineProperty(window, 'history', {
      configurable: true,
      value: {
        back: jest.fn(),
        length: 1,
      },
      writable: true,
    });
  });

  afterEach(() => {
    delete (window as { newrelic?: unknown }).newrelic;
  });

  describe('rendering', () => {
    it('should render error title', () => {
      render(<CheckoutNotReadyContent message="Test error message" />);

      expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    });

    it('should render custom title when provided', () => {
      render(<CheckoutNotReadyContent message="Test error" title="Custom Title" />);

      expect(screen.getByRole('heading', { name: 'Custom Title' })).toBeInTheDocument();
    });

    it('should render error message', () => {
      render(<CheckoutNotReadyContent message="Your quote has expired" />);

      expect(screen.getByText('Your quote has expired')).toBeInTheDocument();
    });

    it('should render error image', () => {
      render(<CheckoutNotReadyContent message="Test error" />);

      expect(screen.getByAltText('Item not found')).toBeInTheDocument();
    });

    it('should render action button', () => {
      render(<CheckoutNotReadyContent message="Test error" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('button behavior', () => {
    it('should show "Go to Homepage" when no previous page', () => {
      render(<CheckoutNotReadyContent message="Test error" />);

      expect(screen.getByRole('button', { name: 'Go to Homepage' })).toBeInTheDocument();
    });

    it('should show "Go Back" when there is a previous page from same domain', async () => {
      Object.defineProperty(document, 'referrer', {
        configurable: true,
        value: 'https://www.varsitytutors.com/checkout',
        writable: true,
      });

      Object.defineProperty(window, 'history', {
        configurable: true,
        value: {
          back: jest.fn(),
          length: 3,
        },
        writable: true,
      });

      render(<CheckoutNotReadyContent message="Test error" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
      });
    });

    it('should call history.back when "Go Back" is clicked', async () => {
      const user = userEvent.setup();
      const mockBack = jest.fn();

      Object.defineProperty(document, 'referrer', {
        configurable: true,
        value: 'https://www.varsitytutors.com/checkout',
        writable: true,
      });

      Object.defineProperty(window, 'history', {
        configurable: true,
        value: {
          back: mockBack,
          length: 3,
        },
        writable: true,
      });

      render(<CheckoutNotReadyContent message="Test error" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Go Back' }));
      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('variants', () => {
    it('should apply light theme styles by default', () => {
      render(<CheckoutNotReadyContent message="Test error" />);

      const title = screen.getByRole('heading', { name: 'Something went wrong' });
      expect(title.className).toContain('text-gray-800');
    });

    it('should apply dark theme styles when variant is dark', () => {
      render(<CheckoutNotReadyContent message="Test error" variant="dark" />);

      const title = screen.getByRole('heading', { name: 'Something went wrong' });
      expect(title.className).toContain('text-white');
    });
  });

  describe('phone number linking', () => {
    it('should convert phone numbers to clickable links', () => {
      render(<CheckoutNotReadyContent message="Please call us at 888-888-0446 for help" />);

      const phoneLink = screen.getByRole('link', { name: '888-888-0446' });
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink).toHaveAttribute('href', 'tel:+18888880446');
    });

    it('should handle messages without phone numbers', () => {
      render(<CheckoutNotReadyContent message="No phone number here" />);

      expect(screen.getByText('No phone number here')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('error tracking', () => {
    it('should track USER_ALREADY_EXISTS error', () => {
      const { trackUserEmailAlreadyExists } = jest.requireMock('@/lib/analytics/checkout-tracking');

      render(
        <CheckoutNotReadyContent
          errorDetails={{ errorCode: 'USER_ALREADY_EXISTS' }}
          message="Email already exists"
        />
      );

      expect(trackUserEmailAlreadyExists).toHaveBeenCalled();
    });

    it('should report unknown errors to New Relic when reportToNewRelic is true', () => {
      render(
        <CheckoutNotReadyContent
          errorDetails={{ errorCode: 'UNKNOWN_ERROR', errorMessage: 'Something failed' }}
          message="An error occurred"
          reportToNewRelic
        />
      );

      expect(mockNewRelic.addPageAction).toHaveBeenCalledWith('unknown_checkout_error', {
        customEventData: expect.objectContaining({
          error_code: 'UNKNOWN_ERROR',
          error_message: 'Something failed',
          page: 'checkout',
        }),
      });

      expect(mockNewRelic.noticeError).toHaveBeenCalled();
    });

    it('should not report errors when reportToNewRelic is false', () => {
      render(
        <CheckoutNotReadyContent
          errorDetails={{ errorCode: 'SOME_ERROR' }}
          message="An error occurred"
          reportToNewRelic={false}
        />
      );

      // Should only be called if error is USER_ALREADY_EXISTS
      expect(mockNewRelic.addPageAction).not.toHaveBeenCalled();
    });

    it('should report "welcome-back" as page for dark variant', () => {
      render(
        <CheckoutNotReadyContent
          errorDetails={{ errorCode: 'UNKNOWN' }}
          message="Error"
          reportToNewRelic
          variant="dark"
        />
      );

      expect(mockNewRelic.addPageAction).toHaveBeenCalledWith('unknown_checkout_error', {
        customEventData: expect.objectContaining({
          page: 'welcome-back',
        }),
      });
    });
  });
});
