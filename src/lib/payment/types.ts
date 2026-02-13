/**
 * Payment-related types for checkout
 */

export interface GooglePayError extends Error {
  message: string;
  name: string;
  statusCode: string;
}

export interface PurchaseData {
  deviceData?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  nonce: string;
  paymentMethod: 'APPLE_PAY' | 'CREDIT_CARD' | 'GOOGLE_PAY' | 'PAYPAL';
  savedPaymentMethodId?: string;
  zipCode?: string;
}

export interface PurchaseResult {
  accessToken?: string;
  clientUUID?: string;
  destinationPath: string;
  paymentID: string;
  userUID?: string;
}
