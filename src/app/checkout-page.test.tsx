/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';

import type { CheckoutDetailsResponse } from '@/lib/api/checkout-details';
import type { QuoteResponse } from '@/lib/api/quote';

import { CHECKOUT_ERROR_MESSAGES } from '@/lib/constants/error-messages';
import { CHECKOUT_PAGE_URL, SIGN_IN_PAGE_URL } from '@/lib/constants/urls';

import renderCheckoutPage from './checkout-page';

const mockCheckoutDetails = jest.fn();
jest.mock('@/lib/api/checkout-details', () => ({
  checkoutDetails: (...args: unknown[]) => mockCheckoutDetails(...args),
}));

const mockFetchQuote = jest.fn();
jest.mock('@/lib/api/quote', () => ({
  fetchQuote: (...args: unknown[]) => mockFetchQuote(...args),
}));

const mockCookies = jest.fn();
jest.mock('next/headers', () => ({
  cookies: () => mockCookies(),
}));

const mockRedirect = jest.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});
jest.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}));

jest.mock('@/app/components/checkout/CheckoutLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="checkout-layout">{children}</div>
  ),
}));

jest.mock('@/app/components/checkout/CheckoutNotReadyContent', () => ({
  __esModule: true,
  default: ({ message }: { message: string }) => <div data-testid="not-ready">{message}</div>,
}));

jest.mock('./CheckoutClient', () => ({
  __esModule: true,
  default: () => <div data-testid="checkout-client" />,
}));

describe('renderCheckoutPage', () => {
  const readyQuoteResponse: CheckoutDetailsResponse = {
    __typename: 'CheckoutReady',
    buyer: { firstName: 'Sam', id: 'buyer-1' },
    options: [],
    purchasable: {
      currencyCode: 'USD',
      entitledHours: 1,
      id: 'quote-123',
      name: 'Quote',
      priceCents: 100,
      type: 'QUOTE',
    },
  };

  const readyCatalogResponse: CheckoutDetailsResponse = {
    __typename: 'CheckoutReadyForGuest',
    options: [],
    purchasable: {
      currencyCode: 'USD',
      entitledHours: 1,
      id: 'catalog-1',
      name: 'Catalog',
      priceCents: 200,
      type: 'CATALOG_ITEM',
    },
  };

  const quoteResponse: QuoteResponse = {
    hasInstallments: false,
    isPackage: false,
    leadUuid: 'lead-1',
    numberOfPayments: 1,
    quote: {
      id: 'quote-123',
      items: [],
      number_of_payments: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockResolvedValue({
      getAll: jest.fn().mockReturnValue([]),
    });
  });

  it('renders missing-info state when no purchasable id is provided', async () => {
    render(await renderCheckoutPage({ logPrefix: 'Test', searchParams: Promise.resolve({}) }));

    expect(screen.getByTestId('not-ready')).toHaveTextContent(
      CHECKOUT_ERROR_MESSAGES.MISSING_QUOTE_ID_OR_CATALOG_ITEM_ID
    );
    expect(mockCheckoutDetails).not.toHaveBeenCalled();
    expect(mockFetchQuote).not.toHaveBeenCalled();
    expect(mockCookies).not.toHaveBeenCalled();
  });

  it('fetches quote data when q param is present', async () => {
    mockCheckoutDetails.mockResolvedValue(readyQuoteResponse);
    mockFetchQuote.mockResolvedValue(quoteResponse);

    render(
      await renderCheckoutPage({
        logPrefix: 'Test',
        searchParams: Promise.resolve({ q: 'quote-123' }),
      })
    );

    expect(mockCheckoutDetails).toHaveBeenCalledTimes(1);
    const [args] = mockCheckoutDetails.mock.calls[0];
    expect(args).toMatchObject({
      purchasableID: 'quote-123',
      purchasableType: 'QUOTE',
    });
    expect(mockFetchQuote).toHaveBeenCalledWith('quote-123');
    expect(screen.getByTestId('checkout-client')).toBeInTheDocument();
  });

  it('uses first q value when q is an array', async () => {
    mockCheckoutDetails.mockResolvedValue(readyQuoteResponse);
    mockFetchQuote.mockResolvedValue(quoteResponse);

    render(
      await renderCheckoutPage({
        logPrefix: 'Test',
        searchParams: Promise.resolve({ q: ['quote-123', 'quote-456'] }),
      })
    );

    expect(mockCheckoutDetails).toHaveBeenCalledTimes(1);
    const [args] = mockCheckoutDetails.mock.calls[0];
    expect(args).toMatchObject({
      purchasableID: 'quote-123',
      purchasableType: 'QUOTE',
    });
    expect(mockFetchQuote).toHaveBeenCalledWith('quote-123');
  });

  it('skips quote fetch when catalogItemId param is present', async () => {
    mockCheckoutDetails.mockResolvedValue(readyCatalogResponse);

    render(
      await renderCheckoutPage({
        logPrefix: 'Test',
        searchParams: Promise.resolve({ catalogItemId: 'catalog-1' }),
      })
    );

    expect(mockCheckoutDetails).toHaveBeenCalledTimes(1);
    const [args] = mockCheckoutDetails.mock.calls[0];
    expect(args).toMatchObject({
      purchasableID: 'catalog-1',
      purchasableType: 'CATALOG_ITEM',
    });
    expect(mockFetchQuote).not.toHaveBeenCalled();
    expect(screen.getByTestId('checkout-client')).toBeInTheDocument();
  });

  it('renders invalid-quote state for INVALID_QUOTE', async () => {
    mockCheckoutDetails.mockResolvedValue({
      __typename: 'CheckoutNotReady',
      reason: 'INVALID_QUOTE',
    });

    render(
      await renderCheckoutPage({
        logPrefix: 'Test',
        searchParams: Promise.resolve({ q: 'quote-1' }),
      })
    );

    expect(screen.getByTestId('not-ready')).toHaveTextContent(
      CHECKOUT_ERROR_MESSAGES.INVALID_QUOTE
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects to login when authentication is required', async () => {
    mockCheckoutDetails.mockResolvedValue({
      __typename: 'CheckoutNotReady',
      reason: 'AUTHENTICATION_REQUIRED',
    });

    const searchParams = Promise.resolve({ p: 'SAVE20', q: 'quote-1' });
    const expectedReturnTo = `${CHECKOUT_PAGE_URL}?p=SAVE20&q=quote-1`;
    const expectedRedirect = `${SIGN_IN_PAGE_URL}?return_to=${encodeURIComponent(expectedReturnTo)}`;

    await expect(renderCheckoutPage({ logPrefix: 'Test', searchParams })).rejects.toThrow(
      `NEXT_REDIRECT:${expectedRedirect}`
    );
    expect(mockRedirect).toHaveBeenCalledWith(expectedRedirect);
  });
});
