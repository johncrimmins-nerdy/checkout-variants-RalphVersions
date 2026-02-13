/**
 * Server-side LaunchDarkly utilities
 * Provides a singleton client for server components to access flags
 */

import { init, type LDContext, type LDOptions } from '@launchdarkly/node-server-sdk';
import { cache } from 'react';

import { getUserId } from '../auth/get-user-id';
import { getLaunchDarklyConfig } from './get-launchdarkly-config';

// Singleton client instance - shared across all server requests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ldClient: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ldClientPromise: null | Promise<any> = null;

/**
 * Get all flags as a plain object (for bootstrapping client-side)
 * Alias for getFlags() - kept for clarity when used for bootstrapping
 */
export async function getAllFlags(): Promise<Record<string, unknown>> {
  return getFlags();
}

/**
 * Server-side flags accessor - similar API to useFlags hook
 * Returns all flags as a plain object
 *
 * Cached per-request using React's cache() to avoid multiple allFlagsState calls
 *
 * @example
 * ```ts
 * const flags = await getFlags();
 * const isEnabled = flags['ECOMM-614-lead-resubmission'] ?? false;
 * ```
 */
export const getFlags = cache(async (): Promise<Record<string, unknown>> => {
  const client = await getClient();

  if (!client) {
    return {};
  }

  const context = await getContext();
  const flagsState = await client.allFlagsState(context);
  return flagsState.toJSON() as Record<string, unknown>;
});

/**
 * Initialize or get existing LaunchDarkly server client (singleton)
 */
async function getClient() {
  // Return existing client if already initialized
  if (ldClient) {
    return ldClient;
  }

  // If initialization is in progress, wait for it
  if (ldClientPromise) {
    return ldClientPromise;
  }

  const userId = await getUserId();
  const { server: config } = getLaunchDarklyConfig({ flagsBootstrap: {}, userId });

  if (!config.key) {
    console.warn(
      'LAUNCHDARKLY_SERVER_TOKEN not configured - skipping server-side flag fetch. Client will fetch flags directly.'
    );
    return null;
  }

  // Start initialization and store the promise to avoid race conditions
  ldClientPromise = (async () => {
    try {
      ldClient = await init(config.key!, (config.options ?? {}) as LDOptions).waitForInitialization(
        { timeout: 10 }
      );
      return ldClient;
    } catch (error) {
      console.warn(
        'LaunchDarkly server SDK initialization failed, falling back to empty flags:',
        error
      );
      return null;
    }
  })();

  return ldClientPromise;
}

/**
 * Get the LaunchDarkly context for the current user
 */
async function getContext(): Promise<LDContext> {
  const userId = await getUserId();
  const { server: config } = getLaunchDarklyConfig({ flagsBootstrap: {}, userId });
  return (config.context ?? {}) as LDContext;
}
