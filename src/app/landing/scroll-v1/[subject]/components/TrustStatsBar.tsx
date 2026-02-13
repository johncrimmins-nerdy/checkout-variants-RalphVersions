import type { SubjectContent } from '../content';

export function TrustStatsBar({ content }: { content: SubjectContent }) {
  return (
    <section className="bg-[#f8fafc] px-5 py-10 md:px-[60px]">
      <div className="mx-auto flex max-w-[1000px] flex-wrap justify-center gap-8 md:gap-[60px]">
        {content.stats.map((stat) => (
          <div className="text-center" key={stat.label}>
            <div className="bg-gradient-to-br from-[#7c3aed] to-[#ec4899] bg-clip-text text-4xl font-black leading-none text-transparent md:text-5xl">
              {stat.value}
            </div>
            <div className="mt-2 text-sm font-medium text-[#64748b]">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
