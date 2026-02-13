/**
 * Account creation helper functions
 */

import { getRedirectUrl } from './checkout-helpers';
import { getWebDomain } from './get-api-domain';

/**
 * Get redirect URL after account creation
 * Checks return_to parameter first, then falls back to onboarding flag logic
 *
 * @param returnTo - Optional return_to parameter from URL
 * @param enableOnboarding - Whether to redirect to onboarding (from feature flag)
 */
export function getAccountCreationRedirectUrl(
  returnTo?: null | string,
  enableOnboarding = false
): string {
  // Highest priority: return_to parameter
  if (returnTo) {
    return getRedirectUrl(returnTo);
  }

  // Fallback: onboarding flag logic
  const webDomain = getWebDomain();
  const baseUrl = `https://${webDomain}`;

  if (enableOnboarding) {
    return `${baseUrl}/my-learning/welcome`;
  }

  return `${baseUrl}/my-learning`;
}
