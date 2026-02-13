'use client';

/**
 * Global Event Tracker
 * Listens for document-level click, focusin, focusout events and tracks elements
 * with specific CSS classes or data attributes.
 *
 * Based on originals/checkout-ts/src/components/shared/services/tracking/track-event.ts
 *
 * Trackable CSS classes:
 * - track-click: Tracks element clicks
 * - track-click-mobile: Tracks clicks on mobile only
 * - track-input-focusin: Tracks when input gains focus
 * - track-input-focusout: Tracks when input loses focus (if has value)
 * - track-input-checkbox: Tracks checkbox changes
 * - track-input-select: Tracks select changes
 * - track-input-textbox: Tracks text input on focusout
 *
 * Data attributes:
 * - data-tracking_attribute: Alternative to class, e.g. data-tracking_attribute="track-click"
 * - data-element_id: Custom element ID for tracking
 * - data-element_type: Element type (e.g., "button", "link")
 * - data-page_section: Section of the page (e.g., "header", "payment")
 */

import { useEffect } from 'react';

import { trackChatStarted } from './checkout-tracking';
import { TrackingCategory, TrackingPlanEventName } from './types';
import { vtAnalytics } from './vt-analytics';

interface TrackingConfig {
  eventName: TrackingPlanEventName;
  handler: TrackingHandler;
}

type TrackingHandler = (e: Event) => Record<string, unknown>;

/**
 * Extracts tracking data from a checkbox change event
 */
function checkboxInputTrackingObject(e: Event): Record<string, unknown> {
  const target = e.target as HTMLInputElement;
  return {
    checked: target.checked,
    element_type: 'checkbox',
    field_name: target.name || target.id || '',
  };
}

/**
 * Extracts tracking data from a click event
 */
function clickTrackingObject(e: Event): Record<string, unknown> {
  const target = e.target as HTMLElement;
  return {
    data_vt_track_element_id: target.getAttribute('data-element_id') || target.id || '',
    element_type: target.getAttribute('data-element_type') || target.tagName.toLowerCase(),
    page_section: target.getAttribute('data-page_section') || '',
    text_content: target.textContent?.trim().slice(0, 100) || '',
  };
}

/**
 * Extracts tracking data from a textbox focusout event
 */
function inputTextboxTrackingObject(e: Event): Record<string, unknown> {
  const target = e.target as HTMLInputElement;
  return {
    element_type: target.type || 'text',
    field_name: target.name || target.id || '',
    value_length: target.value.length,
  };
}

/**
 * Extracts tracking data from an input event
 */
function inputTrackingObject(e: Event): Record<string, unknown> {
  const target = e.target as HTMLInputElement;
  return {
    element_type: target.type || 'text',
    field_name: target.name || target.id || '',
    has_value: target.value.length > 0,
  };
}

/**
 * Extracts tracking data from a select change event
 */
function selectInputTrackingObject(e: Event): Record<string, unknown> {
  const target = e.target as HTMLSelectElement;
  return {
    element_type: 'select',
    field_name: target.name || target.id || '',
    selected_value: target.value,
  };
}

// Mapping of event types to trackable class names and their configurations
const trackingMapByEvent: Record<string, Record<string, TrackingConfig>> = {
  click: {
    'track-click': {
      eventName: TrackingPlanEventName.ELEMENT_CLICKED,
      handler: clickTrackingObject,
    },
    'track-click-mobile': {
      eventName: TrackingPlanEventName.ELEMENT_CLICKED,
      handler: clickTrackingObject,
    },
  },
  focusin: {
    'track-input-focusin': {
      eventName: TrackingPlanEventName.USER_ENTERED_INPUT,
      handler: inputTrackingObject,
    },
  },
  focusout: {
    'track-input-focusout': {
      eventName: TrackingPlanEventName.USER_ENTERED_INPUT,
      handler: inputTrackingObject,
    },
    'track-input-textbox': {
      eventName: TrackingPlanEventName.USER_ENTERED_INPUT,
      handler: inputTextboxTrackingObject,
    },
  },
  input: {
    'track-input': {
      eventName: TrackingPlanEventName.USER_ENTERED_INPUT,
      handler: inputTrackingObject,
    },
    'track-input-checkbox': {
      eventName: TrackingPlanEventName.USER_ENTERED_INPUT,
      handler: checkboxInputTrackingObject,
    },
    'track-input-select': {
      eventName: TrackingPlanEventName.USER_ENTERED_INPUT,
      handler: selectInputTrackingObject,
    },
  },
};

/**
 * Global Event Tracker Component
 * Add this to the root layout to enable document-level event tracking
 */
export function GlobalEventTracker(): null {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Use capture phase to catch events before they bubble
    const capture = true;

    const handleClick = (e: Event) => handleTrackingEvent(e, 'click');
    const handleInput = (e: Event) => handleTrackingEvent(e, 'input');
    const handleFocusIn = (e: Event) => handleTrackingEvent(e, 'focusin');
    const handleFocusOut = (e: Event) => handleTrackingEvent(e, 'focusout');

    document.addEventListener('click', handleClick, capture);
    document.addEventListener('input', handleInput, capture);
    document.addEventListener('focusin', handleFocusIn, capture);
    document.addEventListener('focusout', handleFocusOut, capture);

    return () => {
      document.removeEventListener('click', handleClick, capture);
      document.removeEventListener('input', handleInput, capture);
      document.removeEventListener('focusin', handleFocusIn, capture);
      document.removeEventListener('focusout', handleFocusOut, capture);
    };
  }, []);

  // Track Genesys chat widget events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGenesysOpen = (event: Event) => {
      const customEvent = event as CustomEvent;
      const flowStep = customEvent.detail?.stepName ?? '';
      trackChatStarted(flowStep);
    };

    window.addEventListener('genesys-open', handleGenesysOpen);
    return () => window.removeEventListener('genesys-open', handleGenesysOpen);
  }, []);

  return null;
}

/**
 * Handles tracking for a given event
 */
function handleTrackingEvent(event: Event, eventType: string): void {
  const target = event.target as HTMLElement | null;
  const eventMap = trackingMapByEvent[eventType];

  if (!eventMap || !target) return;

  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  for (const className in eventMap) {
    // Check if element has the tracking class or data attribute
    const hasClass = target.classList?.contains(className);
    const hasDataAttr = target.getAttribute('data-tracking_attribute') === className;

    if (hasClass || hasDataAttr) {
      // Skip mobile-only tracking on desktop
      if (className === 'track-click-mobile' && !isMobile) return;

      // Skip focusout on empty inputs
      if (className === 'track-input-focusout') {
        const inputValue = (target as HTMLInputElement).value;
        if (!inputValue || inputValue.length === 0) return;
      }

      const { eventName, handler } = eventMap[className];
      const trackingData = handler(event);

      vtAnalytics.track(eventName, TrackingCategory.INTERACTIONS, trackingData);
      return;
    }
  }
}

export default GlobalEventTracker;
