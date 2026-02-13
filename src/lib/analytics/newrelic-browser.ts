import { newRelicTrack } from './error-tracking';
import { NewRelicEvent } from './types';

interface NewRelicConfig {
  accountID: string;
  agentID: string;
  licenseKey: string;
  trustKey: string;
}

export function getNewRelicConfig(): NewRelicConfig | null {
  const agentID = process.env.NEXT_PUBLIC_NEWRELIC_AGENT_ID?.trim();
  const accountID = process.env.NEXT_PUBLIC_NEWRELIC_ACCOUNT_ID?.trim();
  const trustKey = process.env.NEXT_PUBLIC_NEWRELIC_TRUST_KEY?.trim();
  const licenseKey = process.env.NEXT_PUBLIC_NEWRELIC_LICENSE_KEY?.trim();

  if (!agentID || !accountID || !trustKey || !licenseKey) {
    return null;
  }

  return {
    accountID,
    agentID,
    licenseKey,
    trustKey,
  };
}

/**
 * Generate New Relic initialization script content
 * Returns null if required environment variables are missing
 */
export function getNewRelicInitScript(): null | string {
  const config = getNewRelicConfig();

  if (!config) {
    return null;
  }

  return `
    window.NREUM || (NREUM = {});
    NREUM.init = {
      distributed_tracing: { enabled: true },
      privacy: { cookies_enabled: true },
      ajax: { deny_list: ['bam.nr-data.net'] },
      generic_events: { enabled: true },
    };

    NREUM.loader_config = {
      accountID: '${config.accountID}',
      trustKey: '${config.trustKey}',
      agentID: '${config.agentID}',
      licenseKey: '${config.licenseKey}',
      applicationID: '${config.agentID}',
    };

    NREUM.info = {
      beacon: 'bam.nr-data.net',
      errorBeacon: 'bam.nr-data.net',
      licenseKey: '${config.licenseKey}',
      applicationID: '${config.agentID}',
      sa: 1,
    };
  `;
}

/**
 * Initialize New Relic browser agent for error tracking and performance monitoring
 * Matches legacy implementation from originals/checkout-ts/src/utils/new-relic.ts
 */
export function initNewRelicBrowser(): void {
  try {
    if (typeof window === 'undefined' || !window.location || !window.navigator) {
      console.warn(
        'New Relic browser initialization skipped: Not in a browser environment or missing required objects'
      );
      return;
    }

    window?.addEventListener('newrelic', (evt) => {
      const customEvent = evt as CustomEvent<{ loaded: boolean }>;
      if (customEvent?.detail?.loaded && typeof window !== 'undefined' && window.newrelic) {
        window.newrelic.setCustomAttribute('url', window.location.href);
        window.newrelic.setCustomAttribute('origin', window.location.origin);
        window.newrelic.setCustomAttribute('pathname', window.location.pathname);
        window.newrelic.setCustomAttribute('userAgent', window.navigator.userAgent);

        const params = new URLSearchParams(window.location.search);
        params.forEach((value, key) => {
          window.newrelic?.setCustomAttribute(key, value);
        });

        newRelicTrack(NewRelicEvent.INITIALIZE_AGENT, {
          href: window.location.href,
          level: 'INFO',
          origin: window.location.origin,
          pathname: window.location.pathname,
          search: window.location.search,
        });

        console.log('[newrelic] added attributes');
      }
    });
  } catch (e) {
    console.error('Failed to initialize New Relic Browser Agent:', e);
  }
}
