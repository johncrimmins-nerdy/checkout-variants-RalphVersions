/**
 * Login API proxy for development
 * Forwards authentication requests to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';

import { forwardCookies } from '@/lib/utils/forward-cookies';
import { getApiDomain } from '@/lib/utils/get-api-domain';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const apiDomain = getApiDomain();
    const loginUrl = `https://${apiDomain}/v1/users/login`;

    // Forward the login request
    const response = await fetch(loginUrl, {
      body: JSON.stringify(body),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const data = await response.json();

    // Create response
    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    // Forward cookies from API
    forwardCookies(response, nextResponse, request);

    return nextResponse;
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
