'use client';

/**
 * Welcome Back Hero - Left column content with value propositions
 * Font sizes and weights match original Webflow implementation
 */

import Image from 'next/image';

import type { PersonalizedMessage } from '@/lib/constants/retargeting-messages';

import { assetUrl } from '@/lib/utils/asset-url';

import PersonalizedMessageComponent from './PersonalizedMessage';

interface FeatureItemProps {
  children: React.ReactNode;
  isNew?: boolean;
}

interface WelcomeBackHeroProps {
  buyerFirstName?: string;
  isLeadResubmission?: boolean;
  personalizedMessage?: PersonalizedMessage;
}

export default function WelcomeBackHero({
  buyerFirstName,
  isLeadResubmission = false,
  personalizedMessage,
}: WelcomeBackHeroProps) {
  // Different greetings based on flow type
  const renderGreeting = () => {
    if (isLeadResubmission) {
      return (
        <>
          {/* headline-lg: 2.5rem (40px), font-weight 500 */}
          <h1 className="mb-2 text-[2.5rem] font-medium leading-tight text-white">
            You&apos;re one step away from a breakthrough moment,{' '}
            <span className="text-[#9896ed]">{buyerFirstName || 'there'}</span>!
          </h1>
          {/* label-md: 0.875rem (14px), font-weight 500 */}
          <p className="mb-8 text-sm font-medium text-white/80">
            Continue your progress with the tutor you already know and trust.
          </p>
        </>
      );
    }

    return (
      // headline-lg: 2.5rem (40px), font-weight 500
      <h1 className="mb-8 text-[2.5rem] font-medium leading-tight text-white">
        Welcome Back{buyerFirstName && ','}{' '}
        {buyerFirstName && <span className="text-[#9896ed]">{buyerFirstName}</span>}!
      </h1>
    );
  };

  return (
    <div className="max-w-lg">
      {/* Greeting */}
      {renderGreeting()}

      {/* Personalized Message (AI winback or retargeting) */}
      {personalizedMessage && <PersonalizedMessageComponent message={personalizedMessage} />}

      {/* Live+AI Advantage Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-baseline gap-1">
          {/* title-md poppins-light: 1.25rem (20px), font-weight 300 */}
          {/* Original gradient: linear-gradient(96deg, #ffc524, #fb43da 51%, #d684ff 73%, #17e2ea) */}
          <h2
            className="text-xl font-light"
            style={{
              backgroundClip: 'text',
              backgroundImage: 'linear-gradient(96deg, #ffc524, #fb43da 51%, #d684ff 73%, #17e2ea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Live+AI
          </h2>
          <span className="text-[0.625rem] text-white/60">TM</span>
          {/* title-md: 1.25rem (20px), font-weight 500 */}
          <h2 className="ml-1 text-xl font-medium text-white">Advantage</h2>
        </div>

        <div className="space-y-1">
          <FeatureItem>
            <strong>Live 1-to-1 private tutoring</strong> with expert tutor.
          </FeatureItem>
          <FeatureItem>
            <strong>Live weekly prep classes</strong> for focused and intensive strategy sessions.
          </FeatureItem>
          <FeatureItem>
            <strong>Instant video playback</strong> of every session so you can revisit key moments
            on-demand.
          </FeatureItem>
          <FeatureItem isNew>
            <strong>AI session summaries</strong> that deliver concise, time-stamped notes &
            insights.
          </FeatureItem>
          <FeatureItem isNew>
            <strong>Adaptive diagnostics & practice problems</strong> that tailor difficulty and
            focus to your performance.
          </FeatureItem>
          <FeatureItem isNew>
            <strong>AI Tutor —</strong> your on-demand learning coach for explanations, drills, and
            flashcard quizzes.
          </FeatureItem>
        </div>
      </div>

      {/* Trust statement - body-sm: 0.875rem (14px), font-weight 400 */}
      <p className="text-sm font-normal text-white/70">
        The largest live tutoring platform in the U.S., serving 1,000+ schools and millions of
        families.
      </p>
    </div>
  );
}

function FeatureItem({ children, isNew }: FeatureItemProps) {
  return (
    <div className="mb-3 flex items-start gap-3">
      {isNew ? (
        // NEW badge - label-sm style
        <span className="mt-1.5 shrink-0 rounded bg-[#9896ed]/20 px-2 py-0.5 text-xs font-semibold text-[#9896ed]">
          NEW
        </span>
      ) : (
        <Image
          alt=""
          className="mt-0.5 h-8 w-8 shrink-0"
          height={32}
          src={assetUrl('/images/CheckCircle.svg')}
          width={32}
        />
      )}
      {/* text-bullets-2: Karla font, 1rem (16px), font-weight 400, strong is 700 */}
      <p
        className="text-base font-normal leading-relaxed text-white/90"
        style={{ fontFamily: 'Karla, sans-serif' }}
      >
        {children}
      </p>
    </div>
  );
}
