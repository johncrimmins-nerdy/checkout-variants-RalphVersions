/**
 * Tests for checkout-details API
 * Critical user-facing checkout flow
 */

import { IntegrationError } from '../utils/error-classes';
import { checkoutDetails, isIdentifiedUserCheckout } from './checkout-details';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock getGraphQLUrl
jest.mock('../utils/get-graphql-url', () => ({
  getGraphQLUrl: () => 'https://api.test.com/graphql',
}));

describe('checkoutDetails', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('successful responses', () => {
    it('should return CheckoutReady for identified users', async () => {
      const mockResponse = {
        data: {
          checkoutDetails: {
            __typename: 'CheckoutReady',
            buyer: {
              firstName: 'John',
              id: 'buyer-123',
            },
            purchasable: {
              currencyCode: 'USD',
              entitledHours: 10,
              id: 'purchasable-1',
              name: '10 Hour Package',
              priceCents: 50000,
              type: 'CATALOG_ITEM',
            },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await checkoutDetails({
        purchasableID: 'purchasable-1',
        purchasableType: 'CATALOG_ITEM',
      });

      expect(result.__typename).toBe('CheckoutReady');
      expect(result).toHaveProperty('buyer');
      expect(result).toHaveProperty('purchasable');
    });

    it('should return CheckoutReadyForAuthenticatedUser with saved payment method', async () => {
      const mockResponse = {
        data: {
          checkoutDetails: {
            __typename: 'CheckoutReadyForAuthenticatedUser',
            buyer: {
              firstName: 'Jane',
              id: 'buyer-456',
            },
            purchasable: {
              currencyCode: 'USD',
              entitledHours: 5,
              id: 'purchasable-2',
              name: '5 Hour Package',
              priceCents: 25000,
              type: 'CATALOG_ITEM',
            },
            savedPaymentMethod: {
              cardBrand: 'Visa',
              expirationDate: '12/25',
              id: 'pm-123',
              lastFourDigits: '4242',
              type: 'CREDIT_CARD',
            },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await checkoutDetails({
        clientID: 'client-456',
        purchasableID: 'purchasable-2',
        purchasableType: 'CATALOG_ITEM',
      });

      expect(result.__typename).toBe('CheckoutReadyForAuthenticatedUser');
      if (result.__typename === 'CheckoutReadyForAuthenticatedUser') {
        expect(result.savedPaymentMethod).toBeDefined();
        expect(result.savedPaymentMethod?.lastFourDigits).toBe('4242');
      }
    });

    it('should return CheckoutReadyForGuest for anonymous users', async () => {
      const mockResponse = {
        data: {
          checkoutDetails: {
            __typename: 'CheckoutReadyForGuest',
            options: [
              {
                currencyCode: 'USD',
                entitledHours: 5,
                id: 'option-1',
                name: '5 Hours',
                priceCents: 25000,
                type: 'CATALOG_ITEM',
              },
              {
                currencyCode: 'USD',
                entitledHours: 10,
                id: 'option-2',
                name: '10 Hours',
                priceCents: 45000,
                type: 'CATALOG_ITEM',
              },
            ],
            purchasable: {
              currencyCode: 'USD',
              entitledHours: 5,
              id: 'option-1',
              name: '5 Hours',
              priceCents: 25000,
              type: 'CATALOG_ITEM',
            },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await checkoutDetails({
        purchasableID: 'option-1',
        purchasableType: 'CATALOG_ITEM',
      });

      expect(result.__typename).toBe('CheckoutReadyForGuest');
      if (result.__typename === 'CheckoutReadyForGuest') {
        expect(result.options).toHaveLength(2);
      }
    });

    it('should return CheckoutNotReady when checkout is not available', async () => {
      const mockResponse = {
        data: {
          checkoutDetails: {
            __typename: 'CheckoutNotReady',
            reason: 'Quote has expired',
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await checkoutDetails({
        purchasableID: 'expired-quote',
        purchasableType: 'QUOTE',
      });

      expect(result.__typename).toBe('CheckoutNotReady');
      if (result.__typename === 'CheckoutNotReady') {
        expect(result.reason).toBe('Quote has expired');
      }
    });

    it('should include winback data when winbackAIEnabled is true', async () => {
      const mockResponse = {
        data: {
          checkoutDetails: {
            __typename: 'CheckoutReady',
            buyer: { firstName: 'John', id: 'buyer-123' },
            purchasable: {
              currencyCode: 'USD',
              entitledHours: 10,
              id: 'purchasable-1',
              name: '10 Hours',
              priceCents: 50000,
              type: 'CATALOG_ITEM',
            },
            winback: {
              headline: 'Welcome back!',
              message: 'We missed you.',
            },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await checkoutDetails({
        purchasableID: 'purchasable-1',
        purchasableType: 'CATALOG_ITEM',
        winbackAIEnabled: true,
      });

      if (result.__typename === 'CheckoutReady') {
        expect(result.winback).toBeDefined();
        expect(result.winback?.headline).toBe('Welcome back!');
      }
    });
  });

  describe('request building', () => {
    it('should include purchasable in variables when provided', async () => {
      const mockResponse = {
        data: {
          checkoutDetails: {
            __typename: 'CheckoutReadyForGuest',
            purchasable: {
              currencyCode: 'USD',
              entitledHours: 5,
              id: 'test',
              name: 'Test',
              priceCents: 10000,
              type: 'CATALOG_ITEM',
            },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      await checkoutDetails({
        purchasableID: 'item-123',
        purchasableType: 'CATALOG_ITEM',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/graphql',
        expect.objectContaining({
          body: expect.stringContaining('"purchasable"'),
          method: 'POST',
        })
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.variables.input.purchasable).toEqual({
        id: 'item-123',
        type: 'CATALOG_ITEM',
      });
    });

    it('should include buyer when clientID is provided', async () => {
      const mockResponse = {
        data: {
          checkoutDetails: {
            __typename: 'CheckoutReady',
            buyer: { firstName: 'Test', id: 'client-999' },
            purchasable: {
              currencyCode: 'USD',
              entitledHours: 5,
              id: 'test',
              name: 'Test',
              priceCents: 10000,
              type: 'CATALOG_ITEM',
            },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      await checkoutDetails({
        clientID: 'client-999',
        purchasableID: 'item-123',
        purchasableType: 'CATALOG_ITEM',
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.variables.input.buyer).toEqual({
        id: 'client-999',
        type: 'CLIENT',
      });
    });

    it('should include promoCodeId when promoCode is provided', async () => {
      const mockResponse = {
        data: {
          checkoutDetails: {
            __typename: 'CheckoutReadyForGuest',
            purchasable: {
              currencyCode: 'USD',
              discountLabel: '20% off',
              entitledHours: 5,
              id: 'test',
              name: 'Test',
              priceCents: 8000,
              type: 'CATALOG_ITEM',
            },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      await checkoutDetails({
        promoCode: 'SAVE20',
        purchasableID: 'item-123',
        purchasableType: 'CATALOG_ITEM',
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.variables.input.promoCodeId).toBe('SAVE20');
    });

    it('should include subjectId for lead resubmission flow', async () => {
      const mockResponse = {
        data: {
          checkoutDetails: {
            __typename: 'CheckoutReadyForGuest',
            purchasable: {
              currencyCode: 'USD',
              entitledHours: 5,
              id: 'test',
              name: 'Test',
              priceCents: 10000,
              type: 'CATALOG_ITEM',
            },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      await checkoutDetails({
        isLeadResubmissionFlow: true,
        purchasableID: 'item-123',
        purchasableType: 'CATALOG_ITEM',
        subject: 'math',
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.variables.input.subjectId).toBe('math');
    });

    it('should include cookie header for server-side requests', async () => {
      const mockResponse = {
        data: {
          checkoutDetails: {
            __typename: 'CheckoutReady',
            buyer: { firstName: 'Test', id: 'user-1' },
            purchasable: {
              currencyCode: 'USD',
              entitledHours: 5,
              id: 'test',
              name: 'Test',
              priceCents: 10000,
              type: 'CATALOG_ITEM',
            },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      await checkoutDetails(
        { purchasableID: 'item-123', purchasableType: 'CATALOG_ITEM' },
        { cookieHeader: 'session=abc123' }
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Cookie: 'session=abc123',
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should throw IntegrationError on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        checkoutDetails({
          purchasableID: 'item-123',
          purchasableType: 'CATALOG_ITEM',
        })
      ).rejects.toThrow(IntegrationError);
    });

    it('should throw IntegrationError on GraphQL errors', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            errors: [
              {
                extensions: { code: 'INVALID_INPUT' },
                message: 'Invalid purchasable ID',
              },
            ],
          }),
        ok: true,
      });

      await expect(
        checkoutDetails({
          purchasableID: 'invalid',
          purchasableType: 'CATALOG_ITEM',
        })
      ).rejects.toThrow(IntegrationError);
    });

    it('should throw IntegrationError when no checkout details returned', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: {} }),
        ok: true,
      });

      await expect(
        checkoutDetails({
          purchasableID: 'item-123',
          purchasableType: 'CATALOG_ITEM',
        })
      ).rejects.toThrow('No checkout details returned from API');
    });

    it('should wrap unknown errors in IntegrationError', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        checkoutDetails({
          purchasableID: 'item-123',
          purchasableType: 'CATALOG_ITEM',
        })
      ).rejects.toThrow(IntegrationError);
    });
  });
});

describe('discount label enrichment', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should add discountLabel when not provided by API but discount exists', async () => {
    const mockResponse = {
      data: {
        checkoutDetails: {
          __typename: 'CheckoutReadyForGuest',
          purchasable: {
            currencyCode: 'USD',
            entitledHours: 10,
            id: 'purchasable-1',
            name: '10 Hour Package',
            oldPriceCents: 62500,
            priceCents: 50000,
            type: 'CATALOG_ITEM',
            // No discountLabel provided
          },
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
      ok: true,
    });

    const result = await checkoutDetails({
      purchasableID: 'purchasable-1',
      purchasableType: 'CATALOG_ITEM',
    });

    if (result.__typename === 'CheckoutReadyForGuest') {
      // Should calculate 20% discount: (62500 - 50000) / 62500 = 0.2
      expect(result.purchasable?.discountLabel).toBe('-20%');
    }
  });

  it('should preserve API-provided discountLabel', async () => {
    const mockResponse = {
      data: {
        checkoutDetails: {
          __typename: 'CheckoutReadyForGuest',
          purchasable: {
            currencyCode: 'USD',
            discountLabel: '-25%', // API provides custom label
            entitledHours: 10,
            id: 'purchasable-1',
            name: '10 Hour Package',
            oldPriceCents: 62500,
            priceCents: 50000,
            type: 'CATALOG_ITEM',
          },
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
      ok: true,
    });

    const result = await checkoutDetails({
      purchasableID: 'purchasable-1',
      purchasableType: 'CATALOG_ITEM',
    });

    if (result.__typename === 'CheckoutReadyForGuest') {
      // Should keep the API-provided label
      expect(result.purchasable?.discountLabel).toBe('-25%');
    }
  });

  it('should enrich options array with discount labels', async () => {
    const mockResponse = {
      data: {
        checkoutDetails: {
          __typename: 'CheckoutReadyForGuest',
          options: [
            {
              currencyCode: 'USD',
              entitledHours: 5,
              id: 'option-1',
              name: '5 Hours',
              oldPriceCents: 30000,
              priceCents: 25000,
              type: 'CATALOG_ITEM',
              // No discountLabel - should be calculated
            },
            {
              currencyCode: 'USD',
              discountLabel: '-20%', // API provides this one
              entitledHours: 10,
              id: 'option-2',
              name: '10 Hours',
              oldPriceCents: 50000,
              priceCents: 40000,
              type: 'CATALOG_ITEM',
            },
          ],
          purchasable: {
            currencyCode: 'USD',
            entitledHours: 5,
            id: 'option-1',
            name: '5 Hours',
            oldPriceCents: 30000,
            priceCents: 25000,
            type: 'CATALOG_ITEM',
          },
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
      ok: true,
    });

    const result = await checkoutDetails({
      purchasableID: 'option-1',
      purchasableType: 'CATALOG_ITEM',
    });

    if (result.__typename === 'CheckoutReadyForGuest') {
      // First option: (30000 - 25000) / 30000 = 16.67% rounds to 17%
      expect(result.options?.[0].discountLabel).toBe('-17%');
      // Second option: keeps API-provided label
      expect(result.options?.[1].discountLabel).toBe('-20%');
    }
  });

  it('should not add discountLabel when no discount exists', async () => {
    const mockResponse = {
      data: {
        checkoutDetails: {
          __typename: 'CheckoutReadyForGuest',
          purchasable: {
            currencyCode: 'USD',
            entitledHours: 10,
            id: 'purchasable-1',
            name: '10 Hour Package',
            priceCents: 50000,
            type: 'CATALOG_ITEM',
            // No oldPriceCents = no discount
          },
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
      ok: true,
    });

    const result = await checkoutDetails({
      purchasableID: 'purchasable-1',
      purchasableType: 'CATALOG_ITEM',
    });

    if (result.__typename === 'CheckoutReadyForGuest') {
      expect(result.purchasable?.discountLabel).toBeUndefined();
    }
  });

  it('should not modify CheckoutNotReady responses', async () => {
    const mockResponse = {
      data: {
        checkoutDetails: {
          __typename: 'CheckoutNotReady',
          reason: 'Quote has expired',
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
      ok: true,
    });

    const result = await checkoutDetails({
      purchasableID: 'expired-quote',
      purchasableType: 'QUOTE',
    });

    expect(result.__typename).toBe('CheckoutNotReady');
    if (result.__typename === 'CheckoutNotReady') {
      expect(result.reason).toBe('Quote has expired');
    }
  });
});

describe('isIdentifiedUserCheckout', () => {
  it('should return true for CheckoutReady', () => {
    const checkoutDetails = {
      __typename: 'CheckoutReady' as const,
      buyer: { firstName: 'John', id: 'buyer-123' },
      purchasable: {
        currencyCode: 'USD',
        entitledHours: 10,
        id: 'purchasable-1',
        name: '10 Hours',
        priceCents: 50000,
        type: 'CATALOG_ITEM' as const,
      },
    };

    expect(isIdentifiedUserCheckout(checkoutDetails)).toBe(true);
  });

  it('should return true for CheckoutReadyForAuthenticatedUser', () => {
    const checkoutDetails = {
      __typename: 'CheckoutReadyForAuthenticatedUser' as const,
      buyer: { firstName: 'Jane', id: 'buyer-456' },
      purchasable: {
        currencyCode: 'USD',
        entitledHours: 5,
        id: 'purchasable-2',
        name: '5 Hours',
        priceCents: 25000,
        type: 'CATALOG_ITEM' as const,
      },
      savedPaymentMethod: null,
    };

    expect(isIdentifiedUserCheckout(checkoutDetails)).toBe(true);
  });

  it('should return false for CheckoutReadyForGuest', () => {
    const checkoutDetails = {
      __typename: 'CheckoutReadyForGuest' as const,
      purchasable: {
        currencyCode: 'USD',
        entitledHours: 5,
        id: 'purchasable-1',
        name: '5 Hours',
        priceCents: 25000,
        type: 'CATALOG_ITEM' as const,
      },
    };

    expect(isIdentifiedUserCheckout(checkoutDetails)).toBe(false);
  });

  it('should return false for CheckoutNotReady', () => {
    const checkoutDetails = {
      __typename: 'CheckoutNotReady' as const,
      reason: 'Quote expired',
    };

    expect(isIdentifiedUserCheckout(checkoutDetails)).toBe(false);
  });
});
