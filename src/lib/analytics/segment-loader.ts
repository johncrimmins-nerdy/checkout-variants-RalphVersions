'use client';

/**
 * Segment Analytics Loader
 * Dynamically loads and initializes Segment analytics
 */

import type { SegmentAnalytics } from './types';

import { getSegmentKey } from './config';

let isLoaded = false;
let loadPromise: null | Promise<void> = null;

// Extended type for Segment stub during initialization
interface SegmentStub extends Partial<SegmentAnalytics> {
  _loadOptions?: unknown;
  _writeKey?: string;
  factory?: (method: string) => (...args: unknown[]) => void;
  initialize?: boolean;
  initialized?: boolean;
  invoked?: boolean;
  load?: (key: string, options?: unknown) => void;
  methods?: string[];
  push?: (args: unknown[]) => void;
  SNIPPET_VERSION?: string;
}

/**
 * Gets the Segment analytics instance
 * Returns null if not yet loaded
 */
export function getSegmentAnalytics(): null | SegmentAnalytics {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.analytics || null;
}

/**
 * Loads the Segment analytics.js script
 */
export function loadSegment(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  // Already loaded
  if (isLoaded && window.analytics) {
    return Promise.resolve();
  }

  // Loading in progress
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve) => {
    const segmentKey = getSegmentKey();

    // Initialize the analytics stub
    const analytics: SegmentStub = (window.analytics =
      window.analytics || ([] as unknown as SegmentAnalytics));

    if (!analytics.initialize) {
      if (analytics.invoked) {
        console.error('Segment snippet included twice.');
        resolve();
        return;
      }

      analytics.invoked = true;
      analytics.methods = [
        'trackSubmit',
        'trackClick',
        'trackLink',
        'trackForm',
        'pageview',
        'identify',
        'reset',
        'group',
        'track',
        'ready',
        'alias',
        'debug',
        'page',
        'screen',
        'once',
        'off',
        'on',
        'addSourceMiddleware',
        'addIntegrationMiddleware',
        'setAnonymousId',
        'addDestinationMiddleware',
        'register',
      ];

      analytics.factory = function (method: string) {
        return function (...args: unknown[]) {
          const analyticsArray = window.analytics as unknown as { push: (args: unknown[]) => void };
          const analyticsObj = window.analytics as unknown as SegmentStub;

          if (analyticsObj?.initialized) {
            const fn = (
              window.analytics as unknown as Record<string, (...args: unknown[]) => unknown>
            )[method];
            return fn?.(...args);
          }

          args.unshift(method);
          analyticsArray.push(args);
          return window.analytics;
        };
      };

      for (const method of analytics.methods) {
        (analytics as unknown as Record<string, unknown>)[method] = analytics.factory(method);
      }

      analytics.load = function (key: string, options?: unknown) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.setAttribute('data-global-segment-analytics-key', 'analytics');
        script.src = `https://cdn.segment.com/analytics.js/v1/${key}/analytics.min.js`;

        script.onload = () => {
          isLoaded = true;
          resolve();
        };

        script.onerror = () => {
          console.error('Failed to load Segment analytics');
          resolve();
        };

        const firstScript = document.getElementsByTagName('script')[0];
        firstScript?.parentNode?.insertBefore(script, firstScript);

        analytics._loadOptions = options;
      };

      analytics._writeKey = segmentKey;
      analytics.SNIPPET_VERSION = '5.2.0';
      analytics.load(segmentKey);
    } else {
      isLoaded = true;
      resolve();
    }
  });

  return loadPromise;
}

/**
 * Waits for Segment to be ready
 */
export function waitForSegment(): Promise<null | SegmentAnalytics> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    void loadSegment().then(() => {
      const analytics = window.analytics;
      if (analytics?.ready) {
        analytics.ready(() => {
          resolve(analytics);
        });
      } else {
        resolve(analytics || null);
      }
    });
  });
}
