'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SubjectContent } from '../content';

export function FaqAccordion({ content }: { content: SubjectContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white px-5 py-20 md:px-[60px]">
      <div className="mx-auto max-w-[800px]">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-black text-[#0f2744] md:text-4xl">
            Common Questions From Parents
          </h2>
          <p className="text-lg text-[#64748b]">
            Real answers to the questions we hear most often.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {content.faq.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#7c3aed]/30"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="pr-4 text-base font-semibold text-[#0f2744]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-[#94a3b8] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-[#f1f5f9] px-6 pb-6 pt-4 text-[15px] leading-relaxed text-[#64748b]">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
