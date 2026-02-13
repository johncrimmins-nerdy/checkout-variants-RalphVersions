/**
 * Tests for types module
 * Verifies type exports are properly structured
 */

import type {
  CatalogItem,
  PersonalizedMessage,
  PriceInfo,
  Quote,
  QuoteItem,
  QuotePromotion,
} from './index';

describe('Types module', () => {
  // Type tests verify the shape of types at compile time
  // Runtime tests verify the module is properly structured

  it('exports CatalogItem type', () => {
    const item: CatalogItem = {
      currencyCode: 'USD',
      durationSeconds: 3600,
      id: '123',
      name: 'Test',
      priceCents: 1000,
    };

    expect(item).toBeDefined();
    expect(item.id).toBe('123');
  });

  it('exports PersonalizedMessage type', () => {
    const message: PersonalizedMessage = {
      body: 'Test body',
      header: 'Test header',
    };

    expect(message).toBeDefined();
    expect(message.header).toBe('Test header');
  });

  it('exports PriceInfo type', () => {
    const priceInfo: PriceInfo = {
      currencyCode: 'USD',
      currentPrice: '$50',
      hasInstallments: false,
      hasPromotions: false,
      paymentAmount: '$50',
      priceCents: 5000,
      priceType: 'membership',
    };

    expect(priceInfo).toBeDefined();
    expect(priceInfo.priceType).toBe('membership');
  });

  it('exports Quote type', () => {
    const quote: Quote = {
      id: 'quote-123',
      items: [],
      number_of_payments: 1,
    };

    expect(quote).toBeDefined();
    expect(quote.id).toBe('quote-123');
  });

  it('exports QuoteItem type', () => {
    const item: QuoteItem = {
      item_id: 'item-1',
      item_type_id: 1,
      list_price_cents: 5000,
      quoted_price_cents: 4500,
    };

    expect(item).toBeDefined();
    expect(item.item_id).toBe('item-1');
  });

  it('exports QuotePromotion type', () => {
    const promo: QuotePromotion = {
      amount_cents: 500,
      code: 'PROMO',
      description: 'Test promo',
      id: 'promo-1',
    };

    expect(promo).toBeDefined();
    expect(promo.code).toBe('PROMO');
  });
});
