/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { POST } from './route';

// Mock dependencies
jest.mock('@/lib/analytics/config', () => ({
  getVTEventsEndpoint: jest.fn().mockReturnValue('https://events.vtstaging.com'),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('VT Events API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully proxies event request', async () => {
    const eventResponse = { success: true };

    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(eventResponse),
      ok: true,
      status: 200,
    });

    const request = new NextRequest('http://localhost:3000/api/vt-events', {
      body: JSON.stringify({
        event: 'page_view',
        properties: { page: '/checkout' },
      }),
      headers: {
        'x-vt-applicationid': 'checkout-app',
      },
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(eventResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://events.vtstaging.com/v2/pages/interaction',
      expect.objectContaining({
        body: JSON.stringify({
          event: 'page_view',
          properties: { page: '/checkout' },
        }),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-vt-applicationid': 'checkout-app',
        }),
        method: 'POST',
      })
    );
  });

  it('handles request without application ID header', async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ success: true }),
      ok: true,
      status: 200,
    });

    const request = new NextRequest('http://localhost:3000/api/vt-events', {
      body: JSON.stringify({ event: 'page_view' }),
      method: 'POST',
    });

    await POST(request);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('handles upstream error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: jest.fn().mockResolvedValue('Invalid event format'),
    });

    const request = new NextRequest('http://localhost:3000/api/vt-events', {
      body: JSON.stringify({ invalid: 'data' }),
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Failed to forward event');
    expect(data.details).toBe('Invalid event format');
  });

  it('handles upstream error with no text response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: jest.fn().mockRejectedValue(new Error('No body')),
    });

    const request = new NextRequest('http://localhost:3000/api/vt-events', {
      body: JSON.stringify({ event: 'test' }),
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to forward event');
    expect(data.details).toBe('');
  });

  it('handles response with no JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockRejectedValue(new Error('No JSON')),
      ok: true,
      status: 200,
    });

    const request = new NextRequest('http://localhost:3000/api/vt-events', {
      body: JSON.stringify({ event: 'test' }),
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({});
  });

  it('handles fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const request = new NextRequest('http://localhost:3000/api/vt-events', {
      body: JSON.stringify({ event: 'test' }),
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('handles invalid JSON body', async () => {
    const request = new NextRequest('http://localhost:3000/api/vt-events', {
      body: 'invalid json',
      method: 'POST',
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});
