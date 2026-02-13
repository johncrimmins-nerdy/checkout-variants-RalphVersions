/**
 * Payment types and interfaces
 */

export interface BraintreeClientInstance {
  getVersion: () => string;
  request: (options: unknown) => Promise<unknown>;
}

export interface BraintreeDataCollectorInstance {
  deviceData: string;
  teardown: () => void;
}

export interface BraintreeHostedFieldsInstance {
  clear: (field?: string) => void;
  focus: (field: string) => void;
  getState: () => BraintreeHostedFieldsState;
  on: (event: string, handler: (event: unknown) => void) => void;
  setAttribute: (options: { attribute: string; field: string; value: string }) => void;
  teardown: () => Promise<void>;
  tokenize: () => Promise<PaymentMethodNonce>;
}

export interface BraintreeHostedFieldsState {
  cards: Array<{
    niceType: string;
    type: string;
  }>;
  fields: {
    [key: string]: {
      container: HTMLElement;
      isEmpty: boolean;
      isFocused: boolean;
      isPotentiallyValid: boolean;
      isValid: boolean;
    };
  };
}

export interface PaymentMethodNonce {
  details?: {
    cardType?: string;
    lastFour?: string;
    lastTwo?: string;
  };
  nonce: string;
  type: string;
}

export type PaymentMethodType = 'APPLE_PAY' | 'CREDIT_CARD' | 'GOOGLE_PAY' | 'PAYPAL';

export interface PaymentResult {
  deviceData?: string;
  nonce: string;
  paymentMethodType: PaymentMethodType;
}
