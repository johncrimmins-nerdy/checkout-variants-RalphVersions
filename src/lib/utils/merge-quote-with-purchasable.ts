/**
 * Utility to merge quote data with purchasable for installment support
 *
 * Business Rules:
 * - Only merge with purchasable object (never with options array)
 * - Only applies when quote has 2 payments (installments)
 * - Calculates and adds installment breakdown to purchasable
 */

import type { Purchasable } from '@/lib/api/checkout-details';
import type { QuoteResponse } from '@/lib/api/quote';

import { calculateInstallments } from './installments';

/**
 * Merge quote data with checkout details response
 *
 * This is the main entry point for enhancing checkout data with quote information.
 * It only modifies the purchasable object, leaving options unchanged.
 *
 * @param checkoutData - The full checkout details response
 * @param quoteData - The quote data from fetchQuote (or null if not a quote flow)
 * @returns Enhanced checkout data with installment info on purchasable only
 */
export function mergeQuoteWithCheckoutData<
  T extends { options?: Purchasable[]; purchasable?: Purchasable },
>(checkoutData: T, quoteData: null | QuoteResponse): T {
  // If no purchasable or no quote data, return unchanged
  if (!checkoutData.purchasable || !quoteData) {
    return checkoutData;
  }

  // Merge quote data with purchasable only (not options!)
  // We use type assertion here because we're only modifying purchasable,
  // and TypeScript can't infer that spreading T preserves its full type
  return {
    ...checkoutData,
    purchasable: mergeQuoteWithPurchasable(checkoutData.purchasable, quoteData),
    // options remain unchanged - no installment data
  } as T;
}

/**
 * Merge quote installment data with a purchasable object
 *
 * This function takes quote data fetched from the REST API and merges
 * the installment information with the purchasable from GraphQL.
 *
 * @param purchasable - The purchasable object from checkoutDetails
 * @param quoteData - The quote data from fetchQuote (or null if not a quote flow)
 * @returns Enhanced purchasable with installment data
 *
 * @example
 * const enhancedPurchasable = mergeQuoteWithPurchasable(purchasable, quoteData);
 * if (enhancedPurchasable.hasInstallments) {
 *   console.log(`Pay ${enhancedPurchasable.firstInstallment} today`);
 * }
 */
export function mergeQuoteWithPurchasable(
  purchasable: Purchasable,
  quoteData: null | QuoteResponse
): Purchasable {
  // If no quote data, return purchasable unchanged
  if (!quoteData) {
    return purchasable;
  }

  // Calculate installment breakdown
  const installments = calculateInstallments(purchasable.priceCents, quoteData.numberOfPayments);

  // Return enhanced purchasable with installment data
  return {
    ...purchasable,
    firstInstallment: installments.hasInstallments ? installments.firstInstallment : undefined,
    firstInstallmentCents: installments.hasInstallments
      ? installments.firstInstallmentCents
      : undefined,
    hasInstallments: installments.hasInstallments,
    isPackage: quoteData.isPackage,
    numberOfPayments: quoteData.numberOfPayments,
    secondInstallment: installments.hasInstallments ? installments.secondInstallment : undefined,
    secondInstallmentCents: installments.hasInstallments
      ? installments.secondInstallmentCents
      : undefined,
  };
}
