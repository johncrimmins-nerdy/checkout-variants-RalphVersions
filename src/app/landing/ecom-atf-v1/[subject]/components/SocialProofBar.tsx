import { CheckCircle2 } from 'lucide-react';
import type { SubjectContent } from '../content';

interface Props {
  content: SubjectContent;
}

export function SocialProofBar({ content }: Props) {
  return (
    <section className="border-t border-b border-gray-200 bg-white px-6 lg:px-12 py-3">
      <div className="flex items-center justify-center gap-6 lg:gap-10 flex-wrap">
        {content.proofPoints.map((point) => (
          <div key={point} className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
            <span className="text-sm font-semibold text-[#1e3a5f]">{point}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
