/**
 * Tests for merge-quote-with-purchasable utility
 */

import type { Purchasable } from '@/lib/api/checkout-details';
import type { QuoteResponse } from '@/lib/api/quote';

import {
  mergeQuoteWithCheckoutData,
  mergeQuoteWithPurchasable,
} from './merge-quote-with-purchasable';

// Mock purchasable data
const mockPurchasable: Purchasable = {
  currencyCode: 'USD',
  discountLabel: '20% off',
  entitledHours: 10,
  id: 'item-123',
  name: '10 Hours Tutoring',
  oldPriceCents: 250000,
  priceCents: 200000,
  type: 'CATALOG_ITEM',
};

// Mock quote data for installments
const mockQuoteWithInstallments: QuoteResponse = {
  hasInstallments: true,
  isPackage: true,
  numberOfPayments: 2,
  quote: {} as QuoteResponse['quote'],
};

// Mock quote data without installments
const mockQuoteNoInstallments: QuoteResponse = {
  hasInstallments: false,
  isPackage: false,
  numberOfPayments: 1,
  quote: {} as QuoteResponse['quote'],
};

describe('mergeQuoteWithPurchasable', () => {
  describe('when quoteData is null', () => {
    it('should return purchasable unchanged', () => {
      const result = mergeQuoteWithPurchasable(mockPurchasable, null);
      expect(result).toEqual(mockPurchasable);
    });
  });

  describe('when quote has installments (numberOfPayments = 2)', () => {
    it('should add hasInstallments as true', () => {
      const result = mergeQuoteWithPurchasable(mockPurchasable, mockQuoteWithInstallments);
      expect(result.hasInstallments).toBe(true);
    });

    it('should add isPackage from quote', () => {
      const result = mergeQuoteWithPurchasable(mockPurchasable, mockQuoteWithInstallments);
      expect(result.isPackage).toBe(true);
    });

    it('should add numberOfPayments from quote', () => {
      const result = mergeQuoteWithPurchasable(mockPurchasable, mockQuoteWithInstallments);
      expect(result.numberOfPayments).toBe(2);
    });

    it('should calculate and add installment amounts', () => {
      const result = mergeQuoteWithPurchasable(mockPurchasable, mockQuoteWithInstallments);
      // $2,000 should split evenly into $1,000 + $1,000
      expect(result.firstInstallment).toBe('1000');
      expect(result.secondInstallment).toBe('1000');
    });

    it('should include installment amounts in cents', () => {
      const result = mergeQuoteWithPurchasable(mockPurchasable, mockQuoteWithInstallments);
      // $2,000 should split evenly into $1,000 + $1,000 (100000 cents each)
      expect(result.firstInstallmentCents).toBe(100000);
      expect(result.secondInstallmentCents).toBe(100000);
    });

    it('should preserve original purchasable properties', () => {
      const result = mergeQuoteWithPurchasable(mockPurchasable, mockQuoteWithInstallments);
      expect(result.id).toBe(mockPurchasable.id);
      expect(result.name).toBe(mockPurchasable.name);
      expect(result.priceCents).toBe(mockPurchasable.priceCents);
      expect(result.currencyCode).toBe(mockPurchasable.currencyCode);
      expect(result.discountLabel).toBe(mockPurchasable.discountLabel);
    });
  });

  describe('when quote has no installments (numberOfPayments = 1)', () => {
    it('should add hasInstallments as false', () => {
      const result = mergeQuoteWithPurchasable(mockPurchasable, mockQuoteNoInstallments);
      expect(result.hasInstallments).toBe(false);
    });

    it('should not add installment amounts', () => {
      const result = mergeQuoteWithPurchasable(mockPurchasable, mockQuoteNoInstallments);
      expect(result.firstInstallment).toBeUndefined();
      expect(result.secondInstallment).toBeUndefined();
      expect(result.firstInstallmentCents).toBeUndefined();
      expect(result.secondInstallmentCents).toBeUndefined();
    });

    it('should add isPackage as false', () => {
      const result = mergeQuoteWithPurchasable(mockPurchasable, mockQuoteNoInstallments);
      expect(result.isPackage).toBe(false);
    });
  });

  describe('uneven installment calculations', () => {
    it('should calculate uneven installments correctly', () => {
      const unevenPurchasable: Purchasable = {
        ...mockPurchasable,
        priceCents: 200100, // $2,001
      };

      const result = mergeQuoteWithPurchasable(unevenPurchasable, mockQuoteWithInstallments);
      // $2,001 should split into $1,001 + $1,000
      expect(result.firstInstallment).toBe('1001');
      expect(result.secondInstallment).toBe('1000');
    });
  });
});

describe('mergeQuoteWithCheckoutData', () => {
  const mockCheckoutData = {
    buyer: { firstName: 'John', id: 'user-123' },
    options: [
      { ...mockPurchasable, id: 'option-1', name: '5 Hours' },
      { ...mockPurchasable, id: 'option-2', name: '15 Hours' },
    ],
    purchasable: mockPurchasable,
  };

  describe('when quoteData is null', () => {
    it('should return checkoutData unchanged', () => {
      const result = mergeQuoteWithCheckoutData(mockCheckoutData, null);
      expect(result).toEqual(mockCheckoutData);
    });
  });

  describe('when quoteData is provided', () => {
    it('should merge installment data with purchasable only', () => {
      const result = mergeQuoteWithCheckoutData(mockCheckoutData, mockQuoteWithInstallments);

      // Purchasable should have installment data
      expect(result.purchasable?.hasInstallments).toBe(true);
      expect(result.purchasable?.firstInstallment).toBe('1000');
      expect(result.purchasable?.secondInstallment).toBe('1000');
      expect(result.purchasable?.firstInstallmentCents).toBe(100000);
      expect(result.purchasable?.secondInstallmentCents).toBe(100000);
    });

    it('should NOT modify options array', () => {
      const result = mergeQuoteWithCheckoutData(mockCheckoutData, mockQuoteWithInstallments);

      // Options should remain unchanged (no installment data)
      result.options?.forEach((option) => {
        expect(option.hasInstallments).toBeUndefined();
        expect(option.firstInstallment).toBeUndefined();
        expect(option.secondInstallment).toBeUndefined();
        expect(option.firstInstallmentCents).toBeUndefined();
        expect(option.secondInstallmentCents).toBeUndefined();
      });
    });

    it('should preserve other checkout data', () => {
      const result = mergeQuoteWithCheckoutData(mockCheckoutData, mockQuoteWithInstallments);

      expect(result.buyer).toEqual(mockCheckoutData.buyer);
      expect(result.options?.length).toBe(2);
    });
  });

  describe('when checkoutData has no purchasable', () => {
    it('should return checkoutData unchanged', () => {
      const dataWithoutPurchasable: { options?: Purchasable[]; purchasable?: Purchasable } = {};
      const result = mergeQuoteWithCheckoutData(dataWithoutPurchasable, mockQuoteWithInstallments);
      expect(result).toEqual(dataWithoutPurchasable);
    });
  });
});
