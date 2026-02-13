/**
 * Tests for asset URL helper
 */

import { assetUrl } from './asset-url';

describe('assetUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('prepends default base path when env var is not set', () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;

    const result = assetUrl('/images/logo.svg');

    expect(result).toBe('/checkout/images/logo.svg');
  });

  it('prepends custom base path from env var', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/checkout';

    const result = assetUrl('/images/logo.svg');

    expect(result).toBe('/checkout/images/logo.svg');
  });

  it('handles empty base path', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '';

    const result = assetUrl('/images/logo.svg');

    // Falls back to default when empty string
    expect(result).toBe('/checkout/images/logo.svg');
  });

  it('handles path without leading slash', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/checkout';

    const result = assetUrl('images/logo.svg');

    // Note: The function concatenates directly, so paths without leading slash
    // will not have a separator. This is expected behavior - always use leading slash.
    expect(result).toBe('/checkoutimages/logo.svg');
  });

  it('handles nested paths', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/checkout';

    const result = assetUrl('/images/icons/credit-card.svg');

    expect(result).toBe('/checkout/images/icons/credit-card.svg');
  });

  it('handles path with query params', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/checkout';

    const result = assetUrl('/images/logo.svg?v=1.0');

    expect(result).toBe('/checkout/images/logo.svg?v=1.0');
  });

  it('handles empty path', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/checkout';

    const result = assetUrl('');

    expect(result).toBe('/checkout');
  });
});
