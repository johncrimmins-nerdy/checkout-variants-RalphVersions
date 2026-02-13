export interface DiagnosticStep {
  text: string;
  status: 'complete' | 'active' | 'matched';
}

export interface StatItem {
  value: string;
  label: string;
}

export interface SubjectContent {
  slug: string;
  name: string;
  headline: string;
  headlineHighlight: string;
  subhead: string;
  diagnosticLabel: string;
  currentScore: string;
  currentScoreLabel: string;
  diagnosticSteps: DiagnosticStep[];
  studentName: string;
  studentSchool: string;
  studentTargetScore: string;
  studentScoreGap: string;
  studentTestDate: string;
  tutorLabel: string;
  tutorName: string;
  tutorCredentials: string;
  tutorScore: string;
  tutorScoreLabel: string;
  tutorStudentsTutored: number;
  tutorAvgGain: string;
  stats: StatItem[];
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  ratingScore: string;
  ratingCount: string;
}

const satContent: SubjectContent = {
  slug: 'sat',
  name: 'SAT Prep',
  headline: 'Give Your Child a',
  headlineHighlight: 'Top 1% SAT Expert',
  subhead:
    'Get matched with a dedicated SAT specialist who diagnoses gaps, builds a custom study plan, and tracks every step of your child\'s score improvement journey.',
  diagnosticLabel: 'SAT Diagnostic',
  currentScore: '1210',
  currentScoreLabel: 'Current Score',
  diagnosticSteps: [
    { text: 'Calculating baseline score', status: 'complete' },
    { text: 'Determining strengths & weaknesses', status: 'complete' },
    { text: 'Confirming target score', status: 'complete' },
    { text: 'Perfect tutor matched', status: 'matched' },
    { text: 'Customizing SAT Prep Plan', status: 'active' },
  ],
  studentName: 'Emma T.',
  studentSchool: 'Dream School: UT Austin',
  studentTargetScore: '1450',
  studentScoreGap: '240 pts',
  studentTestDate: '4 Months Away',
  tutorLabel: 'Top 1% SAT Expert',
  tutorName: 'Sarah M.',
  tutorCredentials: 'UT Austin \u2022 Stanford MBA',
  tutorScore: '1590',
  tutorScoreLabel: 'SAT Score',
  tutorStudentsTutored: 63,
  tutorAvgGain: '285 pts',
  stats: [
    { value: '200+', label: 'Avg Point Gain' },
    { value: '12K+', label: 'Families Helped' },
    { value: '1500+', label: 'Min Tutor Score' },
    { value: '$4.2M', label: 'Scholarships Won' },
  ],
  ctaPrimaryText: 'Start SAT Prep Now',
  ctaSecondaryText: 'Book Free Strategy Call',
  ratingScore: '4.9',
  ratingCount: '11,500+',
};

const actContent: SubjectContent = {
  slug: 'act',
  name: 'ACT Prep',
  headline: 'Give Your Child a',
  headlineHighlight: 'Top 1% ACT Expert',
  subhead:
    'Get matched with a dedicated ACT specialist who diagnoses gaps across all four sections and delivers real composite score gains.',
  diagnosticLabel: 'ACT Diagnostic',
  currentScore: '24',
  currentScoreLabel: 'Current Composite',
  diagnosticSteps: [
    { text: 'Analyzing section strengths', status: 'complete' },
    { text: 'Setting target composite', status: 'complete' },
    { text: 'Identifying weak sections', status: 'complete' },
    { text: 'Expert tutor matched', status: 'matched' },
    { text: 'Building custom ACT plan', status: 'active' },
  ],
  studentName: 'Jake R.',
  studentSchool: 'Dream School: Michigan',
  studentTargetScore: '32',
  studentScoreGap: '8 pts',
  studentTestDate: '3 Months Away',
  tutorLabel: 'Top 1% ACT Expert',
  tutorName: 'David K.',
  tutorCredentials: 'Yale \u2022 Columbia MBA',
  tutorScore: '36',
  tutorScoreLabel: 'ACT Score',
  tutorStudentsTutored: 48,
  tutorAvgGain: '7 pts',
  stats: [
    { value: '6+', label: 'Avg Point Gain' },
    { value: '8K+', label: 'Students Helped' },
    { value: '34+', label: 'Min Tutor Score' },
    { value: '$3.8M', label: 'Scholarships Won' },
  ],
  ctaPrimaryText: 'Start ACT Prep Now',
  ctaSecondaryText: 'Book Free Strategy Call',
  ratingScore: '4.9',
  ratingCount: '9,200+',
};

const chemContent: SubjectContent = {
  slug: 'chem',
  name: 'Chemistry Tutoring',
  headline: 'Master Chemistry With',
  headlineHighlight: 'Expert 1-on-1 Tutoring',
  subhead:
    'Get a dedicated chemistry tutor who breaks down complex concepts, builds lab confidence, and helps your child earn the grade they deserve.',
  diagnosticLabel: 'Chemistry Assessment',
  currentScore: 'B-',
  currentScoreLabel: 'Current Grade',
  diagnosticSteps: [
    { text: 'Identifying concept gaps', status: 'complete' },
    { text: 'Mapping course curriculum', status: 'complete' },
    { text: 'Setting grade target', status: 'complete' },
    { text: 'Chemistry expert matched', status: 'matched' },
    { text: 'Creating study schedule', status: 'active' },
  ],
  studentName: 'Mia C.',
  studentSchool: 'AP Chemistry \u2022 Junior',
  studentTargetScore: 'A',
  studentScoreGap: '2 letter grades',
  studentTestDate: 'AP Exam: 5 Months',
  tutorLabel: 'Chemistry Expert',
  tutorName: 'Dr. Rachel P.',
  tutorCredentials: 'Caltech \u2022 PhD Chemistry',
  tutorScore: '5',
  tutorScoreLabel: 'AP Score',
  tutorStudentsTutored: 41,
  tutorAvgGain: '1.5 grades',
  stats: [
    { value: '93%', label: 'Grade Improvement' },
    { value: '4.8', label: 'Avg AP Score' },
    { value: '5K+', label: 'Students Helped' },
    { value: '100%', label: 'Expert-Vetted' },
  ],
  ctaPrimaryText: 'Start Chemistry Tutoring',
  ctaSecondaryText: 'Book Free Consultation',
  ratingScore: '4.8',
  ratingCount: '6,400+',
};

const calcContent: SubjectContent = {
  slug: 'calc',
  name: 'Calculus Tutoring',
  headline: 'Conquer Calculus With',
  headlineHighlight: 'Expert 1-on-1 Tutoring',
  subhead:
    'Get a dedicated calculus tutor who builds intuition for derivatives and integrals and helps your child ace the AP exam.',
  diagnosticLabel: 'Calculus Assessment',
  currentScore: 'C+',
  currentScoreLabel: 'Current Grade',
  diagnosticSteps: [
    { text: 'Mapping foundational gaps', status: 'complete' },
    { text: 'Setting AP exam target', status: 'complete' },
    { text: 'Assessing problem areas', status: 'complete' },
    { text: 'Calculus expert matched', status: 'matched' },
    { text: 'Designing practice regimen', status: 'active' },
  ],
  studentName: 'Alex W.',
  studentSchool: 'AP Calculus BC \u2022 Senior',
  studentTargetScore: 'A-',
  studentScoreGap: '2 letter grades',
  studentTestDate: 'AP Exam: 4 Months',
  tutorLabel: 'Calculus Expert',
  tutorName: 'Prof. James L.',
  tutorCredentials: 'Princeton \u2022 MS Mathematics',
  tutorScore: '5',
  tutorScoreLabel: 'AP Score',
  tutorStudentsTutored: 55,
  tutorAvgGain: '1.8 grades',
  stats: [
    { value: '95%', label: 'Grade Improvement' },
    { value: '4.9', label: 'Avg AP Score' },
    { value: '7K+', label: 'Students Helped' },
    { value: '100%', label: 'Expert-Vetted' },
  ],
  ctaPrimaryText: 'Start Calculus Tutoring',
  ctaSecondaryText: 'Book Free Consultation',
  ratingScore: '4.9',
  ratingCount: '7,100+',
};

const readingContent: SubjectContent = {
  slug: 'reading',
  name: 'Reading Tutoring',
  headline: 'Transform Reading Skills With',
  headlineHighlight: 'Expert 1-on-1 Tutoring',
  subhead:
    'Get a dedicated reading specialist who builds comprehension, analytical thinking, and helps your child become a confident, advanced reader.',
  diagnosticLabel: 'Reading Assessment',
  currentScore: '42nd',
  currentScoreLabel: 'Current Percentile',
  diagnosticSteps: [
    { text: 'Assessing reading level', status: 'complete' },
    { text: 'Identifying skill gaps', status: 'complete' },
    { text: 'Setting growth targets', status: 'complete' },
    { text: 'Reading specialist matched', status: 'matched' },
    { text: 'Creating reading plan', status: 'active' },
  ],
  studentName: 'Lily H.',
  studentSchool: '6th Grade \u2022 Advanced Track',
  studentTargetScore: '85th',
  studentScoreGap: '43 percentile pts',
  studentTestDate: 'Next Assessment: 3 Mo',
  tutorLabel: 'Reading Specialist',
  tutorName: 'Emily W.',
  tutorCredentials: 'Harvard \u2022 MEd Reading',
  tutorScore: 'A+',
  tutorScoreLabel: 'Specialist Rating',
  tutorStudentsTutored: 72,
  tutorAvgGain: '28 percentile pts',
  stats: [
    { value: '2+', label: 'Avg Grade Levels' },
    { value: '96%', label: 'Parent Satisfaction' },
    { value: '4K+', label: 'Students Helped' },
    { value: '100%', label: 'Certified Specialists' },
  ],
  ctaPrimaryText: 'Start Reading Tutoring',
  ctaSecondaryText: 'Book Free Consultation',
  ratingScore: '4.9',
  ratingCount: '5,800+',
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
