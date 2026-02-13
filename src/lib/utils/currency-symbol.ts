/**
 * Currency Symbol Utility
 * Maps currency codes to their display symbols
 * Ported from originals/checkout-ts/src/components/express-checkout/helpers/jurisdictions/currency-symbols.ts
 */

import type { AllowedCurrencyCode } from './currency-to-country';

/**
 * Currency symbol mapping
 * - USD: $ (US Dollar)
 * - CAD: CA$ (Canadian Dollar) - distinct from USD to avoid confusion
 * - GBP: £ (British Pound)
 */
const CURRENCY_SYMBOL_MAP: Record<AllowedCurrencyCode, string> = {
  CAD: 'CA$',
  GBP: '£',
  USD: '$',
};

/**
 * Get the display symbol for a currency code
 *
 * @param currencyCode - The ISO 4217 currency code (USD, CAD, GBP)
 * @returns The currency symbol for display (e.g., '$', 'CA$', '£')
 *
 * @example
 * currencySymbol('USD') // '$'
 * currencySymbol('CAD') // 'CA$'
 * currencySymbol('GBP') // '£'
 * currencySymbol(undefined) // '$' (defaults to USD)
 */
export function currencySymbol(currencyCode?: string): string {
  // Handle edge cases where currencyCode might be empty string, null, or invalid
  if (!currencyCode || !CURRENCY_SYMBOL_MAP[currencyCode as AllowedCurrencyCode]) {
    return '$'; // Default to USD symbol
  }

  return CURRENCY_SYMBOL_MAP[currencyCode as AllowedCurrencyCode];
}
