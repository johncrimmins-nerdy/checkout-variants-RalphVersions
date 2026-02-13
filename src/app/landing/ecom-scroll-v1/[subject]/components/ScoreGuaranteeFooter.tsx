import { ArrowRight, Shield, Star } from 'lucide-react';

import type { SubjectContent } from '../content';

export function ScoreGuaranteeFooter({ content }: { content: SubjectContent }) {
  return (
    <section className="bg-gradient-to-br from-[#1e3a5f] to-[#7c3aed] px-5 py-16 md:px-[60px]">
      <div className="mx-auto max-w-3xl text-center">
        {/* Shield icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
          <Shield className="h-8 w-8 text-[#10b981]" />
        </div>

        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
          Score Improvement Guarantee
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-white/80">
          We&apos;re so confident in our tutors that we guarantee improvement. If your child
          doesn&apos;t see meaningful score gains after following the study plan, you
          don&apos;t pay. It&apos;s that simple.
        </p>

        {/* CTA */}
        <a
          className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-r from-[#10b981] to-[#059669] px-8 py-4 text-lg font-bold text-white shadow-[0_6px_25px_rgba(16,185,129,0.4)] transition-all hover:-translate-y-[3px] hover:shadow-[0_10px_35px_rgba(16,185,129,0.5)]"
          href="#"
        >
          {content.ctaText}
          <ArrowRight className="h-5 w-5" />
        </a>

        {/* Trust indicators */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b]" key={i} />
              ))}
            </div>
            <span>4.9/5 rating</span>
          </div>
          <span>&bull;</span>
          <span>12,000+ families helped</span>
          <span>&bull;</span>
          <span>Money-back guarantee</span>
        </div>
      </div>
    </section>
  );
}
