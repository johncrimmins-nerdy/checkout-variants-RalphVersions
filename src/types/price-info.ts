/**
 * Price information interface
 */

export interface PriceInfo {
  currencyCode: string;
  currentPrice: string;
  discountLabel?: string;
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
