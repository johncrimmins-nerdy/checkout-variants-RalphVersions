import { ArrowRight, CheckCircle, Heart, Shield, Star } from 'lucide-react';

import type { SubjectContent } from '../content';

interface CombinedGuaranteeFooterProps {
  content: SubjectContent;
}

export function CombinedGuaranteeFooter({ content }: CombinedGuaranteeFooterProps) {
  return (
    <section className="bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#7c3aed] px-6 py-20 md:px-10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Guarantee badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
          {/* Score Guarantee */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6 max-w-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-6 h-6 text-[#10b981]" />
              <span className="text-white font-bold text-lg">Score Guarantee</span>
            </div>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              If your child doesn&apos;t improve after following the study plan, you get a <strong className="text-white">full refund</strong>. No questions asked.
            </p>
          </div>

          {/* Tutor Match Guarantee */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6 max-w-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart className="w-6 h-6 text-[#ec4899]" />
              <span className="text-white font-bold text-lg">Perfect Match</span>
            </div>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              If you&apos;re not 100% happy with your tutor, we&apos;ll <strong className="text-white">rematch you for free</strong>—as many times as it takes.
            </p>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-white text-3xl md:text-4xl font-black mb-4">
          Ready to See Real Results?
        </h2>
        <p className="text-[#94a3b8] text-base max-w-xl mx-auto mb-8">
          Join 12,000+ families who chose expert 1-on-1 {content.name.toLowerCase()} over generic prep.
          Your child&apos;s improvement journey starts with one call.
        </p>

        {/* CTA */}
        <button className="inline-flex items-center gap-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(16,185,129,0.5)] transition-all duration-200 mb-6">
          {content.ctaText}
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-1.5 text-[#94a3b8]">
            <Star className="w-4 h-4 text-[#f59e0b] fill-current" />
            <span>4.9/5 Rating</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#94a3b8]">
            <CheckCircle className="w-4 h-4 text-[#10b981]" />
            <span>12,000+ Families</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#94a3b8]">
            <Shield className="w-4 h-4 text-[#7c3aed]" />
            <span>Money-Back Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
