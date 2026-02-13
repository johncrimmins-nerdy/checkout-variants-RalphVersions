/**
 * Tests for quote API
 * Package quote fetching with installment support
 */

import { PACKAGE_ITEM_TYPE_IDS } from '../constants/package-item-type-ids';
import { IntegrationError } from '../utils/error-classes';
import { fetchQuote, isQuoteBasedCheckout } from './quote';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock getApiDomain
jest.mock('../utils/get-api-domain', () => ({
  getApiDomain: () => 'api.test.varsitytutors.com',
}));

describe('fetchQuote', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('successful responses', () => {
    it('should fetch and parse quote data correctly', async () => {
      const mockQuote = {
        id: 'quote-123',
        items: [{ item_type_id: 1, name: 'Tutoring Package' }],
        number_of_payments: 1,
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockQuote),
        ok: true,
      });

      const result = await fetchQuote('quote-123');

      expect(result.quote).toEqual(mockQuote);
      expect(result.numberOfPayments).toBe(1);
    });

    it('should detect package with installments (2 payments)', async () => {
      const mockQuote = {
        id: 'quote-456',
        items: [{ item_type_id: 12, name: 'Package' }],
        number_of_payments: 2,
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockQuote),
        ok: true,
      });

      const result = await fetchQuote('quote-456');

      expect(result.hasInstallments).toBe(true);
      expect(result.isPackage).toBe(true);
      expect(result.numberOfPayments).toBe(2);
    });

    it('should detect package by item type ID', async () => {
      // Save original location
      const originalLocation = window.location;

      // Mock window.location for production environment
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          ...originalLocation,
          hostname: 'www.varsitytutors.com',
          search: '',
        },
        writable: true,
      });

      const mockQuote = {
        id: 'quote-789',
        items: [{ item_type_id: 12, name: 'Package' }], // 12 is a package item type
        number_of_payments: 1,
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockQuote),
        ok: true,
      });

      const result = await fetchQuote('quote-789');

      expect(result.isPackage).toBe(true);
      expect(result.hasInstallments).toBe(false);

      // Restore location
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
        writable: true,
      });
    });

    it('should identify non-package quotes', async () => {
      const mockQuote = {
        id: 'quote-abc',
        items: [{ item_type_id: 1, name: 'Membership' }], // Not a package type
        number_of_payments: 1,
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockQuote),
        ok: true,
      });

      const result = await fetchQuote('quote-abc');

      expect(result.isPackage).toBe(false);
      expect(result.hasInstallments).toBe(false);
    });

    it('should include lead_uuid when present', async () => {
      const mockQuote = {
        id: 'quote-lead',
        items: [{ item_type_id: 1 }],
        lead_uuid: 'lead-uuid-123',
        number_of_payments: 1,
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockQuote),
        ok: true,
      });

      const result = await fetchQuote('quote-lead');

      expect(result.leadUuid).toBe('lead-uuid-123');
    });

    it('should call correct API endpoint', async () => {
      const mockQuote = {
        id: 'test-quote',
        items: [],
        number_of_payments: 1,
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockQuote),
        ok: true,
      });

      await fetchQuote('test-quote-id');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.varsitytutors.com/v1/pricing_quotes/test-quote-id',
        expect.objectContaining({
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should throw IntegrationError on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(fetchQuote('invalid-quote')).rejects.toThrow(IntegrationError);
    });

    it('should include error details in IntegrationError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      try {
        await fetchQuote('error-quote');
        fail('Expected fetchQuote to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(IntegrationError);
        expect((error as IntegrationError).message).toContain('500');
      }
    });

    it('should wrap network errors in IntegrationError', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(fetchQuote('network-error')).rejects.toThrow(IntegrationError);
    });
  });

  describe('package item type detection', () => {
    it.each(PACKAGE_ITEM_TYPE_IDS)(
      'should detect item_type_id %d as package in production',
      async (itemTypeId) => {
        const originalLocation = window.location;
        Object.defineProperty(window, 'location', {
          configurable: true,
          value: {
            ...originalLocation,
            hostname: 'www.varsitytutors.com',
            search: '',
          },
          writable: true,
        });

        const mockQuote = {
          id: 'package-quote',
          items: [{ item_type_id: itemTypeId }],
          number_of_payments: 1,
        };

        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve(mockQuote),
          ok: true,
        });

        const result = await fetchQuote('package-quote');
        expect(result.isPackage).toBe(true);

        Object.defineProperty(window, 'location', {
          configurable: true,
          value: originalLocation,
          writable: true,
        });
      }
    );
  });
});

describe('isQuoteBasedCheckout', () => {
  describe('with URLSearchParams', () => {
    it('should return true when q param is present', () => {
      const params = new URLSearchParams('?q=quote-123');
      expect(isQuoteBasedCheckout(params)).toBe(true);
    });

    it('should return false when q param is absent', () => {
      const params = new URLSearchParams('?catalogItemId=item-123');
      expect(isQuoteBasedCheckout(params)).toBe(false);
    });

    it('should return false for empty search params', () => {
      const params = new URLSearchParams('');
      expect(isQuoteBasedCheckout(params)).toBe(false);
    });
  });

  describe('with object params', () => {
    it('should return true when q property is present', () => {
      expect(isQuoteBasedCheckout({ q: 'quote-456' })).toBe(true);
    });

    it('should return false when q property is absent', () => {
      expect(isQuoteBasedCheckout({})).toBe(false);
    });

    it('should return false when q property is empty string', () => {
      expect(isQuoteBasedCheckout({ q: '' })).toBe(false);
    });

    it('should return false when q property is undefined', () => {
      expect(isQuoteBasedCheckout({ q: undefined })).toBe(false);
    });
  });
});
