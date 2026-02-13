'use client';

/**
 * PayPal button component
 */

import Image from 'next/image';

import { assetUrl } from '@/lib/utils/asset-url';

interface PayPalButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export default function PayPalButton({ disabled = false, onClick }: PayPalButtonProps) {
  return (
    <button
      className="flex h-[54px] w-full max-w-[400px] items-center justify-center rounded-btn bg-[#FFC439] px-6 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Image
        alt="PayPal"
        height={24}
        src={assetUrl('/images/paypal-button-checkout-logo.svg')}
        style={{ height: '24px', maxWidth: 'none', width: '75.75px' }}
        unoptimized
        width={75.75}
      />
    </button>
  );
}
