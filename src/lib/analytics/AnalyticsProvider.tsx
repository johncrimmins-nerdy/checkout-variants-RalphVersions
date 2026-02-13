'use client';

/**
 * Analytics Provider Component
 * Initializes analytics services on mount
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { SystemError, trackErrorWithContext } from './error-tracking';
import { GlobalEventTracker } from './GlobalEventTracker';
import { NewRelicInitializer } from './NewRelicInitializer';
import { NewRelicRouteTracker } from './NewRelicRouteTracker';
import { sessionReplayService } from './session-replay';
import { extractUtmParameters, getQuoteContext } from './utm-utils';
import { vtAnalytics } from './vt-analytics';

interface AnalyticsContextValue {
  isInitialized: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  isInitialized: false,
});

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Analytics Provider
 * Wraps the app and initializes analytics services
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false); // Guard against React Strict Mode double-firing

  // Initialize analytics on mount
  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initRef.current) return;
    initRef.current = true;

    async function initAnalytics() {
      try {
        // Initialize vtAnalytics (loads Segment + VT Events)
        await vtAnalytics.init();

        // Initialize Session Replay (after Segment is loaded)
        await sessionReplayService.init();

        // Track initial page view with UTM parameters and quote context
        const utmParams = extractUtmParameters();
        const quoteContext = getQuoteContext();

        vtAnalytics.page({
          metadata: {
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          },
          path: typeof window !== 'undefined' ? window.location.pathname : '',
          url: typeof window !== 'undefined' ? window.location.href : '',
          ...utmParams,
          ...quoteContext,
        });

        setIsInitialized(true);
        console.debug('[AnalyticsProvider] Analytics initialized');
      } catch (error) {
        console.error('[AnalyticsProvider] Failed to initialize analytics:', error);
        // Don't block the app if analytics fail
        setIsInitialized(true);
      }
    }

    void initAnalytics();
  }, []);

  // Global error handler for uncaught JavaScript errors
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGlobalError = (event: ErrorEvent) => {
      // Only track errors from checkout-related files
      const isCheckoutError =
        event.filename?.includes('checkout') ||
        event.filename?.includes('_next') ||
        !event.filename; // Also track inline script errors

      if (isCheckoutError) {
        trackErrorWithContext(
          new SystemError('Uncaught JavaScript error', {
            column: String(event.colno || 0),
            error: event.message,
            filename: event.filename || 'unknown',
            line: String(event.lineno || 0),
          })
        );
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage =
        event.reason instanceof Error ? event.reason.message : String(event.reason);

      trackErrorWithContext(
        new SystemError('Unhandled promise rejection', {
          error: errorMessage,
          error_source: 'promise_rejection',
        })
      );
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <AnalyticsContext.Provider value={{ isInitialized }}>
      <NewRelicInitializer />
      <NewRelicRouteTracker />
      <GlobalEventTracker />
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext(): AnalyticsContextValue {
  return useContext(AnalyticsContext);
}

export default AnalyticsProvider;
