import { expect, Page } from '@playwright/test';

import { TEST_USER } from '../test-config';

/**
 * Log in a user on the checkout page sign-in form
 */
export async function loginOnCheckoutPage(
  page: Page,
  credentials: { email: string; password: string } = TEST_USER
): Promise<void> {
  // Wait for sign-in form to be visible
  const signInHeading = page.getByRole('heading', { name: /Sign in to continue/i });
  await expect(signInHeading).toBeVisible({ timeout: 10000 });

  // Fill email
  const emailInput = page.locator('input[name="Email-Address"], input[type="email"]').first();
  await emailInput.fill(credentials.email);

  // Fill password
  const passwordInput = page.locator('input[name="Password"], input[type="password"]').first();
  await passwordInput.fill(credentials.password);

  // Click sign in button
  const signInButton = page.getByRole('button', { name: /Sign in/i });
  await signInButton.click();

  // Wait for sign-in to complete (form should disappear or payment methods should appear)
  await expect(signInHeading).toBeHidden({ timeout: 30000 });

  console.log('✅ User logged in successfully');
}

/**
 * Check if the page requires sign-in
 */
export async function requiresSignIn(page: Page): Promise<boolean> {
  const signInHeading = page.getByRole('heading', { name: /Sign in to continue/i });
  return signInHeading.isVisible({ timeout: 3000 }).catch(() => false);
}
