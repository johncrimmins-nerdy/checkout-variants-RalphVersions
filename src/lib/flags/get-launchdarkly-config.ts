import type {
  LDContext as LDContextServer,
  LDOptions as LDOptionsServer,
} from '@launchdarkly/node-server-sdk';
import type { LDFlagSet } from 'launchdarkly-react-client-sdk';

type LDContext = {
  anonymous?: boolean;
  key?: string;
  kind: string;
};

const defaultContext: LDContext = {
  kind: 'user',
};

type LaunchDarklyConfig = {
  client: {
    clientSideID: string;
    context: LDContext;
    options: {
      bootstrap: LDFlagSet;
      streaming: boolean;
    };
    reactOptions: {
      useCamelCaseFlagKeys: boolean;
    };
  };
  server: {
    context: LDContextServer;
    key: string;
    options: LDOptionsServer;
  };
};

export function getLaunchDarklyConfig({
  flagsBootstrap,
  userId,
}: {
  flagsBootstrap: LDFlagSet;
  userId?: null | string;
}): LaunchDarklyConfig {
  const context: LDContext = userId
    ? {
        ...defaultContext,
        key: userId,
      }
    : {
        ...defaultContext,
        anonymous: true,
        key: 'anonymous-user',
      };
  return {
    client: {
      clientSideID: process.env.NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID || '',
      context,
      options: {
        bootstrap: flagsBootstrap,
        streaming: true,
      },
      reactOptions: {
        useCamelCaseFlagKeys: false,
      },
    },
    server: {
      context: context as LDContextServer,
      key: process.env.LAUNCHDARKLY_SERVER_TOKEN || '',
      options: {
        // Run in offline mode if no valid SDK key (e.g., during static page generation)
        // This prevents 401 errors during build when the key isn't configured
        offline: !process.env.LAUNCHDARKLY_SERVER_TOKEN,
        // Disable streaming to reduce connections
        stream: false,
      },
    },
  };
}
