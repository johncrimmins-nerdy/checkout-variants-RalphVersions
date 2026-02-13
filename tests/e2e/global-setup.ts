/**
 * Playwright Global Setup for Staging
 *
 * Makes an initial request to staging with ab_checkout=react parameter
 * to set the sticky session. This ensures all subsequent test requests
 * route to the React version without needing the param on every URL.
 */
import { request } from '@playwright/test';

const BASE_PATH = '/checkout';

async function globalSetup() {
  const stagingUrl = `https://www.vtstaging.com${BASE_PATH}/?ab_checkout=react`;

  console.log(`🔧 Setting up sticky session for staging: ${stagingUrl}`);

  const requestContext = await request.newContext({
    ignoreHTTPSErrors: true,
  });

  try {
    const response = await requestContext.get(stagingUrl);
    console.log(`✅ Sticky session initialized (status: ${response.status()})`);
  } catch (error) {
    console.warn('⚠️ Failed to initialize sticky session:', error);
    // Don't fail setup - tests might still work
  } finally {
    await requestContext.dispose();
  }
}

export default globalSetup;
