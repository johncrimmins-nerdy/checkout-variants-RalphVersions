/**
 * Format price in cents to a display string
 * @param priceInCents - Price in cents
 * @returns Formatted price string without currency symbol
 */
export const formatPrice = (priceInCents: number): string => {
  const priceInDollars = priceInCents / 100;

  if (priceInCents % 100 === 0) {
    return priceInDollars.toFixed(0);
  }

  return priceInDollars.toFixed(2);
};

/**
 * Format price in cents to a display string that always includes cents
 * @param priceInCents - Price in cents
 * @returns Formatted price string without currency symbol (always 2 decimals)
 */
export const formatPriceWithCents = (priceInCents: number): string => {
  const priceInDollars = priceInCents / 100;

  return priceInDollars.toFixed(2);
};
