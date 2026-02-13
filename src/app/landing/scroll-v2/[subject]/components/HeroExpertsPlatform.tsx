'use client';

import { ArrowRight, Check, Star, CheckCircle, RefreshCw } from 'lucide-react';
import type { SubjectContent } from '../content';

export function HeroExpertsPlatform({ content }: { content: SubjectContent }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-[60px] pt-[50px] md:px-[60px]">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-[60px]">
        {/* Left Column - Content */}
        <div>
          <h1 className="mb-5 text-3xl font-black leading-[1.15] text-[#0f2744] md:text-[3rem]">
            {content.headline}{' '}
            <span className="bg-gradient-to-br from-[#7c3aed] to-[#ec4899] bg-clip-text text-transparent">
              {content.headlineHighlight}
            </span>
          </h1>

          <p className="mb-6 text-lg leading-[1.7] text-[#64748b]">
            {content.subhead}
          </p>

          <ul className="mb-6 space-y-2">
            {content.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-3 text-base font-medium text-[#1e3a5f]"
              >
                <Check className="h-6 w-6 flex-shrink-0 text-[#10b981]" />
                {benefit}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-6">
            <a
              href="#"
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] px-8 py-4 text-lg font-bold text-white shadow-[0_6px_25px_rgba(16,185,129,0.35)] transition-all hover:-translate-y-[3px] hover:shadow-[0_10px_35px_rgba(16,185,129,0.45)]"
            >
              {content.ctaText}
              <ArrowRight className="h-5 w-5" />
            </a>
            <div className="flex items-center gap-2.5">
              <div className="flex gap-0.5 text-[#f59e0b]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-[18px] w-[18px] fill-current" />
                ))}
              </div>
              <span className="text-sm text-[#64748b]">
                <strong className="text-[#1e3a5f]">4.9/5</strong> from 11,500+ Reviews
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - 3-Part Visual Composition */}
        <div className="flex min-h-[450px] items-center justify-center md:min-h-[450px]">
          <div className="relative h-[420px] w-full max-w-[520px] scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100">
            {/* Platform Card (Background) */}
            <div className="absolute left-0 top-0 z-[1] w-[280px] rounded-3xl bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <div className="mb-2 text-xs font-semibold tracking-[0.5px] text-[#64748b]">
                {content.platformLabel}
              </div>
              <div className="text-[4rem] font-black leading-none text-[#0f2744]">
                {content.platformScore}
              </div>
              <div className="mb-5 mt-4 text-[11px] font-semibold uppercase tracking-[1px] text-[#94a3b8]">
                {content.platformScoreLabel}
              </div>

              {/* Breakdown */}
              <div className="mb-[18px] rounded-xl bg-[#f8fafc] px-4 py-3">
                <div className="mb-0.5 text-[11px] font-semibold text-[#64748b]">
                  {content.breakdownLabel}
                </div>
                <div className="text-[1.6rem] font-extrabold text-[#1e3a5f]">
                  {content.breakdownScore}
                </div>
                <div className="text-[11px] text-[#94a3b8]">
                  {content.breakdownDetail}
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5 rounded-full border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-xs font-medium text-[#64748b]">
                  <CheckCircle className="h-[18px] w-[18px] text-[#10b981]" />
                  Calculating current baseline...
                </div>
                <div className="flex items-center gap-2.5 rounded-full border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-xs font-medium text-[#64748b]">
                  <CheckCircle className="h-[18px] w-[18px] text-[#10b981]" />
                  Confirming goal score and exam date...
                </div>
                <div className="flex items-center gap-2.5 rounded-full border-transparent bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5] px-3.5 py-2.5 text-xs font-medium text-[#10b981]">
                  <RefreshCw className="h-[18px] w-[18px] animate-spin" />
                  Finalizing your study plan...
                </div>
              </div>
            </div>

            {/* Student Photo Card (Foreground) */}
            <div className="absolute right-0 top-5 z-[2] h-[360px] w-[280px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#e0e7ff] to-[#c7d2fe] shadow-[0_25px_70px_rgba(0,0,0,0.12)]">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-white/60 text-4xl font-black text-[#7c3aed]">
                    {content.studentName.charAt(0)}
                  </div>
                  <div className="text-sm font-semibold text-[#1e3a5f]">
                    {content.studentName}
                  </div>
                  <div className="text-xs text-[#64748b]">Happy Student</div>
                </div>
              </div>
            </div>

            {/* Tutor Badge (Floating) */}
            <div className="absolute bottom-[30px] left-5 z-[3] flex items-center gap-3.5 rounded-2xl bg-white p-4 px-5 shadow-[0_15px_40px_rgba(0,0,0,0.12)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#10b981] bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5] text-xl font-black text-[#059669]">
                {content.tutorName.charAt(0)}
              </div>
              <div className="flex flex-col gap-px">
                <div className="text-[9px] font-semibold uppercase tracking-[0.5px] text-[#10b981]">
                  {content.tutorLabel}
                </div>
                <div className="text-sm font-bold text-[#1e3a5f]">
                  {content.tutorName}
                </div>
                <div className="text-[11px] text-[#64748b]">
                  {content.tutorCredentials}
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5] px-2.5 py-1.5 text-[13px] font-bold text-[#059669]">
                <CheckCircle className="h-3.5 w-3.5" />
                {content.tutorStat}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
