import type { Client } from 'braintree-web';

import { initApplePay } from './init-apple-pay';

// Mock braintree-web
const mockApplePayCreate = jest.fn();
jest.mock('braintree-web', () => ({
  applePay: {
    create: (opts: unknown) => mockApplePayCreate(opts),
  },
}));

describe('initApplePay', () => {
  const mockClient = { getVersion: jest.fn() } as unknown as Client;
  const mockApplePayInstance = { performValidation: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates Apple Pay instance with client', async () => {
    mockApplePayCreate.mockResolvedValue(mockApplePayInstance);

    const result = await initApplePay(mockClient);

    expect(result).toBe(mockApplePayInstance);
    expect(mockApplePayCreate).toHaveBeenCalledWith({ client: mockClient });
  });

  it('returns undefined when Apple Pay is not available', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockApplePayCreate.mockRejectedValue(new Error('Apple Pay not supported'));

    const result = await initApplePay(mockClient);

    expect(result).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith('Apple Pay not available:', expect.any(Error));

    consoleWarnSpy.mockRestore();
  });

  it('handles creation errors gracefully', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockApplePayCreate.mockRejectedValue(new Error('Network error'));

    const result = await initApplePay(mockClient);

    expect(result).toBeUndefined();
    consoleWarnSpy.mockRestore();
  });
});
