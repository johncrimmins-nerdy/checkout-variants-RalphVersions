/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import React from 'react';

import { SessionContextProvider, useSessionContext } from './SessionContextProvider';

// Mock useSearchParams
const mockGet = jest.fn();
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock useFlags
const mockUseFlags = jest.fn();
jest.mock('@/hooks/use-flags', () => ({
  FLAGS: {
    ECOMM_587_PURCHASE_RETRY: 'ECOMM-587',
    ECOMM_614_LEAD_RESUBMISSION: 'ECOMM-614-lead-resubmission',
    ECOMM_682_NEW_CHECKOUT_PROMO_CODES: 'ECOMM-682-new-checkout-promo-codes',
    ECOMM_827_CHURNED_CLIENT_PROMOCODE: 'ECOMM-827-churned-client-promocode',
  },
  useFlags: () => mockUseFlags(),
}));

describe('SessionContextProvider', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionContextProvider>{children}</SessionContextProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue(null);
    mockUseFlags.mockReturnValue({});
  });

  describe('URL parameter extraction', () => {
    it('extracts clientID from "c" param', () => {
      mockGet.mockImplementation((key) => (key === 'c' ? 'client-123' : null));

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.clientID).toBe('client-123');
    });

    it('extracts purchasableID from "q" param', () => {
      mockGet.mockImplementation((key) => (key === 'q' ? 'quote-123' : null));

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.purchasableID).toBe('quote-123');
    });

    it('extracts purchasableID from "catalogItemId" param when "q" is not present', () => {
      mockGet.mockImplementation((key) => (key === 'catalogItemId' ? 'catalog-123' : null));

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.purchasableID).toBe('catalog-123');
    });

    it('prefers "q" over "catalogItemId" for purchasableID', () => {
      mockGet.mockImplementation((key) => {
        if (key === 'q') return 'quote-123';
        if (key === 'catalogItemId') return 'catalog-123';
        return null;
      });

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.purchasableID).toBe('quote-123');
    });

    it('extracts promoCode from "p" param', () => {
      mockGet.mockImplementation((key) => (key === 'p' ? 'SAVE20' : null));

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.promoCode).toBe('SAVE20');
    });

    it('extracts segmentGrade from "sg" param', () => {
      mockGet.mockImplementation((key) => (key === 'sg' ? 'grade-5' : null));

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.segmentGrade).toBe('grade-5');
    });

    it('extracts subject from "sub" param', () => {
      mockGet.mockImplementation((key) => (key === 'sub' ? 'math' : null));

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.subject).toBe('math');
    });
  });

  describe('purchasableType determination', () => {
    it('sets purchasableType to QUOTE when "q" param is present', () => {
      mockGet.mockImplementation((key) => (key === 'q' ? 'quote-123' : null));

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.purchasableType).toBe('QUOTE');
    });

    it('treats lead_id as tracking-only and sets purchasableType to CATALOG_ITEM', () => {
      mockGet.mockImplementation((key) => (key === 'lead_id' ? 'lead-123' : null));

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.purchasableType).toBe('CATALOG_ITEM');
    });

    it('sets purchasableType to CATALOG_ITEM when "q" is not present', () => {
      mockGet.mockReturnValue(null);

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.purchasableType).toBe('CATALOG_ITEM');
    });
  });

  describe('isLeadResubmissionFlow', () => {
    it('returns true when subject, clientID present and flag enabled', () => {
      mockGet.mockImplementation((key) => {
        if (key === 'sub') return 'math';
        if (key === 'c') return 'client-123';
        return null;
      });
      mockUseFlags.mockReturnValue({
        'ECOMM-614-lead-resubmission': true,
      });

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.isLeadResubmissionFlow).toBe(true);
    });

    it('returns false when subject is missing', () => {
      mockGet.mockImplementation((key) => (key === 'c' ? 'client-123' : null));
      mockUseFlags.mockReturnValue({
        'ECOMM-614-lead-resubmission': true,
      });

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.isLeadResubmissionFlow).toBe(false);
    });

    it('returns false when clientID is missing', () => {
      mockGet.mockImplementation((key) => (key === 'sub' ? 'math' : null));
      mockUseFlags.mockReturnValue({
        'ECOMM-614-lead-resubmission': true,
      });

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.isLeadResubmissionFlow).toBe(false);
    });

    it('returns false when flag is disabled', () => {
      mockGet.mockImplementation((key) => {
        if (key === 'sub') return 'math';
        if (key === 'c') return 'client-123';
        return null;
      });
      mockUseFlags.mockReturnValue({
        'ECOMM-614-lead-resubmission': false,
      });

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.isLeadResubmissionFlow).toBe(false);
    });
  });

  describe('auto promo code for churned clients', () => {
    it('auto-applies churned client promo code in lead resubmission flow', () => {
      mockGet.mockImplementation((key) => {
        if (key === 'sub') return 'math';
        if (key === 'c') return 'client-123';
        return null;
      });
      mockUseFlags.mockReturnValue({
        'ECOMM-614-lead-resubmission': true,
        'ECOMM-827-churned-client-promocode': 'WINBACK20',
      });

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.promoCode).toBe('WINBACK20');
    });

    it('does not override existing promo code', () => {
      mockGet.mockImplementation((key) => {
        if (key === 'sub') return 'math';
        if (key === 'c') return 'client-123';
        if (key === 'p') return 'EXISTING';
        return null;
      });
      mockUseFlags.mockReturnValue({
        'ECOMM-614-lead-resubmission': true,
        'ECOMM-827-churned-client-promocode': 'WINBACK20',
      });

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.promoCode).toBe('EXISTING');
    });

    it('does not apply promo when churned code is "none"', () => {
      mockGet.mockImplementation((key) => {
        if (key === 'sub') return 'math';
        if (key === 'c') return 'client-123';
        return null;
      });
      mockUseFlags.mockReturnValue({
        'ECOMM-614-lead-resubmission': true,
        'ECOMM-827-churned-client-promocode': 'none',
      });

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.promoCode).toBeUndefined();
    });
  });

  describe('shouldUsePromoCode', () => {
    it('returns true when all conditions met', () => {
      mockGet.mockImplementation((key) => {
        if (key === 'catalogItemId') return 'catalog-123';
        if (key === 'p') return 'SAVE20';
        return null;
      });
      mockUseFlags.mockReturnValue({
        'ECOMM-682-new-checkout-promo-codes': 'variant',
      });

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.shouldUsePromoCode()).toBe(true);
    });

    it('returns false for QUOTE purchasable type', () => {
      mockGet.mockImplementation((key) => {
        if (key === 'q') return 'quote-123';
        if (key === 'p') return 'SAVE20';
        return null;
      });
      mockUseFlags.mockReturnValue({
        'ECOMM-682-new-checkout-promo-codes': 'variant',
      });

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.shouldUsePromoCode()).toBe(false);
    });

    it('returns false when flag is not "variant"', () => {
      mockGet.mockImplementation((key) => {
        if (key === 'catalogItemId') return 'catalog-123';
        if (key === 'p') return 'SAVE20';
        return null;
      });
      mockUseFlags.mockReturnValue({
        'ECOMM-682-new-checkout-promo-codes': 'default',
      });

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.shouldUsePromoCode()).toBe(false);
    });

    it('returns false when no promo code', () => {
      mockGet.mockImplementation((key) => (key === 'catalogItemId' ? 'catalog-123' : null));
      mockUseFlags.mockReturnValue({
        'ECOMM-682-new-checkout-promo-codes': 'variant',
      });

      const { result } = renderHook(() => useSessionContext(), { wrapper });

      expect(result.current.shouldUsePromoCode()).toBe(false);
    });
  });
});

describe('useSessionContext', () => {
  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useSessionContext());
    }).toThrow('useSessionContext must be used within a SessionContextProvider');

    consoleSpy.mockRestore();
  });
});
