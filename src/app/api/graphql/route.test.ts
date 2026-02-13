/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { GET, POST } from './route';

// Mock dependencies
jest.mock('@/lib/utils/get-api-domain', () => ({
  getApiDomain: jest.fn().mockReturnValue('api.vtstaging.com'),
}));

jest.mock('@/lib/utils/forward-cookies', () => ({
  forwardCookies: jest.fn(),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('GraphQL API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET (introspection)', () => {
    it('successfully proxies GET request', async () => {
      const schemaResponse = { data: { __schema: {} } };

      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(schemaResponse),
        status: 200,
      });

      const request = new NextRequest('http://localhost:3000/api/graphql', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(schemaResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.vtstaging.com/graphql',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'GET',
        })
      );
    });

    it('handles GET error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/graphql', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch GraphQL schema');
    });
  });

  describe('POST', () => {
    it('successfully proxies GraphQL query', async () => {
      const queryResponse = {
        data: {
          checkoutDetails: {
            __typename: 'CheckoutSuccess',
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: jest.fn().mockResolvedValue(queryResponse),
        status: 200,
      });

      const request = new NextRequest('http://localhost:3000/api/graphql', {
        body: JSON.stringify({
          query: 'query { checkoutDetails { __typename } }',
        }),
        headers: {
          Cookie: 'session=abc123',
        },
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(queryResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.vtstaging.com/graphql',
        expect.objectContaining({
          body: JSON.stringify({
            query: 'query { checkoutDetails { __typename } }',
          }),
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Cookie: 'session=abc123',
          }),
          method: 'POST',
        })
      );
    });

    it('forwards cookies from API response', async () => {
      const { forwardCookies } = jest.requireMock('@/lib/utils/forward-cookies');

      mockFetch.mockResolvedValueOnce({
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: jest.fn().mockResolvedValue({ data: {} }),
        status: 200,
      });

      const request = new NextRequest('http://localhost:3000/api/graphql', {
        body: JSON.stringify({ query: '{}' }),
        method: 'POST',
      });

      await POST(request);

      expect(forwardCookies).toHaveBeenCalled();
    });

    it('handles non-JSON response from API', async () => {
      mockFetch.mockResolvedValueOnce({
        headers: new Headers({
          'content-type': 'text/html',
        }),
        status: 502,
        text: jest.fn().mockResolvedValue('<html>Bad Gateway</html>'),
      });

      const request = new NextRequest('http://localhost:3000/api/graphql', {
        body: JSON.stringify({ query: '{}' }),
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.errors).toBeDefined();
      expect(data.errors[0].extensions.code).toBe('INVALID_RESPONSE');
    });

    it('handles GraphQL error response', async () => {
      const errorResponse = {
        data: null,
        errors: [{ message: 'Unauthorized' }],
      };

      mockFetch.mockResolvedValueOnce({
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: jest.fn().mockResolvedValue(errorResponse),
        status: 200,
      });

      const request = new NextRequest('http://localhost:3000/api/graphql', {
        body: JSON.stringify({ query: '{}' }),
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.errors).toBeDefined();
    });

    it('handles fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/graphql', {
        body: JSON.stringify({ query: '{}' }),
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors[0].extensions.code).toBe('PROXY_ERROR');
    });

    it('handles invalid JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/graphql', {
        body: 'invalid json',
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors[0].extensions.code).toBe('PROXY_ERROR');
    });

    it('handles request without cookies (Cookie header omitted)', async () => {
      mockFetch.mockResolvedValueOnce({
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: jest.fn().mockResolvedValue({ data: {} }),
        status: 200,
      });

      const request = new NextRequest('http://localhost:3000/api/graphql', {
        body: JSON.stringify({ query: '{}' }),
        method: 'POST',
      });

      await POST(request);

      // When no cookies are provided, the Cookie header is omitted entirely
      // (empty values are filtered out to avoid sending unnecessary headers)
      const fetchCall = mockFetch.mock.calls[0];
      const headers = fetchCall[1].headers;

      expect(headers['Cookie']).toBeUndefined();
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('forwards user identification headers for reCAPTCHA validation', async () => {
      mockFetch.mockResolvedValueOnce({
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: jest.fn().mockResolvedValue({ data: {} }),
        status: 200,
      });

      const request = new NextRequest('http://localhost:3000/api/graphql', {
        body: JSON.stringify({ query: '{}' }),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          'X-Forwarded-For': '192.168.1.100, 10.0.0.1',
          'X-Real-IP': '192.168.1.100',
        },
        method: 'POST',
      });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            'X-Forwarded-For': '192.168.1.100, 10.0.0.1',
            'X-Real-IP': '192.168.1.100',
          }),
        })
      );
    });

    it('only includes non-empty user identification headers', async () => {
      mockFetch.mockResolvedValueOnce({
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: jest.fn().mockResolvedValue({ data: {} }),
        status: 200,
      });

      const request = new NextRequest('http://localhost:3000/api/graphql', {
        body: JSON.stringify({ query: '{}' }),
        headers: {
          'User-Agent': 'Mozilla/5.0',
          // X-Forwarded-For and X-Real-IP not provided
        },
        method: 'POST',
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const headers = fetchCall[1].headers;

      expect(headers['User-Agent']).toBe('Mozilla/5.0');
      expect(headers['X-Forwarded-For']).toBeUndefined();
      expect(headers['X-Real-IP']).toBeUndefined();
    });
  });
});
