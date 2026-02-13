/**
 * Checkout hero section - left side of the checkout page
 */

import Image from 'next/image';

import { assetUrl } from '@/lib/utils/asset-url';

export default function CheckoutHero() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-4 md:py-16">
      <div className="max-w-[290px] text-center md:max-w-[446px] md:mt-24">
        <p className="mb-4 text-sm font-medium text-gray-600">Complete your purchase</p>
        <h1 className="mb-6 text-xl font-medium leading-snug text-brand-text md:text-5xl md:font-bold md:leading-tight">
          Your personalized learning experience is just one step away
        </h1>

        {/* Trustpilot Reviews */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <Image
            alt="4.5 of 5 stars"
            height={16}
            src={assetUrl('/images/stars-4.5-1.svg')}
            unoptimized
            width={87}
          />
          <span className="text-sm font-medium text-gray-700">11,095 Trustpilot Reviews</span>
        </div>
      </div>
    </div>
  );
}
