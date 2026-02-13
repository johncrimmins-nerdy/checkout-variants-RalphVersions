'use client';

import { Award, Check, Loader2 } from 'lucide-react';

import type { SubjectContent } from '../content';

interface Props {
  content: SubjectContent;
}

export function CompactExpertsPlatform({ content }: Props) {
  return (
    <section className="px-4 md:px-8 lg:px-12 py-4 md:py-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#0f2744] leading-tight mb-3">
              {content.headline}{' '}
              <span className="bg-gradient-to-r from-[#7c3aed] to-pink-500 bg-clip-text text-transparent">
                {content.headlineHighlight}
              </span>
            </h1>
            <p className="text-sm md:text-base text-[#64748b] mb-4 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {content.subhead}
            </p>
          </div>

          {/* Right: Visual Composition */}
          <div className="relative flex items-center justify-center min-h-[220px] md:min-h-[260px]">
            <div className="relative w-full max-w-[420px] h-[220px] md:h-[260px]">
              {/* Platform Card (Background) */}
              <div className="absolute top-0 left-0 w-[200px] md:w-[230px] bg-white rounded-2xl p-4 md:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.08)] z-[1]">
                <div className="text-[10px] font-semibold tracking-wide text-[#64748b] mb-1">
                  {content.assessmentLabel}
                </div>
                <div className="text-3xl md:text-4xl font-black text-[#0f2744] leading-none mb-1">
                  {content.currentScore}
                </div>
                <div className="text-[9px] font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">
                  {content.currentScoreLabel}
                </div>
                <div className="bg-[#f8fafc] rounded-lg p-2 mb-3">
                  <div className="text-[9px] font-semibold text-[#64748b]">
                    {content.breakdownLabel}
                  </div>
                  <div className="text-lg font-extrabold text-[#1e3a5f]">
                    {content.breakdownScore}
                  </div>
                  <div className="text-[9px] text-[#94a3b8]">
                    {content.breakdownDetail}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {content.statusSteps.map((step) => (
                    <div
                      key={step.text}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-[10px] font-medium ${
                        step.complete
                          ? 'bg-white border border-gray-200 text-[#64748b]'
                          : 'bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-600'
                      }`}
                    >
                      {step.complete ? (
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      ) : (
                        <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                      )}
                      <span className="truncate">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Photo Card (Foreground) */}
              <div className="absolute top-2 right-0 w-[180px] md:w-[210px] h-[200px] md:h-[230px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-[2] bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#7c3aed] to-pink-500 mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white text-xl md:text-2xl font-bold">
                        {content.tutorName.charAt(0)}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#1e3a5f]">
                      Happy Student
                    </div>
                    <div className="text-[10px] text-[#64748b]">
                      {content.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tutor Badge (Floating) */}
              <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-white rounded-xl px-3 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex items-center gap-3 z-[3]">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center shrink-0">
                  <span className="text-emerald-700 text-sm font-bold">
                    {content.tutorName.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-semibold uppercase tracking-wide text-emerald-600">
                    {content.tutorLabel}
                  </span>
                  <span className="text-xs font-bold text-[#1e3a5f]">
                    {content.tutorName}
                  </span>
                  <span className="text-[10px] text-[#64748b]">
                    {content.tutorCredentials}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-50 to-green-100 px-2 py-1 rounded-full">
                  <Award className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">
                    {content.tutorScore}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
