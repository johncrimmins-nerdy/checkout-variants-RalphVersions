/**
 * Tests for PurchaseRetryManager
 */

import { PurchaseRetryManager } from './purchase-retry-manager';

describe('PurchaseRetryManager', () => {
  let retryManager: PurchaseRetryManager;

  beforeEach(() => {
    retryManager = new PurchaseRetryManager();
  });

  describe('initial state', () => {
    it('should have retry count of 0', () => {
      expect(retryManager.getRetryCount()).toBe(0);
    });

    it('should allow retry initially', () => {
      expect(retryManager.canRetry()).toBe(true);
    });
  });

  describe('canRetry', () => {
    it('should return true when retry count is 0', () => {
      expect(retryManager.canRetry()).toBe(true);
    });

    it('should return false after max retries reached', () => {
      retryManager.incrementRetryCount();
      expect(retryManager.canRetry()).toBe(false);
    });
  });

  describe('incrementRetryCount', () => {
    it('should increment the retry count', () => {
      expect(retryManager.getRetryCount()).toBe(0);

      retryManager.incrementRetryCount();
      expect(retryManager.getRetryCount()).toBe(1);
    });

    it('should allow multiple increments', () => {
      retryManager.incrementRetryCount();
      retryManager.incrementRetryCount();
      expect(retryManager.getRetryCount()).toBe(2);
    });
  });

  describe('reset', () => {
    it('should reset retry count to 0', () => {
      retryManager.incrementRetryCount();
      expect(retryManager.getRetryCount()).toBe(1);

      retryManager.reset();
      expect(retryManager.getRetryCount()).toBe(0);
    });

    it('should allow retries after reset', () => {
      retryManager.incrementRetryCount();
      expect(retryManager.canRetry()).toBe(false);

      retryManager.reset();
      expect(retryManager.canRetry()).toBe(true);
    });
  });

  describe('retry flow', () => {
    it('should allow exactly one retry before exhausting', () => {
      // Initial state - can retry
      expect(retryManager.canRetry()).toBe(true);

      // First retry - now exhausted
      retryManager.incrementRetryCount();
      expect(retryManager.canRetry()).toBe(false);
      expect(retryManager.getRetryCount()).toBe(1);
    });

    it('should support full purchase retry workflow', () => {
      // Start new purchase
      retryManager.reset();
      expect(retryManager.canRetry()).toBe(true);

      // First attempt fails with retryable error
      // Check if we can retry
      if (retryManager.canRetry()) {
        retryManager.incrementRetryCount();
      }
      expect(retryManager.getRetryCount()).toBe(1);

      // Second attempt - no more retries available
      expect(retryManager.canRetry()).toBe(false);

      // New purchase flow - reset
      retryManager.reset();
      expect(retryManager.canRetry()).toBe(true);
      expect(retryManager.getRetryCount()).toBe(0);
    });
  });
});
