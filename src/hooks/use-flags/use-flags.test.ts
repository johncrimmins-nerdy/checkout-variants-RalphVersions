/**
 * @jest-environment jsdom
 */
import type { LDClient, LDFlagSet } from 'launchdarkly-react-client-sdk';

import { renderHook } from '@testing-library/react';

import { FLAGS } from './flags';
import { getFlag, useFlags } from './use-flags';

// Mock LaunchDarkly
const mockVariation = jest.fn();
const mockUseLDClient = jest.fn();

jest.mock('launchdarkly-react-client-sdk', () => ({
  useLDClient: () => mockUseLDClient(),
}));

describe('getFlag', () => {
  it('returns flag value when present', () => {
    const flags: LDFlagSet = {
      [FLAGS.ECOMM_587_PURCHASE_RETRY]: true,
    };

    const result = getFlag(flags, FLAGS.ECOMM_587_PURCHASE_RETRY);
    expect(result).toBe(true);
  });

  it('returns default value when flag is not present', () => {
    const flags: LDFlagSet = {};

    const result = getFlag(flags, FLAGS.ECOMM_587_PURCHASE_RETRY, false);
    expect(result).toBe(false);
  });

  it('returns undefined when flag is not present and no default', () => {
    const flags: LDFlagSet = {};

    const result = getFlag(flags, FLAGS.ECOMM_587_PURCHASE_RETRY);
    expect(result).toBeUndefined();
  });

  it('returns flag value over default when both exist', () => {
    const flags: LDFlagSet = {
      [FLAGS.ECOMM_587_PURCHASE_RETRY]: true,
    };

    const result = getFlag(flags, FLAGS.ECOMM_587_PURCHASE_RETRY, false);
    expect(result).toBe(true);
  });

  it('handles string flags', () => {
    const flags: LDFlagSet = {
      [FLAGS.ECOMM_682_NEW_CHECKOUT_PROMO_CODES]: 'promo-variant',
    };

    const result = getFlag(flags, FLAGS.ECOMM_682_NEW_CHECKOUT_PROMO_CODES);
    expect(result).toBe('promo-variant');
  });

  it('handles nullish flag values', () => {
    const flags: LDFlagSet = {
      [FLAGS.ECOMM_587_PURCHASE_RETRY]: null as unknown as boolean,
    };

    const result = getFlag(flags, FLAGS.ECOMM_587_PURCHASE_RETRY, true);
    // Nullish coalescing will use default for null
    expect(result).toBe(true);
  });
});

describe('useFlags()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a proxy object', () => {
    mockUseLDClient.mockReturnValue({
      variation: mockVariation,
    } as unknown as LDClient);

    const { result } = renderHook(() => useFlags());

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('calls client.variation when accessing flag', () => {
    mockVariation.mockReturnValue(true);
    mockUseLDClient.mockReturnValue({
      variation: mockVariation,
    } as unknown as LDClient);

    const { result } = renderHook(() => useFlags());

    const value = result.current[FLAGS.ECOMM_587_PURCHASE_RETRY];

    expect(mockVariation).toHaveBeenCalledWith(FLAGS.ECOMM_587_PURCHASE_RETRY, undefined);
    expect(value).toBe(true);
  });

  it('returns undefined for symbol properties', () => {
    mockUseLDClient.mockReturnValue({
      variation: mockVariation,
    } as unknown as LDClient);

    const { result } = renderHook(() => useFlags());

    // Access a symbol property (like React DevTools does)
    const symbolKey = Symbol('test');
    // @ts-expect-error - Testing symbol access
    const value = result.current[symbolKey];

    expect(value).toBeUndefined();
    expect(mockVariation).not.toHaveBeenCalled();
  });

  it('handles null client', () => {
    mockUseLDClient.mockReturnValue(null);

    const { result } = renderHook(() => useFlags());

    const value = result.current[FLAGS.ECOMM_587_PURCHASE_RETRY];

    expect(value).toBeUndefined();
  });

  it('handles undefined client', () => {
    mockUseLDClient.mockReturnValue(undefined);

    const { result } = renderHook(() => useFlags());

    const value = result.current[FLAGS.ECOMM_587_PURCHASE_RETRY];

    expect(value).toBeUndefined();
  });

  it('returns different values for different flags', () => {
    mockVariation.mockReturnValueOnce(true).mockReturnValueOnce('promo-code');

    mockUseLDClient.mockReturnValue({
      variation: mockVariation,
    } as unknown as LDClient);

    const { result } = renderHook(() => useFlags());

    const boolValue = result.current[FLAGS.ECOMM_587_PURCHASE_RETRY];
    const stringValue = result.current[FLAGS.ECOMM_682_NEW_CHECKOUT_PROMO_CODES];

    expect(boolValue).toBe(true);
    expect(stringValue).toBe('promo-code');
  });

  it('memoizes the proxy between renders', () => {
    mockUseLDClient.mockReturnValue({
      variation: mockVariation,
    } as unknown as LDClient);

    const { rerender, result } = renderHook(() => useFlags());

    const firstProxy = result.current;
    rerender();
    const secondProxy = result.current;

    // Same client means same proxy (memoized)
    expect(firstProxy).toBe(secondProxy);
  });

  it('creates new proxy when client changes', () => {
    const client1 = { variation: jest.fn() };
    const client2 = { variation: jest.fn() };

    mockUseLDClient.mockReturnValue(client1);
    const { rerender, result } = renderHook(() => useFlags());
    const firstProxy = result.current;

    mockUseLDClient.mockReturnValue(client2);
    rerender();
    const secondProxy = result.current;

    // Different client means different proxy
    expect(firstProxy).not.toBe(secondProxy);
  });
});
