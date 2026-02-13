'use client';

/**
 * New Relic SPA Route Tracker
 * Tracks route changes in Next.js App Router for better analytics in New Relic
 *
 * Based on New Relic documentation:
 * - The Pro+SPA agent automatically detects most route changes
 * - setCurrentRouteName(): Sets custom route names for SPA navigation (recommended)
 * - setPageViewName(): Sets the page name for initial page load only (not for SPA transitions)
 *
 * @see https://docs.newrelic.com/docs/browser/new-relic-browser/browser-apis/setcurrentroutename/
 * @see https://docs.newrelic.com/docs/browser/single-page-app-monitoring/use-spa-data/spa-data-collection/
 */

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Component that tracks route changes and reports to New Relic
 *
 * New Relic's Pro+SPA agent automatically detects route changes by monitoring:
 * - User interactions (clicks, keydowns, form submissions)
 * - History API changes (pushState, replaceState)
 * - Hash changes
 *
 * This component enhances that by:
 * 1. Setting a custom page name on initial load (setPageViewName)
 * 2. Setting custom route names on SPA navigation (setCurrentRouteName)
 */
export function NewRelicRouteTracker() {
  const pathname = usePathname();
  const previousPathRef = useRef<null | string>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip if no window or no newrelic
    if (typeof window === 'undefined' || !window.newrelic) {
      return;
    }

    const pageName = formatPageName(pathname);

    // Initial page load - set page view name once
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousPathRef.current = pathname;

      // setPageViewName is for initial page load naming
      // This helps identify the page in New Relic's Browser > Page views
      window.newrelic.setPageViewName(pageName);

      console.debug('[NewRelicRouteTracker] Initial page:', pageName);
      return;
    }

    // SPA route change - use setCurrentRouteName (recommended for SPA navigation)
    if (previousPathRef.current !== pathname) {
      // setCurrentRouteName is specifically designed for SPA route changes
      // It groups browser interactions under this route name
      window.newrelic.setCurrentRouteName(pageName);

      // Log route change for debugging
      console.debug('[NewRelicRouteTracker] Route changed:', {
        from: previousPathRef.current,
        pageName,
        to: pathname,
      });

      // Update previous path reference
      previousPathRef.current = pathname;
    }
  }, [pathname]);

  // This component doesn't render anything
  return null;
}

/**
 * Formats the pathname into a human-readable page name
 * Examples:
 * - "/" -> "checkout-home"
 * - "/welcome-back" -> "checkout-welcome-back"
 * - "/account-creation" -> "checkout-account-creation"
 */
function formatPageName(pathname: string): string {
  // Remove base path if present (handled by Next.js, but just in case)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/checkout';
  let cleanPath = pathname.replace(basePath, '');

  // Handle root path
  if (!cleanPath || cleanPath === '/') {
    return 'checkout-home';
  }

  // Remove leading slash and convert to kebab-case name
  cleanPath = cleanPath.replace(/^\//, '');

  // Prefix with "checkout-" for clarity in New Relic
  return `checkout-${cleanPath.replace(/\//g, '-')}`;
}

export default NewRelicRouteTracker;
