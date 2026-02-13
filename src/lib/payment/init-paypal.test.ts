/**
 * @jest-environment jsdom
 */
import type { Client } from 'braintree-web';

import { initPayPal } from './init-paypal';

// Mock braintree-web
const mockPaypalCheckoutCreate = jest.fn();
jest.mock('braintree-web', () => ({
  paypalCheckout: {
    create: (opts: unknown) => mockPaypalCheckoutCreate(opts),
  },
}));

describe('initPayPal', () => {
  const mockClient = { getVersion: jest.fn() } as unknown as Client;
  const mockPaypalInstance = { createPayment: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up window.paypal mock
    Object.defineProperty(window, 'paypal', {
      configurable: true,
      value: { Buttons: jest.fn() },
      writable: true,
    });
  });

  afterEach(() => {
    delete window.paypal;
  });

  it('creates PayPal instance when SDK is loaded', async () => {
    mockPaypalCheckoutCreate.mockResolvedValue(mockPaypalInstance);

    const result = await initPayPal(mockClient);

    expect(result).toBe(mockPaypalInstance);
    expect(mockPaypalCheckoutCreate).toHaveBeenCalledWith({ client: mockClient });
  });

  it('returns undefined when PayPal SDK is not loaded', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    delete window.paypal;

    const result = await initPayPal(mockClient);

    expect(result).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith('PayPal SDK not loaded');
    expect(mockPaypalCheckoutCreate).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('returns undefined when initialization fails', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockPaypalCheckoutCreate.mockRejectedValue(new Error('PayPal init failed'));

    const result = await initPayPal(mockClient);

    expect(result).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith('PayPal initialization failed:', expect.any(Error));

    consoleWarnSpy.mockRestore();
  });

  it('handles creation errors gracefully', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockPaypalCheckoutCreate.mockRejectedValue(new Error('Network error'));

    // Should not throw
    await expect(initPayPal(mockClient)).resolves.toBeUndefined();

    consoleWarnSpy.mockRestore();
  });
});
