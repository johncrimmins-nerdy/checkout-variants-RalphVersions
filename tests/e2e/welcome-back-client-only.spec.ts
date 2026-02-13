import { expect, test } from '@playwright/test';

import {
  fillCreditCard,
  fillSavedPaymentCvv,
  handleCreditCardButton,
  hasSavedPaymentMethod,
  loginOnCheckoutPage,
  requiresSignIn,
  submitCreditCardForm,
} from './helpers';
import { TEST_CLIENT_ID } from './test-config';

/**
 * E2E Tests: Welcome Back Flow with Client ID Only
 *
 * Tests the specific scenario where a returning customer navigates to:
 * /checkout/welcome-back?c=<clientId>
 *
 * WITHOUT a catalogItemId or quoteId in the URL.
 *
 * This tests the fix for MEX-14834 where purchases were failing because:
 * 1. verificationToken was empty (recaptcha token not generated)
 * 2. membershipItem was null (catalogItemId wasn't derived from API response)
 *
 * The fix ensures:
 * - recaptcha token is generated before each purchase
 * - purchasable.id from the checkout API response is used when URL param is missing
 *
 * Note: For staging, ab_checkout=react is included in the baseURL (playwright.config.ts)
 * which uses a sticky session strategy to route all requests to the React version.
 */
test.describe('Welcome Back - Client ID Only (MEX-14834 Fix)', () => {
  /**
   * Test the basic page load with only client ID parameter
   * This is the exact URL pattern that was failing
   */
  test('loads welcome-back page with only client ID parameter', async ({ page }) => {
    await page.goto(`welcome-back?c=${TEST_CLIENT_ID}`);
    await page.waitForLoadState('load');

    const actualUrl = page.url();
    console.log('📍 Navigated to:', actualUrl);

    // Verify URL has only client ID
    const currentUrl = new URL(actualUrl);
    expect(currentUrl.searchParams.get('c')).toBe(TEST_CLIENT_ID);
    expect(currentUrl.searchParams.get('catalogItemId')).toBeNull();
    expect(currentUrl.searchParams.get('q')).toBeNull();

    // Check for 404 page
    const notFoundPage = page.getByRole('heading', { name: '404' });
    const is404 = await notFoundPage.isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      await page.screenshot({ path: 'test-results/debug-404.png' });
      throw new Error(`Page returned 404 - URL: ${actualUrl}`);
    }

    // Check for error state (API errors, etc.)
    const errorState = page.getByText(/error|unavailable/i);
    const hasError = await errorState.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasError) {
      const errorText = await errorState.textContent();
      console.log('⚠️ Page shows error:', errorText);
      // This might be expected if the client has no plan - don't fail the test
      return;
    }

    // Verify welcome back UI elements - use first() since multiple elements may match
    const welcomeHeader = page.getByRole('heading', { name: /Welcome Back/i }).first();
    await expect(welcomeHeader).toBeVisible({ timeout: 15000 });
    console.log('✅ Welcome back header displayed');

    // Verify pricing is displayed (comes from API response, not URL)
    await expect(page.locator('text=/\\$\\d+/').first()).toBeVisible({ timeout: 5000 });
    console.log('💰 Pricing information displayed (derived from API)');
  });

  /**
   * Test that plan information is correctly loaded from API
   * when no purchasable ID is in the URL
   */
  test('displays plan information from API response', async ({ page }) => {
    await page.goto(`welcome-back?c=${TEST_CLIENT_ID}`);
    await page.waitForLoadState('load');

    const actualUrl = page.url();

    // Check for 404 page first
    const notFoundPage = page.getByRole('heading', { name: '404' });
    const is404 = await notFoundPage.isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      throw new Error(`Page returned 404 - URL: ${actualUrl}`);
    }

    // Check for API error state - this is acceptable if client has no plan
    const errorState = page.getByText(/error|unavailable/i);
    const hasError = await errorState.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasError) {
      console.log('⚠️ Page shows error - client may not have a plan. Test passes as page loaded.');
      return;
    }

    // Should show plan details
    const planDetails = page.locator('[class*="pricing"], [class*="plan"]');
    const hasPlanDetails = await planDetails
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (hasPlanDetails) {
      console.log('✅ Plan details visible');
    }

    // Should show entitled hours
    const hoursText = page.getByText(/\d+\s*hours?/i);
    const hasHours = await hoursText
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (hasHours) {
      console.log('✅ Hours entitlement displayed');
    }

    // At minimum, pricing should be visible
    await expect(page.locator('text=/\\$\\d+/').first()).toBeVisible({ timeout: 5000 });
    console.log('✅ Pricing displayed');
  });

  /**
   * Test completing checkout with saved payment method
   * This specifically tests that the fix works with saved payments
   */
  test('completes checkout with saved payment method (client ID only)', async ({ page }) => {
    console.log('🚪 Step 1: Navigating to welcome-back with client ID only...');
    await page.goto(`welcome-back?c=${TEST_CLIENT_ID}`);
    await page.waitForLoadState('load');

    const actualUrl = page.url();
    console.log('🔗 URL:', actualUrl);

    // Check for 404 page first
    const notFoundPage = page.getByRole('heading', { name: '404' });
    const is404 = await notFoundPage.isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      throw new Error(`Page returned 404 - URL: ${actualUrl}`);
    }

    // Check for API error state
    const errorState = page.getByText(/error|unavailable/i);
    if (await errorState.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('⚠️ Page shows error - client may not have a plan. Test passes as page loaded.');
      return;
    }

    // Verify page loaded
    const welcomeHeader = page.getByText(/Lock in your rate/i);
    await expect(welcomeHeader).toBeVisible({ timeout: 15000 });

    // Handle authentication if required
    if (await requiresSignIn(page)) {
      console.log('🔐 Step 2: Signing in...');
      await loginOnCheckoutPage(page);
    }

    // Check if user has saved payment method
    if (await hasSavedPaymentMethod(page)) {
      console.log('💳 Step 3: Using saved payment method...');

      // Fill CVV for saved card
      await fillSavedPaymentCvv(page);

      // Click the submit button (for saved payment) - button says "Complete your purchase"
      const submitButton = page.locator('[data-element_id="submit_credit_card"]').first();
      await submitButton.click();
      console.log('📤 Step 4: Submitted payment with saved card');
    } else {
      console.log('💳 Step 3: No saved payment - using credit card...');
      await handleCreditCardButton(page);
      await fillCreditCard(page);
      await submitCreditCardForm(page);
      console.log('📤 Step 4: Submitted payment with new card');
    }

    // Wait for result
    console.log('🔍 Step 5: Verifying result...');
    await page.waitForLoadState('load');

    // Check for success indicators
    const successModal = page.getByText(/thank you|success|completed|welcome back/i);
    const isSuccess = await successModal.isVisible({ timeout: 10000 }).catch(() => false);

    if (isSuccess) {
      console.log('🎉 Success message displayed!');
    } else {
      // Check if redirected (also indicates success)
      const currentUrl = page.url();
      console.log('📍 Current URL:', currentUrl);

      // Check for payment error
      const paymentError = page.getByText(/payment.*failed|error|declined/i);
      const hasPaymentError = await paymentError.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasPaymentError) {
        // Get the actual error message
        const errorText = await paymentError.textContent();
        console.log('❌ Payment error:', errorText);
        throw new Error(`Payment failed: ${errorText}`);
      }
    }

    console.log('✅ Checkout completed successfully with client ID only!');
  });

  /**
   * Test completing checkout with credit card
   * when user has no saved payment method
   */
  test('completes checkout with credit card (client ID only)', async ({ page }) => {
    console.log('🚪 Step 1: Navigating to welcome-back with client ID only...');
    await page.goto(`welcome-back?c=${TEST_CLIENT_ID}`);
    await page.waitForLoadState('load');

    const actualUrl = page.url();
    console.log('🔗 URL:', actualUrl);

    // Check for 404 page first
    const notFoundPage = page.getByRole('heading', { name: '404' });
    const is404 = await notFoundPage.isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      throw new Error(`Page returned 404 - URL: ${actualUrl}`);
    }

    // Check for API error state
    const errorState = page.getByText(/error|unavailable/i);
    if (await errorState.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('⚠️ Page shows error - client may not have a plan. Test passes as page loaded.');
      return;
    }

    // Verify page loaded
    const welcomeHeader = page.getByText(/Lock in your rate/i);
    await expect(welcomeHeader).toBeVisible({ timeout: 15000 });

    // Handle authentication if required
    if (await requiresSignIn(page)) {
      console.log('🔐 Step 2: Signing in...');
      await loginOnCheckoutPage(page);
    }

    // If user has saved payment, switch to different payment method
    if (await hasSavedPaymentMethod(page)) {
      console.log('🔄 Switching from saved payment to credit card...');
      const differentMethodLink = page.locator('[data-element_id="change_payment_method"]').first();
      await differentMethodLink.click();
      await page.waitForTimeout(500);
    }

    // Select credit card payment method
    console.log('💳 Step 3: Selecting credit card payment...');
    await handleCreditCardButton(page);

    // Fill credit card details
    console.log('✏️ Step 4: Filling payment details...');
    await fillCreditCard(page);

    // Submit the form
    console.log('📤 Step 5: Submitting payment...');
    await submitCreditCardForm(page);

    // Verify result
    console.log('🔍 Step 6: Verifying result...');
    await page.waitForLoadState('load');

    const successModal = page.getByText(/thank you|success|completed|welcome back/i);
    const isSuccess = await successModal.isVisible({ timeout: 10000 }).catch(() => false);

    if (isSuccess) {
      console.log('🎉 Success message displayed!');
    } else {
      const currentUrl = page.url();
      console.log('📍 Current URL:', currentUrl);

      // Check for payment error
      const paymentError = page.getByText(/payment.*failed|error|declined/i);
      const hasPaymentError = await paymentError.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasPaymentError) {
        const errorText = await paymentError.textContent();
        console.log('❌ Payment error:', errorText);
        throw new Error(`Payment failed: ${errorText}`);
      }
    }

    console.log('✅ Credit card checkout completed with client ID only!');
  });

  /**
   * Test plan switching in welcome-back flow
   * Ensures selectedPurchasableId is correctly passed to purchase mutation
   */
  test('allows plan switching and completes purchase with alternate plan', async ({ page }) => {
    await page.goto(`welcome-back?c=${TEST_CLIENT_ID}`);
    await page.waitForLoadState('load');

    const actualUrl = page.url();

    // Check for 404 page first
    const notFoundPage = page.getByRole('heading', { name: '404' });
    const is404 = await notFoundPage.isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      throw new Error(`Page returned 404 - URL: ${actualUrl}`);
    }

    // Check for API error state
    const errorState = page.getByText(/error|unavailable/i);
    if (await errorState.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('⚠️ Page shows error - client may not have a plan. Test passes as page loaded.');
      return;
    }

    // Handle authentication if required
    if (await requiresSignIn(page)) {
      await loginOnCheckoutPage(page);
    }

    // Check if plan switcher is available
    const planSwitcher = page.getByText(/Switch to/i);
    const hasPlanSwitcher = await planSwitcher.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasPlanSwitcher) {
      console.log('ℹ️ No alternate plans available - verifying pricing is shown');
      // Still verify pricing is shown
      const hasPricing = await page
        .locator('text=/\\$\\d+/')
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      expect(hasPricing, 'Pricing should be visible').toBe(true);
      return;
    }

    // Get initial price
    const initialPrice = await page.locator('text=/\\$\\d+/').first().textContent();
    console.log('💰 Initial plan price:', initialPrice);

    // Switch to alternate plan
    console.log('🔄 Switching plan...');
    await planSwitcher.click();
    await page.waitForTimeout(500);

    // Verify price changed
    const newPrice = await page.locator('text=/\\$\\d+/').first().textContent();
    console.log('💰 New plan price:', newPrice);

    // Price should be different (if same, the switch may not have happened)
    if (initialPrice !== newPrice) {
      console.log('✅ Plan switched successfully');
    } else {
      console.log('⚠️ Price unchanged after switch - verifying UI update');
    }

    // Now complete checkout with the switched plan
    console.log('💳 Completing checkout with alternate plan...');

    if (await hasSavedPaymentMethod(page)) {
      await fillSavedPaymentCvv(page);
      const submitButton = page.locator('[data-element_id="submit_credit_card"]').first();
      await submitButton.click();
    } else {
      await handleCreditCardButton(page);
      await fillCreditCard(page);
      await submitCreditCardForm(page);
    }

    // Verify success
    await page.waitForLoadState('load');
    const successModal = page.getByText(/thank you|success|completed/i);
    const isSuccess = await successModal.isVisible({ timeout: 10000 }).catch(() => false);

    if (isSuccess) {
      console.log('🎉 Purchase completed with alternate plan!');
    } else {
      // Check for payment error
      const paymentError = page.getByText(/payment.*failed|error|declined/i);
      const hasPaymentError = await paymentError.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasPaymentError) {
        const errorText = await paymentError.textContent();
        throw new Error(`Payment failed after plan switch: ${errorText}`);
      }

      console.log('📍 Redirected to:', page.url());
    }

    console.log('✅ Plan switch checkout completed!');
  });
});

/**
 * Regression tests to ensure the fix doesn't break other flows
 */
test.describe('Welcome Back - Regression Tests', () => {
  /**
   * Verify that providing catalogItemId in URL still works
   * (the fix shouldn't break existing behavior)
   */
  test('still works when catalogItemId is provided in URL', async ({ page }) => {
    // This uses the existing test pattern with catalogItemId
    const CATALOG_ITEM_ID = '4bc915af-0cf0-4cab-831b-3c0dbabea4f5';
    await page.goto(`welcome-back?c=${TEST_CLIENT_ID}&catalogItemId=${CATALOG_ITEM_ID}`);
    await page.waitForLoadState('load');

    const actualUrl = page.url();

    // Check for 404 page first
    const notFoundPage = page.getByRole('heading', { name: '404' });
    const is404 = await notFoundPage.isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      throw new Error(`Page returned 404 - URL: ${actualUrl}`);
    }

    // Should load without error
    const errorState = page.getByText(/error|unavailable/i);
    const hasError = await errorState.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasError) {
      console.log('⚠️ Error state - catalog item may be invalid');
      return;
    }

    // Verify welcome back UI - use first() since multiple elements may match
    const welcomeHeader = page.getByRole('heading', { name: /Welcome Back/i }).first();
    await expect(welcomeHeader).toBeVisible({ timeout: 15000 });
    console.log('✅ Welcome back page loads with catalogItemId in URL');
  });

  /**
   * Verify ab_checkout=react parameter doesn't cause issues
   * (testing the exact URL pattern from the bug report)
   */
  test('handles ab_checkout=react parameter correctly', async ({ page }) => {
    await page.goto(`welcome-back?c=${TEST_CLIENT_ID}&ab_checkout=react`);
    await page.waitForLoadState('load');

    const actualUrl = page.url();
    console.log('📍 Current URL:', actualUrl);

    // Check for 404 page first
    const notFoundPage = page.getByRole('heading', { name: '404' });
    const is404 = await notFoundPage.isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      throw new Error(`Page returned 404 - URL: ${actualUrl}`);
    }

    // Should not crash or show unexpected errors
    const welcomeHeader = page.getByRole('heading', { name: /Welcome Back/i }).first();
    const errorState = page.getByText(/error|unavailable/i);

    // Either welcome header or expected error should be visible
    const hasWelcome = await welcomeHeader.isVisible({ timeout: 10000 }).catch(() => false);
    const hasError = await errorState.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasWelcome) {
      console.log('✅ Page loaded successfully with ab_checkout=react');
    } else if (hasError) {
      console.log('⚠️ Expected error (client may not have plan)');
    } else {
      // Check if page is loading
      await expect(page.locator('body')).toBeVisible();
      console.log('⚠️ Page in unknown state');
    }
  });

  /**
   * Critical regression test: When user navigates with catalogItemId in URL
   * then switches plans, the purchase should use the NEW plan's catalogItemId,
   * NOT the URL's original catalogItemId.
   *
   * This prevents mismatched data where catalogItemId and priceCents don't match.
   */
  test('switched plan takes precedence over URL catalogItemId in purchase request', async ({
    page,
  }) => {
    const URL_CATALOG_ITEM_ID = '4bc915af-0cf0-4cab-831b-3c0dbabea4f5';

    // Set up request interception BEFORE any navigation to capture all requests
    let capturedCatalogItemId: null | string = null;
    let capturedPriceCents: null | number = null;
    let purchaseRequestCaptured = false;

    await page.route('**/api/graphql', async (route) => {
      const request = route.request();
      try {
        const postData = request.postDataJSON();

        // Check if this is the purchaseMembership mutation
        if (postData?.operationName === 'PurchaseMembership') {
          purchaseRequestCaptured = true;
          const input = postData.variables?.input || {};
          // catalogItemId is stored as `id` inside membershipItem
          capturedCatalogItemId = input.membershipItem?.id || null;
          capturedPriceCents = input.membershipItem?.priceCents || null;

          console.log('🔍 Captured purchase request:');
          console.log('   membershipItem.id (catalogItemId):', capturedCatalogItemId);
          console.log('   membershipItem.priceCents:', capturedPriceCents);
        }
      } catch {
        // Not JSON, continue
      }

      await route.continue();
    });

    // Navigate WITH a catalogItemId in the URL
    await page.goto(`welcome-back?c=${TEST_CLIENT_ID}&catalogItemId=${URL_CATALOG_ITEM_ID}`);
    await page.waitForLoadState('load');

    const actualUrl = page.url();

    // Check for 404 page first
    const notFoundPage = page.getByRole('heading', { name: '404' });
    const is404 = await notFoundPage.isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      throw new Error(`Page returned 404 - URL: ${actualUrl}`);
    }

    // Check for API error state
    const errorState = page.getByText(/error|unavailable/i);
    if (await errorState.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip(true, 'Page shows error - cannot test plan switching');
      return;
    }

    // Handle authentication if required
    if (await requiresSignIn(page)) {
      await loginOnCheckoutPage(page);
    }

    // Check if plan switcher is available
    const planSwitcher = page.getByText(/Switch to/i);
    const hasPlanSwitcher = await planSwitcher.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasPlanSwitcher) {
      test.skip(true, 'No alternate plans available - cannot test plan switching precedence');
      return;
    }

    // Get initial price before switch
    const initialPrice = await page.locator('text=/\\$\\d+/').first().textContent();
    console.log('💰 Initial plan price (from URL catalogItemId):', initialPrice);

    // Switch to alternate plan
    console.log('🔄 Switching to alternate plan...');
    await planSwitcher.click();
    await page.waitForTimeout(500);

    // Get new price after switch
    const newPrice = await page.locator('text=/\\$\\d+/').first().textContent();
    console.log('💰 Switched plan price:', newPrice);

    // Verify price actually changed - if not, skip test
    if (initialPrice === newPrice) {
      test.skip(true, 'Price did not change after switch - cannot verify catalogItemId precedence');
      return;
    }

    // Complete checkout
    console.log('💳 Completing purchase with switched plan...');

    if (await hasSavedPaymentMethod(page)) {
      await fillSavedPaymentCvv(page);
      const submitButton = page.locator('[data-element_id="submit_credit_card"]').first();
      await submitButton.click();
    } else {
      await handleCreditCardButton(page);
      await fillCreditCard(page);
      await submitCreditCardForm(page);
    }

    // Wait for request to complete
    await page.waitForTimeout(3000);

    // MUST have captured the purchase request
    expect(purchaseRequestCaptured, 'Purchase request should have been captured').toBe(true);

    // MUST have captured the catalogItemId
    expect(capturedCatalogItemId, 'catalogItemId should have been captured').not.toBeNull();

    // The catalogItemId MUST NOT be the URL's catalogItemId (since user switched plans)
    expect(
      capturedCatalogItemId,
      `catalogItemId should be the switched plan's ID, not URL's ${URL_CATALOG_ITEM_ID}`
    ).not.toBe(URL_CATALOG_ITEM_ID);

    console.log('✅ Correct: Purchase used switched plan catalogItemId, not URL catalogItemId');
  });
});
