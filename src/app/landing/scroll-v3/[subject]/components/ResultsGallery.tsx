'use client';

import { ArrowRight, TrendingUp, Trophy } from 'lucide-react';

import type { SubjectContent } from '../content';

interface ResultsGalleryProps {
  content: SubjectContent;
}

export function ResultsGallery({ content }: ResultsGalleryProps) {
  return (
    <section className="px-6 py-20 md:px-10 bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#7c3aed] text-sm font-bold uppercase tracking-wider mb-3">
            Real Results
          </p>
          <h2 className="text-[#0f2744] text-3xl md:text-4xl font-black mb-4">
            See What Our Students Achieve
          </h2>
          <p className="text-[#64748b] text-base max-w-2xl mx-auto">
            Every student starts with a diagnostic. Every improvement is tracked and verified. Here are real results from families like yours.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.results.map((result) => (
            <div
              key={result.name}
              className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-shadow duration-300 border border-[#e2e8f0]"
            >
              {/* Student header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center text-white font-bold text-sm">
                  {result.initials}
                </div>
                <div>
                  <div className="font-bold text-[#0f2744] text-sm">{result.name}</div>
                  <div className="text-[11px] text-[#64748b]">{result.period} of tutoring</div>
                </div>
              </div>

              {/* Score comparison */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold mb-1">Before</div>
                  <div className="text-xl font-black text-[#94a3b8]">{result.scoreBefore}</div>
                </div>
                <div className="flex flex-col items-center">
                  <ArrowRight className="w-5 h-5 text-[#10b981] mb-1" />
                  <div className="bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {result.gain}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-[#10b981] font-semibold mb-1">After</div>
                  <div className="text-xl font-black text-[#10b981]">{result.scoreAfter}</div>
                </div>
              </div>

              {/* Achievement */}
              <div className="bg-gradient-to-r from-[#f5f3ff] to-[#ede9fe] rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#7c3aed] shrink-0" />
                <span className="text-[12px] font-semibold text-[#7c3aed]">{result.achievement}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-[#64748b] text-sm">
            <TrendingUp className="w-4 h-4 text-[#10b981]" />
            Based on verified student outcomes from 12,000+ families
          </div>
        </div>
      </div>
    </section>
  );
}
