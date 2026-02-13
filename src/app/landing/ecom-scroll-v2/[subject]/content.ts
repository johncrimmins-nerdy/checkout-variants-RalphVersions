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
  tutorCredentials: string;
  tutorStat: string;
  tutorStatLabel: string;
  platformLabel: string;
  platformScore: string;
  platformScoreLabel: string;
  breakdownLabel: string;
  breakdownScore: string;
  breakdownDetail: string;
  studentName: string;
  differentiator: {
    headline: string;
    pillars: {
      title: string;
      description: string;
      stat: string;
      statLabel: string;
    }[];
    statsBox: { value: string; label: string }[];
  };
  comparison: {
    categories: string[];
    varsityTutors: string[];
    competitors: { name: string; values: string[] }[];
  };
  faq: { question: string; answer: string }[];
}

const satContent: SubjectContent = {
  slug: 'sat',
  name: 'SAT Prep',
  headline: "Access To The World's",
  headlineHighlight: 'Top SAT Experts & Platform',
  subhead:
    'Get matched with a dedicated SAT specialist who diagnoses gaps, builds a custom study plan, and uses our powerful platform to track every step of your child\'s score improvement journey.',
  benefits: [
    'Top 1% Vetted SAT-Scoring Tutors (1500+ Verified)',
    'AI-Powered Diagnostic & Personalized Study Plan',
    'Weekly Progress Reports & Parent Dashboard',
  ],
  ctaText: 'Get Started Free',
  ctaSecondary: 'Book a Free Consultation',
  tutorLabel: 'Your Expert Tutor',
  tutorName: 'Sarah M.',
  tutorCredentials: 'MIT • Stanford MBA',
  tutorStat: '1590',
  tutorStatLabel: 'SAT Score',
  platformLabel: 'SAT Skill Assessment',
  platformScore: '1410',
  platformScoreLabel: 'Current Score',
  breakdownLabel: 'Reading & Writing',
  breakdownScore: '710',
  breakdownDetail: '48/54 questions',
  studentName: 'Jake T.',
  differentiator: {
    headline: 'What Actually Moves the Score',
    pillars: [
      {
        title: '1:1 Connection',
        description:
          'A dedicated expert who knows your child\'s strengths, weaknesses, and learning style—not a rotating cast of generic instructors.',
        stat: '3x',
        statLabel: 'more effective than group classes',
      },
      {
        title: 'Effortful Practice',
        description:
          'Targeted drills on the exact question types your child struggles with, not hours of review on topics they\'ve already mastered.',
        stat: '200+',
        statLabel: 'avg point improvement',
      },
      {
        title: 'Diagnostic-Driven Prep',
        description:
          'AI-powered analysis identifies the 20% of content gaps causing 80% of missed points, so every session counts.',
        stat: '80%',
        statLabel: 'faster than traditional prep',
      },
    ],
    statsBox: [
      { value: '12,000+', label: 'Families Helped' },
      { value: '$4.2M+', label: 'In Merit Scholarships' },
      { value: '97%', label: 'Would Recommend' },
    ],
  },
  comparison: {
    categories: [
      'Format',
      'Accountability',
      'Personalization',
      'Guarantee',
      'Typical Investment',
      'Avg Results',
    ],
    varsityTutors: [
      '1-on-1 Expert Tutoring',
      'Weekly progress reports + parent dashboard',
      'AI diagnostic + custom study plan',
      'Score improvement or money back',
      '$2,000-$4,000',
      '+200 points avg',
    ],
    competitors: [
      {
        name: 'Kaplan',
        values: [
          'Group classes (20-30 students)',
          'Self-paced modules',
          'One-size-fits-all curriculum',
          'Limited guarantee',
          '$1,500-$2,500',
          '+90 points avg',
        ],
      },
      {
        name: 'Princeton Review',
        values: [
          'Group classes (15-25 students)',
          'Online homework tracking',
          'Standardized approach',
          'Score improvement guarantee*',
          '$1,800-$3,000',
          '+120 points avg',
        ],
      },
      {
        name: 'Self-Study',
        values: [
          'Books & apps alone',
          'None',
          'DIY research',
          'None',
          '$50-$200',
          '+50 points avg',
        ],
      },
    ],
  },
  faq: [
    {
      question: 'We already tried Kaplan/Princeton Review and it didn\'t work. Why would this be different?',
      answer:
        'Group classes teach to the average student, not yours. Our tutors are top 1% SAT scorers who build completely customized plans around your child\'s specific diagnostic results. When a student is struggling with inference questions but strong in vocabulary, we don\'t waste time on vocabulary drills. That precision is why our students average 200+ point improvements vs 90-120 for group classes.',
    },
    {
      question: 'My child is already scoring well (1300+). Can a tutor really help at the higher end?',
      answer:
        'The last 200 points are the hardest to gain and require the most sophisticated strategies. Our high-scoring tutors (1500+) specialize in the subtle skills needed for 1400-1600 range: time management on difficult passages, strategic question ordering, and avoiding the traps designed to catch good-but-not-great students.',
    },
    {
      question: 'How is this different from the free Khan Academy SAT prep?',
      answer:
        'Khan Academy is excellent for content review but can\'t provide the accountability, strategic coaching, and personalized feedback that moves scores. Our students who previously used Khan Academy alone see an additional 150+ points after working with a tutor. The platform is a tool—you still need an expert coach.',
    },
    {
      question: 'What if we\'re not happy with our tutor match?',
      answer:
        'We guarantee your tutor match. If the chemistry isn\'t right, we\'ll rematch you within 24 hours at no extra cost—no questions asked. 94% of families stick with their first match because our algorithm considers teaching style, personality, and learning preferences.',
    },
    {
      question: 'How much does it cost and is it worth it?',
      answer:
        'Plans range from $2,000-$4,000 depending on duration and frequency. Our students earn an average of $42,000 more in merit scholarships than self-study students. That\'s a 10-20x return on investment. Plus, the score improvement guarantee means you\'re not risking your money.',
    },
    {
      question: 'My child is unmotivated. Will a tutor help with that?',
      answer:
        'This is actually one of the most common concerns we hear—and where 1-on-1 tutoring shines. An expert tutor builds a relationship with your child, celebrates wins, and creates accountability that no app or group class can. Parents consistently tell us their child\'s attitude toward the SAT transforms within the first few sessions.',
    },
  ],
};

const actContent: SubjectContent = {
  slug: 'act',
  name: 'ACT Prep',
  headline: "Access To The World's",
  headlineHighlight: 'Top ACT Experts & Platform',
  subhead:
    'Get matched with a dedicated ACT specialist who masters all four sections, builds a custom strategy, and uses our diagnostic platform to accelerate your child\'s score improvement.',
  benefits: [
    'Top 1% Vetted ACT-Scoring Tutors (34+ Verified)',
    'Section-Specific Strategy & Time Management',
    'Weekly Progress Reports & Parent Dashboard',
  ],
  ctaText: 'Get Started Free',
  ctaSecondary: 'Book a Free Consultation',
  tutorLabel: 'Your Expert Tutor',
  tutorName: 'David K.',
  tutorCredentials: 'Yale • Columbia MBA',
  tutorStat: '36',
  tutorStatLabel: 'ACT Score',
  platformLabel: 'ACT Skill Assessment',
  platformScore: '28',
  platformScoreLabel: 'Composite Score',
  breakdownLabel: 'Science Reasoning',
  breakdownScore: '25',
  breakdownDetail: '32/40 questions',
  studentName: 'Emma R.',
  differentiator: {
    headline: 'What Actually Moves the Score',
    pillars: [
      {
        title: '1:1 Connection',
        description:
          'A dedicated expert who knows your child\'s strengths across all four sections—not a generic group instructor teaching to the middle.',
        stat: '3x',
        statLabel: 'more effective than group classes',
      },
      {
        title: 'Effortful Practice',
        description:
          'Section-specific drills and timed practice on exact question types your child struggles with, building both accuracy and speed.',
        stat: '6+',
        statLabel: 'avg composite improvement',
      },
      {
        title: 'Diagnostic-Driven Prep',
        description:
          'AI analysis across all four ACT sections identifies the precise skill gaps holding your child back from their target score.',
        stat: '80%',
        statLabel: 'faster than traditional prep',
      },
    ],
    statsBox: [
      { value: '12,000+', label: 'Families Helped' },
      { value: '$4.2M+', label: 'In Merit Scholarships' },
      { value: '97%', label: 'Would Recommend' },
    ],
  },
  comparison: {
    categories: [
      'Format',
      'Accountability',
      'Personalization',
      'Guarantee',
      'Typical Investment',
      'Avg Results',
    ],
    varsityTutors: [
      '1-on-1 Expert Tutoring',
      'Weekly progress reports + parent dashboard',
      'AI diagnostic + custom study plan',
      'Score improvement or money back',
      '$2,000-$4,000',
      '+6 composite avg',
    ],
    competitors: [
      {
        name: 'Kaplan',
        values: [
          'Group classes (20-30 students)',
          'Self-paced modules',
          'One-size-fits-all curriculum',
          'Limited guarantee',
          '$1,500-$2,500',
          '+2-3 composite avg',
        ],
      },
      {
        name: 'Princeton Review',
        values: [
          'Group classes (15-25 students)',
          'Online homework tracking',
          'Standardized approach',
          'Score improvement guarantee*',
          '$1,800-$3,000',
          '+3-4 composite avg',
        ],
      },
      {
        name: 'Self-Study',
        values: [
          'Books & apps alone',
          'None',
          'DIY research',
          'None',
          '$50-$200',
          '+1-2 composite avg',
        ],
      },
    ],
  },
  faq: [
    {
      question: 'We already tried other ACT prep and it didn\'t work. Why would this be different?',
      answer:
        'Group classes can\'t address the unique challenge of the ACT: four very different sections requiring four different strategies. Our tutors scored 34+ themselves and create section-specific plans. If your child struggles with Science but excels at English, we don\'t waste time on English drills.',
    },
    {
      question: 'My child runs out of time on every section. Can a tutor fix that?',
      answer:
        'Time management is the #1 ACT challenge and exactly where 1-on-1 coaching excels. Our tutors teach section-specific pacing strategies, question-ordering techniques, and when to strategically skip. Most students gain 2-3 composite points from timing strategies alone.',
    },
    {
      question: 'How is the ACT diagnostic different from just taking a practice test?',
      answer:
        'A practice test tells you the score; our AI diagnostic tells you why. It identifies patterns in wrong answers—are they conceptual gaps, careless errors, or timing issues? This precision means every tutoring minute targets the highest-impact areas.',
    },
    {
      question: 'What if we\'re not happy with our tutor match?',
      answer:
        'We guarantee your tutor match. If the fit isn\'t right, we\'ll rematch you within 24 hours at no extra cost. 94% of families love their first match because we consider teaching style, personality, and section-specific expertise.',
    },
    {
      question: 'How much does it cost and is it worth it?',
      answer:
        'Plans range from $2,000-$4,000. A 4-point composite increase can mean $10,000-$40,000 more in merit scholarships. Our students average 6+ points improvement, making the ROI substantial. Plus, the score improvement guarantee protects your investment.',
    },
    {
      question: 'My child is unmotivated for ACT prep. Will a tutor help?',
      answer:
        'A dedicated tutor builds a relationship, creates accountability, and makes prep feel manageable rather than overwhelming. Parents consistently tell us their child\'s attitude transforms when they have someone in their corner who celebrates every improvement.',
    },
  ],
};

const chemContent: SubjectContent = {
  slug: 'chem',
  name: 'Chemistry Tutoring',
  headline: 'Master Chemistry With',
  headlineHighlight: 'Expert Guidance & Platform',
  subhead:
    'Get matched with a chemistry specialist who breaks down complex concepts, tracks your child\'s progress on our platform, and builds the deep understanding needed for class and AP success.',
  benefits: [
    'Expert Chemistry Tutors (Top University Graduates)',
    'Concept-by-Concept Progress Tracking Dashboard',
    'AP Chemistry & Honors Level Specialization',
  ],
  ctaText: 'Find My Chemistry Tutor',
  ctaSecondary: 'Book a Free Consultation',
  tutorLabel: 'Your Chemistry Expert',
  tutorName: 'Dr. Rachel P.',
  tutorCredentials: 'Caltech • PhD Chemistry',
  tutorStat: '5',
  tutorStatLabel: 'AP Chem Score',
  platformLabel: 'Chemistry Assessment',
  platformScore: '72%',
  platformScoreLabel: 'Current Mastery',
  breakdownLabel: 'Stoichiometry',
  breakdownScore: '58%',
  breakdownDetail: '14/24 concepts',
  studentName: 'Alex M.',
  differentiator: {
    headline: 'What Actually Builds Chemistry Understanding',
    pillars: [
      {
        title: '1:1 Connection',
        description:
          'A dedicated expert who identifies exactly where your child\'s understanding breaks down—not a TA rushing through a review session.',
        stat: '3x',
        statLabel: 'more effective than group tutoring',
      },
      {
        title: 'Effortful Practice',
        description:
          'Targeted problem sets on the exact concepts your child struggles with, building true understanding rather than memorized shortcuts.',
        stat: '2+',
        statLabel: 'avg letter grade improvement',
      },
      {
        title: 'Diagnostic-Driven Learning',
        description:
          'Our platform maps your child\'s mastery of every chemistry concept, so sessions always target the highest-impact gaps.',
        stat: '95%',
        statLabel: 'of students improve within 4 weeks',
      },
    ],
    statsBox: [
      { value: '12,000+', label: 'Families Helped' },
      { value: '4.5+', label: 'Avg AP Exam Score' },
      { value: '98%', label: 'Satisfaction Rate' },
    ],
  },
  comparison: {
    categories: [
      'Format',
      'Accountability',
      'Personalization',
      'Guarantee',
      'Typical Investment',
      'Avg Results',
    ],
    varsityTutors: [
      '1-on-1 Expert Tutoring',
      'Concept mastery tracking + parent updates',
      'Aligned to your child\'s exact course & textbook',
      'Satisfaction guarantee',
      '$1,500-$3,000',
      '+2 letter grades avg',
    ],
    competitors: [
      {
        name: 'Tutoring Centers',
        values: [
          'Small group (3-6 students)',
          'Session attendance only',
          'Generic chemistry review',
          'None',
          '$1,000-$2,000',
          '+1 letter grade avg',
        ],
      },
      {
        name: 'Online Courses',
        values: [
          'Pre-recorded videos',
          'None',
          'Standardized curriculum',
          'None',
          '$100-$500',
          'Minimal improvement',
        ],
      },
      {
        name: 'Study Groups',
        values: [
          'Peer-led sessions',
          'Informal',
          'Depends on group',
          'None',
          'Free',
          'Variable',
        ],
      },
    ],
  },
  faq: [
    {
      question: 'My child says they "just don\'t get chemistry." Can tutoring really change that?',
      answer:
        'Absolutely. Chemistry is a subject where concepts build sequentially—if you miss one link, everything after it is confusing. Our tutors identify exactly where the chain broke and rebuild from there, using clear analogies and hands-on problem-solving that make concepts click.',
    },
    {
      question: 'We\'ve tried tutoring before and it didn\'t help. What\'s different here?',
      answer:
        'Most tutoring is reactive—helping with tonight\'s homework. Our approach is diagnostic-driven: we map your child\'s understanding of every concept, identify the root causes of confusion, and build a systematic plan that creates lasting understanding rather than temporary fixes.',
    },
    {
      question: 'Can the tutor help with AP Chemistry specifically?',
      answer:
        'Yes! Many of our tutors specialize in AP Chemistry. They\'ll align with your child\'s coursework while teaching AP-specific exam strategies, including how to tackle free-response questions and lab-based problems that trip up most students.',
    },
    {
      question: 'What if our tutor isn\'t the right fit?',
      answer:
        'We guarantee your tutor match. If the fit isn\'t right, we\'ll rematch you within 24 hours at no extra cost. Our matching algorithm considers teaching style, personality, and subject specialization to get it right the first time.',
    },
    {
      question: 'How quickly will we see improvement?',
      answer:
        '95% of our chemistry students show measurable improvement within the first 4 weeks. Many parents report their child\'s confidence in class changes after just 2-3 sessions, even before test scores catch up.',
    },
    {
      question: 'Is the investment worth it for a high school class?',
      answer:
        'Chemistry grades directly impact GPA, college applications, and access to STEM programs. A strong foundation now opens doors to competitive majors in engineering, pre-med, and sciences. Our students see results that carry over to future STEM courses.',
    },
  ],
};

const calcContent: SubjectContent = {
  slug: 'calc',
  name: 'Calculus Tutoring',
  headline: 'Conquer Calculus With',
  headlineHighlight: 'Expert Guidance & Platform',
  subhead:
    'Get matched with a calculus specialist who builds intuition for derivatives and integrals, tracks mastery on our platform, and delivers the problem-solving confidence your child needs.',
  benefits: [
    'Expert Calculus Tutors (Top Math Graduates)',
    'Step-by-Step Problem Mastery Tracking',
    'AP Calculus AB & BC Specialization',
  ],
  ctaText: 'Find My Calculus Tutor',
  ctaSecondary: 'Book a Free Consultation',
  tutorLabel: 'Your Calculus Expert',
  tutorName: 'Prof. James L.',
  tutorCredentials: 'Princeton • MS Mathematics',
  tutorStat: '5',
  tutorStatLabel: 'AP Calc Score',
  platformLabel: 'Calculus Assessment',
  platformScore: '68%',
  platformScoreLabel: 'Current Mastery',
  breakdownLabel: 'Integration',
  breakdownScore: '52%',
  breakdownDetail: '11/21 concepts',
  studentName: 'Maya S.',
  differentiator: {
    headline: 'What Actually Builds Math Confidence',
    pillars: [
      {
        title: '1:1 Connection',
        description:
          'A dedicated math expert who sees exactly where your child gets stuck—not a classroom teacher moving on to the next chapter.',
        stat: '3x',
        statLabel: 'more effective than group tutoring',
      },
      {
        title: 'Effortful Practice',
        description:
          'Carefully sequenced problems that build intuition step by step, so your child truly understands rather than just memorizes formulas.',
        stat: '2+',
        statLabel: 'avg letter grade improvement',
      },
      {
        title: 'Diagnostic-Driven Learning',
        description:
          'Our platform tracks mastery of every calculus concept from limits through integration, ensuring no gaps go unaddressed.',
        stat: '95%',
        statLabel: 'of students improve within 4 weeks',
      },
    ],
    statsBox: [
      { value: '12,000+', label: 'Families Helped' },
      { value: '4.6', label: 'Avg AP Exam Score' },
      { value: '98%', label: 'Satisfaction Rate' },
    ],
  },
  comparison: {
    categories: [
      'Format',
      'Accountability',
      'Personalization',
      'Guarantee',
      'Typical Investment',
      'Avg Results',
    ],
    varsityTutors: [
      '1-on-1 Expert Tutoring',
      'Concept mastery tracking + parent updates',
      'Aligned to AB or BC curriculum',
      'Satisfaction guarantee',
      '$1,500-$3,000',
      '+2 letter grades avg',
    ],
    competitors: [
      {
        name: 'Tutoring Centers',
        values: [
          'Small group (3-6 students)',
          'Session attendance only',
          'Generic math review',
          'None',
          '$1,000-$2,000',
          '+1 letter grade avg',
        ],
      },
      {
        name: 'Online Courses',
        values: [
          'Pre-recorded videos',
          'None',
          'Standardized curriculum',
          'None',
          '$100-$500',
          'Minimal improvement',
        ],
      },
      {
        name: 'Study Groups',
        values: [
          'Peer-led sessions',
          'Informal',
          'Depends on group',
          'None',
          'Free',
          'Variable',
        ],
      },
    ],
  },
  faq: [
    {
      question: 'My child struggled with pre-calc. Can they still succeed in calculus?',
      answer:
        'Yes. Many calculus struggles stem from gaps in algebra and pre-calculus foundations. Our tutors identify and fill those gaps while teaching new calculus concepts, building the solid foundation needed for success.',
    },
    {
      question: 'We\'ve tried tutoring before and it didn\'t help. What\'s different?',
      answer:
        'Most math tutoring is homework help—reactive, not strategic. Our approach uses diagnostic assessment to map every concept gap, then builds a systematic plan that creates lasting understanding. We target the root cause, not the symptoms.',
    },
    {
      question: 'Can the tutor help with both AP Calculus AB and BC?',
      answer:
        'Absolutely. Our tutors specialize in both curricula, including AP-specific exam strategies for free-response and multiple-choice sections. Many of our students score 4s and 5s on the AP exam.',
    },
    {
      question: 'What if our tutor isn\'t the right fit?',
      answer:
        'We guarantee your tutor match. If the fit isn\'t right, we\'ll rematch you within 24 hours at no extra cost. The right personality and teaching style match makes a huge difference in math learning.',
    },
    {
      question: 'How quickly will we see improvement?',
      answer:
        '95% of our calculus students show measurable improvement within 4 weeks. Many students report feeling more confident in class after just 2-3 sessions as foundational gaps get filled.',
    },
    {
      question: 'Is calculus tutoring worth the investment?',
      answer:
        'Calculus is a gatekeeper course for STEM majors. A strong grade opens doors to engineering, computer science, and pre-med programs at top universities. The investment in understanding now pays dividends throughout college.',
    },
  ],
};

const readingContent: SubjectContent = {
  slug: 'reading',
  name: 'Reading Tutoring',
  headline: 'Transform Reading Skills With',
  headlineHighlight: 'Expert Guidance & Platform',
  subhead:
    'Get matched with a reading specialist who builds comprehension skills, tracks progress on our platform, and develops the critical analysis abilities your child needs to excel.',
  benefits: [
    'Expert Reading & Literacy Specialists',
    'Reading Level & Comprehension Tracking Dashboard',
    'All Grade Levels: K-12 & AP Literature',
  ],
  ctaText: 'Find My Reading Tutor',
  ctaSecondary: 'Book a Free Consultation',
  tutorLabel: 'Your Reading Expert',
  tutorName: 'Emily W.',
  tutorCredentials: 'Harvard • MEd Reading',
  tutorStat: 'A+',
  tutorStatLabel: 'Student Results',
  platformLabel: 'Reading Assessment',
  platformScore: '6.2',
  platformScoreLabel: 'Grade Level',
  breakdownLabel: 'Comprehension',
  breakdownScore: '64%',
  breakdownDetail: '16/25 skills',
  studentName: 'Olivia T.',
  differentiator: {
    headline: 'What Actually Builds Strong Readers',
    pillars: [
      {
        title: '1:1 Connection',
        description:
          'A dedicated specialist who selects texts matching your child\'s interests and level—not a classroom teacher assigning the same book to everyone.',
        stat: '3x',
        statLabel: 'more effective than group instruction',
      },
      {
        title: 'Effortful Practice',
        description:
          'Guided reading with real-time feedback on comprehension strategies, building skills that transfer to every subject.',
        stat: '2+',
        statLabel: 'avg grade level improvement',
      },
      {
        title: 'Diagnostic-Driven Learning',
        description:
          'Our platform tracks reading level, vocabulary, comprehension, and analysis skills so sessions always target the right growth areas.',
        stat: '95%',
        statLabel: 'of students improve within 4 weeks',
      },
    ],
    statsBox: [
      { value: '12,000+', label: 'Families Helped' },
      { value: '47+', label: 'Avg Percentile Gain' },
      { value: '98%', label: 'Satisfaction Rate' },
    ],
  },
  comparison: {
    categories: [
      'Format',
      'Accountability',
      'Personalization',
      'Guarantee',
      'Typical Investment',
      'Avg Results',
    ],
    varsityTutors: [
      '1-on-1 Expert Tutoring',
      'Reading level tracking + parent updates',
      'Interest-matched texts & customized plan',
      'Satisfaction guarantee',
      '$1,500-$3,000',
      '+2 grade levels avg',
    ],
    competitors: [
      {
        name: 'Reading Programs',
        values: [
          'Group classes (8-12 students)',
          'Session attendance only',
          'Standardized curriculum',
          'None',
          '$800-$1,500',
          '+0.5 grade level avg',
        ],
      },
      {
        name: 'Online Apps',
        values: [
          'Self-paced digital',
          'None',
          'Algorithm-based',
          'None',
          '$10-$30/month',
          'Minimal improvement',
        ],
      },
      {
        name: 'School Support',
        values: [
          'Small group pull-out',
          'Teacher reports',
          'Grade-level materials',
          'None',
          'Free',
          'Variable',
        ],
      },
    ],
  },
  faq: [
    {
      question: 'My child hates reading. Can a tutor really change that?',
      answer:
        'Absolutely. Our tutors are skilled at finding texts that match your child\'s interests while building skills. When reading becomes easier and engaging, attitudes transform. Many parents tell us their child voluntarily picks up books after just a few weeks of tutoring.',
    },
    {
      question: 'We\'ve tried reading programs before and they didn\'t work. What\'s different?',
      answer:
        'Most reading programs use standardized materials that may not connect with your child. Our tutors select texts based on your child\'s interests, assess comprehension in real-time, and adjust strategies on the spot. It\'s precision coaching, not a one-size-fits-all program.',
    },
    {
      question: 'How is this different from what my child gets at school?',
      answer:
        'Classroom teachers manage 25+ students with varying levels. Our tutors provide the undivided attention, instant feedback, and personalized text selection that classroom settings simply can\'t offer. We also coordinate with teachers to reinforce classroom learning.',
    },
    {
      question: 'What if our tutor isn\'t the right fit?',
      answer:
        'We guarantee your tutor match. If the fit isn\'t right, we\'ll rematch you within 24 hours. For reading especially, the student-tutor relationship is crucial, and our matching considers personality, teaching style, and specialization.',
    },
    {
      question: 'How quickly will we see improvement?',
      answer:
        '95% of our reading students show measurable improvement within 4 weeks. Many parents notice their child\'s confidence and willingness to read changes even sooner. Long-term, our students gain an average of 2+ grade levels.',
    },
    {
      question: 'Is reading tutoring worth it when my child can practice at home?',
      answer:
        'Reading practice without skilled guidance can reinforce bad habits. Our tutors teach active reading strategies, build vocabulary in context, and develop critical thinking skills that independent practice alone can\'t develop. These skills transfer to every subject.',
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
