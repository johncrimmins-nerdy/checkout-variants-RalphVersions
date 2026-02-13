/**
 * E2E Test Configuration
 *
 * Contains test account credentials and IDs for E2E testing.
 * These are test accounts only - do not use in production.
 */

export const TEST_USER = {
  email: 'phyllis@invalidemailtest.com.br',
  password: '3dEnKfsA!xf472B',
};

export const TEST_QUOTE_ID = '2ce8ae54-824b-4a1a-909a-040f5f2bd918';

export const TEST_CLIENT_ID = '1024bf64-e8b1-43bb-8da8-3936d906c2f4';

// Catalog item for testing
export const TEST_CATALOG_ITEM_ID = '4bc915af-0cf0-4cab-831b-3c0dbabea4f5';

/**
 * Package quote with installments (number_of_payments = 2)
 * This quote should have a payment plan with 2 installments.
 *
 * To get a new package quote ID:
 * 1. Log into staging admin: https://www.vtstaging.com/admin
 * 2. Create a lead with a package quote
 * 3. Set payment plan to "Two Payments"
 * 4. Get the quote ID from the URL (the ?q= parameter)
 *
 * Set via environment variable or update this default:
 */
export const TEST_PACKAGE_QUOTE_ID =
  process.env.TEST_PACKAGE_QUOTE_ID || 'efb157fe-22e6-42ba-9e15-0c6ef65ef3db';

/**
 * Quote configured with a specific amount to trigger Braintree processor decline
 * Amount should be in the $2000-$3000 range to trigger decline codes
 * (e.g., $2000.00 = code 2000 "Do Not Honor")
 *
 * @see https://developer.paypal.com/braintree/docs/reference/general/testing
 */
export const TEST_DECLINE_QUOTE_ID = 'e2eb6b9f-1c1d-4cd0-83df-caf6a8ca6c90';

/**
 * Fallback quotes page URL with pre-existing package quotes
 * Used when quote creation fails - this lead already has package quotes available
 */
export const FALLBACK_QUOTES_URL =
  'https://www.vtstaging.com/quotes?lead_id=9124c3ac-b178-42c8-bfd1-d1a404a9162e&rc=off';
