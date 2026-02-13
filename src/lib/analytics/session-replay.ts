'use client';

/**
 * Session Replay Service
 * Integrates Amplitude Session Replay with Segment Analytics
 * Ported from originals/checkout-ts/src/components/shared/services/tracking/session-replay.ts
 */

import * as sessionReplay from '@amplitude/session-replay-browser';

import type { SegmentMiddleware, SessionReplayProperties } from './types';

import { getSessionReplayConfig } from './config';
import { getSegmentAnalytics, waitForSegment } from './segment-loader';

// Cookie name for session ID
const ANALYTICS_SESSION_ID_COOKIE = 'analytics_session_id';

/**
 * Session Replay Service singleton
 */
class SessionReplayService {
  private initialized = false;

  /**
   * Gets session replay properties to include with events
   */
  getSessionReplayProperties(): SessionReplayProperties {
    try {
      if (!this.initialized) {
        return {};
      }
      const properties = sessionReplay.getSessionReplayProperties();
      return properties as SessionReplayProperties;
    } catch (error) {
      console.warn('[SessionReplay] Failed to get properties:', error);
      return {};
    }
  }

  /**
   * Initialize Session Replay with Segment Amplitude Actions integration
   */
  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    const config = getSessionReplayConfig();

    if (!config.enabled) {
      return;
    }

    try {
      const segment = await waitForSegment();

      if (!segment) {
        console.warn('[SessionReplay] Segment analytics not available');
        return;
      }

      // Get device ID from Segment's anonymousId
      const deviceId = await this.getDeviceId();
      const sessionId = this.getStoredSessionId();

      // Initialize Session Replay
      await sessionReplay.init(config.apiKey, {
        deviceId,
        sampleRate: config.sampleRate,
        sessionId,
      });

      this.initialized = true;

      // Set up middleware for session ID sync and replay properties
      this.setupSegmentMiddleware();

      // Set up global sessionReplay object for compatibility
      this.setupGlobalSessionReplay();

      console.debug('[SessionReplay] Initialized', {
        deviceId: deviceId?.slice(0, 8) + '...',
        sampleRate: config.sampleRate,
        sessionId,
      });
    } catch (error) {
      console.error('[SessionReplay] Failed to initialize:', error);
    }
  }

  /**
   * Checks if Session Replay is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Gets the device ID from Segment's anonymous ID
   */
  private async getDeviceId(): Promise<string> {
    const segment = getSegmentAnalytics();

    if (segment?.user) {
      try {
        const user = segment.user();
        const deviceId = user?.anonymousId?.();
        if (deviceId) {
          return deviceId;
        }
      } catch {
        // Fall through to generate new ID
      }
    }

    return crypto.randomUUID();
  }

  /**
   * Gets session ID from analytics_session_id cookie
   */
  private getStoredSessionId(): number {
    if (typeof document === 'undefined') {
      return 0;
    }

    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === ANALYTICS_SESSION_ID_COOKIE && value) {
        return parseInt(value) || 0;
      }
    }
    return 0;
  }

  /**
   * Sets the analytics_session_id cookie
   */
  private setSessionIdCookie(sessionId: number): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.cookie = `${ANALYTICS_SESSION_ID_COOKIE}=${sessionId}; path=/; SameSite=Lax`;
  }

  /**
   * Sets up global window.sessionReplay object for compatibility
   */
  private setupGlobalSessionReplay(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (!window.sessionReplay) {
      window.sessionReplay = {
        getSessionReplayProperties: () => this.getSessionReplayProperties(),
      };
    }
  }

  /**
   * Sets up Segment middleware for session ID sync and replay properties
   */
  private setupSegmentMiddleware(): void {
    const segment = getSegmentAnalytics();
    if (!segment?.addSourceMiddleware) {
      return;
    }

    // Middleware to check if session ID has changed
    segment.addSourceMiddleware((context: SegmentMiddleware) => {
      const storedSessionId = this.getStoredSessionId();
      const actionsAmplitude = context.payload.obj.integrations?.['Actions Amplitude'] as
        | undefined
        | { session_id?: number };
      const nextSessionId = actionsAmplitude?.session_id || 0;

      if (storedSessionId < nextSessionId) {
        this.setSessionIdCookie(nextSessionId);
        sessionReplay.setSessionId(nextSessionId);
      }

      context.next(context.payload);
    });

    // Middleware to add session replay properties to track calls
    segment.addSourceMiddleware((context: SegmentMiddleware) => {
      const replayProperties = this.getSessionReplayProperties();

      if (context.payload.type() === 'track' && Object.keys(replayProperties).length > 0) {
        context.payload.obj.properties = {
          ...context.payload.obj.properties,
          ...replayProperties,
        };
      }

      context.next(context.payload);
    });
  }
}

// Export singleton instance
export const sessionReplayService = new SessionReplayService();

export default sessionReplayService;
