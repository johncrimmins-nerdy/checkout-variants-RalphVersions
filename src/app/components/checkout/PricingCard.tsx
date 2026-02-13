import { currencySymbol } from '@/lib/utils/currency-symbol';
import { formatPrice } from '@/lib/utils/format-price';

interface PricingCardProps {
  cardLabel?: string;
  currencyCode?: string;
  discountLabel?: string;
  entitledHours: number;
  firstInstallment?: string;
  hasInstallments?: boolean;
  isPackage?: boolean;
  oldPriceCents?: number;
  onSwitchPlan?: () => void;
  planName?: string;
  priceCents: number;
  secondInstallment?: string;
  switcherText?: string;
  variant?: 'dark' | 'dark-inline' | 'light';
}

const darkContainerClass = {
  default: 'rounded-xl border border-luminex-border-30 bg-luminex-card-50 p-5',
  inline: 'mb-6 border-b border-white/10 pb-6',
};

export default function PricingCard({
  cardLabel,
  currencyCode = 'USD',
  discountLabel,
  entitledHours,
  firstInstallment,
  hasInstallments = false,
  isPackage = false,
  oldPriceCents,
  onSwitchPlan,
  planName = 'Standard',
  priceCents,
  secondInstallment,
  switcherText,
  variant = 'light',
}: PricingCardProps) {
  const hasDiscount = oldPriceCents && oldPriceCents > priceCents;
  const isDark = variant === 'dark' || variant === 'dark-inline';
  const isInline = variant === 'dark-inline';

  // Get the currency symbol based on the currency code (e.g., '$', 'CA$', '£')
  const symbol = currencySymbol(currencyCode);

  // Generate installment display text
  const installmentSummary =
    hasInstallments && firstInstallment && secondInstallment
      ? firstInstallment === secondInstallment
        ? `2 installments of ${symbol}${firstInstallment}`
        : `Installments of ${symbol}${firstInstallment} and ${symbol}${secondInstallment}`
      : null;

  const installmentDetails =
    hasInstallments && firstInstallment && secondInstallment
      ? `Your total is ${symbol}${formatPrice(priceCents)}. You'll pay ${symbol}${firstInstallment} today, and then pay ${symbol}${secondInstallment} in 30 days.`
      : null;

  // Price suffix: /mo for memberships, empty for packages
  const priceSuffix = isPackage ? '' : '/mo';

  // Format discount label for dark theme: "-20%" becomes "Save 20%"
  const darkDiscountLabel =
    discountLabel && discountLabel.startsWith('-')
      ? `Save ${discountLabel.slice(1)}`
      : discountLabel;

  if (isDark) {
    const containerClass = isInline ? darkContainerClass.inline : darkContainerClass.default;

    return (
      <div className={containerClass}>
        <div className="mb-3">
          <span className="text-sm font-medium text-white/60">
            {cardLabel || (isPackage ? 'Package details' : 'Your Recommended Plan')}
          </span>
        </div>

        <h3 className="mb-2 text-xl font-medium text-white">{planName}</h3>

        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-sm font-medium text-white/80">
            {entitledHours} hours{isPackage ? '' : ' of 1-on-1 tutoring per month'}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-medium text-white">
              {symbol}
              {formatPrice(priceCents)}
            </span>
            {priceSuffix && (
              <span className="text-sm font-medium text-white/60">{priceSuffix}</span>
            )}
          </div>
        </div>

        {hasDiscount && (
          <div className="mb-3 flex items-center justify-between">
            {hasInstallments && installmentSummary ? (
              <span className="text-sm font-medium text-accent-cyan">{installmentSummary}</span>
            ) : (
              darkDiscountLabel && (
                <span className="rounded bg-accent-purple px-2 py-1 text-xs font-normal text-white">
                  {darkDiscountLabel}
                </span>
              )
            )}
            <span className="text-sm font-normal text-white/80 line-through">
              {symbol}
              {formatPrice(oldPriceCents)}
              {priceSuffix}
            </span>
          </div>
        )}

        {hasInstallments && installmentSummary && !hasDiscount && (
          <div className="mb-2">
            <span className="text-sm font-medium text-accent-cyan">{installmentSummary}</span>
          </div>
        )}

        {hasInstallments && installmentDetails && (
          <div className="mt-3">
            <p className="text-xs text-white/70">{installmentDetails}</p>
          </div>
        )}

        {switcherText && onSwitchPlan && (
          <button
            className="track-click mt-4 text-sm font-medium text-accent-cyan hover:underline"
            data-element_id="plan-switcher"
            data-element_type="button"
            data-page_section="plan-select"
            onClick={onSwitchPlan}
            type="button"
          >
            {switcherText}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6 w-full max-w-[400px] border-b border-gray-200 pb-[5px]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          {isPackage ? 'Package details' : 'Selected plan'}
        </span>
        {hasInstallments && installmentSummary && (
          <span className="text-sm font-medium text-brand-text">{installmentSummary}</span>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold text-brand-text">{entitledHours} hours</div>
        <div className="flex items-baseline gap-2">
          {hasDiscount && discountLabel && (
            <span className="font-semibold text-brand-error">{discountLabel}</span>
          )}
          <span className="text-2xl font-bold text-brand-text">
            {symbol}
            {formatPrice(priceCents)}
            {priceSuffix && (
              <span className="text-base font-normal text-gray-600">{priceSuffix}</span>
            )}
          </span>
        </div>
      </div>

      {hasDiscount && (
        <div className="mt-1 flex items-center justify-end">
          <span className="text-sm text-brand-error line-through">
            {symbol}
            {formatPrice(oldPriceCents)}
            {priceSuffix}
          </span>
        </div>
      )}

      {/* Installment Details - only for packages with installments */}
      {hasInstallments && installmentDetails && (
        <div className="mt-3">
          <p className="text-xs text-gray-600">{installmentDetails}</p>
        </div>
      )}
      {/* Plan Switcher */}
      {switcherText && onSwitchPlan && (
        <button
          className="track-click mt-2 text-sm font-medium text-blue-600 hover:underline"
          data-element_id="plan-switcher"
          data-element_type="button"
          data-page_section="plan-select"
          onClick={onSwitchPlan}
          type="button"
        >
          {switcherText}
        </button>
      )}
    </div>
  );
}
