/**
 * Tests for purchase membership API
 */

import type { PurchaseMembershipArgs } from './purchase-membership';

import { purchaseMembership } from './purchase-membership';

// Mock dependencies
const mockGetCookie = jest.fn();
jest.mock('../utils/cookie', () => ({
  getCookie: (name: string) => mockGetCookie(name),
}));

jest.mock('../utils/get-graphql-url', () => ({
  getGraphQLUrl: () => 'https://api.example.com/graphql',
}));

const mockCanRetry = jest.fn();
const mockGetRetryCount = jest.fn();
const mockIncrementRetryCount = jest.fn();
jest.mock('../services/purchase-retry-manager', () => ({
  purchaseRetryManager: {
    canRetry: () => mockCanRetry(),
    getRetryCount: () => mockGetRetryCount(),
    incrementRetryCount: () => mockIncrementRetryCount(),
  },
}));

// Mock window
const mockNewrelic = {
  addPageAction: jest.fn(),
};

const originalWindow = global.window;

describe('purchaseMembership', () => {
  const mockFetch = jest.fn();
  const originalFetch = global.fetch;

  const baseArgs: PurchaseMembershipArgs = {
    catalogItemId: 'catalog-123',
    checkoutDetails: {
      __typename: 'CheckoutReady',
      buyer: { firstName: 'John', id: 'buyer-123' },
      purchasable: {
        currencyCode: 'USD',
        entitledHours: 10,
        id: 'purchasable-123',
        name: 'Test Package',
        priceCents: 40000,
        type: 'CATALOG_ITEM',
      },
    },
    clientID: 'client-456',
    currencyCode: 'USD',
    durationSeconds: 36000,
    isLeadResubmissionFlow: false,
    isRetryEnabled: false,
    previousPriceCents: 50000,
    priceCents: 40000,
    purchaseData: {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      nonce: 'test-nonce-12345678901234567890',
      paymentMethod: 'CREDIT_CARD',
      zipCode: '12345',
    },
    recaptchaToken: 'recaptcha-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch;
    mockGetCookie.mockReturnValue('');
    mockCanRetry.mockReturnValue(false);
    mockGetRetryCount.mockReturnValue(0);

    // Mock window.location
    Object.defineProperty(global, 'window', {
      configurable: true,
      value: {
        location: {
          search: '',
        },
        newrelic: mockNewrelic,
      },
      writable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.window = originalWindow;
  });

  describe('successful purchase', () => {
    it('returns purchase result on success', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: {
              purchaseMembership: {
                accessToken: 'access-token',
                clientUUID: 'client-uuid',
                destinationPath: '/success',
                paymentID: 'payment-123',
                userUID: 'user-uid',
              },
            },
          }),
        ok: true,
      });

      const result = await purchaseMembership(baseArgs);

      expect(result).toEqual({
        accessToken: 'access-token',
        clientUUID: 'client-uuid',
        destinationPath: '/success',
        paymentID: 'payment-123',
        userUID: 'user-uid',
      });
    });

    it('requests paymentID in the GraphQL mutation', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: {
              purchaseMembership: {
                destinationPath: '/success',
                paymentID: 'payment-123',
              },
            },
          }),
        ok: true,
      });

      await purchaseMembership(baseArgs);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.query).toContain('paymentID');
    });

    it('includes tracking data from cookies', async () => {
      mockGetCookie.mockImplementation((name) => {
        if (name === 'landing_page') return 'https://landing.com';
        if (name === 'referrer') return 'https://referrer.com';
        if (name === 'visitor_id') return 'visitor-123';
        return '';
      });

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: { purchaseMembership: { destinationPath: '/success' } },
          }),
        ok: true,
      });

      await purchaseMembership(baseArgs);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.variables.input.trackingInfo).toEqual({
        landing_page: 'https://landing.com',
        referer: 'https://referrer.com',
        visitor_id: 'visitor-123',
      });
    });

    it('includes enrollment item ID from URL when present', async () => {
      Object.defineProperty(global, 'window', {
        configurable: true,
        value: {
          location: { search: '?enrollmentItemId=enroll-123' },
          newrelic: mockNewrelic,
        },
        writable: true,
      });

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: { purchaseMembership: { destinationPath: '/success' } },
          }),
        ok: true,
      });

      await purchaseMembership(baseArgs);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.variables.input.enrollmentItemId).toBe('enroll-123');
    });
  });

  describe('payment data', () => {
    it('uses saved payment method when provided', async () => {
      const argsWithSavedMethod = {
        ...baseArgs,
        purchaseData: {
          ...baseArgs.purchaseData,
          savedPaymentMethodId: 'saved-pm-123',
        },
      };

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: { purchaseMembership: { destinationPath: '/success' } },
          }),
        ok: true,
      });

      await purchaseMembership(argsWithSavedMethod);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.variables.input.payment.paymentMethodId).toBe('saved-pm-123');
      expect(body.variables.input.payment.billingAddress).toBeUndefined();
    });

    it('includes billing address for new payment method', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: { purchaseMembership: { destinationPath: '/success' } },
          }),
        ok: true,
      });

      await purchaseMembership(baseArgs);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.variables.input.payment.billingAddress).toEqual({
        countryCode: 'US',
        zipCode: '12345',
      });
      expect(body.variables.input.payment.firstName).toBe('John');
      expect(body.variables.input.payment.lastName).toBe('Doe');
    });

    it('sets countryCode to CA for CAD currency', async () => {
      const cadArgs = {
        ...baseArgs,
        currencyCode: 'CAD',
      };

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: { purchaseMembership: { destinationPath: '/success' } },
          }),
        ok: true,
      });

      await purchaseMembership(cadArgs);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.variables.input.payment.billingAddress.countryCode).toBe('CA');
    });

    it('sets countryCode to GB for GBP currency', async () => {
      const gbpArgs = {
        ...baseArgs,
        currencyCode: 'GBP',
      };

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: { purchaseMembership: { destinationPath: '/success' } },
          }),
        ok: true,
      });

      await purchaseMembership(gbpArgs);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.variables.input.payment.billingAddress.countryCode).toBe('GB');
    });
  });

  describe('quote vs catalog item', () => {
    it('builds membership item for catalog purchase', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: { purchaseMembership: { destinationPath: '/success' } },
          }),
        ok: true,
      });

      await purchaseMembership(baseArgs);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.variables.input.membershipItem).toEqual({
        currency: 'USD',
        durationSeconds: 36000,
        id: 'catalog-123',
        oldPriceCents: 50000,
        priceCents: 40000,
      });
    });

    it('sets membershipItem to null for quote purchase', async () => {
      const quoteArgs = {
        ...baseArgs,
        catalogItemId: null,
        quoteId: 'quote-123',
      };

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: { purchaseMembership: { destinationPath: '/success' } },
          }),
        ok: true,
      });

      await purchaseMembership(quoteArgs);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.variables.input.membershipItem).toBeNull();
      expect(body.variables.input.quoteId).toBe('quote-123');
    });
  });

  describe('lead resubmission', () => {
    it('sets isChurnedUser flag when in lead resubmission flow', async () => {
      const leadArgs = {
        ...baseArgs,
        isLeadResubmissionFlow: true,
      };

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: { purchaseMembership: { destinationPath: '/success' } },
          }),
        ok: true,
      });

      await purchaseMembership(leadArgs);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.variables.input.isChurnedUser).toBe(true);
    });
  });

  describe('promo code', () => {
    it('includes promo code when provided', async () => {
      const promoArgs = {
        ...baseArgs,
        promoCode: 'SAVE20',
      };

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: { purchaseMembership: { destinationPath: '/success' } },
          }),
        ok: true,
      });

      await purchaseMembership(promoArgs);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.variables.input.promoCodeId).toBe('SAVE20');
    });
  });

  describe('error handling', () => {
    it('throws PaymentError for 401 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(purchaseMembership(baseArgs)).rejects.toThrow('Unauthorized - please sign in');
    });

    it('throws IntegrationError for other HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ errors: [{ message: 'Server error' }] }),
        ok: false,
        status: 500,
      });

      await expect(purchaseMembership(baseArgs)).rejects.toThrow('Server error');
    });

    it('throws PaymentError for GraphQL errors', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            errors: [{ extensions: { code: 'PAYMENT_FAILED' }, message: 'Card declined' }],
          }),
        ok: true,
      });

      await expect(purchaseMembership(baseArgs)).rejects.toThrow('Card declined');
    });

    it('throws IntegrationError for invalid response', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: {} }),
        ok: true,
      });

      await expect(purchaseMembership(baseArgs)).rejects.toThrow(
        'Invalid response from purchase API'
      );
    });
  });

  describe('retry logic', () => {
    beforeEach(() => {
      mockFetch.mockReset();
      mockCanRetry.mockReset();
      mockIncrementRetryCount.mockClear();
      mockGetRetryCount.mockReset();
      mockNewrelic.addPageAction.mockClear();
    });

    it('retries on retryable error when all conditions met', async () => {
      // First call: can retry, second call: cannot retry
      mockCanRetry.mockReturnValueOnce(true).mockReturnValueOnce(false);
      mockGetRetryCount.mockReturnValue(0);

      // First call fails with retryable error, second call succeeds
      mockFetch
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              errors: [{ extensions: { code: 'RETRY_ME', isRetryable: true }, message: 'Retry' }],
            }),
          ok: true,
        })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              data: { purchaseMembership: { destinationPath: '/success' } },
            }),
          ok: true,
        });

      const retryArgs = {
        ...baseArgs,
        isRetryEnabled: true,
      };

      const result = await purchaseMembership(retryArgs);

      expect(mockIncrementRetryCount).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.destinationPath).toBe('/success');
    });

    it('tracks retry attempt to New Relic', async () => {
      mockCanRetry.mockReturnValueOnce(true).mockReturnValueOnce(false);
      mockGetRetryCount.mockReturnValue(0);

      mockFetch
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              errors: [{ extensions: { code: 'RETRY_ME', isRetryable: true }, message: 'Retry' }],
            }),
          ok: true,
        })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              data: { purchaseMembership: { destinationPath: '/success' } },
            }),
          ok: true,
        });

      const retryArgs = {
        ...baseArgs,
        isRetryEnabled: true,
      };

      await purchaseMembership(retryArgs);

      expect(mockNewrelic.addPageAction).toHaveBeenCalledWith('make_purchase_retry', {
        customEventData: expect.objectContaining({
          catalogItemId: 'catalog-123',
          errorCode: 'RETRY_ME',
          retryAttempt: 1,
        }),
      });
    });

    it('does not retry when flag is disabled', async () => {
      mockCanRetry.mockReturnValue(true); // Would retry if flag enabled

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            errors: [{ extensions: { code: 'RETRY_ME', isRetryable: true }, message: 'Retry' }],
          }),
        ok: true,
      });

      // isRetryEnabled is false in baseArgs
      await expect(purchaseMembership(baseArgs)).rejects.toThrow('Retry');
      expect(mockIncrementRetryCount).not.toHaveBeenCalled();
    });

    it('does not retry non-retryable errors', async () => {
      mockCanRetry.mockReturnValue(true);

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            errors: [
              { extensions: { code: 'NOT_RETRYABLE', isRetryable: false }, message: 'Final' },
            ],
          }),
        ok: true,
      });

      const retryArgs = {
        ...baseArgs,
        isRetryEnabled: true,
      };

      await expect(purchaseMembership(retryArgs)).rejects.toThrow('Final');
      expect(mockIncrementRetryCount).not.toHaveBeenCalled();
    });

    it('does not retry when retry count exhausted', async () => {
      mockCanRetry.mockReturnValue(false); // Cannot retry

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            errors: [{ extensions: { code: 'RETRY_ME', isRetryable: true }, message: 'Retry' }],
          }),
        ok: true,
      });

      const retryArgs = {
        ...baseArgs,
        isRetryEnabled: true,
      };

      await expect(purchaseMembership(retryArgs)).rejects.toThrow('Retry');
      expect(mockIncrementRetryCount).not.toHaveBeenCalled();
    });
  });
});
