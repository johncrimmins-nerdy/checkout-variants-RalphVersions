import { expect, Page } from '@playwright/test';

export interface CreditCardInfo {
  cardNumber?: string;
  cvv?: string;
  expirationDate?: string;
  firstName?: string;
  lastName?: string;
  postalCode?: string;
}

/**
 * Default test credit card (Visa)
 */
const DEFAULT_CARD: Required<CreditCardInfo> = {
  cardNumber: '4111111111111111',
  cvv: '123',
  expirationDate: '12/30',
  firstName: 'Test',
  lastName: 'User',
  postalCode: '11111',
};

/**
 * Fills credit card information in Braintree hosted fields and form inputs
 *
 * @param page - Playwright Page instance
 * @param cardInfo - Credit card information to fill (uses defaults if not provided)
 */
export async function fillCreditCard(page: Page, cardInfo: CreditCardInfo = {}): Promise<void> {
  const card = { ...DEFAULT_CARD, ...cardInfo };

  console.log('💳 Filling credit card information...');

  // Wait for the credit card form heading to be visible
  await expect(page.getByRole('heading', { name: /Pay with credit card/i })).toBeVisible({
    timeout: 15000,
  });

  // Wait for Braintree hosted fields to initialize (iframes appear in containers)
  console.log('⏳ Waiting for Braintree hosted fields...');

  // Wait for iframes to be attached to DOM using locators
  await page.locator('#cc-number iframe').waitFor({ state: 'attached', timeout: 30000 });
  await page.locator('#cc-expiration-date iframe').waitFor({ state: 'attached', timeout: 30000 });
  await page.locator('#cc-cvv iframe').waitFor({ state: 'attached', timeout: 30000 });

  // Wait for the loading class to be removed (indicates Braintree is ready)
  await expect(page.locator('#cc-number.hosted-field-loading')).toBeHidden({ timeout: 10000 });

  // Fill regular form fields first
  console.log('📝 Filling name and postal code...');

  const firstNameInput = page.locator('input[name="First-Name"]');
  const lastNameInput = page.locator('input[name="Last-Name"]');
  const postalCodeInput = page.locator('input[name="postal-code"]');

  await firstNameInput.fill(card.firstName);
  await lastNameInput.fill(card.lastName);
  await postalCodeInput.fill(card.postalCode);

  // Fill Braintree hosted fields (inside iframes)
  // Braintree creates iframes with specific inputs for PCI compliance
  console.log('💳 Filling card number...');
  const cardNumberFrame = page.frameLocator('#cc-number iframe').first();
  // Braintree input has aria-label "Credit Card Number"
  const cardNumberInput = cardNumberFrame.getByRole('textbox', { name: 'Credit Card Number' });
  await cardNumberInput.waitFor({ state: 'visible', timeout: 15000 });
  await cardNumberInput.fill(card.cardNumber);

  console.log('📅 Filling expiration date...');
  const expirationFrame = page.frameLocator('#cc-expiration-date iframe').first();
  const expirationInput = expirationFrame.getByRole('textbox', { name: 'Expiration Date' });
  await expirationInput.waitFor({ state: 'visible', timeout: 10000 });
  await expirationInput.fill(card.expirationDate);

  console.log('🔒 Filling CVV...');
  const cvvFrame = page.frameLocator('#cc-cvv iframe').first();
  const cvvInput = cvvFrame.getByRole('textbox', { name: 'CVV' });
  await cvvInput.waitFor({ state: 'visible', timeout: 10000 });
  await cvvInput.fill(card.cvv);

  console.log('✅ Credit card information filled successfully');
}
