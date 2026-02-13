/**
 * LaunchDarkly user identification utility
 * Identifies users after successful authentication/purchase
 */

import type { LDClient } from 'launchdarkly-react-client-sdk';

/**
 * Identifies a user to LaunchDarkly after successful purchase
 * This ensures proper experiment tracking and flag targeting for the authenticated user
 *
 * @param ldClient - LaunchDarkly client instance from useLDClient()
 * @param userUID - The user's unique identifier from purchase response
 */
export async function identifyUserToLaunchDarkly(
  ldClient: LDClient | undefined,
  userUID: string | undefined
): Promise<void> {
  if (!ldClient || !userUID) {
    return;
  }

  try {
    await ldClient.identify({
      key: userUID,
      kind: 'user',
    });
    console.debug('[LaunchDarkly] User identified:', userUID);
  } catch (error) {
    console.warn('[LaunchDarkly] Failed to identify user:', error);
  }
}
