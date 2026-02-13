'use client';

import { Heart, ArrowRight, Star, Shield, RefreshCw } from 'lucide-react';
import type { SubjectContent } from '../content';

export function PerfectMatchFooter({ content }: { content: SubjectContent }) {
  return (
    <section className="bg-gradient-to-br from-[#1e3a5f] via-[#2d3a6f] to-[#7c3aed] px-5 py-20 md:px-[60px]">
      <div className="mx-auto max-w-[900px] text-center">
        {/* Guarantee Badge */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
          <Heart className="h-10 w-10 text-[#ec4899]" />
        </div>

        <h2 className="mb-4 text-3xl font-black text-white md:text-4xl">
          We Guarantee You&apos;ll Love Your Tutor Match
        </h2>

        <p className="mx-auto mb-8 max-w-[650px] text-lg leading-relaxed text-white/80">
          Our matching algorithm considers learning style, personality, subject expertise, and scheduling preferences. If your match isn&apos;t perfect, we&apos;ll find someone who is—at no extra cost.
        </p>

        {/* Trust Points */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <div className="flex items-center gap-2 text-white/80">
            <Shield className="h-5 w-5 text-[#10b981]" />
            <span className="text-sm font-medium">94% First-Match Success</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <RefreshCw className="h-5 w-5 text-[#10b981]" />
            <span className="text-sm font-medium">Free Rematch Within 24hrs</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Star className="h-5 w-5 text-[#f59e0b]" />
            <span className="text-sm font-medium">4.9/5 Tutor Rating</span>
          </div>
        </div>

        {/* CTA */}
        <a
          href="#"
          className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] px-10 py-5 text-lg font-bold text-white shadow-[0_6px_25px_rgba(16,185,129,0.4)] transition-all hover:-translate-y-[3px] hover:shadow-[0_10px_35px_rgba(16,185,129,0.5)]"
        >
          {content.ctaText}
          <ArrowRight className="h-5 w-5" />
        </a>

        <p className="mt-4 text-sm text-white/60">
          No commitment required • Free consultation available
        </p>
      </div>
    </section>
  );
}
