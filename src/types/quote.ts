/**
 * Quote types for pricing quotes
 */

export interface Quote {
  id: string;
  items: QuoteItem[];
  lead_uuid?: string;
  number_of_payments: number;
}

export interface QuoteItem {
  currency_code?: string;
  id: string;
  item_id: string;
  item_type_id: number;
  list_price_cents: number;
  promotions?: Array<{
    amount_cents: number;
    code: string;
    id: string;
    name: string;
  }>;
  quoted_price_cents: number;
}
