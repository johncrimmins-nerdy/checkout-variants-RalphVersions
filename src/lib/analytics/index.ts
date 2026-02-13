/**
 * Analytics Module
 * Unified analytics for checkout application
 *
 * Sends events to BOTH:
 * 1. Segment Analytics (loaded dynamically)
 * 2. VT Events API (@varsitytutors/event-tracker)
 *
 * Also includes:
 * - Amplitude Session Replay integration
 * - New Relic error tracking
 */

// Provider component
export { AnalyticsProvider, useAnalyticsContext } from './AnalyticsProvider';

// Checkout-specific tracking
export {
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
  trackExperimentPageView,
  trackExperimentPurchase,
  trackPlanPreselected,
  trackPlanSelected,
  trackPurchaseEvent,
  trackUserEmailAlreadyExists,
  trackUserLogin,
  trackUserLoginFailed,
} from './checkout-tracking';

// Checkout tracking options type
export type { CheckoutTrackingOptions } from './checkout-tracking';

// Configuration (for advanced use cases)
export {
  AMPLITUDE_API_KEYS,
  APPLICATION_ID,
  getAmplitudeApiKey,
  getSegmentKey,
  getSessionReplayConfig,
  getVTEventsEndpoint,
  isProduction,
  SEGMENT_KEYS,
  VT_EVENTS_ENDPOINTS,
} from './config';

// Error tracking
export {
  BusinessRuleError,
  CheckoutFlowError,
  IntegrationError,
  isErrorAlreadyTracked,
  newRelicTrack,
  PaymentDeclineError,
  PurchaseResponseError,
  SystemError,
  trackErrorWithContext,
  UserBehaviorError,
  UserValidationError,
} from './error-tracking';

// New Relic utilities
export { NewRelicRouteTracker } from './NewRelicRouteTracker';

// Session Replay
export { sessionReplayService } from './session-replay';

// Types
export type {
  CheckoutTrackingData,
  PaymentMethodAvailability,
  PurchaseEventProperties,
  SegmentAnalytics,
  SegmentMiddleware,
  SegmentPayload,
  SessionReplayProperties,
  UserContextData,
} from './types';

export { NewRelicEvent, TrackingCategory, TrackingPlanEventName } from './types';

// Core analytics service
export { vtAnalytics } from './vt-analytics';
