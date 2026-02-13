'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import type { SubjectContent } from '../content';

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-[#7c3aed]"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="text-lg font-semibold text-[#0f2744]">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#7c3aed] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="leading-relaxed text-[#64748b]">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion({ content }: { content: SubjectContent }) {
  return (
    <section className="px-5 py-16 md:px-[60px]">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-3 text-center text-3xl font-bold text-[#0f2744] md:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[#64748b]">
          Everything you need to know before getting started
        </p>

        <div className="rounded-2xl border border-gray-100 bg-white px-6 shadow-sm md:px-8">
          {content.faq.map((item) => (
            <FaqItem answer={item.answer} key={item.question} question={item.question} />
          ))}
        </div>
      </div>
    </section>
  );
}
