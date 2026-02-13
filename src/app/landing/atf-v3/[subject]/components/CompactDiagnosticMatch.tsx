'use client';

import { Check, Loader2, UserPlus } from 'lucide-react';
import type { SubjectContent } from '../content';

interface CompactDiagnosticMatchProps {
  content: SubjectContent;
}

function StatusIcon({ status }: { status: 'complete' | 'active' | 'matched' }) {
  if (status === 'complete') {
    return <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />;
  }
  if (status === 'matched') {
    return <UserPlus className="w-3 h-3 text-emerald-600 flex-shrink-0" />;
  }
  return <Loader2 className="w-3 h-3 text-purple-600 flex-shrink-0 animate-spin" />;
}

export function CompactDiagnosticMatch({ content }: CompactDiagnosticMatchProps) {
  return (
    <section className="px-4 md:px-8 lg:px-12 py-3 md:py-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-4 md:gap-6 items-center">
        {/* Left: Content */}
        <div className="order-1 md:order-none text-center md:text-left">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-[#0f2744] leading-tight mb-2">
            {content.headline}{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              {content.headlineHighlight}
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-3 max-w-md mx-auto md:mx-0">
            {content.subhead}
          </p>
          <ul className="space-y-1 mb-2 inline-block text-left">
            <li className="flex items-center gap-2 text-xs text-[#1e3a5f] font-medium">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              Top 1% Vetted {content.name} Tutors
            </li>
            <li className="flex items-center gap-2 text-xs text-[#1e3a5f] font-medium">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              AI-Powered Diagnostic & Custom Plan
            </li>
            <li className="flex items-center gap-2 text-xs text-[#1e3a5f] font-medium">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              Weekly Progress Reports
            </li>
          </ul>
        </div>

        {/* Right: 3-Card Visual (compact) */}
        <div className="order-0 md:order-none flex items-start justify-center gap-2 md:gap-3">
          {/* Student Card */}
          <div className="bg-white rounded-xl p-2.5 shadow-lg w-[130px] md:w-[150px] flex-shrink-0">
            <div className="text-[8px] font-bold uppercase tracking-wider text-emerald-500 mb-1.5">
              Your Student
            </div>
            <div className="w-full h-20 md:h-24 rounded-lg bg-gradient-to-b from-blue-50 to-blue-100 mb-2 flex items-center justify-center">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm md:text-base">
                {content.studentName.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            <div className="text-xs font-extrabold text-[#0f2744] mb-0.5">{content.studentName}</div>
            <div className="text-[9px] text-slate-400 mb-1">{content.studentSchool}</div>
            <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-[#0f2744] mb-0.5">
              <span className="font-bold">{content.studentTargetScore}</span> Target
            </div>
            <div className="text-[9px] text-slate-400">
              Gap: <span className="text-[#1e3a5f] font-semibold">{content.studentScoreGap}</span>
            </div>
          </div>

          {/* Assessment Card */}
          <div className="bg-white rounded-xl p-2.5 shadow-lg w-[150px] md:w-[170px] flex-shrink-0">
            <div className="text-[10px] font-semibold text-[#1e3a5f] tracking-wide mb-0.5">
              {content.diagnosticLabel}
            </div>
            <div className="text-3xl md:text-4xl font-black text-[#0f2744] leading-none mb-0.5">
              {content.currentScore}
            </div>
            <div className="text-[7px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              {content.currentScoreLabel}
            </div>
            <div className="flex flex-col gap-1">
              {content.diagnosticSteps.map((step) => (
                <div
                  key={step.text}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[8px] md:text-[9px] font-medium border ${
                    step.status === 'complete'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : step.status === 'matched'
                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-400 text-emerald-700'
                        : 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-300 text-purple-700'
                  }`}
                >
                  <StatusIcon status={step.status} />
                  <span className="truncate">{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tutor Card */}
          <div className="bg-white rounded-xl p-2.5 shadow-lg w-[130px] md:w-[150px] flex-shrink-0">
            <div className="text-[8px] font-bold uppercase tracking-wider text-purple-600 mb-1.5">
              {content.tutorLabel}
            </div>
            <div className="w-full h-20 md:h-24 rounded-lg bg-gradient-to-b from-purple-50 to-violet-100 mb-2 flex items-center justify-center">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm md:text-base">
                {content.tutorName.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            <div className="text-xs font-extrabold text-[#0f2744] mb-0.5">{content.tutorName}</div>
            <div className="text-[9px] text-slate-400 mb-1">{content.tutorCredentials}</div>
            <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-[#0f2744] mb-0.5">
              <span className="font-bold">{content.tutorScore}</span> {content.tutorScoreLabel}
            </div>
            <div className="text-[9px] text-slate-400">
              Avg Gain: <span className="text-[#1e3a5f] font-semibold">{content.tutorAvgGain}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
