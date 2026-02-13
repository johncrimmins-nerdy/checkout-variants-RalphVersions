/**
 * Tests for error-tracking utilities
 * Error classes and New Relic tracking
 */

import {
  BusinessRuleError,
  CheckoutFlowError,
  IntegrationError,
  isErrorAlreadyTracked,
  newRelicTrack,
  PaymentDeclineError,
  PurchaseResponseError,
  SystemError,
  trackErrorWithContext,
  UserBehaviorError,
  UserValidationError,
} from './error-tracking';
import { NewRelicEvent } from './types';

describe('Error Classes', () => {
  describe('BusinessRuleError', () => {
    it('should create error with message and context', () => {
      const error = new BusinessRuleError('Invalid business rule', { cause: 'test' });
      expect(error.message).toBe('Invalid business rule');
      expect(error.name).toBe('BusinessRuleError');
      expect(error.context.cause).toBe('test');
    });

    it('should default to empty context', () => {
      const error = new BusinessRuleError('Test error');
      expect(error.context).toEqual({});
    });
  });

  describe('CheckoutFlowError', () => {
    it('should create error with message and context', () => {
      const error = new CheckoutFlowError('Checkout failed', { payment_step: 'submit' });
      expect(error.message).toBe('Checkout failed');
      expect(error.name).toBe('CheckoutFlowError');
      expect(error.context.payment_step).toBe('submit');
    });
  });

  describe('IntegrationError', () => {
    it('should create error with message and context', () => {
      const error = new IntegrationError('API call failed', { error_source: 'braintree' });
      expect(error.message).toBe('API call failed');
      expect(error.name).toBe('IntegrationError');
      expect(error.context.error_source).toBe('braintree');
    });
  });

  describe('PaymentDeclineError', () => {
    it('should create error with message and context', () => {
      const error = new PaymentDeclineError('Card declined', { cause: 'insufficient_funds' });
      expect(error.message).toBe('Card declined');
      expect(error.name).toBe('PaymentDeclineError');
      expect(error.context.cause).toBe('insufficient_funds');
    });
  });

  describe('PurchaseResponseError', () => {
    it('should create error with message and context', () => {
      const error = new PurchaseResponseError('Purchase failed', { response_action: 'retry' });
      expect(error.message).toBe('Purchase failed');
      expect(error.name).toBe('PurchaseResponseError');
      expect(error.context.response_action).toBe('retry');
    });
  });

  describe('SystemError', () => {
    it('should create error with message and context', () => {
      const error = new SystemError('System failure', { filename: 'checkout.ts' });
      expect(error.message).toBe('System failure');
      expect(error.name).toBe('SystemError');
      expect(error.context.filename).toBe('checkout.ts');
    });
  });

  describe('UserBehaviorError', () => {
    it('should create error with message and context', () => {
      const error = new UserBehaviorError('User cancelled', { payment_step: 'paypal' });
      expect(error.message).toBe('User cancelled');
      expect(error.name).toBe('UserBehaviorError');
      expect(error.context.payment_step).toBe('paypal');
    });
  });

  describe('UserValidationError', () => {
    it('should create error with message and context', () => {
      const error = new UserValidationError('Invalid email', { error: 'email_format' });
      expect(error.message).toBe('Invalid email');
      expect(error.name).toBe('UserValidationError');
      expect(error.context.error).toBe('email_format');
    });
  });
});

describe('isErrorAlreadyTracked', () => {
  it('should return true for error with already_tracked context', () => {
    const error = new IntegrationError('Test', { already_tracked: true });
    expect(isErrorAlreadyTracked(error)).toBe(true);
  });

  it('should return false for error without already_tracked', () => {
    const error = new IntegrationError('Test', {});
    expect(isErrorAlreadyTracked(error)).toBe(false);
  });

  it('should return false for non-Error objects', () => {
    expect(isErrorAlreadyTracked('string error')).toBe(false);
    expect(isErrorAlreadyTracked(null)).toBe(false);
    expect(isErrorAlreadyTracked(undefined)).toBe(false);
    expect(isErrorAlreadyTracked({ message: 'not an error' })).toBe(false);
  });

  it('should return false for standard Error without context', () => {
    const error = new Error('Standard error');
    expect(isErrorAlreadyTracked(error)).toBe(false);
  });
});

describe('newRelicTrack', () => {
  const mockAddPageAction = jest.fn();

  beforeEach(() => {
    mockAddPageAction.mockClear();
    (window as { newrelic?: { addPageAction: jest.Mock } }).newrelic = {
      addPageAction: mockAddPageAction,
    };
  });

  afterEach(() => {
    delete (window as { newrelic?: unknown }).newrelic;
  });

  it('should call newrelic.addPageAction with event name and data', () => {
    newRelicTrack(NewRelicEvent.CHECKOUT_ERROR, { error_type: 'test' });

    expect(mockAddPageAction).toHaveBeenCalledWith(NewRelicEvent.CHECKOUT_ERROR, {
      customEventData: { error_type: 'test' },
    });
  });

  it('should handle missing custom data', () => {
    newRelicTrack(NewRelicEvent.INITIALIZE_AGENT);

    expect(mockAddPageAction).toHaveBeenCalledWith(NewRelicEvent.INITIALIZE_AGENT, {
      customEventData: undefined,
    });
  });

  it('should not throw when newrelic is not available', () => {
    delete (window as { newrelic?: unknown }).newrelic;

    expect(() => newRelicTrack(NewRelicEvent.CHECKOUT_ERROR)).not.toThrow();
  });
});

describe('trackErrorWithContext', () => {
  const mockAddPageAction = jest.fn();
  const mockNoticeError = jest.fn();

  beforeEach(() => {
    mockAddPageAction.mockClear();
    mockNoticeError.mockClear();
    (window as { newrelic?: { addPageAction: jest.Mock; noticeError: jest.Mock } }).newrelic = {
      addPageAction: mockAddPageAction,
      noticeError: mockNoticeError,
    };
  });

  afterEach(() => {
    delete (window as { newrelic?: unknown }).newrelic;
  });

  it('should mark error as already tracked', () => {
    const error = new IntegrationError('Test error', {});
    trackErrorWithContext(error);

    expect(error.context.already_tracked).toBe(true);
  });

  it('should track error to New Relic with context', () => {
    const error = new CheckoutFlowError('Checkout failed', { payment_step: 'submit' });
    trackErrorWithContext(error);

    expect(mockAddPageAction).toHaveBeenCalledWith(NewRelicEvent.CHECKOUT_ERROR, {
      customEventData: expect.objectContaining({
        alertable: false,
        error_message: 'Checkout failed',
        error_type: 'CheckoutFlowError',
        payment_step: 'submit',
      }),
    });
  });

  it('should mark SystemError as alertable', () => {
    const error = new SystemError('System failure', {});
    trackErrorWithContext(error);

    expect(mockAddPageAction).toHaveBeenCalledWith(NewRelicEvent.CHECKOUT_ERROR, {
      customEventData: expect.objectContaining({
        alertable: true,
        error_type: 'SystemError',
      }),
    });
  });

  it('should mark IntegrationError as alertable', () => {
    const error = new IntegrationError('API failure', {});
    trackErrorWithContext(error);

    expect(mockAddPageAction).toHaveBeenCalledWith(NewRelicEvent.CHECKOUT_ERROR, {
      customEventData: expect.objectContaining({
        alertable: true,
        error_type: 'IntegrationError',
      }),
    });
  });

  it('should not mark non-critical errors as alertable', () => {
    const nonCriticalErrors = [
      new BusinessRuleError('Test'),
      new CheckoutFlowError('Test'),
      new PaymentDeclineError('Test'),
      new UserBehaviorError('Test'),
      new UserValidationError('Test'),
      new PurchaseResponseError('Test'),
    ];

    nonCriticalErrors.forEach((error) => {
      mockAddPageAction.mockClear();
      trackErrorWithContext(error);

      const call = mockAddPageAction.mock.calls[0];
      expect(call[0]).toBe(NewRelicEvent.CHECKOUT_ERROR);
      // newRelicTrack wraps data in customEventData
      expect(call[1].customEventData.alertable).toBe(false);
    });
  });

  it('should call noticeError for alertable error types', () => {
    const error = new IntegrationError('API error', { error_source: 'test' });
    trackErrorWithContext(error);

    expect(mockNoticeError).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        alertable: true,
        error_source: 'test',
        error_type: 'IntegrationError',
      })
    );
  });

  it('should NOT call noticeError for UserBehaviorError', () => {
    const error = new UserBehaviorError('User canceled payment', { payment_step: 'apple_pay' });
    trackErrorWithContext(error);

    expect(mockAddPageAction).toHaveBeenCalled();
    expect(mockNoticeError).not.toHaveBeenCalled();
  });
});
