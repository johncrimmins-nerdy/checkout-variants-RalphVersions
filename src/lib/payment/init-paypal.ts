/**
 * Initialize PayPal
 */

import * as braintree from 'braintree-web';

/**
 * Initializes PayPal checkout
 * @param client Braintree client instance
 * @returns Promise that resolves to PayPal instance
 */
export async function initPayPal(
  client: braintree.Client
): Promise<braintree.PayPalCheckout | undefined> {
  try {
    // Check if PayPal script is loaded
    if (!window.paypal) {
      console.warn('PayPal SDK not loaded');
      return undefined;
    }

    const paypalInstance = await braintree.paypalCheckout.create({ client });
    return paypalInstance;
  } catch (error) {
    console.warn('PayPal initialization failed:', error);
    return undefined;
  }
}
