import { BadgeCheck, Star } from 'lucide-react';

import type { SubjectContent } from '../content';

export function Testimonials({ content }: { content: SubjectContent }) {
  return (
    <section className="bg-[#f8fafc] px-5 py-16 md:px-[60px]">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="mb-3 text-center text-3xl font-bold text-[#0f2744] md:text-4xl">
          What Parents Are Saying
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[#64748b]">
          Real results from real families
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.testimonials.map((testimonial) => (
            <div
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              key={testimonial.name}
            >
              {/* Stars */}
              <div className="mb-3 flex gap-0.5 text-[#f59e0b]">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star className="h-4 w-4 fill-current" key={i} />
                ))}
              </div>

              {/* Quote */}
              <p className="mb-4 flex-1 leading-relaxed text-[#374151]">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Result badge */}
              <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-[#10b981]/10 to-[#059669]/10 px-3 py-1">
                <span className="text-sm font-bold text-[#059669]">{testimonial.result}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#ec4899] text-sm font-bold text-white">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#0f2744]">
                      {testimonial.name}
                    </span>
                    <BadgeCheck className="h-4 w-4 text-[#7c3aed]" />
                  </div>
                  <span className="text-xs text-[#64748b]">{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
