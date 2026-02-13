import { ClipboardCheck, Sparkles, TrendingUp } from 'lucide-react';
import type { SubjectContent } from '../content';

interface ProcessStepsProps {
  content: SubjectContent;
}

const stepIcons = [ClipboardCheck, Sparkles, TrendingUp];

export function ProcessSteps({ content }: ProcessStepsProps) {
  return (
    <section className="bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f] to-[#7c3aed] px-6 py-20 md:px-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#10b981] text-sm font-bold uppercase tracking-wider mb-3">
            Our Proven Process
          </p>
          <h2 className="text-white text-3xl md:text-4xl font-black mb-4">
            How We Raise Your Child&apos;s Score
          </h2>
          <p className="text-[#94a3b8] text-base max-w-2xl mx-auto">
            A structured, data-driven approach that turns diagnostic insights into measurable score improvement—week after week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.processSteps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={step.title} className="relative group">
                {/* Connector line */}
                {i < content.processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-40px)] h-px bg-gradient-to-r from-[#10b981]/50 to-[#7c3aed]/50" />
                )}

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-colors duration-300">
                  {/* Step number */}
                  <div className="relative mx-auto mb-6 w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#10b981]/20 to-[#7c3aed]/20" />
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#7c3aed] border-2 border-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold">
                      {i + 1}
                    </div>
                  </div>

                  <h3 className="text-white text-lg font-bold mb-3">{step.title}</h3>
                  <p className="text-[#94a3b8] text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
