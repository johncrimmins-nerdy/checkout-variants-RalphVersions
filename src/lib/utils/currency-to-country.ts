/**
 * Currency to Country Code Mapping
 * Used for tracking country context based on currency
 * Ported from originals/checkout-ts/src/types/jurisdictions.ts
 */

export type AllowedCountryCode = 'CA' | 'GB' | 'US';
export type AllowedCurrencyCode = 'CAD' | 'GBP' | 'USD';

/**
 * Maps currency codes to their corresponding country codes
 */
export const currencyToCountryMap: Record<AllowedCurrencyCode, AllowedCountryCode> = {
  CAD: 'CA',
  GBP: 'GB',
  USD: 'US',
};

/**
 * Get country code from currency code
 * @param currencyCode - The currency code (USD, CAD, GBP)
 * @returns The corresponding country code, defaults to 'US' if unknown
 */
export function getCountryFromCurrency(currencyCode?: string): AllowedCountryCode {
  if (!currencyCode) return 'US';

  const countryCode = currencyToCountryMap[currencyCode as AllowedCurrencyCode];
  return countryCode ?? 'US';
}
