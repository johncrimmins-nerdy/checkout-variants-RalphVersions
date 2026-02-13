/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { POST } from './route';

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

describe('Login API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully proxies login request', async () => {
    const loginResponse = {
      success: true,
      userID: 'user-123',
    };

    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(loginResponse),
      status: 200,
    });

    const request = new NextRequest('http://localhost:3000/api/login', {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(loginResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.vtstaging.com/v1/users/login',
      expect.objectContaining({
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
    );
  });

  it('forwards cookies from API response', async () => {
    const { forwardCookies } = jest.requireMock('@/lib/utils/forward-cookies');

    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ success: true }),
      status: 200,
    });

    const request = new NextRequest('http://localhost:3000/api/login', {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      method: 'POST',
    });

    await POST(request);

    expect(forwardCookies).toHaveBeenCalled();
  });

  it('handles authentication failure from upstream', async () => {
    const errorResponse = {
      error: 'Invalid credentials',
      success: false,
    };

    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(errorResponse),
      status: 401,
    });

    const request = new NextRequest('http://localhost:3000/api/login', {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrong',
      }),
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual(errorResponse);
  });

  it('handles fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const request = new NextRequest('http://localhost:3000/api/login', {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to authenticate');
  });

  it('handles invalid JSON body', async () => {
    const request = new NextRequest('http://localhost:3000/api/login', {
      body: 'invalid json',
      method: 'POST',
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});
