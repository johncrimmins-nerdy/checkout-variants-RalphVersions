import { calculateDiscountLabel } from '../utils/discount';
import { IntegrationError } from '../utils/error-classes';
import { getGraphQLUrl } from '../utils/get-graphql-url';

export enum SavedPaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  PAYPAL = 'PAYPAL',
}

export interface Buyer {
  firstName: string;
  id: string;
}

export interface CheckoutDetailsArgs {
  clientID?: string;
  isLeadResubmissionFlow?: boolean;
  promoCode?: string;
  purchasableID?: string;
  purchasableType?: PurchasableType;
  subject?: string;
  winbackAIEnabled?: boolean;
}

export type CheckoutDetailsResponse =
  | CheckoutNotReady
  | CheckoutReady
  | CheckoutReadyForAuthenticatedUser
  | CheckoutReadyForGuest;

export interface CheckoutNotReady {
  __typename: 'CheckoutNotReady';
  reason: string;
}

export interface CheckoutReady {
  __typename: 'CheckoutReady';
  buyer: Buyer;
  options?: Purchasable[];
  purchasable?: Purchasable;
  winback?: Winback;
}

export interface CheckoutReadyForAuthenticatedUser {
  __typename: 'CheckoutReadyForAuthenticatedUser';
  buyer: Buyer;
  options?: Purchasable[];
  purchasable?: Purchasable;
  savedPaymentMethod?: null | SavedPaymentMethod;
  winback?: Winback;
}

export interface CheckoutReadyForGuest {
  __typename: 'CheckoutReadyForGuest';
  options?: Purchasable[];
  purchasable?: Purchasable;
}

export interface Purchasable {
  currencyCode: string;
  discountLabel?: string;
  entitledHours: number;
  /** First installment amount (formatted string, e.g., "1,000") - only for packages with installments */
  firstInstallment?: string;
  /** First installment amount in cents - only for packages with installments */
  firstInstallmentCents?: number;
  /** Whether this purchasable has installment payments */
  hasInstallments?: boolean;
  id: string;
  /** Whether this is a package product (vs membership) */
  isPackage?: boolean;
  name: string;
  /** Number of payments (1 = one-time, 2 = installments) */
  numberOfPayments?: number;
  oldPriceCents?: number;
  priceCents: number;
  /** Second installment amount (formatted string, e.g., "1,000") - only for packages with installments */
  secondInstallment?: string;
  /** Second installment amount in cents - only for packages with installments */
  secondInstallmentCents?: number;
  type: 'CATALOG_ITEM' | 'QUOTE';
}

export interface PurchasableInput {
  id: string;
  type: PurchasableType;
}

// Types for CheckoutDetails query
export type PurchasableType = 'CATALOG_ITEM' | 'QUOTE';

export interface SavedPaymentMethod {
  cardBrand?: string;
  expirationDate?: string;
  id: string;
  lastFourDigits?: string;
  type: SavedPaymentMethodType;
}

export interface Winback {
  headline: string;
  message: string;
}

/**
 * Checks if the user can proceed with checkout for a given quote or catalog item
 * @param args - Checkout details arguments
 * @returns Promise that resolves to checkout details response
 */
export async function checkoutDetails(
  args: CheckoutDetailsArgs,
  options?: { cookieHeader?: string }
): Promise<CheckoutDetailsResponse> {
  const startTime = Date.now();
  let httpStatus: number | undefined;
  let responseBody: string | undefined;

  try {
    const graphqlUrl = getGraphQLUrl();
    const {
      clientID,
      isLeadResubmissionFlow,
      promoCode,
      purchasableID,
      purchasableType,
      subject,
      winbackAIEnabled,
    } = args;

    const winbackAIMessageFragment = winbackAIEnabled
      ? `
      winback {
        headline
        message
      }
    `
      : '';

    const query = `
      query CheckoutDetails($input: CheckoutDetailsInput!) {
        checkoutDetails(input: $input) {
          __typename
          ... on CheckoutReady {
            buyer {
              id
              firstName
            }
            purchasable {
              id
              name
              type
              entitledHours
              oldPriceCents
              priceCents
              currencyCode
              discountLabel
            }
            options {
              id
              name
              type
              entitledHours
              oldPriceCents
              priceCents
              currencyCode
              discountLabel
            }
            ${winbackAIMessageFragment}
          }
          ... on CheckoutReadyForAuthenticatedUser {
            buyer {
              id
              firstName
            }
            savedPaymentMethod {
              id
              lastFourDigits
              expirationDate
              type
              cardBrand
            }
            purchasable {
              id
              name
              type
              entitledHours
              oldPriceCents
              priceCents
              currencyCode
              discountLabel
            }
            options {
              id
              name
              type
              entitledHours
              oldPriceCents
              priceCents
              currencyCode
              discountLabel
            }
            ${winbackAIMessageFragment}
          }
          ... on CheckoutReadyForGuest {
            purchasable {
              id
              name
              type
              entitledHours
              oldPriceCents
              priceCents
              currencyCode
              discountLabel
            }
            options {
              id
              name
              type
              entitledHours
              oldPriceCents
              priceCents
              currencyCode
              discountLabel
            }
          }
          ... on CheckoutNotReady {
            reason
          }
        }
      }
    `;

    const variables = {
      input: {
        ...(purchasableType && purchasableID
          ? {
              purchasable: {
                id: purchasableID,
                type: purchasableType,
              },
            }
          : {}),
        ...(promoCode ? { promoCodeId: promoCode } : {}),
        ...(clientID
          ? {
              buyer: {
                id: clientID,
                type: 'CLIENT',
              },
            }
          : {}),
        ...(subject && isLeadResubmissionFlow ? { subjectId: subject } : {}),
      },
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add cookie header for server-side requests
    if (options?.cookieHeader) {
      headers.Cookie = options.cookieHeader;
    }

    // Debug logging for checkout details request
    console.debug('[checkoutDetails] Request:', {
      apiDomainEnvVar: process.env.NEXT_PUBLIC_API_DOMAIN,
      graphqlUrl,
      hasCookies: !!options?.cookieHeader,
      input: variables.input,
      nodeEnv: process.env.NODE_ENV,
      publicEnv: process.env.NEXT_PUBLIC_ENV,
    });

    const response = await fetch(graphqlUrl, {
      body: JSON.stringify({
        operationName: 'CheckoutDetails',
        query,
        variables,
      }),
      credentials: 'include',
      headers,
      method: 'POST',
    });

    httpStatus = response.status;

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Could not read response body');
      throw new IntegrationError(`HTTP error: ${response.status}: ${response.statusText}`, {
        duration_ms: Date.now() - startTime,
        http_status: response.status,
        payment_step: 'checkout-details',
        purchasable_id: purchasableID,
        purchasable_type: purchasableType,
        response_body_preview: errorBody.substring(0, 500),
      });
    }

    const result = await response.json();
    responseBody = JSON.stringify(result).substring(0, 1000);

    // Debug logging for response
    console.debug('[checkoutDetails] Response:', {
      errorExtensions: result?.errors?.[0]?.extensions,
      errors: result?.errors,
      reason: result?.data?.checkoutDetails?.reason,
      typename: result?.data?.checkoutDetails?.__typename,
    });

    if (result?.errors && result.errors.length > 0) {
      const error = result.errors[0];
      const errorCode = error?.extensions?.code;
      const underlyingError = error?.extensions?.underlyingError;
      const errorMessage = error?.message || 'An error occurred during checkout details check.';

      throw new IntegrationError(errorMessage, {
        duration_ms: Date.now() - startTime,
        error_code: errorCode,
        graphql_error_count: result.errors.length,
        http_status: httpStatus,
        payment_step: 'checkout-details',
        purchasable_id: purchasableID,
        purchasable_type: purchasableType,
        underlying_error: underlyingError,
      });
    }

    if (!result?.data?.checkoutDetails) {
      throw new IntegrationError('No checkout details returned from API', {
        duration_ms: Date.now() - startTime,
        http_status: httpStatus,
        payment_step: 'checkout-details',
        purchasable_id: purchasableID,
        purchasable_type: purchasableType,
        response_body_preview: responseBody,
      });
    }

    // Enrich purchasables with calculated discount labels if not provided by the API
    return enrichCheckoutResponse(result.data.checkoutDetails);
  } catch (error) {
    if (error instanceof IntegrationError) {
      throw error;
    }
    throw new IntegrationError('Checkout details fetch failed', {
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
      error_name: error instanceof Error ? error.name : 'Unknown',
      http_status: httpStatus,
      payment_step: 'checkout-details',
      purchasable_id: args.purchasableID,
      purchasable_type: args.purchasableType,
    });
  }
}

/**
 * Helper function to check if checkout details represent an authenticated user ready state
 */
export function isIdentifiedUserCheckout(
  checkoutDetails: CheckoutDetailsResponse
): checkoutDetails is CheckoutReady | CheckoutReadyForAuthenticatedUser {
  return (
    checkoutDetails.__typename === 'CheckoutReady' ||
    checkoutDetails.__typename === 'CheckoutReadyForAuthenticatedUser'
  );
}

/**
 * Adds calculated discountLabel to purchasables when not provided by the API
 */
function enrichCheckoutResponse<T extends CheckoutDetailsResponse>(response: T): T {
  if (response.__typename === 'CheckoutNotReady') return response;

  const addDiscountLabel = (p: Purchasable): Purchasable => {
    if (p.discountLabel) return p;
    const discountLabel = calculateDiscountLabel(p.oldPriceCents, p.priceCents);
    return discountLabel ? { ...p, discountLabel } : p;
  };

  return {
    ...response,
    ...('purchasable' in response &&
      response.purchasable && { purchasable: addDiscountLabel(response.purchasable) }),
    ...('options' in response &&
      response.options && { options: response.options.map(addDiscountLabel) }),
  };
}
