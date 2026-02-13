/**
 * Tests for custom error classes
 */

import {
  BusinessRuleError,
  CheckoutFlowError,
  ConfigurationError,
  ErrorWithContext,
  IntegrationError,
  PaymentDeclineError,
  PaymentError,
  PurchaseResponseError,
  SystemError,
  UserBehaviorError,
  UserValidationError,
  ValidationError,
} from './error-classes';

describe('ErrorWithContext', () => {
  it('should create error with message', () => {
    const error = new ErrorWithContext('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('ErrorWithContext');
  });

  it('should create error with context', () => {
    const context = { key: 'value', num: 123 };
    const error = new ErrorWithContext('Test error', context);
    expect(error.context).toEqual(context);
  });

  it('should have empty context by default', () => {
    const error = new ErrorWithContext('Test error');
    expect(error.context).toEqual({});
  });

  it('should be instanceof Error', () => {
    const error = new ErrorWithContext('Test error');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ErrorWithContext);
  });
});

describe('BusinessRuleError', () => {
  it('should have correct name', () => {
    const error = new BusinessRuleError('Business rule violated');
    expect(error.name).toBe('BusinessRuleError');
  });

  it('should extend ErrorWithContext', () => {
    const error = new BusinessRuleError('Test', { rule: 'test-rule' });
    expect(error).toBeInstanceOf(ErrorWithContext);
    expect(error.context).toEqual({ rule: 'test-rule' });
  });
});

describe('CheckoutFlowError', () => {
  it('should have correct name', () => {
    const error = new CheckoutFlowError('Checkout flow failed');
    expect(error.name).toBe('CheckoutFlowError');
  });

  it('should extend ErrorWithContext', () => {
    const error = new CheckoutFlowError('Test', { step: 'payment' });
    expect(error).toBeInstanceOf(ErrorWithContext);
    expect(error.context).toEqual({ step: 'payment' });
  });
});

describe('ConfigurationError', () => {
  it('should have correct name', () => {
    const error = new ConfigurationError('Missing configuration');
    expect(error.name).toBe('ConfigurationError');
  });

  it('should extend ErrorWithContext', () => {
    const error = new ConfigurationError('Test', { configKey: 'API_KEY' });
    expect(error).toBeInstanceOf(ErrorWithContext);
  });
});

describe('IntegrationError', () => {
  it('should have correct name', () => {
    const error = new IntegrationError('API integration failed');
    expect(error.name).toBe('IntegrationError');
  });

  it('should extend ErrorWithContext', () => {
    const error = new IntegrationError('Test', { service: 'Braintree', status: 500 });
    expect(error).toBeInstanceOf(ErrorWithContext);
    expect(error.context).toEqual({ service: 'Braintree', status: 500 });
  });
});

describe('PaymentDeclineError', () => {
  it('should have correct name', () => {
    const error = new PaymentDeclineError('Payment declined');
    expect(error.name).toBe('PaymentDeclineError');
  });

  it('should extend ErrorWithContext', () => {
    const error = new PaymentDeclineError('Test', { declineCode: '2010' });
    expect(error).toBeInstanceOf(ErrorWithContext);
    expect(error.context).toEqual({ declineCode: '2010' });
  });
});

describe('PaymentError', () => {
  it('should have correct name', () => {
    const error = new PaymentError('Payment processing failed');
    expect(error.name).toBe('PaymentError');
  });

  it('should extend ErrorWithContext', () => {
    const error = new PaymentError('Test', { paymentMethod: 'credit_card' });
    expect(error).toBeInstanceOf(ErrorWithContext);
  });
});

describe('PurchaseResponseError', () => {
  it('should have correct name', () => {
    const error = new PurchaseResponseError('Invalid purchase response');
    expect(error.name).toBe('PurchaseResponseError');
  });

  it('should extend ErrorWithContext', () => {
    const error = new PurchaseResponseError('Test', { responseCode: 'INVALID' });
    expect(error).toBeInstanceOf(ErrorWithContext);
  });
});

describe('SystemError', () => {
  it('should have correct name', () => {
    const error = new SystemError('System error occurred');
    expect(error.name).toBe('SystemError');
  });

  it('should extend ErrorWithContext', () => {
    const error = new SystemError('Test', { server: 'api.example.com' });
    expect(error).toBeInstanceOf(ErrorWithContext);
    expect(error.context).toEqual({ server: 'api.example.com' });
  });
});

describe('UserBehaviorError', () => {
  it('should have correct name', () => {
    const error = new UserBehaviorError('User abandoned checkout');
    expect(error.name).toBe('UserBehaviorError');
  });

  it('should extend ErrorWithContext', () => {
    const error = new UserBehaviorError('Test', { action: 'cancelled' });
    expect(error).toBeInstanceOf(ErrorWithContext);
  });
});

describe('UserValidationError', () => {
  it('should have correct name', () => {
    const error = new UserValidationError('Invalid user input');
    expect(error.name).toBe('UserValidationError');
  });

  it('should extend ErrorWithContext', () => {
    const error = new UserValidationError('Test', { field: 'email' });
    expect(error).toBeInstanceOf(ErrorWithContext);
    expect(error.context).toEqual({ field: 'email' });
  });
});

describe('ValidationError', () => {
  it('should have correct name', () => {
    const error = new ValidationError('Validation failed');
    expect(error.name).toBe('ValidationError');
  });

  it('should extend ErrorWithContext', () => {
    const error = new ValidationError('Test', { validationType: 'schema' });
    expect(error).toBeInstanceOf(ErrorWithContext);
  });
});

describe('Error instanceof checks', () => {
  it('all errors should be instanceof Error', () => {
    const errors = [
      new ErrorWithContext('test'),
      new BusinessRuleError('test'),
      new CheckoutFlowError('test'),
      new ConfigurationError('test'),
      new IntegrationError('test'),
      new PaymentDeclineError('test'),
      new PaymentError('test'),
      new PurchaseResponseError('test'),
      new SystemError('test'),
      new UserBehaviorError('test'),
      new UserValidationError('test'),
      new ValidationError('test'),
    ];

    errors.forEach((error) => {
      expect(error).toBeInstanceOf(Error);
    });
  });

  it('specific errors should be instanceof their own class', () => {
    expect(new BusinessRuleError('test')).toBeInstanceOf(BusinessRuleError);
    expect(new PaymentDeclineError('test')).toBeInstanceOf(PaymentDeclineError);
    expect(new SystemError('test')).toBeInstanceOf(SystemError);
  });
});
