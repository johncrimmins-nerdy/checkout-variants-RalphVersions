'use client';

import { ArrowRight, Star } from 'lucide-react';
import type { SubjectContent } from '../content';

interface Props {
  content: SubjectContent;
}

export function GreenCtaFooter({ content }: Props) {
  return (
    <section className="bg-gradient-to-r from-[#0f2744] to-[#1e3a5f] px-6 lg:px-12 py-5 lg:py-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Rating + Trust */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 lg:w-5 lg:h-5 fill-[#f59e0b] text-[#f59e0b]" />
            ))}
          </div>
          <div className="text-white text-sm">
            <strong className="text-[#f59e0b]">{content.ratingScore}/5</strong>{' '}
            <span className="text-white/70">from {content.ratingCount} Reviews</span>
          </div>
        </div>

        {/* Center: Guarantee Text */}
        <p className="text-white/80 text-xs lg:text-sm text-center font-medium">
          Score improvement guarantee or your money back
        </p>

        {/* Right: CTA Button */}
        <a
          href="#"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white px-6 lg:px-8 py-3 rounded-xl font-bold text-sm lg:text-base shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 whitespace-nowrap"
        >
          {content.ctaText}
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
