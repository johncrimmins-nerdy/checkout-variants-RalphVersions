/**
 * Error messages and constants for checkout error handling
 */

import { newRelicTrack } from '../analytics/error-tracking';
import { NewRelicEvent } from '../analytics/types';

export const CUSTOMER_SERVICE_PHONE = '888-888-0446';

export const CHECKOUT_ERROR_MESSAGES = {
  FETCH_ITEM_DATA_ERROR: `An unexpected error has occurred. Please contact customer service at ${CUSTOMER_SERVICE_PHONE}.`,
  INTERNAL_ERROR: `An internal error occurred. Please contact customer service at ${CUSTOMER_SERVICE_PHONE}.`,
  INVALID_QUOTE: `This quote is either invalid or expired. Please return to the previous page and select a new quote to continue with your purchase. If you need help, please call us at ${CUSTOMER_SERVICE_PHONE}.`,
  ITEM_NOT_FOUND: `The item you're looking for could not be found. It may have been removed or the link may be incorrect. Please check the URL or contact customer service at ${CUSTOMER_SERVICE_PHONE}.`,
  MISSING_QUOTE_ID: 'No quote ID found in URL',
  MISSING_QUOTE_ID_OR_CATALOG_ITEM_ID: 'Unable to process payment: No quote or catalog item found.',
  PURCHASE_ERROR: `Unable to complete purchase. Please try again or contact customer service at ${CUSTOMER_SERVICE_PHONE}.`,
  QUOTE_FETCH_ERROR: `We couldn't load your quote information. Please try again or contact customer service at ${CUSTOMER_SERVICE_PHONE}.`,
  UNAUTHORIZED: `An unexpected error has occurred. Please contact customer service at ${CUSTOMER_SERVICE_PHONE}.`,
  UNKNOWN_API_ERROR: `An unexpected error has occurred. Please contact customer service at ${CUSTOMER_SERVICE_PHONE}.`,
  USER_ALREADY_EXISTS: `It looks like this email is already in use. Please contact customer service at ${CUSTOMER_SERVICE_PHONE}.`,
  VERIFICATION_ERROR: `We couldn't verify you're a human. Please try again or contact customer service at ${CUSTOMER_SERVICE_PHONE}.`,
} as const;

/**
 * Error codes that can be returned from the GraphQL API
 */
export type ApiErrorCode =
  | 'INTERNAL_ERROR'
  | 'INVALID_QUOTE'
  | 'ITEM_NOT_FOUND'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'USER_ALREADY_EXISTS';

export type CheckoutErrorCode = keyof typeof CHECKOUT_ERROR_MESSAGES;

/** Result from getCheckoutErrorInfo */
export interface CheckoutErrorInfo {
  /** Whether this error was recognized and mapped to a specific message */
  isKnownError: boolean;
  /** User-friendly error message */
  message: string;
  /** Error title for display */
  title: string;
}

/**
 * Parses an API error and returns the appropriate user-friendly message and title.
 * Unknown errors are flagged so they can be reported to New Relic for analysis.
 */
export function getCheckoutErrorInfo(error: unknown): CheckoutErrorInfo {
  // Default error info (unknown error)
  const defaultInfo: CheckoutErrorInfo = {
    isKnownError: false,
    message: CHECKOUT_ERROR_MESSAGES.UNKNOWN_API_ERROR,
    title: 'Something went wrong',
  };

  if (!error || typeof error !== 'object') {
    return defaultInfo;
  }

  // Check for IntegrationError with context
  const errorObj = error as {
    context?: { error_code?: string; underlying_error?: string };
    message?: string;
  };

  const errorCode = errorObj.context?.error_code;
  const errorMessage = errorObj.message || '';
  const underlyingError = errorObj.context?.underlying_error || errorMessage;

  // Check for "not found" errors in the underlying error message
  const isNotFoundError =
    underlyingError.toLowerCase().includes('not found') ||
    underlyingError.includes('404') ||
    errorCode === 'NOT_FOUND';

  if (isNotFoundError) {
    return {
      isKnownError: true,
      message: CHECKOUT_ERROR_MESSAGES.ITEM_NOT_FOUND,
      title: 'Item Not Found',
    };
  }

  // Check for internal errors - match on code OR message content
  // This handles cases where the backend returns "An internal error occurred" without proper error code
  const isInternalError =
    errorCode === 'INTERNAL_ERROR' || errorMessage.toLowerCase().includes('internal error');

  if (isInternalError) {
    return {
      isKnownError: true,
      message: CHECKOUT_ERROR_MESSAGES.INTERNAL_ERROR,
      title: 'Internal Error',
    };
  }

  // Map specific error codes to messages
  switch (errorCode) {
    case 'INVALID_QUOTE':
      return {
        isKnownError: true,
        message: CHECKOUT_ERROR_MESSAGES.INVALID_QUOTE,
        title: 'Invalid Quote',
      };
    case 'QUOTE_FETCH_ERROR':
      return {
        isKnownError: true,
        message: CHECKOUT_ERROR_MESSAGES.QUOTE_FETCH_ERROR,
        title: 'Unable to Load Quote',
      };
    case 'UNAUTHORIZED':
      return {
        isKnownError: true,
        message: CHECKOUT_ERROR_MESSAGES.UNAUTHORIZED,
        title: 'Authentication Required',
      };
    case 'USER_ALREADY_EXISTS':
      return {
        isKnownError: true,
        message: CHECKOUT_ERROR_MESSAGES.USER_ALREADY_EXISTS,
        title: 'Account Already Exists',
      };
    default:
      // Unknown error - will be reported to New Relic
      return defaultInfo;
  }
}

/**
 * Reports an unknown checkout error to New Relic for monitoring.
 * Call this when getCheckoutErrorInfo returns isKnownError: false
 */
export function reportUnknownCheckoutError(
  error: unknown,
  context: { page: 'checkout' | 'welcome-back' }
): void {
  // Only run in browser
  if (typeof window === 'undefined') {
    return;
  }

  // Extract error details
  const errorObj = error as {
    context?: { error_code?: string; underlying_error?: string };
    message?: string;
    name?: string;
  };

  const errorCode = errorObj.context?.error_code || 'UNKNOWN';
  const underlyingError = errorObj.context?.underlying_error || '';
  const errorMessage = errorObj.message || String(error);

  // Report to New Relic as a custom event
  newRelicTrack(NewRelicEvent.UNKNOWN_CHECKOUT_ERROR, {
    error_code: errorCode,
    error_message: errorMessage,
    page: context.page,
    path: window.location.pathname,
    search: window.location.search,
    underlying_error: underlyingError.slice(0, 500), // Truncate long errors
  });

  // Also report as an error for error tracking
  if (window.newrelic) {
    const reportError = error instanceof Error ? error : new Error(errorMessage);
    window.newrelic.noticeError(reportError, {
      error_code: errorCode,
      page: context.page,
    });
  }
}
