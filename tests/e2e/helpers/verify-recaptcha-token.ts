import { expect, Page, Request } from '@playwright/test';

/**
 * Verifies that reCAPTCHA token was included in a purchase request.
 * This is a convenience wrapper that handles the promise and assertion.
 *
 * @param tokenPromise - Promise from interceptAndVerifyRecaptchaToken
 *
 * @example
 * ```ts
 * const tokenPromise = interceptAndVerifyRecaptchaToken(page);
 * await submitCreditCardForm(page);
 * await assertRecaptchaTokenPresent(tokenPromise);
 * ```
 */
export async function assertRecaptchaTokenPresent(tokenPromise: Promise<string>): Promise<void> {
  const token = await tokenPromise;
  expect(token).toBeTruthy();
  expect(token.length).toBeGreaterThan(10); // reCAPTCHA tokens are typically long strings
  console.log('✅ reCAPTCHA token verified: present and valid length');
}

/**
 * Intercepts the PurchaseMembership GraphQL mutation and verifies
 * that a reCAPTCHA token (verificationToken) is present.
 *
 * This should be called BEFORE the payment submission to set up the interceptor.
 * The listener is automatically removed after the promise settles to prevent memory leaks.
 *
 * @param page - Playwright Page instance
 * @returns Promise that resolves to the verification token value
 *
 * @example
 * ```ts
 * // Set up the interceptor before submitting
 * const tokenPromise = interceptAndVerifyRecaptchaToken(page);
 *
 * // Submit the form
 * await submitCreditCardForm(page);
 *
 * // Verify the token was present
 * const token = await tokenPromise;
 * expect(token.length).toBeGreaterThan(0);
 * ```
 */
export async function interceptAndVerifyRecaptchaToken(page: Page): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      page.off('request', requestHandler);
      reject(new Error('Timeout waiting for PurchaseMembership request'));
    }, 60000);

    const cleanup = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      page.off('request', requestHandler);
    };

    const requestHandler = (request: Request) => {
      // Skip if already settled
      if (settled) return;

      // Only intercept GraphQL requests
      if (!request.url().includes('graphql')) {
        return;
      }

      try {
        const postData = request.postData();
        if (!postData) return;

        const body = JSON.parse(postData);

        // Check if this is the PurchaseMembership mutation
        if (body.operationName === 'PurchaseMembership') {
          cleanup();

          const verificationToken = body.variables?.input?.verificationToken;

          console.log('🔐 reCAPTCHA Token Check:');
          console.log('   - Token present:', !!verificationToken);
          console.log('   - Token length:', verificationToken?.length || 0);

          // Verify token is present and non-empty
          if (!verificationToken || verificationToken.length === 0) {
            reject(
              new Error(
                'reCAPTCHA verificationToken is missing or empty in PurchaseMembership request'
              )
            );
          } else {
            resolve(verificationToken);
          }
        }
      } catch {
        // Not a JSON request or parsing failed, ignore
      }
    };

    page.on('request', requestHandler);
  });
}
