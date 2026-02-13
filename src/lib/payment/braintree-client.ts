/**
 * Braintree client initialization and management
 */

import type { BraintreeClientInstance, BraintreeDataCollectorInstance } from '@/types/payment';

import { IntegrationError } from '../utils/error-classes';

// Braintree SDK types (will be loaded dynamically)
declare global {
  interface Window {
    braintree?: {
      client: {
        create: (options: { authorization: string }) => Promise<BraintreeClientInstance>;
        VERSION: string;
      };
      dataCollector: {
        create: (options: {
          client: BraintreeClientInstance;
          kount?: boolean;
        }) => Promise<BraintreeDataCollectorInstance>;
      };
    };
  }
}

let braintreeClientInstance: BraintreeClientInstance | null = null;
let dataCollectorInstance: BraintreeDataCollectorInstance | null = null;

/**
 * Get Braintree client instance
 */
export function getBraintreeClient(): BraintreeClientInstance | null {
  return braintreeClientInstance;
}

/**
 * Get data collector instance
 */
export function getDataCollector(): BraintreeDataCollectorInstance | null {
  return dataCollectorInstance;
}

/**
 * Initialize Braintree client
 * @param authorization - Braintree client token or tokenization key
 */
export async function initBraintreeClient(authorization: string): Promise<BraintreeClientInstance> {
  // Return existing instance if already initialized
  if (braintreeClientInstance) {
    return braintreeClientInstance;
  }

  try {
    // Load SDK if not already loaded
    await loadBraintreeSDK();

    if (!window.braintree) {
      throw new IntegrationError('Braintree SDK not loaded');
    }

    // Create client instance
    braintreeClientInstance = await window.braintree.client.create({
      authorization,
    });

    return braintreeClientInstance;
  } catch (error) {
    throw new IntegrationError('Failed to initialize Braintree client', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Initialize data collector for fraud detection
 */
export async function initDataCollector(
  client: BraintreeClientInstance
): Promise<BraintreeDataCollectorInstance> {
  if (dataCollectorInstance) {
    return dataCollectorInstance;
  }

  try {
    if (!window.braintree) {
      throw new IntegrationError('Braintree SDK not loaded');
    }

    dataCollectorInstance = await window.braintree.dataCollector.create({
      client,
      kount: true,
    });

    return dataCollectorInstance;
  } catch (error) {
    console.warn('Failed to initialize data collector:', error);
    // Return a mock instance if data collector fails (non-critical)
    return {
      deviceData: '',
      teardown: () => undefined,
    };
  }
}

/**
 * Load Braintree SDK script
 */
export async function loadBraintreeSDK(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new IntegrationError('Braintree SDK can only be loaded in browser environment');
  }

  // Return if already loaded
  if (window.braintree) {
    return;
  }

  // Check if script is already being loaded
  const existingScript = document.querySelector('script[src*="braintree"]');
  if (existingScript) {
    // Wait for it to load
    await new Promise<void>((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () =>
        reject(new Error('Failed to load Braintree SDK'))
      );
    });
    return;
  }

  // Load script
  const script = document.createElement('script');
  script.src = 'https://js.braintreegateway.com/web/3.117.1/js/client.min.js';
  script.async = true;

  await new Promise<void>((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Braintree SDK'));
    document.head.appendChild(script);
  });
}

/**
 * Cleanup Braintree instances
 */
export function teardownBraintree(): void {
  if (dataCollectorInstance) {
    dataCollectorInstance.teardown();
    dataCollectorInstance = null;
  }

  braintreeClientInstance = null;
}
