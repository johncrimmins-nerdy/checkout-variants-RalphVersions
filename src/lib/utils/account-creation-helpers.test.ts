/**
 * Tests for account creation helper functions
 */

import { getAccountCreationRedirectUrl } from './account-creation-helpers';

// Mock dependencies
jest.mock('./checkout-helpers', () => ({
  getRedirectUrl: (path: string) => `/checkout${path}`,
}));

jest.mock('./get-api-domain', () => ({
  getWebDomain: () => 'www.varsitytutors.com',
}));

describe('account-creation-helpers', () => {
  describe('getAccountCreationRedirectUrl', () => {
    it('returns return_to URL when provided', () => {
      const result = getAccountCreationRedirectUrl('/my-courses');

      expect(result).toBe('/checkout/my-courses');
    });

    it('returns my-learning/welcome when onboarding is enabled', () => {
      const result = getAccountCreationRedirectUrl(null, true);

      expect(result).toBe('https://www.varsitytutors.com/my-learning/welcome');
    });

    it('returns my-learning when onboarding is disabled', () => {
      const result = getAccountCreationRedirectUrl(null, false);

      expect(result).toBe('https://www.varsitytutors.com/my-learning');
    });

    it('defaults to my-learning when no parameters provided', () => {
      const result = getAccountCreationRedirectUrl();

      expect(result).toBe('https://www.varsitytutors.com/my-learning');
    });

    it('prioritizes return_to over onboarding flag', () => {
      const result = getAccountCreationRedirectUrl('/custom-page', true);

      expect(result).toBe('/checkout/custom-page');
    });

    it('handles undefined return_to', () => {
      const result = getAccountCreationRedirectUrl(undefined, true);

      expect(result).toBe('https://www.varsitytutors.com/my-learning/welcome');
    });
  });
});
