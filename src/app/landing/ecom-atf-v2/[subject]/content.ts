export interface SubjectContent {
  slug: string;
  name: string;
  headline: string;
  headlineHighlight: string;
  subhead: string;
  assessmentLabel: string;
  currentScore: string;
  currentScoreLabel: string;
  breakdownLabel: string;
  breakdownScore: string;
  breakdownDetail: string;
  statusSteps: { text: string; complete: boolean }[];
  tutorLabel: string;
  tutorName: string;
  tutorCredentials: string;
  tutorScore: string;
  guaranteeItems: { title: string; description: string }[];
  ctaText: string;
  urgencyText: string;
  spotsLeft: number;
}

const satContent: SubjectContent = {
  slug: 'sat',
  name: 'SAT Prep',
  headline: "Access The World's",
  headlineHighlight: 'Top SAT Experts & Platform',
  subhead:
    'Get matched with a dedicated SAT specialist who diagnoses gaps and delivers the score improvement your child needs.',
  assessmentLabel: 'SAT Skill Assessment',
  currentScore: '1410',
  currentScoreLabel: 'Current Score',
  breakdownLabel: 'Reading & Writing',
  breakdownScore: '710',
  breakdownDetail: '48/54 questions',
  statusSteps: [
    { text: 'Calculating current baseline...', complete: true },
    { text: 'Confirming goal score and exam date...', complete: true },
    { text: 'Finalizing your study plan...', complete: false },
  ],
  tutorLabel: 'Your Expert Tutor',
  tutorName: 'Sarah M.',
  tutorCredentials: 'MIT \u2022 Stanford MBA',
  tutorScore: '1590',
  guaranteeItems: [
    {
      title: 'Score Improvement Guarantee',
      description:
        'Complete the program and improve your score\u2014or get a full refund.',
    },
    {
      title: 'Tutor Match Guarantee',
      description:
        "Not happy with your tutor? We'll rematch you\u2014no questions asked.",
    },
  ],
  ctaText: 'Get My Perfect SAT Tutor',
  urgencyText: 'Limited spots for spring SAT prep',
  spotsLeft: 3,
};

const actContent: SubjectContent = {
  slug: 'act',
  name: 'ACT Prep',
  headline: "Access The World's",
  headlineHighlight: 'Top ACT Experts & Platform',
  subhead:
    'Get matched with a dedicated ACT specialist who diagnoses gaps across all four sections and delivers real results.',
  assessmentLabel: 'ACT Skill Assessment',
  currentScore: '28',
  currentScoreLabel: 'Current Score',
  breakdownLabel: 'Science Reasoning',
  breakdownScore: '30',
  breakdownDetail: '35/40 questions',
  statusSteps: [
    { text: 'Analyzing section strengths...', complete: true },
    { text: 'Setting target composite score...', complete: true },
    { text: 'Building custom study plan...', complete: false },
  ],
  tutorLabel: 'Your Expert Tutor',
  tutorName: 'David K.',
  tutorCredentials: 'Yale \u2022 Columbia MBA',
  tutorScore: '36',
  guaranteeItems: [
    {
      title: 'Score Improvement Guarantee',
      description:
        'Complete the program and improve your composite\u2014or get a full refund.',
    },
    {
      title: 'Tutor Match Guarantee',
      description:
        "Not happy with your tutor? We'll rematch you\u2014no questions asked.",
    },
  ],
  ctaText: 'Get My Perfect ACT Tutor',
  urgencyText: 'Limited spots for spring ACT prep',
  spotsLeft: 4,
};

const chemContent: SubjectContent = {
  slug: 'chem',
  name: 'Chemistry Tutoring',
  headline: 'Master Chemistry With',
  headlineHighlight: 'Expert 1-on-1 Tutoring',
  subhead:
    'Get a dedicated chemistry tutor who breaks down complex concepts and helps your child build real understanding.',
  assessmentLabel: 'Chemistry Assessment',
  currentScore: 'B-',
  currentScoreLabel: 'Current Grade',
  breakdownLabel: 'Organic Chemistry',
  breakdownScore: '78%',
  breakdownDetail: '23/30 questions',
  statusSteps: [
    { text: 'Identifying concept gaps...', complete: true },
    { text: 'Mapping course curriculum...', complete: true },
    { text: 'Creating practice schedule...', complete: false },
  ],
  tutorLabel: 'Your Chemistry Expert',
  tutorName: 'Dr. Rachel P.',
  tutorCredentials: 'Caltech \u2022 PhD Chemistry',
  tutorScore: '5',
  guaranteeItems: [
    {
      title: 'Grade Improvement Guarantee',
      description:
        'Complete the program and improve your grade\u2014or get a full refund.',
    },
    {
      title: 'Tutor Match Guarantee',
      description:
        "Not happy with your tutor? We'll rematch you\u2014no questions asked.",
    },
  ],
  ctaText: 'Find My Chemistry Tutor',
  urgencyText: 'Limited spots before midterms',
  spotsLeft: 5,
};

const calcContent: SubjectContent = {
  slug: 'calc',
  name: 'Calculus Tutoring',
  headline: 'Conquer Calculus With',
  headlineHighlight: 'Expert 1-on-1 Tutoring',
  subhead:
    'Get a dedicated calculus tutor who builds intuition for derivatives and integrals and helps your child ace the AP exam.',
  assessmentLabel: 'Calculus Assessment',
  currentScore: 'C+',
  currentScoreLabel: 'Current Grade',
  breakdownLabel: 'Integration',
  breakdownScore: '72%',
  breakdownDetail: '18/25 questions',
  statusSteps: [
    { text: 'Mapping foundational gaps...', complete: true },
    { text: 'Setting AP exam target...', complete: true },
    { text: 'Designing practice regimen...', complete: false },
  ],
  tutorLabel: 'Your Calculus Expert',
  tutorName: 'Prof. James L.',
  tutorCredentials: 'Princeton \u2022 MS Mathematics',
  tutorScore: '5',
  guaranteeItems: [
    {
      title: 'Grade Improvement Guarantee',
      description:
        'Complete the program and improve your grade\u2014or get a full refund.',
    },
    {
      title: 'Tutor Match Guarantee',
      description:
        "Not happy with your tutor? We'll rematch you\u2014no questions asked.",
    },
  ],
  ctaText: 'Find My Calculus Tutor',
  urgencyText: 'Limited spots before finals',
  spotsLeft: 4,
};

const readingContent: SubjectContent = {
  slug: 'reading',
  name: 'Reading Tutoring',
  headline: 'Transform Reading Skills With',
  headlineHighlight: 'Expert 1-on-1 Tutoring',
  subhead:
    'Get a dedicated reading specialist who builds comprehension skills and helps your child become a confident reader.',
  assessmentLabel: 'Reading Assessment',
  currentScore: '42nd',
  currentScoreLabel: 'Current Percentile',
  breakdownLabel: 'Comprehension',
  breakdownScore: '65%',
  breakdownDetail: '13/20 passages',
  statusSteps: [
    { text: 'Assessing reading level...', complete: true },
    { text: 'Identifying skill gaps...', complete: true },
    { text: 'Creating reading plan...', complete: false },
  ],
  tutorLabel: 'Your Reading Specialist',
  tutorName: 'Emily W.',
  tutorCredentials: 'Harvard \u2022 MEd Reading',
  tutorScore: 'A+',
  guaranteeItems: [
    {
      title: 'Reading Level Guarantee',
      description:
        'Complete the program and see measurable improvement\u2014or get a full refund.',
    },
    {
      title: 'Tutor Match Guarantee',
      description:
        "Not happy with your tutor? We'll rematch you\u2014no questions asked.",
    },
  ],
  ctaText: 'Find My Reading Tutor',
  urgencyText: 'Limited openings this semester',
  spotsLeft: 6,
};

export const subjectContentMap: Record<string, SubjectContent> = {
  sat: satContent,
  act: actContent,
  chem: chemContent,
  calc: calcContent,
  reading: readingContent,
};

export const validSubjects = ['sat', 'act', 'chem', 'calc', 'reading'] as const;
export type ValidSubject = (typeof validSubjects)[number];
