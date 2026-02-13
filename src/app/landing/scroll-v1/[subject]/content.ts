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
  tutorSchools: string[];
  tutorStat: string;
  tutorStatLabel: string;
  studentName: string;
  scoreBefore: string;
  scoreAfter: string;
  scoreGain: string;
  achievementBadge: string;
  stats: { value: string; label: string }[];
  howItWorks: { title: string; description: string }[];
  testimonials: {
    name: string;
    role: string;
    rating: number;
    text: string;
    result: string;
  }[];
  faq: { question: string; answer: string }[];
}

const satContent: SubjectContent = {
  slug: 'sat',
  name: 'SAT Prep',
  headline: "Instant Access To The World's",
  headlineHighlight: 'Top SAT Experts',
  subhead:
    'Get a dedicated SAT specialist who diagnoses your child\'s exact gaps, builds a custom study plan, and delivers the accountability that self-study can\'t match... a true score-raising expert.',
  benefits: [
    'Top 1% Vetted SAT-Scoring Tutors (1500+ Verified)',
    "Customized For Your Child's Goals, Dream Schools & Schedule",
    'Guaranteed Perfect Match, No-Risk Trial',
  ],
  ctaText: 'Meet My Perfect Tutor',
  ctaSecondary: 'Book a Free Consultation',
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
  stats: [
    { value: '200+', label: 'Avg Point Improvement' },
    { value: '12,000+', label: 'Families Helped' },
    { value: '1500+', label: 'Min Tutor SAT Score' },
    { value: '$4.2M+', label: 'In Merit Scholarships' },
  ],
  howItWorks: [
    {
      title: 'Diagnosis & Matching',
      description:
        'We analyze your child\'s practice test to identify exact skill gaps, then match them with a tutor who specializes in those areas.',
    },
    {
      title: 'Custom Study Plan',
      description:
        'Your tutor builds a personalized prep roadmap targeting the specific question types and content areas where your child can gain the most points.',
    },
    {
      title: 'Weekly Accountability Sessions',
      description:
        'Regular 1-on-1 sessions keep your child on track with targeted practice, real-time feedback, and adaptive homework between sessions.',
    },
  ],
  testimonials: [
    {
      name: 'Jennifer L.',
      role: 'Parent of SAT student',
      rating: 5,
      text: 'Our son went from a 1210 to a 1480 in just 3 months. The tutor identified gaps we never knew existed and built a plan around them.',
      result: '+270 points',
    },
    {
      name: 'Michael R.',
      role: 'Parent of SAT student',
      rating: 5,
      text: "The personalized approach made all the difference. Generic prep courses weren't working, but having a dedicated expert changed everything.",
      result: '+310 points',
    },
    {
      name: 'Sarah K.',
      role: 'Parent of SAT student',
      rating: 5,
      text: 'Worth every penny. My daughter got into her dream school with a scholarship that more than covered the tutoring cost.',
      result: '$60K scholarship',
    },
    {
      name: 'David W.',
      role: 'Parent of SAT student',
      rating: 5,
      text: 'The accountability was huge. Our son actually looked forward to his tutoring sessions and did his homework between them.',
      result: '+240 points',
    },
    {
      name: 'Lisa M.',
      role: 'Parent of SAT student',
      rating: 5,
      text: 'We tried Kaplan first and saw minimal improvement. Switching to a 1-on-1 expert tutor was a game-changer for our daughter.',
      result: '+290 points',
    },
    {
      name: 'Robert C.',
      role: 'Parent of SAT student',
      rating: 5,
      text: "The tutor matched perfectly with our son's learning style. He went from dreading the SAT to feeling confident walking into test day.",
      result: '+350 points',
    },
  ],
  faq: [
    {
      question: 'How do I know this will actually work for my child?',
      answer:
        'Our tutors have helped over 12,000 families achieve an average improvement of 200+ points. We start with a diagnostic assessment to identify your child\'s exact gaps, then build a targeted plan. If your child doesn\'t improve, you don\'t pay—that\'s our guarantee.',
    },
    {
      question: "We already tried other prep and it didn't work. Why is this different?",
      answer:
        'Most prep courses use a one-size-fits-all approach. Our tutors are top 1% SAT scorers (1500+) who build completely customized plans around your child\'s specific weaknesses. It\'s the difference between a generic lecture and a personal coach.',
    },
    {
      question: 'Is 1-on-1 tutoring really worth the investment?',
      answer:
        'Students who work with our tutors earn an average of $42,000 more in merit scholarships than those who self-study. The ROI on quality SAT prep typically pays for itself many times over in scholarship dollars.',
    },
    {
      question: "What if my child doesn't improve?",
      answer:
        'We offer a score improvement guarantee. If your child doesn\'t see meaningful improvement after following the study plan, we\'ll refund your investment. We\'re that confident in our tutors and methodology.',
    },
    {
      question: 'What is the time commitment?',
      answer:
        'Most students see significant improvement with 2 sessions per week over 8-12 weeks, plus targeted homework between sessions. Your tutor will work around your child\'s schedule—including evenings and weekends.',
    },
    {
      question: 'How quickly can we get started?',
      answer:
        'Most families are matched with their perfect tutor within 24-48 hours. Your first session can happen as soon as this week. We\'ll have a diagnostic assessment and study plan ready before the first session.',
    },
  ],
};

const actContent: SubjectContent = {
  slug: 'act',
  name: 'ACT Prep',
  headline: "Instant Access To The World's",
  headlineHighlight: 'Top ACT Experts',
  subhead:
    'Get a dedicated ACT specialist who diagnoses your child\'s exact gaps across all four sections, builds a custom study plan, and delivers results that self-study can\'t match.',
  benefits: [
    'Top 1% Vetted ACT-Scoring Tutors (34+ Verified)',
    "Customized For Your Child's Goals, Dream Schools & Schedule",
    'Guaranteed Perfect Match, No-Risk Trial',
  ],
  ctaText: 'Meet My Perfect Tutor',
  ctaSecondary: 'Book a Free Consultation',
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
  stats: [
    { value: '6+', label: 'Avg Point Improvement' },
    { value: '12,000+', label: 'Families Helped' },
    { value: '34+', label: 'Min Tutor ACT Score' },
    { value: '$4.2M+', label: 'In Merit Scholarships' },
  ],
  howItWorks: [
    {
      title: 'Diagnosis & Matching',
      description:
        'We analyze your child\'s practice test across all four ACT sections, then match them with a tutor who specializes in their weakest areas.',
    },
    {
      title: 'Custom Study Plan',
      description:
        'Your tutor builds a personalized prep roadmap targeting specific question types in English, Math, Reading, and Science where your child can gain the most points.',
    },
    {
      title: 'Weekly Accountability Sessions',
      description:
        'Regular 1-on-1 sessions with timed practice, section-specific strategies, and adaptive homework keep your child improving every week.',
    },
  ],
  testimonials: [
    {
      name: 'Patricia H.',
      role: 'Parent of ACT student',
      rating: 5,
      text: 'Our daughter went from a 25 to a 33 in just 10 weeks. The science section strategies alone were worth it.',
      result: '+8 points',
    },
    {
      name: 'James B.',
      role: 'Parent of ACT student',
      rating: 5,
      text: 'The tutor knew exactly how to approach each section differently. Our son\'s reading score jumped 7 points.',
      result: '+7 composite',
    },
    {
      name: 'Maria G.',
      role: 'Parent of ACT student',
      rating: 5,
      text: 'We tried a group class first with no results. The 1-on-1 attention made all the difference for our son.',
      result: '+9 points',
    },
    {
      name: 'Thomas W.',
      role: 'Parent of ACT student',
      rating: 5,
      text: 'The time management strategies were crucial. Our daughter went from not finishing sections to completing them with time to spare.',
      result: '+6 points',
    },
    {
      name: 'Karen D.',
      role: 'Parent of ACT student',
      rating: 5,
      text: 'Best investment we made for college prep. The scholarship our son received more than paid for the tutoring.',
      result: '$40K scholarship',
    },
    {
      name: 'Steven L.',
      role: 'Parent of ACT student',
      rating: 5,
      text: 'Our tutor was incredibly patient and knowledgeable. She turned our daughter\'s weakness in math into her strongest section.',
      result: '+10 math',
    },
  ],
  faq: [
    {
      question: 'How do I know this will actually work for my child?',
      answer:
        'Our tutors have helped over 12,000 families achieve an average improvement of 6+ composite points. We start with a full diagnostic across all four ACT sections to build a targeted plan. If your child doesn\'t improve, you don\'t pay.',
    },
    {
      question: "We already tried other prep and it didn't work. Why is this different?",
      answer:
        'Most ACT prep uses generic strategies. Our tutors scored 34+ themselves and build completely customized plans targeting your child\'s specific weak sections and question types. It\'s precision coaching, not one-size-fits-all.',
    },
    {
      question: 'Is 1-on-1 tutoring really worth the investment?',
      answer:
        'ACT score improvements directly translate to scholarship dollars. A 4-point composite increase can mean $10,000-$40,000 more in merit aid. Our students average 6+ points of improvement.',
    },
    {
      question: "What if my child doesn't improve?",
      answer:
        'We offer a score improvement guarantee. If your child follows the study plan and doesn\'t see meaningful improvement, we\'ll refund your investment completely.',
    },
    {
      question: 'What is the time commitment?',
      answer:
        'Most students see significant improvement with 2 sessions per week over 8-12 weeks. Your tutor will work around your child\'s schedule and adjust the plan as they improve.',
    },
    {
      question: 'How quickly can we get started?',
      answer:
        'Most families are matched within 24-48 hours. Your tutor will have a full diagnostic and study plan ready before the first session.',
    },
  ],
};

const chemContent: SubjectContent = {
  slug: 'chem',
  name: 'Chemistry Tutoring',
  headline: 'Master Chemistry With',
  headlineHighlight: 'Expert 1-on-1 Tutoring',
  subhead:
    'Get a dedicated chemistry tutor who breaks down complex concepts, builds real understanding, and helps your child excel in class and on the AP exam.',
  benefits: [
    'Expert Chemistry Tutors (Top University Graduates)',
    "Customized For Your Child's Course, Textbook & Pace",
    'Guaranteed Perfect Match, No-Risk Trial',
  ],
  ctaText: 'Find My Chemistry Tutor',
  ctaSecondary: 'Book a Free Consultation',
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
  stats: [
    { value: '2+', label: 'Avg Grade Improvement' },
    { value: '12,000+', label: 'Families Helped' },
    { value: '98%', label: 'Student Satisfaction' },
    { value: '4.5+', label: 'Avg AP Exam Score' },
  ],
  howItWorks: [
    {
      title: 'Diagnosis & Matching',
      description:
        'We assess your child\'s current understanding and match them with a chemistry tutor who specializes in their course level and learning style.',
    },
    {
      title: 'Custom Study Plan',
      description:
        'Your tutor aligns sessions with your child\'s class syllabus, targeting the exact concepts and problem types they need to master.',
    },
    {
      title: 'Weekly Accountability Sessions',
      description:
        'Regular 1-on-1 sessions build deep understanding through guided problem-solving, lab prep, and targeted practice for tests and the AP exam.',
    },
  ],
  testimonials: [
    {
      name: 'Amanda F.',
      role: 'Parent of chemistry student',
      rating: 5,
      text: 'Our son went from struggling with basic stoichiometry to acing his AP Chemistry exam. The tutor made complex concepts click.',
      result: 'C to A',
    },
    {
      name: 'Richard T.',
      role: 'Parent of chemistry student',
      rating: 5,
      text: 'The tutor connected chemistry to real-world applications that made our daughter actually enjoy the subject. Her confidence soared.',
      result: 'AP Score: 5',
    },
    {
      name: 'Nancy W.',
      role: 'Parent of chemistry student',
      rating: 5,
      text: 'After just 6 sessions, my son went from failing to passing with a B+. The 1-on-1 attention was exactly what he needed.',
      result: 'F to B+',
    },
    {
      name: 'Chris M.',
      role: 'Parent of chemistry student',
      rating: 5,
      text: 'Best decision we made. Our daughter was ready to give up on chemistry, and now she\'s considering it as a college major.',
      result: 'B- to A',
    },
    {
      name: 'Diana S.',
      role: 'Parent of chemistry student',
      rating: 5,
      text: 'The tutor broke down organic chemistry in a way that finally made sense. Our son\'s test scores jumped immediately.',
      result: '+25% on tests',
    },
    {
      name: 'Brian K.',
      role: 'Parent of chemistry student',
      rating: 5,
      text: 'We love that the tutor works with our son\'s actual coursework. It\'s not generic prep—it\'s targeted help for his specific class.',
      result: 'D to B+',
    },
  ],
  faq: [
    {
      question: 'How do I know this will actually work for my child?',
      answer:
        'Our chemistry tutors have helped thousands of students improve by an average of 2 letter grades. We match your child with an expert who specializes in their exact course level and textbook.',
    },
    {
      question: 'My child says they "just don\'t get chemistry." Can tutoring really help?',
      answer:
        'Absolutely. Chemistry is a subject where concepts build on each other. Our tutors identify exactly where your child\'s understanding broke down and rebuild from there with clear, relatable explanations.',
    },
    {
      question: 'Is 1-on-1 tutoring really worth the investment?',
      answer:
        'A strong chemistry grade can be the difference between getting into a competitive STEM program or not. Our students see results within the first few sessions, and the confidence carries over to other subjects.',
    },
    {
      question: "What if my child doesn't improve?",
      answer:
        'We offer a satisfaction guarantee. If you\'re not seeing improvement after following the study plan, we\'ll work with you to adjust the approach or refund your investment.',
    },
    {
      question: 'What is the time commitment?',
      answer:
        'Most students see significant improvement with 1-2 sessions per week. Sessions are scheduled around your child\'s calendar, including test prep cramming when needed.',
    },
    {
      question: 'Can the tutor help with AP Chemistry specifically?',
      answer:
        'Yes! Many of our tutors specialize in AP Chemistry preparation. They\'ll cover both the coursework and specific AP exam strategies to maximize your child\'s score.',
    },
  ],
};

const calcContent: SubjectContent = {
  slug: 'calc',
  name: 'Calculus Tutoring',
  headline: 'Conquer Calculus With',
  headlineHighlight: 'Expert 1-on-1 Tutoring',
  subhead:
    'Get a dedicated calculus tutor who builds intuition for derivatives and integrals, strengthens problem-solving skills, and helps your child excel in class and on the AP exam.',
  benefits: [
    'Expert Calculus Tutors (Top Math Graduates)',
    "Customized For Your Child's Course Level (AB or BC)",
    'Guaranteed Perfect Match, No-Risk Trial',
  ],
  ctaText: 'Find My Calculus Tutor',
  ctaSecondary: 'Book a Free Consultation',
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
  stats: [
    { value: '2+', label: 'Avg Grade Improvement' },
    { value: '12,000+', label: 'Families Helped' },
    { value: '98%', label: 'Student Satisfaction' },
    { value: '4.6', label: 'Avg AP Exam Score' },
  ],
  howItWorks: [
    {
      title: 'Diagnosis & Matching',
      description:
        'We assess your child\'s current math foundation and match them with a calculus tutor who specializes in their course level—whether AB or BC.',
    },
    {
      title: 'Custom Study Plan',
      description:
        'Your tutor builds a plan aligned with your child\'s class syllabus, targeting specific concepts from limits through integration where they need the most help.',
    },
    {
      title: 'Weekly Accountability Sessions',
      description:
        'Regular 1-on-1 sessions develop problem-solving intuition through guided practice, visual explanations, and targeted homework that builds confidence.',
    },
  ],
  testimonials: [
    {
      name: 'Elizabeth H.',
      role: 'Parent of calculus student',
      rating: 5,
      text: 'Our daughter was completely lost in AP Calc BC. Her tutor broke everything down so clearly that she went from a D to an A- in one semester.',
      result: 'D to A-',
    },
    {
      name: 'Mark P.',
      role: 'Parent of calculus student',
      rating: 5,
      text: 'The visual approach to teaching derivatives and integrals was exactly what our son needed. He finally understands the "why" behind the formulas.',
      result: 'AP Score: 5',
    },
    {
      name: 'Susan G.',
      role: 'Parent of calculus student',
      rating: 5,
      text: 'After struggling all semester, just 4 weeks of tutoring turned things around. Our son scored a 92 on his final exam.',
      result: 'C- to A',
    },
    {
      name: 'Kevin D.',
      role: 'Parent of calculus student',
      rating: 5,
      text: 'The tutor didn\'t just help with calculus—she strengthened our daughter\'s entire approach to math problem-solving.',
      result: '+30% on tests',
    },
    {
      name: 'Rachel N.',
      role: 'Parent of calculus student',
      rating: 5,
      text: 'We wish we\'d started sooner. In 8 weeks, our son went from dreading math to getting excited about engineering programs.',
      result: 'B- to A',
    },
    {
      name: 'John F.',
      role: 'Parent of calculus student',
      rating: 5,
      text: 'The 1-on-1 format meant the tutor could adapt in real-time when our daughter got confused. No classroom can do that.',
      result: 'AP Score: 5',
    },
  ],
  faq: [
    {
      question: 'How do I know this will actually work for my child?',
      answer:
        'Our calculus tutors have helped thousands of students improve by an average of 2+ letter grades. We assess your child\'s specific gaps in prerequisite knowledge and calculus concepts to build a targeted plan.',
    },
    {
      question: 'My child struggled with pre-calc. Can they still succeed in calculus?',
      answer:
        'Yes. Many calculus struggles stem from gaps in algebra and pre-calculus foundations. Our tutors identify and fill those gaps while teaching new calculus concepts, building a solid foundation.',
    },
    {
      question: 'Is 1-on-1 tutoring really worth the investment?',
      answer:
        'Calculus is a gatekeeper course for STEM majors and competitive colleges. A strong grade opens doors to engineering, computer science, and pre-med programs. Our students see results fast.',
    },
    {
      question: "What if my child doesn't improve?",
      answer:
        'We offer a satisfaction guarantee. If your child follows the study plan and doesn\'t see meaningful improvement, we\'ll adjust the approach or refund your investment.',
    },
    {
      question: 'What is the time commitment?',
      answer:
        'Most students see significant improvement with 1-2 sessions per week. Sessions can be intensified before exams and scaled back during lighter periods.',
    },
    {
      question: 'Can the tutor help with both AP Calculus AB and BC?',
      answer:
        'Absolutely. Our tutors specialize in both AB and BC curricula, including specific AP exam preparation strategies for free-response and multiple-choice sections.',
    },
  ],
};

const readingContent: SubjectContent = {
  slug: 'reading',
  name: 'Reading Tutoring',
  headline: 'Transform Reading Skills With',
  headlineHighlight: 'Expert 1-on-1 Tutoring',
  subhead:
    'Get a dedicated reading specialist who builds comprehension skills, develops critical analysis abilities, and helps your child become a confident, capable reader.',
  benefits: [
    'Expert Reading & Literacy Specialists',
    "Customized For Your Child's Grade Level & Goals",
    'Guaranteed Perfect Match, No-Risk Trial',
  ],
  ctaText: 'Find My Reading Tutor',
  ctaSecondary: 'Book a Free Consultation',
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
  stats: [
    { value: '2+', label: 'Avg Grade Level Gain' },
    { value: '12,000+', label: 'Families Helped' },
    { value: '98%', label: 'Student Satisfaction' },
    { value: '47+', label: 'Avg Percentile Improvement' },
  ],
  howItWorks: [
    {
      title: 'Diagnosis & Matching',
      description:
        'We assess your child\'s reading level, comprehension skills, and specific challenges, then match them with a specialist who fits their needs.',
    },
    {
      title: 'Custom Study Plan',
      description:
        'Your tutor creates a personalized reading program with age-appropriate texts, vocabulary building, and comprehension strategies tailored to your child.',
    },
    {
      title: 'Weekly Accountability Sessions',
      description:
        'Regular 1-on-1 sessions develop active reading habits, critical thinking skills, and the confidence to tackle challenging texts independently.',
    },
  ],
  testimonials: [
    {
      name: 'Catherine R.',
      role: 'Parent of reading student',
      rating: 5,
      text: 'My son went from reading below grade level to two years ahead. The tutor made reading fun and engaging in a way his classroom couldn\'t.',
      result: '+2 grade levels',
    },
    {
      name: 'Paul M.',
      role: 'Parent of reading student',
      rating: 5,
      text: 'The improvement in our daughter\'s reading comprehension was remarkable. Her scores on standardized tests jumped from the 42nd to the 89th percentile.',
      result: '+47 percentile',
    },
    {
      name: 'Angela B.',
      role: 'Parent of reading student',
      rating: 5,
      text: 'For the first time, our son actually enjoys reading. The tutor found books that matched his interests while building skills. Incredible transformation.',
      result: 'Now loves reading',
    },
    {
      name: 'Daniel S.',
      role: 'Parent of reading student',
      rating: 5,
      text: 'The critical analysis skills our daughter developed have carried over to every subject. Her essay writing improved dramatically too.',
      result: 'A+ in English',
    },
    {
      name: 'Maria L.',
      role: 'Parent of reading student',
      rating: 5,
      text: 'We noticed improvement after just 3 sessions. The tutor identified that our son was skipping key comprehension steps and fixed it right away.',
      result: '+3 grade levels',
    },
    {
      name: 'Eric W.',
      role: 'Parent of reading student',
      rating: 5,
      text: 'The vocabulary development alone was worth it. Our daughter\'s confidence in class discussions has skyrocketed since starting tutoring.',
      result: '+1200 vocabulary',
    },
  ],
  faq: [
    {
      question: 'How do I know this will actually work for my child?',
      answer:
        'Our reading specialists have helped thousands of students improve by an average of 2+ grade levels in reading ability. We use diagnostic assessments to identify exact gaps and build targeted interventions.',
    },
    {
      question: 'My child hates reading. Can a tutor really change that?',
      answer:
        'Absolutely. Our tutors are skilled at finding texts that match your child\'s interests while gradually building skills. When reading becomes easier and more engaging, attitudes transform naturally.',
    },
    {
      question: 'Is 1-on-1 tutoring really worth the investment?',
      answer:
        'Reading ability impacts every subject and standardized test. Students who read at or above grade level perform better across all academics. The skills gained last a lifetime.',
    },
    {
      question: "What if my child doesn't improve?",
      answer:
        'We offer a satisfaction guarantee. If your child follows the reading plan and doesn\'t show measurable improvement, we\'ll adjust the approach or refund your investment.',
    },
    {
      question: 'What is the time commitment?',
      answer:
        'Most students see significant improvement with 1-2 sessions per week, plus 15-20 minutes of guided reading practice daily. Sessions are engaging and go by quickly.',
    },
    {
      question: 'What age groups do you work with?',
      answer:
        'We have reading specialists for all ages—from early readers in K-2 to high school students preparing for AP Literature. The approach is customized for each developmental stage.',
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
