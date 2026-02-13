'use client';

/**
 * Shared Braintree client hook
 *
 * This hook provides a singleton Braintree client instance that is initialized once
 * and shared across all payment components. This avoids multiple API calls when
 * users switch between payment methods.
 *
 * Benefits:
 * - Single initialization: Braintree client created only once
 * - Fewer network requests: Reduces calls to Braintree API
 * - Faster switching: No loading states when changing payment methods
 */

import * as braintree from 'braintree-web';
import { useCallback, useEffect, useRef, useState } from 'react';

import { IntegrationError } from '../utils/error-classes';
import { getBraintreeToken } from './get-braintree-token';

interface BraintreeClientState {
  client: braintree.Client | null;
  error: Error | null;
  isLoading: boolean;
}

// Module-level singleton to share across all hook instances
let sharedClient: braintree.Client | null = null;
let initializationPromise: null | Promise<braintree.Client> = null;

/**
 * Initialize Braintree client (singleton pattern)
 * If already initialized, returns the existing client.
 * If initialization is in progress, returns the pending promise.
 */
const initBraintreeClient = async (): Promise<braintree.Client> => {
  // Return existing client if already initialized
  if (sharedClient) {
    return sharedClient;
  }

  // Return pending promise if initialization is in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start new initialization
  initializationPromise = (async () => {
    const token = await getBraintreeToken();

    if (!token) {
      throw new IntegrationError('Braintree token is null', {
        payment_step: 'widget_initialization',
      });
    }

    try {
      const client = await braintree.client.create({ authorization: token });
      sharedClient = client;
      return client;
    } catch (error) {
      // Reset promise so next attempt can try again
      initializationPromise = null;
      throw new IntegrationError('Braintree widget failed to load', {
        braintree_error: (error as Error).message,
        payment_step: 'widget_initialization',
      });
    }
  })();

  return initializationPromise;
};

/**
 * Get the current shared client (for non-React contexts)
 * Returns null if not yet initialized.
 */
export function getSharedBraintreeClient(): braintree.Client | null {
  return sharedClient;
}

/**
 * Reset the shared client (for testing or cleanup)
 */
export function resetBraintreeClient(): void {
  sharedClient = null;
  initializationPromise = null;
}

/**
 * Hook to access the shared Braintree client
 *
 * @returns Object containing:
 *   - client: The Braintree client instance (null while loading)
 *   - isLoading: Whether the client is still initializing
 *   - error: Any error that occurred during initialization
 *   - reinitialize: Function to force re-initialization (e.g., after token expiry)
 */
export function useBraintreeClient(): BraintreeClientState & {
  reinitialize: () => void;
} {
  const [state, setState] = useState<BraintreeClientState>({
    client: sharedClient,
    error: null,
    isLoading: !sharedClient,
  });

  const mountedRef = useRef(true);

  const reinitialize = useCallback(() => {
    // Reset singleton state
    sharedClient = null;
    initializationPromise = null;

    // Trigger re-initialization
    setState({ client: null, error: null, isLoading: true });
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // If client already exists, update state
    if (sharedClient) {
      setState({ client: sharedClient, error: null, isLoading: false });
      return;
    }

    // Initialize client
    initBraintreeClient()
      .then((client) => {
        if (mountedRef.current) {
          setState({ client, error: null, isLoading: false });
        }
      })
      .catch((error) => {
        if (mountedRef.current) {
          setState({ client: null, error, isLoading: false });
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, [state.isLoading]);

  return { ...state, reinitialize };
}
