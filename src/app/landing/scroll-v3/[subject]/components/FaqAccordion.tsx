'use client';

import { useState } from 'react';
import { ChevronDown, DollarSign } from 'lucide-react';

import type { SubjectContent } from '../content';

interface FaqAccordionProps {
  content: SubjectContent;
}

export function FaqAccordion({ content }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-6 py-20 md:px-10 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#f5f3ff] text-[#7c3aed] text-sm font-bold px-4 py-2 rounded-full mb-4">
            <DollarSign className="w-4 h-4" />
            ROI-Focused FAQs
          </div>
          <h2 className="text-[#0f2744] text-3xl md:text-4xl font-black mb-4">
            Is It Worth the Investment?
          </h2>
          <p className="text-[#64748b] text-base max-w-xl mx-auto">
            The 3 most important questions parents ask—answered with real data and guarantees.
          </p>
        </div>

        <div className="space-y-4">
          {content.faq.map((item, i) => (
            <div
              key={item.question}
              className="border border-[#e2e8f0] rounded-xl overflow-hidden hover:border-[#7c3aed]/30 transition-colors duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-[#f8fafc] transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-[#0f2744] text-[15px]">{item.question}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-[#64748b] shrink-0 ml-4 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-5 pt-0 ml-11">
                    <p className="text-[#64748b] text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
