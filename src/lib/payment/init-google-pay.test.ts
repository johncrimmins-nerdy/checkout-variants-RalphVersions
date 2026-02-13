/**
 * @jest-environment jsdom
 */
import type { Client } from 'braintree-web';

import { initGooglePay, waitForGooglePay } from './init-google-pay';

// Mock braintree-web
const mockGooglePaymentCreate = jest.fn();
jest.mock('braintree-web', () => ({
  googlePayment: {
    create: (opts: unknown) => mockGooglePaymentCreate(opts),
  },
}));

// Helper to set/unset window.google
function setWindowGoogle(value: typeof google | undefined) {
  if (value === undefined) {
    (window as Partial<typeof window>).google = undefined;
  } else {
    window.google = value;
  }
}

describe('waitForGooglePay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setWindowGoogle(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves with google when available', async () => {
    const mockGoogle = {
      payments: { api: { PaymentsClient: jest.fn() } },
    } as unknown as typeof google;
    setWindowGoogle(mockGoogle);

    const promise = waitForGooglePay();
    jest.advanceTimersByTime(50);

    const result = await promise;
    expect(result).toBe(mockGoogle);
  });

  it('resolves with null when timeout reached', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const promise = waitForGooglePay(100, 50);

    // Advance past timeout
    jest.advanceTimersByTime(150);

    const result = await promise;
    expect(result).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith('Google Pay is not available');

    consoleLogSpy.mockRestore();
  });

  it('retries until google is available', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockGoogle = {
      payments: { api: { PaymentsClient: jest.fn() } },
    } as unknown as typeof google;

    const promise = waitForGooglePay(500, 50);

    // First check - not available
    jest.advanceTimersByTime(50);

    // Second check - not available
    jest.advanceTimersByTime(50);

    // Make google available
    setWindowGoogle(mockGoogle);

    // Third check - available
    jest.advanceTimersByTime(50);

    const result = await promise;
    expect(result).toBe(mockGoogle);
    expect(consoleLogSpy).toHaveBeenCalledWith('Google Pay is available');

    consoleLogSpy.mockRestore();
  });
});

describe('initGooglePay', () => {
  const mockClient = { getVersion: jest.fn() } as unknown as Client;
  const mockGooglePayInstance = {
    createPaymentDataRequest: jest.fn().mockReturnValue({
      allowedPaymentMethods: [{ type: 'CARD' }],
    }),
  };
  const mockGooglePayClient = {
    isReadyToPay: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up window.google mock
    const MockPaymentsClient = jest.fn().mockReturnValue(mockGooglePayClient);
    setWindowGoogle({
      payments: {
        api: {
          PaymentsClient: MockPaymentsClient,
        },
      },
    } as unknown as typeof google);

    // Mock window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { hostname: 'localhost' },
      writable: true,
    });

    mockGooglePaymentCreate.mockResolvedValue(mockGooglePayInstance);
  });

  afterEach(() => {
    setWindowGoogle(undefined);
  });

  it('returns null instances when Google Pay SDK not available', async () => {
    setWindowGoogle(undefined);

    jest.useFakeTimers();
    const promise = initGooglePay(mockClient);
    jest.advanceTimersByTime(3000);
    jest.useRealTimers();

    const result = await promise;

    expect(result.googlePayClient).toBeNull();
    expect(result.googlePayInstance).toBeNull();
  });

  it('returns null instances when not ready to pay', async () => {
    mockGooglePayClient.isReadyToPay.mockResolvedValue({ result: false });

    jest.useFakeTimers();
    const promise = initGooglePay(mockClient);
    jest.advanceTimersByTime(100);
    jest.useRealTimers();

    const result = await promise;

    expect(result.googlePayClient).toBeNull();
    expect(result.googlePayInstance).toBeNull();
  });

  it('returns instances when ready to pay', async () => {
    mockGooglePayClient.isReadyToPay.mockResolvedValue({ result: true });

    jest.useFakeTimers();
    const promise = initGooglePay(mockClient);
    jest.advanceTimersByTime(100);
    jest.useRealTimers();

    const result = await promise;

    expect(result.googlePayInstance).toBe(mockGooglePayInstance);
    expect(result.googlePayClient).toBe(mockGooglePayClient);
  });

  it('uses TEST environment for non-production', async () => {
    mockGooglePayClient.isReadyToPay.mockResolvedValue({ result: true });

    const MockPaymentsClient = jest.fn().mockReturnValue(mockGooglePayClient);
    setWindowGoogle({
      payments: {
        api: {
          PaymentsClient: MockPaymentsClient,
        },
      },
    } as unknown as typeof google);

    jest.useFakeTimers();
    const promise = initGooglePay(mockClient);
    jest.advanceTimersByTime(100);
    jest.useRealTimers();

    await promise;

    expect(MockPaymentsClient).toHaveBeenCalledWith({ environment: 'TEST' });
  });

  it('uses PRODUCTION environment for varsitytutors.com', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { hostname: 'www.varsitytutors.com' },
      writable: true,
    });

    mockGooglePayClient.isReadyToPay.mockResolvedValue({ result: true });

    const MockPaymentsClient = jest.fn().mockReturnValue(mockGooglePayClient);
    setWindowGoogle({
      payments: {
        api: {
          PaymentsClient: MockPaymentsClient,
        },
      },
    } as unknown as typeof google);

    jest.useFakeTimers();
    const promise = initGooglePay(mockClient);
    jest.advanceTimersByTime(100);
    jest.useRealTimers();

    await promise;

    expect(MockPaymentsClient).toHaveBeenCalledWith({ environment: 'PRODUCTION' });
  });

  it('creates googlePayment with correct config', async () => {
    mockGooglePayClient.isReadyToPay.mockResolvedValue({ result: true });

    jest.useFakeTimers();
    const promise = initGooglePay(mockClient);
    jest.advanceTimersByTime(100);
    jest.useRealTimers();

    await promise;

    expect(mockGooglePaymentCreate).toHaveBeenCalledWith({
      client: mockClient,
      googleMerchantId: 'BCR2DN7T5DKNPSS5',
      googlePayVersion: 2,
    });
  });
});
