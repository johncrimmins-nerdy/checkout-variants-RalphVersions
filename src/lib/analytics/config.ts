/**
 * Analytics Configuration
 * API keys and endpoints for analytics services
 */

// Segment Analytics write keys
export const SEGMENT_KEYS = {
  PRODUCTION: 'zcEGlPlYnFjuZm1nZ1fQCDEsRh69H6uy',
  STAGING: 'Vh6ji37GWdqYgHHJPh0DAwvZclG3yVRD',
} as const;

// Amplitude Session Replay API keys
export const AMPLITUDE_API_KEYS = {
  PRODUCTION: '832ac211f7507727338867767935c78a',
  STAGING: 'db46873b7bf16f72f1ad5e270817b20a',
} as const;

// VT Events API endpoints
export const VT_EVENTS_ENDPOINTS = {
  PRODUCTION: 'https://events.varsitytutors.com',
  STAGING: 'https://events.vtstaging.com',
} as const;

// Application identifier for VT Events (must match original to preserve dashboards)
export const APPLICATION_ID = 'webflow-checkout-ts';

/**
 * Session Replay configuration
 */
export interface SessionReplayConfig {
  apiKey: string;
  enabled: boolean;
  sampleRate: number;
}

/**
 * Gets the appropriate Amplitude API key for the current environment
 */
export function getAmplitudeApiKey(): string {
  return isProduction() ? AMPLITUDE_API_KEYS.PRODUCTION : AMPLITUDE_API_KEYS.STAGING;
}

/**
 * Gets the appropriate Segment key for the current environment
 */
export function getSegmentKey(): string {
  return isProduction() ? SEGMENT_KEYS.PRODUCTION : SEGMENT_KEYS.STAGING;
}

/**
 * Gets Session Replay configuration for current environment
 * Production: 50% sample rate
 * Staging: 0% sample rate (disabled for testing)
 */
export function getSessionReplayConfig(): SessionReplayConfig {
  const isProd = isProduction();
  return {
    apiKey: isProd ? AMPLITUDE_API_KEYS.PRODUCTION : AMPLITUDE_API_KEYS.STAGING,
    enabled: true,
    sampleRate: isProd ? 0.5 : 0.0,
  };
}

/**
 * Gets the appropriate VT Events endpoint for the current environment
 */
export function getVTEventsEndpoint(): string {
  return isProduction() ? VT_EVENTS_ENDPOINTS.PRODUCTION : VT_EVENTS_ENDPOINTS.STAGING;
}

/**
 * Determines if we're running in production environment
 */
export function isProduction(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'production';
  }
  return window.location.hostname.includes('varsitytutors.com');
}
