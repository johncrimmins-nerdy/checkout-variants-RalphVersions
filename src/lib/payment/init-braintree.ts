/**
 * Initialize Braintree client for payment processing
 */

import * as braintree from 'braintree-web';

import { IntegrationError } from '../utils/error-classes';
import { getBraintreeToken } from './get-braintree-token';

/**
 * Initializes Braintree client using an authorization token
 * @returns Promise that resolves to a Braintree client instance
 * @throws IntegrationError if Braintree token is null or client creation fails
 */
export async function initBraintree(): Promise<braintree.Client> {
  const token = await getBraintreeToken();

  // Ensure token is not null before proceeding
  if (!token) {
    const error = new IntegrationError('Braintree token is null', {
      payment_step: 'widget_initialization',
    });
    throw error;
  }

  try {
    // Braintree client creation - this is async and needs to be awaited
    const client = await braintree.client.create({ authorization: token });
    return client;
  } catch (error) {
    const braintreeError = new IntegrationError('Braintree widget failed to load', {
      braintree_error: (error as Error).message,
      payment_step: 'widget_initialization',
    });

    throw braintreeError;
  }
}
