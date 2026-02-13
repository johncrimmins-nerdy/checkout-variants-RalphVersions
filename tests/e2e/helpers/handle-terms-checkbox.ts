import { expect, Page } from '@playwright/test';

/**
 * Handles the terms agreement checkbox interaction
 *
 * @param page - Playwright Page instance
 */
export async function handleTermsCheckbox(page: Page): Promise<void> {
  console.log('📋 Looking for terms checkbox...');

  // The checkbox has name="Agree-To-Terms-Checkbox"
  const termsCheckbox = page.locator('input[name="Agree-To-Terms-Checkbox"]');

  // Check if checkbox exists and is visible
  const isVisible = await termsCheckbox.isVisible({ timeout: 5000 }).catch(() => false);

  if (!isVisible) {
    console.log('⏭️ Terms checkbox not found or not required, skipping...');
    return;
  }

  // Check if already checked
  const isChecked = await termsCheckbox.isChecked();

  if (!isChecked) {
    console.log('☑️ Checking terms checkbox...');
    await termsCheckbox.click();
    await expect(termsCheckbox).toBeChecked();
    console.log('✅ Terms checkbox checked');
  } else {
    console.log('✅ Terms checkbox already checked');
  }
}
