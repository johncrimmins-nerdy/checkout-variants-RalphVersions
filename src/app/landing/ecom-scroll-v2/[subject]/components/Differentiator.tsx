'use client';

import { Users, Target, BrainCircuit } from 'lucide-react';
import type { SubjectContent } from '../content';

const pillarIcons = [Users, Target, BrainCircuit];

export function Differentiator({ content }: { content: SubjectContent }) {
  const { differentiator } = content;

  return (
    <section className="bg-white px-5 py-20 md:px-[60px]">
      <div className="mx-auto max-w-[1200px]">
        {/* Section Header */}
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-black text-[#0f2744] md:text-4xl">
            {differentiator.headline}
          </h2>
          <p className="mx-auto max-w-[600px] text-lg text-[#64748b]">
            Three research-backed principles that separate real improvement from wasted time and money.
          </p>
        </div>

        {/* Three Pillars */}
        <div className="mb-14 grid gap-8 md:grid-cols-3">
          {differentiator.pillars.map((pillar, index) => {
            const Icon = pillarIcons[index];
            return (
              <div
                key={pillar.title}
                className="group rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#7c3aed]/30 hover:shadow-[0_12px_40px_rgba(124,58,237,0.1)]"
              >
                {/* Icon */}
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed]/10 to-[#ec4899]/10 transition-colors group-hover:from-[#7c3aed]/20 group-hover:to-[#ec4899]/20">
                  <Icon className="h-7 w-7 text-[#7c3aed]" />
                </div>

                {/* Title */}
                <h3 className="mb-3 text-xl font-bold text-[#0f2744]">
                  {pillar.title}
                </h3>

                {/* Description */}
                <p className="mb-6 text-[15px] leading-relaxed text-[#64748b]">
                  {pillar.description}
                </p>

                {/* Stat */}
                <div className="rounded-xl bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] px-5 py-4">
                  <div className="text-2xl font-black text-[#7c3aed]">
                    {pillar.stat}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    {pillar.statLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Box */}
        <div className="rounded-2xl bg-gradient-to-r from-[#1e3a5f] to-[#7c3aed] p-8 md:p-10">
          <div className="grid gap-8 text-center md:grid-cols-3">
            {differentiator.statsBox.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-black text-white md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm font-medium text-white/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
