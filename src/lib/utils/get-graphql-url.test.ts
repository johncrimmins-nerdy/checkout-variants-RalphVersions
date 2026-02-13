/**
 * Tests for GraphQL URL builder
 */

import { getGraphQLUrl } from './get-graphql-url';

// Mock getApiDomain
jest.mock('./get-api-domain', () => ({
  getApiDomain: () => 'api.varsitytutors.com',
}));

describe('getGraphQLUrl', () => {
  const originalWindow = global.window;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    global.window = originalWindow;
    process.env = originalEnv;
  });

  describe('client-side (browser)', () => {
    beforeEach(() => {
      // Simulate browser environment
      global.window = {} as typeof globalThis & Window;
    });

    it('returns proxy URL with default base path', () => {
      delete process.env.NEXT_PUBLIC_BASE_PATH;

      const result = getGraphQLUrl();

      expect(result).toBe('/checkout/api/graphql');
    });

    it('returns proxy URL with custom base path', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/checkout';

      const result = getGraphQLUrl();

      expect(result).toBe('/checkout/api/graphql');
    });

    it('returns proxy URL with empty base path fallback', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '';

      const result = getGraphQLUrl();

      expect(result).toBe('/checkout/api/graphql');
    });
  });

  describe('server-side (Node.js)', () => {
    beforeEach(() => {
      // Simulate server environment
      // @ts-expect-error - Simulating server environment
      delete global.window;
    });

    it('returns direct API URL', () => {
      const result = getGraphQLUrl();

      expect(result).toBe('https://api.varsitytutors.com/graphql');
    });
  });
});
