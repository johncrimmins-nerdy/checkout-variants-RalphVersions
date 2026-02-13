/**
 * @jest-environment jsdom
 */

/**
 * Tests for Braintree client initialization
 */

import {
  getBraintreeClient,
  getDataCollector,
  initBraintreeClient,
  initDataCollector,
  loadBraintreeSDK,
  teardownBraintree,
} from './braintree-client';

describe('braintree-client', () => {
  const mockClientInstance = {
    getVersion: jest.fn().mockReturnValue('3.117.1'),
    request: jest.fn(),
  };

  const mockDataCollectorInstance = {
    deviceData: 'device-data-json',
    teardown: jest.fn(),
  };

  const mockBraintree = {
    client: {
      create: jest.fn().mockResolvedValue(mockClientInstance),
      VERSION: '3.117.1',
    },
    dataCollector: {
      create: jest.fn().mockResolvedValue(mockDataCollectorInstance),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset module state by tearing down
    teardownBraintree();
    // Reset window.braintree
    delete (window as { braintree?: unknown }).braintree;
    // Clear any braintree scripts
    document.querySelectorAll('script[src*="braintree"]').forEach((el) => el.remove());
  });

  describe('getBraintreeClient', () => {
    it('returns null when not initialized', () => {
      expect(getBraintreeClient()).toBeNull();
    });

    it('returns client instance after initialization', async () => {
      (window as { braintree?: unknown }).braintree = mockBraintree;

      await initBraintreeClient('test-token');

      expect(getBraintreeClient()).toBe(mockClientInstance);
    });
  });

  describe('getDataCollector', () => {
    it('returns null when not initialized', () => {
      expect(getDataCollector()).toBeNull();
    });

    it('returns data collector after initialization', async () => {
      (window as { braintree?: unknown }).braintree = mockBraintree;

      await initDataCollector(mockClientInstance);

      expect(getDataCollector()).toBe(mockDataCollectorInstance);
    });
  });

  describe('initBraintreeClient', () => {
    it('creates Braintree client with authorization', async () => {
      (window as { braintree?: unknown }).braintree = mockBraintree;

      const result = await initBraintreeClient('test-authorization');

      expect(mockBraintree.client.create).toHaveBeenCalledWith({
        authorization: 'test-authorization',
      });
      expect(result).toBe(mockClientInstance);
    });

    it('returns existing instance if already initialized', async () => {
      (window as { braintree?: unknown }).braintree = mockBraintree;

      const first = await initBraintreeClient('token1');
      const second = await initBraintreeClient('token2');

      expect(first).toBe(second);
      expect(mockBraintree.client.create).toHaveBeenCalledTimes(1);
    });

    it('throws IntegrationError when client creation fails', async () => {
      (window as { braintree?: unknown }).braintree = {
        ...mockBraintree,
        client: {
          create: jest.fn().mockRejectedValue(new Error('Client creation failed')),
          VERSION: '3.117.1',
        },
      };

      await expect(initBraintreeClient('test-token')).rejects.toThrow(
        'Failed to initialize Braintree client'
      );
    });
  });

  describe('initDataCollector', () => {
    it('creates data collector with kount enabled', async () => {
      (window as { braintree?: unknown }).braintree = mockBraintree;

      const result = await initDataCollector(mockClientInstance);

      expect(mockBraintree.dataCollector.create).toHaveBeenCalledWith({
        client: mockClientInstance,
        kount: true,
      });
      expect(result).toBe(mockDataCollectorInstance);
    });

    it('returns existing instance if already initialized', async () => {
      (window as { braintree?: unknown }).braintree = mockBraintree;

      const first = await initDataCollector(mockClientInstance);
      const second = await initDataCollector(mockClientInstance);

      expect(first).toBe(second);
      expect(mockBraintree.dataCollector.create).toHaveBeenCalledTimes(1);
    });

    it('returns mock instance when data collector fails', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      (window as { braintree?: unknown }).braintree = {
        ...mockBraintree,
        dataCollector: {
          create: jest.fn().mockRejectedValue(new Error('Data collector error')),
        },
      };

      // Need to teardown first since previous tests may have set the instance
      teardownBraintree();

      const result = await initDataCollector(mockClientInstance);

      expect(result).toEqual({
        deviceData: '',
        teardown: expect.any(Function),
      });
      expect(consoleWarn).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });

    it('returns mock instance when SDK not loaded (non-critical failure)', async () => {
      // teardown to reset state
      teardownBraintree();

      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

      // Don't set window.braintree - SDK not loaded
      const result = await initDataCollector(mockClientInstance);

      // Data collector failure is non-critical, returns mock
      expect(result).toEqual({
        deviceData: '',
        teardown: expect.any(Function),
      });
      expect(consoleWarn).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });
  });

  describe('loadBraintreeSDK', () => {
    it('returns immediately if SDK already loaded', async () => {
      (window as { braintree?: unknown }).braintree = mockBraintree;

      await loadBraintreeSDK();

      // No script should be created
      expect(document.querySelector('script[src*="braintree"]')).toBeNull();
    });

    it('creates script element with correct src', async () => {
      const loadPromise = loadBraintreeSDK();

      const script = document.querySelector('script[src*="braintree"]') as HTMLScriptElement;
      expect(script).toBeTruthy();
      expect(script.src).toContain('braintreegateway.com');
      expect(script.async).toBe(true);

      // Simulate script load
      script.onload?.(new Event('load'));
      await loadPromise;
    });

    it('waits for existing script to load', async () => {
      // Create an existing script
      const existingScript = document.createElement('script');
      existingScript.src = 'https://js.braintreegateway.com/web/client.min.js';
      document.head.appendChild(existingScript);

      const loadPromise = loadBraintreeSDK();

      // Simulate load event
      existingScript.dispatchEvent(new Event('load'));

      await loadPromise;
    });

    it('rejects when script fails to load', async () => {
      const loadPromise = loadBraintreeSDK();

      const script = document.querySelector('script[src*="braintree"]') as HTMLScriptElement;
      script.onerror?.(new Event('error'));

      await expect(loadPromise).rejects.toThrow('Failed to load Braintree SDK');
    });

    it('rejects when existing script fails to load', async () => {
      // Create an existing script
      const existingScript = document.createElement('script');
      existingScript.src = 'https://js.braintreegateway.com/web/client.min.js';
      document.head.appendChild(existingScript);

      const loadPromise = loadBraintreeSDK();

      // Simulate error event
      existingScript.dispatchEvent(new Event('error'));

      await expect(loadPromise).rejects.toThrow('Failed to load Braintree SDK');
    });
  });

  describe('teardownBraintree', () => {
    it('cleans up data collector and client instances', async () => {
      (window as { braintree?: unknown }).braintree = mockBraintree;

      await initBraintreeClient('test-token');
      await initDataCollector(mockClientInstance);

      teardownBraintree();

      expect(mockDataCollectorInstance.teardown).toHaveBeenCalled();
      expect(getBraintreeClient()).toBeNull();
      expect(getDataCollector()).toBeNull();
    });

    it('handles teardown when nothing initialized', () => {
      // Should not throw
      expect(() => teardownBraintree()).not.toThrow();
    });
  });
});
