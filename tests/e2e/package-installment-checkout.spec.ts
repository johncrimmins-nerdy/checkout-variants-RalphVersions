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
import { TEST_PACKAGE_QUOTE_ID } from './test-config';

const QUOTE_ERROR = `Quote "${TEST_PACKAGE_QUOTE_ID}" is invalid or expired. Update TEST_PACKAGE_QUOTE_ID in tests/e2e/test-config.ts`;
const QUOTE_NOT_PACKAGE_ERROR = `Quote "${TEST_PACKAGE_QUOTE_ID}" is not a package quote. Update TEST_PACKAGE_QUOTE_ID in tests/e2e/test-config.ts`;
const QUOTE_NO_INSTALLMENTS_ERROR = `Quote "${TEST_PACKAGE_QUOTE_ID}" has no installments. Update TEST_PACKAGE_QUOTE_ID in tests/e2e/test-config.ts`;

async function checkForQuoteError(page: import('@playwright/test').Page): Promise<void> {
  const errorMsg = page.getByText(/error occurred|no longer available|not found/i);
  if (await errorMsg.isVisible({ timeout: 3000 }).catch(() => false)) {
    throw new Error(QUOTE_ERROR);
  }
}

test.describe('Package Quote Checkout - Installments', () => {
  test.skip(
    !TEST_PACKAGE_QUOTE_ID,
    'TEST_PACKAGE_QUOTE_ID not set - provide a valid package quote ID with installments'
  );

  test('displays installment pricing correctly', async ({ page }) => {
    console.log('🛒 Navigating to checkout with package quote...');
    await page.goto(`?q=${TEST_PACKAGE_QUOTE_ID}`);
    console.log('📍 Current URL:', page.url());

    if (await requiresSignIn(page)) {
      console.log('🔐 Signing in...');
      await loginOnCheckoutPage(page);
    }

    await checkForQuoteError(page);

    // Verify checkout form is ready
    const checkoutForm = page.locator('#Checkout-Form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });
    console.log('✅ Checkout form loaded');

    // Verify "Package details" label (instead of "Selected plan")
    const packageLabel = page.getByText('Package details');
    if (!(await packageLabel.isVisible({ timeout: 5000 }).catch(() => false))) {
      throw new Error(QUOTE_NOT_PACKAGE_ERROR);
    }
    console.log('✅ Package details label displayed');

    // Verify installment summary is displayed (e.g., "2 installments of $X")
    const installmentSummary = page.getByText(/2 installments of \$/i);
    await expect(installmentSummary).toBeVisible({ timeout: 5000 });
    console.log('✅ Installment summary displayed');

    // Verify installment details are displayed
    const installmentDetails = page.getByText(/You'll pay.*today.*and then pay.*in 30 days/i);
    await expect(installmentDetails).toBeVisible({ timeout: 5000 });
    console.log('✅ Installment payment details displayed');

    // Verify total price is shown
    const totalPrice = page.locator('text=/\\$\\d+/').first();
    await expect(totalPrice).toBeVisible({ timeout: 5000 });
    console.log('✅ Total price displayed');

    console.log('🎉 Installment pricing displayed correctly!');
  });

  test('completes checkout with installment package', async ({ page }) => {
    console.log('🛒 Navigating to checkout with package quote...');
    await page.goto(`?q=${TEST_PACKAGE_QUOTE_ID}`);

    if (await requiresSignIn(page)) {
      await loginOnCheckoutPage(page);
    }

    await checkForQuoteError(page);

    // Verify checkout form is ready
    const checkoutForm = page.locator('#Checkout-Form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });

    // Verify installments are displayed
    const installmentText = page.getByText(/2 installments of \$/i);
    if (!(await installmentText.isVisible({ timeout: 5000 }).catch(() => false))) {
      throw new Error(QUOTE_NO_INSTALLMENTS_ERROR);
    }

    // Accept terms
    console.log('📋 Accepting terms...');
    await handleTermsCheckbox(page);

    // Select credit card payment
    console.log('💳 Selecting credit card payment...');
    await handleCreditCardButton(page);

    // Fill payment details
    console.log('✏️ Filling payment details...');
    await fillCreditCard(page);

    // Set up reCAPTCHA token verification before submitting
    console.log('🔐 Setting up reCAPTCHA verification...');
    const recaptchaTokenPromise = interceptAndVerifyRecaptchaToken(page);

    // Submit payment
    console.log('📤 Submitting payment...');
    await submitCreditCardForm(page);

    // Verify reCAPTCHA token was present in the request
    console.log('🔐 Verifying reCAPTCHA token...');
    await assertRecaptchaTokenPresent(recaptchaTokenPromise);

    // Verify success - wait for navigation away from checkout page
    console.log('🔍 Verifying success...');

    // Wait for URL to change (redirect after successful checkout)
    // The checkout should redirect to account-creation, success, login, or my-learning
    try {
      await page.waitForURL(
        (url) => {
          const urlStr = url.toString();
          return (
            urlStr.includes('account-creation') ||
            urlStr.includes('success') ||
            urlStr.includes('login') ||
            urlStr.includes('my-learning') ||
            !urlStr.includes(`q=${TEST_PACKAGE_QUOTE_ID}`)
          );
        },
        { timeout: 30000 }
      );
      console.log('🎉 Package installment checkout completed successfully!');
      console.log('📍 Final URL:', page.url());
    } catch {
      const errorMsg = page.getByText(/error|failed|declined/i);
      const errorText = await errorMsg.textContent().catch(() => null);
      if (errorText) {
        throw new Error(
          `Checkout failed: ${errorText}. Update TEST_PACKAGE_QUOTE_ID if quote expired.`
        );
      }
      throw new Error(
        `Checkout did not redirect. URL: ${page.url()}. Update TEST_PACKAGE_QUOTE_ID if quote expired.`
      );
    }
  });

  test('shows hours instead of /mo suffix for packages', async ({ page }) => {
    await page.goto(`?q=${TEST_PACKAGE_QUOTE_ID}`);

    if (await requiresSignIn(page)) {
      await loginOnCheckoutPage(page);
    }

    await checkForQuoteError(page);

    const checkoutForm = page.locator('#Checkout-Form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });

    // Packages show "X hours" not "$X/mo"
    const hoursText = page.getByText(/\d+ hours/i);
    if (!(await hoursText.isVisible({ timeout: 5000 }).catch(() => false))) {
      throw new Error(QUOTE_NOT_PACKAGE_ERROR);
    }

    // Verify NO "/mo" suffix is shown for packages
    const monthlyText = page.locator('text=/\\$[\\d,]+\\/mo/');
    await expect(monthlyText).toHaveCount(0);

    console.log('✅ Package displays hours correctly (no /mo suffix)');
  });
});
