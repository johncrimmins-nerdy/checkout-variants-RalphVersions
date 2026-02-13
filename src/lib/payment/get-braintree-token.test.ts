/**
 * Tests for Braintree token fetching
 */

import { getBraintreeToken } from './get-braintree-token';

describe('getBraintreeToken', () => {
  const mockFetch = jest.fn();
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch;
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_BASE_PATH = '/checkout';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  it('returns token on successful response', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ token: 'braintree-token-123' }),
      ok: true,
    });

    const result = await getBraintreeToken();

    expect(result).toBe('braintree-token-123');
    expect(mockFetch).toHaveBeenCalledWith('/checkout/api/braintree-token', {
      credentials: 'include',
      method: 'POST',
    });
  });

  it('returns null when token is missing in response', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({}),
      ok: true,
    });

    const result = await getBraintreeToken();

    expect(result).toBeNull();
  });

  it('uses default base path when env var not set', async () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ token: 'token-123' }),
      ok: true,
    });

    await getBraintreeToken();

    expect(mockFetch).toHaveBeenCalledWith('/checkout/api/braintree-token', {
      credentials: 'include',
      method: 'POST',
    });
  });

  it('throws IntegrationError on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getBraintreeToken()).rejects.toThrow('Error getting Braintree token');
  });

  it('throws IntegrationError on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(getBraintreeToken()).rejects.toThrow('Error getting Braintree token');
  });

  it('includes error details in thrown error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

    try {
      await getBraintreeToken();
      fail('Expected error to be thrown');
    } catch (error) {
      expect(error).toHaveProperty('context');
      expect((error as { context: { error: string } }).context.error).toBe('Connection refused');
      expect((error as { context: { payment_step: string } }).context.payment_step).toBe(
        'get-braintree-token'
      );
    }
  });

  it('handles non-Error exceptions', async () => {
    mockFetch.mockRejectedValueOnce('String error');

    try {
      await getBraintreeToken();
      fail('Expected error to be thrown');
    } catch (error) {
      expect((error as { context: { error: string } }).context.error).toBe('String error');
    }
  });
});
