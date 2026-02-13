import type { SubjectContent } from '../content';

interface RiskBannerProps {
  content: SubjectContent;
}

export function RiskBanner({ content }: RiskBannerProps) {
  return (
    <section className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2744] px-6 py-10 md:px-10 text-center">
      <div className="max-w-[900px] mx-auto">
        <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
          {content.riskBannerStats.map((stat, i) => (
            <span key={stat.label} className="flex items-center gap-1">
              {i > 0 && (
                <span className="text-white/30 mr-3">•</span>
              )}
              <span className="text-white text-base">
                <strong className="text-[#10b981] text-xl">{stat.value}</strong>{' '}
                {stat.label}
              </span>
            </span>
          ))}
        </div>
        <p className="text-white text-xl md:text-[1.3rem] font-semibold opacity-95">
          {content.riskBannerGuarantee}
        </p>
      </div>
    </section>
  );
}
