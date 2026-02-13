/**
 * URL constants for the checkout application
 */

// Base path from environment variable
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/checkout';

// Checkout page URL (now at root of base path)
export const CHECKOUT_PAGE_URL = BASE_PATH;

// Welcome back/reactivation page URL
export const WELCOME_BACK_PAGE_URL = `${BASE_PATH}/welcome-back`;

// Quote page base URL
export const QUOTE_PAGE_BASE_URL = `${BASE_PATH}/quotepage`;

// Account creation page URL
export const ACCOUNT_CREATION_PAGE_URL = `${BASE_PATH}/account-creation`;

// Policy pages
export const ELECTRONIC_POLICY_PAGE_URL = `${BASE_PATH}/electronic-policy`;
export const TERMS_OF_USE_PAGE_URL = `${BASE_PATH}/terms-of-customer-account-use`;

// Quote expired page
export const QUOTE_EXPIRED_PAGE_URL = `${BASE_PATH}/quote-expired`;

// Authentication page (main site, not in BASE_PATH)
export const SIGN_IN_PAGE_URL = '/login';
