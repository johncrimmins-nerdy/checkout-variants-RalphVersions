'use client';

import { ArrowRight, Check, Loader2, Star, UserPlus } from 'lucide-react';

import type { SubjectContent } from '../content';

interface HeroDiagnosticMatchProps {
  content: SubjectContent;
}

export function HeroDiagnosticMatch({ content }: HeroDiagnosticMatchProps) {
  return (
    <section className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 px-6 py-10 lg:px-12 items-center">
      {/* LEFT: Content */}
      <div className="order-1 lg:order-none text-center lg:text-left">
        <h1 className="text-3xl md:text-[2.8rem] font-black text-[#0f2744] leading-[1.1] mb-4">
          {content.headline}{' '}
          <span className="bg-gradient-to-r from-[#7c3aed] to-[#ec4899] bg-clip-text text-transparent">
            {content.headlineHighlight}
          </span>
        </h1>
        <p className="text-[#64748b] text-base leading-relaxed mb-5">
          {content.subhead}
        </p>

        <ul className="mb-6 space-y-1.5 inline-block text-left">
          {content.benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2.5 text-[0.95rem] text-[#1e3a5f] font-medium">
              <Check className="w-5 h-5 text-[#10b981] shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 flex-wrap justify-center lg:justify-start">
          <button className="inline-flex items-center gap-2 bg-gradient-to-br from-[#10b981] to-[#059669] text-white px-7 py-3.5 rounded-xl font-bold text-base shadow-[0_6px_25px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 hover:shadow-[0_10px_35px_rgba(16,185,129,0.45)] transition-all duration-200">
            {content.ctaText}
            <ArrowRight className="w-[18px] h-[18px]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 text-[#f59e0b]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-[13px] text-[#64748b]">
              <strong className="text-[#1e3a5f]">4.9/5</strong> from 11,500+ Reviews
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: 3-Card Visual */}
      <div className="order-0 lg:order-none flex items-start justify-center gap-4 flex-wrap lg:flex-nowrap">
        {/* Student Card */}
        <div className="bg-white rounded-2xl p-3.5 shadow-[0_15px_50px_rgba(0,0,0,0.08)] w-[190px] shrink-0">
          <div className="text-[9px] font-bold uppercase tracking-wider text-[#10b981] mb-2.5">
            Your Student
          </div>
          <div className="w-full h-40 rounded-xl overflow-hidden mb-3 bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe] flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white text-2xl font-bold">
              {content.studentName.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
          <div className="text-base font-extrabold text-[#0f2744] mb-1.5">{content.studentName}</div>
          <div className="flex flex-col gap-1.5">
            <div className="text-[11px] text-[#64748b]">{content.studentSchool}</div>
            <div className="inline-flex items-center gap-1 bg-[#f1f5f9] border border-[#e2e8f0] text-[#0f2744] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold">
              <span className="text-[13px] font-bold">{content.studentTarget}</span> Target
            </div>
            <div className="text-[10px] text-[#64748b]">
              <strong className="text-[#1e3a5f] font-semibold">Test Date:</strong> 4 Months Away
            </div>
            <div className="text-[10px] text-[#64748b] font-medium">
              Score Gap: {content.scoreGap}
            </div>
          </div>
        </div>

        {/* Assessment Card */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_15px_50px_rgba(0,0,0,0.08)] w-[220px] shrink-0">
          <div className="text-[11px] font-semibold text-[#1e3a5f] tracking-wide mb-1">
            {content.diagnosticLabel}
          </div>
          <div className="text-5xl font-black text-[#0f2744] leading-none mb-0.5">
            {content.currentScore}
          </div>
          <div className="text-[8px] font-bold uppercase tracking-[1.5px] text-[#64748b] mb-3">
            Current Score
          </div>

          <div className="flex flex-col gap-1.5">
            {content.diagnosticSteps.map((step) => (
              <div
                key={step}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#ecfdf5] border border-[#d1fae5] rounded-2xl text-[10px] font-medium text-[#059669]"
              >
                <Check className="w-3 h-3 text-[#10b981] shrink-0" />
                {step}
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#ecfdf5] to-[#d1fae5] border border-[#10b981] rounded-2xl text-[10px] font-medium text-[#059669]">
              <UserPlus className="w-3 h-3 text-[#10b981] shrink-0" />
              Perfect Tutor matched
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#f5f3ff] to-[#ede9fe] border border-[#a78bfa] rounded-2xl text-[10px] font-medium text-[#7c3aed]">
              <Loader2 className="w-3 h-3 text-[#7c3aed] shrink-0 animate-spin" />
              Customizing {content.name} Plan
            </div>
          </div>
        </div>

        {/* Tutor Card */}
        <div className="bg-white rounded-2xl p-3.5 shadow-[0_15px_50px_rgba(0,0,0,0.08)] w-[190px] shrink-0">
          <div className="text-[9px] font-bold uppercase tracking-wider text-[#7c3aed] mb-2.5">
            {content.tutorLabel}
          </div>
          <div className="w-full h-40 rounded-xl overflow-hidden mb-3 bg-gradient-to-b from-[#f5f3ff] to-[#ede9fe] flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center text-white text-2xl font-bold">
              {content.tutorName.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
          <div className="text-base font-extrabold text-[#0f2744] mb-1.5">{content.tutorName}</div>
          <div className="text-[11px] text-[#64748b] mb-1.5">{content.tutorSchools}</div>
          <div className="inline-flex items-center gap-1 bg-[#f1f5f9] border border-[#e2e8f0] text-[#0f2744] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold mb-1.5">
            <span className="text-[13px] font-bold">{content.tutorStat}</span> {content.tutorStatLabel}
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-[#64748b]">
              <strong className="text-[#1e3a5f] font-semibold">Students Tutored:</strong> {content.tutorStudentsTutored}
            </div>
            <div className="text-[10px] text-[#64748b] font-medium">
              Avg Gain: {content.tutorAvgGain}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
