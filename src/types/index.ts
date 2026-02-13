/**
 * Core types for the checkout system
 */

// Catalog item types
export interface CatalogItem {
  currencyCode: string;
  durationSeconds: number;
  id: string;
  name: string;
  oldPriceCents?: number;
  priceCents: number;
}

// Personalized message types
export interface PersonalizedMessage {
  body: string;
  header: string;
}

// Price info types
export interface PriceInfo {
  currencyCode: string;
  currentPrice: string;
  firstInstallment?: string;
  hasInstallments: boolean;
  hasPromotions: boolean;
  paymentAmount: string;
  previousPrice?: string;
  previousPriceCents?: number;
  priceCents: number;
  priceType: 'membership' | 'package';
  promotionPercentage?: number;
  secondInstallment?: string;
}

// Quote types
export interface Quote {
  currency_code?: string;
  id: string;
  items: QuoteItem[];
  number_of_payments: number;
}

export interface QuoteItem {
  currency_code?: string;
  item_id: string;
  item_type_id: number;
  list_price_cents: number;
  promotions?: QuotePromotion[];
  quoted_price_cents: number;
}

export interface QuotePromotion {
  amount_cents: number;
  code: string;
  description: string;
  id: string;
}
