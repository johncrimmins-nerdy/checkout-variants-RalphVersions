/**
 * Custom error classes for tracking and categorizing errors
 */

/**
 * Base error class with context
 */
export class ErrorWithContext extends Error {
  public context: Record<string, unknown>;

  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ErrorWithContext';
    this.context = context;
    Object.setPrototypeOf(this, ErrorWithContext.prototype);
  }
}

/**
 * Business rule violations
 */
export class BusinessRuleError extends ErrorWithContext {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context);
    this.name = 'BusinessRuleError';
    Object.setPrototypeOf(this, BusinessRuleError.prototype);
  }
}

/**
 * Checkout flow errors
 */
export class CheckoutFlowError extends ErrorWithContext {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context);
    this.name = 'CheckoutFlowError';
    Object.setPrototypeOf(this, CheckoutFlowError.prototype);
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends ErrorWithContext {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Integration errors (API, third-party services)
 */
export class IntegrationError extends ErrorWithContext {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context);
    this.name = 'IntegrationError';
    Object.setPrototypeOf(this, IntegrationError.prototype);
  }
}

/**
 * Payment decline errors
 */
export class PaymentDeclineError extends ErrorWithContext {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context);
    this.name = 'PaymentDeclineError';
    Object.setPrototypeOf(this, PaymentDeclineError.prototype);
  }
}

/**
 * Payment-related errors
 */
export class PaymentError extends ErrorWithContext {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context);
    this.name = 'PaymentError';
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}

/**
 * Purchase API response errors
 */
export class PurchaseResponseError extends ErrorWithContext {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context);
    this.name = 'PurchaseResponseError';
    Object.setPrototypeOf(this, PurchaseResponseError.prototype);
  }
}

/**
 * System errors (server, infrastructure)
 * Marked as alertable in New Relic
 */
export class SystemError extends ErrorWithContext {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context);
    this.name = 'SystemError';
    Object.setPrototypeOf(this, SystemError.prototype);
  }
}

/**
 * User behavior errors (e.g., abandonment, unexpected actions)
 */
export class UserBehaviorError extends ErrorWithContext {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context);
    this.name = 'UserBehaviorError';
    Object.setPrototypeOf(this, UserBehaviorError.prototype);
  }
}

/**
 * User input validation errors
 */
export class UserValidationError extends ErrorWithContext {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context);
    this.name = 'UserValidationError';
    Object.setPrototypeOf(this, UserValidationError.prototype);
  }
}

/**
 * Validation errors
 */
export class ValidationError extends ErrorWithContext {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
