/**
 * @jest-environment jsdom
 */
import {
  CHECKOUT_ERROR_MESSAGES,
  CUSTOMER_SERVICE_PHONE,
  getCheckoutErrorInfo,
  reportUnknownCheckoutError,
} from './error-messages';

describe('error-messages', () => {
  describe('CUSTOMER_SERVICE_PHONE', () => {
    it('has the correct phone number', () => {
      expect(CUSTOMER_SERVICE_PHONE).toBe('888-888-0446');
    });
  });

  describe('CHECKOUT_ERROR_MESSAGES', () => {
    it('includes phone number in messages', () => {
      expect(CHECKOUT_ERROR_MESSAGES.FETCH_ITEM_DATA_ERROR).toContain(CUSTOMER_SERVICE_PHONE);
      expect(CHECKOUT_ERROR_MESSAGES.INTERNAL_ERROR).toContain(CUSTOMER_SERVICE_PHONE);
      expect(CHECKOUT_ERROR_MESSAGES.INVALID_QUOTE).toContain(CUSTOMER_SERVICE_PHONE);
    });

    it('has all expected error message keys', () => {
      const expectedKeys = [
        'FETCH_ITEM_DATA_ERROR',
        'INTERNAL_ERROR',
        'INVALID_QUOTE',
        'ITEM_NOT_FOUND',
        'MISSING_QUOTE_ID',
        'MISSING_QUOTE_ID_OR_CATALOG_ITEM_ID',
        'PURCHASE_ERROR',
        'QUOTE_FETCH_ERROR',
        'UNAUTHORIZED',
        'UNKNOWN_API_ERROR',
        'USER_ALREADY_EXISTS',
        'VERIFICATION_ERROR',
      ];

      expectedKeys.forEach((key) => {
        expect(CHECKOUT_ERROR_MESSAGES).toHaveProperty(key);
      });
    });
  });

  describe('getCheckoutErrorInfo', () => {
    it('returns default info for null error', () => {
      const result = getCheckoutErrorInfo(null);

      expect(result.isKnownError).toBe(false);
      expect(result.title).toBe('Something went wrong');
      expect(result.message).toBe(CHECKOUT_ERROR_MESSAGES.UNKNOWN_API_ERROR);
    });

    it('returns default info for undefined error', () => {
      const result = getCheckoutErrorInfo(undefined);

      expect(result.isKnownError).toBe(false);
    });

    it('returns default info for non-object error', () => {
      const result = getCheckoutErrorInfo('string error');

      expect(result.isKnownError).toBe(false);
    });

    describe('NOT_FOUND errors', () => {
      it('detects not found from error code', () => {
        const result = getCheckoutErrorInfo({
          context: { error_code: 'NOT_FOUND' },
        });

        expect(result.isKnownError).toBe(true);
        expect(result.title).toBe('Item Not Found');
        expect(result.message).toBe(CHECKOUT_ERROR_MESSAGES.ITEM_NOT_FOUND);
      });

      it('detects not found from underlying error message', () => {
        const result = getCheckoutErrorInfo({
          context: { underlying_error: 'Resource not found' },
        });

        expect(result.isKnownError).toBe(true);
        expect(result.title).toBe('Item Not Found');
      });

      it('detects 404 in error message', () => {
        const result = getCheckoutErrorInfo({
          context: { underlying_error: 'Error 404: Resource missing' },
        });

        expect(result.isKnownError).toBe(true);
        expect(result.title).toBe('Item Not Found');
      });

      it('uses message as fallback for underlying_error', () => {
        const result = getCheckoutErrorInfo({
          message: 'not found',
        });

        expect(result.isKnownError).toBe(true);
        expect(result.title).toBe('Item Not Found');
      });
    });

    describe('INTERNAL_ERROR', () => {
      it('detects internal error from error code', () => {
        const result = getCheckoutErrorInfo({
          context: { error_code: 'INTERNAL_ERROR' },
        });

        expect(result.isKnownError).toBe(true);
        expect(result.title).toBe('Internal Error');
        expect(result.message).toBe(CHECKOUT_ERROR_MESSAGES.INTERNAL_ERROR);
      });

      it('detects internal error from message content', () => {
        const result = getCheckoutErrorInfo({
          message: 'An internal error occurred',
        });

        expect(result.isKnownError).toBe(true);
        expect(result.title).toBe('Internal Error');
      });
    });

    describe('INVALID_QUOTE', () => {
      it('handles invalid quote error', () => {
        const result = getCheckoutErrorInfo({
          context: { error_code: 'INVALID_QUOTE' },
        });

        expect(result.isKnownError).toBe(true);
        expect(result.title).toBe('Invalid Quote');
        expect(result.message).toBe(CHECKOUT_ERROR_MESSAGES.INVALID_QUOTE);
      });
    });

    describe('UNAUTHORIZED', () => {
      it('handles unauthorized error', () => {
        const result = getCheckoutErrorInfo({
          context: { error_code: 'UNAUTHORIZED' },
        });

        expect(result.isKnownError).toBe(true);
        expect(result.title).toBe('Authentication Required');
        expect(result.message).toBe(CHECKOUT_ERROR_MESSAGES.UNAUTHORIZED);
      });
    });

    describe('QUOTE_FETCH_ERROR', () => {
      it('handles quote fetch error', () => {
        const result = getCheckoutErrorInfo({
          context: { error_code: 'QUOTE_FETCH_ERROR' },
        });

        expect(result.isKnownError).toBe(true);
        expect(result.title).toBe('Unable to Load Quote');
        expect(result.message).toBe(CHECKOUT_ERROR_MESSAGES.QUOTE_FETCH_ERROR);
      });
    });

    describe('USER_ALREADY_EXISTS', () => {
      it('handles user already exists error', () => {
        const result = getCheckoutErrorInfo({
          context: { error_code: 'USER_ALREADY_EXISTS' },
        });

        expect(result.isKnownError).toBe(true);
        expect(result.title).toBe('Account Already Exists');
        expect(result.message).toBe(CHECKOUT_ERROR_MESSAGES.USER_ALREADY_EXISTS);
      });
    });

    it('returns unknown for unrecognized error codes', () => {
      const result = getCheckoutErrorInfo({
        context: { error_code: 'SOME_NEW_ERROR' },
      });

      expect(result.isKnownError).toBe(false);
    });
  });

  describe('reportUnknownCheckoutError', () => {
    const mockAddPageAction = jest.fn();
    const mockNoticeError = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();

      Object.defineProperty(window, 'newrelic', {
        configurable: true,
        value: {
          addPageAction: mockAddPageAction,
          noticeError: mockNoticeError,
        },
        writable: true,
      });

      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          pathname: '/checkout',
          search: '?quoteId=123',
        },
        writable: true,
      });
    });

    afterEach(() => {
      window.newrelic = undefined;
    });

    it('reports error to New Relic addPageAction', () => {
      const error = {
        context: { error_code: 'UNKNOWN', underlying_error: 'Something bad' },
        message: 'Error message',
      };

      reportUnknownCheckoutError(error, { page: 'checkout' });

      expect(mockAddPageAction).toHaveBeenCalledWith('unknown_checkout_error', {
        customEventData: expect.objectContaining({
          error_code: 'UNKNOWN',
          error_message: 'Error message',
          page: 'checkout',
          path: '/checkout',
          search: '?quoteId=123',
        }),
      });
    });

    it('reports error to New Relic noticeError', () => {
      const error = new Error('Test error');

      reportUnknownCheckoutError(error, { page: 'welcome-back' });

      expect(mockNoticeError).toHaveBeenCalledWith(error, {
        error_code: 'UNKNOWN',
        page: 'welcome-back',
      });
    });

    it('truncates long underlying errors', () => {
      const longError = 'x'.repeat(600);
      const error = {
        context: { underlying_error: longError },
      };

      reportUnknownCheckoutError(error, { page: 'checkout' });

      expect(mockAddPageAction).toHaveBeenCalledWith('unknown_checkout_error', {
        customEventData: expect.objectContaining({
          underlying_error: 'x'.repeat(500),
        }),
      });
    });

    it('does nothing when newrelic is not available', () => {
      window.newrelic = undefined;

      // Should not throw
      expect(() =>
        reportUnknownCheckoutError(new Error('Test'), { page: 'checkout' })
      ).not.toThrow();
    });

    it('handles non-Error objects', () => {
      reportUnknownCheckoutError({ message: 'Plain object error' }, { page: 'checkout' });

      expect(mockNoticeError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          page: 'checkout',
        })
      );
    });

    it('handles error without context', () => {
      reportUnknownCheckoutError({ message: 'No context' }, { page: 'checkout' });

      expect(mockAddPageAction).toHaveBeenCalledWith('unknown_checkout_error', {
        customEventData: expect.objectContaining({
          error_code: 'UNKNOWN',
          underlying_error: '',
        }),
      });
    });
  });
});
