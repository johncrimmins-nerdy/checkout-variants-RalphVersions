/**
 * Retargeting messages - predefined personalized messages based on segment grade
 * Segment grade comes from URL parameter: ?sg={grade}
 */

export interface PersonalizedMessage {
  body: string;
  header: string;
}

/**
 * Predefined messages for each segment grade
 */
const WELCOME_MESSAGES = {
  COLLEGE_ADULT: {
    body: "Whether you're launching your career or taking it to the next level, flexible learning on your timeline delivers real results. Expert support is just one click away.",
    header: 'Invest in Your Future Today',
  },
  ELEMENTARY: {
    body: 'Build lasting confidence in math, reading, writing, and more, and see real improvements in grades. Expert support to help your child get ahead is just one click away.',
    header: 'Help Your Child Succeed This Year',
  },
  GENERIC: {
    body: "You've experienced how personalized tutoring can make all the difference. Continue your learning journey today.",
    header: 'Achieve More This Year',
  },
  HIGH_SCHOOL: {
    body: 'Build the impressive transcript that opens college doors. Get comprehensive help with classes, SAT/ACT prep, and college essays and applications.',
    header: 'College Prep Starts With Consistency',
  },
  MIDDLE_SCHOOL: {
    body: 'These are the years that shape habits, confidence, and readiness for high school. Help your middle schooler continue to advance and feel empowered academically.',
    header: 'Achieve More This Year',
  },
  TEST_PREP: {
    body: 'With proven strategies, live classes, and 1:1 tutoring personalized to your needs, each practice session brings higher scores within reach. Expert support is just one click away.',
    header: 'Supercharge Your Test Score',
  },
} as const satisfies Record<string, PersonalizedMessage>;

/**
 * Map segment grades (from URL ?sg= param) to their corresponding messages
 * - k5: Elementary (K-5)
 * - ms: Middle School
 * - hs: High School
 * - ca: College/Adult
 * - tp: Test Prep
 * - all: Generic fallback
 */
export const SEGMENT_MESSAGES: Record<string, PersonalizedMessage> = {
  all: WELCOME_MESSAGES.GENERIC,
  ca: WELCOME_MESSAGES.COLLEGE_ADULT,
  hs: WELCOME_MESSAGES.HIGH_SCHOOL,
  k5: WELCOME_MESSAGES.ELEMENTARY,
  ms: WELCOME_MESSAGES.MIDDLE_SCHOOL,
  tp: WELCOME_MESSAGES.TEST_PREP,
} as const;
