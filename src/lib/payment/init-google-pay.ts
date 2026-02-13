/**
 * Initialize Google Pay
 * Matches original implementation
 */

import * as braintree from 'braintree-web';

/**
 * Initializes Google Pay if available
 * @param client Braintree client instance
 * @returns Promise that resolves to Google Pay instance and client
 */
export async function initGooglePay(client: braintree.Client): Promise<{
  googlePayClient: google.payments.api.PaymentsClient | null;
  googlePayInstance: braintree.GooglePayment | null;
}> {
  const isProduction = window.location.hostname.includes('varsitytutors.com');

  // Wait for Google Pay to be available
  const googleObj = await waitForGooglePay();
  if (!googleObj) {
    return { googlePayClient: null, googlePayInstance: null };
  }

  const googlePayClient = new googleObj.payments.api.PaymentsClient({
    environment: isProduction ? 'PRODUCTION' : 'TEST',
  });

  const googlePayInstance = await braintree.googlePayment.create({
    client,
    googleMerchantId: 'BCR2DN7T5DKNPSS5', // From original
    googlePayVersion: 2,
  });

  // Check if ready to pay
  const isReadyToPay = await googlePayClient.isReadyToPay({
    allowedPaymentMethods: googlePayInstance.createPaymentDataRequest().allowedPaymentMethods,
    apiVersion: 2,
    apiVersionMinor: 0,
  });

  if (!isReadyToPay.result) {
    return { googlePayClient: null, googlePayInstance: null };
  }

  return { googlePayClient, googlePayInstance };
}

/**
 * Wait for Google Pay SDK to load
 */
export function waitForGooglePay(timeout = 2500, interval = 50): Promise<null | typeof google> {
  return new Promise((resolve) => {
    const start = Date.now();
    function check() {
      if (typeof window !== 'undefined' && window.google) {
        console.log('Google Pay is available');
        resolve(window.google);
      } else if (Date.now() - start >= timeout) {
        console.log('Google Pay is not available');
        resolve(null);
      } else {
        setTimeout(check, interval);
      }
    }
    check();
  });
}
