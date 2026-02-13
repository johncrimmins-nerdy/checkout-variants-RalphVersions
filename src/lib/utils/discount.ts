/**
 * Discount calculation utilities
 * Calculates discount labels from price data when not provided by the API
 */

/**
 * Calculate discount percentage label from old and new prices
 * @param oldPriceCents - Original price in cents
 * @param priceCents - Discounted price in cents
 * @returns Discount label (e.g., "-20%") or undefined if no discount
 */
export function calculateDiscountLabel(
  oldPriceCents: number | undefined,
  priceCents: number
): string | undefined {
  // Guard against invalid inputs: undefined, zero (division by zero), negative prices
  if (!oldPriceCents || oldPriceCents <= 0 || priceCents < 0 || oldPriceCents <= priceCents) {
    return undefined;
  }

  const discountPercentage = Math.round(((oldPriceCents - priceCents) / oldPriceCents) * 100);
  return `-${discountPercentage}%`;
}
