import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { FaqAccordion } from './components/FaqAccordion';
import { HeroMatchCards } from './components/HeroMatchCards';
import { HowItWorks } from './components/HowItWorks';
import { ScoreGuaranteeFooter } from './components/ScoreGuaranteeFooter';
import { Testimonials } from './components/Testimonials';
import { TrustStatsBar } from './components/TrustStatsBar';
import { subjectContentMap, validSubjects, type ValidSubject } from './content';

interface PageProps {
  params: Promise<{ subject: string }>;
}

export function generateStaticParams() {
  return validSubjects.map((subject) => ({ subject }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subject } = await params;
  const content = subjectContentMap[subject];
  if (!content) return {};

  return {
    description: content.subhead,
    title: `${content.name} | Varsity Tutors - Expert 1-on-1 Tutoring`,
  };
}

export default async function LandingPage({ params }: PageProps) {
  const { subject } = await params;

  if (!validSubjects.includes(subject as ValidSubject)) {
    notFound();
  }

  const content = subjectContentMap[subject];

  return (
    <main className="min-h-screen bg-white">
      <HeroMatchCards content={content} />
      <TrustStatsBar content={content} />
      <HowItWorks content={content} />
      <Testimonials content={content} />
      <FaqAccordion content={content} />
      <ScoreGuaranteeFooter content={content} />
    </main>
  );
}
