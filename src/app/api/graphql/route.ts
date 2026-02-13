/**
 * GraphQL API proxy
 * Forwards requests to the actual API to avoid CORS issues.
 *
 * Important: This proxy forwards user identification headers (User-Agent, X-Forwarded-For)
 * to enable accurate reCAPTCHA risk assessment on the backend. Without these headers,
 * the backend sees the proxy's IP instead of the user's real IP, causing false positives.
 */

import { NextRequest, NextResponse } from 'next/server';

import { forwardCookies } from '@/lib/utils/forward-cookies';
import { getApiDomain } from '@/lib/utils/get-api-domain';

// Also support GET requests for GraphQL introspection
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const apiDomain = getApiDomain();
  const apiUrl = `https://${apiDomain}/graphql`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GraphQL proxy GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch GraphQL schema' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Get the API domain (staging or production)
    const apiDomain = getApiDomain();
    const apiUrl = `https://${apiDomain}/graphql`;

    // Forward cookies from the original request
    const cookies = request.headers.get('cookie') || '';

    // Forward user identification headers for accurate reCAPTCHA validation
    // These headers are automatically set by Netlify/CDN and contain the real user's info:
    // - X-Forwarded-For: Chain of IPs (client IP is first), set by Netlify Edge
    // - X-Real-IP: Original client IP, may be set by upstream proxies
    // - User-Agent: Browser user agent string
    //
    // Without these, the backend sees the Netlify Function's IP instead of the user's,
    // causing reCAPTCHA false positives.
    const userAgent = request.headers.get('user-agent') || '';
    const xForwardedFor = request.headers.get('x-forwarded-for') || '';
    const xRealIp = request.headers.get('x-real-ip') || '';

    // Log forwarded headers for debugging (only for PurchaseMembership to reduce noise)
    if (body.operationName === 'PurchaseMembership') {
      console.log('📡 Forwarding user identification headers:', {
        hasUserAgent: !!userAgent,
        hasXForwardedFor: !!xForwardedFor,
        hasXRealIp: !!xRealIp,
        // Only log first IP for privacy (the client IP is first in X-Forwarded-For chain)
        xForwardedForFirstIp: xForwardedFor.split(',')[0]?.trim() || 'none',
      });
    }

    // Build headers object, only including non-empty values
    const headers: Record<string, string> = Object.fromEntries(
      Object.entries({
        'Content-Type': 'application/json',
        Cookie: cookies,
        'User-Agent': userAgent,
        'X-Forwarded-For': xForwardedFor,
        'X-Real-IP': xRealIp,
      }).filter(([_, value]) => value)
    );

    // Make the request to the actual GraphQL API
    const response = await fetch(apiUrl, {
      body: JSON.stringify(body),
      credentials: 'include',
      headers,
      method: 'POST',
    });

    // Check content type before parsing
    const contentType = response.headers.get('content-type');

    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response from GraphQL API:', {
        contentType,
        status: response.status,
        text: text.substring(0, 200),
      });

      return NextResponse.json(
        {
          errors: [
            {
              extensions: { code: 'INVALID_RESPONSE' },
              message: `API returned ${contentType} instead of JSON (status: ${response.status})`,
            },
          ],
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Create response with same status
    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    // Forward cookies from API (purchase sets auth cookies needed for account creation)
    forwardCookies(response, nextResponse, request);

    return nextResponse;
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    return NextResponse.json(
      {
        errors: [
          {
            extensions: { code: 'PROXY_ERROR' },
            message: 'Failed to proxy GraphQL request',
          },
        ],
      },
      { status: 500 }
    );
  }
}
