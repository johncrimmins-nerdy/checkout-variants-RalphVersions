/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';

import { forwardCookies } from './forward-cookies';

describe('forwardCookies', () => {
  let mockApiResponse: Response;
  let mockNextResponse: NextResponse;
  let mockRequest: NextRequest;
  let appendedCookies: string[];

  beforeEach(() => {
    appendedCookies = [];

    // Mock NextResponse with headers.append tracker
    mockNextResponse = {
      headers: {
        append: jest.fn((name: string, value: string) => {
          if (name === 'Set-Cookie') {
            appendedCookies.push(value);
          }
        }),
      },
    } as unknown as NextResponse;
  });

  it('forwards cookies from API response', () => {
    mockApiResponse = {
      headers: {
        getSetCookie: () => ['session=abc123; Path=/; HttpOnly', 'user_id=456; Path=/'],
      },
    } as unknown as Response;

    mockRequest = new NextRequest('http://localhost:3000/api/test');

    forwardCookies(mockApiResponse, mockNextResponse, mockRequest);

    expect(appendedCookies).toHaveLength(2);
    expect(appendedCookies[0]).toBe('session=abc123; Path=/; HttpOnly');
    expect(appendedCookies[1]).toBe('user_id=456; Path=/');
  });

  it('does nothing when no cookies present', () => {
    mockApiResponse = {
      headers: {
        getSetCookie: () => [],
      },
    } as unknown as Response;

    mockRequest = new NextRequest('http://localhost:3000/api/test');

    forwardCookies(mockApiResponse, mockNextResponse, mockRequest);

    expect(appendedCookies).toHaveLength(0);
  });

  it('strips domain for non-VT domains (localhost)', () => {
    mockApiResponse = {
      headers: {
        getSetCookie: () => [
          'session=abc123; Path=/; Domain=.varsitytutors.com; HttpOnly',
          'user_id=456; Path=/; Domain=vtstaging.com',
        ],
      },
    } as unknown as Response;

    mockRequest = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        Host: 'localhost:3000',
      },
    });

    forwardCookies(mockApiResponse, mockNextResponse, mockRequest);

    expect(appendedCookies).toHaveLength(2);
    expect(appendedCookies[0]).toBe('session=abc123; Path=/; HttpOnly');
    expect(appendedCookies[1]).toBe('user_id=456; Path=/');
  });

  it('preserves domain for varsitytutors.com', () => {
    mockApiResponse = {
      headers: {
        getSetCookie: () => ['session=abc123; Path=/; Domain=.varsitytutors.com; HttpOnly'],
      },
    } as unknown as Response;

    mockRequest = new NextRequest('https://www.varsitytutors.com/checkout', {
      headers: {
        Host: 'www.varsitytutors.com',
      },
    });

    forwardCookies(mockApiResponse, mockNextResponse, mockRequest);

    expect(appendedCookies).toHaveLength(1);
    expect(appendedCookies[0]).toBe('session=abc123; Path=/; Domain=.varsitytutors.com; HttpOnly');
  });

  it('preserves domain for vtstaging.com', () => {
    mockApiResponse = {
      headers: {
        getSetCookie: () => ['session=abc123; Path=/; Domain=.vtstaging.com; HttpOnly'],
      },
    } as unknown as Response;

    mockRequest = new NextRequest('https://www.vtstaging.com/checkout', {
      headers: {
        Host: 'www.vtstaging.com',
      },
    });

    forwardCookies(mockApiResponse, mockNextResponse, mockRequest);

    expect(appendedCookies).toHaveLength(1);
    expect(appendedCookies[0]).toBe('session=abc123; Path=/; Domain=.vtstaging.com; HttpOnly');
  });

  it('preserves domain when x-forwarded-host is varsitytutors.com (behind proxy)', () => {
    mockApiResponse = {
      headers: {
        getSetCookie: () => ['session=abc123; Path=/; Domain=.varsitytutors.com; HttpOnly'],
      },
    } as unknown as Response;

    // Simulate request coming through Netlify proxy where host might be internal
    // but x-forwarded-host contains the actual VT domain
    mockRequest = new NextRequest('https://some-netlify-internal.netlify.app/checkout', {
      headers: {
        Host: 'some-netlify-internal.netlify.app',
        'x-forwarded-host': 'www.varsitytutors.com',
      },
    });

    forwardCookies(mockApiResponse, mockNextResponse, mockRequest);

    expect(appendedCookies).toHaveLength(1);
    expect(appendedCookies[0]).toBe('session=abc123; Path=/; Domain=.varsitytutors.com; HttpOnly');
  });

  it('preserves domain when x-forwarded-host is vtstaging.com (behind proxy)', () => {
    mockApiResponse = {
      headers: {
        getSetCookie: () => ['session=abc123; Path=/; Domain=.vtstaging.com; HttpOnly'],
      },
    } as unknown as Response;

    // Simulate request coming through Netlify proxy
    mockRequest = new NextRequest('https://some-netlify-internal.netlify.app/checkout', {
      headers: {
        Host: 'some-netlify-internal.netlify.app',
        'x-forwarded-host': 'www.vtstaging.com',
      },
    });

    forwardCookies(mockApiResponse, mockNextResponse, mockRequest);

    expect(appendedCookies).toHaveLength(1);
    expect(appendedCookies[0]).toBe('session=abc123; Path=/; Domain=.vtstaging.com; HttpOnly');
  });

  it('preserves domain when origin header is vtstaging.com (Netlify behind CloudFront)', () => {
    mockApiResponse = {
      headers: {
        getSetCookie: () => ['session=abc123; Path=/; Domain=.vtstaging.com; HttpOnly'],
      },
    } as unknown as Response;

    // Simulate real scenario: Netlify internal host but origin is VT domain
    mockRequest = new NextRequest('https://main--checkout-wf.netlify.app/checkout/api/graphql', {
      headers: {
        Host: 'main--checkout-wf.netlify.app',
        origin: 'https://www.vtstaging.com',
        'x-forwarded-host': 'main--checkout-wf.netlify.app',
      },
    });

    forwardCookies(mockApiResponse, mockNextResponse, mockRequest);

    expect(appendedCookies).toHaveLength(1);
    expect(appendedCookies[0]).toBe('session=abc123; Path=/; Domain=.vtstaging.com; HttpOnly');
  });

  it('preserves domain when origin header is varsitytutors.com (production)', () => {
    mockApiResponse = {
      headers: {
        getSetCookie: () => ['session=abc123; Path=/; Domain=.varsitytutors.com; HttpOnly'],
      },
    } as unknown as Response;

    // Simulate production scenario
    mockRequest = new NextRequest('https://main--checkout-wf.netlify.app/checkout/api/graphql', {
      headers: {
        Host: 'main--checkout-wf.netlify.app',
        origin: 'https://www.varsitytutors.com',
        'x-forwarded-host': 'main--checkout-wf.netlify.app',
      },
    });

    forwardCookies(mockApiResponse, mockNextResponse, mockRequest);

    expect(appendedCookies).toHaveLength(1);
    expect(appendedCookies[0]).toBe('session=abc123; Path=/; Domain=.varsitytutors.com; HttpOnly');
  });

  it('strips domain for Netlify deploy previews', () => {
    mockApiResponse = {
      headers: {
        getSetCookie: () => ['session=abc123; Path=/; Domain=.varsitytutors.com; HttpOnly'],
      },
    } as unknown as Response;

    mockRequest = new NextRequest('https://deploy-preview-123--checkout.netlify.app', {
      headers: {
        Host: 'deploy-preview-123--checkout.netlify.app',
      },
    });

    forwardCookies(mockApiResponse, mockNextResponse, mockRequest);

    expect(appendedCookies).toHaveLength(1);
    expect(appendedCookies[0]).toBe('session=abc123; Path=/; HttpOnly');
  });

  it('handles getSetCookie not available (fallback)', () => {
    mockApiResponse = {
      headers: {
        getSetCookie: undefined,
      },
    } as unknown as Response;

    mockRequest = new NextRequest('http://localhost:3000/api/test');

    // Should not throw
    expect(() => forwardCookies(mockApiResponse, mockNextResponse, mockRequest)).not.toThrow();
    expect(appendedCookies).toHaveLength(0);
  });

  it('handles multiple domain attributes in one cookie', () => {
    mockApiResponse = {
      headers: {
        getSetCookie: () => [
          'session=abc123; Domain=.varsitytutors.com; Path=/; Domain=.vtstaging.com',
        ],
      },
    } as unknown as Response;

    mockRequest = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        Host: 'localhost:3000',
      },
    });

    forwardCookies(mockApiResponse, mockNextResponse, mockRequest);

    expect(appendedCookies).toHaveLength(1);
    // Both domain attributes should be stripped
    expect(appendedCookies[0]).not.toContain('Domain=');
  });
});
