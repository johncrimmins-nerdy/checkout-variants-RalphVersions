import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CollegeLogos } from './components/CollegeLogos';
import { ComparisonTable } from './components/ComparisonTable';
import { Differentiator } from './components/Differentiator';
import { FaqAccordion } from './components/FaqAccordion';
import { HeroExpertsPlatform } from './components/HeroExpertsPlatform';
import { PerfectMatchFooter } from './components/PerfectMatchFooter';
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
      <HeroExpertsPlatform content={content} />
      <CollegeLogos />
      <Differentiator content={content} />
      <ComparisonTable content={content} />
      <FaqAccordion content={content} />
      <PerfectMatchFooter content={content} />
    </main>
  );
}
