/**
 * Tests for payment utility functions
 */

import { type CheckoutDetailsResponse, SavedPaymentMethodType } from '@/lib/api/checkout-details';

import {
  buildPurchaseArgs,
  getEffectivePurchasable,
  isCardExpired,
  validateTermsAccepted,
} from './utils';

describe('buildPurchaseArgs', () => {
  const mockPurchasable = {
    currencyCode: 'USD',
    entitledHours: 10,
    id: 'purchasable-123',
    name: 'Test Package',
    oldPriceCents: 50000,
    priceCents: 40000,
    type: 'CATALOG_ITEM' as const,
  };

  const mockCheckoutData: CheckoutDetailsResponse = {
    __typename: 'CheckoutReady',
    buyer: { firstName: 'John', id: 'buyer-123' },
    purchasable: mockPurchasable,
  };

  const mockPurchaseData = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    nonce: 'test-nonce',
    paymentMethod: 'CREDIT_CARD' as const,
    zipCode: '12345',
  };

  it('builds purchase args from checkout data', () => {
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutData,
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchaseData: mockPurchaseData,
      recaptchaToken: 'test-recaptcha-token',
    });

    expect(result.priceCents).toBe(40000);
    expect(result.previousPriceCents).toBe(50000);
    expect(result.currencyCode).toBe('USD');
    expect(result.durationSeconds).toBe(10 * 3600);
    expect(result.purchaseData).toEqual(mockPurchaseData);
    expect(result.isLeadResubmissionFlow).toBe(false);
    expect(result.isRetryEnabled).toBe(false);
    expect(result.recaptchaToken).toBe('test-recaptcha-token');
  });

  it('uses purchasable.id from checkoutData when purchasableID is not provided', () => {
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutData,
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchaseData: mockPurchaseData,
      recaptchaToken: 'test-token',
    });

    // Should use purchasable.id from checkoutData
    expect(result.catalogItemId).toBe('purchasable-123');
    expect(result.quoteId).toBeNull();
  });

  it('uses selectedPurchasableId when provided', () => {
    const checkoutDataWithOptions: CheckoutDetailsResponse = {
      __typename: 'CheckoutReady',
      buyer: { firstName: 'John', id: 'buyer-123' },
      options: [
        { ...mockPurchasable, id: 'option-1', priceCents: 30000 },
        { ...mockPurchasable, id: 'option-2', priceCents: 50000 },
      ],
      purchasable: mockPurchasable,
    };

    const result = buildPurchaseArgs({
      checkoutData: checkoutDataWithOptions,
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchaseData: mockPurchaseData,
      recaptchaToken: 'test-token',
      selectedPurchasableId: 'option-2',
    });

    // Should use the selected purchasable
    expect(result.catalogItemId).toBe('option-2');
    expect(result.priceCents).toBe(50000);
  });

  it('includes clientID when provided', () => {
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutData,
      clientID: 'client-456',
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchaseData: mockPurchaseData,
      recaptchaToken: 'test-token',
    });

    expect(result.clientID).toBe('client-456');
  });

  it('includes promoCode when provided', () => {
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutData,
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      promoCode: 'SAVE20',
      purchaseData: mockPurchaseData,
      recaptchaToken: 'test-token',
    });

    expect(result.promoCode).toBe('SAVE20');
  });

  it('sets quoteId for QUOTE purchasable type', () => {
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutData,
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchasableID: 'quote-789',
      purchasableType: 'QUOTE',
      purchaseData: mockPurchaseData,
      recaptchaToken: 'test-token',
    });

    expect(result.quoteId).toBe('quote-789');
    expect(result.catalogItemId).toBeNull();
  });

  it('sets catalogItemId for CATALOG_ITEM purchasable type', () => {
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutData,
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchasableID: 'catalog-789',
      purchasableType: 'CATALOG_ITEM',
      purchaseData: mockPurchaseData,
      recaptchaToken: 'test-token',
    });

    expect(result.catalogItemId).toBe('catalog-789');
    expect(result.quoteId).toBeNull();
  });

  it('sets catalogItemId when purchasableType is undefined', () => {
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutData,
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchasableID: 'item-789',
      purchaseData: mockPurchaseData,
      recaptchaToken: 'test-token',
    });

    expect(result.catalogItemId).toBe('item-789');
    expect(result.quoteId).toBeNull();
  });

  it('sets isLeadResubmissionFlow when true', () => {
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutData,
      isLeadResubmissionFlow: true,
      isRetryEnabled: false,
      purchaseData: mockPurchaseData,
      recaptchaToken: 'test-token',
    });

    expect(result.isLeadResubmissionFlow).toBe(true);
  });

  it('sets isRetryEnabled when true', () => {
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutData,
      isLeadResubmissionFlow: false,
      isRetryEnabled: true,
      purchaseData: mockPurchaseData,
      recaptchaToken: 'test-token',
    });

    expect(result.isRetryEnabled).toBe(true);
  });

  it('defaults currency to USD when not provided', () => {
    const checkoutDataWithoutCurrency: CheckoutDetailsResponse = {
      ...mockCheckoutData,
      purchasable: { ...mockPurchasable, currencyCode: '' },
    };

    const result = buildPurchaseArgs({
      checkoutData: checkoutDataWithoutCurrency,
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchaseData: mockPurchaseData,
      recaptchaToken: 'test-token',
    });

    expect(result.currencyCode).toBe('USD');
  });

  it('defaults entitled hours to 4 when not provided', () => {
    const checkoutDataWithoutHours: CheckoutDetailsResponse = {
      ...mockCheckoutData,
      purchasable: { ...mockPurchasable, entitledHours: 0 },
    };

    const result = buildPurchaseArgs({
      checkoutData: checkoutDataWithoutHours,
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchaseData: mockPurchaseData,
      recaptchaToken: 'test-token',
    });

    expect(result.durationSeconds).toBe(4 * 3600);
  });

  it('throws error when purchasable is not available', () => {
    const checkoutNotReady: CheckoutDetailsResponse = {
      __typename: 'CheckoutNotReady',
      reason: 'No product available',
    };

    expect(() =>
      buildPurchaseArgs({
        checkoutData: checkoutNotReady,
        isLeadResubmissionFlow: false,
        isRetryEnabled: false,
        purchaseData: mockPurchaseData,
        recaptchaToken: 'test-token',
      })
    ).toThrow('Product information not available');
  });

  it('throws error when purchasable is null', () => {
    const checkoutWithNullPurchasable: CheckoutDetailsResponse = {
      __typename: 'CheckoutReady',
      buyer: { firstName: 'John', id: 'buyer-123' },
      purchasable: undefined,
    };

    expect(() =>
      buildPurchaseArgs({
        checkoutData: checkoutWithNullPurchasable,
        isLeadResubmissionFlow: false,
        isRetryEnabled: false,
        purchaseData: mockPurchaseData,
        recaptchaToken: 'test-token',
      })
    ).toThrow('Product information not available');
  });
});

/**
 * Tests for the specific welcome-back flow scenario
 * URL: /checkout/welcome-back?c=<clientId> (no catalogItemId or quoteId in URL)
 *
 * This tests the fix for MEX-14834 where purchases were failing because:
 * 1. verificationToken was empty (recaptcha token not generated)
 * 2. membershipItem was null (purchasableID was not being derived from API response)
 */
describe('buildPurchaseArgs - Welcome Back Flow (no URL purchasableID)', () => {
  const mockPurchasable = {
    currencyCode: 'USD',
    entitledHours: 4,
    id: 'catalog-item-from-api',
    name: 'Standard 4 Hours',
    oldPriceCents: 39900,
    priceCents: 34900,
    type: 'CATALOG_ITEM' as const,
  };

  const mockAlternatePurchasable = {
    currencyCode: 'USD',
    entitledHours: 8,
    id: 'alternate-catalog-item',
    name: 'Premium 8 Hours',
    priceCents: 64900,
    type: 'CATALOG_ITEM' as const,
  };

  const mockCheckoutDataAuthenticated: CheckoutDetailsResponse = {
    __typename: 'CheckoutReadyForAuthenticatedUser',
    buyer: { firstName: 'Jose', id: 'buyer-123' },
    options: [mockPurchasable, mockAlternatePurchasable],
    purchasable: mockPurchasable,
    savedPaymentMethod: {
      cardBrand: 'Visa',
      expirationDate: '12/26',
      id: 'saved-payment-123',
      lastFourDigits: '1234',
      type: SavedPaymentMethodType.CREDIT_CARD,
    },
  };

  const mockPurchaseData = {
    nonce: 'test-nonce-from-braintree',
    paymentMethod: 'CREDIT_CARD' as const,
    savedPaymentMethodId: 'saved-payment-123',
  };

  it('derives catalogItemId from checkoutData.purchasable when purchasableID is not in URL', () => {
    // Simulates welcome-back flow: ?c=<clientId> (no catalogItemId param)
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutDataAuthenticated,
      clientID: 'client-uuid-123',
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      // purchasableID is undefined (not in URL)
      // purchasableType is undefined (not in URL)
      purchaseData: mockPurchaseData,
      recaptchaToken: 'generated-recaptcha-token',
    });

    // Should use purchasable.id from API response
    expect(result.catalogItemId).toBe('catalog-item-from-api');
    expect(result.quoteId).toBeNull();

    // verificationToken should be the provided recaptcha token
    expect(result.recaptchaToken).toBe('generated-recaptcha-token');

    // Other fields should be derived from purchasable
    expect(result.priceCents).toBe(34900);
    expect(result.previousPriceCents).toBe(39900);
    expect(result.currencyCode).toBe('USD');
    expect(result.durationSeconds).toBe(4 * 3600);
  });

  it('uses selectedPurchasableId when user switches plans in welcome-back flow', () => {
    // User clicks "Switch to 8 hours" in welcome-back flow
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutDataAuthenticated,
      clientID: 'client-uuid-123',
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchaseData: mockPurchaseData,
      recaptchaToken: 'recaptcha-token',
      selectedPurchasableId: 'alternate-catalog-item',
    });

    // Should use the selected alternate plan
    expect(result.catalogItemId).toBe('alternate-catalog-item');
    expect(result.priceCents).toBe(64900);
    expect(result.durationSeconds).toBe(8 * 3600);
  });

  it('falls back to default purchasable if selectedPurchasableId not found in options', () => {
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutDataAuthenticated,
      clientID: 'client-uuid-123',
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchaseData: mockPurchaseData,
      recaptchaToken: 'recaptcha-token',
      selectedPurchasableId: 'non-existent-id',
    });

    // Should fall back to default purchasable
    expect(result.catalogItemId).toBe('catalog-item-from-api');
    expect(result.priceCents).toBe(34900);
  });

  it('selectedPurchasableId takes precedence over URL purchasableID when user switches plans', () => {
    // Scenario: User navigates with ?catalogItemId=url-catalog-item then switches to alternate plan
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutDataAuthenticated,
      clientID: 'client-uuid-123',
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchasableID: 'url-catalog-item', // From URL param
      purchasableType: 'CATALOG_ITEM',
      purchaseData: mockPurchaseData,
      recaptchaToken: 'recaptcha-token',
      selectedPurchasableId: 'alternate-catalog-item', // User switched to this plan
    });

    // selectedPurchasableId should win - all fields should be consistent with the alternate plan
    expect(result.catalogItemId).toBe('alternate-catalog-item'); // NOT 'url-catalog-item'
    expect(result.priceCents).toBe(64900); // Alternate plan price
    expect(result.durationSeconds).toBe(8 * 3600); // Alternate plan hours
    expect(result.quoteId).toBeNull();
  });

  it('URL purchasableID is used when no plan switch occurs (selectedPurchasableId not provided)', () => {
    // Scenario: User navigates with ?catalogItemId=url-catalog-item and doesn't switch plans
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutDataAuthenticated,
      clientID: 'client-uuid-123',
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchasableID: 'url-catalog-item', // From URL param
      purchasableType: 'CATALOG_ITEM',
      purchaseData: mockPurchaseData,
      recaptchaToken: 'recaptcha-token',
      // No selectedPurchasableId - user didn't switch plans
    });

    // URL param should be used for catalogItemId
    expect(result.catalogItemId).toBe('url-catalog-item');
    expect(result.quoteId).toBeNull();
  });

  it('handles lead resubmission flow correctly', () => {
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutDataAuthenticated,
      clientID: 'client-uuid-123',
      isLeadResubmissionFlow: true,
      isRetryEnabled: false,
      purchaseData: mockPurchaseData,
      recaptchaToken: 'recaptcha-token',
    });

    expect(result.isLeadResubmissionFlow).toBe(true);
    expect(result.catalogItemId).toBe('catalog-item-from-api');
  });

  it('prefers URL purchasableID over API response purchasable when both exist', () => {
    // Edge case: URL has catalogItemId but API also has purchasable
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutDataAuthenticated,
      clientID: 'client-uuid-123',
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchasableID: 'url-catalog-item-id',
      purchasableType: 'CATALOG_ITEM',
      purchaseData: mockPurchaseData,
      recaptchaToken: 'recaptcha-token',
    });

    // URL param should take precedence
    expect(result.catalogItemId).toBe('url-catalog-item-id');
  });

  it('handles QUOTE type from API response correctly', () => {
    const quoteBasedCheckout: CheckoutDetailsResponse = {
      __typename: 'CheckoutReadyForAuthenticatedUser',
      buyer: { firstName: 'Jose', id: 'buyer-123' },
      purchasable: {
        ...mockPurchasable,
        id: 'quote-id-from-api',
        type: 'QUOTE',
      },
    };

    const result = buildPurchaseArgs({
      checkoutData: quoteBasedCheckout,
      clientID: 'client-uuid-123',
      isLeadResubmissionFlow: false,
      isRetryEnabled: false,
      purchaseData: mockPurchaseData,
      recaptchaToken: 'recaptcha-token',
    });

    // Should correctly identify as quote-based
    expect(result.quoteId).toBe('quote-id-from-api');
    expect(result.catalogItemId).toBeNull();
  });

  it('includes all required fields for purchase mutation', () => {
    const result = buildPurchaseArgs({
      checkoutData: mockCheckoutDataAuthenticated,
      clientID: 'client-uuid-123',
      isLeadResubmissionFlow: false,
      isRetryEnabled: true,
      promoCode: 'SAVE20',
      purchaseData: mockPurchaseData,
      recaptchaToken: 'valid-recaptcha-token',
    });

    // Verify all fields needed for GraphQL mutation are present
    expect(result).toMatchObject({
      catalogItemId: 'catalog-item-from-api',
      checkoutDetails: mockCheckoutDataAuthenticated,
      clientID: 'client-uuid-123',
      currencyCode: 'USD',
      durationSeconds: 14400, // 4 hours * 3600
      isLeadResubmissionFlow: false,
      isRetryEnabled: true,
      previousPriceCents: 39900,
      priceCents: 34900,
      promoCode: 'SAVE20',
      purchaseData: mockPurchaseData,
      quoteId: null,
      recaptchaToken: 'valid-recaptcha-token',
    });
  });
});

describe('isCardExpired', () => {
  beforeEach(() => {
    // Mock current date to January 15, 2024
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 0, 15)); // January 15, 2024
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns false for undefined expiration date', () => {
    expect(isCardExpired(undefined)).toBe(false);
  });

  it('returns false for empty expiration date', () => {
    expect(isCardExpired('')).toBe(false);
  });

  it('returns false for card expiring in current month', () => {
    // Card expires 01/24, current date is Jan 15, 2024
    expect(isCardExpired('01/24')).toBe(false);
  });

  it('returns false for card expiring in future month', () => {
    // Card expires 12/24, current date is Jan 15, 2024
    expect(isCardExpired('12/24')).toBe(false);
  });

  it('returns false for card expiring in future year', () => {
    // Card expires 01/25, current date is Jan 15, 2024
    expect(isCardExpired('01/25')).toBe(false);
  });

  it('returns true for card expired in previous month', () => {
    // Card expires 12/23, current date is Jan 15, 2024
    expect(isCardExpired('12/23')).toBe(true);
  });

  it('returns true for card expired in previous year', () => {
    // Card expires 06/22, current date is Jan 15, 2024
    expect(isCardExpired('06/22')).toBe(true);
  });

  it('returns false for invalid format without slash', () => {
    expect(isCardExpired('0124')).toBe(false);
  });

  it('returns false for invalid format with only month', () => {
    expect(isCardExpired('01/')).toBe(false);
  });

  it('returns false for invalid format with only year', () => {
    expect(isCardExpired('/24')).toBe(false);
  });

  it('handles edge case at year boundary', () => {
    // Mock to December 2024
    jest.setSystemTime(new Date(2024, 11, 15)); // December 15, 2024

    // Card expires 12/24 - not expired (current month)
    expect(isCardExpired('12/24')).toBe(false);

    // Card expires 11/24 - expired (previous month)
    expect(isCardExpired('11/24')).toBe(true);
  });
});

describe('getEffectivePurchasable', () => {
  const defaultPurchasable = {
    currencyCode: 'USD',
    entitledHours: 8,
    id: 'default-plan-id',
    name: '8 Hours Plan',
    oldPriceCents: 70000,
    priceCents: 64900,
    type: 'CATALOG_ITEM' as const,
  };

  const alternativePurchasable = {
    currencyCode: 'USD',
    entitledHours: 4,
    id: 'alt-plan-id',
    name: '4 Hours Plan',
    oldPriceCents: 40000,
    priceCents: 34900,
    type: 'CATALOG_ITEM' as const,
  };

  const checkoutDataWithOptions: CheckoutDetailsResponse = {
    __typename: 'CheckoutReady',
    buyer: { firstName: 'John', id: 'buyer-123' },
    options: [defaultPurchasable, alternativePurchasable],
    purchasable: defaultPurchasable,
  };

  it('returns null when checkout is not ready', () => {
    const checkoutData: CheckoutDetailsResponse = {
      __typename: 'CheckoutNotReady',
      reason: 'Loading',
    };

    const result = getEffectivePurchasable({ checkoutData });
    expect(result).toBeNull();
  });

  it('returns default purchasable when no selectedPurchasableId is provided', () => {
    const result = getEffectivePurchasable({ checkoutData: checkoutDataWithOptions });

    expect(result).toEqual(defaultPurchasable);
    expect(result?.id).toBe('default-plan-id');
    expect(result?.priceCents).toBe(64900);
  });

  it('returns selected purchasable when selectedPurchasableId matches an option', () => {
    const result = getEffectivePurchasable({
      checkoutData: checkoutDataWithOptions,
      selectedPurchasableId: 'alt-plan-id',
    });

    expect(result).toEqual(alternativePurchasable);
    expect(result?.id).toBe('alt-plan-id');
    expect(result?.priceCents).toBe(34900);
  });

  it('returns default purchasable when selectedPurchasableId does not match any option', () => {
    const result = getEffectivePurchasable({
      checkoutData: checkoutDataWithOptions,
      selectedPurchasableId: 'non-existent-id',
    });

    expect(result).toEqual(defaultPurchasable);
    expect(result?.id).toBe('default-plan-id');
  });

  it('returns default purchasable when options array is undefined', () => {
    const checkoutDataNoOptions: CheckoutDetailsResponse = {
      __typename: 'CheckoutReady',
      buyer: { firstName: 'John', id: 'buyer-123' },
      purchasable: defaultPurchasable,
    };

    const result = getEffectivePurchasable({
      checkoutData: checkoutDataNoOptions,
      selectedPurchasableId: 'alt-plan-id',
    });

    expect(result).toEqual(defaultPurchasable);
  });

  it('returns null when checkout data has no purchasable and no options', () => {
    const checkoutDataNoPurchasable: CheckoutDetailsResponse = {
      __typename: 'CheckoutReadyForGuest',
    };

    const result = getEffectivePurchasable({ checkoutData: checkoutDataNoPurchasable });
    expect(result).toBeNull();
  });

  it('returns most popular (4 hours) option when purchasable is null but options exist', () => {
    // This matches the fallback chain from original plan-manager.ts
    const fourHourPlan = {
      currencyCode: 'USD',
      entitledHours: 4,
      id: 'four-hour-plan',
      name: 'Standard',
      priceCents: 34900,
      type: 'CATALOG_ITEM' as const,
    };
    const eightHourPlan = {
      currencyCode: 'USD',
      entitledHours: 8,
      id: 'eight-hour-plan',
      name: 'Intensive',
      priceCents: 64900,
      type: 'CATALOG_ITEM' as const,
    };

    const checkoutDataWithOptionsOnly: CheckoutDetailsResponse = {
      __typename: 'CheckoutReady',
      buyer: { firstName: 'Jose', id: 'buyer-456' },
      options: [eightHourPlan, fourHourPlan], // 4-hour plan is second
      purchasable: undefined, // No default purchasable from API
    };

    const result = getEffectivePurchasable({ checkoutData: checkoutDataWithOptionsOnly });

    // Should return the 4-hour plan (most popular) even though it's second in the array
    expect(result).toEqual(fourHourPlan);
    expect(result?.entitledHours).toBe(4);
  });

  it('returns first option when purchasable is null and no 4-hour plan exists', () => {
    const sixHourPlan = {
      currencyCode: 'USD',
      entitledHours: 6,
      id: 'six-hour-plan',
      name: 'Medium',
      priceCents: 49900,
      type: 'CATALOG_ITEM' as const,
    };
    const tenHourPlan = {
      currencyCode: 'USD',
      entitledHours: 10,
      id: 'ten-hour-plan',
      name: 'Premium',
      priceCents: 79900,
      type: 'CATALOG_ITEM' as const,
    };

    const checkoutDataNoFourHourPlan: CheckoutDetailsResponse = {
      __typename: 'CheckoutReady',
      buyer: { firstName: 'Test', id: 'buyer-789' },
      options: [sixHourPlan, tenHourPlan],
      purchasable: undefined,
    };

    const result = getEffectivePurchasable({ checkoutData: checkoutDataNoFourHourPlan });

    // Should return the first option when no 4-hour plan exists
    expect(result).toEqual(sixHourPlan);
    expect(result?.entitledHours).toBe(6);
  });

  it('is used consistently by all payment methods', () => {
    // This test documents the expected behavior:
    // getEffectivePurchasable should be the single source of truth for determining
    // which purchasable to use for pricing across Credit Card, Google Pay, Apple Pay, and PayPal

    const result1 = getEffectivePurchasable({
      checkoutData: checkoutDataWithOptions,
      selectedPurchasableId: 'alt-plan-id',
    });

    const result2 = getEffectivePurchasable({
      checkoutData: checkoutDataWithOptions,
      selectedPurchasableId: 'alt-plan-id',
    });

    // Same input should always produce same output (pure function)
    expect(result1).toEqual(result2);
    expect(result1?.priceCents).toBe(34900);
  });
});

describe('validateTermsAccepted', () => {
  it('returns valid when skipTermsValidation is true', () => {
    const result = validateTermsAccepted(true, false);
    expect(result).toEqual({ valid: true });
  });

  it('returns valid when termsAccepted is true', () => {
    const result = validateTermsAccepted(false, true);
    expect(result).toEqual({ valid: true });
  });

  it('returns valid when both are true', () => {
    const result = validateTermsAccepted(true, true);
    expect(result).toEqual({ valid: true });
  });

  it('returns error when neither is true', () => {
    const result = validateTermsAccepted(false, false);
    expect(result).toEqual({ error: 'Please accept the terms and conditions' });
  });

  it('error message is user-friendly', () => {
    const result = validateTermsAccepted(false, false);
    if ('error' in result) {
      expect(result.error).toContain('terms and conditions');
    }
  });
});
