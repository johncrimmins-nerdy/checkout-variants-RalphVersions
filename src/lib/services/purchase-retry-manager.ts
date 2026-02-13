/**
 * Purchase Retry Manager
 * Handles automatic retry logic for failed purchases with retryable errors
 * Ported from originals/checkout-ts/src/components/express-checkout/helpers/common/make-purchase-retry-manager.ts
 */

class PurchaseRetryManager {
  private readonly maxRetries = 1;
  private retryCount = 0;

  /**
   * Check if we can retry the purchase
   * Returns true if we haven't exhausted our retry limit
   */
  public canRetry(): boolean {
    return this.retryCount < this.maxRetries;
  }

  /**
   * Get the current retry count
   */
  public getRetryCount(): number {
    return this.retryCount;
  }

  /**
   * Increment the retry counter
   * Call this before attempting a retry
   */
  public incrementRetryCount(): void {
    this.retryCount++;
  }

  /**
   * Reset the retry counter
   * Call this when starting a new purchase flow
   */
  public reset(): void {
    this.retryCount = 0;
  }
}

// Export singleton instance
export const purchaseRetryManager = new PurchaseRetryManager();

// Also export class for testing
export { PurchaseRetryManager };
