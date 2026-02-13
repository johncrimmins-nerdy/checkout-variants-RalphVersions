/**
 * Tests for reCAPTCHA Enterprise service
 */

import { _resetForTesting, executeRecaptcha, isRecaptchaReady } from './recaptcha-service';

// Mock the RECAPTCHA_SITE_KEY
jest.mock('@/lib/constants/api-keys', () => ({
  RECAPTCHA_SITE_KEY: 'test-site-key',
}));

// Type for mock grecaptcha enterprise object
interface MockGrecaptchaEnterprise {
  grecaptcha?: {
    enterprise: {
      execute: jest.Mock;
      ready: jest.Mock;
    };
  };
}

describe('executeRecaptcha', () => {
  beforeEach(() => {
    _resetForTesting();
    delete (window as { grecaptcha?: unknown }).grecaptcha;
  });

  afterEach(() => {
    delete (window as { grecaptcha?: unknown }).grecaptcha;
  });

  it('should execute reCAPTCHA and return token', async () => {
    const mockToken = 'recaptcha-token-123';
    const mockExecute = jest.fn().mockResolvedValue(mockToken);
    const mockReady = jest.fn((callback: () => void) => callback());

    (window as MockGrecaptchaEnterprise).grecaptcha = {
      enterprise: {
        execute: mockExecute,
        ready: mockReady,
      },
    };

    const token = await executeRecaptcha('checkout');

    expect(token).toBe(mockToken);
    expect(mockExecute).toHaveBeenCalledWith('test-site-key', { action: 'checkout' });
  });

  it('should use correct action for different operations', async () => {
    const mockExecute = jest.fn().mockResolvedValue('token');
    const mockReady = jest.fn((callback: () => void) => callback());

    (window as MockGrecaptchaEnterprise).grecaptcha = {
      enterprise: {
        execute: mockExecute,
        ready: mockReady,
      },
    };

    await executeRecaptcha('purchase');
    expect(mockExecute).toHaveBeenCalledWith('test-site-key', { action: 'purchase' });

    await executeRecaptcha('login');
    expect(mockExecute).toHaveBeenCalledWith('test-site-key', { action: 'login' });
  });

  it('should throw if grecaptcha.enterprise.execute fails', async () => {
    const mockReady = jest.fn((callback: () => void) => callback());
    const mockExecute = jest.fn().mockRejectedValue(new Error('reCAPTCHA error'));

    (window as MockGrecaptchaEnterprise).grecaptcha = {
      enterprise: {
        execute: mockExecute,
        ready: mockReady,
      },
    };

    await expect(executeRecaptcha('checkout')).rejects.toThrow('Failed to execute reCAPTCHA');
  });

  it('should cache the ready promise and reuse it', async () => {
    const mockExecute = jest.fn().mockResolvedValue('token');
    const mockReady = jest.fn((callback: () => void) => callback());

    (window as MockGrecaptchaEnterprise).grecaptcha = {
      enterprise: {
        execute: mockExecute,
        ready: mockReady,
      },
    };

    // Call multiple times in parallel
    const [token1, token2, token3] = await Promise.all([
      executeRecaptcha('action1'),
      executeRecaptcha('action2'),
      executeRecaptcha('action3'),
    ]);

    expect(token1).toBe('token');
    expect(token2).toBe('token');
    expect(token3).toBe('token');

    // ready() should only be called once (cached promise reused)
    expect(mockReady).toHaveBeenCalledTimes(1);
  });
});

describe('executeRecaptcha with delayed loading', () => {
  beforeEach(() => {
    _resetForTesting();
    delete (window as { grecaptcha?: unknown }).grecaptcha;
    jest.useFakeTimers();
  });

  afterEach(() => {
    delete (window as { grecaptcha?: unknown }).grecaptcha;
    jest.useRealTimers();
  });

  it('should wait for grecaptcha to become available', async () => {
    const mockExecute = jest.fn().mockResolvedValue('token');
    const mockReady = jest.fn((callback: () => void) => callback());

    // Simulate grecaptcha loading after a delay
    setTimeout(() => {
      (window as MockGrecaptchaEnterprise).grecaptcha = {
        enterprise: {
          execute: mockExecute,
          ready: mockReady,
        },
      };
    }, 500);

    const executePromise = executeRecaptcha('test');

    // Advance timers
    await jest.advanceTimersByTimeAsync(600);

    const token = await executePromise;
    expect(token).toBe('token');
  });

  it('should timeout if grecaptcha never loads', async () => {
    const executePromise = executeRecaptcha('test');

    // Advance past timeout
    jest.advanceTimersByTime(11000);

    await expect(executePromise).rejects.toThrow();
  });
});

describe('isRecaptchaReady', () => {
  beforeEach(() => {
    _resetForTesting();
    delete (window as { grecaptcha?: unknown }).grecaptcha;
  });

  it('should return false initially', () => {
    expect(isRecaptchaReady()).toBe(false);
  });

  it('should return true after executeRecaptcha succeeds', async () => {
    const mockReady = jest.fn((callback: () => void) => callback());

    (window as MockGrecaptchaEnterprise).grecaptcha = {
      enterprise: {
        execute: jest.fn().mockResolvedValue('token'),
        ready: mockReady,
      },
    };

    await executeRecaptcha('test');

    expect(isRecaptchaReady()).toBe(true);
  });
});

describe('executeRecaptcha with missing site key', () => {
  beforeEach(() => {
    _resetForTesting();
    jest.resetModules();
  });

  it('should throw if site key is not configured', async () => {
    jest.doMock('@/lib/constants/api-keys', () => ({
      RECAPTCHA_SITE_KEY: '',
    }));

    const { executeRecaptcha: freshExecute } = await import('./recaptcha-service');

    await expect(freshExecute('test')).rejects.toThrow('reCAPTCHA site key not configured');
  });
});
