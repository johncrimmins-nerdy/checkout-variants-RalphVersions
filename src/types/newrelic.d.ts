declare module 'newrelic' {
  const newrelic: unknown;
  export = newrelic;
}

/**
 * Browser-side New Relic API type definitions
 */
declare global {
  interface Window {
    newrelic?: {
      /**
       * Record a custom PageAction event
       */
      addPageAction: (name: string, attributes?: Record<string, unknown>) => void;

      /**
       * Record an error for tracking
       */
      noticeError: (
        error: Error | string,
        customAttributes?: Record<string, boolean | number | string>
      ) => void;

      /**
       * Set the current route name for SPA tracking
       */
      setCurrentRouteName: (name: string) => void;

      /**
       * Set a custom attribute on the page view
       */
      setCustomAttribute: (key: string, value: boolean | number | string) => void;

      /**
       * Set the page view name
       */
      setPageViewName: (name: string, host?: string) => void;
    };
  }
}
