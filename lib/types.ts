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

export interface TalkingPoints {
  /** ~15 words. One sharp sentence for a cover letter or networking chat. */
  soundbite: string;
  /** ~50 words. A partner-level answer: bold observation + so-what + firm implication. */
  partnerAnswer: string;
  /** ~100 words. Full commercial explanation for an interview deep-dive. */
  fullCommercial: string;
}

export interface Story {
  id: string;
  topic: TopicCategory;
  headline: string;
  summary: string;
  /** Structured object for new briefings; plain string for legacy saved briefings */
  whyItMatters: WhyItMatters | string;
  /** Soundbite for new briefings; full talking point for legacy. Always populated. */
  talkingPoint: string;
  /** 3-tier talking points — present on briefings generated after 2026-03-05 */
  talkingPoints?: TalkingPoints;
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
  | 'National'
  | 'International'
  | 'US Firms'
  | 'Boutique';

export interface FirmDeadline {
  label: string;       // e.g. "Summer Vacation Scheme 2026"
  typically: string;   // e.g. "Opens October · Closes January" — always present, cycle-agnostic
  openDate?: string;   // "2025-10-01" — ISO date, present when exact date known
  closeDate?: string;  // "2026-01-15" — ISO date, present when exact date known
  rolling?: boolean;   // true if firm reviews on rolling basis (apply early)
  applyUrl: string;    // Official application page URL
}

// ── Application Tracker ──────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'not-started'
  | 'in-progress'
  | 'submitted'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface TrackedApplication {
  firmSlug: string;
  programme: string;         // deadline.label, e.g. "Summer Vacation Scheme 2026"
  status: ApplicationStatus;
  appliedAt?: string;        // ISO date — set when status becomes 'submitted'
  notes: string;             // user notes, max 500 chars
  updatedAt: string;         // ISO timestamp — last status/note change
}

// ── Application Tracker (freeform entries) ───────────────────────────────────

export type TrackerStatus =
  | 'Applied'
  | 'In Progress'
  | 'Submitted'
  | 'Interview'
  | 'Offer'
  | 'Rejected';

export interface TrackerEntry {
  id: string;       // crypto.randomUUID()
  firm: string;     // freeform firm name, max 100 chars
  status: TrackerStatus;
  deadline: string; // YYYY-MM-DD
  notes: string;    // user notes, max 500 chars
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ── Diversity Schemes ────────────────────────────────────────────────────────

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

// ─── Legal Events ─────────────────────────────────────────────────────────────

export type EventType = 'Networking' | 'Panel' | 'Workshop' | 'Social' | 'Career Fair';
export type EventCity = 'London' | 'Manchester' | 'Edinburgh' | 'Bristol' | 'Other';

export interface LegalEvent {
  id: string;
  title: string;
  date: string;         // YYYY-MM-DD — events without a confirmed date must be dropped
  time?: string;        // "18:30" | undefined
  city: EventCity;
  venue?: string;
  organiser: string;
  eventType: EventType;
  eligibility: string;
  description: string;
  whyAttend: string;
  sourceUrl: string;    // never undefined; fallback: "https://www.lawsociety.org.uk"
}

export interface EventsStore {
  events: LegalEvent[];
  generatedAt: string;  // ISO 8601
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
