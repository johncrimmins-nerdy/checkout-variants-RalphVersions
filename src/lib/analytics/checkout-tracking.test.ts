/**
 * Tests for checkout-tracking analytics
 * Business metrics and user interaction tracking
 */

import type { CheckoutDetailsResponse, SavedPaymentMethodType } from '../api/checkout-details';
import type { PaymentMethodAvailability } from './types';

import {
  buildCheckoutTrackingData,
  getLeadAndQuoteFromUrl,
  trackCardFieldBlur,
  trackCardFieldFocused,
  trackChatStarted,
  trackCheckoutCompletionRouting,
  trackCheckoutStarted,
  trackContentViewed,
  trackElementClicked,
  trackElementClosed,
  trackElementOpened,
  trackEscapePlanClicked,
  trackExperiment,
  trackPlanPreselected,
  trackPlanSelected,
  trackPurchaseEvent,
  trackUserEmailAlreadyExists,
} from './checkout-tracking';

// Mock vtAnalytics
jest.mock('./vt-analytics', () => ({
  vtAnalytics: {
    identify: jest.fn(),
    track: jest.fn(),
  },
}));

// Mock session replay service
jest.mock('./session-replay', () => ({
  sessionReplayService: {
    getSessionReplayProperties: () => ({
      session_replay_enabled: false,
    }),
  },
}));

describe('buildCheckoutTrackingData', () => {
  const mockPaymentMethodAvailability: PaymentMethodAvailability = {
    hasApplePay: true,
    hasCreditCard: true,
    hasGooglePay: true,
    hasPaypal: true,
    hasSavedPaymentMethod: false,
  };

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'https://test.com/checkout?q=quote-123&lead_id=lead-456',
        pathname: '/checkout',
        search: '?q=quote-123&lead_id=lead-456',
      },
      writable: true,
    });
  });

  describe('authentication states', () => {
    it('should identify CheckoutReadyForAuthenticatedUser as authenticated', () => {
      const checkoutDetails: CheckoutDetailsResponse = {
        __typename: 'CheckoutReadyForAuthenticatedUser',
        buyer: { firstName: 'John', id: 'buyer-123' },
        purchasable: {
          currencyCode: 'USD',
          entitledHours: 10,
          id: 'item-1',
          name: '10 Hours',
          priceCents: 50000,
          type: 'CATALOG_ITEM',
        },
        savedPaymentMethod: {
          cardBrand: 'Visa',
          id: 'pm-1',
          lastFourDigits: '4242',
          type: 'CREDIT_CARD' as SavedPaymentMethodType,
        },
      };

      const result = buildCheckoutTrackingData(checkoutDetails, mockPaymentMethodAvailability);

      expect(result.is_authenticated).toBe(true);
      expect(result.is_auto_authenticated).toBe(false);
      expect(result.has_saved_credit_card).toBe(true);
    });

    it('should identify CheckoutReady as auto-authenticated', () => {
      const checkoutDetails: CheckoutDetailsResponse = {
        __typename: 'CheckoutReady',
        buyer: { firstName: 'Jane', id: 'buyer-456' },
        purchasable: {
          currencyCode: 'USD',
          entitledHours: 5,
          id: 'item-2',
          name: '5 Hours',
          priceCents: 25000,
          type: 'CATALOG_ITEM',
        },
      };

      const result = buildCheckoutTrackingData(checkoutDetails, mockPaymentMethodAvailability);

      expect(result.is_authenticated).toBe(false);
      expect(result.is_auto_authenticated).toBe(true);
    });

    it('should identify CheckoutReadyForGuest as not authenticated', () => {
      const checkoutDetails: CheckoutDetailsResponse = {
        __typename: 'CheckoutReadyForGuest',
        purchasable: {
          currencyCode: 'USD',
          entitledHours: 5,
          id: 'item-3',
          name: '5 Hours',
          priceCents: 25000,
          type: 'CATALOG_ITEM',
        },
      };

      const result = buildCheckoutTrackingData(checkoutDetails, mockPaymentMethodAvailability);

      expect(result.is_authenticated).toBe(false);
      expect(result.is_auto_authenticated).toBe(false);
    });
  });

  describe('payment method availability', () => {
    it('should track all available payment methods', () => {
      const checkoutDetails: CheckoutDetailsResponse = {
        __typename: 'CheckoutReadyForGuest',
        purchasable: {
          currencyCode: 'USD',
          entitledHours: 5,
          id: 'item-1',
          name: '5 Hours',
          priceCents: 25000,
          type: 'CATALOG_ITEM',
        },
      };

      const result = buildCheckoutTrackingData(checkoutDetails, mockPaymentMethodAvailability);

      expect(result.available_payment_methods).toContain('credit_card');
      expect(result.available_payment_methods).toContain('apple_pay');
      expect(result.available_payment_methods).toContain('google_pay');
      expect(result.available_payment_methods).toContain('paypal');
      expect(result.available_payment_method_count).toBe(4);
    });

    it('should include saved_credit_card when available', () => {
      const checkoutDetails: CheckoutDetailsResponse = {
        __typename: 'CheckoutReadyForAuthenticatedUser',
        buyer: { firstName: 'John', id: 'buyer-1' },
        purchasable: {
          currencyCode: 'USD',
          entitledHours: 5,
          id: 'item-1',
          name: '5 Hours',
          priceCents: 25000,
          type: 'CATALOG_ITEM',
        },
        savedPaymentMethod: {
          id: 'pm-1',
          lastFourDigits: '4242',
          type: 'CREDIT_CARD' as SavedPaymentMethodType,
        },
      };

      const availabilityWithSaved: PaymentMethodAvailability = {
        ...mockPaymentMethodAvailability,
        hasSavedPaymentMethod: true,
      };

      const result = buildCheckoutTrackingData(checkoutDetails, availabilityWithSaved);

      expect(result.available_payment_methods).toContain('saved_credit_card');
      expect(result.available_payment_method_count).toBe(5);
    });
  });

  describe('billing interval', () => {
    it('should set monthly billing for non-package', () => {
      const checkoutDetails: CheckoutDetailsResponse = {
        __typename: 'CheckoutReadyForGuest',
        purchasable: {
          currencyCode: 'USD',
          entitledHours: 5,
          id: 'item-1',
          name: 'Membership',
          priceCents: 25000,
          type: 'CATALOG_ITEM',
        },
      };

      const result = buildCheckoutTrackingData(checkoutDetails, mockPaymentMethodAvailability);

      expect(result.billing_interval).toBe('monthly');
      expect(result.is_package).toBe(false);
    });

    it('should set one_time billing for package without installments', () => {
      const checkoutDetails: CheckoutDetailsResponse = {
        __typename: 'CheckoutReadyForGuest',
        purchasable: {
          currencyCode: 'USD',
          entitledHours: 10,
          id: 'item-1',
          name: 'Package',
          priceCents: 50000,
          type: 'CATALOG_ITEM',
        },
      };

      const result = buildCheckoutTrackingData(checkoutDetails, mockPaymentMethodAvailability, {
        installmentsCount: 1,
        isPackage: true,
      });

      expect(result.billing_interval).toBe('one_time');
      expect(result.is_package).toBe(true);
      expect(result.has_installments).toBe(false);
    });

    it('should set installments billing for package with 2 payments', () => {
      const checkoutDetails: CheckoutDetailsResponse = {
        __typename: 'CheckoutReadyForGuest',
        purchasable: {
          currencyCode: 'USD',
          entitledHours: 20,
          id: 'item-1',
          name: 'Large Package',
          priceCents: 100000,
          type: 'CATALOG_ITEM',
        },
      };

      const result = buildCheckoutTrackingData(checkoutDetails, mockPaymentMethodAvailability, {
        installmentsCount: 2,
        isPackage: true,
      });

      expect(result.billing_interval).toBe('installments');
      expect(result.is_package).toBe(true);
      expect(result.has_installments).toBe(true);
      expect(result.installments_count).toBe(2);
    });
  });

  describe('purchasable data', () => {
    it('should include plan details from purchasable', () => {
      const checkoutDetails: CheckoutDetailsResponse = {
        __typename: 'CheckoutReadyForGuest',
        purchasable: {
          currencyCode: 'USD',
          discountLabel: '20% off',
          entitledHours: 10,
          id: 'plan-123',
          name: '10 Hour Package',
          oldPriceCents: 62500,
          priceCents: 50000,
          type: 'CATALOG_ITEM',
        },
      };

      const result = buildCheckoutTrackingData(checkoutDetails, mockPaymentMethodAvailability);

      expect(result.plan_id).toBe('plan-123');
      expect(result.plan_name).toBe('10 Hour Package');
      expect(result.plan_price).toBe(50000);
      expect(result.plan_currency).toBe('USD');
      expect(result.plan_duration).toBe(10);
      expect(result.discount_label).toBe('20% off');
      expect(result.plan_original_price).toBe(62500);
      expect(result.has_promotions).toBe(true);
    });

    it('should handle CheckoutNotReady without purchasable', () => {
      const checkoutDetails: CheckoutDetailsResponse = {
        __typename: 'CheckoutNotReady',
        reason: 'Quote expired',
      };

      const result = buildCheckoutTrackingData(checkoutDetails, mockPaymentMethodAvailability);

      expect(result.plan_id).toBeUndefined();
      expect(result.is_catalog_item).toBe(false);
    });
  });

  describe('user context data', () => {
    it('should include churn data when userData is provided', () => {
      const checkoutDetails: CheckoutDetailsResponse = {
        __typename: 'CheckoutReadyForGuest',
        purchasable: {
          currencyCode: 'USD',
          entitledHours: 5,
          id: 'item-1',
          name: '5 Hours',
          priceCents: 25000,
          type: 'CATALOG_ITEM',
        },
      };

      // Date 6 months ago
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const result = buildCheckoutTrackingData(checkoutDetails, mockPaymentMethodAvailability, {
        userData: {
          lastActiveDate: sixMonthsAgo.toISOString(),
          previousSessionCount: 15,
          previousSubjects: ['Math', 'Science'],
          studentGrade: '10th Grade',
        },
      });

      expect(result.churn_timeline_months).toBeGreaterThanOrEqual(5);
      expect(result.churn_timeline_months).toBeLessThanOrEqual(7);
      expect(result.previous_sessions_completed).toBe(15);
      expect(result.previous_subjects).toEqual(['Math', 'Science']);
      expect(result.student_grade).toBe('10th Grade');
    });
  });
});

describe('getLeadAndQuoteFromUrl', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        search: '',
      },
      writable: true,
    });
  });

  it('should extract lead_id and q params from URL', () => {
    window.location.search = '?lead_id=lead-123&q=quote-456';

    const result = getLeadAndQuoteFromUrl();

    expect(result.leadUuid).toBe('lead-123');
    expect(result.quoteId).toBe('quote-456');
  });

  it('should return null for missing params', () => {
    window.location.search = '?catalogItemId=item-123';

    const result = getLeadAndQuoteFromUrl();

    expect(result.leadUuid).toBeNull();
    expect(result.quoteId).toBeNull();
  });

  it('should handle empty search string', () => {
    window.location.search = '';

    const result = getLeadAndQuoteFromUrl();

    expect(result.leadUuid).toBeNull();
    expect(result.quoteId).toBeNull();
  });
});

describe('trackCardFieldBlur', () => {
  const { vtAnalytics } = jest.requireMock('./vt-analytics');

  beforeEach(() => {
    vtAnalytics.track.mockClear();
  });

  it('should track card number blur event', () => {
    trackCardFieldBlur('number');

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Card Number Focusout',
      expect.any(String),
      expect.objectContaining({ field_name: 'number' })
    );
  });

  it('should track expiration date blur event', () => {
    trackCardFieldBlur('expirationDate');

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Card Expiration Date Focusout',
      expect.any(String),
      expect.objectContaining({ field_name: 'expirationDate' })
    );
  });

  it('should track CVV blur event', () => {
    trackCardFieldBlur('cvv');

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Card CVV Focusout',
      expect.any(String),
      expect.objectContaining({ field_name: 'cvv' })
    );
  });
});

describe('trackCardFieldFocused', () => {
  const { vtAnalytics } = jest.requireMock('./vt-analytics');

  beforeEach(() => {
    vtAnalytics.track.mockClear();
  });

  it('should track card number focus event', () => {
    trackCardFieldFocused('number');

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Card Number Focused',
      expect.any(String),
      expect.objectContaining({ field_name: 'number' })
    );
  });

  it('should track expiration date focus event', () => {
    trackCardFieldFocused('expirationDate');

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Card Expiration Date Focused',
      expect.any(String),
      expect.objectContaining({ field_name: 'expirationDate' })
    );
  });

  it('should track CVV focus event', () => {
    trackCardFieldFocused('cvv');

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Card CVV Focused',
      expect.any(String),
      expect.objectContaining({ field_name: 'cvv' })
    );
  });
});

describe('trackCheckoutCompletionRouting', () => {
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

  it('should track redirect URL to New Relic', () => {
    trackCheckoutCompletionRouting('https://varsitytutors.com/account-creation');

    expect(mockAddPageAction).toHaveBeenCalledWith('checkout_completion_routing', {
      customEventData: {
        redirectUrl: 'https://varsitytutors.com/account-creation',
      },
    });
  });
});

describe('trackUserEmailAlreadyExists', () => {
  const mockAddPageAction = jest.fn();

  beforeEach(() => {
    mockAddPageAction.mockClear();
    (window as { newrelic?: { addPageAction: jest.Mock } }).newrelic = {
      addPageAction: mockAddPageAction,
    };
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        pathname: '/checkout',
        search: '?q=quote-123&lead_id=lead-456&p=PROMO20',
      },
      writable: true,
    });
  });

  afterEach(() => {
    delete (window as { newrelic?: unknown }).newrelic;
  });

  it('should track email exists event with URL params', () => {
    trackUserEmailAlreadyExists();

    expect(mockAddPageAction).toHaveBeenCalledWith('user_email_already_exists', {
      customEventData: {
        checkout_step: 'validate-checkout-eligibility',
        has_catalog_item: false,
        has_client_id: false,
        has_lead_id: true,
        has_promo_code: true,
        has_quote: true,
        page_path: '/checkout',
      },
    });
  });
});

describe('trackChatStarted', () => {
  const mockAddPageAction = jest.fn();

  beforeEach(() => {
    mockAddPageAction.mockClear();
    (window as { newrelic?: { addPageAction: jest.Mock } }).newrelic = {
      addPageAction: mockAddPageAction,
    };
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        pathname: '/checkout',
      },
      writable: true,
    });
  });

  afterEach(() => {
    delete (window as { newrelic?: unknown }).newrelic;
  });

  it('tracks chat started event to New Relic', () => {
    trackChatStarted('checkout');

    expect(mockAddPageAction).toHaveBeenCalledWith('chat_started', {
      customEventData: {
        element_id: 'messenger',
        element_type: 'genesys_messenger',
        flow_step: 'checkout',
        page_path: '/checkout',
        page_section: 'messenger_widget',
      },
    });
  });

  it('handles missing flow step', () => {
    trackChatStarted();

    expect(mockAddPageAction).toHaveBeenCalledWith('chat_started', {
      customEventData: {
        element_id: 'messenger',
        element_type: 'genesys_messenger',
        flow_step: '',
        page_path: '/checkout',
        page_section: 'messenger_widget',
      },
    });
  });
});

describe('trackCheckoutStarted', () => {
  const { vtAnalytics } = jest.requireMock('./vt-analytics');

  beforeEach(() => {
    vtAnalytics.track.mockClear();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'https://test.com/checkout?q=quote-123&lead_id=lead-456',
        pathname: '/checkout',
        search: '?q=quote-123&lead_id=lead-456',
      },
      writable: true,
    });
  });

  it('tracks checkout started event', () => {
    const checkoutDetails: CheckoutDetailsResponse = {
      __typename: 'CheckoutReadyForGuest',
      purchasable: {
        currencyCode: 'USD',
        entitledHours: 5,
        id: 'item-1',
        name: '5 Hours',
        priceCents: 25000,
        type: 'CATALOG_ITEM',
      },
    };

    const paymentMethodAvailability: PaymentMethodAvailability = {
      hasApplePay: true,
      hasCreditCard: true,
      hasGooglePay: false,
      hasPaypal: true,
      hasSavedPaymentMethod: false,
    };

    trackCheckoutStarted(checkoutDetails, paymentMethodAvailability);

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Checkout Started',
      expect.any(String),
      expect.any(Object)
    );
  });
});

describe('trackContentViewed', () => {
  const { vtAnalytics } = jest.requireMock('./vt-analytics');

  beforeEach(() => {
    vtAnalytics.track.mockClear();
  });

  it('tracks content viewed event', () => {
    trackContentViewed('modal-terms', 'modal', 'checkout', { custom_field: 'value' });

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Content Viewed',
      expect.any(String),
      expect.objectContaining({
        content_id: 'modal-terms',
        content_type: 'modal',
        custom_field: 'value',
        page_section: 'checkout',
      })
    );
  });
});

describe('trackElementClicked', () => {
  const { vtAnalytics } = jest.requireMock('./vt-analytics');

  beforeEach(() => {
    vtAnalytics.track.mockClear();
  });

  it('tracks element clicked event', () => {
    trackElementClicked('submit_button', 'button', 'checkout', { plan_id: 'plan-123' });

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Element Clicked',
      expect.any(String),
      expect.objectContaining({
        data_vt_track_element_id: 'submit_button',
        element_type: 'button',
        page_section: 'checkout',
        plan_id: 'plan-123',
      })
    );
  });
});

describe('trackElementClosed', () => {
  const { vtAnalytics } = jest.requireMock('./vt-analytics');

  beforeEach(() => {
    vtAnalytics.track.mockClear();
  });

  it('tracks element closed event', () => {
    trackElementClosed('modal-terms', 'modal', 'checkout');

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Element Closed',
      expect.any(String),
      expect.objectContaining({
        data_vt_track_element_id: 'modal-terms',
        element_type: 'modal',
        page_section: 'checkout',
      })
    );
  });
});

describe('trackElementOpened', () => {
  const { vtAnalytics } = jest.requireMock('./vt-analytics');

  beforeEach(() => {
    vtAnalytics.track.mockClear();
  });

  it('tracks element opened event', () => {
    trackElementOpened('modal-terms', 'modal', 'checkout');

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Element Opened',
      expect.any(String),
      expect.objectContaining({
        data_vt_track_element_id: 'modal-terms',
        element_type: 'modal',
        page_section: 'checkout',
      })
    );
  });
});

describe('trackEscapePlanClicked', () => {
  const { vtAnalytics } = jest.requireMock('./vt-analytics');
  const mockAddPageAction = jest.fn();

  beforeEach(() => {
    vtAnalytics.track.mockClear();
    mockAddPageAction.mockClear();
    (window as { newrelic?: { addPageAction: jest.Mock } }).newrelic = {
      addPageAction: mockAddPageAction,
    };
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        pathname: '/checkout',
        search: '?q=quote-123',
      },
      writable: true,
    });
  });

  afterEach(() => {
    delete (window as { newrelic?: unknown }).newrelic;
  });

  it('tracks escape plan clicked to both New Relic and VT Analytics', () => {
    trackEscapePlanClicked();

    expect(mockAddPageAction).toHaveBeenCalledWith('escape_plan_button_clicked', {
      customEventData: {
        path: '/checkout',
        search: '?q=quote-123',
      },
    });

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Element Clicked',
      expect.any(String),
      expect.objectContaining({
        data_vt_track_element_id: 'escape_plan_button',
        element_type: 'button',
        page_section: 'checkout',
      })
    );
  });
});

describe('trackExperiment', () => {
  const mockAddPageAction = jest.fn();

  beforeEach(() => {
    mockAddPageAction.mockClear();
    (window as { newrelic?: { addPageAction: jest.Mock } }).newrelic = {
      addPageAction: mockAddPageAction,
    };
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        search: '?q=quote-123&lead_id=lead-456',
      },
      writable: true,
    });
  });

  afterEach(() => {
    delete (window as { newrelic?: unknown }).newrelic;
  });

  it('tracks experiment event with label and flag value', () => {
    trackExperiment('checkout-test', 'variant-a', 'US');

    expect(mockAddPageAction).toHaveBeenCalledWith('experiment', {
      customEventData: {
        category: 'ecomm500',
        countryCode: 'US',
        flagValue: 'variant-a',
        label: 'checkout-test',
        leadUuid: 'lead-456',
        quoteId: 'quote-123',
        uniqueId: 'lead-456',
      },
    });
  });

  it('does not track experiment without lead/quote', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { search: '' },
      writable: true,
    });

    trackExperiment('checkout-test', 'variant-a');

    expect(mockAddPageAction).not.toHaveBeenCalled();
  });
});

describe('trackPurchaseEvent', () => {
  const { vtAnalytics } = jest.requireMock('./vt-analytics');
  const mockAddPageAction = jest.fn();

  beforeEach(() => {
    vtAnalytics.track.mockClear();
    vtAnalytics.identify.mockClear();

    mockAddPageAction.mockClear();
    (window as { newrelic?: { addPageAction: jest.Mock } }).newrelic = {
      addPageAction: mockAddPageAction,
    };

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'https://test.com/checkout/quoteless-checkout?lead_id=lead-456&q=quote-123',
        pathname: '/checkout/quoteless-checkout',
        search: '?lead_id=lead-456&q=quote-123',
      },
      writable: true,
    });
  });

  afterEach(() => {
    delete (window as { newrelic?: unknown }).newrelic;
  });

  it('tracks purchase completed with lead/quote and emits New Relic completion event', async () => {
    const checkoutDetails: CheckoutDetailsResponse = {
      __typename: 'CheckoutReady',
      buyer: { firstName: 'Sam', id: 'buyer-1' },
      options: [],
      purchasable: {
        currencyCode: 'USD',
        entitledHours: 1,
        id: 'quote-123',
        name: 'Quote',
        priceCents: 100,
        type: 'QUOTE',
      },
    };

    const paymentMethodAvailability: PaymentMethodAvailability = {
      hasApplePay: false,
      hasCreditCard: true,
      hasGooglePay: false,
      hasPaypal: false,
      hasSavedPaymentMethod: false,
    };

    await trackPurchaseEvent(checkoutDetails, paymentMethodAvailability, 'credit_card');

    expect(vtAnalytics.identify).toHaveBeenCalledWith('buyer-1');
    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Purchase Completed',
      expect.any(String),
      expect.objectContaining({
        lead_uuid: 'lead-456',
        payment_method: 'credit_card',
        quote_id: 'quote-123',
      })
    );

    expect(mockAddPageAction).toHaveBeenCalledWith('general_checkout_completed', {
      customEventData: expect.objectContaining({
        checkoutType: 'membership-checkout',
        label: 'checkout-success-nextjs',
        leadUuid: 'lead-456',
        quoteId: 'quote-123',
      }),
    });
  });
});

describe('trackPlanPreselected', () => {
  const { vtAnalytics } = jest.requireMock('./vt-analytics');

  beforeEach(() => {
    vtAnalytics.track.mockClear();
  });

  it('tracks plan preselected event', () => {
    trackPlanPreselected('plan-123', '10 Hours', 50000, 10, { currency: 'USD' });

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Plan Preselected',
      expect.any(String),
      expect.objectContaining({
        currency: 'USD',
        plan_duration: 10,
        plan_id: 'plan-123',
        plan_name: '10 Hours',
        plan_price: 50000,
      })
    );
  });
});

describe('trackPlanSelected', () => {
  const { vtAnalytics } = jest.requireMock('./vt-analytics');

  beforeEach(() => {
    vtAnalytics.track.mockClear();
  });

  it('tracks plan selected event', () => {
    trackPlanSelected('plan-123', '10 Hours', 50000, 10, {
      currencyCode: 'USD',
      oldPriceCents: 62500,
      type: 'CATALOG_ITEM',
    });

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Plan Selected',
      expect.any(String),
      expect.objectContaining({
        plan_currency: 'USD',
        plan_duration: 10,
        plan_id: 'plan-123',
        plan_name: '10 Hours',
        plan_original_price: 62500,
        plan_price: 50000,
        plan_type: 'CATALOG_ITEM',
      })
    );
  });

  it('includes previous plan data when switching plans', () => {
    trackPlanSelected('plan-456', '20 Hours', 100000, 20, {
      previousPlan: {
        currencyCode: 'USD',
        entitledHours: 10,
        id: 'plan-123',
        name: '10 Hours',
        priceCents: 50000,
      },
    });

    expect(vtAnalytics.track).toHaveBeenCalledWith(
      'Plan Selected',
      expect.any(String),
      expect.objectContaining({
        previous_plan_currency: 'USD',
        previous_plan_duration_hours: 10,
        previous_plan_id: 'plan-123',
        previous_plan_name: '10 Hours',
        previous_plan_price: 50000,
      })
    );
  });
});

describe('Meta Pixel InitiateCheckout deduplication', () => {
  const mockPaymentMethodAvailability: PaymentMethodAvailability = {
    hasApplePay: true,
    hasCreditCard: true,
    hasGooglePay: true,
    hasPaypal: true,
    hasSavedPaymentMethod: false,
  };

  const mockCheckoutDetails: CheckoutDetailsResponse = {
    __typename: 'CheckoutReady',
    buyer: { firstName: 'Test', id: 'buyer-123' },
    purchasable: {
      currencyCode: 'USD',
      entitledHours: 10,
      id: 'plan-123',
      name: '10 Hours',
      priceCents: 50000,
      type: 'CATALOG_ITEM',
    },
  };

  beforeEach(() => {
    sessionStorage.clear();
    (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
    delete (window as unknown as { fbq?: unknown }).fbq;
    jest.spyOn(console, 'debug').mockImplementation(() => {});

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'https://test.com/checkout?q=quote-123&lead_id=lead-456',
        pathname: '/checkout',
        search: '?q=quote-123&lead_id=lead-456',
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log warning when pixel not available on first call', () => {
    // Arrange
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Act
    trackCheckoutStarted(mockCheckoutDetails, mockPaymentMethodAvailability);

    // Assert
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Meta Pixel] Pixel not available, skipping event: InitiateCheckout'
    );
    consoleWarnSpy.mockRestore();
  });

  it('should store event ID in sessionStorage after first call', () => {
    // Act
    trackCheckoutStarted(mockCheckoutDetails, mockPaymentMethodAvailability);

    // Assert
    expect(sessionStorage.getItem('meta_initiate_checkout_fired')).toBeTruthy();
  });

  it('should prevent duplicate Meta InitiateCheckout events within the same session', () => {
    // Arrange
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Act
    trackCheckoutStarted(mockCheckoutDetails, mockPaymentMethodAvailability);
    trackCheckoutStarted(mockCheckoutDetails, mockPaymentMethodAvailability);
    trackCheckoutStarted(mockCheckoutDetails, mockPaymentMethodAvailability);

    // Assert - only one warning should be logged (event is deduplicated)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    consoleWarnSpy.mockRestore();
  });

  it('should fire new Meta InitiateCheckout event after sessionStorage is cleared', () => {
    // Arrange
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Act
    trackCheckoutStarted(mockCheckoutDetails, mockPaymentMethodAvailability);
    sessionStorage.clear();
    trackCheckoutStarted(mockCheckoutDetails, mockPaymentMethodAvailability);

    // Assert - two warnings should be logged (one per session)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    consoleWarnSpy.mockRestore();
  });

  it('should fire Meta InitiateCheckout event when pixel is available', () => {
    // Arrange
    const mockFbq = jest.fn() as jest.Mock & { loaded: boolean };
    mockFbq.loaded = true;
    (window as unknown as { fbq: typeof mockFbq }).fbq = mockFbq;

    // Act
    trackCheckoutStarted(mockCheckoutDetails, mockPaymentMethodAvailability);

    // Assert - fbq should be called with correct parameters
    expect(mockFbq).toHaveBeenCalledWith(
      'track',
      'InitiateCheckout',
      expect.objectContaining({
        content_type: 'membership',
        currency: 'USD',
        lead_uuid: 'lead-456',
        quote_id: 'quote-123',
        value: 500,
      }),
      expect.objectContaining({
        eventID: expect.any(String),
      })
    );

    // Assert - eventID should be stored in sessionStorage
    expect(sessionStorage.getItem('meta_initiate_checkout_fired')).toBeTruthy();
  });

  it('should pass correct content_type for package checkout', () => {
    // Arrange
    const mockFbq = jest.fn() as jest.Mock & { loaded: boolean };
    mockFbq.loaded = true;
    (window as unknown as { fbq: typeof mockFbq }).fbq = mockFbq;

    const packageCheckoutDetails: CheckoutDetailsResponse = {
      ...mockCheckoutDetails,
    };

    // Act
    trackCheckoutStarted(packageCheckoutDetails, mockPaymentMethodAvailability, {
      isPackage: true,
    });

    // Assert - content_type should be 'package'
    expect(mockFbq).toHaveBeenCalledWith(
      'track',
      'InitiateCheckout',
      expect.objectContaining({
        content_type: 'package',
      }),
      expect.any(Object)
    );
  });
});

describe('Meta Pixel Purchase deduplication', () => {
  const mockPaymentMethodAvailability: PaymentMethodAvailability = {
    hasApplePay: true,
    hasCreditCard: true,
    hasGooglePay: true,
    hasPaypal: true,
    hasSavedPaymentMethod: false,
  };

  const mockCheckoutDetails: CheckoutDetailsResponse = {
    __typename: 'CheckoutReady',
    buyer: { firstName: 'Test', id: 'buyer-123' },
    purchasable: {
      currencyCode: 'USD',
      entitledHours: 10,
      id: 'plan-123',
      name: '10 Hours',
      priceCents: 50000,
      type: 'CATALOG_ITEM',
    },
  };

  beforeEach(() => {
    delete (window as unknown as { fbq?: unknown }).fbq;
    jest.spyOn(console, 'debug').mockImplementation(() => {});

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'https://test.com/checkout?q=quote-123&lead_id=lead-456',
        pathname: '/checkout',
        search: '?q=quote-123&lead_id=lead-456',
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fire Meta Purchase event with paymentId as eventID', async () => {
    // Arrange
    const mockFbq = jest.fn() as jest.Mock & { loaded: boolean };
    mockFbq.loaded = true;
    (window as unknown as { fbq: typeof mockFbq }).fbq = mockFbq;

    // Act
    await trackPurchaseEvent(mockCheckoutDetails, mockPaymentMethodAvailability, 'credit_card', {
      paymentId: 'payment-abc-123',
    });

    // Assert
    expect(mockFbq).toHaveBeenCalledWith(
      'track',
      'Purchase',
      expect.objectContaining({
        content_type: 'membership',
        currency: 'USD',
        value: 500,
      }),
      { eventID: 'payment-abc-123' }
    );
  });

  it('should not fire Meta Purchase event when paymentId is not provided', async () => {
    // Arrange
    const mockFbq = jest.fn() as jest.Mock & { loaded: boolean };
    mockFbq.loaded = true;
    (window as unknown as { fbq: typeof mockFbq }).fbq = mockFbq;

    // Act
    await trackPurchaseEvent(mockCheckoutDetails, mockPaymentMethodAvailability, 'credit_card');

    // Assert
    expect(mockFbq).not.toHaveBeenCalledWith(
      'track',
      'Purchase',
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should log warning when pixel not available', async () => {
    // Arrange
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Act
    await trackPurchaseEvent(mockCheckoutDetails, mockPaymentMethodAvailability, 'credit_card', {
      paymentId: 'payment-abc-123',
    });

    // Assert
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Meta Pixel] Pixel not available, skipping event: Purchase'
    );
    consoleWarnSpy.mockRestore();
  });
});
