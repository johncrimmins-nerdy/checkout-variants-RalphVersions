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
import { TEST_CATALOG_ITEM_ID, TEST_CLIENT_ID, TEST_QUOTE_ID } from './test-config';

/**
 * E2E Tests: Client Quote Checkout
 *
 * Tests checkout flows for existing clients with quotes.
 */

test.describe('Client Quote Checkout', () => {
  test('loads checkout for client with quote', async ({ page }) => {
    // Navigate with both client ID and quote ID
    await page.goto(`?c=${TEST_CLIENT_ID}&q=${TEST_QUOTE_ID}`);
    await page.waitForLoadState('load');
    console.log('📍 Current URL:', page.url());

    // Check for invalid quote error
    const invalidQuoteError = page.getByText(/invalid quote|expired/i);
    if (await invalidQuoteError.isVisible({ timeout: 5000 }).catch(() => false)) {
      throw new Error('Quote is invalid or expired. Please provide a valid quote ID.');
    }

    // Handle authentication if required
    if (await requiresSignIn(page)) {
      console.log('🔐 Signing in...');
      await loginOnCheckoutPage(page);
    }

    // Verify checkout loaded
    const checkoutForm = page.locator('#Checkout-Form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });

    // Verify pricing is displayed
    await expect(page.locator('text=/\\$\\d+/').first()).toBeVisible({ timeout: 5000 });

    console.log('✅ Client quote checkout loaded successfully');
  });

  test('handles account mismatch gracefully', async ({ page }) => {
    // Test that an invalid client ID doesn't break the checkout
    const mismatchedClientId = '00000000-0000-0000-0000-000000000000';

    await page.goto(`?c=${mismatchedClientId}&q=${TEST_QUOTE_ID}`);
    await page.waitForLoadState('load');

    // The system should handle this gracefully - either:
    // 1. Show an error
    // 2. Require sign-in
    // 3. Or proceed with the quote (ignoring invalid client ID)
    const errorMessage = page.getByRole('heading', { name: /Invalid|Error/i });
    const signInForm = page.getByRole('heading', { name: /Sign in/i });
    const paymentMethods = page.getByRole('heading', { name: /Select your payment method/i });

    const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
    const requiresAuth = await signInForm.isVisible({ timeout: 5000 }).catch(() => false);
    const hasPaymentOptions = await paymentMethods.isVisible({ timeout: 5000 }).catch(() => false);

    // Any of these outcomes is acceptable - page didn't crash
    expect(hasError || requiresAuth || hasPaymentOptions).toBeTruthy();

    console.log('✅ Account mismatch handled gracefully');
  });
});

test.describe('Client Catalog Item Checkout', () => {
  test('completes checkout for client with catalog item', async ({ page }) => {
    // Step 1: Navigate with client ID and catalog item
    console.log('🛒 Step 1: Navigating to checkout...');
    await page.goto(`?c=${TEST_CLIENT_ID}&catalogItemId=${TEST_CATALOG_ITEM_ID}`);
    await page.waitForLoadState('load');
    console.log('📍 Current URL:', page.url());

    // Step 2: Handle authentication if required
    if (await requiresSignIn(page)) {
      console.log('🔐 Step 2: Signing in...');
      await loginOnCheckoutPage(page);
    }

    // Step 3: Verify checkout form loaded
    const checkoutForm = page.locator('#Checkout-Form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });
    console.log('✅ Checkout form loaded');

    // Verify pricing is displayed
    await expect(page.locator('text=/\\$\\d+/').first()).toBeVisible({ timeout: 5000 });
    console.log('💰 Pricing displayed');

    // Step 4: Accept terms
    console.log('📋 Step 4: Accepting terms...');
    await handleTermsCheckbox(page);

    // Step 5: Select credit card
    console.log('💳 Step 5: Selecting credit card...');
    await handleCreditCardButton(page);

    // Step 6: Fill credit card
    console.log('✏️ Step 6: Filling payment details...');
    await fillCreditCard(page);

    // Step 7: Set up reCAPTCHA token verification before submitting
    console.log('🔐 Step 7: Setting up reCAPTCHA verification...');
    const recaptchaTokenPromise = interceptAndVerifyRecaptchaToken(page);

    // Step 8: Submit
    console.log('📤 Step 8: Submitting payment...');
    await submitCreditCardForm(page);

    // Step 9: Verify reCAPTCHA token was present in the request
    console.log('🔐 Step 9: Verifying reCAPTCHA token...');
    await assertRecaptchaTokenPresent(recaptchaTokenPromise);

    // Step 10: Verify success
    console.log('🔍 Step 10: Verifying success...');
    await page.waitForLoadState('load');

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

    console.log('🎉 Client checkout completed successfully!');
  });

  test('checkout works with only client ID and catalog item', async ({ page }) => {
    await page.goto(`?c=${TEST_CLIENT_ID}&catalogItemId=${TEST_CATALOG_ITEM_ID}`);
    await page.waitForLoadState('load');

    // Handle authentication if required
    if (await requiresSignIn(page)) {
      await loginOnCheckoutPage(page);
    }

    // Verify checkout loaded
    const checkoutForm = page.locator('#Checkout-Form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });

    // Verify pricing
    await expect(page.locator('text=/\\$\\d+/').first()).toBeVisible({ timeout: 5000 });

    console.log('✅ Client + catalog item checkout loads correctly');
  });

  test('catalog item checkout works without client ID', async ({ page }) => {
    // Just catalog item, no client ID
    await page.goto(`?catalogItemId=${TEST_CATALOG_ITEM_ID}`);
    await page.waitForLoadState('load');

    // Handle authentication if required
    if (await requiresSignIn(page)) {
      await loginOnCheckoutPage(page);
    }

    // Verify checkout loaded (either form or auth)
    const checkoutForm = page.locator('#Checkout-Form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });

    // Verify pricing
    await expect(page.locator('text=/\\$\\d+/').first()).toBeVisible({ timeout: 5000 });

    console.log('✅ Catalog item checkout loads correctly without client ID');
  });
});
