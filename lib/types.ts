export type TopicCategory =
  | 'M&A'
  | 'Capital Markets'
  | 'Banking & Finance'
  | 'Energy & Tech'
  | 'Regulation'
  | 'Disputes'
  | 'International'
  | 'AI & Law';

export interface WhyItMatters {
  ukFirms: string;
  usFirms: string;
  onTheGround: string;
}

export interface Story {
  id: string;
  topic: TopicCategory;
  headline: string;
  summary: string;
  /** Structured object for new briefings; plain string for legacy saved briefings */
  whyItMatters: WhyItMatters | string;
  talkingPoint: string;
  sources?: string[];
  /** Law firms explicitly named in the story (e.g. ["Freshfields", "Linklaters"]) */
  firms?: string[];
}

export interface SectorWatchData {
  /** Short trend label, 3–6 words — rendered as serif headline */
  trend: string;
  /** 3–4 sentence analysis of the macro trend */
  body: string;
}

export interface OneToFollowData {
  /** One sentence naming the specific developing story */
  story: string;
  /** 2 sentences on implications for commercial lawyers */
  why: string;
}

export interface Briefing {
  date: string;        // YYYY-MM-DD
  generatedAt: string; // ISO 8601
  stories: Story[];
  /** Structured for new briefings; plain string for legacy saved briefings */
  sectorWatch: string | SectorWatchData;
  /** Structured for new briefings; plain string for legacy saved briefings */
  oneToFollow: string | OneToFollowData;
}

export interface QuizOption {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface QuizQuestion {
  /** e.g. "1-1", "1-2", "2-1" (storyId-questionIndex) */
  id: string;
  /** matches Story.id */
  storyId: string;
  question: string;
  options: QuizOption[];
  correctLetter: 'A' | 'B' | 'C' | 'D';
  /** Shown after answering — re-teaches the fact in context */
  explanation: string;
}

export interface DailyQuiz {
  date: string;        // YYYY-MM-DD
  generatedAt: string; // ISO 8601
  questions: QuizQuestion[];
}

export interface Comment {
  id: string;        // crypto.randomUUID()
  storyId: string;
  date: string;      // briefing date YYYY-MM-DD
  userId: string;    // Clerk userId
  userName: string;  // "First L." or email prefix
  text: string;      // 1–500 chars
  createdAt: string; // ISO 8601
}

// ─── Firm Profiles ────────────────────────────────────────────────────────────

export type FirmTier =
  | 'Magic Circle'
  | 'Silver Circle'
  | 'International'
  | 'US Firms'
  | 'Boutique';

export interface FirmDeadline {
  label: string;      // e.g. "Summer Vacation Scheme 2026"
  typically: string;  // e.g. "Opens October · Closes January"
  applyUrl: string;   // Official application page URL
}

export type DiversitySchemeType =
  | 'socioeconomic'   // low income, state school, first-gen
  | 'ethnicity'       // race/ethnicity specific
  | 'work-experience' // school-age work experience (year 10–12)
  | 'gender'          // women in law
  | 'disability';     // disability access

export interface DiversityScheme {
  name: string;
  type: DiversitySchemeType;
  /** 1–2 sentences on who qualifies */
  eligibility: string;
  /** e.g. "Applications open October · closes January" */
  typically: string;
  applyUrl: string;
}

export interface FirmAssessment {
  /** e.g. 'Vacation Scheme / Training Contract' or 'All programmes' */
  programme: string;
  /** Ordered list, e.g. ['Watson Glaser', 'Verbal Reasoning'] */
  tests: string[];
  /** Optional context, e.g. 'Game-based via Arctic Shores at application stage' */
  notes?: string;
}

export interface FirmProfile {
  slug: string;           // URL segment e.g. "clifford-chance"
  name: string;           // Full legal name
  shortName: string;      // e.g. "CC"
  aliases: string[];      // All names story.firms[] might contain for this firm
  tier: FirmTier;
  website: string;
  hq: string;
  offices: string[];
  practiceAreas: string[];
  knownFor: string;       // 1–2 sentences, manually written — no runtime AI
  culture: string;        // 2–3 sentences, manually written
  interviewFocus: string; // 2 sentences — what the firm probes at interview
  trainingContract: {
    seats: number;
    intakeSizeNote: string;  // e.g. "c.85 per year"
    tcSalaryNote: string;    // e.g. "~£52,000 – £58,000"
    nqSalaryNote: string;    // e.g. "~£170,000"
    deadlines: FirmDeadline[];
    applyUrl: string;
    lastVerified: string;    // YYYY-MM-DD — update each recruitment cycle
  };
  accentColor: string;   // Tailwind text class for tier badge
  /** Forage virtual experience URL — undefined if no programme exists */
  forageUrl?: string;
  /** Online assessments used at application stage — manually curated, verify each cycle */
  assessments?: FirmAssessment[];
}

// ─── Sector Primers ──────────────────────────────────────────────────────────

export interface PrimerSection {
  heading: string;
  /** Supports **bold** markers — render with renderBold() */
  body: string;
}

export interface PrimerKeyTerm {
  term: string;
  definition: string;
}

export interface PrimerInterviewQ {
  question: string;
  /** What the interviewer is assessing with this question */
  whatTheyWant: string;
  /** How to structure a strong answer — 3-4 sentences */
  skeleton: string;
}

export interface Primer {
  slug: string;
  title: string;
  category: TopicCategory;
  /** One-sentence teaser shown on the card */
  strapline: string;
  readTimeMinutes: number;
  sections: PrimerSection[];
  keyTerms: PrimerKeyTerm[];
  /** 2–3 sentences on why this matters for law students */
  whyItMatters: string;
  /** 3 interview questions with answer guidance */
  interviewQs?: PrimerInterviewQ[];
}

// ─── Topic Styles ─────────────────────────────────────────────────────────────

export const TOPIC_STYLES: Record<
  TopicCategory,
  { label: string; dot: string }
> = {
  'M&A': {
    label: 'text-blue-800 dark:text-blue-300',
    dot: 'bg-blue-700 dark:bg-blue-400',
  },
  'Capital Markets': {
    label: 'text-violet-800 dark:text-violet-300',
    dot: 'bg-violet-700 dark:bg-violet-400',
  },
  'Banking & Finance': {
    label: 'text-orange-800 dark:text-orange-300',
    dot: 'bg-orange-700 dark:bg-orange-400',
  },
  'Energy & Tech': {
    label: 'text-emerald-800 dark:text-emerald-300',
    dot: 'bg-emerald-700 dark:bg-emerald-400',
  },
  'Regulation': {
    label: 'text-amber-800 dark:text-amber-300',
    dot: 'bg-amber-700 dark:bg-amber-400',
  },
  'Disputes': {
    label: 'text-rose-800 dark:text-rose-300',
    dot: 'bg-rose-700 dark:bg-rose-400',
  },
  'International': {
    label: 'text-teal-800 dark:text-teal-300',
    dot: 'bg-teal-700 dark:bg-teal-400',
  },
  'AI & Law': {
    label: 'text-indigo-800 dark:text-indigo-300',
    dot: 'bg-indigo-700 dark:bg-indigo-400',
  },
};
