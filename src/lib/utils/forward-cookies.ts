import { NextRequest, NextResponse } from 'next/server';

/**
 * Forwards Set-Cookie headers from an API response to the client
 * Strips VT domain attributes for localhost/Netlify deployments
 *
 * @param apiResponse - The response from the upstream API
 * @param nextResponse - The Next.js response to append cookies to
 * @param request - The incoming Next.js request (used to detect domain)
 */
export function forwardCookies(
  apiResponse: Response,
  nextResponse: NextResponse,
  request: NextRequest
): void {
  // Get all Set-Cookie headers from API response
  const setCookies = apiResponse.headers.getSetCookie?.() || [];

  if (setCookies.length === 0) {
    return; // No cookies to forward
  }

  // Check if we're on a VT domain (varsitytutors.com or vtstaging.com)
  const isVTDomain = isVTDomainRequest(request);

  console.log('🍪 Forwarding', setCookies.length, 'cookies (VT domain:', isVTDomain, ')');

  setCookies.forEach((cookie) => {
    let modifiedCookie = cookie;

    if (!isVTDomain) {
      modifiedCookie = modifiedCookie.replace(/;\s*Domain=\.?(varsitytutors|vtstaging)\.com/gi, '');
    }

    nextResponse.headers.append('Set-Cookie', modifiedCookie);
  });
}

/**
 * Checks if the request is from a VT domain (varsitytutors.com or vtstaging.com)
 * Checks host, x-forwarded-host, and origin headers (for proxied requests via CloudFront/Netlify)
 */
function isVTDomainRequest(request: NextRequest): boolean {
  const host = request.headers.get('host') || '';
  const forwardedHost = request.headers.get('x-forwarded-host') || '';
  const origin = request.headers.get('origin') || '';

  const isVT =
    host.includes('varsitytutors.com') ||
    host.includes('vtstaging.com') ||
    forwardedHost.includes('varsitytutors.com') ||
    forwardedHost.includes('vtstaging.com') ||
    origin.includes('varsitytutors.com') ||
    origin.includes('vtstaging.com');

  return isVT;
}
