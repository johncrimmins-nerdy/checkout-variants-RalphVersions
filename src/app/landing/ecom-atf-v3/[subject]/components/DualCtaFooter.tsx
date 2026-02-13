import { ArrowRight, Phone, Star } from 'lucide-react';
import type { SubjectContent } from '../content';

interface DualCtaFooterProps {
  content: SubjectContent;
}

export function DualCtaFooter({ content }: DualCtaFooterProps) {
  return (
    <section className="bg-gradient-to-r from-[#0f2744] to-[#1e3a5f] py-3 md:py-4 px-4">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-xs text-slate-300">
            <span className="text-white font-bold">{content.ratingScore}/5</span> from {content.ratingCount} reviews
          </span>
        </div>

        {/* Dual CTAs */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all duration-200"
          >
            {content.ctaPrimaryText}
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 border-2 border-slate-400 text-slate-200 px-5 py-2.5 rounded-lg font-bold text-sm hover:border-white hover:text-white hover:-translate-y-0.5 transition-all duration-200"
          >
            <Phone className="w-4 h-4" />
            {content.ctaSecondaryText}
          </a>
        </div>
      </div>
    </section>
  );
}
