'use client';

import { Check, X, Minus } from 'lucide-react';
import type { SubjectContent } from '../content';

export function ComparisonTable({ content }: { content: SubjectContent }) {
  const { comparison } = content;

  return (
    <section className="bg-[#f8fafc] px-5 py-20 md:px-[60px]">
      <div className="mx-auto max-w-[1200px]">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-black text-[#0f2744] md:text-4xl">
            See How We Compare
          </h2>
          <p className="mx-auto max-w-[600px] text-lg text-[#64748b]">
            Not all {content.name.toLowerCase()} is created equal. Here&apos;s how Varsity Tutors stacks up.
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] md:block">
          {/* Header Row */}
          <div className="grid grid-cols-5 border-b border-[#e5e7eb]">
            <div className="bg-[#f8fafc] p-5 text-sm font-bold uppercase tracking-wider text-[#94a3b8]">
              Category
            </div>
            <div className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] p-5 text-center">
              <div className="text-sm font-bold text-white">Varsity Tutors</div>
              <div className="mt-0.5 text-xs text-white/70">1-on-1 Expert</div>
            </div>
            {comparison.competitors.map((competitor) => (
              <div key={competitor.name} className="bg-[#f8fafc] p-5 text-center">
                <div className="text-sm font-bold text-[#64748b]">{competitor.name}</div>
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {comparison.categories.map((category, rowIndex) => (
            <div
              key={category}
              className={`grid grid-cols-5 ${rowIndex < comparison.categories.length - 1 ? 'border-b border-[#e5e7eb]' : ''}`}
            >
              <div className="flex items-center p-5 text-sm font-semibold text-[#1e3a5f]">
                {category}
              </div>
              <div className="flex items-center justify-center bg-[#7c3aed]/5 p-5 text-center text-sm font-semibold text-[#1e3a5f]">
                <div className="flex items-center gap-2">
                  {category === 'Guarantee' && (
                    <Check className="h-4 w-4 flex-shrink-0 text-[#10b981]" />
                  )}
                  {comparison.varsityTutors[rowIndex]}
                </div>
              </div>
              {comparison.competitors.map((competitor) => {
                const value = competitor.values[rowIndex];
                const isNone = value === 'None';
                const isVariable = value === 'Variable' || value === 'Minimal improvement';
                return (
                  <div
                    key={`${competitor.name}-${category}`}
                    className="flex items-center justify-center p-5 text-center text-sm text-[#64748b]"
                  >
                    <div className="flex items-center gap-2">
                      {isNone ? (
                        <X className="h-4 w-4 text-[#f87171]" />
                      ) : isVariable ? (
                        <Minus className="h-4 w-4 text-[#f59e0b]" />
                      ) : null}
                      <span className={isNone ? 'text-[#f87171]' : ''}>
                        {value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Mobile Cards */}
        <div className="space-y-6 md:hidden">
          {/* Varsity Tutors Card */}
          <div className="overflow-hidden rounded-2xl border-2 border-[#7c3aed] bg-white shadow-lg">
            <div className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-6 py-4">
              <div className="text-lg font-bold text-white">Varsity Tutors</div>
              <div className="text-sm text-white/70">1-on-1 Expert Tutoring</div>
            </div>
            <div className="divide-y divide-[#e5e7eb]">
              {comparison.categories.map((category, i) => (
                <div key={category} className="flex items-start justify-between px-6 py-4">
                  <span className="text-sm font-semibold text-[#94a3b8]">{category}</span>
                  <span className="max-w-[60%] text-right text-sm font-semibold text-[#1e3a5f]">
                    {comparison.varsityTutors[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Cards */}
          {comparison.competitors.map((competitor) => (
            <div key={competitor.name} className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
              <div className="bg-[#f8fafc] px-6 py-4">
                <div className="text-lg font-bold text-[#64748b]">{competitor.name}</div>
              </div>
              <div className="divide-y divide-[#e5e7eb]">
                {comparison.categories.map((category, i) => {
                  const value = competitor.values[i];
                  const isNone = value === 'None';
                  return (
                    <div key={category} className="flex items-start justify-between px-6 py-4">
                      <span className="text-sm font-semibold text-[#94a3b8]">{category}</span>
                      <span className={`max-w-[60%] text-right text-sm ${isNone ? 'text-[#f87171]' : 'text-[#64748b]'}`}>
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Below Table */}
        <div className="mt-10 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] px-8 py-4 text-lg font-bold text-white shadow-[0_6px_25px_rgba(124,58,237,0.35)] transition-all hover:-translate-y-[3px] hover:shadow-[0_10px_35px_rgba(124,58,237,0.45)]"
          >
            Start With the Best
          </a>
          <p className="mt-3 text-sm text-[#94a3b8]">
            Score improvement guarantee included with every plan
          </p>
        </div>
      </div>
    </section>
  );
}
