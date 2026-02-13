export const FLAGS = {
  ECOMM_587: 'ECOMM-587-purchase-retry' as const,
  ECOMM_614_LEAD_RESUBMISSION: 'ECOMM-614-lead-resubmission' as const,
  ECOMM_682_NEW_CHECKOUT_PROMO_CODES: 'ECOMM-682-new-checkout-promo-codes' as const,
  ECOMM_685_AI_PERSONALIZED: 'ECOMM-685-AI-winback-message' as const,
  ECOMM_771_RETARGETING: 'ECOMM-771-retargeting' as const,
  ECOMM_827_CHURNED_CLIENT_PROMOCODE: 'ECOMM-827-churned-client-promocode' as const,
  ECOMM_829_LUMINEX_THEME: 'ECOMM-829-Luminex-Theme-Enabled' as const,
} as const;

export type FlagTypes = {
  [FLAGS.ECOMM_587]: boolean;
  [FLAGS.ECOMM_614_LEAD_RESUBMISSION]: boolean;
  [FLAGS.ECOMM_682_NEW_CHECKOUT_PROMO_CODES]: 'control' | 'default' | 'variant';
  [FLAGS.ECOMM_685_AI_PERSONALIZED]: boolean;
  [FLAGS.ECOMM_771_RETARGETING]: boolean;
  [FLAGS.ECOMM_827_CHURNED_CLIENT_PROMOCODE]: 'none' | string;
  [FLAGS.ECOMM_829_LUMINEX_THEME]: boolean;
};
