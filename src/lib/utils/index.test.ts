import {
  buildUrlWithParams,
  calculateChurnMonths,
  deleteCookie,
  extractUTMParameters,
  formatPhone,
  formatPrice,
  forwardCookies,
  getAccountCreationRedirectUrl,
  getApiDomain,
  getCookie,
  getCountryFromCurrency,
  getGraphQLUrl,
  getRedirectUrl,
  getWebDomain,
  IntegrationError,
  mergeQuoteWithCheckoutData,
  mergeQuoteWithPurchasable,
  PaymentError,
  setCookie,
  showSpinner,
} from './index';

describe('utils index exports', () => {
  describe('account-creation-helpers', () => {
    it('exports getAccountCreationRedirectUrl', () => {
      expect(getAccountCreationRedirectUrl).toBeDefined();
    });
  });

  describe('calculate-churn-months', () => {
    it('exports calculateChurnMonths', () => {
      expect(calculateChurnMonths).toBeDefined();
    });
  });

  describe('checkout-helpers', () => {
    it('exports checkout helper functions', () => {
      expect(getRedirectUrl).toBeDefined();
      expect(buildUrlWithParams).toBeDefined();
    });
  });

  describe('cookie', () => {
    it('exports cookie functions', () => {
      expect(getCookie).toBeDefined();
      expect(setCookie).toBeDefined();
      expect(deleteCookie).toBeDefined();
    });
  });

  describe('currency-to-country', () => {
    it('exports getCountryFromCurrency', () => {
      expect(getCountryFromCurrency).toBeDefined();
    });
  });

  describe('error-classes', () => {
    it('exports error classes', () => {
      expect(IntegrationError).toBeDefined();
      expect(PaymentError).toBeDefined();
    });
  });

  describe('extract-utm-parameters', () => {
    it('exports extractUTMParameters', () => {
      expect(extractUTMParameters).toBeDefined();
    });
  });

  describe('format-phone', () => {
    it('exports formatPhone', () => {
      expect(formatPhone).toBeDefined();
    });
  });

  describe('format-price', () => {
    it('exports formatPrice', () => {
      expect(formatPrice).toBeDefined();
    });
  });

  describe('forward-cookies', () => {
    it('exports forwardCookies', () => {
      expect(forwardCookies).toBeDefined();
    });
  });

  describe('get-api-domain', () => {
    it('exports domain functions', () => {
      expect(getApiDomain).toBeDefined();
      expect(getWebDomain).toBeDefined();
    });
  });

  describe('get-graphql-url', () => {
    it('exports getGraphQLUrl', () => {
      expect(getGraphQLUrl).toBeDefined();
    });
  });

  describe('merge-quote-with-purchasable', () => {
    it('exports merge functions', () => {
      expect(mergeQuoteWithPurchasable).toBeDefined();
      expect(mergeQuoteWithCheckoutData).toBeDefined();
    });
  });

  describe('spinner', () => {
    it('exports showSpinner', () => {
      expect(showSpinner).toBeDefined();
    });
  });
});
