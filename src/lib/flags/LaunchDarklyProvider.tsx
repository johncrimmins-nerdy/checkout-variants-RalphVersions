'use client';

import { type LDFlagSet, LDProvider } from 'launchdarkly-react-client-sdk';
import { useMemo } from 'react';

import { getLaunchDarklyConfig } from './get-launchdarkly-config';

export function LaunchDarklyProvider({
  children,
  flagsBootstrap,
  userId,
}: {
  children: React.ReactNode;
  flagsBootstrap: LDFlagSet;
  userId?: null | string;
}) {
  const { client: config } = useMemo(
    () => getLaunchDarklyConfig({ flagsBootstrap, userId }),
    [flagsBootstrap, userId]
  );

  return (
    <LDProvider
      clientSideID={config.clientSideID}
      context={config.context}
      options={config.options}
      reactOptions={config.reactOptions}
    >
      {children}
    </LDProvider>
  );
}
