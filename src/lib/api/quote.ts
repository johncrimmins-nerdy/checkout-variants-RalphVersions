/**
 * Quote API fetching for package quotes with installments
 *
 * This module fetches quote data from the REST API to get installment information
 * that is not available in the GraphQL checkoutDetails response.
 *
 * Business Rules:
 * - Only fetch when ?q= param is present (quote-based checkout)
 * - Quote data is merged with purchasable only (not options)
 * - Only 2 installments are supported
 */

import type { Quote } from '@/types/quote';

import { PACKAGE_ITEM_TYPE_IDS } from '@/lib/constants/package-item-type-ids';

import { IntegrationError } from '../utils/error-classes';
import { getApiDomain } from '../utils/get-api-domain';

export interface QuoteResponse {
  /** Customer's first name from the quote */
  customerFirstName?: string;
  /** Customer's last name from the quote */
  customerLastName?: string;
  /** Whether this quote has installment payments */
  hasInstallments: boolean;
  /** Whether this quote is for a package (vs membership) */
  isPackage: boolean;
  /** Lead UUID associated with this quote */
  leadUuid?: string;
  /** Number of payments (1 = one-time, 2 = installments) */
  numberOfPayments: number;
  /** The raw quote data */
  quote: Quote;
}

/**
 * Fetch quote data from the REST API
 *
 * @param quoteId - The quote ID (from ?q= URL param)
 * @returns Quote response with installment and package info
 * @throws IntegrationError if the fetch fails
 *
 * @example
 * const quoteData = await fetchQuote('abc123');
 * if (quoteData.hasInstallments) {
 *   // Show installment UI
 * }
 */
export async function fetchQuote(quoteId: string): Promise<QuoteResponse> {
  const apiDomain = getApiDomain();
  const url = `https://${apiDomain}/v1/pricing_quotes/${quoteId}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    if (!response.ok) {
      throw new IntegrationError(
        `Failed to fetch quote: ${response.status} ${response.statusText}`,
        {
          error_code: 'QUOTE_FETCH_ERROR',
          payment_step: 'fetch-quote',
          status: String(response.status),
        }
      );
    }

    const quote: Quote = await response.json();

    // Determine if this is a package:
    // 1. Check item_type_id against known package IDs
    // 2. OR if it has multiple payments (installments are only for packages)
    const firstItem = quote.items?.[0];
    const hasInstallments = quote.number_of_payments === 2;
    const isPackageByItemType = firstItem ? isPackageItem(firstItem.item_type_id) : false;
    const isPackage = isPackageByItemType || hasInstallments;

    // Debug logging to help diagnose package detection
    console.debug('[fetchQuote] Package detection:', {
      hasInstallments,
      isPackage,
      isPackageByItemType,
      itemTypeId: firstItem?.item_type_id,
      numberOfPayments: quote.number_of_payments,
      quoteId: quote.id,
    });

    return {
      hasInstallments,
      isPackage,
      leadUuid: quote.lead_uuid,
      numberOfPayments: quote.number_of_payments,
      quote,
    };
  } catch (error) {
    if (error instanceof IntegrationError) {
      throw error;
    }

    throw new IntegrationError('Failed to fetch quote data', {
      error: error instanceof Error ? error.message : String(error),
      error_code: 'QUOTE_FETCH_ERROR',
      payment_step: 'fetch-quote',
    });
  }
}

/**
 * Check if a checkout flow is quote-based (has ?q= param)
 *
 * @param searchParams - URL search params object
 * @returns True if this is a quote-based checkout
 */
export function isQuoteBasedCheckout(searchParams: URLSearchParams | { q?: string }): boolean {
  if (searchParams instanceof URLSearchParams) {
    return Boolean(searchParams.get('q'));
  }
  return Boolean(searchParams.q);
}

/**
 * Check if an item type ID represents a package product
 *
 * In development/staging, we also check for ?package=true URL param
 * to allow testing without real package item IDs.
 *
 * @param itemTypeId - The item_type_id from the quote item
 * @returns True if this is a package item
 */
function isPackageItem(itemTypeId: number): boolean {
  // In production, check against known package item type IDs
  if (typeof window !== 'undefined' && window.location.hostname.includes('varsitytutors.com')) {
    return PACKAGE_ITEM_TYPE_IDS.includes(itemTypeId);
  }

  // In staging/dev, also check for ?package=true URL param for testing
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('package') === 'true') {
      return true;
    }
  }

  // Fallback to checking the constant
  return PACKAGE_ITEM_TYPE_IDS.includes(itemTypeId);
}
