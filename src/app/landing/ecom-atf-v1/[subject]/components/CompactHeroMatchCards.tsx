'use client';

import { CheckCircle, ArrowRight } from 'lucide-react';
import type { SubjectContent } from '../content';

interface Props {
  content: SubjectContent;
}

export function CompactHeroMatchCards({ content }: Props) {
  return (
    <section className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 px-6 lg:px-12 xl:px-16 pt-6 lg:pt-8">
      {/* Left: Content */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-black text-[#0f2744] leading-tight mb-3">
          {content.headline}{' '}
          <span className="bg-gradient-to-r from-[#7c3aed] to-pink-500 bg-clip-text text-transparent">
            {content.headlineHighlight}
          </span>
        </h1>

        <p className="text-sm lg:text-base text-[#64748b] mb-4 leading-relaxed max-w-lg">
          {content.subhead}
        </p>

        <ul className="space-y-1.5 mb-4">
          {content.benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm font-medium text-[#1e3a5f]">
              <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>

        <a
          href="#"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white px-6 py-3 rounded-xl font-bold text-sm lg:text-base shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200"
        >
          {content.ctaText}
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Right: Compact Match Cards */}
      <div className="flex items-center justify-center gap-3 lg:gap-4 flex-shrink-0">
        {/* Tutor Card */}
        <div className="bg-white rounded-2xl p-3 lg:p-4 shadow-xl shadow-black/10 -rotate-3 hover:-rotate-3 hover:-translate-y-1 transition-transform duration-300 w-[160px] lg:w-[190px]">
          <div className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-[#7c3aed] mb-2">
            {content.tutorLabel}
          </div>
          <div className="w-full h-24 lg:h-28 rounded-lg mb-2 overflow-hidden bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-[#7c3aed] to-purple-400 flex items-center justify-center text-white font-bold text-lg lg:text-xl">
              {content.tutorName.charAt(0)}
            </div>
          </div>
          <div className="text-xs lg:text-sm font-bold text-[#1e3a5f] mb-1">{content.tutorName}</div>
          <div className="flex gap-1 mb-2 flex-wrap">
            {content.tutorSchools.map((school) => (
              <span key={school} className="text-[9px] lg:text-[10px] font-bold text-[#1e3a5f]/60">{school}</span>
            ))}
          </div>
          <span className="inline-block bg-[#f8fafc] px-2 py-1 rounded-full text-[10px] lg:text-[11px] font-semibold text-[#64748b]">
            <strong className="text-[#1e3a5f]">{content.tutorStat}</strong> {content.tutorStatLabel}
          </span>
        </div>

        {/* Match Connector */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-500/30">
            +
          </div>
          <span className="text-[8px] lg:text-[9px] font-bold text-[#10b981] uppercase tracking-wider">
            Match
          </span>
        </div>

        {/* Student Card */}
        <div className="bg-white rounded-2xl p-3 lg:p-4 shadow-xl shadow-black/10 rotate-3 hover:rotate-3 hover:-translate-y-1 transition-transform duration-300 w-[160px] lg:w-[190px]">
          <div className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-[#10b981] mb-2">
            Student Success
          </div>
          <div className="w-full h-24 lg:h-28 rounded-lg mb-2 overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-[#10b981] to-emerald-400 flex items-center justify-center text-white font-bold text-lg lg:text-xl">
              {content.studentName.charAt(0)}
            </div>
          </div>
          <div className="text-xs lg:text-sm font-bold text-[#1e3a5f] mb-1">{content.studentName}</div>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[11px] lg:text-xs text-[#64748b] line-through">{content.scoreBefore}</span>
            <span className="text-[#10b981] font-bold text-xs">→</span>
            <span className="text-sm lg:text-base font-extrabold text-[#10b981]">{content.scoreAfter}</span>
          </div>
          <span className="inline-block bg-gradient-to-r from-[#10b981] to-[#059669] text-white px-2 py-1 rounded-full text-[10px] lg:text-[11px] font-semibold">
            <strong>{content.scoreGain}</strong>
          </span>
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-amber-200 p-1.5 rounded-md mt-2">
            <CheckCircle className="w-3 h-3 text-amber-600" />
            <span className="text-[8px] lg:text-[9px] font-bold text-amber-900">{content.achievementBadge}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
