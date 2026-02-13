/**
 * Purchase membership mutation
 * Processes payment and creates membership
 */

import type { PurchaseData, PurchaseResult } from '../payment/types';
import type { CheckoutDetailsResponse } from './checkout-details';

import { newRelicTrack } from '../analytics/error-tracking';
import { NewRelicEvent } from '../analytics/types';
import { purchaseRetryManager } from '../services/purchase-retry-manager';
import { getCookie } from '../utils/cookie';
import { getCountryFromCurrency } from '../utils/currency-to-country';
import { IntegrationError, PaymentError } from '../utils/error-classes';
import { getGraphQLUrl } from '../utils/get-graphql-url';

export interface PurchaseMembershipArgs {
  catalogItemId?: null | string;
  checkoutDetails: CheckoutDetailsResponse;
  clientID?: string;
  currencyCode: string;
  durationSeconds: number;
  isLeadResubmissionFlow: boolean;
  /** Whether purchase retry is enabled (from ECOMM-587 flag) */
  isRetryEnabled?: boolean;
  previousPriceCents?: null | number;
  priceCents: number;
  promoCode?: string;
  purchaseData: PurchaseData;
  quoteId?: null | string;
  recaptchaToken: string;
}

interface MembershipPurchaseInput {
  buyer?: {
    id: string;
    type: 'CLIENT';
  };
  enrollmentItemId?: string;
  isChurnedUser?: boolean;
  membershipItem?: null | {
    currency: string;
    durationSeconds: number;
    id: string;
    oldPriceCents?: number;
    priceCents: number;
  };
  payment: {
    billingAddress?: {
      countryCode: string;
      zipCode: string;
    };
    firstName?: string;
    lastName?: string;
    nonce: string;
    paymentMethod: string;
    paymentMethodId?: string;
  };
  promoCodeId?: string;
  quoteId?: null | string;
  trackingInfo: {
    landing_page: string;
    referer: string;
    visitor_id: string;
  };
  verificationToken: string;
}

/**
 * Purchase membership via GraphQL mutation
 */
export async function purchaseMembership(args: PurchaseMembershipArgs): Promise<PurchaseResult> {
  const {
    catalogItemId,
    clientID,
    currencyCode,
    durationSeconds,
    isLeadResubmissionFlow,
    isRetryEnabled = false,
    previousPriceCents,
    priceCents,
    promoCode,
    purchaseData,
    quoteId,
    recaptchaToken,
  } = args;

  const graphqlUrl = getGraphQLUrl();

  // Get tracking data from cookies
  const trackingData = {
    landing_page: getCookie('landing_page') || '',
    referer: getCookie('referrer') || '',
    visitor_id: getCookie('visitor_id') || '',
  };

  // Get enrollment item ID from URL if present
  const enrollmentItemId =
    new URLSearchParams(window.location.search).get('enrollmentItemId') || '';

  // Build membership item (for catalog-based purchases)
  const membershipItem = catalogItemId
    ? {
        currency: currencyCode,
        durationSeconds,
        id: catalogItemId,
        ...(previousPriceCents ? { oldPriceCents: previousPriceCents } : {}),
        priceCents,
      }
    : null;

  // Build GraphQL variables
  const variables: { input: MembershipPurchaseInput } = {
    input: {
      ...(clientID ? { buyer: { id: clientID, type: 'CLIENT' } } : {}),
      ...(enrollmentItemId ? { enrollmentItemId } : {}),
      ...(isLeadResubmissionFlow ? { isChurnedUser: true } : {}),
      ...(promoCode ? { promoCodeId: promoCode } : {}),
      membershipItem: quoteId ? null : membershipItem,
      payment: purchaseData.savedPaymentMethodId
        ? {
            nonce: purchaseData.nonce,
            paymentMethod: purchaseData.paymentMethod,
            paymentMethodId: purchaseData.savedPaymentMethodId,
          }
        : {
            billingAddress: {
              countryCode: getCountryFromCurrency(currencyCode),
              zipCode: purchaseData.zipCode || '',
            },
            firstName: purchaseData.firstName,
            lastName: purchaseData.lastName,
            nonce: purchaseData.nonce,
            paymentMethod: purchaseData.paymentMethod,
          },
      quoteId,
      trackingInfo: trackingData,
      verificationToken: recaptchaToken || '',
    },
  };

  const mutation = `
    mutation PurchaseMembership($input: MembershipPurchaseInput!) {
      purchaseMembership(input: $input) {
        destinationPath
        accessToken
        userUID
        clientUUID
        paymentID
      }
    }
  `;

  // Log what we're sending for debugging
  console.log('📤 Purchase Membership Request:', {
    catalogItemId,
    paymentMethod: purchaseData.paymentMethod,
    purchaseData: {
      ...purchaseData,
      nonce: purchaseData.nonce.substring(0, 20) + '...',
    },
    quoteId,
  });

  try {
    const response = await fetch(graphqlUrl, {
      body: JSON.stringify({
        operationName: 'PurchaseMembership',
        query: mutation,
        variables,
      }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new PaymentError('Unauthorized - please sign in', {
          code: 'UNAUTHORIZED',
          errorCode: 'UNAUTHORIZED',
          payment_step: 'purchase-membership',
          status: 401,
        });
      }

      const errorData = await response.json();
      const errorMessage = errorData.errors?.[0]?.message || `HTTP error: ${response.status}`;

      throw new IntegrationError(errorMessage, {
        code: 'UNKNOWN_API_ERROR',
        errorCode: 'UNKNOWN_API_ERROR',
        payment_step: 'purchase-membership',
        status: response.status,
      });
    }

    const result = await response.json();

    // Check for GraphQL errors
    if (result?.errors && result.errors.length > 0) {
      const error = result.errors[0];
      const errorCode = error.extensions?.code;
      const errorMessage = error.message || 'Purchase failed';

      console.error('❌ GraphQL Error Details:', {
        code: errorCode,
        extensions: error.extensions,
        message: errorMessage,
        originalError: error,
        result,
      });

      // Check if error is retryable
      const hasRetryableError = result.errors.some(
        (err: { extensions?: { isRetryable?: boolean } }) => err?.extensions?.isRetryable === true
      );

      // Retry if conditions are met (flag enabled, error is retryable, retries available)
      if (isRetryEnabled && hasRetryableError && purchaseRetryManager.canRetry()) {
        // Track retry attempt to New Relic
        newRelicTrack(NewRelicEvent.MAKE_PURCHASE_RETRY, {
          catalogItemId: catalogItemId || '',
          errorCode: errorCode || 'unknown',
          errorMessage,
          flagValue: String(isRetryEnabled),
          hasRetryableError,
          leadUuid: quoteId || '',
          network: typeof navigator !== 'undefined' ? navigator.onLine : true,
          quoteId: quoteId || '',
          retryAttempt: purchaseRetryManager.getRetryCount() + 1,
          tokenLength: recaptchaToken?.length || 0,
        });

        console.log('🔄 Retrying purchase due to retryable error...', {
          errorCode,
          retryAttempt: purchaseRetryManager.getRetryCount() + 1,
        });

        // Increment retry counter
        purchaseRetryManager.incrementRetryCount();

        // Recursively retry the purchase
        return purchaseMembership(args);
      }

      // Throw error with code for downstream handling
      throw new PaymentError(errorMessage, {
        code: errorCode,
        errorCode: errorCode, // Also include as errorCode for consistency
        payment_step: 'purchase-membership',
      });
    }

    // Return success data
    if (result?.data?.purchaseMembership) {
      return result.data.purchaseMembership as PurchaseResult;
    }

    throw new IntegrationError('Invalid response from purchase API', {
      payment_step: 'purchase-membership',
    });
  } catch (error) {
    console.error('Purchase membership error:', error);
    throw error;
  }
}
