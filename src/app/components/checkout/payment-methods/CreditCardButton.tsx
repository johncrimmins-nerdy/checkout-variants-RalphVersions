'use client';

import Image from 'next/image';

import type { ThemeVariant } from '@/lib/styles/theme';

import { assetUrl } from '@/lib/utils/asset-url';

interface CreditCardButtonProps {
  disabled?: boolean;
  onClick: () => void;
  variant?: ThemeVariant;
}

const themeStyles: Record<ThemeVariant, { button: string; iconClass: string }> = {
  dark: {
    button: 'bg-transparent border-white text-white hover:shadow-btn-dark',
    iconClass: '',
  },
  light: {
    button: 'bg-white border-black text-brand-text hover:shadow-md',
    iconClass: 'brightness-0',
  },
};

export default function CreditCardButton({
  disabled = false,
  onClick,
  variant = 'light',
}: CreditCardButtonProps) {
  const { button, iconClass } = themeStyles[variant];

  return (
    <button
      className={`track-click mt-4 flex w-full max-w-[400px] items-center justify-center gap-3 rounded-pill border px-6 py-4 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${button}`}
      data-element_id="credit_card"
      data-element_type="button"
      data-page_section="express_checkout"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Image
        alt="Credit Card"
        className={`h-6 w-6 ${iconClass}`}
        height={24}
        src={assetUrl('/images/credit-card-icon.svg')}
        unoptimized
        width={24}
      />
      <span className="text-base font-medium">Credit Card</span>
    </button>
  );
}
