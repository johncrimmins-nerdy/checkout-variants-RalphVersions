/**
 * Get the appropriate GraphQL URL based on environment
 * Always use proxy to avoid CORS issues and centralize API routing
 */

import { getApiDomain } from './get-api-domain';

export function getGraphQLUrl(): string {
  // Client-side: always use proxy
  if (typeof window !== 'undefined') {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/checkout';
    return `${basePath}/api/graphql`;
  }

  // Server-side: use direct API URL
  const apiDomain = getApiDomain();
  return `https://${apiDomain}/graphql`;
}
