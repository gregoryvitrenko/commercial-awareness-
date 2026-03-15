/**
 * Firm compatibility quiz — free, public, viral acquisition tool.
 * Short format: 10 questions (~2 min). Long format: 15 questions (~5 min).
 * Ranking mechanic: options ranked in preference order; higher ranks score more.
 * No AI calls — everything is static scoring.
 */

export type FirmTierKey =
  | 'magic-circle'
  | 'silver-circle'
  | 'us-firms'
  | 'international'
  | 'boutique';

export type PracticeTag =
  | 'ma'
  | 'finance'
  | 'disputes'
  | 'regulatory'
  | 'pe';

// ─── Tier descriptions (shown in results) ─────────────────────────────────────

export interface TierResult {
  key: FirmTierKey;
  name: string;
  tagline: string;
  description: string;
  color: string;       // Tailwind colour token
  strengths: string[];
  tradeoffs: string[];
}

export const TIER_RESULTS: Record<FirmTierKey, TierResult> = {
  'magic-circle': {
    key: 'magic-circle',
    name: 'Magic Circle',
    tagline: 'Global prestige, unmatched breadth, and the gold standard of UK legal training.',
    description:
      'The five Magic Circle firms consistently handle the largest and most complex cross-border transactions in the world. Training is broad, structured across four seats, and gives exposure to a wide range of practice areas. Trainee intakes are large (70-100+), the work is demanding, and the brand opens doors anywhere in law.',
    color: 'blue',
    strengths: [
      'Work on the most significant deals and disputes globally',
      'Structured training with genuine breadth across practice areas',
      'Brand recognition that carries weight throughout your career',
      'Extensive international secondment opportunities',
    ],
    tradeoffs: [
      'Very large trainee intakes — you may feel like a small cog',
      'Hours can be consistently demanding',
      'Pay is strong but below US firm levels',
    ],
  },
  'silver-circle': {
    key: 'silver-circle',
    name: 'Silver Circle',
    tagline: 'Top-tier work with a more personal culture and often earlier responsibility.',
    description:
      'Silver Circle firms handle work of comparable quality to the Magic Circle but with smaller trainee intakes, more personal cultures, and often a stronger identity in specific practice areas. If you value being known as an individual while working on excellent matters, this could be your best fit.',
    color: 'violet',
    strengths: [
      'High-quality work with a more personal, collegial environment',
      'Smaller intakes mean more visibility and earlier responsibility',
      'Often leaders in specific practice areas (disputes, private capital)',
      'Genuinely strong training with mentorship',
    ],
    tradeoffs: [
      'Slightly less global brand recognition than Magic Circle',
      'Fewer international offices and secondment options',
      'Some firms are more specialist — narrower breadth in certain areas',
    ],
  },
  'us-firms': {
    key: 'us-firms',
    name: 'US Firms',
    tagline: 'The highest compensation, elite deal flow, and the most intense working environment.',
    description:
      'US firms in London offer the highest trainee and NQ salaries in the market, alongside work on some of the world\'s most sophisticated M&A, leveraged finance, and restructuring deals. Trainee intakes are very small (often 10-25), the culture is intense, and early specialisation is common. If you are driven, commercially sharp, and thrive under pressure, this environment could suit you.',
    color: 'emerald',
    strengths: [
      'Highest compensation in the market by a significant margin',
      'Elite deal flow — private equity, leveraged finance, restructuring',
      'Very small intakes mean genuine responsibility from day one',
      'Exposure to US-style deal culture and cross-border work',
    ],
    tradeoffs: [
      'Consistently demanding hours — often the most intense of any tier',
      'Very small intakes can mean less peer support',
      'Earlier specialisation — less breadth than Magic Circle training',
      'Some firms have higher associate attrition',
    ],
  },
  international: {
    key: 'international',
    name: 'International Firms',
    tagline: 'Global reach, cross-border exposure, and a diverse working environment.',
    description:
      'International firms offer some of the broadest geographic networks in law. If working across borders, experiencing different legal systems, and collaborating with colleagues worldwide appeals to you, these firms provide genuine global exposure that many other tiers cannot match.',
    color: 'teal',
    strengths: [
      'Genuinely global networks with offices across continents',
      'Cross-border work is the default, not the exception',
      'Diverse and internationally-minded culture',
      'Strong international secondment programmes',
    ],
    tradeoffs: [
      'London office may not always handle the most complex work',
      'Brand strength varies significantly by jurisdiction',
      'Less dominance in pure M&A or PE compared to MC or US',
    ],
  },
  boutique: {
    key: 'boutique',
    name: 'Boutique & Specialist',
    tagline: 'Deep expertise, entrepreneurial culture, and early client-facing exposure.',
    description:
      'Boutique and specialist firms are often the best in their field — disputes, IP, private client, or technology. They offer small, personal environments where trainees get genuine responsibility and client contact early. If you value expertise over breadth and want an entrepreneurial, less corporate culture, this tier could be perfect.',
    color: 'rose',
    strengths: [
      'Often the acknowledged leaders in their specialist area',
      'Genuine client contact and responsibility from the start',
      'Entrepreneurial, less hierarchical culture',
      'You will be known as an individual, not a number',
    ],
    tradeoffs: [
      'Narrower training — less exposure to other practice areas',
      'Smaller brand recognition outside their specialist niche',
      'Fewer international opportunities',
      'Pay is typically below Magic Circle and US levels',
    ],
  },
};

// ─── Firm recommendations per tier (slug + reason) ────────────────────────────

export interface FirmRecommendation {
  slug: string;
  name: string;
  reason: string;
  /** Practice area tags that boost this firm's recommendation */
  tags: PracticeTag[];
}

export const FIRM_RECS: Record<FirmTierKey, FirmRecommendation[]> = {
  'magic-circle': [
    { slug: 'clifford-chance', name: 'Clifford Chance', reason: 'The most international of the Magic Circle, with a strong innovation and diversity agenda.', tags: ['finance', 'ma'] },
    { slug: 'freshfields', name: 'Freshfields', reason: 'Known for intellectual rigour and one of the strongest disputes practices in the world.', tags: ['disputes', 'ma', 'regulatory'] },
    { slug: 'linklaters', name: 'Linklaters', reason: 'A leader in banking, finance, and capital markets — handles the most complex financial structures.', tags: ['finance', 'ma'] },
    { slug: 'allen-overy-shearman', name: 'A&O Shearman', reason: 'The recent merger created the largest global law firm — unmatched cross-border reach.', tags: ['finance', 'ma', 'regulatory'] },
    { slug: 'slaughter-and-may', name: 'Slaughter and May', reason: 'Famously independent, academic culture, and a unique "best friend" referral model.', tags: ['ma', 'disputes', 'regulatory'] },
  ],
  'silver-circle': [
    { slug: 'herbert-smith-freehills', name: 'Herbert Smith Freehills', reason: 'One of the world\'s leading disputes and arbitration practices, with strong Asia-Pacific presence.', tags: ['disputes', 'ma'] },
    { slug: 'ashurst', name: 'Ashurst', reason: 'Particularly strong in energy, resources, and infrastructure — with Australian heritage and global reach.', tags: ['finance', 'regulatory'] },
    { slug: 'travers-smith', name: 'Travers Smith', reason: 'A private equity and funds powerhouse with a famously collegiate and personal culture.', tags: ['pe', 'ma'] },
    { slug: 'macfarlanes', name: 'Macfarlanes', reason: 'Known for private capital work and genuinely personal training — smaller intake, high responsibility.', tags: ['pe', 'ma'] },
  ],
  'us-firms': [
    { slug: 'kirkland-ellis', name: 'Kirkland & Ellis', reason: 'Dominant in private equity — handles more PE deals globally than any other firm.', tags: ['pe', 'ma', 'finance'] },
    { slug: 'weil-gotshal-manges', name: 'Weil Gotshal & Manges', reason: 'Leading restructuring and PE practice — the firm to call when deals go complex.', tags: ['pe', 'finance'] },
    { slug: 'davis-polk', name: 'Davis Polk', reason: 'A Wall Street institution with one of the strongest capital markets practices globally.', tags: ['finance', 'ma'] },
    { slug: 'skadden', name: 'Skadden', reason: 'The original M&A firm — a global leader in hostile and complex public company transactions.', tags: ['ma'] },
    { slug: 'sullivan-cromwell', name: 'Sullivan & Cromwell', reason: 'Historic adviser to the world\'s largest financial institutions — M&A and financial regulatory strength.', tags: ['ma', 'finance', 'regulatory'] },
    { slug: 'latham-watkins', name: 'Latham & Watkins', reason: 'One of the world\'s largest and most profitable firms — strong across every major practice area.', tags: ['ma', 'finance', 'pe'] },
    { slug: 'gibson-dunn', name: 'Gibson Dunn', reason: 'Known for litigation, white-collar investigations, and appellate work — a disputes powerhouse.', tags: ['disputes', 'regulatory'] },
    { slug: 'quinn-emanuel', name: 'Quinn Emanuel', reason: 'Pure disputes — one of the most aggressive and successful litigation-only firms in the world.', tags: ['disputes'] },
  ],
  international: [
    { slug: 'hogan-lovells', name: 'Hogan Lovells', reason: 'Genuine US-UK dual platform with one of the broadest global networks in the market.', tags: ['regulatory', 'finance'] },
    { slug: 'norton-rose-fulbright', name: 'Norton Rose Fulbright', reason: 'One of the largest firms globally with particularly strong energy, infrastructure, and financial institutions practices.', tags: ['finance', 'regulatory'] },
    { slug: 'white-case', name: 'White & Case', reason: 'Global leader in international arbitration and emerging markets work — truly cross-border DNA.', tags: ['disputes', 'finance'] },
    { slug: 'simmons-simmons', name: 'Simmons & Simmons', reason: 'Known for TMT, life sciences, and financial services — with a strong European and Asian network.', tags: ['regulatory'] },
    { slug: 'bird-bird', name: 'Bird & Bird', reason: 'A technology specialist with a particularly strong IP and digital economy practice across Europe.', tags: ['regulatory'] },
  ],
  boutique: [
    { slug: 'mishcon-de-reya', name: 'Mishcon de Reya', reason: 'An innovative disputes and private client firm with an entrepreneurial, forward-thinking culture.', tags: ['disputes'] },
    { slug: 'stewarts', name: 'Stewarts', reason: 'One of the UK\'s leading commercial litigation firms — specialist focus, genuinely hands-on training.', tags: ['disputes'] },
    { slug: 'bristows', name: 'Bristows', reason: 'The UK\'s leading IP and technology firm — if you want deep expertise in a specialist area, hard to beat.', tags: ['regulatory'] },
  ],
};

// ─── Quiz questions ───────────────────────────────────────────────────────────

export interface QuizOption {
  label: string;
  scores: Record<FirmTierKey, number>;
  /** Optional practice area tag — used from rank-1 answer for firm recommendation */
  practiceTag?: PracticeTag;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ── Short format (Q1–10) ──────────────────────────────────────────────────
  {
    id: 1,
    question: 'What matters most to you when choosing a firm?',
    options: [
      { label: 'The complexity and scale of the work', scores: { 'magic-circle': 3, 'silver-circle': 1, 'us-firms': 2, international: 1, boutique: 0 } },
      { label: 'The culture and the people I\'d be working with', scores: { 'magic-circle': 0, 'silver-circle': 3, 'us-firms': 0, international: 1, boutique: 3 } },
      { label: 'International exposure and working across borders', scores: { 'magic-circle': 1, 'silver-circle': 0, 'us-firms': 0, international: 3, boutique: 0 } },
      { label: 'Compensation and career progression speed', scores: { 'magic-circle': 1, 'silver-circle': 0, 'us-firms': 3, international: 0, boutique: 0 } },
    ],
  },
  {
    id: 2,
    question: 'What size trainee intake appeals to you?',
    options: [
      { label: 'Large (80-100+) — a big peer group and social life', scores: { 'magic-circle': 3, 'silver-circle': 0, 'us-firms': 0, international: 1, boutique: 0 } },
      { label: 'Medium (30-60) — enough peers without being anonymous', scores: { 'magic-circle': 0, 'silver-circle': 3, 'us-firms': 0, international: 2, boutique: 0 } },
      { label: 'Small (10-25) — known by name, early responsibility', scores: { 'magic-circle': 0, 'silver-circle': 1, 'us-firms': 3, international: 0, boutique: 2 } },
      { label: 'Very small (under 10) — personal, specialist environment', scores: { 'magic-circle': 0, 'silver-circle': 0, 'us-firms': 0, international: 0, boutique: 3 } },
    ],
  },
  {
    id: 3,
    question: 'Which area of law interests you most?',
    options: [
      { label: 'M&A and private equity — deals, acquisitions, company sales', scores: { 'magic-circle': 2, 'silver-circle': 1, 'us-firms': 3, international: 0, boutique: 0 }, practiceTag: 'ma' },
      { label: 'Banking, finance, and capital markets', scores: { 'magic-circle': 3, 'silver-circle': 0, 'us-firms': 2, international: 2, boutique: 0 }, practiceTag: 'finance' },
      { label: 'Disputes, litigation, and arbitration', scores: { 'magic-circle': 1, 'silver-circle': 2, 'us-firms': 1, international: 1, boutique: 3 }, practiceTag: 'disputes' },
      { label: 'Regulatory, IP, or specialist areas', scores: { 'magic-circle': 0, 'silver-circle': 1, 'us-firms': 0, international: 1, boutique: 3 }, practiceTag: 'regulatory' },
    ],
  },
  {
    id: 4,
    question: 'What kind of working environment do you thrive in?',
    options: [
      { label: 'High-intensity, high-reward — I perform best under pressure', scores: { 'magic-circle': 1, 'silver-circle': 0, 'us-firms': 3, international: 0, boutique: 0 } },
      { label: 'Demanding but supportive — strong structure and feedback', scores: { 'magic-circle': 3, 'silver-circle': 2, 'us-firms': 0, international: 1, boutique: 0 } },
      { label: 'Collegial and personal — I want to know everyone by name', scores: { 'magic-circle': 0, 'silver-circle': 2, 'us-firms': 0, international: 0, boutique: 3 } },
      { label: 'Diverse and international — different cultures, multiple offices', scores: { 'magic-circle': 1, 'silver-circle': 0, 'us-firms': 0, international: 3, boutique: 0 } },
    ],
  },
  {
    id: 5,
    question: 'How important is an international secondment to you?',
    options: [
      { label: 'Essential — I want to work in multiple countries during training', scores: { 'magic-circle': 2, 'silver-circle': 0, 'us-firms': 0, international: 3, boutique: 0 } },
      { label: 'A strong plus — I\'d like the option but it\'s not critical', scores: { 'magic-circle': 2, 'silver-circle': 2, 'us-firms': 1, international: 1, boutique: 0 } },
      { label: 'Not important — I\'d rather focus on building expertise in one location', scores: { 'magic-circle': 0, 'silver-circle': 1, 'us-firms': 2, international: 0, boutique: 3 } },
    ],
  },
  {
    id: 6,
    question: 'What type of clients excite you most?',
    options: [
      { label: 'Global banks, sovereign wealth funds, and financial institutions', scores: { 'magic-circle': 3, 'silver-circle': 0, 'us-firms': 2, international: 1, boutique: 0 }, practiceTag: 'finance' },
      { label: 'Private equity sponsors and investment funds', scores: { 'magic-circle': 1, 'silver-circle': 2, 'us-firms': 3, international: 0, boutique: 0 }, practiceTag: 'pe' },
      { label: 'FTSE 100 and Fortune 500 corporates', scores: { 'magic-circle': 2, 'silver-circle': 1, 'us-firms': 1, international: 2, boutique: 0 }, practiceTag: 'ma' },
      { label: 'Entrepreneurs, founders, and growth companies', scores: { 'magic-circle': 0, 'silver-circle': 1, 'us-firms': 0, international: 0, boutique: 3 } },
    ],
  },
  {
    id: 7,
    question: 'How do you feel about working late nights and weekends when a deal demands it?',
    options: [
      { label: 'That\'s the job — I\'m ready for it if the work is genuinely exceptional', scores: { 'magic-circle': 2, 'silver-circle': 0, 'us-firms': 3, international: 0, boutique: 0 } },
      { label: 'I expect it at peak times, but I value firms that respect balance otherwise', scores: { 'magic-circle': 1, 'silver-circle': 3, 'us-firms': 0, international: 2, boutique: 1 } },
      { label: 'I want genuinely reasonable hours as the norm, not the exception', scores: { 'magic-circle': 0, 'silver-circle': 1, 'us-firms': 0, international: 1, boutique: 3 } },
    ],
  },
  {
    id: 8,
    question: 'What kind of training structure appeals to you most?',
    options: [
      { label: 'Four seats across different departments — maximum breadth and optionality', scores: { 'magic-circle': 3, 'silver-circle': 2, 'us-firms': 0, international: 1, boutique: 0 } },
      { label: 'Flexibility to tailor my seats towards areas I find most interesting', scores: { 'magic-circle': 0, 'silver-circle': 3, 'us-firms': 1, international: 1, boutique: 1 } },
      { label: 'Early specialisation — I want to go deep in one area from the start', scores: { 'magic-circle': 0, 'silver-circle': 0, 'us-firms': 3, international: 0, boutique: 2 } },
      { label: 'International seats built into the programme as standard', scores: { 'magic-circle': 1, 'silver-circle': 0, 'us-firms': 0, international: 3, boutique: 0 } },
    ],
  },
  {
    id: 9,
    question: 'Which of these would you be most excited to work on?',
    options: [
      { label: 'A multi-billion cross-border merger between two global companies', scores: { 'magic-circle': 3, 'silver-circle': 1, 'us-firms': 2, international: 1, boutique: 0 }, practiceTag: 'ma' },
      { label: 'A leveraged buyout for a major private equity sponsor', scores: { 'magic-circle': 1, 'silver-circle': 1, 'us-firms': 3, international: 0, boutique: 0 }, practiceTag: 'pe' },
      { label: 'A high-profile dispute or international arbitration', scores: { 'magic-circle': 1, 'silver-circle': 2, 'us-firms': 1, international: 1, boutique: 3 }, practiceTag: 'disputes' },
      { label: 'An innovative financing for a renewable energy project in an emerging market', scores: { 'magic-circle': 0, 'silver-circle': 0, 'us-firms': 0, international: 3, boutique: 1 }, practiceTag: 'finance' },
    ],
  },
  {
    id: 10,
    question: 'Which of these best describes you?',
    options: [
      { label: 'Analytical, driven, and competitive — I thrive on excellence', scores: { 'magic-circle': 2, 'silver-circle': 0, 'us-firms': 3, international: 0, boutique: 0 } },
      { label: 'Collaborative, sociable, and team-oriented — relationships matter to me', scores: { 'magic-circle': 1, 'silver-circle': 3, 'us-firms': 0, international: 1, boutique: 1 } },
      { label: 'Independent, curious, and entrepreneurial — I like doing things differently', scores: { 'magic-circle': 0, 'silver-circle': 1, 'us-firms': 0, international: 0, boutique: 3 } },
      { label: 'Adaptable, globally-minded, and culturally aware — I want variety', scores: { 'magic-circle': 0, 'silver-circle': 0, 'us-firms': 0, international: 3, boutique: 0 } },
    ],
  },

  // ── Long-format additional questions (Q11–20) ────────────────────────────
  {
    id: 11,
    question: 'Which legal skill do you most want to develop?',
    options: [
      { label: 'Negotiation — finding the deal that works for everyone', scores: { 'magic-circle': 2, 'silver-circle': 2, 'us-firms': 2, international: 1, boutique: 0 }, practiceTag: 'ma' },
      { label: 'Advocacy and argument — persuading courts or tribunals', scores: { 'magic-circle': 1, 'silver-circle': 2, 'us-firms': 1, international: 1, boutique: 3 }, practiceTag: 'disputes' },
      { label: 'Technical legal analysis — getting the details exactly right', scores: { 'magic-circle': 3, 'silver-circle': 1, 'us-firms': 2, international: 1, boutique: 1 } },
      { label: 'Regulatory navigation — interpreting rules and managing compliance risk', scores: { 'magic-circle': 1, 'silver-circle': 1, 'us-firms': 0, international: 2, boutique: 3 }, practiceTag: 'regulatory' },
    ],
  },
  {
    id: 12,
    question: 'What would make you most proud at your year-end review?',
    options: [
      { label: 'I closed a landmark deal that made the financial press', scores: { 'magic-circle': 2, 'silver-circle': 1, 'us-firms': 3, international: 1, boutique: 0 }, practiceTag: 'ma' },
      { label: 'I won a case that set a meaningful legal precedent', scores: { 'magic-circle': 1, 'silver-circle': 2, 'us-firms': 1, international: 1, boutique: 3 }, practiceTag: 'disputes' },
      { label: 'I built real relationships with clients who trust me', scores: { 'magic-circle': 0, 'silver-circle': 3, 'us-firms': 0, international: 1, boutique: 2 } },
      { label: 'I advised across three continents on complex cross-border work', scores: { 'magic-circle': 1, 'silver-circle': 0, 'us-firms': 0, international: 3, boutique: 0 } },
    ],
  },
  {
    id: 13,
    question: 'Which story would you most want to be involved in?',
    options: [
      { label: 'A hostile takeover of a FTSE 100 company — defending the board', scores: { 'magic-circle': 3, 'silver-circle': 1, 'us-firms': 2, international: 0, boutique: 0 }, practiceTag: 'ma' },
      { label: 'A billion-dollar private equity mega-buyout with complex financing', scores: { 'magic-circle': 1, 'silver-circle': 1, 'us-firms': 3, international: 0, boutique: 0 }, practiceTag: 'pe' },
      { label: 'A landmark international arbitration between two sovereign states', scores: { 'magic-circle': 1, 'silver-circle': 2, 'us-firms': 1, international: 3, boutique: 2 }, practiceTag: 'disputes' },
      { label: 'A major regulatory investigation into a global tech platform', scores: { 'magic-circle': 2, 'silver-circle': 1, 'us-firms': 1, international: 1, boutique: 2 }, practiceTag: 'regulatory' },
    ],
  },
  {
    id: 14,
    question: 'How do you feel about specialising early in your career?',
    options: [
      { label: 'I\'m ready to go deep — I already know what I want to do', scores: { 'magic-circle': 0, 'silver-circle': 0, 'us-firms': 3, international: 0, boutique: 2 } },
      { label: 'I\'d like breadth first — then specialise once I\'ve explored', scores: { 'magic-circle': 3, 'silver-circle': 2, 'us-firms': 0, international: 1, boutique: 0 } },
      { label: 'I want to be the best generalist in the room — breadth is my edge', scores: { 'magic-circle': 2, 'silver-circle': 2, 'us-firms': 0, international: 2, boutique: 0 } },
      { label: 'Specialist over time, but in a niche I\'m genuinely passionate about', scores: { 'magic-circle': 0, 'silver-circle': 1, 'us-firms': 1, international: 0, boutique: 3 } },
    ],
  },
  {
    id: 15,
    question: 'Honestly, what draws you most to a training contract?',
    options: [
      { label: 'The prestige — I want the brand and the network it brings', scores: { 'magic-circle': 3, 'silver-circle': 1, 'us-firms': 2, international: 0, boutique: 0 } },
      { label: 'The compensation — I want to be rewarded for my work', scores: { 'magic-circle': 1, 'silver-circle': 0, 'us-firms': 3, international: 0, boutique: 0 } },
      { label: 'The quality of work — I want the best matters, full stop', scores: { 'magic-circle': 2, 'silver-circle': 2, 'us-firms': 2, international: 1, boutique: 1 } },
      { label: 'The culture — I want somewhere I actually enjoy being', scores: { 'magic-circle': 0, 'silver-circle': 3, 'us-firms': 0, international: 1, boutique: 3 } },
    ],
  },
  {
    id: 16,
    question: 'How do you prefer to learn on the job?',
    options: [
      { label: 'Thrown in at the deep end — sink or swim builds you fastest', scores: { 'magic-circle': 1, 'silver-circle': 0, 'us-firms': 3, international: 0, boutique: 1 } },
      { label: 'Structured supervision — regular feedback and clear expectations', scores: { 'magic-circle': 3, 'silver-circle': 3, 'us-firms': 0, international: 1, boutique: 0 } },
      { label: 'Shadowing senior lawyers closely on live deals or cases', scores: { 'magic-circle': 1, 'silver-circle': 2, 'us-firms': 2, international: 1, boutique: 2 } },
      { label: 'Running my own files with a partner available when needed', scores: { 'magic-circle': 0, 'silver-circle': 1, 'us-firms': 1, international: 0, boutique: 3 } },
    ],
  },
  {
    id: 17,
    question: 'If you could choose a secondment during your training contract, which would you pick?',
    options: [
      { label: 'A major client in-house team (bank, PE fund, or FTSE 100)', scores: { 'magic-circle': 2, 'silver-circle': 2, 'us-firms': 2, international: 0, boutique: 0 } },
      { label: 'A foreign office — New York, Hong Kong, Singapore, or Dubai', scores: { 'magic-circle': 2, 'silver-circle': 0, 'us-firms': 1, international: 3, boutique: 0 } },
      { label: 'A regulatory body or government department', scores: { 'magic-circle': 1, 'silver-circle': 2, 'us-firms': 0, international: 1, boutique: 2 } },
      { label: 'No secondment — I want maximum seat variety at the firm itself', scores: { 'magic-circle': 1, 'silver-circle': 1, 'us-firms': 2, international: 0, boutique: 2 } },
    ],
  },
  {
    id: 18,
    question: 'Which of these would you most emphasise in a training contract application?',
    options: [
      { label: 'Academic excellence and analytical ability', scores: { 'magic-circle': 3, 'silver-circle': 1, 'us-firms': 2, international: 1, boutique: 0 } },
      { label: 'Commercial awareness and business instinct', scores: { 'magic-circle': 2, 'silver-circle': 2, 'us-firms': 3, international: 1, boutique: 0 } },
      { label: 'International background, languages, or cross-cultural experience', scores: { 'magic-circle': 1, 'silver-circle': 0, 'us-firms': 0, international: 3, boutique: 1 } },
      { label: 'Specific sector passion — I know exactly what I want to do', scores: { 'magic-circle': 0, 'silver-circle': 1, 'us-firms': 1, international: 0, boutique: 3 } },
    ],
  },
  {
    id: 19,
    question: 'What kind of firm reputation matters most to you?',
    options: [
      { label: 'The global brand — instantly recognised anywhere in the world', scores: { 'magic-circle': 3, 'silver-circle': 0, 'us-firms': 2, international: 2, boutique: 0 } },
      { label: 'Market-leading in a specific practice area I care about', scores: { 'magic-circle': 1, 'silver-circle': 2, 'us-firms': 3, international: 0, boutique: 2 } },
      { label: 'A genuine culture of respect — known for treating people well', scores: { 'magic-circle': 0, 'silver-circle': 3, 'us-firms': 0, international: 1, boutique: 2 } },
      { label: 'The best cross-border network and international desk reputation', scores: { 'magic-circle': 1, 'silver-circle': 0, 'us-firms': 0, international: 3, boutique: 0 } },
    ],
  },
  {
    id: 20,
    question: 'Where do you picture yourself in ten years?',
    options: [
      { label: 'Partner at a Magic Circle or elite US firm, leading marquee deals', scores: { 'magic-circle': 2, 'silver-circle': 0, 'us-firms': 3, international: 0, boutique: 0 } },
      { label: 'A respected senior lawyer at a firm where I genuinely enjoy the work', scores: { 'magic-circle': 0, 'silver-circle': 3, 'us-firms': 0, international: 1, boutique: 2 } },
      { label: 'Running an international practice or heading up a global office', scores: { 'magic-circle': 1, 'silver-circle': 0, 'us-firms': 0, international: 3, boutique: 0 } },
      { label: 'A recognised authority in a niche I\'ve built from scratch', scores: { 'magic-circle': 0, 'silver-circle': 1, 'us-firms': 1, international: 0, boutique: 3 } },
    ],
  },
];

// Convenience exports for format filtering
export const SHORT_QUESTIONS = QUIZ_QUESTIONS.slice(0, 10);
export const LONG_QUESTIONS = QUIZ_QUESTIONS; // all 20

// ─── Scoring engine ───────────────────────────────────────────────────────────

const ALL_TIERS: FirmTierKey[] = [
  'magic-circle', 'silver-circle', 'us-firms', 'international', 'boutique',
];

export interface QuizResult {
  topTier: TierResult;
  scores: Record<FirmTierKey, number>;
  /** Sorted descending — all tiers */
  ranking: { tier: TierResult; score: number }[];
  /** Top 3 recommended firms with reasons */
  recommendedFirms: FirmRecommendation[];
}

/**
 * Calculate result from ranked answers.
 * answers[i] = array of option indices in rank order (rank 1 first).
 * activeQuestions = the subset of questions used (SHORT or LONG).
 * Higher-ranked options contribute more to the score via linear decay.
 */
export function calculateResult(
  answers: number[][],
  activeQuestions: QuizQuestion[],
): QuizResult {
  const scores: Record<FirmTierKey, number> = {
    'magic-circle': 0,
    'silver-circle': 0,
    'us-firms': 0,
    international: 0,
    boutique: 0,
  };

  // Collect practice area tags from each question's top-ranked answer only
  const selectedTags: PracticeTag[] = [];

  for (let i = 0; i < activeQuestions.length; i++) {
    const ranked = answers[i] ?? [];
    const question = activeQuestions[i];
    const numOptions = question.options.length;

    ranked.forEach((optionIdx, rankIdx) => {
      const option = question.options[optionIdx];
      if (!option) return;

      // Rank 1 (rankIdx=0) → multiplier 1.0; last rank → multiplier 1/numOptions
      const multiplier = (numOptions - rankIdx) / numOptions;

      for (const tier of ALL_TIERS) {
        scores[tier] += (option.scores[tier] ?? 0) * multiplier;
      }
    });

    // Only take practice tag from the top-ranked (rank 1) answer
    const topOptionIdx = ranked[0];
    if (topOptionIdx !== undefined) {
      const topOption = question.options[topOptionIdx];
      if (topOption?.practiceTag) {
        selectedTags.push(topOption.practiceTag);
      }
    }
  }

  // Rank tiers by score (descending)
  const ranking = ALL_TIERS
    .map((tier) => ({ tier: TIER_RESULTS[tier], score: Math.round(scores[tier] * 10) / 10 }))
    .sort((a, b) => b.score - a.score);

  const topTier = ranking[0].tier;

  // Pick 3 recommended firms from the top tier, boosted by practice tag overlap
  const tierFirms = FIRM_RECS[topTier.key] ?? [];
  const scored = tierFirms.map((firm) => ({
    firm,
    tagOverlap: firm.tags.filter((t) => selectedTags.includes(t)).length,
  }));
  scored.sort((a, b) => b.tagOverlap - a.tagOverlap);
  const recommendedFirms = scored.slice(0, 3).map((s) => s.firm);

  return {
    topTier,
    scores: Object.fromEntries(
      Object.entries(scores).map(([k, v]) => [k, Math.round(v * 10) / 10])
    ) as Record<FirmTierKey, number>,
    ranking,
    recommendedFirms,
  };
}
