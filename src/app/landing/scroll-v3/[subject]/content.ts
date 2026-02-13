export interface SubjectContent {
  slug: string;
  name: string;
  headline: string;
  headlineHighlight: string;
  subhead: string;
  benefits: string[];
  ctaText: string;
  ctaSecondary: string;
  tutorLabel: string;
  tutorName: string;
  tutorSchools: string;
  tutorStat: string;
  tutorStatLabel: string;
  tutorStudentsTutored: number;
  tutorAvgGain: string;
  studentName: string;
  studentSchool: string;
  studentTarget: string;
  currentScore: string;
  scoreGap: string;
  diagnosticLabel: string;
  diagnosticSteps: string[];
  riskBannerStats: { value: string; label: string }[];
  riskBannerGuarantee: string;
  processSteps: { title: string; description: string }[];
  results: {
    name: string;
    initials: string;
    scoreBefore: string;
    scoreAfter: string;
    gain: string;
    achievement: string;
    period: string;
  }[];
  faq: { question: string; answer: string }[];
}

const satContent: SubjectContent = {
  slug: 'sat',
  name: 'SAT Prep',
  headline: 'Give Your Child a',
  headlineHighlight: 'Top 1% SAT Expert',
  subhead:
    'Get matched with a dedicated SAT specialist who diagnoses gaps, builds a custom study plan, and tracks every step of your child\'s score improvement journey.',
  benefits: [
    'Top 1% Vetted SAT-Scoring Tutors (1500+ Verified)',
    'AI-Powered Diagnostic & Personalized Study Plan',
    'Weekly Progress Reports & Parent Dashboard',
  ],
  ctaText: 'Book Free Strategy Session',
  ctaSecondary: 'See How It Works',
  tutorLabel: 'Top 1% SAT Expert',
  tutorName: 'Sarah M.',
  tutorSchools: 'UT Austin • Stanford MBA',
  tutorStat: '1590',
  tutorStatLabel: 'SAT Score',
  tutorStudentsTutored: 63,
  tutorAvgGain: '285 pts',
  studentName: 'Emma T.',
  studentSchool: 'Dream School: UT Austin',
  studentTarget: '1450',
  currentScore: '1210',
  scoreGap: '240 pts',
  diagnosticLabel: 'SAT Diagnostic',
  diagnosticSteps: [
    'Calculating baseline score',
    'Determining strengths & weaknesses',
    'Confirming target score',
    'Identifying improvement opportunities',
  ],
  riskBannerStats: [
    { value: '12,000+', label: 'families served' },
    { value: '4.9/5', label: 'rating' },
    { value: '200+', label: 'avg point improvement' },
  ],
  riskBannerGuarantee: "If we can't help your child improve, you don't pay. It's that simple.",
  processSteps: [
    {
      title: 'Diagnostic Assessment',
      description:
        'Your child takes a full-length practice SAT. Our AI identifies exact skill gaps across every section and question type—down to the individual concept.',
    },
    {
      title: 'Expert Matching & Custom Plan',
      description:
        'We pair your child with a 1500+ scorer who specializes in their weak areas. Together they build a week-by-week study plan calibrated to your test date.',
    },
    {
      title: 'Weekly Sessions & Score Tracking',
      description:
        'Targeted 1-on-1 sessions with real-time progress dashboards. You see the score trajectory every week—no guessing, just measurable improvement.',
    },
  ],
  results: [
    { name: 'Jake T.', initials: 'JT', scoreBefore: '1180', scoreAfter: '1530', gain: '+350', achievement: 'Vanderbilt + $45K Scholarship', period: '12 weeks' },
    { name: 'Sophia L.', initials: 'SL', scoreBefore: '1250', scoreAfter: '1490', gain: '+240', achievement: 'UCLA Admitted', period: '10 weeks' },
    { name: 'Ethan M.', initials: 'EM', scoreBefore: '1100', scoreAfter: '1380', gain: '+280', achievement: 'UT Austin Honors', period: '14 weeks' },
    { name: 'Olivia K.', initials: 'OK', scoreBefore: '1320', scoreAfter: '1560', gain: '+240', achievement: 'Duke + $60K Scholarship', period: '8 weeks' },
    { name: 'Liam W.', initials: 'LW', scoreBefore: '1050', scoreAfter: '1340', gain: '+290', achievement: 'Georgia Tech Admitted', period: '16 weeks' },
    { name: 'Ava R.', initials: 'AR', scoreBefore: '1290', scoreAfter: '1520', gain: '+230', achievement: 'USC + Merit Award', period: '11 weeks' },
  ],
  faq: [
    {
      question: 'What ROI can I expect from SAT tutoring?',
      answer:
        'Our families see an average 200+ point improvement, which translates to $42,000+ more in merit scholarships. The tutoring investment typically pays for itself 10-20x in scholarship dollars alone—not counting the long-term value of attending a more competitive university.',
    },
    {
      question: 'How much will my child actually improve?',
      answer:
        'Our students average 200+ point gains, with many improving 250-350 points. After the initial diagnostic, your tutor will give you a realistic target range based on your child\'s specific gaps. We track progress weekly so you can see the trajectory in real-time.',
    },
    {
      question: "What if it doesn't work? Is my money at risk?",
      answer:
        'Zero risk. We offer a score improvement guarantee: if your child doesn\'t improve after following the study plan, you get a full refund. We\'ve served 12,000+ families with a 4.9/5 rating because our methodology works. We only succeed when your child succeeds.',
    },
  ],
};

const actContent: SubjectContent = {
  slug: 'act',
  name: 'ACT Prep',
  headline: 'Give Your Child a',
  headlineHighlight: 'Top 1% ACT Expert',
  subhead:
    'Get matched with a dedicated ACT specialist who diagnoses gaps across all four sections, builds a custom study plan, and delivers measurable score improvement.',
  benefits: [
    'Top 1% Vetted ACT-Scoring Tutors (34+ Verified)',
    'AI-Powered Diagnostic Across All 4 Sections',
    'Weekly Progress Reports & Parent Dashboard',
  ],
  ctaText: 'Book Free Strategy Session',
  ctaSecondary: 'See How It Works',
  tutorLabel: 'Top 1% ACT Expert',
  tutorName: 'David K.',
  tutorSchools: 'Yale • Columbia MBA',
  tutorStat: '36',
  tutorStatLabel: 'ACT Score',
  tutorStudentsTutored: 58,
  tutorAvgGain: '7 pts',
  studentName: 'Emma R.',
  studentSchool: 'Dream School: Duke',
  studentTarget: '34',
  currentScore: '26',
  scoreGap: '8 pts',
  diagnosticLabel: 'ACT Diagnostic',
  diagnosticSteps: [
    'Calculating composite baseline',
    'Analyzing section-by-section performance',
    'Confirming target composite',
    'Identifying highest-gain sections',
  ],
  riskBannerStats: [
    { value: '12,000+', label: 'families served' },
    { value: '4.9/5', label: 'rating' },
    { value: '6+', label: 'avg composite improvement' },
  ],
  riskBannerGuarantee: "If we can't help your child improve, you don't pay. It's that simple.",
  processSteps: [
    {
      title: 'Full ACT Diagnostic',
      description:
        'Your child takes a complete practice ACT. Our system analyzes performance across English, Math, Reading, and Science to pinpoint exact weaknesses.',
    },
    {
      title: 'Expert Matching & Custom Plan',
      description:
        'We pair your child with a 34+ scorer who specializes in their weakest sections. A week-by-week plan is built around your test date and goals.',
    },
    {
      title: 'Weekly Sessions & Score Tracking',
      description:
        'Section-specific 1-on-1 sessions with timed practice. Real-time dashboards show composite and section scores climbing week over week.',
    },
  ],
  results: [
    { name: 'Emma R.', initials: 'ER', scoreBefore: '24', scoreAfter: '33', gain: '+9', achievement: 'Duke + $50K Scholarship', period: '10 weeks' },
    { name: 'Ryan T.', initials: 'RT', scoreBefore: '27', scoreAfter: '34', gain: '+7', achievement: 'Northwestern Admitted', period: '12 weeks' },
    { name: 'Maya S.', initials: 'MS', scoreBefore: '22', scoreAfter: '30', gain: '+8', achievement: 'UMich Honors', period: '14 weeks' },
    { name: 'Noah P.', initials: 'NP', scoreBefore: '29', scoreAfter: '35', gain: '+6', achievement: 'Rice + Merit Award', period: '8 weeks' },
    { name: 'Zoe L.', initials: 'ZL', scoreBefore: '21', scoreAfter: '29', gain: '+8', achievement: 'UVA Admitted', period: '16 weeks' },
    { name: 'Tyler D.', initials: 'TD', scoreBefore: '25', scoreAfter: '33', gain: '+8', achievement: 'Emory + $40K Aid', period: '11 weeks' },
  ],
  faq: [
    {
      question: 'What ROI can I expect from ACT tutoring?',
      answer:
        'A 4-point ACT composite increase can mean $10,000-$40,000 more in merit aid. Our students average 6+ points of improvement, and many families see scholarship offers that far exceed the cost of tutoring.',
    },
    {
      question: 'How much will my child actually improve?',
      answer:
        'Our students average 6+ composite point gains. After the diagnostic, your tutor will give a realistic target based on section-level analysis. You\'ll see progress on a weekly dashboard—no guessing.',
    },
    {
      question: "What if it doesn't work? Is my money at risk?",
      answer:
        'No risk. We guarantee score improvement or your money back. With 12,000+ families served and a 4.9/5 rating, our track record speaks for itself. If your child follows the plan and doesn\'t improve, you get a full refund.',
    },
  ],
};

const chemContent: SubjectContent = {
  slug: 'chem',
  name: 'Chemistry Tutoring',
  headline: 'Give Your Child a',
  headlineHighlight: 'Top Chemistry Expert',
  subhead:
    'Get matched with a chemistry specialist who builds real understanding, not just memorization. Your child will master concepts, ace exams, and actually enjoy the subject.',
  benefits: [
    'Expert Chemistry Tutors (Top University Graduates)',
    'Aligned With Your Child\'s Course, Textbook & Pace',
    'Weekly Progress Reports & Parent Dashboard',
  ],
  ctaText: 'Book Free Strategy Session',
  ctaSecondary: 'See How It Works',
  tutorLabel: 'Chemistry Expert',
  tutorName: 'Dr. Rachel P.',
  tutorSchools: 'Caltech • PhD Chemistry',
  tutorStat: '5',
  tutorStatLabel: 'AP Chem Score',
  tutorStudentsTutored: 41,
  tutorAvgGain: '2 letter grades',
  studentName: 'Alex M.',
  studentSchool: 'Goal: AP Chem 5',
  studentTarget: 'A',
  currentScore: 'C+',
  scoreGap: '2 grades',
  diagnosticLabel: 'Chemistry Assessment',
  diagnosticSteps: [
    'Evaluating foundational knowledge',
    'Identifying conceptual gaps',
    'Mapping course syllabus alignment',
    'Prioritizing high-impact topics',
  ],
  riskBannerStats: [
    { value: '12,000+', label: 'families served' },
    { value: '4.9/5', label: 'rating' },
    { value: '2+', label: 'avg grade improvement' },
  ],
  riskBannerGuarantee: "If we can't help your child improve, you don't pay. It's that simple.",
  processSteps: [
    {
      title: 'Concept Assessment',
      description:
        'We evaluate your child\'s understanding of core chemistry concepts—from atomic structure to stoichiometry—to find exactly where comprehension breaks down.',
    },
    {
      title: 'Expert Matching & Custom Plan',
      description:
        'We pair your child with a chemistry expert who aligns sessions with their actual coursework, textbook, and upcoming exams for maximum relevance.',
    },
    {
      title: 'Weekly Sessions & Grade Tracking',
      description:
        'Guided problem-solving sessions build deep understanding. Your child\'s test scores and assignment grades are tracked to show concrete improvement.',
    },
  ],
  results: [
    { name: 'Alex M.', initials: 'AM', scoreBefore: 'C+', scoreAfter: 'A', gain: '+2 grades', achievement: 'AP Chem Score: 5', period: '12 weeks' },
    { name: 'Sarah K.', initials: 'SK', scoreBefore: 'D', scoreAfter: 'B+', gain: '+3 grades', achievement: 'Honor Roll', period: '10 weeks' },
    { name: 'Jason T.', initials: 'JT', scoreBefore: 'C-', scoreAfter: 'A-', gain: '+2 grades', achievement: 'AP Score: 4', period: '14 weeks' },
    { name: 'Mia L.', initials: 'ML', scoreBefore: 'F', scoreAfter: 'B', gain: '+4 grades', achievement: 'Passed the Course', period: '16 weeks' },
    { name: 'Daniel R.', initials: 'DR', scoreBefore: 'B-', scoreAfter: 'A+', gain: '+2 grades', achievement: 'Science Award', period: '8 weeks' },
    { name: 'Emma W.', initials: 'EW', scoreBefore: 'C', scoreAfter: 'A', gain: '+2 grades', achievement: 'AP Score: 5', period: '11 weeks' },
  ],
  faq: [
    {
      question: 'Is chemistry tutoring really worth the investment?',
      answer:
        'Absolutely. A strong chemistry grade is critical for STEM college applications. Our students improve an average of 2 letter grades, and many go on to score 4-5 on the AP exam—opening doors to competitive STEM programs and saving thousands in college credits.',
    },
    {
      question: 'How much will my child actually improve?',
      answer:
        'Our students average 2+ letter grade improvement. After the initial assessment, your tutor will set realistic targets. Many students go from failing to honor roll within a semester. Progress is tracked through test scores and assignment grades.',
    },
    {
      question: "What if it doesn't work? Is my money at risk?",
      answer:
        'No risk at all. We offer a satisfaction guarantee—if your child follows the study plan and doesn\'t show measurable improvement, we\'ll adjust the approach or refund your investment. With 12,000+ families and a 4.9/5 rating, our methodology is proven.',
    },
  ],
};

const calcContent: SubjectContent = {
  slug: 'calc',
  name: 'Calculus Tutoring',
  headline: 'Give Your Child a',
  headlineHighlight: 'Top Calculus Expert',
  subhead:
    'Get matched with a calculus specialist who builds intuition, not just formulas. Your child will understand the "why," solve problems confidently, and excel on the AP exam.',
  benefits: [
    'Expert Calculus Tutors (Top Math Graduates)',
    'Customized For AB or BC Course Level',
    'Weekly Progress Reports & Parent Dashboard',
  ],
  ctaText: 'Book Free Strategy Session',
  ctaSecondary: 'See How It Works',
  tutorLabel: 'Calculus Expert',
  tutorName: 'Prof. James L.',
  tutorSchools: 'Princeton • MS Mathematics',
  tutorStat: '5',
  tutorStatLabel: 'AP Calc Score',
  tutorStudentsTutored: 52,
  tutorAvgGain: '2.5 letter grades',
  studentName: 'Maya S.',
  studentSchool: 'Goal: AP Calc BC 5',
  studentTarget: 'A',
  currentScore: 'D+',
  scoreGap: '3 grades',
  diagnosticLabel: 'Calculus Assessment',
  diagnosticSteps: [
    'Testing prerequisite knowledge',
    'Evaluating calculus concept mastery',
    'Mapping course progress & syllabus',
    'Identifying highest-gain topics',
  ],
  riskBannerStats: [
    { value: '12,000+', label: 'families served' },
    { value: '4.9/5', label: 'rating' },
    { value: '2+', label: 'avg grade improvement' },
  ],
  riskBannerGuarantee: "If we can't help your child improve, you don't pay. It's that simple.",
  processSteps: [
    {
      title: 'Foundation Assessment',
      description:
        'We test your child\'s algebra and pre-calculus foundations alongside current calculus concepts to find exactly where understanding breaks down.',
    },
    {
      title: 'Expert Matching & Custom Plan',
      description:
        'We pair your child with a calculus specialist matched to their course level (AB or BC). Sessions align with their syllabus and upcoming exams.',
    },
    {
      title: 'Weekly Sessions & Grade Tracking',
      description:
        'Visual, intuition-building sessions with guided problem sets. Test scores are tracked weekly so you can see the improvement trajectory clearly.',
    },
  ],
  results: [
    { name: 'Maya S.', initials: 'MS', scoreBefore: 'D+', scoreAfter: 'A-', gain: '+3 grades', achievement: 'AP Calc BC Score: 5', period: '14 weeks' },
    { name: 'Brian T.', initials: 'BT', scoreBefore: 'C-', scoreAfter: 'A', gain: '+2 grades', achievement: 'AP Score: 5', period: '12 weeks' },
    { name: 'Hannah K.', initials: 'HK', scoreBefore: 'F', scoreAfter: 'B+', gain: '+4 grades', achievement: 'Passed the Course', period: '16 weeks' },
    { name: 'Kevin L.', initials: 'KL', scoreBefore: 'C', scoreAfter: 'A', gain: '+2 grades', achievement: 'Engineering Admitted', period: '10 weeks' },
    { name: 'Grace W.', initials: 'GW', scoreBefore: 'B-', scoreAfter: 'A+', gain: '+2 grades', achievement: 'Math Award', period: '8 weeks' },
    { name: 'Sam R.', initials: 'SR', scoreBefore: 'D', scoreAfter: 'B+', gain: '+3 grades', achievement: 'AP Score: 4', period: '13 weeks' },
  ],
  faq: [
    {
      question: 'Is calculus tutoring really worth the investment?',
      answer:
        'Calculus is the gatekeeper to every STEM major and competitive college program. A strong grade opens doors to engineering, CS, pre-med, and more. Our students average 2+ letter grade improvement, and many go on to ace the AP exam—earning college credit worth thousands.',
    },
    {
      question: 'How much will my child actually improve?',
      answer:
        'Our students average 2+ letter grade improvement. After the initial assessment, your tutor identifies prerequisite gaps and builds from there. Many students go from D/F range to A/B within a semester. Weekly progress tracking keeps everyone aligned.',
    },
    {
      question: "What if it doesn't work? Is my money at risk?",
      answer:
        'Zero risk. We guarantee measurable improvement or your money back. If your child follows the study plan and doesn\'t show meaningful progress, we\'ll refund your investment. 12,000+ families trust us for a reason.',
    },
  ],
};

const readingContent: SubjectContent = {
  slug: 'reading',
  name: 'Reading Tutoring',
  headline: 'Give Your Child a',
  headlineHighlight: 'Top Reading Specialist',
  subhead:
    'Get matched with a reading expert who builds comprehension, develops critical analysis, and helps your child become a confident, capable reader who loves books.',
  benefits: [
    'Expert Reading & Literacy Specialists',
    'Customized For Your Child\'s Grade Level & Goals',
    'Weekly Progress Reports & Parent Dashboard',
  ],
  ctaText: 'Book Free Strategy Session',
  ctaSecondary: 'See How It Works',
  tutorLabel: 'Reading Specialist',
  tutorName: 'Emily W.',
  tutorSchools: 'Harvard • MEd Reading',
  tutorStat: 'A+',
  tutorStatLabel: 'Student Results',
  tutorStudentsTutored: 47,
  tutorAvgGain: '2 grade levels',
  studentName: 'Olivia T.',
  studentSchool: 'Goal: Read at Grade Level',
  studentTarget: '89th %ile',
  currentScore: '42nd %ile',
  scoreGap: '47 percentile pts',
  diagnosticLabel: 'Reading Assessment',
  diagnosticSteps: [
    'Measuring reading fluency & speed',
    'Evaluating comprehension depth',
    'Assessing vocabulary knowledge',
    'Identifying skill priorities',
  ],
  riskBannerStats: [
    { value: '12,000+', label: 'families served' },
    { value: '4.9/5', label: 'rating' },
    { value: '2+', label: 'avg grade level gain' },
  ],
  riskBannerGuarantee: "If we can't help your child improve, you don't pay. It's that simple.",
  processSteps: [
    {
      title: 'Reading Assessment',
      description:
        'We measure your child\'s reading level, fluency, comprehension depth, and vocabulary. The assessment reveals exactly where they need support.',
    },
    {
      title: 'Specialist Matching & Custom Plan',
      description:
        'We pair your child with a reading specialist who uses age-appropriate texts matched to their interests. Every session builds on the last.',
    },
    {
      title: 'Weekly Sessions & Progress Tracking',
      description:
        'Engaging 1-on-1 sessions develop active reading habits, critical thinking, and vocabulary. You see reading level and comprehension scores improve weekly.',
    },
  ],
  results: [
    { name: 'Olivia T.', initials: 'OT', scoreBefore: '42nd %ile', scoreAfter: '89th %ile', gain: '+47 %ile', achievement: 'Reading 2 Years Ahead', period: '14 weeks' },
    { name: 'Lucas M.', initials: 'LM', scoreBefore: '3rd Grade', scoreAfter: '5th Grade', gain: '+2 levels', achievement: 'Honor Roll', period: '12 weeks' },
    { name: 'Sophie K.', initials: 'SK', scoreBefore: '28th %ile', scoreAfter: '75th %ile', gain: '+47 %ile', achievement: 'A+ in English', period: '16 weeks' },
    { name: 'Aiden R.', initials: 'AR', scoreBefore: 'Below Grade', scoreAfter: 'Above Grade', gain: '+3 levels', achievement: 'Now Loves Reading', period: '10 weeks' },
    { name: 'Lily W.', initials: 'LW', scoreBefore: '50th %ile', scoreAfter: '92nd %ile', gain: '+42 %ile', achievement: 'AP Lit Ready', period: '11 weeks' },
    { name: 'Max D.', initials: 'MD', scoreBefore: '1st Grade', scoreAfter: '3rd Grade', gain: '+2 levels', achievement: 'Reads Independently', period: '13 weeks' },
  ],
  faq: [
    {
      question: 'Is reading tutoring really worth the investment?',
      answer:
        'Reading ability impacts every single subject and standardized test your child will ever take. Students who read at or above grade level perform better across all academics—from science to social studies. The skills gained from expert reading instruction last a lifetime.',
    },
    {
      question: 'How much will my child actually improve?',
      answer:
        'Our students average 2+ grade levels of reading improvement. After the initial assessment, your specialist sets realistic milestones. Many children go from below grade level to above within a semester. Weekly reading level tracking shows exactly where they stand.',
    },
    {
      question: "What if it doesn't work? Is my money at risk?",
      answer:
        'No risk. We guarantee measurable reading improvement or your money back. If your child follows the reading plan and doesn\'t show progress, we\'ll adjust the approach or refund your investment. 12,000+ families trust us with their children\'s reading development.',
    },
  ],
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
