/**
 * Setup eCommerce client (account creation) API
 * Creates user account after purchase
 */

import { IntegrationError } from '../utils/error-classes';
import { getGraphQLUrl } from '../utils/get-graphql-url';

interface SetupECommClientInput {
  email: string;
  password: string;
}

interface SetupECommClientResponse {
  clientUUID: string;
}

/**
 * Creates a new eCommerce client account
 * @param input - Email and password for the new account
 * @returns Promise that resolves to client UUID
 */
export async function setupECommClient(
  input: SetupECommClientInput
): Promise<SetupECommClientResponse> {
  const graphqlUrl = getGraphQLUrl();
  const startTime = Date.now();

  const mutation = `
    mutation SetupECommClient($input: ECommClientSetupInput!) {
      setupECommClient(input: $input) {
        clientUUID
      }
    }
  `;

  try {
    const response = await fetch(graphqlUrl, {
      body: JSON.stringify({
        operationName: 'SetupECommClient',
        query: mutation,
        variables: { input },
      }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const durationMs = Date.now() - startTime;

    if (response.status === 401) {
      throw new IntegrationError('Unauthorized - please sign in again', {
        cause: 'UNAUTHORIZED',
        duration_ms: durationMs,
        http_status: response.status,
        payment_step: 'account-creation',
      });
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Could not read response body');
      throw new IntegrationError(`HTTP error: ${response.status}`, {
        duration_ms: durationMs,
        http_status: response.status,
        payment_step: 'account-creation',
        response_body_preview: errorBody.substring(0, 500),
      });
    }

    const result = await response.json();

    if (result.errors && result.errors.length > 0) {
      const error = result.errors[0];
      const errorCode = error.extensions?.code;

      if (errorCode === 'UNAUTHORIZED') {
        throw new IntegrationError('Unauthorized - please sign in again', {
          cause: 'UNAUTHORIZED',
          duration_ms: durationMs,
          http_status: response.status,
          payment_step: 'account-creation',
        });
      }

      throw new IntegrationError(error.message || 'Account creation failed', {
        code: errorCode,
        duration_ms: durationMs,
        graphql_error_count: result.errors.length,
        http_status: response.status,
        payment_step: 'account-creation',
      });
    }

    if (!result.data?.setupECommClient?.clientUUID) {
      throw new IntegrationError('No client UUID returned', {
        duration_ms: durationMs,
        http_status: response.status,
        payment_step: 'account-creation',
      });
    }

    return {
      clientUUID: result.data.setupECommClient.clientUUID,
    };
  } catch (error) {
    if (error instanceof IntegrationError) {
      throw error;
    }
    console.error('Setup eComm client error:', error);
    throw new IntegrationError('Account creation request failed', {
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
      error_name: error instanceof Error ? error.name : 'Unknown',
      payment_step: 'account-creation',
    });
  }
}
