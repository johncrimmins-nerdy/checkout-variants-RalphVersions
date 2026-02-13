/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { trackEscapePlanClicked } from '@/lib/analytics';

import EscapeHatchButton from './EscapeHatchButton';

// Mock analytics
const mockTrackEscapePlanClicked = trackEscapePlanClicked as jest.Mock;
jest.mock('@/lib/analytics', () => ({
  trackEscapePlanClicked: jest.fn(),
}));

describe('EscapeHatchButton', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        href: 'https://www.varsitytutors.com/checkout?quoteId=123',
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  describe('rendering', () => {
    it('renders button with accessible label', () => {
      render(<EscapeHatchButton />);

      const button = screen.getByRole('button', { name: 'Switch to alternative checkout' });
      expect(button).toBeInTheDocument();
    });

    it('has fixed position styling', () => {
      render(<EscapeHatchButton />);

      const button = screen.getByRole('button', { name: 'Switch to alternative checkout' });
      expect(button).toHaveClass('fixed');
      expect(button).toHaveClass('bottom-6');
      expect(button).toHaveClass('right-6');
    });

    it('has type button', () => {
      render(<EscapeHatchButton />);

      const button = screen.getByRole('button', { name: 'Switch to alternative checkout' });
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('click behavior', () => {
    it('tracks click and redirects to webflow checkout', async () => {
      const user = userEvent.setup();

      render(<EscapeHatchButton />);

      const button = screen.getByRole('button', { name: 'Switch to alternative checkout' });
      await user.click(button);

      expect(mockTrackEscapePlanClicked).toHaveBeenCalledTimes(1);
      expect(window.location.href).toContain('ab_checkout=webflow');
      expect(window.location.href).toContain('quoteId=123');
    });

    it('preserves existing URL parameters', async () => {
      const user = userEvent.setup();
      window.location.href = 'https://www.varsitytutors.com/checkout?quoteId=456&promoCode=TEST';

      render(<EscapeHatchButton />);

      const button = screen.getByRole('button', { name: 'Switch to alternative checkout' });
      await user.click(button);

      expect(window.location.href).toContain('quoteId=456');
      expect(window.location.href).toContain('promoCode=TEST');
      expect(window.location.href).toContain('ab_checkout=webflow');
    });
  });
});
