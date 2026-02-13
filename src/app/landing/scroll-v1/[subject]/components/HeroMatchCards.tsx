'use client';

import { ArrowRight, Check, Star } from 'lucide-react';

import type { SubjectContent } from '../content';

export function HeroMatchCards({ content }: { content: SubjectContent }) {
  return (
    <section className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-10 md:grid-cols-2 md:px-[60px]">
      {/* Left: Content */}
      <div>
        <h1 className="mb-4 text-3xl font-black leading-tight text-[#0f2744] md:text-5xl">
          {content.headline}{' '}
          <span className="bg-gradient-to-br from-[#7c3aed] to-[#ec4899] bg-clip-text text-transparent">
            {content.headlineHighlight}
          </span>
        </h1>
        <p className="mb-5 text-lg leading-relaxed text-[#64748b]">
          {content.subhead.split('score-raising expert.')[0]}
          <strong className="text-[#1e3a5f]">score-raising expert.</strong>
          {content.subhead.includes('score-raising expert.')
            ? ''
            : ''}
        </p>

        <ul className="mb-5 space-y-2">
          {content.benefits.map((benefit) => (
            <li
              className="flex items-center gap-2.5 text-[15px] font-medium text-[#1e3a5f]"
              key={benefit}
            >
              <Check className="h-[22px] w-[22px] shrink-0 text-[#10b981]" />
              {benefit}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-5">
          <a
            className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-br from-[#10b981] to-[#059669] px-[30px] py-3.5 font-bold text-white shadow-[0_6px_25px_rgba(16,185,129,0.35)] transition-all hover:-translate-y-[3px] hover:shadow-[0_10px_35px_rgba(16,185,129,0.45)]"
            href="#"
          >
            {content.ctaText}
            <ArrowRight className="h-5 w-5" />
          </a>
          <div className="flex items-center gap-2.5">
            <div className="flex gap-0.5 text-[#f59e0b]">
              {[...Array(5)].map((_, i) => (
                <Star className="h-[18px] w-[18px] fill-current" key={i} />
              ))}
            </div>
            <span className="text-sm text-[#64748b]">
              <strong className="text-[#1e3a5f]">4.9/5</strong> from 11,500+ Reviews
            </span>
          </div>
        </div>
      </div>

      {/* Right: Match Cards Visual */}
      <div className="flex flex-wrap items-center justify-center gap-5 p-5">
        {/* Tutor Card */}
        <div className="w-[240px] rounded-[20px] bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-[5px] md:-rotate-3 md:hover:-translate-y-[5px] md:hover:-rotate-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#7c3aed]">
            {content.tutorLabel}
          </div>
          <div className="mb-3 h-40 overflow-hidden rounded-xl bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb]">
            <div className="flex h-full items-center justify-center text-4xl font-bold text-[#7c3aed]/30">
              {content.tutorName.charAt(0)}
            </div>
          </div>
          <div className="mb-1.5 text-sm font-bold text-[#1e3a5f]">{content.tutorName}</div>
          <div className="mb-2.5 flex flex-wrap gap-2">
            {content.tutorSchools.map((school, i) => (
              <span key={school}>
                <span className="text-[11px] font-bold text-[#1e3a5f]/70">{school}</span>
                {i < content.tutorSchools.length - 1 && (
                  <span className="ml-2 text-[11px] font-bold text-[#1e3a5f]/70">
                    &bull;
                  </span>
                )}
              </span>
            ))}
          </div>
          <span className="inline-block rounded-[20px] bg-[#f8fafc] px-3 py-1.5 text-[11px] font-semibold text-[#64748b]">
            <strong className="text-[#1e3a5f]">{content.tutorStat}</strong>{' '}
            {content.tutorStatLabel}
          </span>
        </div>

        {/* Match Connector */}
        <div className="flex flex-col items-center gap-2 px-2.5">
          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] text-2xl text-white shadow-[0_8px_25px_rgba(16,185,129,0.4)]">
            +
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#10b981]">
            Perfect Match
          </span>
        </div>

        {/* Student Card */}
        <div className="w-[240px] rounded-[20px] bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-[5px] md:rotate-3 md:hover:-translate-y-[5px] md:hover:rotate-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#10b981]">
            Ambitious Student
          </div>
          <div className="mb-3 h-40 overflow-hidden rounded-xl bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb]">
            <div className="flex h-full items-center justify-center text-4xl font-bold text-[#10b981]/30">
              {content.studentName.charAt(0)}
            </div>
          </div>
          <div className="mb-1.5 text-sm font-bold text-[#1e3a5f]">{content.studentName}</div>
          <div className="mb-2.5 flex items-center gap-1.5">
            <span className="text-[13px] text-[#64748b] line-through">{content.scoreBefore}</span>
            <span className="font-bold text-[#10b981]">&rarr;</span>
            <span className="text-[15px] font-extrabold text-[#10b981]">{content.scoreAfter}</span>
          </div>
          <span className="inline-block rounded-[20px] bg-gradient-to-br from-[#10b981] to-[#059669] px-3 py-1.5 text-[11px] font-semibold text-white">
            <strong>{content.scoreGain}</strong> points
          </span>
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#fef3c7] to-[#fde68a] px-2.5 py-1.5">
            <Check className="h-3.5 w-3.5 text-[#d97706]" />
            <span className="text-[10px] font-bold text-[#92400e]">
              {content.achievementBadge}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
