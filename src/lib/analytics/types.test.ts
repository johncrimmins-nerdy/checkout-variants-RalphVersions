import { NewRelicEvent, TrackingCategory, TrackingPlanEventName } from './types';

describe('analytics types', () => {
  describe('NewRelicEvent enum', () => {
    it('has CHAT_STARTED event', () => {
      expect(NewRelicEvent.CHAT_STARTED).toBe('chat_started');
    });

    it('has CHECKOUT_COMPLETION_ROUTING event', () => {
      expect(NewRelicEvent.CHECKOUT_COMPLETION_ROUTING).toBe('checkout_completion_routing');
    });

    it('has CHECKOUT_ERROR event', () => {
      expect(NewRelicEvent.CHECKOUT_ERROR).toBe('checkout_error');
    });

    it('has ESCAPE_PLAN_BUTTON_CLICKED event', () => {
      expect(NewRelicEvent.ESCAPE_PLAN_BUTTON_CLICKED).toBe('escape_plan_button_clicked');
    });

    it('has EXPERIMENT event', () => {
      expect(NewRelicEvent.EXPERIMENT).toBe('experiment');
    });

    it('has GENERAL_CHECKOUT_COMPLETED event', () => {
      expect(NewRelicEvent.GENERAL_CHECKOUT_COMPLETED).toBe('general_checkout_completed');
    });

    it('has INITIALIZE_AGENT event', () => {
      expect(NewRelicEvent.INITIALIZE_AGENT).toBe('INITIALIZE_AGENT');
    });

    it('has MAKE_PURCHASE_RETRY event', () => {
      expect(NewRelicEvent.MAKE_PURCHASE_RETRY).toBe('make_purchase_retry');
    });

    it('has USER_EMAIL_ALREADY_EXISTS event', () => {
      expect(NewRelicEvent.USER_EMAIL_ALREADY_EXISTS).toBe('user_email_already_exists');
    });
  });

  describe('TrackingCategory enum', () => {
    it('has CUSTOM_EVENTS category', () => {
      expect(TrackingCategory.CUSTOM_EVENTS).toBe('customEvents');
    });

    it('has IDENTIFY category', () => {
      expect(TrackingCategory.IDENTIFY).toBe('identify');
    });

    it('has INTERACTIONS category', () => {
      expect(TrackingCategory.INTERACTIONS).toBe('interactions');
    });

    it('has VISITS category', () => {
      expect(TrackingCategory.VISITS).toBe('visits');
    });
  });

  describe('TrackingPlanEventName enum', () => {
    it('has card field events', () => {
      expect(TrackingPlanEventName.CARD_CVV_FOCUSED).toBe('Card CVV Focused');
      expect(TrackingPlanEventName.CARD_CVV_FOCUSOUT).toBe('Card CVV Focusout');
      expect(TrackingPlanEventName.CARD_EXPIRATION_DATE_FOCUSED).toBe(
        'Card Expiration Date Focused'
      );
      expect(TrackingPlanEventName.CARD_EXPIRATION_DATE_FOCUSOUT).toBe(
        'Card Expiration Date Focusout'
      );
      expect(TrackingPlanEventName.CARD_NUMBER_FOCUSED).toBe('Card Number Focused');
      expect(TrackingPlanEventName.CARD_NUMBER_FOCUSOUT).toBe('Card Number Focusout');
    });

    it('has checkout events', () => {
      expect(TrackingPlanEventName.CHECKOUT_STARTED).toBe('Checkout Started');
      expect(TrackingPlanEventName.PURCHASE_COMPLETED).toBe('Purchase Completed');
    });

    it('has interaction events', () => {
      expect(TrackingPlanEventName.CONTENT_VIEWED).toBe('Content Viewed');
      expect(TrackingPlanEventName.ELEMENT_CLICKED).toBe('Element Clicked');
      expect(TrackingPlanEventName.ELEMENT_CLOSED).toBe('Element Closed');
      expect(TrackingPlanEventName.ELEMENT_HOVERED).toBe('Element Hovered');
      expect(TrackingPlanEventName.ELEMENT_OPENED).toBe('Element Opened');
    });

    it('has user events', () => {
      expect(TrackingPlanEventName.IDENTIFY).toBe('Identify');
      expect(TrackingPlanEventName.PAGE_VIEWED).toBe('Page Viewed');
      expect(TrackingPlanEventName.USER_LOGGED_IN).toBe('User Logged In');
      expect(TrackingPlanEventName.USER_LOGIN_FAILED).toBe('User Login Failed');
      expect(TrackingPlanEventName.USER_ENTERED_INPUT).toBe('User Entered Input');
    });

    it('has plan events', () => {
      expect(TrackingPlanEventName.PLAN_PRESELECTED).toBe('Plan Preselected');
      expect(TrackingPlanEventName.PLAN_SELECTED).toBe('Plan Selected');
      expect(TrackingPlanEventName.QUOTE_PRESELECTED).toBe('Quote Preselected');
      expect(TrackingPlanEventName.QUOTE_SELECTED).toBe('Quote Selected');
    });

    it('has screen events', () => {
      expect(TrackingPlanEventName.SCREEN_VIEWED).toBe('Screen Viewed');
    });
  });
});
