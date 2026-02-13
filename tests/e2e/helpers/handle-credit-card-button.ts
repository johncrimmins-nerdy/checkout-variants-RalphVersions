import { expect, Page } from '@playwright/test';

/**
 * Clicks the credit card button to show the credit card form
 *
 * If a saved payment method is detected, automatically switches to new card form.
 * This ensures consistent behavior with the full credit card form flow.
 *
 * @param page - Playwright Page instance
 * @returns Always returns false (using new card form)
 */
export async function handleCreditCardButton(page: Page): Promise<boolean> {
  console.log('💳 Looking for credit card payment option...');

  // Check if saved payment method is showing - switch to new card form
  if (await hasSavedPaymentMethod(page)) {
    console.log('📋 Saved payment method detected, switching to new card...');
    await switchToNewPaymentMethod(page);
    return false;
  }

  // Check if already on new credit card form
  const creditCardForm = page.locator('form').filter({ hasText: 'Pay with credit card' });
  const isFormVisible = await creditCardForm.isVisible({ timeout: 2000 }).catch(() => false);

  if (isFormVisible) {
    console.log('✅ Already on new credit card form');
    return false;
  }

  // The credit card button has data-element_id="credit_card"
  // Use first() to handle any duplicates in DOM
  const creditCardButton = page.locator('[data-element_id="credit_card"]').first();

  // Wait for and click the credit card button
  await expect(creditCardButton).toBeVisible({ timeout: 10000 });
  console.log('🖱️ Clicking credit card button...');
  await creditCardButton.click();

  // After clicking, check which form appeared
  // Could be new card form OR saved payment method form
  const newCardFormAppeared = await creditCardForm.isVisible({ timeout: 5000 }).catch(() => false);

  if (newCardFormAppeared) {
    console.log('✅ New credit card form is now visible');
    return false;
  }

  // Check if saved payment method appeared instead
  if (await hasSavedPaymentMethod(page)) {
    console.log('📋 Saved payment method appeared, switching to new card...');
    await switchToNewPaymentMethod(page);
    return false;
  }

  // Wait for credit card form
  await expect(creditCardForm).toBeVisible({ timeout: 10000 });
  console.log('✅ Credit card form is now visible');
  return false;
}

/**
 * Checks if a saved payment method form is visible
 *
 * @param page - Playwright Page instance
 * @returns True if saved payment method form is visible
 */
export async function hasSavedPaymentMethod(page: Page): Promise<boolean> {
  // Check for saved payment method indicators:
  // - Card display with "ending in" text
  // - CVV-only form (saved-cvv-field)
  const savedCvvField = page.locator('#saved-cvv-field');
  const endingInText = page.getByText(/ending in \d{4}/i);

  const hasSavedCvv = await savedCvvField.isVisible({ timeout: 2000 }).catch(() => false);
  const hasEndingIn = await endingInText.isVisible({ timeout: 2000 }).catch(() => false);

  return hasSavedCvv || hasEndingIn;
}

/**
 * Clicks "Use a different payment method" link to switch from saved payment to new card form
 *
 * @param page - Playwright Page instance
 */
async function switchToNewPaymentMethod(page: Page): Promise<void> {
  console.log('🔄 Switching from saved payment to new card form...');

  // Click the visible "different payment method" button (use first() to handle duplicates)
  const differentMethodLink = page.locator('[data-element_id="change_payment_method"]').first();
  await expect(differentMethodLink).toBeVisible({ timeout: 5000 });
  await differentMethodLink.click();

  // Wait for payment method selection to appear
  const selectPaymentHeader = page.getByRole('heading', { name: /select your payment method/i });
  await expect(selectPaymentHeader).toBeVisible({ timeout: 10000 });
  console.log('✅ Payment method selection visible');

  // Click the credit card button (use first() to handle any duplicates)
  const creditCardButton = page.locator('[data-element_id="credit_card"]').first();
  await expect(creditCardButton).toBeVisible({ timeout: 10000 });

  console.log('🖱️ Clicking credit card button...');
  await creditCardButton.click();

  // Wait for new credit card form
  const creditCardForm = page.locator('form').filter({ hasText: 'Pay with credit card' });
  await expect(creditCardForm).toBeVisible({ timeout: 10000 });
  console.log('✅ Switched to new credit card form');
}
