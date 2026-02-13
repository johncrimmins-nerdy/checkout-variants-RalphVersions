/**
 * @jest-environment node
 */
import { POST } from './route';

// Mock dependencies
jest.mock('@/lib/utils/get-api-domain', () => ({
  getWebDomain: jest.fn().mockReturnValue('www.vtstaging.com'),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Braintree Token API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully proxies token request', async () => {
    const mockTokenResponse = { clientToken: 'test-token-123' };

    mockFetch.mockResolvedValueOnce({
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: jest.fn().mockResolvedValue(mockTokenResponse),
      status: 200,
    });

    const request = new Request('http://localhost:3000/api/braintree-token', {
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'session=abc123',
      },
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockTokenResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.vtstaging.com/api/v3/payment/token',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Cookie: 'session=abc123',
        }),
        method: 'POST',
      })
    );
  });

  it('forwards request body to upstream API', async () => {
    const requestBody = { customerId: '123' };

    mockFetch.mockResolvedValueOnce({
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: jest.fn().mockResolvedValue({ clientToken: 'token' }),
      status: 200,
    });

    const request = new Request('http://localhost:3000/api/braintree-token', {
      body: JSON.stringify(requestBody),
      method: 'POST',
    });

    await POST(request);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify(requestBody),
      })
    );
  });

  it('handles request without cookies', async () => {
    mockFetch.mockResolvedValueOnce({
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: jest.fn().mockResolvedValue({ clientToken: 'token' }),
      status: 200,
    });

    const request = new Request('http://localhost:3000/api/braintree-token', {
      body: JSON.stringify({}),
      method: 'POST',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('returns error for non-JSON response', async () => {
    mockFetch.mockResolvedValueOnce({
      headers: new Headers({
        'content-type': 'text/html',
      }),
      status: 200,
      text: jest.fn().mockResolvedValue('<html>Error page</html>'),
    });

    const request = new Request('http://localhost:3000/api/braintree-token', {
      body: JSON.stringify({}),
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('non-JSON response');
  });

  it('handles upstream API error status', async () => {
    const errorResponse = { error: 'Unauthorized' };

    mockFetch.mockResolvedValueOnce({
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: jest.fn().mockResolvedValue(errorResponse),
      status: 401,
    });

    const request = new Request('http://localhost:3000/api/braintree-token', {
      body: JSON.stringify({}),
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual(errorResponse);
  });

  it('handles fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const request = new Request('http://localhost:3000/api/braintree-token', {
      body: JSON.stringify({}),
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Network error');
  });

  it('handles non-Error exceptions', async () => {
    mockFetch.mockRejectedValueOnce('String error');

    const request = new Request('http://localhost:3000/api/braintree-token', {
      body: JSON.stringify({}),
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to get Braintree token');
  });
});
