'use client';

/**
 * Checkout-specific tracking functions
 * Ported from originals/checkout-ts/src/components/shared/services/tracking/
 */

import type { CheckoutDetailsResponse } from '../api/checkout-details';

import { calculateChurnMonths } from '../utils/calculate-churn-months';
import { getCountryFromCurrency } from '../utils/currency-to-country';
import { newRelicTrack } from './error-tracking';
import { sessionReplayService } from './session-replay';
import {
  CheckoutTrackingData,
  NewRelicEvent,
  PaymentMethodAvailability,
  TrackingCategory,
  TrackingPlanEventName,
  UserContextData,
} from './types';
import { vtAnalytics } from './vt-analytics';

/**
 * Options for building checkout tracking data
 */
export interface CheckoutTrackingOptions {
  /** Number of installment payments (for package checkout) */
  installmentsCount?: number;
  /** Whether this is a lead resubmission flow */
  isLeadResubmissionFlow?: boolean;
  /** Whether this is a package checkout (multiple payments) */
  isPackage?: boolean;
  /** VTWA payment ID used as event_id for Meta Pixel deduplication */
  paymentId?: string;
  /** Preselected plan data (initial/default plan shown to user) */
  preselectedPlan?: PreselectedPlanData;
  /** Promo code applied to checkout */
  promoCode?: string;
  /** User historical context data */
  userData?: UserContextData;
}

/**
 * Preselected plan data for purchase event tracking
 */
interface PreselectedPlanData {
  currencyCode?: string;
  entitledHours?: number;
  id: string;
  name?: string;
  oldPriceCents?: number;
  priceCents: number;
  type?: string;
}

/**
 * Previous plan data for tracking plan switches
 */
interface PreviousPlanData {
  currencyCode?: string;
  entitledHours?: number;
  id?: string;
  name?: string;
  oldPriceCents?: number;
  priceCents?: number;
  type?: string;
}

/**
 * Builds the checkout tracking data object
 */
export function buildCheckoutTrackingData(
  checkoutDetails: CheckoutDetailsResponse,
  paymentMethodAvailability: PaymentMethodAvailability,
  options?: CheckoutTrackingOptions
): CheckoutTrackingData {
  const { leadUuid, quoteId } = getLeadAndQuoteFromUrl();
  const utmParameters = extractUtmParameters();
  const sessionReplayProps = sessionReplayService.getSessionReplayProperties();

  // Determine authentication state
  const isAuthenticated = checkoutDetails.__typename === 'CheckoutReadyForAuthenticatedUser';
  const isAutoAuthenticated = checkoutDetails.__typename === 'CheckoutReady';

  // Get purchasable data
  const purchasable =
    checkoutDetails.__typename !== 'CheckoutNotReady' ? checkoutDetails.purchasable : null;

  // Build available payment methods array
  const availablePaymentMethods: string[] = [];
  if (paymentMethodAvailability.hasCreditCard) {
    availablePaymentMethods.push('credit_card');
  }
  if (paymentMethodAvailability.hasApplePay) {
    availablePaymentMethods.push('apple_pay');
  }
  if (paymentMethodAvailability.hasGooglePay) {
    availablePaymentMethods.push('google_pay');
  }
  if (paymentMethodAvailability.hasPaypal) {
    availablePaymentMethods.push('paypal');
  }
  if (paymentMethodAvailability.hasSavedPaymentMethod) {
    availablePaymentMethods.push('saved_credit_card');
  }

  // Get buyer info for authenticated users
  let hasSavedCreditCard = false;
  let buyerFirstName: string | undefined;

  if (checkoutDetails.__typename === 'CheckoutReadyForAuthenticatedUser') {
    hasSavedCreditCard = !!checkoutDetails.savedPaymentMethod;
    buyerFirstName = checkoutDetails.buyer?.firstName;
  } else if (checkoutDetails.__typename === 'CheckoutReady') {
    buyerFirstName = checkoutDetails.buyer?.firstName;
  }

  // Determine billing interval based on package status and installments
  const installmentsCount = options?.installmentsCount ?? 1;
  const isPackage = options?.isPackage ?? false;
  const hasInstallments = installmentsCount > 1;

  let billingInterval: 'installments' | 'monthly' | 'one_time' = 'monthly';
  if (isPackage) {
    billingInterval = hasInstallments ? 'installments' : 'one_time';
  }

  // Get country code from currency
  const countryCode = getCountryFromCurrency(purchasable?.currencyCode);

  // Build tracking data
  const trackingData: CheckoutTrackingData = {
    available_payment_method_count: availablePaymentMethods.length,
    available_payment_methods: availablePaymentMethods,
    billing_interval: billingInterval,
    buyer_first_name: buyerFirstName,
    country_code: countryCode,
    has_apple_pay_available: paymentMethodAvailability.hasApplePay,
    has_credit_card_available: paymentMethodAvailability.hasCreditCard,
    has_google_pay_available: paymentMethodAvailability.hasGooglePay,
    has_installments: hasInstallments,
    has_paypal_available: paymentMethodAvailability.hasPaypal,
    has_promotions: !!purchasable?.discountLabel,
    has_saved_credit_card: hasSavedCreditCard,
    installments_count: installmentsCount,
    is_authenticated: isAuthenticated,
    is_auto_authenticated: isAutoAuthenticated,
    is_catalog_item: !!purchasable,
    is_lead_resubmission_flow: options?.isLeadResubmissionFlow ?? false,
    is_package: isPackage,
    is_quote_based: !!quoteId,
    is_reactivation_flow: isReactivationFlow(),
    timestamp: Date.now(),
    // UTM and session replay
    ...utmParameters,
    ...sessionReplayProps,
  };

  // Add user context data (for reactivation/churn analysis)
  const userData = options?.userData;
  if (userData) {
    if (userData.lastActiveDate) {
      trackingData.churn_timeline_months = calculateChurnMonths(userData.lastActiveDate);
      trackingData.previous_last_active_date = userData.lastActiveDate;
    }
    if (userData.previousSessionCount !== undefined) {
      trackingData.previous_sessions_completed = userData.previousSessionCount;
    }
    if (userData.previousSubjects && userData.previousSubjects.length > 0) {
      trackingData.previous_subjects = userData.previousSubjects;
    }
    if (userData.studentGrade) {
      trackingData.student_grade = userData.studentGrade;
    }
  }

  // Add optional fields
  if (leadUuid) {
    trackingData.lead_uuid = leadUuid;
  }
  if (quoteId) {
    trackingData.quote_id = quoteId;
  }
  if (options?.promoCode) {
    trackingData.promo_code = options.promoCode;
  }
  if (purchasable) {
    trackingData.plan_id = purchasable.id;
    trackingData.plan_name = purchasable.name;
    trackingData.plan_price = purchasable.priceCents;
    trackingData.plan_currency = purchasable.currencyCode;
    trackingData.plan_duration = purchasable.entitledHours;
    trackingData.plan_type = purchasable.name;

    if (purchasable.discountLabel) {
      trackingData.discount_label = purchasable.discountLabel;
    }
    if (purchasable.oldPriceCents) {
      trackingData.plan_original_price = purchasable.oldPriceCents;
      trackingData.purchasable_old_price_cents = purchasable.oldPriceCents;
    }
    trackingData.purchasable_price_cents = purchasable.priceCents;
  }

  return trackingData;
}

/**
 * Extracts lead/quote identifiers from URL
 */
export function getLeadAndQuoteFromUrl(): { leadUuid: null | string; quoteId: null | string } {
  if (typeof window === 'undefined') {
    return { leadUuid: null, quoteId: null };
  }

  const urlParams = new URLSearchParams(window.location.search);
  return {
    leadUuid: urlParams.get('lead_id'),
    quoteId: urlParams.get('q'),
  };
}

/**
 * Tracks hosted field blur events (credit card form)
 */
export function trackCardFieldBlur(field: 'cvv' | 'expirationDate' | 'number'): void {
  const eventMap = {
    cvv: TrackingPlanEventName.CARD_CVV_FOCUSOUT,
    expirationDate: TrackingPlanEventName.CARD_EXPIRATION_DATE_FOCUSOUT,
    number: TrackingPlanEventName.CARD_NUMBER_FOCUSOUT,
  };

  vtAnalytics.track(eventMap[field], TrackingCategory.INTERACTIONS, {
    field_name: field,
  });
}

/**
 * Tracks hosted field focus events (credit card form)
 */
export function trackCardFieldFocused(field: 'cvv' | 'expirationDate' | 'number'): void {
  const eventMap = {
    cvv: TrackingPlanEventName.CARD_CVV_FOCUSED,
    expirationDate: TrackingPlanEventName.CARD_EXPIRATION_DATE_FOCUSED,
    number: TrackingPlanEventName.CARD_NUMBER_FOCUSED,
  };

  vtAnalytics.track(eventMap[field], TrackingCategory.INTERACTIONS, {
    field_name: field,
  });
}

/**
 * Tracks when the Genesys chat widget is opened/started
 * Call this when the user initiates a chat session
 */
export function trackChatStarted(flowStep?: string): void {
  newRelicTrack(NewRelicEvent.CHAT_STARTED, {
    element_id: 'messenger',
    element_type: 'genesys_messenger',
    flow_step: flowStep || '',
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    page_section: 'messenger_widget',
  });
}

/**
 * Tracks post-checkout redirect routing
 * Call this before redirecting to account creation or return URL
 */
export function trackCheckoutCompletionRouting(redirectUrl: string): void {
  newRelicTrack(NewRelicEvent.CHECKOUT_COMPLETION_ROUTING, {
    redirectUrl,
  });
}

/**
 * Tracks the checkout started event
 * Call this at the end of checkout initialization
 */
export function trackCheckoutStarted(
  checkoutDetails: CheckoutDetailsResponse,
  paymentMethodAvailability: PaymentMethodAvailability,
  options?: CheckoutTrackingOptions
): void {
  try {
    const trackingData = buildCheckoutTrackingData(
      checkoutDetails,
      paymentMethodAvailability,
      options
    );

    vtAnalytics.track(
      TrackingPlanEventName.CHECKOUT_STARTED,
      TrackingCategory.CUSTOM_EVENTS,
      trackingData
    );

    // Meta Pixel InitiateCheckout event
    trackMetaInitiateCheckout(trackingData);

    console.debug('[Analytics] Checkout Started', {
      availablePaymentMethods: trackingData.available_payment_methods,
      countryCode: trackingData.country_code,
      isPackage: trackingData.is_package,
      isReactivation: trackingData.is_reactivation_flow,
      leadUuid: trackingData.lead_uuid,
      quoteId: trackingData.quote_id,
    });
  } catch (error) {
    console.error('[Analytics] Failed to track checkout started:', error);
  }
}

/**
 * Tracks content view events
 * Use for modals, panels, or other content that appears/disappears
 */
export function trackContentViewed(
  contentId: string,
  contentType: string,
  pageSection: string,
  additionalData?: Record<string, unknown>
): void {
  vtAnalytics.track(TrackingPlanEventName.CONTENT_VIEWED, TrackingCategory.INTERACTIONS, {
    content_id: contentId,
    content_type: contentType,
    page_section: pageSection,
    ...additionalData,
  });
}

/**
 * Tracks element clicks
 */
export function trackElementClicked(
  elementId: string,
  elementType: string,
  pageSection: string,
  additionalData?: Record<string, unknown>
): void {
  vtAnalytics.track(TrackingPlanEventName.ELEMENT_CLICKED, TrackingCategory.INTERACTIONS, {
    data_vt_track_element_id: elementId,
    element_type: elementType,
    page_section: pageSection,
    ...additionalData,
  });
}

/**
 * Tracks element closed events (modals, dropdowns, etc.)
 */
export function trackElementClosed(
  elementId: string,
  elementType: string,
  pageSection: string
): void {
  vtAnalytics.track(TrackingPlanEventName.ELEMENT_CLOSED, TrackingCategory.INTERACTIONS, {
    data_vt_track_element_id: elementId,
    element_type: elementType,
    page_section: pageSection,
  });
}

/**
 * Tracks element opened events (modals, dropdowns, etc.)
 */
export function trackElementOpened(
  elementId: string,
  elementType: string,
  pageSection: string
): void {
  vtAnalytics.track(TrackingPlanEventName.ELEMENT_OPENED, TrackingCategory.INTERACTIONS, {
    data_vt_track_element_id: elementId,
    element_type: elementType,
    page_section: pageSection,
  });
}

/**
 * Tracks when user clicks the escape plan button
 * Call this before redirecting to legacy checkout
 */
export function trackEscapePlanClicked(): void {
  // Track to New Relic
  newRelicTrack(NewRelicEvent.ESCAPE_PLAN_BUTTON_CLICKED, {
    path: typeof window !== 'undefined' ? window.location.pathname : '',
    search: typeof window !== 'undefined' ? window.location.search : '',
  });

  // Track to VT Analytics
  vtAnalytics.track(TrackingPlanEventName.ELEMENT_CLICKED, TrackingCategory.INTERACTIONS, {
    data_vt_track_element_id: 'escape_plan_button',
    element_type: 'button',
    page_section: 'checkout',
  });
}

/**
 * Tracks A/B experiment exposure
 * Call this for page views and conversions to correlate experiment variants
 */
export function trackExperiment(label: string, flagValue: string, countryCode?: string): void {
  const { leadUuid, quoteId } = getLeadAndQuoteFromUrl();
  if (!leadUuid || !quoteId) return;

  newRelicTrack(NewRelicEvent.EXPERIMENT, {
    category: 'ecomm500',
    countryCode: countryCode || 'US',
    flagValue,
    label,
    leadUuid,
    quoteId,
    uniqueId: leadUuid,
  });
}

/**
 * Tracks experiment exposure for checkout page view
 * Call this when checkout page loads to record experiment variant exposure
 */
export function trackExperimentPageView(flagValue: string, countryCode?: string): void {
  trackExperiment('checkout-page-view-nextjs', flagValue, countryCode);
}

/**
 * Tracks experiment conversion for successful purchase
 * Call this after successful purchase to record experiment conversion
 */
export function trackExperimentPurchase(flagValue: string, countryCode?: string): void {
  trackExperiment('checkout-success-nextjs', flagValue, countryCode);
}

/**
 * Tracks when a plan is preselected (initial load)
 * Call this when the checkout page loads with a preselected plan
 */
export function trackPlanPreselected(
  planId: string,
  planName: string,
  planPrice: number,
  planHours: number,
  additionalData?: Record<string, unknown>
): void {
  vtAnalytics.track(TrackingPlanEventName.PLAN_PRESELECTED, TrackingCategory.CUSTOM_EVENTS, {
    plan_duration: planHours,
    plan_id: planId,
    plan_name: planName,
    plan_price: planPrice,
    ...additionalData,
  });
}

/**
 * Tracks plan selection with optional previous plan data
 */
export function trackPlanSelected(
  planId: string,
  planName: string,
  planPrice: number,
  planHours: number,
  options?: {
    currencyCode?: string;
    oldPriceCents?: number;
    previousPlan?: PreviousPlanData;
    type?: string;
  }
): void {
  const trackingData: Record<string, number | string | undefined> = {
    plan_currency: options?.currencyCode,
    plan_duration: planHours,
    plan_id: planId,
    plan_name: planName,
    plan_original_price: options?.oldPriceCents,
    plan_price: planPrice,
    plan_type: options?.type,
  };

  // Add previous plan data if switching plans
  if (options?.previousPlan) {
    trackingData.previous_plan_currency = options.previousPlan.currencyCode;
    trackingData.previous_plan_duration_hours = options.previousPlan.entitledHours;
    trackingData.previous_plan_id = options.previousPlan.id;
    trackingData.previous_plan_name = options.previousPlan.name;
    trackingData.previous_plan_original_price = options.previousPlan.oldPriceCents;
    trackingData.previous_plan_price = options.previousPlan.priceCents;
    trackingData.previous_plan_type = options.previousPlan.type;
  }

  vtAnalytics.track(
    TrackingPlanEventName.PLAN_SELECTED,
    TrackingCategory.CUSTOM_EVENTS,
    trackingData
  );
}

/**
 * Tracks a successful purchase event
 */
export async function trackPurchaseEvent(
  checkoutDetails: CheckoutDetailsResponse,
  paymentMethodAvailability: PaymentMethodAvailability,
  paymentMethod: 'apple_pay' | 'credit_card' | 'google_pay' | 'paypal' | 'saved_credit_card',
  options?: CheckoutTrackingOptions
): Promise<void> {
  try {
    const baseTrackingData = buildCheckoutTrackingData(
      checkoutDetails,
      paymentMethodAvailability,
      options
    );

    // Build preselected plan properties if provided
    const preselectedPlanProps = options?.preselectedPlan
      ? {
          preselected_plan_currency: options.preselectedPlan.currencyCode,
          preselected_plan_duration: options.preselectedPlan.entitledHours,
          preselected_plan_id: options.preselectedPlan.id,
          preselected_plan_name: options.preselectedPlan.name,
          preselected_plan_original_price: options.preselectedPlan.oldPriceCents,
          preselected_plan_price: options.preselectedPlan.priceCents,
          preselected_plan_type: options.preselectedPlan.type,
        }
      : {};

    const purchaseData = {
      ...baseTrackingData,
      ...preselectedPlanProps,
      payment_method: paymentMethod,
    };

    // Get user ID for identification
    const userId =
      checkoutDetails.__typename === 'CheckoutReadyForAuthenticatedUser' ||
      checkoutDetails.__typename === 'CheckoutReady'
        ? checkoutDetails.buyer?.id
        : null;

    // Identify user before purchase event
    if (userId) {
      vtAnalytics.identify(userId);
    }

    // Track purchase completed
    vtAnalytics.track(
      TrackingPlanEventName.PURCHASE_COMPLETED,
      TrackingCategory.CUSTOM_EVENTS,
      purchaseData
    );

    // Track to New Relic
    // Determine checkout type (package, membership, or catalog item)
    let checkoutType = 'catalog-item-checkout';
    if (baseTrackingData.is_package) {
      checkoutType = 'package-checkout';
    } else if (baseTrackingData.is_quote_based) {
      checkoutType = 'membership-checkout';
    }

    newRelicTrack(NewRelicEvent.GENERAL_CHECKOUT_COMPLETED, {
      catalogItemId: baseTrackingData.plan_id || '',
      checkoutType,
      countryCode: baseTrackingData.country_code || 'US',
      isReactivationFlow: baseTrackingData.is_reactivation_flow,
      label: 'checkout-success-nextjs',
      leadUuid: baseTrackingData.lead_uuid || '',
      promoDiscountLabel: baseTrackingData.discount_label || '',
      promoOldPriceCents: baseTrackingData.purchasable_old_price_cents || 0,
      promoPriceCents: baseTrackingData.purchasable_price_cents || 0,
      quoteId: baseTrackingData.quote_id || '',
    });

    // Meta Pixel Purchase event for deduplication with server-side CAPI
    if (options?.paymentId) {
      trackMetaPurchase(options.paymentId, baseTrackingData);
    }

    console.debug('[Analytics] Purchase Completed', {
      countryCode: baseTrackingData.country_code,
      paymentMethod,
      planId: baseTrackingData.plan_id,
      userId,
    });
  } catch (error) {
    console.error('[Analytics] Failed to track purchase event:', error);
  }
}

/**
 * Tracks when a user email already exists during checkout validation
 * Call this when checkout returns USER_ALREADY_EXISTS reason
 */
export function trackUserEmailAlreadyExists(): void {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);

  newRelicTrack(NewRelicEvent.USER_EMAIL_ALREADY_EXISTS, {
    checkout_step: 'validate-checkout-eligibility',
    has_catalog_item: !!urlParams.get('catalogItemId'),
    has_client_id: !!urlParams.get('c'),
    has_lead_id: !!urlParams.get('lead_id'),
    has_promo_code: !!urlParams.get('p'),
    has_quote: !!urlParams.get('q'),
    page_path: window.location.pathname,
  });
}

/**
 * Tracks user login success
 */
export function trackUserLogin(
  checkoutType: 'regular_checkout' | 'seamless_reactivation',
  userId?: null | string
): void {
  if (userId) {
    vtAnalytics.identify(userId);
  }

  vtAnalytics.track(TrackingPlanEventName.USER_LOGGED_IN, TrackingCategory.INTERACTIONS, {
    checkout_type: checkoutType,
    data_vt_track_element_id: 'sign_in_form',
    element_type: 'form',
    page_section: 'step_2_payment',
    ...(userId ? { userID: userId } : {}),
  });
}

/**
 * Tracks user login failure
 */
export function trackUserLoginFailed(errorType: string): void {
  vtAnalytics.track(TrackingPlanEventName.USER_LOGIN_FAILED, TrackingCategory.INTERACTIONS, {
    data_vt_track_element_id: 'sign_in_form',
    element_type: 'form',
    error_type: errorType,
    page_section: 'step_2_payment',
  });
}

/**
 * Extracts UTM parameters from the current URL
 */
function extractUtmParameters(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  for (const key of utmKeys) {
    const value = urlParams.get(key);
    if (value) {
      utmParams[key] = value;
    }
  }

  return utmParams;
}

/**
 * Generates a unique event ID for Meta Pixel deduplication
 */
function generateMetaEventId(): string {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, '0');
  const random = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0')
  ).join('');
  const counter = Math.floor(Math.random() * 16777216)
    .toString(16)
    .padStart(6, '0');
  return timestamp + random + counter;
}

// Standard Meta Pixel events that should use fbq('track', ...)
// Custom events should use fbq('trackCustom', ...)
const STANDARD_META_EVENTS = [
  'AddPaymentInfo',
  'AddToCart',
  'AddToWishlist',
  'CompleteRegistration',
  'Contact',
  'CustomizeProduct',
  'Donate',
  'FindLocation',
  'InitiateCheckout',
  'Lead',
  'PageView',
  'Purchase',
  'Schedule',
  'Search',
  'StartTrial',
  'SubmitApplication',
  'Subscribe',
  'ViewContent',
];

const META_INITIATE_CHECKOUT_KEY = 'meta_initiate_checkout_fired';

/**
 * Detects if this is a reactivation flow
 */
function isReactivationFlow(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.location.pathname.includes('welcome-back');
}

/**
 * Tracks Meta Pixel InitiateCheckout event
 */
function trackMetaInitiateCheckout(trackingData: CheckoutTrackingData): null | string {
  if (typeof window === 'undefined') return null;

  // Check if already fired this session to prevent duplicates
  try {
    const existingEventId = sessionStorage.getItem(META_INITIATE_CHECKOUT_KEY);
    if (existingEventId) {
      return existingEventId;
    }
  } catch (_e) {
    // sessionStorage unavailable, proceed without dedup
  }

  const eventName = 'InitiateCheckout';
  const isStandardEvent = STANDARD_META_EVENTS.includes(eventName);
  const fbqMethod = isStandardEvent ? 'track' : 'trackCustom';

  const eventId = generateMetaEventId();
  const eventData = {
    content_type: trackingData.is_package ? 'package' : 'membership',
    currency: trackingData.plan_currency || 'USD',
    lead_uuid: trackingData.lead_uuid,
    quote_id: trackingData.quote_id,
    value: trackingData.plan_price ? trackingData.plan_price / 100 : undefined,
  };

  const hasDirectPixel = typeof window.fbq === 'function' && window.fbq?.loaded;

  if (hasDirectPixel) {
    try {
      window.fbq?.(fbqMethod, eventName, eventData, { eventID: eventId });
      console.debug(`[Meta Pixel] Direct ${fbqMethod}: ${eventName}`, { eventId });
    } catch (error) {
      console.error(`[Meta Pixel] Error tracking ${eventName}:`, error);
    }
  } else {
    console.warn(`[Meta Pixel] Pixel not available, skipping event: ${eventName}`);
  }

  // Store flag to prevent duplicate fires
  try {
    sessionStorage.setItem(META_INITIATE_CHECKOUT_KEY, eventId);
  } catch (_e) {
    // Ignore storage errors
  }

  return eventId;
}

/**
 * Tracks Meta Pixel Purchase event using VTWA payment ID as event_id
 * for deduplication with the server-side Conversions API (via Segment LeadConverted)
 */
function trackMetaPurchase(paymentId: string, trackingData: CheckoutTrackingData): void {
  if (typeof window === 'undefined') return;

  const eventName = 'Purchase';
  const eventData = {
    content_type: trackingData.is_package ? 'package' : 'membership',
    currency: trackingData.plan_currency || 'USD',
    lead_uuid: trackingData.lead_uuid,
    quote_id: trackingData.quote_id,
    value: trackingData.plan_price ? trackingData.plan_price / 100 : undefined,
  };

  const hasDirectPixel = typeof window.fbq === 'function' && window.fbq?.loaded;

  if (hasDirectPixel) {
    try {
      window.fbq?.('track', eventName, eventData, { eventID: paymentId });
      console.debug(`[Meta Pixel] track: ${eventName}`, { eventID: paymentId });
    } catch (error) {
      console.error(`[Meta Pixel] Error tracking ${eventName}:`, error);
    }
  } else {
    console.warn(`[Meta Pixel] Pixel not available, skipping event: ${eventName}`);
  }
}
