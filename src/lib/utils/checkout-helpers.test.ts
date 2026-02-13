/**
 * Tests for checkout-helpers utilities
 * URL building and redirect logic
 */

import { buildUrlWithParams, getRedirectUrl } from './checkout-helpers';

// Mock checkout tracking
jest.mock('@/lib/analytics/checkout-tracking', () => ({
  trackCheckoutCompletionRouting: jest.fn(),
}));

describe('buildUrlWithParams', () => {
  it('should build URL with single parameter', () => {
    const result = buildUrlWithParams('/checkout', { id: '123' });
    expect(result).toBe('/checkout?id=123');
  });

  it('should build URL with multiple parameters', () => {
    const result = buildUrlWithParams('/checkout', {
      c: 'client-123',
      p: 'PROMO20',
      q: 'quote-456',
    });

    expect(result).toContain('/checkout?');
    expect(result).toContain('c=client-123');
    expect(result).toContain('p=PROMO20');
    expect(result).toContain('q=quote-456');
  });

  it('should filter out undefined values', () => {
    const result = buildUrlWithParams('/checkout', {
      defined: 'value',
      undef: undefined,
    });

    expect(result).toBe('/checkout?defined=value');
    expect(result).not.toContain('undef');
  });

  it('should return base path when all params are undefined', () => {
    const result = buildUrlWithParams('/checkout', {
      empty: undefined,
      other: undefined,
    });

    expect(result).toBe('/checkout');
  });

  it('should convert non-string values to strings', () => {
    const result = buildUrlWithParams('/checkout', {
      // Arrays use the first value
      arr: ['a', 'b'],
    });

    expect(result).toBe('/checkout?arr=a');
  });

  it('should handle empty params object', () => {
    const result = buildUrlWithParams('/checkout', {});
    expect(result).toBe('/checkout');
  });

  it('should encode special characters', () => {
    const result = buildUrlWithParams('/checkout', {
      email: 'test@example.com',
    });

    expect(result).toBe('/checkout?email=test%40example.com');
  });
});

describe('getRedirectUrl', () => {
  const originalEnv = process.env;
  const { trackCheckoutCompletionRouting } = jest.requireMock('@/lib/analytics/checkout-tracking');

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_BASE_PATH = '/checkout';
    trackCheckoutCompletionRouting.mockClear();

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { hostname: 'www.vtstaging.com' },
      writable: true,
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('full URLs', () => {
    it('should return full URL as-is', () => {
      const url = 'https://www.varsitytutors.com/account';
      const result = getRedirectUrl(url);

      expect(result).toBe(url);
      expect(trackCheckoutCompletionRouting).toHaveBeenCalledWith(url);
    });

    it('should handle http URLs', () => {
      const url = 'http://localhost:3000/test';
      const result = getRedirectUrl(url);

      expect(result).toBe(url);
    });
  });

  describe('in-app paths', () => {
    it('should return in-app paths for navigation', () => {
      const path = '/checkout/account-creation';
      const result = getRedirectUrl(path);

      expect(result).toBe('/checkout/account-creation');
      expect(trackCheckoutCompletionRouting).toHaveBeenCalledWith('/checkout/account-creation');
    });

    it('should handle root checkout path', () => {
      const result = getRedirectUrl('/checkout');

      expect(result).toBe('/checkout');
      expect(trackCheckoutCompletionRouting).toHaveBeenCalledWith('/checkout');
    });
  });

  describe('out-of-app paths', () => {
    it('should prefix staging domain for non-checkout paths on staging', () => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { hostname: 'www.vtstaging.com' },
        writable: true,
      });

      const result = getRedirectUrl('/my-account');

      expect(result).toBe('https://www.vtstaging.com/my-account');
      expect(trackCheckoutCompletionRouting).toHaveBeenCalledWith(
        'https://www.vtstaging.com/my-account'
      );
    });

    it('should prefix production domain for non-checkout paths on production', () => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { hostname: 'www.varsitytutors.com' },
        writable: true,
      });

      const result = getRedirectUrl('/my-account');

      expect(result).toBe('https://www.varsitytutors.com/my-account');
    });
  });

  describe('tracking', () => {
    it('should track full URL redirects', () => {
      getRedirectUrl('https://external.com');
      expect(trackCheckoutCompletionRouting).toHaveBeenCalledWith('https://external.com');
    });

    it('should track checkout path redirects', () => {
      getRedirectUrl('/checkout/success');
      expect(trackCheckoutCompletionRouting).toHaveBeenCalledWith('/checkout/success');
    });

    it('should track out-of-app path redirects', () => {
      getRedirectUrl('/dashboard');
      expect(trackCheckoutCompletionRouting).toHaveBeenCalled();
    });
  });
});
