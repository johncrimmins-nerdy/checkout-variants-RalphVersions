import type { SubjectContent } from '../content';

interface CompactStatsBarProps {
  content: SubjectContent;
}

export function CompactStatsBar({ content }: CompactStatsBarProps) {
  return (
    <section className="bg-slate-50 py-2.5 px-4">
      <div className="max-w-4xl mx-auto flex justify-center items-center gap-6 md:gap-12 flex-wrap">
        {content.stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-lg md:text-xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent leading-none">
              {stat.value}
            </div>
            <div className="text-[10px] md:text-xs text-slate-500 font-medium mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
