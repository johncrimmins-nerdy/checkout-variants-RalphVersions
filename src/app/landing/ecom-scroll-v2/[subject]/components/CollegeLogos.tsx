'use client';

const colleges = [
  { name: 'STANFORD', className: 'font-serif italic text-[1.3rem] text-[#8C1515]' },
  { name: 'GEORGIA', className: 'font-serif text-[1.1rem] font-bold text-[#BA0C2F]' },
  { name: 'DUKE', className: 'font-serif text-[1.2rem] font-extrabold text-[#003087]' },
  { name: 'CLEMSON', className: 'font-sans text-[1.1rem] font-extrabold text-[#F56600]' },
  { name: 'MICHIGAN', className: 'font-serif text-[1.1rem] font-bold text-[#00274C] border-b-[3px] border-[#FFCB05] pb-0.5' },
  { name: 'MIAMI', className: 'font-serif text-[1.2rem] font-bold text-[#F47321]' },
  { name: 'TEXAS', className: 'font-serif text-[1.15rem] font-bold text-[#BF5700]' },
  { name: 'UNC', className: 'font-serif text-[1rem] font-bold text-[#7BAFD4] [text-shadow:1px_1px_0_#13294B]' },
  { name: 'TCU', className: 'font-serif text-[1.2rem] font-bold text-[#4D1979]' },
  { name: 'UCLA', className: 'font-sans text-[1.2rem] font-black tracking-[2px] text-[#2774AE]' },
  { name: 'Vanderbilt', className: 'font-serif italic text-[1.1rem] text-[#866D4B]' },
  { name: 'FLORIDA', className: 'font-serif text-[1.1rem] font-bold text-[#0021A5]' },
  { name: 'VIRGINIA', className: 'font-serif text-[1.1rem] font-bold text-[#232D4B]' },
  { name: 'GEORGIA TECH', className: 'font-sans text-[1rem] font-extrabold tracking-[1px] text-[#B3A369] [text-shadow:1px_1px_0_#003057]' },
  { name: 'WAKE FOREST', className: 'font-serif text-[0.95rem] font-bold text-[#9E7E38]' },
  { name: 'NYU', className: 'font-sans text-[1.3rem] font-extrabold text-[#57068c]' },
  { name: 'TULANE', className: 'font-serif text-[1.1rem] font-bold text-[#006747]' },
  { name: 'RICE', className: 'font-serif text-[1.3rem] font-bold text-[#00205B]' },
  { name: 'AUBURN', className: 'font-serif text-[1.1rem] font-bold text-[#0C2340]' },
  { name: 'NORTHWESTERN', className: 'font-sans text-[0.95rem] font-bold tracking-[1px] text-[#4E2A84]' },
  { name: 'USC', className: 'font-serif text-[1.3rem] font-bold text-[#990000]' },
  { name: 'TEXAS A&M', className: 'font-serif text-[1rem] font-bold text-[#500000]' },
  { name: 'Emory', className: 'font-serif italic text-[1.2rem] text-[#012169]' },
  { name: 'WISCONSIN', className: 'font-serif text-[1rem] font-bold text-[#C5050C]' },
  { name: 'NOTRE DAME', className: 'font-serif text-[1rem] font-bold text-[#0C2340]' },
  { name: 'FLORIDA STATE', className: 'font-serif text-[1rem] font-bold text-[#782F40]' },
  { name: 'SMU', className: 'font-serif text-[1.3rem] font-bold text-[#C8102E]' },
  { name: 'OHIO STATE', className: 'font-sans text-[1rem] font-extrabold text-[#BB0000]' },
  { name: 'BOSTON COLLEGE', className: 'font-serif text-[1rem] font-bold text-[#8A100B]' },
  { name: 'PURDUE', className: 'font-sans text-[1rem] font-extrabold text-[#CEB888] [text-shadow:1px_1px_0_#000]' },
];

export function CollegeLogos() {
  const items = [...colleges, ...colleges];

  return (
    <section className="overflow-hidden bg-[#f8fafc] py-[35px] text-center">
      <p className="mb-[30px] px-5 text-[13px] font-bold uppercase tracking-[2px] text-[#94a3b8] md:px-[60px]">
        Our Students Have Been Accepted To
      </p>
      <div className="relative overflow-hidden before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:top-0 before:z-[2] before:w-[50px] before:bg-gradient-to-r before:from-[#f8fafc] before:to-transparent after:pointer-events-none after:absolute after:bottom-0 after:right-0 after:top-0 after:z-[2] after:w-[50px] after:bg-gradient-to-l after:from-[#f8fafc] after:to-transparent md:before:w-[100px] md:after:w-[100px]">
        <div className="flex w-max animate-[scrollLogos_60s_linear_infinite] items-center gap-[30px] hover:[animation-play-state:paused] md:gap-[60px]">
          {items.map((college, i) => (
            <span
              key={`${college.name}-${i}`}
              className={`flex-shrink-0 whitespace-nowrap opacity-85 transition-all duration-300 hover:scale-105 hover:opacity-100 ${college.className}`}
            >
              {college.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
