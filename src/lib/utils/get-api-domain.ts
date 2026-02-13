/**
 * Get API domain based on current environment
 * Uses NEXT_PUBLIC_API_DOMAIN environment variable consistently for both
 * client-side and server-side to avoid mismatches.
 * @returns The appropriate API domain
 */
export function getApiDomain(): string {
  return process.env.NEXT_PUBLIC_API_DOMAIN || 'api.vtstaging.com';
}

/**
 * Get web domain based on current environment
 * Uses NEXT_PUBLIC_WEB_DOMAIN environment variable consistently.
 * @returns The appropriate web domain
 */
export function getWebDomain(): string {
  return process.env.NEXT_PUBLIC_WEB_DOMAIN || 'www.vtstaging.com';
}

/**
 * Check if the current environment is production
 * Uses NEXT_PUBLIC_ENV environment variable for consistent detection.
 * @returns True if production, false if staging/development
 */
export function isProduction(): boolean {
  return process.env.NEXT_PUBLIC_ENV === 'production';
}
