import renderCheckoutPage from './checkout-page';
import CheckoutPage from './page';

jest.mock('./checkout-page', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('CheckoutPage', () => {
  it('delegates to renderCheckoutPage with CheckoutPage prefix', async () => {
    const searchParams = Promise.resolve({});

    await CheckoutPage({ searchParams });

    expect(renderCheckoutPage).toHaveBeenCalledWith({
      logPrefix: 'CheckoutPage',
      searchParams,
    });
  });
});
