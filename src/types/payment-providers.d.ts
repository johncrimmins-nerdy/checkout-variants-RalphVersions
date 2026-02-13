/**
 * Global type declarations for payment providers
 */

import * as braintree from 'braintree-web';

// Apple Pay Recurring Payment Request Types
export interface ApplePayRecurringPaymentRequest {
  /** URL where users can manage their subscription */
  managementURL: string;
  /** Description of the payment (e.g., "Tutoring Package monthly subscription") */
  paymentDescription: string;
  /** Regular billing configuration */
  regularBilling: {
    /** Amount to charge (e.g., "249.00") */
    amount: string;
    /** Label shown in Apple Pay sheet */
    label: string;
    /** Payment timing: 'recurring' for subscriptions */
    paymentTiming: 'recurring';
    /** Type of billing: 'final' for confirmed amount */
    type: 'final';
  };
}

/**
 * Extended Apple Pay Payment Request that includes recurring payment support
 * This is needed because the base Braintree type doesn't include recurringPaymentRequest
 */
export interface ExtendedApplePayPaymentRequest extends braintree.ApplePayPaymentRequest {
  recurringPaymentRequest?: ApplePayRecurringPaymentRequest;
}

// Apple Pay
declare global {
  interface ApplePaySessionConstructor {
    canMakePayments(): boolean;
    new (version: number, request: ApplePayJS.ApplePayPaymentRequest): ApplePaySession;
    STATUS_FAILURE: number;
    STATUS_SUCCESS: number;
    supportsVersion(version: number): boolean;
  }

  interface Window {
    ApplePaySession?: ApplePaySessionConstructor;
    paypal?: typeof import('@paypal/paypal-js');
  }

  class ApplePaySession {
    oncancel: ((event: ApplePayJS.Event) => void) | null;
    onpaymentauthorized: ((event: ApplePayJS.ApplePayPaymentAuthorizedEvent) => void) | null;
    onpaymentmethodselected:
      | ((event: ApplePayJS.ApplePayPaymentMethodSelectedEvent) => void)
      | null;
    onshippingcontactselected:
      | ((event: ApplePayJS.ApplePayShippingContactSelectedEvent) => void)
      | null;
    onshippingmethodselected:
      | ((event: ApplePayJS.ApplePayShippingMethodSelectedEvent) => void)
      | null;
    onvalidatemerchant: ((event: ApplePayJS.ApplePayValidateMerchantEvent) => void) | null;
    static canMakePayments(): boolean;
    static supportsVersion(version: number): boolean;
    abort(): void;
    begin(): void;
    completeMerchantValidation(merchantSession: unknown): void;
    completePayment(status: number): void;
  }
}

// Google Pay
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace google {
  namespace payments {
    namespace api {
      class PaymentsClient {
        constructor(options: { environment: 'PRODUCTION' | 'TEST' });
        createButton(options: unknown): HTMLElement;
        isReadyToPay(request: unknown): Promise<{ result: boolean }>;
        loadPaymentData(request: unknown): Promise<unknown>;
      }
    }
  }
}

export {};
