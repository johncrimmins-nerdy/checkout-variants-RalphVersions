import { expect, Page } from '@playwright/test';

/**
 * Fills the CVV field for a saved payment method
 *
 * @param page - Playwright Page instance
 * @param cvv - CVV code to enter (defaults to '123')
 */
export async function fillSavedPaymentCvv(page: Page, cvv: string = '123'): Promise<void> {
  console.log('🔒 Filling CVV for saved payment method...');

  // Wait for the saved CVV field container to be visible
  const cvvContainer = page.locator('#saved-cvv-field');
  await expect(cvvContainer).toBeVisible({ timeout: 15000 });

  // Wait for Braintree iframe to be attached
  console.log('⏳ Waiting for CVV hosted field iframe...');
  await page.locator('#saved-cvv-field iframe').waitFor({ state: 'attached', timeout: 30000 });

  // Wait for the submit button to be ready (not showing "Loading...")
  // The button shows "Loading..." while Braintree initializes, then changes to the actual text
  // Note: There are two submit buttons in DOM (one per form), we need the visible one (tabindex=0)
  console.log('⏳ Waiting for Braintree to initialize...');
  const submitButton = page.locator('[data-element_id="submit_credit_card"][tabindex="0"]');
  await expect(submitButton).not.toHaveText('Loading...', { timeout: 30000 });
  await expect(submitButton).toBeEnabled({ timeout: 5000 });
  console.log('✅ Braintree ready');

  // Fill the CVV in the iframe
  console.log('🔒 Entering CVV...');
  const cvvFrame = page.frameLocator('#saved-cvv-field iframe').first();
  const cvvInput = cvvFrame.getByRole('textbox', { name: 'CVV' });
  await cvvInput.waitFor({ state: 'visible', timeout: 15000 });
  await cvvInput.fill(cvv);

  console.log('✅ CVV filled successfully');
}
