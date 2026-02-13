'use client';

/**
 * Personalized Message - displays AI winback or retargeting messages
 * Shows in the hero section (left column) below the welcome greeting
 * Has a vertical gradient accent bar on the left
 */

import type { PersonalizedMessage as PersonalizedMessageType } from '@/lib/constants/retargeting-messages';

interface PersonalizedMessageProps {
  message: PersonalizedMessageType;
}

export default function PersonalizedMessage({ message }: PersonalizedMessageProps) {
  if (!message.header && !message.body) return null;

  return (
    <div className="mb-8 flex gap-4">
      {/* Vertical gradient accent bar - rounded pill shape */}
      <div
        className="w-1 shrink-0 rounded-full"
        style={{
          background:
            'linear-gradient(0deg, #ffc524 0%, #fb43da 25%, #9896ed 50%, #9896ed 92%, #17e2ea 100%)',
        }}
      />
      {/* Message content */}
      <div>
        {message.header && <h3 className="mb-2 text-lg font-bold text-white">{message.header}</h3>}
        {message.body && (
          <p className="text-base font-normal leading-relaxed text-white/90">{message.body}</p>
        )}
      </div>
    </div>
  );
}
