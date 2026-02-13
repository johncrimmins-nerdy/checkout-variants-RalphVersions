import { expect, Page } from '@playwright/test';

/**
 * Submits the credit card form
 *
 * Handles both new credit card form ("complete your purchase" button) and
 * saved payment method form ("Complete your purchase" button).
 * Waits for Braintree to finish initializing before submitting.
 *
 * @param page - Playwright Page instance
 */
export async function submitCreditCardForm(page: Page): Promise<void> {
  console.log('📤 Submitting credit card form...');

  // The submit button has data-element_id="submit_credit_card"
  // Use tabindex to find the active/visible button (multiple exist in DOM due to visibility toggling)
  // The active form's button has tabindex=0, the hidden one has tabindex=-1
  const submitButton = page.locator('[data-element_id="submit_credit_card"]:not([tabindex="-1"])');

  // Wait for Braintree to finish initializing (button stops showing "Loading...")
  console.log('⏳ Waiting for submit button to be ready...');
  await expect(submitButton).not.toHaveText('Loading...', { timeout: 30000 });
  await expect(submitButton).toBeVisible({ timeout: 5000 });
  await expect(submitButton).toBeEnabled({ timeout: 5000 });
  console.log('✅ Submit button ready');

  console.log('🖱️ Clicking submit button...');
  await submitButton.click();

  // Wait for processing overlay to appear
  const processingOverlay = page.getByText('Processing payment...');
  await expect(processingOverlay).toBeVisible({ timeout: 10000 });
  console.log('⏳ Payment processing...');

  // Wait for processing to complete (overlay disappears or page navigates)
  await expect(processingOverlay).toBeHidden({ timeout: 60000 });

  console.log('✅ Credit card form submitted');
}
