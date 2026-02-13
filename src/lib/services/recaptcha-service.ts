/**
 * Google reCAPTCHA Enterprise service
 *
 * The reCAPTCHA script is loaded via Next.js Script in layout.tsx for early
 * behavior observation. This module provides a simple API to execute reCAPTCHA
 * and get tokens.
 *
 * Usage:
 *   import { executeRecaptcha } from '@/lib/services/recaptcha-service';
 *   const token = await executeRecaptcha('purchaseMembership');
 */

import { RECAPTCHA_SITE_KEY } from '@/lib/constants/api-keys';
import { waitForProperty } from '@/lib/utils/wait-for-property';

// ============================================================================
// Types
// ============================================================================

/** Type for the grecaptcha global */
interface GrecaptchaEnterprise {
  enterprise: {
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
    ready: (callback: () => void) => void;
  };
}

declare global {
  interface Window {
    grecaptcha?: GrecaptchaEnterprise;
  }
}

// ============================================================================
// Module State
// ============================================================================

/** Default timeout for waiting for reCAPTCHA to be ready */
const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Cached promise that resolves when reCAPTCHA is ready.
 * Ensures we only wait once, and all callers share the same promise.
 */
let readyPromise: null | Promise<GrecaptchaEnterprise> = null;

// ============================================================================
// Public API
// ============================================================================

/**
 * Reset the ready state (for testing purposes only).
 * @internal
 */
export function _resetForTesting(): void {
  readyPromise = null;
}

/**
 * Execute reCAPTCHA Enterprise and get a token.
 *
 * @param action - Action name for this reCAPTCHA execution (e.g., 'purchaseMembership')
 * @returns Promise that resolves to the reCAPTCHA token
 * @throws Error if reCAPTCHA fails to load or execute
 *
 * @example
 * const token = await executeRecaptcha('purchaseMembership');
 */
export async function executeRecaptcha(action: string): Promise<string> {
  if (!RECAPTCHA_SITE_KEY) {
    throw new Error('reCAPTCHA site key not configured');
  }

  const grecaptcha = await waitForRecaptcha();

  try {
    return await grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action });
  } catch (error) {
    console.error('reCAPTCHA execution failed:', error);
    throw new Error('Failed to execute reCAPTCHA');
  }
}

/**
 * Check if reCAPTCHA is ready (for debugging/testing purposes).
 */
export function isRecaptchaReady(): boolean {
  return readyPromise !== null && typeof window !== 'undefined' && !!window.grecaptcha?.enterprise;
}

// ============================================================================
// Internal Functions
// ============================================================================

/**
 * Wait for reCAPTCHA Enterprise to be ready.
 * Returns the grecaptcha object once ready.
 */
async function waitForRecaptcha(
  timeout: number = DEFAULT_TIMEOUT_MS
): Promise<GrecaptchaEnterprise> {
  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA can only be used in browser environment');
  }

  // Return cached promise if we're already waiting
  if (readyPromise) {
    return readyPromise;
  }

  // Create and cache the promise
  readyPromise = (async () => {
    // Wait for the script to set window.grecaptcha
    const grecaptcha = await waitForProperty<GrecaptchaEnterprise>(window, 'grecaptcha', {
      timeout,
    });

    await waitForProperty(grecaptcha, 'enterprise', {
      timeout,
    });

    // Wait for grecaptcha.enterprise.ready() callback
    await new Promise<void>((resolve) => {
      grecaptcha.enterprise.ready(resolve);
    });

    return grecaptcha;
  })();

  return readyPromise;
}
