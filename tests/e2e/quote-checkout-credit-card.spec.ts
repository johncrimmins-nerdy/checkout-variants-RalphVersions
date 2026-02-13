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
import { TEST_QUOTE_ID } from './test-config';

/**
 * E2E Tests: Lead Quote Checkout with Credit Card
 *
 * Tests the checkout flow when a user has a quote (from sales consultation).
 */

test.describe('Lead Quote Checkout - Credit Card', () => {
  test('completes quote checkout flow with credit card payment', async ({ page }) => {
    // Step 1: Navigate to checkout with quote ID
    console.log('🛒 Step 1: Navigating to checkout with quote ID...');
    await page.goto(`?q=${TEST_QUOTE_ID}`);
    await page.waitForLoadState('load');
    console.log('📍 Current URL:', page.url());

    // Check for invalid/expired quote error
    const invalidQuoteError = page.getByText(/invalid quote|expired/i);
    const hasQuoteError = await invalidQuoteError.isVisible({ timeout: 5000 }).catch(() => false);
    if (hasQuoteError) {
      throw new Error(
        `Quote ${TEST_QUOTE_ID} is invalid or expired. Please provide a valid quote ID.`
      );
    }

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
    console.log('💰 Quote pricing displayed');

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

    const currentUrl = page.url();
    const isSuccessRedirect =
      currentUrl.includes('account-creation') ||
      currentUrl.includes('success') ||
      !currentUrl.includes(`q=${TEST_QUOTE_ID}`);

    const hasSuccessState = await page
      .getByText(/thank you|success|completed|purchase/i)
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    expect(isSuccessRedirect || hasSuccessState).toBeTruthy();

    console.log('🎉 Quote checkout completed successfully!');
    console.log('📍 Final URL:', page.url());
  });

  test('verifies quote-specific pricing is displayed', async ({ page }) => {
    await page.goto(`?q=${TEST_QUOTE_ID}`);
    await page.waitForLoadState('load');

    // Check for invalid quote
    const invalidQuoteError = page.getByText(/invalid quote|expired/i);
    if (await invalidQuoteError.isVisible({ timeout: 3000 }).catch(() => false)) {
      throw new Error(`Quote ${TEST_QUOTE_ID} is invalid or expired.`);
    }

    // Handle authentication if required
    if (await requiresSignIn(page)) {
      await loginOnCheckoutPage(page);
    }

    // Verify pricing elements are displayed
    await expect(page.locator('text=/\\$\\d+/').first()).toBeVisible({ timeout: 10000 });

    console.log('✅ Quote pricing correctly displayed');
  });

  test('shows error for invalid quote ID', async ({ page }) => {
    // Use a UUID-shaped quote id to avoid backend validation differences across environments
    // (some environments may reject non-UUID ids before returning a user-friendly error state).
    const invalidQuoteId = '00000000-0000-0000-0000-000000000000';

    await page.goto(`?q=${invalidQuoteId}`);
    await page.waitForLoadState('load');

    // Invalid quote IDs can surface via different error states depending on which backend call fails:
    // - "Invalid Quote" (GraphQL CheckoutNotReady)
    // - "Item Not Found" (404 / not found)
    // - "Unable to Load Quote" (quote fetch error)
    const invalidQuoteHeading = page.getByRole('heading', { name: /Invalid Quote/i });
    const itemNotFoundHeading = page.getByRole('heading', { name: /Item Not Found/i });
    const unableToLoadQuoteHeading = page.getByRole('heading', { name: /Unable to Load Quote/i });

    const anyHeading = invalidQuoteHeading.or(itemNotFoundHeading).or(unableToLoadQuoteHeading);
    await expect(anyHeading).toBeVisible({ timeout: 15000 });

    console.log('✅ Invalid quote error displayed correctly');
  });

  test('shows a different error when no quote ID is provided', async ({ page }) => {
    // Navigate without any identifiers
    await page.goto('');
    await page.waitForLoadState('load');

    // Missing identifier is a distinct error state from an invalid quote id
    const missingInfoHeading = page.getByRole('heading', { name: /Missing Information/i });
    await expect(missingInfoHeading).toBeVisible({ timeout: 15000 });

    console.log('✅ Missing quote ID handled with Missing Information state');
  });

  test('shows error when quote ID is missing', async ({ page }) => {
    // Navigate without any identifiers
    await page.goto('');
    await page.waitForLoadState('load');

    // Should show an error or redirect
    const errorMessage = page.getByText(/missing|required|invalid/i);
    const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);

    // Or it might redirect to an error page
    const currentUrl = page.url();
    const isErrorState = hasError || currentUrl.includes('error');

    expect(isErrorState || !currentUrl.includes('checkout')).toBeTruthy();

    console.log('✅ Missing quote ID handled correctly');
  });
});
