import { NextResponse } from 'next/server';

import { getWebDomain } from '@/lib/utils/get-api-domain';

/**
 * Proxy for Braintree token endpoint to avoid CORS issues
 * Forwards requests to the VT web server (not API server)
 */
export async function POST(request: Request) {
  try {
    const webDomain = getWebDomain();
    const apiUrl = `https://${webDomain}/api/v3/payment/token`;

    console.log('[Braintree Token Proxy] API URL:', apiUrl);

    // Get cookies from incoming request
    const cookieHeader = request.headers.get('cookie');

    // Build headers for upstream request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    // Forward the request to the actual API
    const response = await fetch(apiUrl, {
      body: await request.text(),
      headers,
      method: 'POST',
    });

    console.log('[Braintree Token Proxy] Response status:', response.status);
    console.log('[Braintree Token Proxy] Content-Type:', response.headers.get('content-type'));

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('[Braintree Token Proxy] Non-JSON response:', text.substring(0, 500));
      throw new Error(
        `API returned non-JSON response (${response.status}): ${text.substring(0, 200)}`
      );
    }

    // Get response data
    const data = await response.json();

    // Return the response
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Braintree token proxy error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get Braintree token',
      },
      { status: 500 }
    );
  }
}
