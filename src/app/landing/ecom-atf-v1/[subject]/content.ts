export interface SubjectContent {
  slug: string;
  name: string;
  headline: string;
  headlineHighlight: string;
  subhead: string;
  benefits: string[];
  ctaText: string;
  tutorLabel: string;
  tutorName: string;
  tutorSchools: string[];
  tutorStat: string;
  tutorStatLabel: string;
  studentName: string;
  scoreBefore: string;
  scoreAfter: string;
  scoreGain: string;
  achievementBadge: string;
  proofPoints: string[];
  ratingCount: string;
  ratingScore: string;
}

const satContent: SubjectContent = {
  slug: 'sat',
  name: 'SAT Prep',
  headline: "Instant Access To The World's",
  headlineHighlight: 'Top SAT Experts',
  subhead:
    'Get a dedicated SAT specialist who diagnoses gaps, builds a custom plan, and delivers the accountability that self-study can\'t match.',
  benefits: [
    'Top 1% Vetted SAT-Scoring Tutors (1500+ Verified)',
    "Customized For Your Child's Goals & Dream Schools",
    'Guaranteed Perfect Match, No-Risk Trial',
  ],
  ctaText: 'Meet My Perfect Tutor',
  tutorLabel: 'Top 1% SAT Expert',
  tutorName: 'Sarah M.',
  tutorSchools: ['MIT', 'Stanford MBA'],
  tutorStat: '1590',
  tutorStatLabel: 'SAT Score',
  studentName: 'Jake T.',
  scoreBefore: '1180',
  scoreAfter: '1530',
  scoreGain: '+350',
  achievementBadge: 'Vanderbilt + $45K Scholarship',
  proofPoints: ['200+ Avg Point Gain', '12,000+ Families Helped', '20 Years Experience'],
  ratingCount: '11,500+',
  ratingScore: '4.9',
};

const actContent: SubjectContent = {
  slug: 'act',
  name: 'ACT Prep',
  headline: "Instant Access To The World's",
  headlineHighlight: 'Top ACT Experts',
  subhead:
    'Get a dedicated ACT specialist who diagnoses gaps across all four sections and delivers results that self-study can\'t match.',
  benefits: [
    'Top 1% Vetted ACT-Scoring Tutors (34+ Verified)',
    "Customized For Your Child's Goals & Dream Schools",
    'Guaranteed Perfect Match, No-Risk Trial',
  ],
  ctaText: 'Meet My Perfect Tutor',
  tutorLabel: 'Top 1% ACT Expert',
  tutorName: 'David K.',
  tutorSchools: ['Yale', 'Columbia MBA'],
  tutorStat: '36',
  tutorStatLabel: 'ACT Score',
  studentName: 'Emma R.',
  scoreBefore: '24',
  scoreAfter: '33',
  scoreGain: '+9',
  achievementBadge: 'Duke + $50K Scholarship',
  proofPoints: ['6+ Avg Point Gain', '12,000+ Families Helped', '20 Years Experience'],
  ratingCount: '11,500+',
  ratingScore: '4.9',
};

const chemContent: SubjectContent = {
  slug: 'chem',
  name: 'Chemistry Tutoring',
  headline: 'Master Chemistry With',
  headlineHighlight: 'Expert 1-on-1 Tutoring',
  subhead:
    'Get a dedicated chemistry tutor who breaks down complex concepts, builds real understanding, and helps your child excel.',
  benefits: [
    'Expert Chemistry Tutors (Top University Graduates)',
    "Customized For Your Child's Course & Textbook",
    'Guaranteed Perfect Match, No-Risk Trial',
  ],
  ctaText: 'Find My Chemistry Tutor',
  tutorLabel: 'Chemistry Expert',
  tutorName: 'Dr. Rachel P.',
  tutorSchools: ['Caltech', 'PhD Chemistry'],
  tutorStat: '5',
  tutorStatLabel: 'AP Chem Score',
  studentName: 'Alex M.',
  scoreBefore: 'C+',
  scoreAfter: 'A',
  scoreGain: '+2 grades',
  achievementBadge: 'AP Chem Score: 5',
  proofPoints: ['2+ Avg Grade Improvement', '12,000+ Families Helped', '98% Satisfaction'],
  ratingCount: '11,500+',
  ratingScore: '4.9',
};

const calcContent: SubjectContent = {
  slug: 'calc',
  name: 'Calculus Tutoring',
  headline: 'Conquer Calculus With',
  headlineHighlight: 'Expert 1-on-1 Tutoring',
  subhead:
    'Get a dedicated calculus tutor who builds intuition for derivatives and integrals, and helps your child excel on the AP exam.',
  benefits: [
    'Expert Calculus Tutors (Top Math Graduates)',
    "Customized For Your Child's Course Level (AB or BC)",
    'Guaranteed Perfect Match, No-Risk Trial',
  ],
  ctaText: 'Find My Calculus Tutor',
  tutorLabel: 'Calculus Expert',
  tutorName: 'Prof. James L.',
  tutorSchools: ['Princeton', 'MS Mathematics'],
  tutorStat: '5',
  tutorStatLabel: 'AP Calc Score',
  studentName: 'Maya S.',
  scoreBefore: 'D+',
  scoreAfter: 'A-',
  scoreGain: '+3 grades',
  achievementBadge: 'AP Calc BC Score: 5',
  proofPoints: ['2+ Avg Grade Improvement', '12,000+ Families Helped', '98% Satisfaction'],
  ratingCount: '11,500+',
  ratingScore: '4.9',
};

const readingContent: SubjectContent = {
  slug: 'reading',
  name: 'Reading Tutoring',
  headline: 'Transform Reading Skills With',
  headlineHighlight: 'Expert 1-on-1 Tutoring',
  subhead:
    'Get a dedicated reading specialist who builds comprehension skills and helps your child become a confident, capable reader.',
  benefits: [
    'Expert Reading & Literacy Specialists',
    "Customized For Your Child's Grade Level & Goals",
    'Guaranteed Perfect Match, No-Risk Trial',
  ],
  ctaText: 'Find My Reading Tutor',
  tutorLabel: 'Reading Specialist',
  tutorName: 'Emily W.',
  tutorSchools: ['Harvard', 'MEd Reading'],
  tutorStat: 'A+',
  tutorStatLabel: 'Student Results',
  studentName: 'Olivia T.',
  scoreBefore: '42nd',
  scoreAfter: '89th',
  scoreGain: '+47%ile',
  achievementBadge: 'Reading Level: 2 Years Ahead',
  proofPoints: ['2+ Grade Level Gain', '12,000+ Families Helped', '98% Satisfaction'],
  ratingCount: '11,500+',
  ratingScore: '4.9',
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
