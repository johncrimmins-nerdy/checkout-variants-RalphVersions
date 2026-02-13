/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { GlobalEventTracker } from './GlobalEventTracker';

// Mock window.matchMedia (not supported in jsdom)
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation((query) => ({
    addEventListener: jest.fn(),
    addListener: jest.fn(),
    dispatchEvent: jest.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: jest.fn(),
    removeListener: jest.fn(),
  })),
  writable: true,
});

// Mock analytics dependencies
jest.mock('./vt-analytics', () => ({
  vtAnalytics: {
    track: jest.fn(),
  },
}));

jest.mock('./checkout-tracking', () => ({
  trackChatStarted: jest.fn(),
}));

jest.mock('./types', () => ({
  TrackingCategory: {
    INTERACTIONS: 'interactions',
  },
  TrackingPlanEventName: {
    ELEMENT_CLICKED: 'Element Clicked',
    USER_ENTERED_INPUT: 'User Entered Input',
  },
}));

describe('GlobalEventTracker', () => {
  const { vtAnalytics } = jest.requireMock('./vt-analytics');
  const { trackChatStarted } = jest.requireMock('./checkout-tracking');

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('renders null (no visible output)', () => {
    const { container } = render(<GlobalEventTracker />);

    expect(container.innerHTML).toBe('');
  });

  describe('click tracking', () => {
    it('tracks clicks on elements with track-click class', async () => {
      const user = userEvent.setup();
      render(<GlobalEventTracker />);

      const button = document.createElement('button');
      button.className = 'track-click';
      button.id = 'test-button';
      button.setAttribute('data-element_type', 'button');
      button.setAttribute('data-page_section', 'checkout');
      button.textContent = 'Click me';
      document.body.appendChild(button);

      await user.click(button);

      await waitFor(() => {
        expect(vtAnalytics.track).toHaveBeenCalledWith(
          'Element Clicked',
          'interactions',
          expect.objectContaining({
            data_vt_track_element_id: 'test-button',
            element_type: 'button',
            page_section: 'checkout',
          })
        );
      });
    });

    it('uses element_id data attribute when present', async () => {
      const user = userEvent.setup();
      render(<GlobalEventTracker />);

      const button = document.createElement('button');
      button.className = 'track-click';
      button.setAttribute('data-element_id', 'custom-id');
      button.textContent = 'Test';
      document.body.appendChild(button);

      await user.click(button);

      await waitFor(() => {
        expect(vtAnalytics.track).toHaveBeenCalledWith(
          'Element Clicked',
          'interactions',
          expect.objectContaining({
            data_vt_track_element_id: 'custom-id',
          })
        );
      });
    });

    it('does not track clicks on elements without tracking class', async () => {
      const user = userEvent.setup();
      render(<GlobalEventTracker />);

      const button = document.createElement('button');
      button.className = 'regular-button';
      document.body.appendChild(button);

      await user.click(button);

      // Should not have tracked Element Clicked for this button
      expect(vtAnalytics.track).not.toHaveBeenCalledWith(
        'Element Clicked',
        'interactions',
        expect.anything()
      );
    });
  });

  describe('Genesys chat tracking', () => {
    it('tracks chat widget open events', async () => {
      render(<GlobalEventTracker />);

      const genesysEvent = new CustomEvent('genesys-open', {
        detail: { stepName: 'payment' },
      });

      window.dispatchEvent(genesysEvent);

      await waitFor(() => {
        expect(trackChatStarted).toHaveBeenCalledWith('payment');
      });
    });

    it('handles genesys event without stepName', async () => {
      render(<GlobalEventTracker />);

      const genesysEvent = new CustomEvent('genesys-open', {
        detail: {},
      });

      window.dispatchEvent(genesysEvent);

      await waitFor(() => {
        expect(trackChatStarted).toHaveBeenCalledWith('');
      });
    });
  });

  describe('cleanup', () => {
    it('removes event listeners on unmount', () => {
      const removeSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(<GlobalEventTracker />);
      unmount();

      expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), true);
      expect(removeSpy).toHaveBeenCalledWith('input', expect.any(Function), true);
      expect(removeSpy).toHaveBeenCalledWith('focusin', expect.any(Function), true);
      expect(removeSpy).toHaveBeenCalledWith('focusout', expect.any(Function), true);

      removeSpy.mockRestore();
    });
  });
});
