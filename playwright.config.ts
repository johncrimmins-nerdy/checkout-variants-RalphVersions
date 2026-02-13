import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 *
 * Environment Variables:
 * - PLAYWRIGHT_BASE_URL: Override base URL (default: https://localhost:3000/checkout)
 * - STAGING_URL: Use staging environment (https://www.vtstaging.com/checkout)
 * - SKIP_SERVER: Skip starting dev server (use when server is already running)
 * - CI: Set in CI environments
 *
 * Usage:
 * - npm run test:e2e                    # Run against local HTTPS dev server (auto-starts)
 * - npm run test:e2e:ui                 # Run with UI mode
 * - STAGING_URL=1 npm run test:e2e      # Run against staging
 * - SKIP_SERVER=1 npm run test:e2e      # Run against local server (already running)
 */

// Base path for the checkout app
const BASE_PATH = '/checkout';

// Determine base URL based on environment
// Note: Trailing slash is required for relative URL resolution to work correctly
const getBaseURL = () => {
  if (process.env.PLAYWRIGHT_BASE_URL) {
    return process.env.PLAYWRIGHT_BASE_URL.replace(/\/?$/, '/');
  }
  if (process.env.STAGING_URL) {
    return `https://www.vtstaging.com${BASE_PATH}/`;
  }
  // Local dev server uses HTTPS
  return `https://localhost:3000${BASE_PATH}/`;
};

// Determine if we should skip starting the web server
// Skip when: CI, staging, or explicitly requested via SKIP_SERVER
const shouldSkipWebServer = () => {
  return !!(process.env.CI || process.env.STAGING_URL || process.env.SKIP_SERVER);
};

export default defineConfig({
  testDir: './tests/e2e',

  /* Global setup to initialize sticky session for staging */
  globalSetup: process.env.STAGING_URL ? './tests/e2e/global-setup.ts' : undefined,

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Timeout settings */
  timeout: 120000, // 2 minutes per test
  expect: {
    timeout: 30000, // 30 seconds for assertions
  },

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: getBaseURL(),

    /* Ignore HTTPS errors for self-signed certificates in local dev */
    ignoreHTTPSErrors: true,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Action and navigation timeouts */
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: shouldSkipWebServer()
    ? undefined
    : {
        command: 'npm run dev:https',
        // Check the root localhost port (HTTPS)
        url: 'https://localhost:3000',
        // Ignore SSL errors for self-signed certificates
        ignoreHTTPSErrors: true,
        reuseExistingServer: true,
        timeout: 120000,
        // Show server output for debugging
        stdout: 'pipe',
        stderr: 'pipe',
      },
});
