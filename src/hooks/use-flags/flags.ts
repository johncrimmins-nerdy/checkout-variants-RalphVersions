export const FLAGS = {
  ACT_417_ONBOARDING_WIZARD: 'ACT-417-onboarding-wizard' as const,
  ECOMM_587_PURCHASE_RETRY: 'ECOMM-587' as const,
  ECOMM_614_LEAD_RESUBMISSION: 'ECOMM-614-lead-resubmission' as const,
  ECOMM_682_NEW_CHECKOUT_PROMO_CODES: 'ECOMM-682-new-checkout-promo-codes' as const,
  ECOMM_827_CHURNED_CLIENT_PROMOCODE: 'ECOMM-827-churned-client-promocode' as const,
} as const;

export type FlagTypes = {
  [FLAGS.ACT_417_ONBOARDING_WIZARD]: string;
  [FLAGS.ECOMM_587_PURCHASE_RETRY]: boolean;
  [FLAGS.ECOMM_614_LEAD_RESUBMISSION]: boolean;
  [FLAGS.ECOMM_682_NEW_CHECKOUT_PROMO_CODES]: string;
  [FLAGS.ECOMM_827_CHURNED_CLIENT_PROMOCODE]: string;
};
