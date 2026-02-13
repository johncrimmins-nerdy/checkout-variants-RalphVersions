import type { LDFlagSet } from 'launchdarkly-react-client-sdk';

import { useLDClient } from 'launchdarkly-react-client-sdk';
import { useMemo } from 'react';

import type { FlagTypes } from './flags';

export function getFlag<FLAG extends keyof FlagTypes, T extends FlagTypes[FLAG]>(
  flags: LDFlagSet,
  flagName: FLAG,
  defaultValue?: T
): FlagTypes[FLAG] {
  return flags[flagName] ?? defaultValue;
}

/**
 * Returns a proxy that calls client.variation when accessing flag properties.
 *
 * @example
 * ```
 * // Destructuring
 * const { 'ECOMM-614-lead-resubmission': isLeadResubmissionEnabled = defaultValue } = useFlags();
 *
 * // Object access
 * const flags = useFlags();
 * const isLeadResubmissionEnabled = flags['ECOMM-614-lead-resubmission'] ?? defaultValue;
 * ```
 *
 * @returns All the feature flags configured in your LaunchDarkly project
 */
export function useFlags() {
  const client = useLDClient();

  const flagsOnDemandVariation: Partial<FlagTypes> = useMemo(
    () =>
      new Proxy(
        {},
        {
          get: (_, prop) => {
            // Ignore Symbol properties (used by React DevTools, iterators, etc.)
            // LaunchDarkly flag keys are always strings
            if (typeof prop === 'symbol') {
              return undefined;
            }
            return client?.variation(prop, undefined);
          },
        }
      ),
    [client]
  );

  return flagsOnDemandVariation;
}
