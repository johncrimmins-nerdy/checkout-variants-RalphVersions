import { ClipboardList, Route, Target } from 'lucide-react';

import type { SubjectContent } from '../content';

const stepIcons = [Target, Route, ClipboardList];

export function HowItWorks({ content }: { content: SubjectContent }) {
  return (
    <section className="px-5 py-16 md:px-[60px]">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="mb-3 text-center text-3xl font-bold text-[#0f2744] md:text-4xl">
          How It Works
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[#64748b]">
          Three simple steps to transform your child&apos;s results
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {content.howItWorks.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <div
                className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                key={step.title}
              >
                {/* Step number */}
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#ec4899] text-white shadow-lg">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-widest text-[#7c3aed]">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#0f2744]">{step.title}</h3>
                <p className="leading-relaxed text-[#64748b]">{step.description}</p>

                {/* Connector line (not on last) */}
                {i < 2 && (
                  <div className="absolute -right-4 top-1/2 hidden h-0.5 w-8 bg-gradient-to-r from-[#7c3aed]/30 to-transparent md:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
