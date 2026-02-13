/**
 * Analytics Types and Enums
 * Ported from originals/checkout-ts/src/components/shared/services/tracking/
 */

/**
 * New Relic custom event names
 */
export enum NewRelicEvent {
  CHAT_STARTED = 'chat_started',
  CHECKOUT_COMPLETION_ROUTING = 'checkout_completion_routing',
  CHECKOUT_ERROR = 'checkout_error',
  ESCAPE_PLAN_BUTTON_CLICKED = 'escape_plan_button_clicked',
  EXPERIMENT = 'experiment',
  GENERAL_CHECKOUT_COMPLETED = 'general_checkout_completed',
  INITIALIZE_AGENT = 'INITIALIZE_AGENT',
  MAKE_PURCHASE_RETRY = 'make_purchase_retry',
  UNKNOWN_CHECKOUT_ERROR = 'unknown_checkout_error',
  USER_EMAIL_ALREADY_EXISTS = 'user_email_already_exists',
}

/**
 * Tracking categories for organizing events
 */
export enum TrackingCategory {
  CUSTOM_EVENTS = 'customEvents',
  IDENTIFY = 'identify',
  INTERACTIONS = 'interactions',
  VISITS = 'visits',
}

/**
 * Tracking event names used across analytics
 */
export enum TrackingPlanEventName {
  CARD_CVV_FOCUSED = 'Card CVV Focused',
  CARD_CVV_FOCUSOUT = 'Card CVV Focusout',
  CARD_EXPIRATION_DATE_FOCUSED = 'Card Expiration Date Focused',
  CARD_EXPIRATION_DATE_FOCUSOUT = 'Card Expiration Date Focusout',
  CARD_NUMBER_FOCUSED = 'Card Number Focused',
  CARD_NUMBER_FOCUSOUT = 'Card Number Focusout',
  CHECKOUT_STARTED = 'Checkout Started',
  CONTENT_VIEWED = 'Content Viewed',
  ELEMENT_CLICKED = 'Element Clicked',
  ELEMENT_CLOSED = 'Element Closed',
  ELEMENT_HOVERED = 'Element Hovered',
  ELEMENT_OPENED = 'Element Opened',
  IDENTIFY = 'Identify',
  PAGE_VIEWED = 'Page Viewed',
  PLAN_PRESELECTED = 'Plan Preselected',
  PLAN_SELECTED = 'Plan Selected',
  PURCHASE_COMPLETED = 'Purchase Completed',
  QUOTE_PRESELECTED = 'Quote Preselected',
  QUOTE_SELECTED = 'Quote Selected',
  SCREEN_VIEWED = 'Screen Viewed',
  USER_ENTERED_INPUT = 'User Entered Input',
  USER_LOGGED_IN = 'User Logged In',
  USER_LOGIN_FAILED = 'User Login Failed',
}

/**
 * Checkout data object for tracking
 */
export interface CheckoutTrackingData {
  // Session replay properties
  [key: string]: unknown;
  available_payment_method_count: number;
  available_payment_methods: string[];
  billing_interval: 'installments' | 'monthly' | 'one_time';
  buyer_first_name?: string;
  /** Months since user churned (for reactivation flows) */
  churn_timeline_months?: number;
  country_code?: string;
  discount_label?: string;
  has_apple_pay_available?: boolean;
  has_credit_card_available?: boolean;
  has_google_pay_available?: boolean;
  has_installments: boolean;
  has_paypal_available?: boolean;
  has_promotions?: boolean;
  has_saved_credit_card: boolean;
  installments_count: number;
  is_authenticated: boolean;
  is_auto_authenticated: boolean;
  is_catalog_item: boolean;
  is_lead_resubmission_flow: boolean;
  is_package: boolean;
  is_quote_based: boolean;
  is_reactivation_flow: boolean;
  lead_uuid?: string;
  plan_currency?: string;
  plan_duration?: number;
  plan_id?: string;
  plan_name?: string;
  plan_original_price?: number;
  plan_price?: number;
  plan_type?: string;
  /** Date when user was last active (for reactivation tracking) */
  previous_last_active_date?: string;
  /** Number of previous tutoring sessions completed */
  previous_sessions_completed?: number;
  /** List of subjects previously studied */
  previous_subjects?: string[];
  promo_code?: string;
  purchasable_old_price_cents?: number;
  purchasable_price_cents?: number;
  quote_id?: string;
  /** Student's grade level */
  student_grade?: string;
  timestamp: number;
  // UTM parameters
  utm_campaign?: string;
  utm_content?: string;
  utm_medium?: string;
  utm_source?: string;
  utm_term?: string;
}

/**
 * Payment method availability for checkout tracking
 */
export interface PaymentMethodAvailability {
  hasApplePay?: boolean;
  hasCreditCard?: boolean;
  hasGooglePay?: boolean;
  hasPaypal?: boolean;
  hasSavedPaymentMethod?: boolean;
}

/**
 * Purchase event properties
 */
export interface PurchaseEventProperties extends CheckoutTrackingData {
  payment_method: 'apple_pay' | 'credit_card' | 'google_pay' | 'paypal' | 'saved_credit_card';
  preselected_plan_currency?: string;
  preselected_plan_duration?: number;
  preselected_plan_id?: string;
  preselected_plan_name?: string;
  preselected_plan_original_price?: number;
  preselected_plan_price?: number;
  preselected_plan_type?: string;
}

/**
 * Segment Analytics interface
 */
export interface SegmentAnalytics {
  addSourceMiddleware: (middleware: (context: SegmentMiddleware) => void) => void;
  identify: (userId: null | string) => void;
  page: (data?: Record<string, unknown>) => void;
  ready: (callback: () => void) => void;
  track: (eventName: string, properties?: Record<string, unknown>) => void;
  user: () => {
    anonymousId: () => string;
    id: () => null | string;
  };
}

export interface SegmentMiddleware {
  integrations?: Record<string, unknown>;
  next: (payload: SegmentPayload) => void;
  payload: SegmentPayload;
}

export interface SegmentPayload {
  obj: {
    [key: string]: unknown;
    integrations?: Record<string, unknown>;
    properties?: Record<string, unknown>;
  };
  type: () => string;
}

/**
 * Session Replay Properties from Amplitude
 */
export interface SessionReplayProperties {
  '[Amplitude] Session Replay ID'?: string;
}

/**
 * User context data for enhanced tracking
 * Contains historical user data for reactivation/churn analysis
 */
export interface UserContextData {
  /** Date when user was last active (ISO string) */
  lastActiveDate?: string;
  /** Number of previous tutoring sessions completed */
  previousSessionCount?: number;
  /** List of subjects previously studied */
  previousSubjects?: string[];
  /** Student's grade level */
  studentGrade?: string;
}

declare global {
  interface Window {
    analytics?: SegmentAnalytics;
    dataLayer?: Record<string, unknown>[];
    fbq?: {
      (...args: unknown[]): void;
      loaded?: boolean;
    };
    newrelic?: {
      addPageAction: (name: string, attributes?: Record<string, unknown>) => void;
      noticeError: (
        error: Error | string,
        customAttributes?: Record<string, boolean | number | string>
      ) => void;
      setCurrentRouteName: (name: string) => void;
      setCustomAttribute: (key: string, value: boolean | number | string) => void;
      setPageViewName: (name: string, host?: string) => void;
    };
    sessionReplay?: {
      getSessionReplayProperties: () => SessionReplayProperties;
    };
  }
}
