'use client';

import Image from 'next/image';

import type { PersonalizedMessage } from '@/lib/constants/retargeting-messages';

import { Container } from '@/components/layout';
import { assetUrl } from '@/lib/utils/asset-url';

import AuthenticationModal from './AuthenticationModal';
import LoggedInToast from './LoggedInToast';
import WelcomeBackHero from './WelcomeBackHero';

interface WelcomeBackLayoutProps {
  buyerFirstName?: string;
  children: React.ReactNode;
  isLeadResubmission?: boolean;
  personalizedMessage?: PersonalizedMessage;
  showAuthModal?: boolean;
  showLoggedInToast?: boolean;
}

export default function WelcomeBackLayout({
  buyerFirstName,
  children,
  isLeadResubmission = false,
  personalizedMessage,
  showAuthModal = false,
  showLoggedInToast = false,
}: WelcomeBackLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-luminex-bg">
      {/* Top-left gradient glow */}
      <Image
        alt=""
        className="pointer-events-none absolute left-0 top-0 z-0 h-auto max-w-full w-auto"
        height={1000}
        src={assetUrl('/images/luminex-glow.png')}
        unoptimized
        width={2263}
      />

      {/* Bottom-right gradient glow - positioned relative to viewport, not container */}
      <Image
        alt=""
        className="pointer-events-none absolute -bottom-20 right-0 z-0 rotate-180 opacity-60 h-auto min-w-[900px] w-[60vw] max-w-[1200px]"
        height={1200}
        src={assetUrl('/images/luminex-glow.png')}
        unoptimized
        width={2263}
      />

      <header className="relative z-10 px-6 py-4">
        <Image
          alt="Varsity Tutors"
          className="h-8 w-auto brightness-0 invert"
          height={32}
          src={assetUrl('/images/varsity-tutors-logo.svg')}
          unoptimized
          width={180}
        />
      </header>

      <LoggedInToast visible={showLoggedInToast} />

      <AuthenticationModal visible={showAuthModal} />

      <Container maxWidth="1440px">
        <div className="relative z-10 flex min-h-[calc(100vh-80px)] flex-col lg:flex-row">
          <div className="w-full p-6 lg:w-1/2 lg:p-12">
            <WelcomeBackHero
              buyerFirstName={buyerFirstName}
              isLeadResubmission={isLeadResubmission}
              personalizedMessage={personalizedMessage}
            />
          </div>

          <div className="relative w-full lg:w-1/2">
            <div className="relative z-10 flex min-h-full items-start justify-center p-6 lg:p-12">
              <div className="w-full max-w-md">{children}</div>
            </div>
          </div>
        </div>
      </Container>

      <div className="fixed bottom-6 left-6 z-20">
        <p className="text-sm font-normal text-white/60">
          Need help choosing? Speak with an education consultant at{' '}
          <a
            className="font-medium text-accent-cyan underline hover:text-accent-cyan-hover"
            href="tel:888-402-6378"
          >
            888-402-6378
          </a>
        </p>
      </div>
    </div>
  );
}
