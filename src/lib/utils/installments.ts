/**
 * Installment calculation utilities for package quotes
 *
 * Business Rules:
 * - Only 2 installments are supported (never more)
 * - Only applies to quote-based checkout (when ?q= param is present)
 * - First installment is paid today, second in 30 days
 */

import { formatPrice } from './format-price';

export interface InstallmentBreakdown {
  /** First installment amount (formatted string, e.g., "1,000") */
  firstInstallment: string;
  /** First installment amount in cents */
  firstInstallmentCents: number;
  /** Whether this purchase has installments */
  hasInstallments: boolean;
  /** Second installment amount (formatted string, e.g., "1,000") */
  secondInstallment: string;
  /** Second installment amount in cents */
  secondInstallmentCents: number;
}

/**
 * Calculate installment breakdown for a given price
 *
 * Logic:
 * - If price is evenly divisible by 2 (in cents), both installments are equal
 * - Otherwise, first installment rounds up to nearest dollar, second gets remainder
 *
 * @param priceCents - Total price in cents
 * @param numberOfPayments - Number of payments (1 = one-time, 2 = installments)
 * @returns Installment breakdown with formatted amounts
 *
 * @example
 * calculateInstallments(200000, 2) // $2,000 → $1,000 + $1,000
 * calculateInstallments(199900, 2) // $1,999 → $1,000 + $999
 * calculateInstallments(200100, 2) // $2,001 → $1,001 + $1,000
 */
export function calculateInstallments(
  priceCents: number,
  numberOfPayments: number
): InstallmentBreakdown {
  // Only 2 installments are supported
  const hasInstallments = numberOfPayments === 2;

  if (!hasInstallments) {
    return {
      firstInstallment: formatPrice(priceCents),
      firstInstallmentCents: priceCents,
      hasInstallments: false,
      secondInstallment: '0',
      secondInstallmentCents: 0,
    };
  }

  // Check if evenly divisible by 2 (in cents)
  // We check % 200 because we want to ensure both installments are whole dollars
  // (200 cents = $2, so if price is divisible by 200, each installment is a whole dollar)
  let firstInstallmentCents: number;
  let secondInstallmentCents: number;

  if (priceCents % 200 === 0) {
    // Even split - both installments are equal
    firstInstallmentCents = priceCents / 2;
    secondInstallmentCents = firstInstallmentCents;
  } else {
    // Uneven split - first installment rounds up to nearest dollar
    firstInstallmentCents = Math.ceil(priceCents / 200) * 100;
    secondInstallmentCents = priceCents - firstInstallmentCents;
  }

  return {
    firstInstallment: formatPrice(firstInstallmentCents),
    firstInstallmentCents,
    hasInstallments: true,
    secondInstallment: formatPrice(secondInstallmentCents),
    secondInstallmentCents,
  };
}

/**
 * Generate installment display text for UI
 *
 * @param breakdown - Installment breakdown from calculateInstallments
 * @param currencySymbol - Currency symbol (default: $)
 * @returns Object with summary and details text
 *
 * @example
 * // Equal installments:
 * // summary: "2 installments of $1,000"
 * // details: "Your total is $2,000. You'll pay $1,000 today, and then pay $1,000 in 30 days."
 *
 * // Unequal installments:
 * // summary: "Installments of $1,001 and $1,000"
 * // details: "Your total is $2,001. You'll pay $1,001 today, and then pay $1,000 in 30 days."
 */
export function formatInstallmentText(
  breakdown: InstallmentBreakdown,
  totalPriceCents: number,
  currencySymbol: string = '$'
): { details: string; summary: string } {
  if (!breakdown.hasInstallments) {
    return { details: '', summary: '' };
  }

  const firstAmount = `${currencySymbol}${breakdown.firstInstallment}`;
  const secondAmount = `${currencySymbol}${breakdown.secondInstallment}`;
  const totalAmount = `${currencySymbol}${formatPrice(totalPriceCents)}`;

  // Summary text
  const summary =
    breakdown.firstInstallment === breakdown.secondInstallment
      ? `2 installments of ${firstAmount}`
      : `Installments of ${firstAmount} and ${secondAmount}`;

  // Details text
  const details = `Your total is ${totalAmount}. You'll pay ${firstAmount} today, and then pay ${secondAmount} in 30 days.`;

  return { details, summary };
}
