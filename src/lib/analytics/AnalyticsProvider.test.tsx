/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';

import { AnalyticsProvider, useAnalyticsContext } from './AnalyticsProvider';

// Mock all analytics dependencies at lib level
jest.mock('./vt-analytics', () => ({
  vtAnalytics: {
    init: jest.fn().mockResolvedValue(undefined),
    page: jest.fn(),
  },
}));

jest.mock('./session-replay', () => ({
  sessionReplayService: {
    init: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('./utm-utils', () => ({
  extractUtmParameters: jest.fn().mockReturnValue({ utm_source: 'test' }),
  getQuoteContext: jest.fn().mockReturnValue({ quote_id: '123' }),
}));

jest.mock('./error-tracking', () => ({
  SystemError: class SystemError extends Error {
    constructor(
      message: string,
      public context?: Record<string, string>
    ) {
      super(message);
    }
  },
  trackErrorWithContext: jest.fn(),
}));

// Mock child components to avoid their side effects
jest.mock('./NewRelicInitializer', () => ({
  NewRelicInitializer: () => <div data-testid="newrelic-initializer" />,
}));

jest.mock('./NewRelicRouteTracker', () => ({
  NewRelicRouteTracker: () => <div data-testid="newrelic-route-tracker" />,
}));

jest.mock('./GlobalEventTracker', () => ({
  GlobalEventTracker: () => <div data-testid="global-event-tracker" />,
}));

describe('AnalyticsProvider', () => {
  const { vtAnalytics } = jest.requireMock('./vt-analytics');
  const { sessionReplayService } = jest.requireMock('./session-replay');
  const { trackErrorWithContext } = jest.requireMock('./error-tracking');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders children', async () => {
      render(
        <AnalyticsProvider>
          <div data-testid="child">Child content</div>
        </AnalyticsProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();

      // Wait for initialization to complete
      await waitFor(() => {
        expect(vtAnalytics.init).toHaveBeenCalled();
      });
    });

    it('renders NewRelicInitializer', async () => {
      render(
        <AnalyticsProvider>
          <div>Content</div>
        </AnalyticsProvider>
      );

      expect(screen.getByTestId('newrelic-initializer')).toBeInTheDocument();

      await waitFor(() => {
        expect(vtAnalytics.init).toHaveBeenCalled();
      });
    });

    it('renders NewRelicRouteTracker', async () => {
      render(
        <AnalyticsProvider>
          <div>Content</div>
        </AnalyticsProvider>
      );

      expect(screen.getByTestId('newrelic-route-tracker')).toBeInTheDocument();

      await waitFor(() => {
        expect(vtAnalytics.init).toHaveBeenCalled();
      });
    });

    it('renders GlobalEventTracker', async () => {
      render(
        <AnalyticsProvider>
          <div>Content</div>
        </AnalyticsProvider>
      );

      expect(screen.getByTestId('global-event-tracker')).toBeInTheDocument();

      await waitFor(() => {
        expect(vtAnalytics.init).toHaveBeenCalled();
      });
    });
  });

  describe('initialization', () => {
    it('initializes vtAnalytics on mount', async () => {
      render(
        <AnalyticsProvider>
          <div>Content</div>
        </AnalyticsProvider>
      );

      await waitFor(() => {
        expect(vtAnalytics.init).toHaveBeenCalled();
      });
    });

    it('initializes session replay after vtAnalytics', async () => {
      render(
        <AnalyticsProvider>
          <div>Content</div>
        </AnalyticsProvider>
      );

      await waitFor(() => {
        expect(sessionReplayService.init).toHaveBeenCalled();
      });
    });

    it('tracks initial page view with UTM and quote context', async () => {
      render(
        <AnalyticsProvider>
          <div>Content</div>
        </AnalyticsProvider>
      );

      await waitFor(() => {
        expect(vtAnalytics.page).toHaveBeenCalledWith(
          expect.objectContaining({
            quote_id: '123',
            utm_source: 'test',
          })
        );
      });
    });

    it('handles initialization errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      vtAnalytics.init.mockRejectedValueOnce(new Error('Init failed'));

      render(
        <AnalyticsProvider>
          <div>Content</div>
        </AnalyticsProvider>
      );

      // Should not throw, app continues working
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      // Children should still render
      expect(screen.getByText('Content')).toBeInTheDocument();
      consoleSpy.mockRestore();
    });
  });

  describe('global error handling', () => {
    it('tracks uncaught errors from checkout files', async () => {
      render(
        <AnalyticsProvider>
          <div>Content</div>
        </AnalyticsProvider>
      );

      // Wait for provider to initialize
      await waitFor(() => {
        expect(vtAnalytics.init).toHaveBeenCalled();
      });

      // Simulate global error from checkout file
      const errorEvent = new ErrorEvent('error', {
        colno: 10,
        error: new Error('Test error'),
        filename: '/checkout/main.js',
        lineno: 100,
        message: 'Test error',
      });

      window.dispatchEvent(errorEvent);

      await waitFor(() => {
        expect(trackErrorWithContext).toHaveBeenCalled();
      });
    });

    it('tracks unhandled promise rejections', async () => {
      render(
        <AnalyticsProvider>
          <div>Content</div>
        </AnalyticsProvider>
      );

      await waitFor(() => {
        expect(vtAnalytics.init).toHaveBeenCalled();
      });

      trackErrorWithContext.mockClear();

      const genericError = new Error('Some other error');
      const rejectionEvent = new CustomEvent(
        'unhandledrejection'
      ) as unknown as PromiseRejectionEvent;
      Object.defineProperty(rejectionEvent, 'reason', { value: genericError });

      window.dispatchEvent(rejectionEvent);

      expect(trackErrorWithContext).toHaveBeenCalled();
    });
  });

  describe('useAnalyticsContext', () => {
    function TestConsumer() {
      const { isInitialized } = useAnalyticsContext();
      return <div data-testid="initialized">{isInitialized ? 'yes' : 'no'}</div>;
    }

    it('provides isInitialized state', async () => {
      render(
        <AnalyticsProvider>
          <TestConsumer />
        </AnalyticsProvider>
      );

      // Initially false, then true after init
      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent('yes');
      });
    });

    it('returns default value outside provider', () => {
      render(<TestConsumer />);

      expect(screen.getByTestId('initialized')).toHaveTextContent('no');
    });
  });
});
