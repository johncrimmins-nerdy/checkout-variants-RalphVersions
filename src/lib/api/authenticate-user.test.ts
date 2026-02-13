/**
 * Tests for authenticate-user API
 * Critical user login functionality
 */

import { authenticateUser } from './authenticate-user';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('authenticateUser', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    mockFetch.mockReset();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('successful authentication', () => {
    it('should return accessToken and userID on successful login', async () => {
      const mockResponse = {
        accessToken: 'jwt-token-123',
        userID: 'user-456',
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await authenticateUser('test@example.com', 'password123');

      expect(result).toEqual({
        accessToken: 'jwt-token-123',
        userID: 'user-456',
      });
    });

    it('should call the correct API endpoint with base path', async () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/checkout';

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ accessToken: 'token', userID: 'user' }),
        ok: true,
      });

      await authenticateUser('test@example.com', 'password123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/checkout/api/login',
        expect.objectContaining({
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })
      );
    });

    it('should use default base path when env is not set', async () => {
      delete process.env.NEXT_PUBLIC_BASE_PATH;

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ accessToken: 'token', userID: 'user' }),
        ok: true,
      });

      await authenticateUser('test@example.com', 'password123');

      expect(mockFetch).toHaveBeenCalledWith('/checkout/api/login', expect.any(Object));
    });
  });

  describe('failed authentication', () => {
    it('should return error object on authentication failure', async () => {
      const mockResponse = {
        error: 'auth_user failed' as const,
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await authenticateUser('wrong@example.com', 'badpassword');

      expect(result).toEqual({
        error: 'auth_user failed',
      });
    });
  });

  describe('request format', () => {
    it('should send credentials as JSON in request body', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ accessToken: 'token', userID: 'user' }),
        ok: true,
      });

      await authenticateUser('user@test.com', 'secret');

      const [, requestOptions] = mockFetch.mock.calls[0];
      const body = JSON.parse(requestOptions.body);

      expect(body).toEqual({
        email: 'user@test.com',
        password: 'secret',
      });
    });

    it('should include credentials: include for cookie handling', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ accessToken: 'token', userID: 'user' }),
        ok: true,
      });

      await authenticateUser('test@example.com', 'password');

      const [, requestOptions] = mockFetch.mock.calls[0];
      expect(requestOptions.credentials).toBe('include');
    });

    it('should set Content-Type header to application/json', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ accessToken: 'token', userID: 'user' }),
        ok: true,
      });

      await authenticateUser('test@example.com', 'password');

      const [, requestOptions] = mockFetch.mock.calls[0];
      expect(requestOptions.headers['Content-Type']).toBe('application/json');
    });
  });
});
