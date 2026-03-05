/**
 * Static metadata for aptitude test types used by UK law firms.
 * No content is AI-generated at runtime — all fields are manually written.
 */

export interface TestMeta {
  slug: 'watson-glaser' | 'sjt';
  name: string;
  shortName: string;
  vendor: string;
  strapline: string;
  description: string;
  /** Firms that commonly use this test — for context on the test page */
  usedBy: string[];
  subtypes: { name: string; description: string }[];
  tips: string[];
  timeNote: string;
  difficulty: 'Moderate' | 'Hard';
}

export const TESTS: TestMeta[] = [
  {
    slug: 'watson-glaser',
    name: 'Watson Glaser Critical Thinking Appraisal',
    shortName: 'Watson Glaser',
    vendor: 'Pearson TalentLens',
    strapline: 'The critical thinking test used by most Magic Circle and Silver Circle firms to screen applicants.',
    description:
      'The Watson Glaser is the most widely used aptitude test in UK law firm recruitment. It assesses your ability to think critically — distinguishing facts from inferences, recognising assumptions, and evaluating the strength of arguments. Most Magic Circle and Silver Circle firms use it as an early screening stage, often before inviting candidates to assessment days. Questions are drawn from legal, business and everyday contexts.',
    usedBy: [
      'Clifford Chance', 'Freshfields', 'Linklaters',
      'Ashurst', 'Hogan Lovells', 'Norton Rose Fulbright',
      'Latham & Watkins', 'White & Case', 'Sidley Austin',
      'Covington & Burling', 'Mishcon de Reya', 'Simmons & Simmons',
    ],
    subtypes: [
      {
        name: 'Inference',
        description:
          'You are given a statement of facts. For each inference, decide whether it is True, Probably True, Insufficient Data, Probably False, or False based solely on the information given.',
      },
      {
        name: 'Recognition of Assumptions',
        description:
          'Given a statement, decide whether an unstated assumption is actually made in that statement. Choose "Assumption Made" or "Assumption Not Made".',
      },
      {
        name: 'Deduction',
        description:
          'Given a set of premises, decide whether each conclusion necessarily follows. Choose "Conclusion Follows" or "Conclusion Does Not Follow" — treat the premises as true even if they seem unusual.',
      },
      {
        name: 'Interpretation',
        description:
          'Given a passage and a proposed conclusion, decide whether the conclusion follows beyond reasonable doubt from the passage alone.',
      },
      {
        name: 'Evaluation of Arguments',
        description:
          'Given a question, assess whether each argument is Strong (directly relevant and important) or Weak (not directly relevant, trivial, or based on a generalisation).',
      },
    ],
    tips: [
      'Base every answer strictly on the information given — do not use outside knowledge or common sense to fill gaps.',
      'In Inference questions, "Probably True" and "Probably False" are valid answers; resist the urge to always pick True or False.',
      'For Deduction, treat all premises as true even if they contradict reality — the test is about logical validity, not factual accuracy.',
      'Practice under timed conditions: the real test gives roughly 30 seconds per question.',
      'Read the question type carefully before answering — switching between subtypes mid-test is a common source of errors.',
    ],
    timeNote: '~30 minutes, 40 questions',
    difficulty: 'Moderate',
  },

  {
    slug: 'sjt',
    name: 'Situational Judgement Test',
    shortName: 'SJT',
    vendor: 'Various (Capp, Arctic Shores, cut-e)',
    strapline: 'Scenario-based judgement tests used by firms like A&O Shearman and HSF to screen for professional behaviour.',
    description:
      'The Situational Judgement Test (SJT) presents you with realistic workplace scenarios and asks you to identify the most (or least) effective response. Unlike the Watson Glaser, there are no strictly correct answers — the test is designed to assess professional values, ethical judgement and interpersonal effectiveness. Law firms use SJTs to screen for behaviours that align with their culture: client service, collaboration, integrity, and resilience. A&O Shearman uses a game-based variant via Arctic Shores; other firms use traditional written SJTs.',
    usedBy: [
      'A&O Shearman', 'Herbert Smith Freehills', 'Bird & Bird', 'Simmons & Simmons',
    ],
    subtypes: [
      {
        name: 'Most Effective Response',
        description:
          'Choose the single best response to a challenging workplace situation from four options. Focus on what a high-performing professional would do, not necessarily what feels most comfortable.',
      },
    ],
    tips: [
      'Think about what a senior, respected colleague would do — not what you personally would default to.',
      'Responses that ignore or escalate a problem are almost always wrong; look for options that address the issue constructively.',
      'Collaboration and client service are usually weighted highly — prioritise responses that protect relationships.',
      'Avoid extremes: neither the most passive nor the most aggressive response is usually correct.',
      'For game-based SJTs (e.g. Arctic Shores), there is no specific preparation — they measure underlying traits, not learned answers.',
    ],
    timeNote: '~25–35 minutes, 20–30 scenarios',
    difficulty: 'Moderate',
  },
];

const TEST_MAP = new Map(TESTS.map((t) => [t.slug, t]));

export function getTestBySlug(slug: string): TestMeta | undefined {
  return TEST_MAP.get(slug as TestMeta['slug']);
}
