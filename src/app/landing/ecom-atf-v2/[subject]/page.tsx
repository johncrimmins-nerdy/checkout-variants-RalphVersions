import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CompactExpertsPlatform } from './components/CompactExpertsPlatform';
import { GuaranteeBadges } from './components/GuaranteeBadges';
import { PurpleCtaFooter } from './components/PurpleCtaFooter';
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
    <main className="h-screen flex flex-col bg-white overflow-hidden">
      <div className="flex-1 flex flex-col justify-center min-h-0">
        <CompactExpertsPlatform content={content} />
      </div>
      <GuaranteeBadges content={content} />
      <PurpleCtaFooter content={content} />
    </main>
  );
}
