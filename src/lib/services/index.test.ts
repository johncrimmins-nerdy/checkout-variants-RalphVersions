import { EventEmitter, executeRecaptcha, isRecaptchaReady, purchaseRetryManager } from './index';

describe('services index', () => {
  it('exports EventEmitter', () => {
    expect(EventEmitter).toBeDefined();
    expect(typeof EventEmitter).toBe('function');
  });

  it('exports purchaseRetryManager', () => {
    expect(purchaseRetryManager).toBeDefined();
    expect(typeof purchaseRetryManager).toBe('object');
  });

  it('exports executeRecaptcha', () => {
    expect(executeRecaptcha).toBeDefined();
    expect(typeof executeRecaptcha).toBe('function');
  });

  it('exports isRecaptchaReady', () => {
    expect(isRecaptchaReady).toBeDefined();
    expect(typeof isRecaptchaReady).toBe('function');
  });
});
