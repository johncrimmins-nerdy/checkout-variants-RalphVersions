import type { CheckoutDetailsResponse, Purchasable } from '@/lib/api/checkout-details';
import type { PurchaseMembershipArgs } from '@/lib/api/purchase-membership';
import type { PurchasableType } from '@/lib/context/SessionContextProvider';
import type { PurchaseData } from '@/lib/payment/types';

import { MOST_POPULAR_HOURS } from '@/lib/payment/constants';

interface BuildPurchaseArgsOptions {
  checkoutData: CheckoutDetailsResponse;
  clientID?: string;
  isLeadResubmissionFlow: boolean;
  isRetryEnabled: boolean;
  promoCode?: string;
  purchasableID?: string;
  purchasableType?: PurchasableType;
  purchaseData: PurchaseData;
  recaptchaToken: string;
  /** Optional: ID of the selected purchasable (for plan switching) */
  selectedPurchasableId?: string;
}

interface GetEffectivePurchasableOptions {
  checkoutData: CheckoutDetailsResponse;
  /** Optional: ID of the selected purchasable (for plan switching) */
  selectedPurchasableId?: string;
}

export function buildPurchaseArgs(options: BuildPurchaseArgsOptions): PurchaseMembershipArgs {
  const {
    checkoutData,
    clientID,
    isLeadResubmissionFlow,
    isRetryEnabled,
    promoCode,
    purchasableID,
    purchasableType,
    purchaseData,
    recaptchaToken,
    selectedPurchasableId,
  } = options;

  // Use centralized logic for determining the effective purchasable
  const effectivePurchasable = getEffectivePurchasable({ checkoutData, selectedPurchasableId });

  if (!effectivePurchasable) {
    throw new Error('Product information not available');
  }

  // Check if selectedPurchasableId is valid (exists in options)
  const hasValidSelectedPlan =
    selectedPurchasableId &&
    checkoutData.__typename !== 'CheckoutNotReady' &&
    checkoutData.options?.some((p) => p.id === selectedPurchasableId);

  // Determine purchasable ID and type:
  // Priority: valid selectedPurchasableId > purchasableID (URL) > default purchasable
  // This ensures the explicitly selected plan takes precedence over URL parameters
  const effectivePurchasableId = hasValidSelectedPlan
    ? selectedPurchasableId!
    : purchasableID || effectivePurchasable.id;
  const effectivePurchasableType = hasValidSelectedPlan
    ? effectivePurchasable.type
    : purchasableID
      ? purchasableType
      : effectivePurchasable.type;

  const isQuoteBased = effectivePurchasableType === 'QUOTE';
  const quoteId = isQuoteBased ? effectivePurchasableId : null;
  const catalogItemId = !isQuoteBased ? effectivePurchasableId : null;

  return {
    catalogItemId,
    checkoutDetails: checkoutData,
    clientID,
    currencyCode: effectivePurchasable.currencyCode || 'USD',
    durationSeconds: (effectivePurchasable.entitledHours || 4) * 3600,
    isLeadResubmissionFlow,
    isRetryEnabled,
    previousPriceCents: effectivePurchasable.oldPriceCents,
    priceCents: effectivePurchasable.priceCents,
    promoCode,
    purchaseData,
    quoteId,
    recaptchaToken,
  };
}

/**
 * Get the effective purchasable based on plan selection.
 *
 * This centralizes the logic for determining which purchasable to use
 * across all payment methods (Credit Card, Google Pay, Apple Pay, PayPal).
 *
 * Priority: selectedPurchasableId (user switched plans) > default purchasable
 *
 * @returns The purchasable to use for pricing and purchase, or null if not ready
 */
export function getEffectivePurchasable(
  options: GetEffectivePurchasableOptions
): null | Purchasable {
  const { checkoutData, selectedPurchasableId } = options;

  if (checkoutData.__typename === 'CheckoutNotReady') {
    return null;
  }

  const { options: planOptions, purchasable } = checkoutData;

  // If user selected a different plan, find it in options
  if (selectedPurchasableId && planOptions) {
    const selected = planOptions.find((p) => p.id === selectedPurchasableId);
    if (selected) {
      return selected;
    }
  }

  // Fallback chain (matches original plan-manager.ts):
  // 1. Default purchasable (from API - last purchase or URL-specified)
  // 2. Most popular purchasable (4 hours plan)
  // 3. First available option
  if (purchasable) {
    return purchasable;
  }

  if (planOptions && planOptions.length > 0) {
    const mostPopular = planOptions.find((p) => p.entitledHours === MOST_POPULAR_HOURS);
    return mostPopular ?? planOptions[0];
  }

  return null;
}

export function isCardExpired(expirationDate: string | undefined): boolean {
  if (!expirationDate) return false;
  const [month, year] = expirationDate.split('/');
  if (!month || !year) return false;
  const expMonth = parseInt(month, 10);
  const expYear = parseInt(year, 10) + 2000;
  const now = new Date();
  return (
    now.getFullYear() > expYear || (now.getFullYear() === expYear && now.getMonth() + 1 > expMonth)
  );
}

export function validateTermsAccepted(
  skipTermsValidation: boolean,
  termsAccepted: boolean
): { error: string } | { valid: true } {
  if (skipTermsValidation || termsAccepted) {
    return { valid: true };
  }
  return { error: 'Please accept the terms and conditions' };
}
