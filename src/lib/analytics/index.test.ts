import {
  AMPLITUDE_API_KEYS,
  AnalyticsProvider,
  APPLICATION_ID,
  buildCheckoutTrackingData,
  BusinessRuleError,
  CheckoutFlowError,
  getAmplitudeApiKey,
  getLeadAndQuoteFromUrl,
  getSegmentKey,
  getSessionReplayConfig,
  getVTEventsEndpoint,
  IntegrationError,
  isErrorAlreadyTracked,
  isProduction,
  NewRelicEvent,
  NewRelicRouteTracker,
  newRelicTrack,
  PaymentDeclineError,
  PurchaseResponseError,
  SEGMENT_KEYS,
  sessionReplayService,
  SystemError,
  trackCardFieldBlur,
  trackCardFieldFocused,
  trackChatStarted,
  trackCheckoutCompletionRouting,
  trackCheckoutStarted,
  trackContentViewed,
  trackElementClicked,
  trackElementClosed,
  trackElementOpened,
  trackErrorWithContext,
  trackEscapePlanClicked,
  trackExperiment,
  trackExperimentPageView,
  trackExperimentPurchase,
  TrackingCategory,
  TrackingPlanEventName,
  trackPlanPreselected,
  trackPlanSelected,
  trackPurchaseEvent,
  trackUserEmailAlreadyExists,
  trackUserLogin,
  trackUserLoginFailed,
  useAnalyticsContext,
  UserBehaviorError,
  UserValidationError,
  VT_EVENTS_ENDPOINTS,
  vtAnalytics,
} from './index';

describe('analytics index exports', () => {
  describe('Provider exports', () => {
    it('exports AnalyticsProvider', () => {
      expect(AnalyticsProvider).toBeDefined();
    });

    it('exports useAnalyticsContext', () => {
      expect(useAnalyticsContext).toBeDefined();
    });
  });

  describe('Checkout tracking exports', () => {
    it('exports buildCheckoutTrackingData', () => {
      expect(buildCheckoutTrackingData).toBeDefined();
    });

    it('exports getLeadAndQuoteFromUrl', () => {
      expect(getLeadAndQuoteFromUrl).toBeDefined();
    });

    it('exports tracking functions', () => {
      expect(trackCardFieldBlur).toBeDefined();
      expect(trackCardFieldFocused).toBeDefined();
      expect(trackChatStarted).toBeDefined();
      expect(trackCheckoutCompletionRouting).toBeDefined();
      expect(trackCheckoutStarted).toBeDefined();
      expect(trackContentViewed).toBeDefined();
      expect(trackElementClicked).toBeDefined();
      expect(trackElementClosed).toBeDefined();
      expect(trackElementOpened).toBeDefined();
      expect(trackEscapePlanClicked).toBeDefined();
      expect(trackExperiment).toBeDefined();
      expect(trackExperimentPageView).toBeDefined();
      expect(trackExperimentPurchase).toBeDefined();
      expect(trackPlanPreselected).toBeDefined();
      expect(trackPlanSelected).toBeDefined();
      expect(trackPurchaseEvent).toBeDefined();
      expect(trackUserEmailAlreadyExists).toBeDefined();
      expect(trackUserLogin).toBeDefined();
      expect(trackUserLoginFailed).toBeDefined();
    });
  });

  describe('Config exports', () => {
    it('exports API keys', () => {
      expect(AMPLITUDE_API_KEYS).toBeDefined();
      expect(SEGMENT_KEYS).toBeDefined();
      expect(VT_EVENTS_ENDPOINTS).toBeDefined();
    });

    it('exports APPLICATION_ID', () => {
      expect(APPLICATION_ID).toBeDefined();
    });

    it('exports config functions', () => {
      expect(getAmplitudeApiKey).toBeDefined();
      expect(getSegmentKey).toBeDefined();
      expect(getSessionReplayConfig).toBeDefined();
      expect(getVTEventsEndpoint).toBeDefined();
      expect(isProduction).toBeDefined();
    });
  });

  describe('Error tracking exports', () => {
    it('exports error classes', () => {
      expect(BusinessRuleError).toBeDefined();
      expect(CheckoutFlowError).toBeDefined();
      expect(IntegrationError).toBeDefined();
      expect(PaymentDeclineError).toBeDefined();
      expect(PurchaseResponseError).toBeDefined();
      expect(SystemError).toBeDefined();
      expect(UserBehaviorError).toBeDefined();
      expect(UserValidationError).toBeDefined();
    });

    it('exports error tracking functions', () => {
      expect(isErrorAlreadyTracked).toBeDefined();
      expect(newRelicTrack).toBeDefined();
      expect(trackErrorWithContext).toBeDefined();
    });
  });

  describe('New Relic exports', () => {
    it('exports NewRelicRouteTracker', () => {
      expect(NewRelicRouteTracker).toBeDefined();
    });
  });

  describe('Session Replay exports', () => {
    it('exports sessionReplayService', () => {
      expect(sessionReplayService).toBeDefined();
    });
  });

  describe('Type enums', () => {
    it('exports NewRelicEvent enum', () => {
      expect(NewRelicEvent).toBeDefined();
      expect(NewRelicEvent.CHECKOUT_ERROR).toBe('checkout_error');
      expect(NewRelicEvent.MAKE_PURCHASE_RETRY).toBe('make_purchase_retry');
    });

    it('exports TrackingCategory enum', () => {
      expect(TrackingCategory).toBeDefined();
      expect(TrackingCategory.CUSTOM_EVENTS).toBe('customEvents');
      expect(TrackingCategory.IDENTIFY).toBe('identify');
    });

    it('exports TrackingPlanEventName enum', () => {
      expect(TrackingPlanEventName).toBeDefined();
      expect(TrackingPlanEventName.CHECKOUT_STARTED).toBe('Checkout Started');
      expect(TrackingPlanEventName.PURCHASE_COMPLETED).toBe('Purchase Completed');
    });
  });

  describe('Core analytics', () => {
    it('exports vtAnalytics', () => {
      expect(vtAnalytics).toBeDefined();
    });
  });
});
