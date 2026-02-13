'use client';

import { Check, ShieldCheck } from 'lucide-react';

import type { SubjectContent } from '../content';

interface Props {
  content: SubjectContent;
}

export function GuaranteeBadges({ content }: Props) {
  return (
    <section className="px-4 md:px-8 lg:px-12 py-2 md:py-3">
      <div className="mx-auto max-w-3xl">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-500 rounded-xl px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="text-sm md:text-base font-bold text-[#1e3a5f]">
              Double Guarantee
            </h3>
          </div>
          <div className="flex flex-col md:flex-row md:gap-6 gap-2">
            {content.guaranteeItems.map((item) => (
              <div key={item.title} className="flex items-start gap-2 flex-1">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm text-gray-700 leading-snug">
                  <strong className="text-[#1e3a5f]">{item.title}:</strong>{' '}
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
