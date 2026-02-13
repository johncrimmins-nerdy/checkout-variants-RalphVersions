/**
 * Fetches Braintree client token from the API
 * Uses the v3 payment token endpoint
 * Always uses Next.js proxy to avoid CORS issues
 */

import { IntegrationError } from '../utils/error-classes';

/**
 * Fetch Braintree tokenization key from the API
 * @returns Promise that resolves to the Braintree token
 */
export async function getBraintreeToken(): Promise<null | string> {
  try {
    // Always use Next.js API proxy
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/checkout';
    const url = `${basePath}/api/braintree-token`;

    const response = await fetch(url, {
      credentials: 'include',
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error fetching Braintree token. status: ${response.status}`);
    }

    const data = await response.json();
    return data.token || null;
  } catch (error) {
    console.error('Error getting Braintree token:', error);
    throw new IntegrationError('Error getting Braintree token', {
      error: error instanceof Error ? error.message : String(error),
      payment_step: 'get-braintree-token',
    });
  }
}
