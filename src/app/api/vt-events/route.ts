import { NextRequest, NextResponse } from 'next/server';

import { getVTEventsEndpoint } from '@/lib/analytics/config';

/**
 * Proxy for VT Events API
 * Required for localhost development where CORS blocks direct requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const endpoint = `${getVTEventsEndpoint()}/v2/pages/interaction`;

    // Forward the application ID header from the original request
    const applicationId = request.headers.get('x-vt-applicationid');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (applicationId) {
      headers['x-vt-applicationid'] = applicationId;
    }

    const response = await fetch(endpoint, {
      body: JSON.stringify(body),
      headers,
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[vt-events-proxy] Error:', response.status, response.statusText, errorText);
      return NextResponse.json(
        { details: errorText, error: 'Failed to forward event' },
        { status: response.status }
      );
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (error) {
    console.error('[vt-events-proxy] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
