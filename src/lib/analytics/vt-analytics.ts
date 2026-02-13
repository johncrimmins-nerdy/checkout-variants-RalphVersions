'use client';

/**
 * VT Analytics Service
 * Unified analytics that sends events to BOTH Segment and VT Events API
 * Ported from originals/checkout-ts/src/components/shared/vtAnalytics/vtAnalytics.ts
 */

import { Interaction } from '@varsitytutors/event-tracker';

import { APPLICATION_ID, getVTEventsEndpoint, isProduction } from './config';
import { getSegmentAnalytics, loadSegment } from './segment-loader';
import { TrackingCategory, TrackingPlanEventName } from './types';

/**
 * VtAnalytics class - sends events to both Segment and VT Events API
 */
class VtAnalytics {
  private initialized = false;
  private sessionId: string = '';
  private vtEventInteraction: Interaction | null = null;

  /**
   * Gets the anonymous ID from Segment (for session replay)
   */
  async getAnonymousId(): Promise<null | string> {
    const segment = getSegmentAnalytics();
    if (!segment?.user) {
      return null;
    }

    try {
      const user = segment.user();
      return user?.anonymousId?.() || null;
    } catch {
      return null;
    }
  }

  /**
   * Identifies a user in both Segment and VT Events
   */
  identify(userId: null | string): void {
    const segment = getSegmentAnalytics();

    // Segment identify
    segment?.identify(userId);

    // VT Events identify
    void this.vtEventInteraction?.track(TrackingPlanEventName.IDENTIFY, {
      category: TrackingCategory.IDENTIFY,
      dataAttributes: {
        user_id: userId,
      },
      target: 'page',
    });
  }

  /**
   * Initialize the analytics services
   * Call this on app startup
   */
  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    try {
      // Load Segment first
      await loadSegment();

      // Use proxy on localhost to avoid CORS issues
      const isLocalhost = window.location.hostname === 'localhost';
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/checkout';
      const endpoint = isLocalhost
        ? `${basePath}/api/vt-events` // Local proxy
        : `${getVTEventsEndpoint()}/v2/pages/interaction`; // Direct API

      this.vtEventInteraction = new Interaction({
        applicationId: APPLICATION_ID,
        endpoint,
      });

      this.sessionId = getSessionId();
      this.initialized = true;

      console.debug('[vtAnalytics] Initialized', {
        endpoint,
        environment: isProduction() ? 'production' : 'staging',
        sessionId: this.sessionId.slice(0, 8) + '...',
        usingProxy: isLocalhost,
      });
    } catch (error) {
      console.error('[vtAnalytics] Error initializing:', error);
    }
  }

  /**
   * Checks if analytics is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Tracks a page view in both systems
   */
  page(args: Record<string, unknown> = {}): void {
    const segment = getSegmentAnalytics();

    // Segment page
    segment?.page(args);

    // VT Events page
    void this.vtEventInteraction?.track('loaded', {
      category: TrackingCategory.VISITS,
      target: 'document',
    });
  }

  /**
   * Tracks an event to BOTH Segment AND VT Events API
   * This is the primary tracking method
   */
  track(
    action: string,
    category: string = TrackingCategory.INTERACTIONS,
    dataAttributes?: Record<string, unknown>
  ): void {
    const segment = getSegmentAnalytics();

    // Send to Segment
    segment?.track(action, dataAttributes);

    // Send to VT Events
    this.vtEventTrack(action, category, dataAttributes);
  }

  /**
   * Tracks an event to VT Events API only
   * Use this for internal analytics that don't need to go to Segment
   */
  vtEventTrack(
    action: string,
    category: string = TrackingCategory.INTERACTIONS,
    dataAttributes?: Record<string, unknown>,
    label?: string
  ): void {
    void this.vtEventInteraction?.track(action, {
      category,
      dataAttributes: dataAttributes as Record<string, unknown>,
      label,
      session_id: this.sessionId?.slice(0, 99),
      target: 'page',
    });
  }
}

/**
 * Gets or generates a session ID for tracking
 */
function getSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  // Use same key as original webflow-checkout-ts for session continuity
  const sessionIdKey = 'webflow-checkout-session-id';
  let sessionId = localStorage.getItem(sessionIdKey);

  if (!sessionId) {
    // Try to get from Segment/Amplitude, otherwise generate new
    sessionId = localStorage.getItem('analytics_session_id') ?? crypto.randomUUID();
    localStorage.setItem(sessionIdKey, sessionId);
  }

  return sessionId;
}

// Export singleton instance
export const vtAnalytics = new VtAnalytics();

export default vtAnalytics;
