/**
 * Initialize Apple Pay
 * Braintree handles both Safari (ApplePaySession) and Chrome (Payment Request API)
 */

import * as braintree from 'braintree-web';

/**
 * Initializes Apple Pay if available in the browser
 * @param client Braintree client instance
 * @returns Promise that resolves to ApplePay instance if available
 */
export async function initApplePay(
  client: braintree.Client
): Promise<braintree.ApplePay | undefined> {
  try {
    // Let Braintree decide if Apple Pay is available
    // It supports both ApplePaySession (Safari) and Payment Request API (Chrome)
    const applePayInstance = await braintree.applePay.create({ client });
    return applePayInstance;
  } catch (error) {
    // Apple Pay not available on this browser/device
    console.warn('Apple Pay not available:', error);
    return undefined;
  }
}
