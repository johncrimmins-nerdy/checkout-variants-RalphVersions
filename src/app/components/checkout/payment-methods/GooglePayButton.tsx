'use client';

import Image from 'next/image';

import type { ThemeVariant } from '@/lib/styles/theme';

import { assetUrl } from '@/lib/utils/asset-url';

interface GooglePayButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
  variant?: ThemeVariant;
}

const themeStyles: Record<ThemeVariant, { button: string; icon: string }> = {
  dark: {
    button: 'bg-white border-white text-black hover:brightness-95',
    icon: '/images/google-pay-icon-black.svg',
  },
  light: {
    button: 'bg-black border-transparent text-white hover:opacity-90',
    icon: '/images/google-pay-logo.png',
  },
};

export default function GooglePayButton({
  disabled = false,
  isLoading = false,
  onClick,
  variant = 'light',
}: GooglePayButtonProps) {
  const { button, icon } = themeStyles[variant];
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`track-click flex h-[54px] w-full max-w-[400px] items-center justify-center rounded-btn border px-6 transition-all disabled:cursor-not-allowed ${button} ${
        isLoading ? 'opacity-60 animate-pulse' : 'disabled:opacity-50'
      }`}
      data-element_id="google_pay"
      data-element_type="button"
      data-page_section="express_checkout"
      disabled={isDisabled}
      onClick={onClick}
      type="button"
    >
      <Image
        alt="Google Pay"
        className="w-[61px]"
        height={24}
        src={assetUrl(icon)}
        unoptimized
        width={61}
      />
    </button>
  );
}
