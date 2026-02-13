/**
 * Tests for get-api-domain utilities
 * Domain resolution based on environment variables (consistent for client and server)
 *
 * Note: jest.setup.ts sets default values:
 * - NEXT_PUBLIC_API_DOMAIN = 'api.vtstaging.com'
 * - NEXT_PUBLIC_WEB_DOMAIN = 'www.vtstaging.com'
 * - NEXT_PUBLIC_ENV = 'test'
 */

import { getApiDomain, getWebDomain, isProduction } from './get-api-domain';

describe('getApiDomain', () => {
  const originalApiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_DOMAIN = originalApiDomain;
  });

  it('should use NEXT_PUBLIC_API_DOMAIN env variable', () => {
    // jest.setup.ts sets this to 'api.vtstaging.com'
    expect(getApiDomain()).toBe('api.vtstaging.com');
  });

  it('should use production domain when env variable is changed', () => {
    process.env.NEXT_PUBLIC_API_DOMAIN = 'api.varsitytutors.com';
    expect(getApiDomain()).toBe('api.varsitytutors.com');
  });

  it('should return the value from NEXT_PUBLIC_API_DOMAIN', () => {
    // Verify it reads from the env var
    expect(getApiDomain()).toBe(process.env.NEXT_PUBLIC_API_DOMAIN);
  });
});

describe('getWebDomain', () => {
  it('should use NEXT_PUBLIC_WEB_DOMAIN env variable', () => {
    // jest.setup.ts sets this to 'www.vtstaging.com'
    expect(getWebDomain()).toBe('www.vtstaging.com');
  });

  it('should return the value from NEXT_PUBLIC_WEB_DOMAIN', () => {
    // Verify it reads from the env var
    expect(getWebDomain()).toBe(process.env.NEXT_PUBLIC_WEB_DOMAIN || 'www.vtstaging.com');
  });
});

describe('isProduction', () => {
  it('should return false for test environment', () => {
    // jest.setup.ts sets NEXT_PUBLIC_ENV = 'test'
    expect(isProduction()).toBe(false);
  });

  it('should check NEXT_PUBLIC_ENV equals production', () => {
    // Verify the logic: returns true only when env === 'production'
    const expected = process.env.NEXT_PUBLIC_ENV === 'production';
    expect(isProduction()).toBe(expected);
  });
});
