/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  getSharedBraintreeClient,
  resetBraintreeClient,
  useBraintreeClient,
} from './useBraintreeClient';

// Mock dependencies
const mockGetBraintreeToken = jest.fn();
jest.mock('./get-braintree-token', () => ({
  getBraintreeToken: () => mockGetBraintreeToken(),
}));

const mockClientCreate = jest.fn();
jest.mock('braintree-web', () => ({
  client: {
    create: (opts: unknown) => mockClientCreate(opts),
  },
}));

describe('useBraintreeClient', () => {
  const mockClient = { getVersion: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    resetBraintreeClient();
  });

  it('initializes client on first render', async () => {
    mockGetBraintreeToken.mockResolvedValue('test-token');
    mockClientCreate.mockResolvedValue(mockClient);

    const { result } = renderHook(() => useBraintreeClient());

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.client).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.client).toBe(mockClient);
    expect(result.current.error).toBeNull();
  });

  it('shares client across multiple hook instances', async () => {
    mockGetBraintreeToken.mockResolvedValue('test-token');
    mockClientCreate.mockResolvedValue(mockClient);

    const { result: result1 } = renderHook(() => useBraintreeClient());

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false);
    });

    // Second hook should get same client
    const { result: result2 } = renderHook(() => useBraintreeClient());

    expect(result2.current.client).toBe(result1.current.client);
    expect(mockClientCreate).toHaveBeenCalledTimes(1);
  });

  it('handles token fetch failure', async () => {
    mockGetBraintreeToken.mockResolvedValue(null);

    const { result } = renderHook(() => useBraintreeClient());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.client).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Braintree token is null');
  });

  it('handles client creation failure', async () => {
    mockGetBraintreeToken.mockResolvedValue('test-token');
    mockClientCreate.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useBraintreeClient());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.client).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Braintree widget failed to load');
  });

  it('reinitialize resets and refetches client', async () => {
    mockGetBraintreeToken.mockResolvedValue('test-token');
    mockClientCreate.mockResolvedValue(mockClient);

    const { result } = renderHook(() => useBraintreeClient());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockClientCreate).toHaveBeenCalledTimes(1);

    // Reinitialize
    const newClient = { getVersion: jest.fn(), version: 2 };
    mockClientCreate.mockResolvedValue(newClient);

    act(() => {
      result.current.reinitialize();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockClientCreate).toHaveBeenCalledTimes(2);
    expect(result.current.client).toBe(newClient);
  });
});

describe('getSharedBraintreeClient', () => {
  beforeEach(() => {
    resetBraintreeClient();
  });

  it('returns null when not initialized', () => {
    expect(getSharedBraintreeClient()).toBeNull();
  });

  it('returns client after initialization', async () => {
    const mockClient = { getVersion: jest.fn() };
    mockGetBraintreeToken.mockResolvedValue('test-token');
    mockClientCreate.mockResolvedValue(mockClient);

    const { result } = renderHook(() => useBraintreeClient());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getSharedBraintreeClient()).toBe(mockClient);
  });
});

describe('resetBraintreeClient', () => {
  it('clears the shared client', async () => {
    const testClient = { getVersion: jest.fn() };
    mockGetBraintreeToken.mockResolvedValue('test-token');
    mockClientCreate.mockResolvedValue(testClient);

    const { result } = renderHook(() => useBraintreeClient());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getSharedBraintreeClient()).not.toBeNull();

    resetBraintreeClient();

    expect(getSharedBraintreeClient()).toBeNull();
  });
});
