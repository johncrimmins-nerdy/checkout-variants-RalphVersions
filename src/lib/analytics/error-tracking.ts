/**
 * Error Tracking Utilities
 * Error classes and tracking for analytics
 * Ported from originals/checkout-ts/src/components/shared/services/tracking/error-classes.ts
 */

import { NewRelicEvent } from './types';

/**
 * Context data that can be included with error tracking
 */
export interface ErrorContext {
  /** Additional context data as needed */
  [key: string]: boolean | number | string | undefined;
  /** Whether this error has already been tracked */
  already_tracked?: boolean;
  /** Availability status */
  apple_pay_instance?: 'available' | 'not available';
  /** Error cause code or identifier */
  cause?: string;
  /** The specific error message */
  error?: string;
  /** The source function/module */
  error_source?: string;
  /** The filename or module */
  filename?: string;
  /** The step in payment/checkout process */
  payment_step?: string;
  /** Quote availability */
  quote?: 'available' | 'not available';
  /** Quote items availability */
  quote_items?: 'available' | 'not available';
  /** Action taken in response */
  response_action?: string;
  /** Apple Pay session availability */
  window_apple_pay_session?: 'available' | 'not available';
}

/**
 * Type guard to check if an error has context
 */
interface ErrorWithContext extends Error {
  context?: ErrorContext;
}

/**
 * Business logic errors
 */
export class BusinessRuleError extends Error {
  constructor(
    message: string,
    public context: ErrorContext = {}
  ) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

/**
 * Checkout flow errors
 */
export class CheckoutFlowError extends Error {
  constructor(
    message: string,
    public context: ErrorContext = {}
  ) {
    super(message);
    this.name = 'CheckoutFlowError';
  }
}

/**
 * Third-party integration errors
 */
export class IntegrationError extends Error {
  constructor(
    message: string,
    public context: ErrorContext = {}
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

/**
 * Payment processing decline errors
 */
export class PaymentDeclineError extends Error {
  constructor(
    message: string,
    public context: ErrorContext = {}
  ) {
    super(message);
    this.name = 'PaymentDeclineError';
  }
}

/**
 * Purchase API response errors
 */
export class PurchaseResponseError extends Error {
  constructor(
    message: string,
    public context: ErrorContext = {}
  ) {
    super(message);
    this.name = 'PurchaseResponseError';
  }
}

/**
 * System/runtime errors
 */
export class SystemError extends Error {
  constructor(
    message: string,
    public context: ErrorContext = {}
  ) {
    super(message);
    this.name = 'SystemError';
  }
}

/**
 * User-initiated errors (e.g., cancelled PayPal)
 */
export class UserBehaviorError extends Error {
  constructor(
    message: string,
    public context: ErrorContext = {}
  ) {
    super(message);
    this.name = 'UserBehaviorError';
  }
}

/**
 * User input validation errors
 */
export class UserValidationError extends Error {
  constructor(
    message: string,
    public context: ErrorContext = {}
  ) {
    super(message);
    this.name = 'UserValidationError';
  }
}

/**
 * Checks if an error has already been tracked
 */
export function isErrorAlreadyTracked(error: unknown): boolean {
  return error instanceof Error && (error as ErrorWithContext).context?.already_tracked === true;
}

/**
 * Tracks a custom event to New Relic
 */
export function newRelicTrack(
  eventName: NewRelicEvent,
  customEventData?: Record<string, boolean | number | string>
): void {
  if (typeof window !== 'undefined' && window.newrelic) {
    window.newrelic.addPageAction(eventName, {
      customEventData,
    });
  }
}

/**
 * Tracks an error to New Relic with context
 */
export function trackErrorWithContext(
  error:
    | BusinessRuleError
    | CheckoutFlowError
    | IntegrationError
    | PaymentDeclineError
    | PurchaseResponseError
    | SystemError
    | UserBehaviorError
    | UserValidationError
): void {
  // Mark as tracked to prevent duplicates
  error.context.already_tracked = true;

  // Determine if error should trigger alerts (critical errors only)
  const alertableTypes = ['SystemError', 'IntegrationError'];
  const alertable = alertableTypes.includes(error.name);

  // Track to New Relic page actions (for analytics/debugging)
  newRelicTrack(NewRelicEvent.CHECKOUT_ERROR, {
    alertable,
    error_message: error.message,
    error_type: error.name,
    ...error.context,
  });

  // Only report alertable errors to New Relic's browser error tracking
  // UserBehaviorError (e.g., user canceled payment) should not count as browser errors
  if (alertable && typeof window !== 'undefined' && window.newrelic) {
    window.newrelic.noticeError(error, {
      alertable,
      error_type: error.name,
      ...error.context,
    });
  }
}
