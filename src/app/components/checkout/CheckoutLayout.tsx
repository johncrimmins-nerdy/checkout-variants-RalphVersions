import Image from 'next/image';

import CheckoutHero from '@/app/components/checkout/CheckoutHero';
import EscapeHatchButton from '@/app/components/checkout/EscapeHatchButton';
import { Container } from '@/components/layout';
import { assetUrl } from '@/lib/utils/asset-url';

interface CheckoutLayoutProps {
  children: React.ReactNode;
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <Image
          alt="Varsity Tutors"
          className="h-8 w-auto"
          height={32}
          src={assetUrl('/images/vt-logo.svg')}
          unoptimized
          width={180}
        />
      </header>

      <Container className="flex flex-1 flex-col" maxWidth="1440px">
        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="w-full bg-white lg:w-[55%]">
            <CheckoutHero />
          </div>

          <div className="flex w-full items-start justify-center bg-checkout-bg px-6 py-6 md:pb-16 md:pt-32 lg:w-[45%]">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </Container>

      <EscapeHatchButton />
    </div>
  );
}
