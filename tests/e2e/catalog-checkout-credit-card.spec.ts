import { expect, test } from '@playwright/test';

import {
  assertRecaptchaTokenPresent,
  fillCreditCard,
  handleCreditCardButton,
  handleTermsCheckbox,
  interceptAndVerifyRecaptchaToken,
  loginOnCheckoutPage,
  requiresSignIn,
  submitCreditCardForm,
} from './helpers';
import { TEST_CATALOG_ITEM_ID, TEST_DECLINE_QUOTE_ID } from './test-config';

/**
 * E2E Tests: Catalog Checkout with Credit Card
 *
 * Tests the checkout flow when a user purchases directly from a catalog item.
 * Uses authenticated test user to complete the full checkout flow.
 */

test.describe('Catalog Checkout - Credit Card', () => {
  test('completes checkout flow with credit card payment', async ({ page }) => {
    // Step 1: Navigate to checkout with catalog item
    console.log('🛒 Step 1: Navigating to checkout page...');
    await page.goto(`?catalogItemId=${TEST_CATALOG_ITEM_ID}`);
    await page.waitForLoadState('load');
    console.log('📍 Current URL:', page.url());

    // Step 2: Handle authentication if required
    if (await requiresSignIn(page)) {
      console.log('🔐 Step 2: Signing in...');
      await loginOnCheckoutPage(page);
    }

    // Step 3: Verify checkout form is ready
    const checkoutForm = page.locator('#Checkout-Form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });
    console.log('✅ Checkout form loaded');

    // Verify pricing is displayed
    await expect(page.locator('text=/\\$\\d+/').first()).toBeVisible({ timeout: 5000 });
    console.log('💰 Pricing information displayed');

    // Step 4: Accept terms and conditions
    console.log('📋 Step 4: Accepting terms...');
    await handleTermsCheckbox(page);

    // Step 5: Select credit card payment method
    console.log('💳 Step 5: Selecting credit card payment...');
    await handleCreditCardButton(page);

    // Step 6: Fill in credit card information
    console.log('✏️ Step 6: Filling payment details...');
    await fillCreditCard(page);

    // Step 7: Set up reCAPTCHA token verification before submitting
    console.log('🔐 Step 7: Setting up reCAPTCHA verification...');
    const recaptchaTokenPromise = interceptAndVerifyRecaptchaToken(page);

    // Step 8: Submit the form
    console.log('📤 Step 8: Submitting payment...');
    await submitCreditCardForm(page);

    // Step 9: Verify reCAPTCHA token was present in the request
    console.log('🔐 Step 9: Verifying reCAPTCHA token...');
    await assertRecaptchaTokenPresent(recaptchaTokenPromise);

    // Step 10: Verify success
    console.log('🔍 Step 10: Verifying success...');
    await page.waitForLoadState('load');

    // Check for success state
    const currentUrl = page.url();
    const isSuccessRedirect =
      currentUrl.includes('account-creation') ||
      currentUrl.includes('success') ||
      !currentUrl.includes(`catalogItemId=${TEST_CATALOG_ITEM_ID}`);

    const hasSuccessState = await page
      .getByText(/thank you|success|completed|purchase/i)
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    expect(isSuccessRedirect || hasSuccessState).toBeTruthy();

    console.log('🎉 Checkout completed successfully!');
    console.log('📍 Final URL:', page.url());
  });

  test('shows error when terms not accepted', async ({ page }) => {
    // Navigate to checkout
    await page.goto(`?catalogItemId=${TEST_CATALOG_ITEM_ID}`);
    await page.waitForLoadState('load');

    // Handle authentication if required
    if (await requiresSignIn(page)) {
      await loginOnCheckoutPage(page);
    }

    // Wait for checkout form
    const checkoutForm = page.locator('#Checkout-Form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });

    // Check if there's a saved payment method - if so, we need to switch to payment selection first
    const savedPaymentMethod = page.locator('#saved-cvv-field');
    const hasSavedPayment = await savedPaymentMethod
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (hasSavedPayment) {
      // Click "Use a different payment method" to show payment selection
      const differentMethodLink = page.locator('[data-element_id="change_payment_method"]').first();
      await differentMethodLink.click();

      // Wait for payment selection to appear
      await expect(page.getByRole('heading', { name: /select your payment method/i })).toBeVisible({
        timeout: 10000,
      });
    }

    // Try to click credit card WITHOUT accepting terms first
    const creditCardButton = page.locator('[data-element_id="credit_card"]').first();
    await expect(creditCardButton).toBeVisible({ timeout: 10000 });
    await creditCardButton.click();

    // Should show error message about terms
    await expect(page.getByText(/accept the terms/i)).toBeVisible({ timeout: 5000 });
    console.log('✅ Terms validation error shown correctly');
  });

  test('shows validation error for invalid card number', async ({ page }) => {
    // Navigate to checkout
    await page.goto(`?catalogItemId=${TEST_CATALOG_ITEM_ID}`);
    await page.waitForLoadState('load');

    // Handle authentication if required
    if (await requiresSignIn(page)) {
      await loginOnCheckoutPage(page);
    }

    // Wait for checkout form
    const checkoutForm = page.locator('#Checkout-Form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });

    // Accept terms
    await handleTermsCheckbox(page);

    // Select credit card
    await handleCreditCardButton(page);

    // Fill with invalid card number (fails Luhn check)
    await fillCreditCard(page, {
      cardNumber: '1234567890123456', // Invalid - fails Luhn algorithm
    });

    // Try to submit - Braintree should prevent submission or show validation error
    const submitButton = page.getByRole('button', { name: /complete your purchase/i });
    await submitButton.click();

    // Verify we stayed on checkout (invalid card should block submission)
    await expect(checkoutForm).toBeVisible({ timeout: 5000 });
    console.log('✅ Invalid card validation handled correctly - submission blocked');
  });

  /**
   * Tests processor decline handling using a quote with a specific amount
   * configured to trigger Braintree's decline response.
   *
   * Uses quote ID: e2eb6b9f-1c1d-4cd0-83df-caf6a8ca6c90
   * This quote has an amount in the $2000-$3000 range which triggers
   * Braintree processor decline codes in sandbox.
   *
   * @see https://developer.paypal.com/braintree/docs/reference/general/testing
   */
  test('shows error for processor declined card', async ({ page }) => {
    console.log('🚫 Testing processor decline scenario...');
    console.log('📋 Using decline quote ID:', TEST_DECLINE_QUOTE_ID);

    // Use quote-based checkout with amount configured for decline
    await page.goto(`?q=${TEST_DECLINE_QUOTE_ID}`);
    await page.waitForLoadState('load');

    if (await requiresSignIn(page)) {
      await loginOnCheckoutPage(page);
    }

    const checkoutForm = page.locator('#Checkout-Form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });
    console.log('✅ Checkout form loaded');

    await handleTermsCheckbox(page);
    await handleCreditCardButton(page);

    // Use valid test card - the decline is triggered by the quote amount
    await fillCreditCard(page);

    console.log('📤 Submitting payment (expecting decline)...');
    const submitButton = page.getByRole('button', { name: /complete your purchase/i });
    await submitButton.click();

    const processingOverlay = page.getByText('Processing payment...');
    await expect(processingOverlay).toBeVisible({ timeout: 10000 });
    await expect(processingOverlay).toBeHidden({ timeout: 60000 });

    // Should stay on checkout with decline error (not redirect to success)
    const currentUrl = page.url();
    const stillOnCheckout = currentUrl.includes('/checkout') && !currentUrl.includes('login');

    const hasDeclineError = await page
      .getByText(/declined|failed|error|unsuccessful|could not be processed|unable to complete/i)
      .isVisible()
      .catch(() => false);

    console.log('📍 Current URL:', currentUrl);
    console.log('🔍 Still on checkout:', stillOnCheckout);
    console.log('🔍 Has decline error:', hasDeclineError);

    expect(
      stillOnCheckout && hasDeclineError,
      'Processor declined card should show error and stay on checkout page'
    ).toBeTruthy();

    console.log('✅ Processor decline handled correctly - error shown to user');
  });
});
