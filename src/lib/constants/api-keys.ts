/**
 * API Keys for external services
 * These are public client-side keys, safe to commit
 */

// Note: reCAPTCHA Site Key is now configured via NEXT_PUBLIC_RECAPTCHA_SITE_KEY
// environment variable in netlify.toml (per-environment)
export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

/**
 * Amplitude API Keys for Session Replay
 */
export const AMPLITUDE_API_KEYS = {
  PRODUCTION: '832ac211f7507727338867767935c78a',
  STAGING: 'db46873b7bf16f72f1ad5e270817b20a',
} as const;

/**
 * LaunchDarkly Client IDs
 */
export const LAUNCHDARKLY_CLIENT_IDS = {
  PRODUCTION: '62a2ab2d28bf9c15a88209b2',
  STAGING: '62a2ab2d28bf9c15a88209b1',
} as const;

// Note: PayPal Client ID is now configured via NEXT_PUBLIC_PAYPAL_CLIENT_ID
// environment variable in netlify.toml (per-environment)
