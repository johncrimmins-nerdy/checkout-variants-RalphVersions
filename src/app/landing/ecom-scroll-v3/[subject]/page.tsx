import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CombinedGuaranteeFooter } from './components/CombinedGuaranteeFooter';
import { FaqAccordion } from './components/FaqAccordion';
import { HeroDiagnosticMatch } from './components/HeroDiagnosticMatch';
import { ProcessSteps } from './components/ProcessSteps';
import { ResultsGallery } from './components/ResultsGallery';
import { RiskBanner } from './components/RiskBanner';
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
      <HeroDiagnosticMatch content={content} />
      <RiskBanner content={content} />
      <ProcessSteps content={content} />
      <ResultsGallery content={content} />
      <FaqAccordion content={content} />
      <CombinedGuaranteeFooter content={content} />
    </main>
  );
}
