'use client';

import { ArrowRight, Clock } from 'lucide-react';

import type { SubjectContent } from '../content';

interface Props {
  content: SubjectContent;
}

export function PurpleCtaFooter({ content }: Props) {
  return (
    <section className="px-4 md:px-8 lg:px-12 py-3 md:py-4 bg-gradient-to-r from-[#0f2744] to-[#1e3a5f]">
      <div className="mx-auto max-w-3xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Urgency Text */}
        <div className="flex items-center gap-2 text-white/80">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs md:text-sm font-medium">
            {content.urgencyText} &mdash;{' '}
            <span className="text-amber-400 font-bold">
              Only {content.spotsLeft} spots left
            </span>
          </span>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-bold text-sm md:text-base shadow-[0_6px_25px_rgba(124,58,237,0.4)] hover:shadow-[0_10px_35px_rgba(124,58,237,0.55)] hover:-translate-y-0.5 transition-all duration-200"
        >
          {content.ctaText}
          <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}
