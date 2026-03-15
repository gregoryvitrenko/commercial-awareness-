/**
 * Area of Law quiz — free, public, viral acquisition tool.
 * 10 questions → recommended practice area + primer link.
 * Ranking mechanic: same as firm quiz (click in preference order).
 * No AI calls — fully static.
 */

import type { TopicCategory } from './types';

export type AreaKey = TopicCategory;

// ─── Area descriptions (shown in results) ─────────────────────────────────────

export interface AreaDescription {
  key: AreaKey;
  tagline: string;
  description: string;
  whatLawyersDo: string;
  skills: string[];
  color: string;       // matches TOPIC_STYLES colour token
  primerSlug: string;  // for linking to /primers/[slug]
}

export const AREA_DESCRIPTIONS: Record<AreaKey, AreaDescription> = {
  'M&A': {
    key: 'M&A',
    tagline: 'The art of the deal — structuring, negotiating, and closing corporate transactions.',
    description:
      'M&A lawyers advise on the buying, selling, and merging of companies. The work is fast-paced, commercially driven, and often cross-border. You will work alongside investment bankers and senior management to execute some of the most significant corporate transactions in the market.',
    whatLawyersDo:
      'Drafting and negotiating sale and purchase agreements, conducting due diligence, advising boards on their fiduciary duties, managing regulatory clearances, and coordinating across teams of specialists — all against tight deal timelines.',
    skills: ['Commercial negotiation', 'Deal structuring', 'Due diligence management', 'Stakeholder communication', 'Attention to detail under pressure'],
    color: 'blue',
    primerSlug: 'ma',
  },
  'Capital Markets': {
    key: 'Capital Markets',
    tagline: 'Where companies raise money — IPOs, bond issuances, and complex securities transactions.',
    description:
      'Capital markets lawyers advise companies, banks, and governments on how to raise capital from public and private markets. Whether it is an IPO on the London Stock Exchange or a multi-billion bond issuance, this practice sits at the intersection of corporate law, regulation, and finance.',
    whatLawyersDo:
      'Drafting prospectuses and offering documents, advising on listing requirements, structuring debt and equity issuances, navigating FCA and UKLA rules, and coordinating between issuers, underwriters, and advisers on compressed timelines.',
    skills: ['Understanding of securities law', 'Drafting precision', 'Regulatory knowledge', 'Commercial awareness', 'Ability to work under tight deadlines'],
    color: 'violet',
    primerSlug: 'capital-markets',
  },
  'Banking & Finance': {
    key: 'Banking & Finance',
    tagline: 'The legal architecture behind how money moves — lending, structured finance, and leveraged buyouts.',
    description:
      'Banking and finance lawyers structure the debt side of major transactions. From syndicated loans to leveraged finance packages underpinning private equity buyouts, this is technically demanding work that requires a deep understanding of financial instruments, security structures, and lender-borrower dynamics.',
    whatLawyersDo:
      'Drafting facility agreements and intercreditor arrangements, taking and perfecting security packages, advising on covenant structures, managing conditions precedent, and supporting clients through complex restructurings when deals go wrong.',
    skills: ['Technical legal drafting', 'Understanding of financial instruments', 'Structured thinking', 'Numerical comfort', 'Precision and process management'],
    color: 'orange',
    primerSlug: 'banking-finance',
  },
  'Energy & Tech': {
    key: 'Energy & Tech',
    tagline: 'Powering the future — from renewable energy projects to technology transactions and infrastructure.',
    description:
      'Energy and tech lawyers work on the deals and projects that are reshaping the global economy. Whether financing an offshore wind farm, advising on a data centre acquisition, or structuring a power purchase agreement, this practice combines technical complexity with genuine commercial impact.',
    whatLawyersDo:
      'Advising on project finance structures, drafting PPAs and EPC contracts, navigating planning and environmental consents, advising on technology M&A, and helping clients manage the legal dimensions of the energy transition.',
    skills: ['Project management', 'Multi-jurisdictional coordination', 'Technical curiosity', 'Commercial judgement', 'Ability to handle long-form transactions'],
    color: 'emerald',
    primerSlug: 'energy-tech',
  },
  'Regulation': {
    key: 'Regulation',
    tagline: 'The rules that govern business — advising clients on compliance, enforcement, and regulatory strategy.',
    description:
      'Regulatory lawyers advise on the laws and rules that shape how companies operate. From financial services regulation to data protection, competition law, and sector-specific licensing, this practice requires a sharp analytical mind and the ability to communicate complex rules clearly to business clients.',
    whatLawyersDo:
      'Advising on FCA, CMA, and ICO investigations, drafting compliance frameworks, advising on merger control filings, responding to regulatory consultations, and helping clients navigate the implications of new legislation.',
    skills: ['Analytical rigour', 'Policy understanding', 'Clear written communication', 'Attention to regulatory detail', 'Strategic thinking'],
    color: 'amber',
    primerSlug: 'regulation',
  },
  'Disputes': {
    key: 'Disputes',
    tagline: 'Winning for clients — litigation, arbitration, and advocacy at the highest level.',
    description:
      'Disputes lawyers represent clients in commercial litigation, international arbitration, and other contentious proceedings. This is adversarial, intellectually rigorous work that requires strong analytical skills, confidence under pressure, and the ability to construct compelling legal arguments.',
    whatLawyersDo:
      'Drafting statements of case and witness statements, conducting disclosure exercises, instructing and working with barristers, managing arbitration proceedings, advising on interim injunctions, and guiding clients through the full lifecycle of high-stakes disputes.',
    skills: ['Legal argument construction', 'Advocacy and persuasion', 'Strategic thinking', 'Factual analysis', 'Resilience and composure under pressure'],
    color: 'rose',
    primerSlug: 'disputes',
  },
  'International': {
    key: 'International',
    tagline: 'Law without borders — cross-border transactions, international arbitration, and global advisory work.',
    description:
      'International lawyers work across jurisdictions, legal systems, and cultures. Whether advising on a cross-border merger, representing a state in investment treaty arbitration, or helping a multinational navigate trade sanctions, this work requires cultural fluency and a genuinely global outlook.',
    whatLawyersDo:
      'Coordinating multi-jurisdictional deal teams, advising on private international law, managing treaty arbitration proceedings, advising on sanctions compliance, and helping clients structure their international business operations.',
    skills: ['Cross-cultural communication', 'Multi-jurisdictional legal awareness', 'Language skills (often)', 'Coordination across time zones', 'Adaptability'],
    color: 'teal',
    primerSlug: 'international',
  },
  'AI & Law': {
    key: 'AI & Law',
    tagline: 'The frontier of law — advising on AI regulation, tech M&A, data rights, and the future of legal practice.',
    description:
      'AI and law is one of the most rapidly evolving areas of legal practice. Lawyers in this space advise on how new technologies intersect with existing legal frameworks — from the EU AI Act to data protection, IP ownership of AI-generated content, and the regulatory governance of autonomous systems.',
    whatLawyersDo:
      'Advising on AI Act compliance, drafting AI procurement and licensing agreements, advising on data governance frameworks, supporting tech M&A due diligence on AI assets, and helping clients understand the legal implications of deploying AI at scale.',
    skills: ['Intellectual curiosity', 'Comfort with ambiguity', 'Technology literacy', 'Regulatory foresight', 'Ability to advise on rapidly changing law'],
    color: 'indigo',
    primerSlug: 'ai-law',
  },
};

// ─── Quiz questions ───────────────────────────────────────────────────────────

export interface AreaOption {
  label: string;
  scores: Record<AreaKey, number>;
}

export interface AreaQuestion {
  id: number;
  question: string;
  options: AreaOption[];
}

const Z: Record<AreaKey, number> = {
  'M&A': 0, 'Capital Markets': 0, 'Banking & Finance': 0, 'Energy & Tech': 0,
  'Regulation': 0, 'Disputes': 0, 'International': 0, 'AI & Law': 0,
};

export const AREA_QUESTIONS: AreaQuestion[] = [
  {
    id: 1,
    question: 'What kind of legal work appeals to you most?',
    options: [
      {
        label: 'Structuring and closing major corporate deals',
        scores: { ...Z, 'M&A': 3, 'Capital Markets': 2, 'Banking & Finance': 1 },
      },
      {
        label: 'Advising clients through complex regulatory landscapes',
        scores: { ...Z, 'Regulation': 3, 'AI & Law': 2, 'Banking & Finance': 1 },
      },
      {
        label: 'Advocating and winning for clients in disputes',
        scores: { ...Z, 'Disputes': 3, 'International': 2 },
      },
      {
        label: 'Financing transformative infrastructure and technology projects',
        scores: { ...Z, 'Energy & Tech': 3, 'Banking & Finance': 2, 'International': 1 },
      },
    ],
  },
  {
    id: 2,
    question: 'Which headline would you most want to be involved in?',
    options: [
      {
        label: 'A hostile takeover of a FTSE 100 company',
        scores: { ...Z, 'M&A': 3, 'Capital Markets': 1 },
      },
      {
        label: 'A landmark international arbitration setting legal precedent',
        scores: { ...Z, 'Disputes': 3, 'International': 3 },
      },
      {
        label: 'A major regulatory investigation into a global tech platform',
        scores: { ...Z, 'Regulation': 3, 'AI & Law': 2 },
      },
      {
        label: 'The financing of a landmark renewable energy project',
        scores: { ...Z, 'Energy & Tech': 3, 'Banking & Finance': 2 },
      },
    ],
  },
  {
    id: 3,
    question: 'What type of client would you most enjoy advising?',
    options: [
      {
        label: 'Private equity funds and corporate acquirers',
        scores: { ...Z, 'M&A': 3, 'Banking & Finance': 2 },
      },
      {
        label: 'Technology companies navigating AI and data law',
        scores: { ...Z, 'AI & Law': 3, 'Regulation': 2 },
      },
      {
        label: 'Parties in high-stakes commercial or international disputes',
        scores: { ...Z, 'Disputes': 3, 'International': 2 },
      },
      {
        label: 'Banks and financial institutions raising capital in markets',
        scores: { ...Z, 'Capital Markets': 3, 'Banking & Finance': 2 },
      },
    ],
  },
  {
    id: 4,
    question: 'Which part of a transaction or case sounds most engaging?',
    options: [
      {
        label: 'Negotiating deal terms with the other side\'s lawyers',
        scores: { ...Z, 'M&A': 3, 'Banking & Finance': 1, 'International': 1 },
      },
      {
        label: 'Constructing a watertight legal argument for a tribunal',
        scores: { ...Z, 'Disputes': 3, 'Regulation': 1 },
      },
      {
        label: 'Drafting complex financing documents from scratch',
        scores: { ...Z, 'Banking & Finance': 3, 'Capital Markets': 2 },
      },
      {
        label: 'Advising on multi-jurisdictional regulatory clearances',
        scores: { ...Z, 'Regulation': 2, 'International': 3, 'M&A': 1 },
      },
    ],
  },
  {
    id: 5,
    question: 'What pace and rhythm do you prefer?',
    options: [
      {
        label: 'Sprint to close — intense bursts around deal completion',
        scores: { ...Z, 'M&A': 3, 'Capital Markets': 3, 'Banking & Finance': 1 },
      },
      {
        label: 'Long-form — building a case or project over months or years',
        scores: { ...Z, 'Disputes': 3, 'Energy & Tech': 2, 'International': 1 },
      },
      {
        label: 'Steady advisory — ongoing relationships with clients navigating change',
        scores: { ...Z, 'Regulation': 3, 'AI & Law': 2 },
      },
      {
        label: 'Varied — I thrive on switching between different types of work',
        scores: { ...Z, 'International': 2, 'M&A': 1, 'Disputes': 1, 'AI & Law': 1 },
      },
    ],
  },
  {
    id: 6,
    question: 'What draws you to law?',
    options: [
      {
        label: 'The commercial excitement of major transactions',
        scores: { ...Z, 'M&A': 3, 'Banking & Finance': 2, 'Capital Markets': 2 },
      },
      {
        label: 'The intellectual rigour of legal argument and analysis',
        scores: { ...Z, 'Disputes': 3, 'Regulation': 2 },
      },
      {
        label: 'Working at the frontier of law and new technology',
        scores: { ...Z, 'AI & Law': 3, 'Regulation': 1 },
      },
      {
        label: 'The international dimension and cross-border scope',
        scores: { ...Z, 'International': 3, 'Energy & Tech': 1, 'M&A': 1 },
      },
    ],
  },
  {
    id: 7,
    question: 'Which task sounds most satisfying?',
    options: [
      {
        label: 'Closing a billion-pound M&A transaction after months of work',
        scores: { ...Z, 'M&A': 3, 'Banking & Finance': 1 },
      },
      {
        label: 'Winning a complex arbitration for your client',
        scores: { ...Z, 'Disputes': 3, 'International': 2 },
      },
      {
        label: 'Drafting a regulatory opinion that shapes how a business operates',
        scores: { ...Z, 'Regulation': 3, 'AI & Law': 2 },
      },
      {
        label: 'Financing a landmark infrastructure or energy project',
        scores: { ...Z, 'Energy & Tech': 3, 'Banking & Finance': 2, 'International': 1 },
      },
    ],
  },
  {
    id: 8,
    question: 'How do you feel about advocacy and argument?',
    options: [
      {
        label: 'It\'s why I chose law — I want to be in the room arguing',
        scores: { ...Z, 'Disputes': 3, 'International': 1 },
      },
      {
        label: 'I enjoy it, but I\'m equally drawn to transactional work',
        scores: { ...Z, 'M&A': 2, 'Disputes': 1, 'Capital Markets': 1 },
      },
      {
        label: 'I prefer advisory — I\'d rather help clients avoid disputes',
        scores: { ...Z, 'Regulation': 3, 'AI & Law': 2, 'Banking & Finance': 1 },
      },
      {
        label: 'I\'m interested but want to experience the full range first',
        scores: { ...Z, 'International': 2, 'Energy & Tech': 1, 'M&A': 1 },
      },
    ],
  },
  {
    id: 9,
    question: 'Which legal subject fascinates you most?',
    options: [
      {
        label: 'Company law, corporate governance, and M&A',
        scores: { ...Z, 'M&A': 3, 'Capital Markets': 1 },
      },
      {
        label: 'Banking law, financial instruments, and capital markets',
        scores: { ...Z, 'Banking & Finance': 3, 'Capital Markets': 3 },
      },
      {
        label: 'Contract, tort, and commercial dispute resolution',
        scores: { ...Z, 'Disputes': 3, 'International': 1 },
      },
      {
        label: 'Public law, regulation, technology, and the law\'s evolving frontier',
        scores: { ...Z, 'Regulation': 3, 'AI & Law': 3 },
      },
    ],
  },
  {
    id: 10,
    question: 'What would you like colleagues to say about you in five years?',
    options: [
      {
        label: '"The person who gets the deal done — commercially sharp, always."',
        scores: { ...Z, 'M&A': 3, 'Banking & Finance': 1, 'Capital Markets': 1 },
      },
      {
        label: '"Our best advocate — I\'d want them arguing for me any day."',
        scores: { ...Z, 'Disputes': 3, 'International': 1 },
      },
      {
        label: '"The one who really understands where regulation is heading."',
        scores: { ...Z, 'Regulation': 3, 'AI & Law': 3 },
      },
      {
        label: '"The international specialist everyone wants on cross-border work."',
        scores: { ...Z, 'International': 3, 'Energy & Tech': 1 },
      },
    ],
  },

  // ── Long-format additional questions (Q11–20) ────────────────────────────
  {
    id: 11,
    question: 'When you read the financial news, what catches your eye?',
    options: [
      {
        label: 'A blockbuster takeover bid or billion-pound merger',
        scores: { ...Z, 'M&A': 3, 'Capital Markets': 1 },
      },
      {
        label: 'A regulator fining a bank or technology company',
        scores: { ...Z, 'Regulation': 3, 'AI & Law': 1 },
      },
      {
        label: 'A court ruling that changes how a whole industry operates',
        scores: { ...Z, 'Disputes': 3, 'Regulation': 2 },
      },
      {
        label: 'A major infrastructure deal or new energy project financing',
        scores: { ...Z, 'Energy & Tech': 3, 'Banking & Finance': 2 },
      },
    ],
  },
  {
    id: 12,
    question: 'Which best describes how you prefer to solve problems?',
    options: [
      {
        label: 'Structuring — finding the architecture that makes a deal work',
        scores: { ...Z, 'M&A': 2, 'Banking & Finance': 3, 'Capital Markets': 2 },
      },
      {
        label: 'Analysing — finding the legal argument that wins',
        scores: { ...Z, 'Disputes': 3, 'Regulation': 2 },
      },
      {
        label: 'Navigating — steering clients through regulatory uncertainty',
        scores: { ...Z, 'Regulation': 3, 'AI & Law': 2, 'International': 1 },
      },
      {
        label: 'Innovating — applying law to genuinely new and untested situations',
        scores: { ...Z, 'AI & Law': 3, 'Energy & Tech': 2 },
      },
    ],
  },
  {
    id: 13,
    question: 'How do you feel about numbers and financial modelling?',
    options: [
      {
        label: 'I enjoy them — understanding the economics is central to the advice',
        scores: { ...Z, 'Banking & Finance': 3, 'Capital Markets': 3, 'M&A': 1 },
      },
      {
        label: 'Comfortable with them — I use them to understand deals and clients',
        scores: { ...Z, 'M&A': 2, 'Energy & Tech': 2, 'International': 1 },
      },
      {
        label: 'I prefer the legal analysis — happy to leave modelling to the bankers',
        scores: { ...Z, 'Disputes': 2, 'Regulation': 2, 'AI & Law': 1 },
      },
      {
        label: 'Mixed — depends on the context and what the problem actually is',
        scores: { ...Z, 'International': 2, 'M&A': 1, 'Regulation': 1 },
      },
    ],
  },
  {
    id: 14,
    question: 'Which working environment sounds most like you?',
    options: [
      {
        label: 'Deal rooms, late nights, and the adrenaline of closing',
        scores: { ...Z, 'M&A': 3, 'Capital Markets': 2, 'Banking & Finance': 1 },
      },
      {
        label: 'Court filings, skeleton arguments, and witness preparation',
        scores: { ...Z, 'Disputes': 3, 'International': 1 },
      },
      {
        label: 'Policy papers, regulatory submissions, and government engagement',
        scores: { ...Z, 'Regulation': 3, 'AI & Law': 2 },
      },
      {
        label: 'Multiple offices, different time zones, genuinely cross-border work',
        scores: { ...Z, 'International': 3, 'Energy & Tech': 2 },
      },
    ],
  },
  {
    id: 15,
    question: 'Which career trajectory appeals most?',
    options: [
      {
        label: 'Transactional powerhouse — the lawyer who closes the biggest deals',
        scores: { ...Z, 'M&A': 3, 'Banking & Finance': 2, 'Capital Markets': 2 },
      },
      {
        label: 'Elite litigator — sought after for the highest-stakes disputes',
        scores: { ...Z, 'Disputes': 3, 'International': 1 },
      },
      {
        label: 'Regulatory strategist — advising governments, regulators, and boardrooms',
        scores: { ...Z, 'Regulation': 3, 'AI & Law': 2 },
      },
      {
        label: 'Global practitioner — building an international practice across markets',
        scores: { ...Z, 'International': 3, 'Energy & Tech': 1 },
      },
    ],
  },
  {
    id: 16,
    question: 'Which of these skills do you most want to develop?',
    options: [
      {
        label: 'Commercial negotiation — getting the best deal terms for my client',
        scores: { ...Z, 'M&A': 3, 'Banking & Finance': 2 },
      },
      {
        label: 'Advocacy — making the most compelling oral or written argument',
        scores: { ...Z, 'Disputes': 3, 'International': 1 },
      },
      {
        label: 'Regulatory strategy — anticipating how rules will evolve and shift',
        scores: { ...Z, 'Regulation': 3, 'AI & Law': 2 },
      },
      {
        label: 'Technical drafting — financial documents, prospectuses, facility agreements',
        scores: { ...Z, 'Banking & Finance': 3, 'Capital Markets': 3 },
      },
    ],
  },
  {
    id: 17,
    question: 'What role do you see technology playing in your legal practice?',
    options: [
      {
        label: 'Central — I want to be at the frontier of AI and legal tech',
        scores: { ...Z, 'AI & Law': 3, 'Regulation': 1 },
      },
      {
        label: 'Important context — I need to understand it to advise clients well',
        scores: { ...Z, 'Regulation': 2, 'Energy & Tech': 2, 'M&A': 1 },
      },
      {
        label: 'Useful tool — but the core of my work stays fundamentally legal',
        scores: { ...Z, 'Disputes': 2, 'Banking & Finance': 1, 'International': 1 },
      },
      {
        label: 'Subject matter — I want to advise on tech deals and infrastructure',
        scores: { ...Z, 'Energy & Tech': 3, 'M&A': 2 },
      },
    ],
  },
  {
    id: 18,
    question: 'Which of these real-world scenarios excites you most?',
    options: [
      {
        label: 'Advising on the London IPO of a major company raising £2bn',
        scores: { ...Z, 'Capital Markets': 3, 'Banking & Finance': 1 },
      },
      {
        label: 'Acting for a state in an investor-state arbitration worth $500m',
        scores: { ...Z, 'International': 3, 'Disputes': 3 },
      },
      {
        label: 'Advising a tech giant on navigating the EU AI Act',
        scores: { ...Z, 'AI & Law': 3, 'Regulation': 2 },
      },
      {
        label: 'Financing a North Sea wind farm with a complex project structure',
        scores: { ...Z, 'Energy & Tech': 3, 'Banking & Finance': 2 },
      },
    ],
  },
  {
    id: 19,
    question: 'How important is it that your work has a tangible real-world impact?',
    options: [
      {
        label: 'Very — I want the deals I close to reshape industries',
        scores: { ...Z, 'M&A': 2, 'Energy & Tech': 3, 'Capital Markets': 1 },
      },
      {
        label: 'Yes — I want the legal principles I argue to matter beyond one case',
        scores: { ...Z, 'Disputes': 3, 'Regulation': 2 },
      },
      {
        label: 'Absolutely — shaping how AI and technology are regulated has never been more important',
        scores: { ...Z, 'AI & Law': 3, 'Regulation': 2 },
      },
      {
        label: 'Mostly — I want my work to enable clients to operate globally',
        scores: { ...Z, 'International': 3, 'Banking & Finance': 1 },
      },
    ],
  },
  {
    id: 20,
    question: 'Which of these best describes your personality in a team?',
    options: [
      {
        label: 'The deal-driver — I keep things moving and push for completion',
        scores: { ...Z, 'M&A': 3, 'Capital Markets': 2, 'Banking & Finance': 1 },
      },
      {
        label: 'The analyst — I find the argument nobody else spotted',
        scores: { ...Z, 'Disputes': 3, 'Regulation': 2 },
      },
      {
        label: 'The strategist — I think three steps ahead about risk and exposure',
        scores: { ...Z, 'Regulation': 3, 'AI & Law': 2, 'International': 1 },
      },
      {
        label: 'The connector — I build the bridges between jurisdictions and teams',
        scores: { ...Z, 'International': 3, 'Energy & Tech': 2 },
      },
    ],
  },
];

// Convenience exports for format filtering
export const SHORT_AREA_QUESTIONS = AREA_QUESTIONS.slice(0, 10);
export const LONG_AREA_QUESTIONS = AREA_QUESTIONS; // all 20

// ─── Scoring engine ───────────────────────────────────────────────────────────

const ALL_AREAS: AreaKey[] = [
  'M&A', 'Capital Markets', 'Banking & Finance', 'Energy & Tech',
  'Regulation', 'Disputes', 'International', 'AI & Law',
];

export interface AreaResult {
  topArea: AreaDescription;
  scores: Record<AreaKey, number>;
  /** Sorted descending — all areas */
  ranking: { area: AreaDescription; score: number }[];
}

/**
 * Calculate area result from ranked answers.
 * answers[i] = array of option indices in rank order (rank 1 first).
 * Higher-ranked options contribute more via linear decay multiplier.
 * Pass activeQuestions to support short/long format scoring correctly.
 */
export function calculateAreaResult(answers: number[][], activeQuestions: AreaQuestion[] = AREA_QUESTIONS): AreaResult {
  const scores: Record<AreaKey, number> = {
    'M&A': 0, 'Capital Markets': 0, 'Banking & Finance': 0, 'Energy & Tech': 0,
    'Regulation': 0, 'Disputes': 0, 'International': 0, 'AI & Law': 0,
  };

  for (let i = 0; i < activeQuestions.length; i++) {
    const ranked = answers[i] ?? [];
    const question = activeQuestions[i];
    const numOptions = question.options.length;

    ranked.forEach((optionIdx, rankIdx) => {
      const option = question.options[optionIdx];
      if (!option) return;
      const multiplier = (numOptions - rankIdx) / numOptions;
      for (const area of ALL_AREAS) {
        scores[area] += (option.scores[area] ?? 0) * multiplier;
      }
    });
  }

  const ranking = ALL_AREAS
    .map(area => ({ area: AREA_DESCRIPTIONS[area], score: Math.round(scores[area] * 10) / 10 }))
    .sort((a, b) => b.score - a.score);

  const topArea = ranking[0].area;

  return {
    topArea,
    scores: Object.fromEntries(
      Object.entries(scores).map(([k, v]) => [k, Math.round(v * 10) / 10])
    ) as Record<AreaKey, number>,
    ranking,
  };
}
