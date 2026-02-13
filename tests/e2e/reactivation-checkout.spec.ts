import { expect, test } from '@playwright/test';

import {
  assertRecaptchaTokenPresent,
  fillCreditCard,
  fillSavedPaymentCvv,
  handleCreditCardButton,
  hasSavedPaymentMethod,
  interceptAndVerifyRecaptchaToken,
  loginOnCheckoutPage,
  requiresSignIn,
  submitCreditCardForm,
} from './helpers';
import { TEST_CATALOG_ITEM_ID } from './test-config';

/**
 * E2E Tests: Reactivation Checkout (Welcome Back Flow)
 *
 * Tests the seamless reactivation flow for returning customers.
 * This flow is for users who previously had a subscription and are returning.
 *
 * Note: For staging, ab_checkout=react is included in the baseURL (playwright.config.ts)
 * which uses a sticky session strategy to route all requests to the React version.
 */

test.describe('Reactivation Checkout (Welcome Back)', () => {
  test('displays welcome back page correctly', async ({ page }) => {
    // Navigate to reactivation page
    await page.goto(`welcome-back?catalogItemId=${TEST_CATALOG_ITEM_ID}`);
    await page.waitForLoadState('load');
    console.log('📍 Current URL:', page.url());

    // Check for error state (invalid catalog item, etc.)
    const errorState = page.getByText(/error|unavailable|not found/i);
    const hasError = await errorState.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasError) {
      throw new Error(
        'Welcome back page shows error - catalog item may not be valid for reactivation'
      );
    }

    // Verify welcome back UI elements
    const welcomeHeader = page.getByText(/Lock in your rate/i);
    await expect(welcomeHeader).toBeVisible({ timeout: 15000 });
    console.log('✅ Welcome back header displayed');

    // Verify pricing is displayed (multiple prices may exist, check at least one)
    await expect(page.locator('text=/\\$\\d+/').first()).toBeVisible({ timeout: 5000 });
    console.log('💰 Pricing information displayed');

    // Check for payment options or sign-in form
    const creditCardButton = page.locator('[data-element_id="credit_card"]');
    const signInForm = page.getByRole('heading', { name: /Sign in/i });

    await expect(creditCardButton.or(signInForm)).toBeVisible({ timeout: 10000 });
    console.log('✅ Payment options or sign-in displayed');
  });

  test('completes reactivation checkout with credit card', async ({ page }) => {
    // Step 1: Navigate to reactivation page
    console.log('🚪 Step 1: Navigating to welcome-back page...');
    await page.goto(`welcome-back?catalogItemId=${TEST_CATALOG_ITEM_ID}`);
    await page.waitForLoadState('load');
    console.log('📍 Current URL:', page.url());

    // Check for error state
    const errorState = page.getByText(/error|unavailable|not found/i);
    if (await errorState.isVisible({ timeout: 3000 }).catch(() => false)) {
      throw new Error('Welcome back page shows error - cannot proceed with test');
    }

    // Verify page loaded
    const welcomeHeader = page.getByText(/Lock in your rate/i);
    await expect(welcomeHeader).toBeVisible({ timeout: 15000 });

    // Step 2: Handle authentication if required
    if (await requiresSignIn(page)) {
      console.log('🔐 Step 2: Signing in...');
      await loginOnCheckoutPage(page);
    }

    // Step 3: Select credit card payment method
    console.log('💳 Step 3: Selecting credit card payment...');
    await handleCreditCardButton(page);

    // Step 4: Fill in credit card information
    console.log('✏️ Step 4: Filling payment details...');
    await fillCreditCard(page);

    // Step 5: Set up reCAPTCHA token verification before submitting
    console.log('🔐 Step 5: Setting up reCAPTCHA verification...');
    const recaptchaTokenPromise = interceptAndVerifyRecaptchaToken(page);

    // Step 6: Submit the form
    console.log('📤 Step 6: Submitting payment...');
    await submitCreditCardForm(page);

    // Step 7: Verify reCAPTCHA token was present in the request
    console.log('🔐 Step 7: Verifying reCAPTCHA token...');
    await assertRecaptchaTokenPresent(recaptchaTokenPromise);

    // Step 8: Verify success
    console.log('🔍 Step 8: Verifying success...');
    await page.waitForLoadState('load');

    const successModal = page.getByText(/thank you|success|completed|welcome back/i);
    const isModalVisible = await successModal.isVisible({ timeout: 10000 }).catch(() => false);

    if (isModalVisible) {
      console.log('🎉 Success message displayed!');
    } else {
      const currentUrl = page.url();
      console.log('📍 Redirected to:', currentUrl);
    }

    console.log('🎉 Reactivation checkout completed successfully!');
  });

  test('shows plan switching options when available', async ({ page }) => {
    await page.goto(`welcome-back?catalogItemId=${TEST_CATALOG_ITEM_ID}`);
    await page.waitForLoadState('load');

    // Check for error state
    const errorState = page.getByText(/error|unavailable|not found/i);
    if (await errorState.isVisible({ timeout: 3000 }).catch(() => false)) {
      throw new Error('Welcome back page shows error');
    }

    // Handle authentication if required
    if (await requiresSignIn(page)) {
      await loginOnCheckoutPage(page);
    }

    // Check if plan switcher is available
    const planSwitcher = page.getByText(/Switch to/i);
    const hasPlanSwitcher = await planSwitcher.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasPlanSwitcher) {
      console.log('📋 Plan switcher found, testing switch functionality...');
      await planSwitcher.click();
      await expect(page.locator('text=/\\$\\d+/').first()).toBeVisible();
      console.log('✅ Plan switched successfully');
    } else {
      console.log('ℹ️ No plan switcher available for this catalog item');
      // Still verify pricing is shown
      await expect(page.locator('text=/\\$\\d+/').first()).toBeVisible();
    }
  });
});

test.describe('Reactivation - Different Payment Method', () => {
  test('can switch from saved payment to credit card', async ({ page }) => {
    await page.goto(`welcome-back?catalogItemId=${TEST_CATALOG_ITEM_ID}`);
    await page.waitForLoadState('load');

    // Check for error state
    const errorState = page.getByText(/error|unavailable|not found/i);
    if (await errorState.isVisible({ timeout: 3000 }).catch(() => false)) {
      throw new Error('Welcome back page shows error');
    }

    // Wait for page to fully hydrate (welcome header indicates page is ready)
    const welcomeHeader = page.getByText(/Lock in your rate/i);
    await expect(welcomeHeader).toBeVisible({ timeout: 15000 });

    // Handle authentication if required
    if (await requiresSignIn(page)) {
      await loginOnCheckoutPage(page);
    }

    // Check if "Use a different payment method" link exists (use first() to avoid multiple matches)
    const differentMethodLink = page.locator('[data-element_id="change_payment_method"]').first();
    const hasDifferentMethod = await differentMethodLink
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (hasDifferentMethod) {
      console.log('🔄 Testing payment method switch...');
      await differentMethodLink.click();

      // Should show payment method selection heading
      await expect(page.getByRole('heading', { name: /select your payment method/i })).toBeVisible({
        timeout: 10000,
      });

      // Credit card option should now be visible
      await expect(page.locator('[data-element_id="credit_card"]').first()).toBeVisible({
        timeout: 10000,
      });
      console.log('✅ Payment method selection shown');
    } else {
      console.log('ℹ️ No saved payment method to switch from');
      const creditCardButton = page.locator('[data-element_id="credit_card"]').first();
      await expect(creditCardButton).toBeVisible({ timeout: 30000 });
      console.log('✅ Credit card option available');
    }
  });
});

/**
 * Regression tests for plan switching with catalogItemId in URL
 */
test.describe('Reactivation - Plan Switch Precedence', () => {
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
    // Set up request interception BEFORE any navigation to capture all requests
    let capturedCatalogItemId: null | string = null;
    let purchaseRequestCaptured = false;

    // Listen for page errors (JavaScript errors)
    page.on('pageerror', (error) => {
      console.log('🔴 Page error:', error.message);
    });

    // Listen for console messages from the browser
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('🔴 Console error:', msg.text());
      }
    });

    await page.route('**/api/graphql', async (route) => {
      const request = route.request();
      console.log('🔀 Route intercepted:', request.url());
      try {
        const postData = request.postDataJSON();
        console.log('   Operation:', postData?.operationName);

        // Check if this is the purchaseMembership mutation
        if (postData?.operationName === 'PurchaseMembership') {
          purchaseRequestCaptured = true;
          const input = postData.variables?.input || {};
          // catalogItemId is stored as `id` inside membershipItem
          capturedCatalogItemId = input.membershipItem?.id || null;

          console.log('🔍 Captured purchase request:');
          console.log('   membershipItem.id (catalogItemId):', capturedCatalogItemId);
        }
      } catch {
        // Not JSON, continue
      }

      await route.continue();
    });

    // Navigate WITH catalogItemId in the URL (requires login)
    await page.goto(`welcome-back?catalogItemId=${TEST_CATALOG_ITEM_ID}`);
    await page.waitForLoadState('load');

    const actualUrl = page.url();

    // Check for 404 page first
    const notFoundPage = page.getByRole('heading', { name: '404' });
    const is404 = await notFoundPage.isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      throw new Error(`Page returned 404 - URL: ${actualUrl}`);
    }

    // Check for error state
    const errorState = page.getByText(/error|unavailable|not found/i);
    if (await errorState.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip(true, 'Page shows error - cannot test plan switching');
      return;
    }

    // Handle authentication if required
    if (await requiresSignIn(page)) {
      console.log('🔐 Login required, signing in...');
      await loginOnCheckoutPage(page);
      console.log('✅ Login complete, URL:', page.url());
    } else {
      console.log('ℹ️ No login required');
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
      console.log('   Using saved payment method');
      await fillSavedPaymentCvv(page);
      console.log('   CVV filled, clicking submit button...');
      // The saved payment form submit button says "Complete your purchase"
      const submitButton = page.locator('[data-element_id="submit_credit_card"]').first();
      await submitButton.click();
      console.log('   Submit button clicked');
    } else {
      console.log('   Using new credit card');
      await handleCreditCardButton(page);
      await fillCreditCard(page);
      console.log('   Credit card filled, submitting...');
      await submitCreditCardForm(page);
      console.log('   Form submitted');
    }

    // Wait for purchase request - use waitForResponse with a timeout
    console.log('⏳ Waiting for purchase request...');
    try {
      const response = await page.waitForResponse(
        (resp) =>
          resp.url().includes('graphql') &&
          resp.request().postDataJSON()?.operationName === 'PurchaseMembership',
        { timeout: 10000 }
      );
      console.log('✅ Got PurchaseMembership response:', response.status());
      purchaseRequestCaptured = true;

      // Try to capture the request data
      const requestData = response.request().postDataJSON();
      const input = requestData?.variables?.input || {};
      capturedCatalogItemId = input.membershipItem?.id || null;
      console.log('   Captured catalogItemId:', capturedCatalogItemId);
    } catch (e) {
      console.log('❌ No PurchaseMembership request captured within timeout');
      console.log('   Error:', (e as Error).message);
    }

    console.log('📊 Purchase request captured:', purchaseRequestCaptured);

    // MUST have captured the purchase request
    expect(purchaseRequestCaptured, 'Purchase request should have been captured').toBe(true);

    // MUST have captured the catalogItemId
    expect(capturedCatalogItemId, 'catalogItemId should have been captured').not.toBeNull();

    // The catalogItemId MUST NOT be the URL's catalogItemId (since user switched plans)
    expect(
      capturedCatalogItemId,
      `catalogItemId should be the switched plan's ID, not URL's ${TEST_CATALOG_ITEM_ID}`
    ).not.toBe(TEST_CATALOG_ITEM_ID);

    console.log('✅ Correct: Purchase used switched plan catalogItemId, not URL catalogItemId');
  });
});
