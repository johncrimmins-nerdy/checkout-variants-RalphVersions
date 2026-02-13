import renderCheckoutPage from '@/app/checkout-page';

import QuotelessCheckoutPage from './page';

jest.mock('@/app/checkout-page', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('QuotelessCheckoutPage', () => {
  it('delegates to renderCheckoutPage with QuotelessCheckoutPage prefix', async () => {
    const searchParams = Promise.resolve({});

    await QuotelessCheckoutPage({ searchParams });

    expect(renderCheckoutPage).toHaveBeenCalledWith({
      logPrefix: 'QuotelessCheckoutPage',
      searchParams,
    });
  });
});
