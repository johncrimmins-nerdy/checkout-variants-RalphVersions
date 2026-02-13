import {
  getBraintreeClient,
  getBraintreeToken,
  getDataCollector,
  initApplePay,
  initBraintree,
  initBraintreeClient,
  initDataCollector,
  initGooglePay,
  initPayPal,
  loadBraintreeSDK,
  teardownBraintree,
  waitForGooglePay,
} from './index';

describe('payment index', () => {
  it('exports braintree-client functions', () => {
    expect(getBraintreeClient).toBeDefined();
    expect(getDataCollector).toBeDefined();
    expect(initBraintreeClient).toBeDefined();
    expect(initDataCollector).toBeDefined();
    expect(loadBraintreeSDK).toBeDefined();
    expect(teardownBraintree).toBeDefined();
  });

  it('exports get-braintree-token', () => {
    expect(getBraintreeToken).toBeDefined();
  });

  it('exports init-apple-pay', () => {
    expect(initApplePay).toBeDefined();
  });

  it('exports init-braintree', () => {
    expect(initBraintree).toBeDefined();
  });

  it('exports init-google-pay', () => {
    expect(initGooglePay).toBeDefined();
    expect(waitForGooglePay).toBeDefined();
  });

  it('exports init-paypal', () => {
    expect(initPayPal).toBeDefined();
  });
});
