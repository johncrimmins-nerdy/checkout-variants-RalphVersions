import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';

/**
 * Server-side utility to get the user ID from the JWT cookie
 * Can only be used in Server Components, Server Actions, or Route Handlers
 * Gracefully handles static rendering scenarios
 */
export async function getUserId(): Promise<null | string> {
  try {
    // Check if we're in a static rendering context
    // During static generation, cookies() will throw a DynamicServerError
    const cookieStore = await cookies();
    const token = cookieStore.get('vt_authentication_token')?.value;

    if (!token) {
      return null;
    }

    // Decode the JWT token (no verification for now, just extraction)
    // Note: For production, you should verify the token signature
    const decoded = decodeJwt(token);

    // Extract the 'sub' claim
    const sub = decoded.sub;

    if (sub && typeof sub === 'string') {
      return sub;
    }

    return null;
  } catch (error) {
    // Handle the case where we're in a static rendering context
    // or any other error accessing cookies
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      error.digest === 'DYNAMIC_SERVER_USAGE'
    ) {
      // This is expected during static generation - return null silently
      return null;
    }

    console.warn('Failed to get user ID from JWT cookie:', error);
    return null;
  }
}
