/**
 * @jest-environment jsdom
 */

/**
 * Tests for analytics configuration
 */

import {
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

describe('analytics config', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { hostname: 'localhost' },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
      writable: true,
    });
  });

  describe('constants', () => {
    it('exports SEGMENT_KEYS', () => {
      expect(SEGMENT_KEYS.PRODUCTION).toBeDefined();
      expect(SEGMENT_KEYS.STAGING).toBeDefined();
      expect(SEGMENT_KEYS.PRODUCTION).not.toBe(SEGMENT_KEYS.STAGING);
    });

    it('exports AMPLITUDE_API_KEYS', () => {
      expect(AMPLITUDE_API_KEYS.PRODUCTION).toBeDefined();
      expect(AMPLITUDE_API_KEYS.STAGING).toBeDefined();
      expect(AMPLITUDE_API_KEYS.PRODUCTION).not.toBe(AMPLITUDE_API_KEYS.STAGING);
    });

    it('exports VT_EVENTS_ENDPOINTS', () => {
      expect(VT_EVENTS_ENDPOINTS.PRODUCTION).toContain('varsitytutors.com');
      expect(VT_EVENTS_ENDPOINTS.STAGING).toContain('vtstaging.com');
    });

    it('exports APPLICATION_ID', () => {
      expect(APPLICATION_ID).toBe('webflow-checkout-ts');
    });
  });

  describe('isProduction', () => {
    it('returns false for localhost', () => {
      window.location.hostname = 'localhost';

      expect(isProduction()).toBe(false);
    });

    it('returns false for staging domain', () => {
      window.location.hostname = 'checkout.vtstaging.com';

      expect(isProduction()).toBe(false);
    });

    it('returns true for production domain', () => {
      window.location.hostname = 'www.varsitytutors.com';

      expect(isProduction()).toBe(true);
    });

    it('returns true for varsitytutors.com subdomain', () => {
      window.location.hostname = 'checkout.varsitytutors.com';

      expect(isProduction()).toBe(true);
    });
  });

  describe('getAmplitudeApiKey', () => {
    it('returns staging key for non-production', () => {
      window.location.hostname = 'localhost';

      expect(getAmplitudeApiKey()).toBe(AMPLITUDE_API_KEYS.STAGING);
    });

    it('returns production key for production', () => {
      window.location.hostname = 'www.varsitytutors.com';

      expect(getAmplitudeApiKey()).toBe(AMPLITUDE_API_KEYS.PRODUCTION);
    });
  });

  describe('getSegmentKey', () => {
    it('returns staging key for non-production', () => {
      window.location.hostname = 'localhost';

      expect(getSegmentKey()).toBe(SEGMENT_KEYS.STAGING);
    });

    it('returns production key for production', () => {
      window.location.hostname = 'www.varsitytutors.com';

      expect(getSegmentKey()).toBe(SEGMENT_KEYS.PRODUCTION);
    });
  });

  describe('getSessionReplayConfig', () => {
    it('returns staging config for non-production', () => {
      window.location.hostname = 'localhost';

      const config = getSessionReplayConfig();

      expect(config).toEqual({
        apiKey: AMPLITUDE_API_KEYS.STAGING,
        enabled: true,
        sampleRate: 0.0,
      });
    });

    it('returns production config for production', () => {
      window.location.hostname = 'www.varsitytutors.com';

      const config = getSessionReplayConfig();

      expect(config).toEqual({
        apiKey: AMPLITUDE_API_KEYS.PRODUCTION,
        enabled: true,
        sampleRate: 0.5,
      });
    });
  });

  describe('getVTEventsEndpoint', () => {
    it('returns staging endpoint for non-production', () => {
      window.location.hostname = 'localhost';

      expect(getVTEventsEndpoint()).toBe(VT_EVENTS_ENDPOINTS.STAGING);
    });

    it('returns production endpoint for production', () => {
      window.location.hostname = 'www.varsitytutors.com';

      expect(getVTEventsEndpoint()).toBe(VT_EVENTS_ENDPOINTS.PRODUCTION);
    });
  });
});
