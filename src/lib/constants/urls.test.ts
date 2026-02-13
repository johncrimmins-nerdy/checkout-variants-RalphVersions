import {
  ACCOUNT_CREATION_PAGE_URL,
  CHECKOUT_PAGE_URL,
  ELECTRONIC_POLICY_PAGE_URL,
  QUOTE_EXPIRED_PAGE_URL,
  QUOTE_PAGE_BASE_URL,
  SIGN_IN_PAGE_URL,
  TERMS_OF_USE_PAGE_URL,
  WELCOME_BACK_PAGE_URL,
} from './urls';

describe('URL constants', () => {
  const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/checkout';

  describe('page URLs', () => {
    it('CHECKOUT_PAGE_URL uses base path', () => {
      expect(CHECKOUT_PAGE_URL).toBe(BASE_PATH);
    });

    it('WELCOME_BACK_PAGE_URL is under base path', () => {
      expect(WELCOME_BACK_PAGE_URL).toBe(`${BASE_PATH}/welcome-back`);
    });

    it('QUOTE_PAGE_BASE_URL is under base path', () => {
      expect(QUOTE_PAGE_BASE_URL).toBe(`${BASE_PATH}/quotepage`);
    });

    it('ACCOUNT_CREATION_PAGE_URL is under base path', () => {
      expect(ACCOUNT_CREATION_PAGE_URL).toBe(`${BASE_PATH}/account-creation`);
    });

    it('QUOTE_EXPIRED_PAGE_URL is under base path', () => {
      expect(QUOTE_EXPIRED_PAGE_URL).toBe(`${BASE_PATH}/quote-expired`);
    });
  });

  describe('policy URLs', () => {
    it('ELECTRONIC_POLICY_PAGE_URL is under base path', () => {
      expect(ELECTRONIC_POLICY_PAGE_URL).toBe(`${BASE_PATH}/electronic-policy`);
    });

    it('TERMS_OF_USE_PAGE_URL is under base path', () => {
      expect(TERMS_OF_USE_PAGE_URL).toBe(`${BASE_PATH}/terms-of-customer-account-use`);
    });
  });

  describe('external URLs', () => {
    it('SIGN_IN_PAGE_URL is on main site (not base path)', () => {
      expect(SIGN_IN_PAGE_URL).toBe('/login');
      expect(SIGN_IN_PAGE_URL).not.toContain(BASE_PATH);
    });
  });
});
