/**
 * Shared checkout helper functions
 * Prevents code duplication across payment methods
 */

import { trackCheckoutCompletionRouting } from '@/lib/analytics/checkout-tracking';

/**
 * Build a URL with query parameters from search params object
 * Filters out undefined/null values and converts all values to strings
 *
 * @param basePath - The base path (e.g., '/checkout')
 * @param params - Record of search parameters
 * @returns Complete URL with query string
 */
export function buildUrlWithParams(
  basePath: string,
  params: Record<string, string | string[] | undefined>
): string {
  const filteredParams = Object.entries(params).reduce(
    (acc, [key, value]) => {
      if (!value) return acc;

      // Next.js `searchParams` can represent repeated query params as arrays.
      // For return_to URLs (and most of our usage), we only care about a single value.
      acc[key] = Array.isArray(value) ? String(value[0]) : String(value);
      return acc;
    },
    {} as Record<string, string>
  );

  const queryString = new URLSearchParams(filteredParams).toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Get the appropriate redirect URL based on environment and path type
 *
 * Logic:
 * - If full URL → use as-is
 * - If path within app (e.g., /checkout/...) → client-side navigation
 * - If path outside app → prefix with appropriate domain (staging or prod)
 */
export function getRedirectUrl(destinationPath: string): string {
  const isPath = destinationPath.startsWith('/');

  // Full URL: use as-is
  if (!isPath) {
    trackCheckoutCompletionRouting(destinationPath);
    return destinationPath;
  }

  // Path-based redirect
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/checkout';
  const isInAppPath = destinationPath.startsWith(basePath);

  // In-app path: use for client-side navigation
  if (isInAppPath) {
    trackCheckoutCompletionRouting(destinationPath);
    return destinationPath;
  }

  // Out-of-app path: redirect to appropriate domain
  const isProductionDomain = window.location.hostname === 'www.varsitytutors.com';
  const domain = isProductionDomain ? 'www.varsitytutors.com' : 'www.vtstaging.com';

  const fullUrl = `https://${domain}${destinationPath}`;
  trackCheckoutCompletionRouting(fullUrl);
  return fullUrl;
}
