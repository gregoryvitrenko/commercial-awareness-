/**
 * Static, manually-curated firm profiles for all 37 firms.
 *
 * CREDIBILITY RULE: No field is generated at runtime by an AI.
 * All salary/deadline figures are approximate, sourced from public recruitment
 * cycles and the-trackr.com. Update `lastVerified` and any changed figures
 * each application cycle.
 *
 * Each deadline entry uses a distinct `applyUrl` where the firm provides
 * programme-specific pages. Where only one page exists, all entries share it.
 * Always verify on the firm's official website before applying.
 */

import type { FirmProfile } from './types';
import { FIRM_ASSESSMENTS } from './firm-assessments-data';

export const FIRMS: FirmProfile[] = [

  // ─── Magic Circle (5) ─────────────────────────────────────────────────────

  {
    slug: 'allen-overy-shearman',
    name: 'A&O Shearman',
    shortName: 'A&O Shearman',
    aliases: ['Allen & Overy', 'A&O', 'A&O Shearman', 'Allen Overy Shearman', 'AOS', 'Allen & Overy Shearman Sterling'],
    tier: 'Magic Circle',
    website: 'https://www.aoshearman.com',
    hq: 'London / New York',
    offices: ['London', 'New York', 'Paris', 'Frankfurt', 'Amsterdam', 'Dubai', 'Hong Kong', 'Singapore', 'Tokyo', 'Sydney'],
    practiceAreas: ['M&A', 'Banking & Finance', 'Capital Markets', 'Disputes & Arbitration', 'Restructuring', 'Real Estate', 'Technology & Data', 'Competition'],
    knownFor: 'The newest Magic Circle firm, formed by the 2024 merger of Allen & Overy and Shearman & Sterling. Known for elite transactional work spanning banking, capital markets and M&A with a genuinely global footprint that now includes top-tier US capability.',
    culture: 'Collaborative and international, with a strong emphasis on cross-border deal exposure from day one. Trainees have historically worked across multiple offices and practice groups. The Shearman merger has brought a more commercially aggressive edge, particularly on the US side, and the integration is creating new opportunities for high-calibre trainees.',
    interviewFocus: 'Expect questions on the rationale and implications of the A&O Shearman merger for clients and the broader legal market. Strong emphasis on commercial awareness of global banking and capital markets trends.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.75–90 per year (London)',
      tcSalaryNote: '~£56,000 – £62,000',
      nqSalaryNote: '~£180,000',
      deadlines: [
        {
          label: 'First Year Programme',
          typically: 'Opens October · Closes December',
          applyUrl: 'https://earlycareersuk.aoshearman.com/first-year-programmes',
        },
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://earlycareersuk.aoshearman.com/vacation-schemes',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://earlycareersuk.aoshearman.com/training-contracts',
        },
      ],
      applyUrl: 'https://earlycareersuk.aoshearman.com',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-blue-700 dark:text-blue-400',
    forageUrl: 'https://www.theforage.com/simulations?companies=a-o-shearman',
  },

  {
    slug: 'clifford-chance',
    name: 'Clifford Chance',
    shortName: 'CC',
    aliases: ['Clifford Chance', 'CC'],
    tier: 'Magic Circle',
    website: 'https://www.cliffordchance.com',
    hq: 'London',
    offices: ['London', 'New York', 'Paris', 'Frankfurt', 'Amsterdam', 'Brussels', 'Dubai', 'Hong Kong', 'Singapore', 'Tokyo', 'Washington DC'],
    practiceAreas: ['M&A', 'Banking & Finance', 'Capital Markets', 'Litigation', 'Restructuring', 'Real Estate', 'Tax', 'Antitrust'],
    knownFor: 'One of the most international of the Magic Circle firms, with a dominant reputation in complex cross-border finance and capital markets. Consistently top-ranked for banking and leveraged finance across Europe, the Middle East and Asia.',
    culture: 'Inclusive and globally minded, with significant client secondment opportunities and a well-regarded diversity programme. CC is known for a relatively transparent seat allocation process and an active trainee community. The firm has invested heavily in its tech and innovation agenda in recent years.',
    interviewFocus: 'Interviewers focus on motivation for international commercial law and awareness of current trends in banking and capital markets. Expect a written exercise and competency-based questions on resilience and teamwork under pressure.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.80–90 per year (London)',
      tcSalaryNote: '~£56,000 – £62,000',
      nqSalaryNote: '~£185,000',
      deadlines: [
        {
          label: 'First Year Insight Programme',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://www.cliffordchance.com/careers/careers-in-law/students/first-year-programme.html',
        },
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.cliffordchance.com/careers/careers-in-law/students/vacation-schemes.html',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.cliffordchance.com/careers/careers-in-law/students/training-contracts.html',
        },
      ],
      applyUrl: 'https://www.cliffordchance.com/careers/careers-in-law/students.html',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-blue-700 dark:text-blue-400',
    forageUrl: 'https://www.theforage.com/simulations?companies=clifford-chance',
  },

  {
    slug: 'freshfields',
    name: 'Freshfields',
    shortName: 'Freshfields',
    aliases: ['Freshfields', 'Freshfields Bruckhaus Deringer'],
    tier: 'Magic Circle',
    website: 'https://www.freshfields.com',
    hq: 'London',
    offices: ['London', 'New York', 'Paris', 'Frankfurt', 'Amsterdam', 'Brussels', 'Dubai', 'Hong Kong', 'Singapore', 'Tokyo'],
    practiceAreas: ['M&A', 'Antitrust & Competition', 'Disputes & Arbitration', 'Finance', 'Real Estate', 'Tax', 'Restructuring', 'Technology & Data'],
    knownFor: 'The pre-eminent Magic Circle firm for disputes and antitrust, alongside elite M&A. Freshfields is particularly dominant in European competition law and high-stakes international arbitration, and has been aggressively expanding its US footprint.',
    culture: 'Meritocratic and intellectually rigorous, with a strong emphasis on analytical thinking. The firm has invested heavily in its New York expansion and tech-focused practice. Trainees are praised for receiving early responsibility and being treated as genuine contributors to matters from the outset.',
    interviewFocus: 'Competition law awareness is a clear differentiator — candidates who understand EU/UK merger control and recent CMA decisions make a strong impression. The interview process includes a case study element and questions on current disputes or antitrust matters.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.80–90 per year (London)',
      tcSalaryNote: '~£56,000 – £62,000',
      nqSalaryNote: '~£185,000',
      deadlines: [
        {
          label: 'First Step Programme',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://ukgraduates.freshfields.com/first-year-programme/',
        },
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://ukgraduates.freshfields.com/vacation-schemes/',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://ukgraduates.freshfields.com/training-contracts/',
        },
      ],
      applyUrl: 'https://ukgraduates.freshfields.com',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-blue-700 dark:text-blue-400',
    forageUrl: 'https://www.theforage.com/simulations/freshfields/commercial-law-gvtb',
  },

  {
    slug: 'linklaters',
    name: 'Linklaters',
    shortName: 'Links',
    aliases: ['Linklaters', 'Links'],
    tier: 'Magic Circle',
    website: 'https://www.linklaters.com',
    hq: 'London',
    offices: ['London', 'New York', 'Paris', 'Frankfurt', 'Amsterdam', 'Brussels', 'Dubai', 'Hong Kong', 'Singapore', 'Tokyo'],
    practiceAreas: ['M&A', 'Banking & Finance', 'Capital Markets', 'Disputes', 'Antitrust', 'Tax', 'Real Estate', 'Restructuring'],
    knownFor: 'A powerhouse in equity capital markets and structured finance, with particularly strong Franco-German and Asia-Pacific practices. Linklaters has a long history of advising sovereign clients, financial institutions and governments on landmark transactions.',
    culture: 'Cosmopolitan and intellectually stimulating, with a strong reputation for trainee development and high qualification rates. Regular international seat opportunities across the global network. The firm has a slightly more academic culture than some peers, with a focus on deep technical legal excellence.',
    interviewFocus: 'Partners have a strong interest in candidates with language skills and international outlook. Interviewers probe heavily on capital markets knowledge and recent ECM/DCM transactions. Assessment days include a group exercise alongside individual interviews.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.80–90 per year (London)',
      tcSalaryNote: '~£56,000 – £62,000',
      nqSalaryNote: '~£185,000',
      deadlines: [
        {
          label: 'First Year Enrichment Programme',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://www.linklaters.com/en/careers/students-and-graduates/first-year-opportunities',
        },
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.linklaters.com/en/careers/students-and-graduates/vacation-schemes',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.linklaters.com/en/careers/students-and-graduates/training-contracts',
        },
      ],
      applyUrl: 'https://www.linklaters.com/en/careers/early-careers/university-and-graduate-opportunities/training-contracts',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-blue-700 dark:text-blue-400',
    forageUrl: 'https://www.theforage.com/simulations/linklaters/commercial-law-uk-xkbb',
  },

  {
    slug: 'slaughter-and-may',
    name: 'Slaughter and May',
    shortName: 'Slaughters',
    aliases: ['Slaughter and May', 'Slaughters', 'S&M'],
    tier: 'Magic Circle',
    website: 'https://www.slaughterandmay.com',
    hq: 'London',
    offices: ['London', 'Brussels', 'Hong Kong', 'Beijing'],
    practiceAreas: ['M&A', 'Corporate', 'Financing', 'Tax', 'Competition', 'Disputes', 'Financial Regulation', 'Real Estate'],
    knownFor: "The most independent and London-centric Magic Circle firm, famous for its 'best friend' network model — rather than maintaining a global office network, it refers international work to top-tier local firms. Dominant in UK public M&A and highly selective in what it takes on.",
    culture: "Highly collegiate and non-hierarchical. Trainees complete three six-month seats rather than four, often taking on significant responsibility earlier as a result. The firm prizes intellectual curiosity above all else and has a genuine meritocracy — there are no published billable hour targets. The trainee community is close-knit and well-supported.",
    interviewFocus: "Slaughters places heavy weight on raw intellectual ability and how you think through problems, not just knowledge recall. The firm's unique 'best friend' network model and its refusal to chase league table rankings are common interview discussion points — have a considered view on why this model works.",
    trainingContract: {
      seats: 3,
      intakeSizeNote: 'c.80–85 per year',
      tcSalaryNote: '~£55,000 – £60,000',
      nqSalaryNote: '~£185,000',
      deadlines: [
        {
          label: 'Open Day (First Year)',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://www.slaughterandmay.com/careers/trainee-solicitors/apply/',
        },
        {
          label: 'Vacation Placement',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.slaughterandmay.com/careers/trainee-solicitors/apply/',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.slaughterandmay.com/careers/trainee-solicitors/apply/',
        },
      ],
      applyUrl: 'https://www.slaughterandmay.com/careers/trainee-solicitors/apply/',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-blue-700 dark:text-blue-400',
    forageUrl: 'https://www.theforage.com/simulations/slaughter-may/commercial-law-fevz',
  },

  // ─── Silver Circle (6) ────────────────────────────────────────────────────

  {
    slug: 'herbert-smith-freehills',
    name: 'Herbert Smith Freehills',
    shortName: 'HSF',
    aliases: ['Herbert Smith Freehills', 'HSF', 'Herbert Smith', 'Herbert Smith Freehills Kramer', 'HSF Kramer'],
    tier: 'Silver Circle',
    website: 'https://www.herbertsmithfreehills.com',
    hq: 'London',
    offices: ['London', 'Sydney', 'Melbourne', 'Perth', 'Singapore', 'Hong Kong', 'Tokyo', 'Dubai', 'Paris', 'Brussels', 'New York'],
    practiceAreas: ['Disputes & Arbitration', 'Corporate / M&A', 'Finance', 'Real Estate', 'Employment', 'Competition', 'Energy', 'Projects'],
    knownFor: 'The global leader in high-value disputes and international arbitration, with an unmatched track record in landmark litigation. Its energy and natural resources practice — spanning oil & gas, renewables and mining — is a particular strength across Asia-Pacific and the Middle East. Now rebranding as Herbert Smith Freehills Kramer following its combination with Kramer Levin.',
    culture: 'Open and team-focused, with a notably strong pro bono culture and a genuinely international outlook. Trainees benefit from early exposure to live disputes alongside transactional work. The firm has a real Asia-Pacific presence that distinguishes it from purely London-centric competitors.',
    interviewFocus: 'A genuine interest in disputes is strongly preferred — come prepared with a current litigation or arbitration matter you find commercially compelling. Partners also probe on energy-sector awareness, particularly around the energy transition and infrastructure financing.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.65–80 per year (London)',
      tcSalaryNote: '~£50,000 – £55,000',
      nqSalaryNote: '~£160,000',
      deadlines: [
        {
          label: 'First Year Vacation Scheme',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://careers.hsfkramer.com/global/en/uk/early-careers/trainee-associate-programme',
        },
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://careers.hsfkramer.com/global/en/uk/early-careers/trainee-associate-programme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://careers.hsfkramer.com/global/en/uk/early-careers/trainee-associate-programme',
        },
      ],
      applyUrl: 'https://careers.hsfkramer.com/global/en/uk/early-careers/trainee-associate-programme',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-violet-700 dark:text-violet-400',
    forageUrl: 'https://www.theforage.com/simulations?companies=herbert-smith-freehills',
  },

  {
    slug: 'ashurst',
    name: 'Ashurst',
    shortName: 'Ashurst',
    aliases: ['Ashurst'],
    tier: 'Silver Circle',
    website: 'https://www.ashurst.com',
    hq: 'London',
    offices: ['London', 'Sydney', 'Melbourne', 'Perth', 'Singapore', 'Hong Kong', 'Tokyo', 'Dubai', 'Frankfurt', 'Brussels', 'Madrid'],
    practiceAreas: ['Corporate / M&A', 'Finance', 'Disputes', 'Real Estate', 'Competition', 'Employment', 'Infrastructure', 'Energy & Resources'],
    knownFor: 'A leader in infrastructure and project finance, with a strong track record advising on major energy and PPP transactions globally. Particularly well-regarded across Australia and Asia-Pacific, Ashurst has been investing in its UK corporate and finance capabilities through targeted lateral hiring.',
    culture: 'Entrepreneurial and collegial, with trainees consistently describing an approachable partnership and meaningful early client contact. The firm has made significant strides in its international integration following the combination with Blake Dawson, creating genuine cross-border deal opportunities.',
    interviewFocus: 'Infrastructure, energy and project finance awareness are real differentiators. Partners value candidates with genuine sector interests — have an informed view on a current major infrastructure project, PPP deal or energy transition financing. Show you understand where law meets commercial reality.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.40–55 per year (London)',
      tcSalaryNote: '~£48,000 – £53,000',
      nqSalaryNote: '~£150,000',
      deadlines: [
        {
          label: 'Insight Scheme (First Year)',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://www.ashurst.com/en/home/careers/students/insight-scheme/',
        },
        {
          label: 'Vacation Placement',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.ashurst.com/en/home/careers/students/vacation-placements/',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.ashurst.com/en/home/careers/students/training-contracts/',
        },
      ],
      applyUrl: 'https://www.ashurst.com/en/careers/students-and-graduates/',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-violet-700 dark:text-violet-400',
    forageUrl: 'https://www.theforage.com/simulations?companies=ashurst',
  },

  {
    slug: 'hogan-lovells',
    name: 'Hogan Lovells',
    shortName: 'HL',
    aliases: ['Hogan Lovells', 'HL', 'Hogan & Lovells'],
    tier: 'International',
    website: 'https://www.hoganlovells.com',
    hq: 'London / Washington DC',
    offices: ['London', 'Washington DC', 'New York', 'Paris', 'Frankfurt', 'Brussels', 'Dubai', 'Hong Kong', 'Singapore', 'Tokyo'],
    practiceAreas: ['Corporate / M&A', 'Finance', 'Litigation', 'Regulatory', 'Life Sciences & Healthcare', 'Real Estate', 'Antitrust', 'Government Affairs'],
    knownFor: 'The go-to firm for highly regulated industries — life sciences, healthcare, financial services and media. Its transatlantic US/UK footprint and government affairs capability are unique selling points for regulatory-heavy mandates that require understanding of both Capitol Hill and Westminster.',
    culture: 'Diverse and genuinely international, with a dual-HQ model that creates a distinctive US-UK culture. Trainees often benefit from early client secondment opportunities and meaningful cross-border matter exposure. The firm is consistently praised for its supportive and inclusive working environment.',
    interviewFocus: 'Regulatory awareness is key — understand the pharmaceutical, life sciences and financial services regulatory landscape on both sides of the Atlantic. Partners specifically look for candidates who are drawn to the intersection of law and government policy.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.45–60 per year (London)',
      tcSalaryNote: '~£50,000 – £54,000',
      nqSalaryNote: '~£155,000',
      deadlines: [
        {
          label: 'First Year Programme',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://www.hoganlovells.com/en/careers/early-careers/first-year-programme',
        },
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.hoganlovells.com/en/careers/early-careers/vacation-schemes',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.hoganlovells.com/en/careers/early-careers/training-contracts',
        },
      ],
      applyUrl: 'https://ukearlycareers.hoganlovells.com/apply',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-teal-700 dark:text-teal-400',
    forageUrl: 'https://www.theforage.com/simulations/hogan-lovells/commercial-law-qxqv',
  },

  {
    slug: 'norton-rose-fulbright',
    name: 'Norton Rose Fulbright',
    shortName: 'NRF',
    aliases: ['Norton Rose Fulbright', 'NRF', 'Norton Rose'],
    tier: 'International',
    website: 'https://www.nortonrosefulbright.com',
    hq: 'London',
    offices: ['London', 'New York', 'Paris', 'Frankfurt', 'Amsterdam', 'Dubai', 'Hong Kong', 'Singapore', 'Sydney', 'Toronto', 'Johannesburg'],
    practiceAreas: ['Corporate / M&A', 'Finance', 'Disputes', 'Competition', 'Employment', 'Real Estate', 'Transport', 'Energy'],
    knownFor: "One of the world's largest global law firms by headcount, with particular strength in transport, energy and financial institutions. NRF's five-continent network is a key differentiator for complex, multi-jurisdictional mandates — particularly in shipping, aviation and commodities.",
    culture: 'International and inclusive, with a strong emphasis on sector expertise and cross-border collaboration. NRF has made significant investments in its diversity and social mobility initiatives. Trainees describe a supportive environment with regular international secondment opportunities.',
    interviewFocus: 'Sector interest matters as much as practice area preference at NRF. Partners value commercial awareness in transport, energy and financial services — have an informed view on a recent deal or regulatory development in your target sector. Show you understand global supply chain dynamics.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.40–50 per year (London)',
      tcSalaryNote: '~£47,000 – £51,000',
      nqSalaryNote: '~£145,000',
      deadlines: [
        {
          label: 'Insight Days (First Year)',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://www.nortonrosefulbright.com/en-gb/careers/graduates/insight-days',
        },
        {
          label: 'Vacation Placement',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.nortonrosefulbright.com/en-gb/careers/graduates/vacation-placements',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.nortonrosefulbright.com/en-gb/graduates/apply',
        },
      ],
      applyUrl: 'https://www.nortonrosefulbright.com/en-gb/graduates/apply',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-teal-700 dark:text-teal-400',
    forageUrl: 'https://www.theforage.com/simulations/norton-rose-fulbright-uk/law-v33z-go8c',
  },

  {
    slug: 'travers-smith',
    name: 'Travers Smith',
    shortName: 'Travers',
    aliases: ['Travers Smith'],
    tier: 'Silver Circle',
    website: 'https://www.traverssmith.com',
    hq: 'London',
    offices: ['London', 'Paris'],
    practiceAreas: ['Corporate / M&A', 'Private Equity', 'Finance', 'Disputes', 'Employment', 'Real Estate', 'Tax', 'Financial Services Regulation'],
    knownFor: 'The standout mid-market private equity firm, with a blue-chip roster of financial sponsors as long-term clients. Travers Smith consistently punches above its size in high-quality transactional work — it is deliberately London-focused and refuses to sacrifice quality for volume.',
    culture: "Genuinely collegiate and intimate — the firm is intentionally small (London + Paris) and invests heavily in trainee development as a result. Known for a flat hierarchy, outstanding qualification rates, and one of the most positive working environments at the London Bar. Trainees here describe feeling genuinely valued.",
    interviewFocus: 'Private equity deal-flow awareness is essential — understand the fund cycle, LBO mechanics and key financial sponsors in the mid-market. Partners strongly value candidates who can articulate clearly why they want a London-focused, boutique experience over a global firm.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.25–35 per year',
      tcSalaryNote: '~£50,000 – £55,000',
      nqSalaryNote: '~£155,000',
      deadlines: [
        {
          label: 'Open Day (First Year)',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://www.traverssmith.com/join-us/graduate-recruitment/application-process/',
        },
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.traverssmith.com/join-us/graduate-recruitment/application-process/',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.traverssmith.com/join-us/graduate-recruitment/application-process/',
        },
      ],
      applyUrl: 'https://www.traverssmith.com/join-us/graduate-recruitment/application-process/',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-violet-700 dark:text-violet-400',
  },

  {
    slug: 'macfarlanes',
    name: 'Macfarlanes',
    shortName: 'Macfarlanes',
    aliases: ['Macfarlanes'],
    tier: 'Silver Circle',
    website: 'https://www.macfarlanes.com',
    hq: 'London',
    offices: ['London', 'Brussels'],
    practiceAreas: ['Corporate / M&A', 'Private Equity', 'Finance', 'Tax', 'Disputes', 'Real Estate', 'Private Client', 'Employment'],
    knownFor: 'A highly selective London firm with an elite private equity and tax practice. Macfarlanes is renowned for the quality — rather than volume — of its work, and for retaining trainees at exceptional rates through to partnership.',
    culture: 'Meritocratic and intellectually demanding, with genuine partnership-track ambition for every trainee. The deliberately smaller intake means trainees receive significant responsibility from early in their training. Known for a close-knit, supportive community where partners are genuinely accessible.',
    interviewFocus: 'Partners expect deep commercial awareness of private equity and M&A markets — know recent significant PE deals and be able to discuss the economics. A strong academic record matters. Be prepared to explain convincingly why you prefer a high-quality London-focused firm over a larger global practice.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.25–30 per year',
      tcSalaryNote: '~£50,000 – £54,000',
      nqSalaryNote: '~£150,000',
      deadlines: [
        {
          label: 'First Year Scheme',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://www.macfarlanes.com/join-us/early-careers/experience-macfarlanes/macfarlanes-trainee-experience/',
        },
        {
          label: 'Summer Vacation Placement',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.macfarlanes.com/join-us/early-careers/apply/',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.macfarlanes.com/join-us/early-careers/apply/',
        },
      ],
      applyUrl: 'https://www.macfarlanes.com/join-us/early-careers/apply/',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-violet-700 dark:text-violet-400',
  },

  // ─── Elite US (5) ─────────────────────────────────────────────────────────

  {
    slug: 'latham-watkins',
    name: 'Latham & Watkins',
    shortName: 'Latham',
    aliases: ['Latham & Watkins', 'Latham', 'L&W'],
    tier: 'US Firms',
    website: 'https://www.lw.com',
    hq: 'Los Angeles / London',
    offices: ['London', 'New York', 'Los Angeles', 'San Francisco', 'Washington DC', 'Paris', 'Frankfurt', 'Dubai', 'Hong Kong', 'Singapore', 'Tokyo'],
    practiceAreas: ['Private Equity', 'M&A', 'Finance', 'Capital Markets', 'Restructuring', 'Disputes', 'Technology', 'Energy & Infrastructure'],
    knownFor: "The world's highest-grossing law firm, with an unmatched global private equity practice. Latham's lock-step compensation model and breadth of practice areas make it one of the most coveted destinations for elite associates, combining Magic Circle-quality transactional work with US firm economics.",
    culture: "Fast-paced, meritocratic and collegial for a US firm. Associates consistently praise Latham's lock-step system — pay based on seniority, not individual billings — for eliminating the internal competition common at peer US firms. Strong emphasis on teamwork, knowledge-sharing and associate development.",
    interviewFocus: "Private equity and leveraged finance deal knowledge are central to Latham interviews. Partners look for high intellectual horsepower and the ability to thrive in a fast-moving transactional environment. Expect a rigorous written assessment and probing questions on current PE deal dynamics.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.30–40 per year (London)',
      tcSalaryNote: '~£57,000 – £65,000',
      nqSalaryNote: '~£185,000+',
      deadlines: [
        {
          label: 'First Year Programme',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://www.lwcareers.com/first-year-programme/',
        },
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens September · Closes November',
          applyUrl: 'https://www.lwcareers.com/vacation-schemes/',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.lwcareers.com/training-contracts/',
        },
      ],
      applyUrl: 'https://www.lwcareers.com/en/beginning-your-legal-career/united-kingdom',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
    forageUrl: 'https://www.theforage.com/simulations?companies=latham-watkins',
  },

  {
    slug: 'kirkland-ellis',
    name: 'Kirkland & Ellis',
    shortName: 'Kirkland',
    aliases: ['Kirkland & Ellis', 'Kirkland', 'K&E'],
    tier: 'US Firms',
    website: 'https://www.kirkland.com',
    hq: 'Chicago / New York',
    offices: ['London', 'New York', 'Chicago', 'Los Angeles', 'San Francisco', 'Washington DC', 'Boston', 'Houston', 'Paris', 'Hong Kong', 'Munich'],
    practiceAreas: ['Private Equity', 'M&A', 'Leveraged Finance', 'Restructuring', 'Capital Markets', 'Tax', 'Litigation', 'Real Estate'],
    knownFor: "The dominant global private equity firm by revenue, consistently advising the largest buyouts in the world. Kirkland's London office is firmly at the very top of the market for PE transactions and leveraged finance — it routinely wins the most coveted mandates.",
    culture: "High-performance and intensely deal-focused. Kirkland operates on an eat-what-you-kill compensation model at partner level, creating a competitive but entrepreneurial culture. Associates are expected to take early and direct ownership of matters — autonomy is high, and so are the expectations.",
    interviewFocus: 'Leveraged finance and private equity deal mechanics are non-negotiable knowledge areas. Kirkland interviews are deliberately demanding — candidates must demonstrate not just intelligence but the commercial drive, resilience and maturity to thrive under sustained pressure in the most competitive deals.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.20–30 per year (London)',
      tcSalaryNote: '~£60,000 – £70,000',
      nqSalaryNote: '~£200,000+',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens September · Closes November',
          applyUrl: 'https://ukgraduate.kirkland.com/vacation-scheme/',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens June · Closes September',
          applyUrl: 'https://ukgraduate.kirkland.com/training-contract/',
        },
      ],
      applyUrl: 'https://ukgraduate.kirkland.com/your-application/',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'davis-polk',
    name: 'Davis Polk',
    shortName: 'Davis Polk',
    aliases: ['Davis Polk', 'Davis Polk & Wardwell', 'DPW', 'Davis Polk and Wardwell'],
    tier: 'US Firms',
    website: 'https://www.davispolk.com',
    hq: 'New York',
    offices: ['London', 'New York', 'Washington DC', 'Menlo Park', 'Paris', 'Frankfurt', 'Madrid', 'Hong Kong', 'Beijing', 'Tokyo'],
    practiceAreas: ['M&A', 'Capital Markets', 'Finance', 'Restructuring', 'Financial Regulation', 'Litigation', 'Tax', 'Antitrust'],
    knownFor: "The pre-eminent Wall Street firm for capital markets and financial regulatory work, with a storied history advising the world's leading investment banks on their most complex mandates. Davis Polk's London office focuses on high-end capital markets issuances and banking regulatory matters.",
    culture: "Elite and understated — Davis Polk is known for exceptional quality and discretion. The London office has a smaller, close-knit feel compared to the New York mothership. Associates describe being treated as intelligent adults from day one, with direct access to senior partners and responsibility on landmark transactions.",
    interviewFocus: 'Capital markets and financial regulation knowledge are central. Understand the regulatory framework governing investment banks — Basel III/IV, MiFID II, the FCA rulebook. Davis Polk selects for exceptional academic ability and genuine intellectual interest in the nexus of global finance and law.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.10–15 per year (London)',
      tcSalaryNote: '~£57,000 – £65,000',
      nqSalaryNote: '~£180,000+',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.davispolk.com/careers/vacation-scheme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.davispolk.com/careers/trainee-solicitors-programme',
        },
      ],
      applyUrl: 'https://www.davispolk.com/careers/trainee-solicitors-programme',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'skadden',
    name: 'Skadden',
    shortName: 'Skadden',
    aliases: ['Skadden', 'Skadden Arps', 'Skadden, Arps, Slate, Meagher & Flom'],
    tier: 'US Firms',
    website: 'https://www.skadden.com',
    hq: 'New York',
    offices: ['London', 'New York', 'Washington DC', 'Los Angeles', 'Chicago', 'Paris', 'Frankfurt', 'Brussels', 'Hong Kong', 'Tokyo', 'Singapore'],
    practiceAreas: ['M&A', 'Antitrust & Competition', 'Finance', 'Capital Markets', 'Restructuring', 'Litigation', 'Tax', 'Executive Compensation'],
    knownFor: "Made legendary by the hostile takeover era of the 1980s, Skadden remains a global powerhouse for complex cross-border M&A and antitrust. Its London office is consistently top-ranked for UK public takeovers, major regulatory clearances and transformative corporate transactions.",
    culture: "Demanding and deal-focused, with a strong sense of institutional pride and heritage. Skadden lawyers take their work seriously. The firm rewards genuine commitment with excellent compensation, high-calibre deal exposure and the prestige of working on the most visible transactions globally.",
    interviewFocus: "M&A and antitrust commercial awareness are non-negotiable. Skadden partners look for candidates with genuine intellectual curiosity and the confidence to engage analytically on complex deal dynamics. Be ready to discuss a major cross-border takeover in detail — mechanics, regulatory hurdles and strategic rationale.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.15–20 per year (London)',
      tcSalaryNote: '~£55,000 – £65,000',
      nqSalaryNote: '~£185,000+',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.skadden.com/careers/london-vacation-scheme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.skadden.com/careers/london-trainee-solicitor-programme',
        },
      ],
      applyUrl: 'https://www.skadden.com/careers/attorneys/law-students-and-graduates/united-kingdom',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'sullivan-cromwell',
    name: 'Sullivan & Cromwell',
    shortName: 'S&C',
    aliases: ['Sullivan & Cromwell', 'S&C', 'Sullivan and Cromwell'],
    tier: 'US Firms',
    website: 'https://www.sullcrom.com',
    hq: 'New York',
    offices: ['London', 'New York', 'Washington DC', 'Los Angeles', 'Paris', 'Frankfurt', 'Brussels', 'Tokyo', 'Hong Kong', 'Beijing', 'Sydney', 'Melbourne'],
    practiceAreas: ['M&A', 'Capital Markets', 'Banking & Finance', 'Financial Regulation', 'Litigation', 'Tax', 'Real Estate', 'Private Equity'],
    knownFor: "One of the most prestigious Wall Street firms with over 140 years of history. Sullivan & Cromwell is synonymous with elite M&A and capital markets work, and is the trusted adviser to leading financial institutions on transformational transactions and complex regulatory matters worldwide.",
    culture: "Prestigious and intellectually rigorous, with an atmosphere that rewards self-starters. The London office is small and deliberately selective. Associates describe working directly alongside senior partners from very early in their careers on genuinely landmark transactions — autonomy and early responsibility are hallmarks of life at S&C.",
    interviewFocus: "Exceptional academic credentials are the baseline at S&C. Interviews probe deeply on M&A deal structures and financial regulatory frameworks. Candidates should be able to fluently discuss recent landmark transactions — particularly cross-border M&A or complex financial services regulatory matters.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.8–12 per year (London)',
      tcSalaryNote: '~£57,000 – £65,000',
      nqSalaryNote: '~£185,000+',
      deadlines: [
        {
          label: 'UK Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.sullcrom.com/Careers/Offices/United-Kingdom/U.K.-Vacation-Scheme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.sullcrom.com/Careers/Offices/United-Kingdom/U.K.-Trainee-Solicitors-Programme',
        },
      ],
      applyUrl: 'https://www.sullcrom.com/Careers/Offices/United-Kingdom/U.K.-Trainee-Solicitors-Programme',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  // ─── US Firms — reclassified from boutique (7) ─────────────────────────────

  {
    slug: 'weil-gotshal-manges',
    name: 'Weil, Gotshal & Manges',
    shortName: 'Weil',
    aliases: ['Weil', 'Weil Gotshal', 'Weil Gotshal & Manges', 'Weil, Gotshal & Manges'],
    tier: 'US Firms',
    website: 'https://www.weil.com',
    hq: 'New York',
    offices: ['London', 'New York', 'Boston', 'Washington DC', 'Dallas', 'Houston', 'Silicon Valley', 'Frankfurt', 'Munich', 'Paris', 'Warsaw', 'Hong Kong'],
    practiceAreas: ['Private Equity', 'Restructuring & Insolvency', 'M&A', 'Finance', 'Litigation'],
    knownFor: 'Weil is regarded as the pre-eminent restructuring firm globally and one of the strongest private equity practices in London. The firm consistently acts on the largest and most complex leveraged buyouts and distressed situations in Europe.',
    culture: 'Weil London has a tight-knit, high-performance culture with a relatively small trainee intake that gives trainees meaningful early responsibility. The firm is meritocratic and expects trainees to engage commercially from day one. The office atmosphere is described as collaborative rather than cut-throat for a US firm.',
    interviewFocus: 'Weil interviews probe commercial awareness heavily, particularly around restructuring and PE deal news. Expect competency questions framed around why Weil specifically — interviewers test whether candidates understand the difference between Weil\'s practice and the Magic Circle.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.8–12 per year (London)',
      tcSalaryNote: '~£60,000 – £65,000',
      nqSalaryNote: '~£175,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.weil.com/careers/students/vacation-schemes',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.weil.com/careers/students/training-contracts',
        },
      ],
      applyUrl: 'https://www.weil.com/careers/students',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'gibson-dunn',
    name: 'Gibson, Dunn & Crutcher',
    shortName: 'Gibson Dunn',
    aliases: ['Gibson Dunn', 'Gibson, Dunn & Crutcher', 'Gibson Dunn & Crutcher'],
    tier: 'US Firms',
    website: 'https://www.gibsondunn.com',
    hq: 'Los Angeles',
    offices: ['London', 'New York', 'Los Angeles', 'San Francisco', 'Washington DC', 'Dallas', 'Denver', 'Houston', 'Paris', 'Brussels', 'Munich', 'Frankfurt', 'Singapore', 'Dubai'],
    practiceAreas: ['M&A', 'Private Equity', 'Litigation & Arbitration', 'Capital Markets', 'Technology & Data'],
    knownFor: "Gibson Dunn's London office is a powerhouse for cross-border M&A and international arbitration, with an exceptionally strong reputation for high-stakes litigation. The firm is known for acting for financial sponsors and major corporates on transformative transactions.",
    culture: 'Gibson Dunn operates a genuinely flat hierarchy where trainees are treated as junior lawyers from the outset. The London office is relatively small, creating a collegial environment with significant partner access. The culture is intellectually demanding with a strong emphasis on excellent written work.',
    interviewFocus: 'Gibson Dunn interviews are known for being intellectually rigorous, often involving case studies or hypothetical deal scenarios. The firm expects candidates to demonstrate a sophisticated understanding of M&A and arbitration markets and to articulate a credible reason for choosing a US firm over the Magic Circle.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.6–10 per year (London)',
      tcSalaryNote: '~£60,000 – £65,000',
      nqSalaryNote: '~£180,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes December',
          applyUrl: 'https://www.gibsondunn.com/careers/trainees/vacation-schemes',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.gibsondunn.com/careers/trainees/training-contracts',
        },
      ],
      applyUrl: 'https://www.gibsondunn.com/careers/trainees',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'cleary-gottlieb',
    name: 'Cleary Gottlieb Steen & Hamilton',
    shortName: 'Cleary Gottlieb',
    aliases: ['Cleary Gottlieb', 'Cleary Gottlieb Steen & Hamilton', 'Cleary', 'CGSH'],
    tier: 'US Firms',
    website: 'https://www.clearygottlieb.com',
    hq: 'New York',
    offices: ['London', 'New York', 'Washington DC', 'Paris', 'Brussels', 'Frankfurt', 'Cologne', 'Rome', 'Milan', 'Hong Kong', 'Beijing', 'Abu Dhabi', 'Seoul', 'São Paulo'],
    practiceAreas: ['M&A', 'Capital Markets', 'Antitrust / Competition', 'Sovereign Debt', 'Financial Regulation'],
    knownFor: "Cleary Gottlieb is one of the most intellectually prestigious law firms in the world, renowned for sovereign and supranational work and landmark capital markets transactions. Its London office is particularly strong in competition law and complex cross-border deals involving financial institutions and governments.",
    culture: "Cleary has a famously non-hierarchical culture — trainees are called 'associates' from the start and are expected to contribute substantively from day one. The firm attracts lawyers who are academically exceptional and intellectually curious. The London office is genuinely international, with lawyers from dozens of jurisdictions working side by side.",
    interviewFocus: 'Cleary interviews are notably intellectual in tone, often testing knowledge of international finance, competition policy, or geopolitics relevant to their practice. The firm values candidates who can think through novel problems rather than recite prepared answers — intellectual independence is highly prized.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.6–10 per year (London)',
      tcSalaryNote: '~£55,000 – £62,000',
      nqSalaryNote: '~£170,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes December',
          applyUrl: 'https://www.clearygottlieb.com/careers/london-vacation-schemes',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.clearygottlieb.com/careers/london-training-contracts',
        },
      ],
      applyUrl: 'https://www.clearygottlieb.com/careers',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'fried-frank',
    name: 'Fried Frank',
    shortName: 'Fried Frank',
    aliases: ['Fried Frank', 'Fried, Frank, Harris, Shriver & Jacobson', 'Fried Frank Harris Shriver & Jacobson'],
    tier: 'US Firms',
    website: 'https://www.friedfrank.com',
    hq: 'New York',
    offices: ['London', 'New York', 'Washington DC', 'Frankfurt', 'Brussels'],
    practiceAreas: ['Private Equity', 'M&A', 'Real Estate', 'Finance', 'Capital Markets'],
    knownFor: "Fried Frank's London office is one of the strongest private equity practices of any US firm in Europe, regularly acting on landmark leveraged buyouts and fund formation. The firm has a particularly strong real estate finance practice — a distinguishing feature from most other US firms in London.",
    culture: 'Fried Frank has a notably entrepreneurial culture where trainees are expected to demonstrate commercial judgement early. The London office is small enough that trainees have regular direct exposure to partners and senior associates. The firm is demanding but highly rewarding for those who thrive in high-stakes environments.',
    interviewFocus: 'Fried Frank interviews focus on private equity deal knowledge and commercial awareness of the LBO market. Candidates should expect to discuss recent PE transactions and demonstrate understanding of fund structures and how lawyers add value to sponsor-side work.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.4–8 per year (London)',
      tcSalaryNote: '~£60,000 – £65,000',
      nqSalaryNote: '~£180,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.friedfrank.com/careers/london-vacation-scheme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.friedfrank.com/careers/london-trainees',
        },
      ],
      applyUrl: 'https://www.friedfrank.com/careers',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'ropes-gray',
    name: 'Ropes & Gray',
    shortName: 'Ropes & Gray',
    aliases: ['Ropes & Gray', 'Ropes and Gray', 'Ropes Gray'],
    tier: 'US Firms',
    website: 'https://www.ropesgray.com',
    hq: 'Boston',
    offices: ['London', 'Boston', 'New York', 'Washington DC', 'San Francisco', 'Chicago', 'Los Angeles', 'Tokyo', 'Hong Kong', 'Seoul', 'Singapore'],
    practiceAreas: ['Private Equity', 'Asset Management', 'Healthcare', 'Finance', 'Litigation & Enforcement'],
    knownFor: "Ropes & Gray is the leading firm globally for private equity fund formation and asset management regulation, with a growing London transactional practice. The firm has an exceptional reputation in healthcare M&A — a niche that clearly differentiates it from other US firms operating in London.",
    culture: "Ropes & Gray has a reputation for being one of the more people-friendly US firms in London, with trainees describing a collaborative atmosphere and genuine investment in junior lawyer development. The firm runs extensive formal training programmes alongside seat rotations, which is unusual for a US firm of its size.",
    interviewFocus: 'Ropes & Gray interviews test commercial awareness around private equity and asset management, including fund structures and the regulatory environment. The firm values candidates who can explain specifically why the PE and asset management focus appeals to them — a generic answer will not do.',
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.8–12 per year (London)',
      tcSalaryNote: '~£60,000 – £65,000',
      nqSalaryNote: '~£175,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes December',
          applyUrl: 'https://www.ropesgray.com/en/careers/london-trainees/vacation-schemes',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.ropesgray.com/en/careers/london-trainees/training-contracts',
        },
      ],
      applyUrl: 'https://www.ropesgray.com/en/careers/london-trainees',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  // ─── Boutique — specialist only ──────────────────────────────────────────

  {
    slug: 'quinn-emanuel',
    name: 'Quinn Emanuel',
    shortName: 'Quinn Emanuel',
    aliases: ['Quinn Emanuel', 'Quinn Emanuel Urquhart & Sullivan', 'Quinn Emanuel Urquhart and Sullivan'],
    tier: 'Boutique',
    website: 'https://www.quinnemanuel.com',
    hq: 'Los Angeles',
    offices: ['London', 'Los Angeles', 'New York', 'San Francisco', 'Washington DC', 'Houston', 'Paris', 'Brussels', 'Hamburg', 'Mannheim', 'Munich', 'Tokyo', 'Zurich', 'Dubai'],
    practiceAreas: ['Commercial Litigation', 'International Arbitration', 'Investigations', 'Intellectual Property', 'Insolvency Litigation'],
    knownFor: "Quinn Emanuel is the world's largest disputes-only law firm and universally regarded as the most aggressive and successful litigation boutique globally. The London office handles some of the largest commercial disputes and arbitrations in the English courts and international tribunals.",
    culture: "Quinn Emanuel has a meritocratic, results-driven culture where trainees are given significant responsibility from the start. Because the firm is disputes-only, trainees develop deep advocacy and analytical skills rather than a transactional seat rotation. The culture is competitive but highly rewarding for those who thrive on intellectual combat.",
    interviewFocus: "Quinn Emanuel interviews focus on analytical reasoning and advocacy — candidates may be asked to argue a position, critique a legal argument, or discuss a major commercial dispute. Commercial awareness should be framed around litigation and disputes rather than deal-making, and you must be able to explain why you want a disputes-only career.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.6–10 per year (London)',
      tcSalaryNote: '~£60,000 – £65,000',
      nqSalaryNote: '~£180,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.quinnemanuel.com/careers/london-vacation-schemes',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.quinnemanuel.com/careers/london-training-contracts',
        },
      ],
      applyUrl: 'https://www.quinnemanuel.com/careers',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-emerald-700 dark:text-emerald-400',
  },

  {
    slug: 'paul-weiss',
    name: 'Paul, Weiss, Rifkind, Wharton & Garrison',
    shortName: 'Paul Weiss',
    aliases: ['Paul Weiss', 'Paul, Weiss', 'Paul, Weiss, Rifkind, Wharton & Garrison', 'Paul Weiss Rifkind Wharton & Garrison'],
    tier: 'US Firms',
    website: 'https://www.paulweiss.com',
    hq: 'New York',
    offices: ['London', 'New York', 'Washington DC', 'Wilmington', 'Toronto', 'Tokyo', 'Hong Kong', 'Beijing', 'Singapore', 'Frankfurt', 'Brussels'],
    practiceAreas: ['M&A', 'Private Equity', 'Restructuring', 'Litigation', 'Capital Markets'],
    knownFor: "Paul Weiss is one of the most prestigious US firms globally, known for landmark M&A transactions, high-profile litigation, and advising some of the world's largest private equity firms. The London office is rapidly growing in European M&A through an aggressive lateral hire strategy.",
    culture: "Paul Weiss has an ambitious, fast-paced culture reflecting its New York roots. Trainees are expected to be self-starters who proactively seek out work and take ownership of their matters. The firm is known for exceptional sophistication in the work it handles and rewards those who demonstrate commercial initiative and drive.",
    interviewFocus: "Paul Weiss interviews are reputation-focused — the firm expects candidates to know its major deals and clients and to articulate convincingly why they want to work at a firm that is rapidly growing its London presence. Commercial awareness should demonstrate understanding of US-UK cross-border M&A dynamics and the competitive landscape.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.6–10 per year (London)',
      tcSalaryNote: '~£60,000 – £65,000',
      nqSalaryNote: '~£180,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes December',
          applyUrl: 'https://www.paulweiss.com/careers/london-vacation-scheme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.paulweiss.com/careers/london-trainees',
        },
      ],
      applyUrl: 'https://www.paulweiss.com/careers',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'proskauer',
    name: 'Proskauer Rose',
    shortName: 'Proskauer',
    aliases: ['Proskauer', 'Proskauer Rose', 'Proskauer Rose LLP'],
    tier: 'US Firms',
    website: 'https://www.proskauer.com',
    hq: 'New York',
    offices: ['London', 'New York', 'Boston', 'Washington DC', 'Los Angeles', 'Chicago', 'New Orleans', 'Newark', 'Paris', 'São Paulo', 'Hong Kong', 'Beijing'],
    practiceAreas: ['Private Equity', 'Sports Law', 'Labour & Employment', 'Finance', 'Litigation'],
    knownFor: "Proskauer is the leading firm globally for private equity funds and alternative asset management, and has one of the most recognised sports law practices in the world acting for major clubs, governing bodies and investors. The London office is particularly strong in private funds and leveraged finance.",
    culture: "Proskauer has a relatively collegial culture for a US firm, with trainees noting strong mentoring from senior associates and partners. The firm is known for investing in people rather than running a high-attrition model. The distinctive sports law practice adds a unique flavour to the firm's events and networking.",
    interviewFocus: "Proskauer interviews test knowledge of private equity fund structures and the alternative asset management industry. For candidates interested in sports law, familiarity with sports rights deals and governing body structures is expected. The firm values genuine enthusiasm for its niche practices over generic commercial law answers.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.4–8 per year (London)',
      tcSalaryNote: '~£60,000 – £65,000',
      nqSalaryNote: '~£175,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.proskauer.com/careers/london-vacation-scheme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.proskauer.com/careers/london-trainees',
        },
      ],
      applyUrl: 'https://www.proskauer.com/careers',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'mishcon-de-reya',
    name: 'Mishcon de Reya',
    shortName: 'Mishcon',
    aliases: ['Mishcon de Reya', 'Mishcon', 'MDR'],
    tier: 'Boutique',
    website: 'https://www.mishcon.com',
    hq: 'London',
    offices: ['London', 'Singapore', 'Hong Kong', 'New York'],
    practiceAreas: ['Dispute Resolution', 'Real Estate', 'Private Client', 'Corporate', 'Technology & Innovation'],
    knownFor: "Mishcon de Reya is one of the UK's most prominent independent law firms, known for high-profile litigation, a strong real estate practice, and a distinctive innovation focus including its MDR Lab legal tech incubator. The firm consistently punches well above its size in reputational terms.",
    culture: "Mishcon has a distinctive entrepreneurial and creative culture unlike any other firm in London — trainees often describe it as a place where personal initiative is celebrated and where the work spans genuinely interesting and non-standard matters. The firm has invested heavily in legal technology and trainees are actively encouraged to engage with innovation projects.",
    interviewFocus: "Mishcon interviews focus on commercial awareness alongside an understanding of the firm's unusual breadth — from HNW disputes to corporate M&A and legal tech. The firm values candidates who are genuinely intellectually curious and who can explain why they want a firm that is neither a Magic Circle giant nor a US finance boutique.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.15–25 per year',
      tcSalaryNote: '~£40,000 – £48,000',
      nqSalaryNote: '~£95,000',
      deadlines: [
        {
          label: 'First Year Scheme',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://www.mishcon.com/careers/trainees/first-year-scheme',
        },
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.mishcon.com/careers/trainees/vacation-schemes',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.mishcon.com/careers/trainees/training-contracts',
        },
      ],
      applyUrl: 'https://www.mishcon.com/careers/trainees',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-emerald-700 dark:text-emerald-400',
    forageUrl: 'https://www.theforage.com/simulations/mishcon-de-reya',
  },

  {
    slug: 'bird-bird',
    name: 'Bird & Bird',
    shortName: 'Bird & Bird',
    aliases: ['Bird & Bird', 'Bird and Bird', 'TwoBirds'],
    tier: 'International',
    website: 'https://www.twobirds.com',
    hq: 'London',
    offices: ['London', 'Amsterdam', 'Beijing', 'Brussels', 'Budapest', 'Copenhagen', 'Dubai', 'Düsseldorf', 'Frankfurt', 'The Hague', 'Helsinki', 'Hong Kong', 'Lisbon', 'Lyon', 'Madrid', 'Milan', 'Munich', 'Paris', 'Prague', 'Rome', 'Shanghai', 'Singapore', 'Stockholm', 'Sydney', 'Warsaw'],
    practiceAreas: ['Technology, Media & Telecoms', 'Intellectual Property', 'Data Protection', 'Competition', 'Corporate / M&A'],
    knownFor: "Bird & Bird is the leading specialist firm for technology, media, and telecoms work in Europe, acting for major tech companies, sports organisations, and regulators on cutting-edge matters including AI regulation, data protection, and IP enforcement. The firm has the most extensive European network of any TMT specialist.",
    culture: "Bird & Bird has a notably friendly and inclusive culture with a strong emphasis on sector specialism — trainees are encouraged to develop genuine expertise in tech-related areas from early in their training. The firm is less hierarchical than most and trainees describe a good work-life balance relative to City norms. The TMT focus makes it particularly exciting for those with a genuine interest in technology and innovation.",
    interviewFocus: "Bird & Bird interviews test knowledge of technology and IP law developments, including AI regulation (the EU AI Act and UK equivalent), data protection (UK GDPR post-Brexit), and major TMT transactions. Candidates should demonstrate genuine interest in tech and be able to discuss recent deals or regulatory developments relevant to the firm's clients.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.20–25 per year (London)',
      tcSalaryNote: '~£40,000 – £46,000',
      nqSalaryNote: '~£100,000',
      deadlines: [
        {
          label: 'Insight Week (First Year)',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://www.twobirds.com/en/careers/students/insight-week',
        },
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes November',
          applyUrl: 'https://www.twobirds.com/en/careers/students/vacation-schemes',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.twobirds.com/en/careers/students/training-contracts',
        },
      ],
      applyUrl: 'https://www.twobirds.com/en/careers/students',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-teal-700 dark:text-teal-400',
    forageUrl: 'https://www.theforage.com/simulations/bird-and-bird',
  },

  {
    slug: 'stewarts',
    name: 'Stewarts',
    shortName: 'Stewarts',
    aliases: ['Stewarts', 'Stewarts Law', 'Stewarts Litigators'],
    tier: 'Boutique',
    website: 'https://www.stewartslaw.com',
    hq: 'London',
    offices: ['London'],
    practiceAreas: ['Commercial Litigation', 'Competition & EU', 'Employment', 'International Arbitration', 'Real Estate Disputes'],
    knownFor: "Stewarts is the UK's largest litigation-only law firm and one of the most highly-regarded disputes practices in London. The firm handles complex, high-value commercial disputes — often acting against Magic Circle firms — and is known for its aggressive and innovative approach to funding and case strategy.",
    culture: "Stewarts has a distinctive, entrepreneurial culture shaped by its litigation-only focus. Trainees develop deep disputes expertise rather than rotating through transactional seats. The firm is relatively small, so trainees work closely with partners and are expected to contribute meaningfully to case strategy. The atmosphere is intellectually intense but collegial.",
    interviewFocus: "Stewarts interviews test analytical thinking and advocacy skills — expect to discuss recent commercial disputes and demonstrate why you're committed to a litigation career. The firm values candidates who can explain why they want a disputes-only practice and can articulate the strategic thinking behind a complex case.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.6–10 per year',
      tcSalaryNote: '~£46,000 – £50,000',
      nqSalaryNote: '~£105,000 – £120,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.stewartslaw.com/careers/vacation-scheme/',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.stewartslaw.com/careers/training-contract/',
        },
      ],
      applyUrl: 'https://www.stewartslaw.com/careers/',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-emerald-700 dark:text-emerald-400',
  },

  {
    slug: 'bristows',
    name: 'Bristows LLP',
    shortName: 'Bristows',
    aliases: ['Bristows', 'Bristows LLP'],
    tier: 'Boutique',
    website: 'https://www.bristows.com',
    hq: 'London',
    offices: ['London', 'Brussels'],
    practiceAreas: ['Intellectual Property', 'Life Sciences & Pharma', 'Technology', 'Data Privacy', 'Competition'],
    knownFor: "Bristows is one of the UK's pre-eminent IP and technology law firms, with a patent litigation practice that is consistently ranked at the very top of the market. The firm acts for leading pharmaceutical companies, tech giants and innovators on their most important IP disputes and licensing arrangements — it is a name that carries enormous weight in patent law circles.",
    culture: "Bristows has a friendly, approachable culture that stands in contrast to the intensity of the work it handles. The firm is large enough to take on major mandates but small enough that trainees know everyone by name. There is a genuine sense of intellectual enthusiasm — lawyers here tend to be fascinated by science and technology as well as law.",
    interviewFocus: "Bristows interviews look for candidates with a genuine interest in IP, technology and life sciences — a STEM background is valued but not required. Expect questions about patent law developments, recent pharma litigation, or technology regulation. The firm wants to see that you understand why IP matters commercially, not just legally.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.8–12 per year',
      tcSalaryNote: '~£46,000 – £50,000',
      nqSalaryNote: '~£85,000 – £95,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.bristows.com/join-us/vacation-scheme/',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.bristows.com/join-us/training-contracts/',
        },
      ],
      applyUrl: 'https://www.bristows.com/join-us/',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-emerald-700 dark:text-emerald-400',
  },

  // ─── International — additional ─────────────────────────────────────────

  {
    slug: 'simmons-simmons',
    name: 'Simmons & Simmons',
    shortName: 'Simmons',
    aliases: ['Simmons & Simmons', 'Simmons and Simmons', 'Simmons'],
    tier: 'International',
    website: 'https://www.simmons-simmons.com',
    hq: 'London',
    offices: ['London', 'Bristol', 'Paris', 'Düsseldorf', 'Frankfurt', 'Munich', 'Milan', 'Amsterdam', 'Brussels', 'Luxembourg', 'Tokyo', 'Hong Kong', 'Singapore', 'Beijing', 'Shanghai', 'Jeddah', 'Riyadh', 'Dubai', 'Doha'],
    practiceAreas: ['TMT', 'Life Sciences', 'Financial Services', 'Asset Management', 'Energy & Infrastructure'],
    knownFor: "Simmons & Simmons is arguably the most sector-focused of the Silver Circle firms, with market-leading practices in TMT, life sciences and financial services. The firm has a reputation for innovation and regularly advises on cutting-edge regulatory and technology issues — including AI, fintech and digital assets.",
    culture: "Simmons has a progressive, inclusive culture and is frequently cited as one of the friendliest firms at this level. The firm invests heavily in wellbeing and flexible working, and trainees describe an environment where asking questions is actively encouraged. The focus on specific sectors gives trainees a clear sense of purpose and direction from the start.",
    interviewFocus: "Simmons interviews emphasise sector awareness — particularly in TMT, life sciences or financial services. Candidates should demonstrate knowledge of how regulation and technology intersect in their area of interest. The firm values genuine enthusiasm for its sector-focused model and the ability to explain why that appeals over a generalist approach.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.40–50 per year',
      tcSalaryNote: '~£50,000 – £55,000',
      nqSalaryNote: '~£107,000 – £115,000',
      deadlines: [
        {
          label: 'First Year Workshop',
          typically: 'Opens September · Closes October',
          applyUrl: 'https://www.simmons-simmons.com/en/careers/early-careers/first-year-workshop',
        },
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.simmons-simmons.com/en/careers/early-careers/vacation-scheme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.simmons-simmons.com/en/careers/early-careers/training-contracts',
        },
      ],
      applyUrl: 'https://www.simmons-simmons.com/en/careers/early-careers',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-teal-700 dark:text-teal-400',
    forageUrl: 'https://www.theforage.com/simulations/simmons-and-simmons',
  },

  // ─── US Firms — additional ────────────────────────────────────────────────

  {
    slug: 'white-case',
    name: 'White & Case LLP',
    shortName: 'White & Case',
    aliases: ['White & Case', 'White and Case', 'W&C'],
    tier: 'US Firms',
    website: 'https://www.whitecase.com',
    hq: 'New York',
    offices: ['London', 'New York', 'Washington DC', 'Los Angeles', 'Miami', 'Paris', 'Frankfurt', 'Düsseldorf', 'Hamburg', 'Brussels', 'Stockholm', 'Helsinki', 'Moscow', 'Singapore', 'Hong Kong', 'Tokyo', 'Abu Dhabi', 'Dubai', 'Doha', 'Riyadh', 'Johannesburg', 'São Paulo', 'Mexico City'],
    practiceAreas: ['M&A', 'International Arbitration', 'Capital Markets', 'Banking & Finance', 'Project Finance', 'Private Equity', 'Restructuring'],
    knownFor: "White & Case is one of the most globally diversified US firms and has one of the largest London offices of any American firm, with over 400 lawyers. The firm is a dominant force in international arbitration, project finance and emerging markets work — its London office regularly handles deals and disputes that span multiple continents and legal systems.",
    culture: "White & Case has a genuinely international culture reflecting its 44-office global network. Trainees consistently praise the early responsibility and the diversity of work — international secondments are common and encouraged. The London office feels more international than most competitors, and the firm's well-established trainee programme is one of the best-structured among US firms.",
    interviewFocus: "White & Case interviews test international commercial awareness and expect candidates to discuss cross-border deals or disputes. The firm values candidates who can explain why they want a global practice rather than a purely UK-focused one. Knowledge of international arbitration, project finance or emerging markets work is particularly valued.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.40–50 per year (London)',
      tcSalaryNote: '~£55,000 – £60,000',
      nqSalaryNote: '~£155,000 – £165,000',
      deadlines: [
        {
          label: 'First Year Insight Scheme',
          typically: 'Opens September · Closes November',
          applyUrl: 'https://www.whitecase.com/careers/london/students/insight-scheme',
        },
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.whitecase.com/careers/london/students/vacation-scheme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.whitecase.com/careers/london/students/training-contract',
        },
      ],
      applyUrl: 'https://www.whitecase.com/careers/london/students',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
    forageUrl: 'https://www.theforage.com/simulations/white-and-case',
  },

  {
    slug: 'milbank',
    name: 'Milbank LLP',
    shortName: 'Milbank',
    aliases: ['Milbank', 'Milbank LLP', 'Milbank, Tweed, Hadley & McCloy'],
    tier: 'US Firms',
    website: 'https://www.milbank.com',
    hq: 'New York',
    offices: ['London', 'New York', 'Washington DC', 'Los Angeles', 'Frankfurt', 'Munich', 'Paris', 'Tokyo', 'Hong Kong', 'Singapore', 'São Paulo', 'Seoul'],
    practiceAreas: ['Leveraged Finance', 'Capital Markets', 'M&A', 'Financial Restructuring', 'Project & Infrastructure Finance', 'Private Equity'],
    knownFor: "Milbank is one of the premier leveraged finance practices globally — the firm's London office routinely leads on the most complex European leveraged buyout financings. Milbank is the first call for many private equity sponsors when structuring acquisition finance and is consistently ranked at the top of leveraged finance league tables.",
    culture: "Milbank has a reputation as one of the more personable elite US firms, with a culture that balances intense deal work with genuine investment in associate development. The London office is small enough to be collegial but large enough to offer top-tier deal flow. Trainees report accessible partners and a willingness to teach rather than simply delegate.",
    interviewFocus: "Milbank interviews focus heavily on leveraged finance and capital markets knowledge. Candidates should understand LBO financing structures, the difference between high yield and leveraged loans, and be able to discuss recent European financing transactions. The firm values technical curiosity and an ability to explain complex financial structures clearly.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.8–12 per year (London)',
      tcSalaryNote: '~£60,000 – £65,000',
      nqSalaryNote: '~£180,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes December',
          applyUrl: 'https://www.milbank.com/en/careers/london-graduate-recruitment/vacation-scheme.html',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.milbank.com/en/careers/london-graduate-recruitment/training-contract.html',
        },
      ],
      applyUrl: 'https://www.milbank.com/en/careers/london-graduate-recruitment.html',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'debevoise-plimpton',
    name: 'Debevoise & Plimpton LLP',
    shortName: 'Debevoise',
    aliases: ['Debevoise', 'Debevoise & Plimpton', 'Debevoise and Plimpton', 'D&P'],
    tier: 'US Firms',
    website: 'https://www.debevoise.com',
    hq: 'New York',
    offices: ['London', 'New York', 'Washington DC', 'San Francisco', 'Paris', 'Frankfurt', 'Luxembourg', 'Hong Kong', 'Shanghai'],
    practiceAreas: ['Private Equity', 'M&A', 'Investment Management', 'Finance', 'Litigation & Investigations', 'Insurance'],
    knownFor: "Debevoise is one of the most prestigious private equity and fund formation practices in the world, with particular strength in investment management and fund structuring. The London office plays a central role in European PE transactions and is widely regarded as one of the most intellectually rigorous US firms operating in the City.",
    culture: "Debevoise is known for its collegial, non-hierarchical culture — often described as one of the friendliest elite US firms. The firm has a genuinely collaborative ethos where partners mentor juniors closely and turnover is notably low for a US firm. Trainees describe a supportive environment combined with genuinely world-class work.",
    interviewFocus: "Debevoise interviews probe knowledge of private equity fund structures, investment management regulation and the broader PE market. The firm values intellectual curiosity and cultural fit highly — candidates should expect a conversational interview style that tests whether you can discuss complex topics naturally rather than reciting prepared answers.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.6–10 per year (London)',
      tcSalaryNote: '~£60,000 – £65,000',
      nqSalaryNote: '~£180,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes December',
          applyUrl: 'https://www.debevoise.com/careers/london-trainees/vacation-scheme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.debevoise.com/careers/london-trainees/training-contract',
        },
      ],
      applyUrl: 'https://www.debevoise.com/careers/london-trainees',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'simpson-thacher',
    name: 'Simpson Thacher & Bartlett LLP',
    shortName: 'Simpson Thacher',
    aliases: ['Simpson Thacher', 'Simpson Thacher & Bartlett', 'STB'],
    tier: 'US Firms',
    website: 'https://www.stblaw.com',
    hq: 'New York',
    offices: ['London', 'New York', 'Washington DC', 'Los Angeles', 'Houston', 'São Paulo', 'Tokyo', 'Hong Kong', 'Beijing'],
    practiceAreas: ['M&A', 'Private Equity', 'Capital Markets', 'Banking & Finance', 'Tax', 'Litigation'],
    knownFor: "Simpson Thacher is one of the pre-eminent M&A and private equity firms globally, consistently advising on the largest LBOs and public company acquisitions worldwide. The London office is a critical hub for European PE work and the firm has long-standing relationships with virtually every major private equity sponsor.",
    culture: "Simpson Thacher has a highly professional, meritocratic culture where outstanding work is expected and rewarded with exceptional deal exposure and compensation. The London office is deliberately small and selective, creating a team environment where trainees work directly alongside partners on headline transactions. The culture is intense but respectful.",
    interviewFocus: "Simpson Thacher interviews demand deep M&A and PE commercial awareness. Candidates must be able to discuss recent major buyouts, understand the mechanics of an LBO, and articulate why the sponsor-side advisory model appeals. The firm expects genuine passion for private equity deal work — not generic interest in corporate law.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.6–10 per year (London)',
      tcSalaryNote: '~£60,000 – £65,000',
      nqSalaryNote: '~£185,000+',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes December',
          applyUrl: 'https://www.stblaw.com/careers/london/vacation-scheme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.stblaw.com/careers/london/training-contract',
        },
      ],
      applyUrl: 'https://www.stblaw.com/careers/london',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'willkie-farr',
    name: 'Willkie Farr & Gallagher LLP',
    shortName: 'Willkie',
    aliases: ['Willkie', 'Willkie Farr', 'Willkie Farr & Gallagher', 'Willkie Farr and Gallagher'],
    tier: 'US Firms',
    website: 'https://www.willkie.com',
    hq: 'New York',
    offices: ['London', 'New York', 'Washington DC', 'Houston', 'San Francisco', 'Chicago', 'Paris', 'Frankfurt', 'Brussels', 'Milan', 'Rome'],
    practiceAreas: ['M&A', 'Private Equity', 'Asset Management', 'Restructuring & Insolvency', 'Litigation', 'Capital Markets'],
    knownFor: "Willkie is a top-tier M&A and private equity firm with a rapidly growing London office that has become a serious competitor to the established US names in the City. The firm is particularly strong in cross-border M&A, fund formation and restructuring — and has made a series of high-profile lateral hires to bolster its London presence.",
    culture: "Willkie London has a dynamic, growth-oriented culture that reflects the firm's ambitious expansion strategy. Trainees benefit from being part of a rapidly scaling office where opportunities arise frequently and hierarchies are flat by necessity. The firm is known for giving junior lawyers genuine deal responsibility early.",
    interviewFocus: "Willkie interviews test commercial awareness around M&A and PE markets, with particular emphasis on cross-border deals. The firm values candidates who can articulate why they want to join a firm in growth mode rather than an established incumbent — demonstrating entrepreneurial thinking alongside strong legal aptitude.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.6–10 per year (London)',
      tcSalaryNote: '~£60,000 – £65,000',
      nqSalaryNote: '~£175,000 – £180,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes December',
          applyUrl: 'https://www.willkie.com/careers/london/vacation-scheme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens November · Closes January',
          applyUrl: 'https://www.willkie.com/careers/london/training-contract',
        },
      ],
      applyUrl: 'https://www.willkie.com/careers/london',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'sidley-austin',
    name: 'Sidley Austin LLP',
    shortName: 'Sidley',
    aliases: ['Sidley', 'Sidley Austin', 'Sidley Austin LLP'],
    tier: 'US Firms',
    website: 'https://www.sidley.com',
    hq: 'Chicago',
    offices: ['London', 'Chicago', 'New York', 'Washington DC', 'Los Angeles', 'San Francisco', 'Dallas', 'Houston', 'Munich', 'Brussels', 'Singapore', 'Hong Kong', 'Tokyo', 'Shanghai', 'Beijing'],
    practiceAreas: ['Capital Markets', 'M&A', 'Insurance', 'Life Sciences', 'Finance', 'Litigation', 'IP'],
    knownFor: "Sidley Austin is one of the largest US firms globally with a diversified practice that spans financial services, insurance, life sciences and technology. The London office is particularly known for its insurance and financial regulatory practices, and has a growing transactional capability in capital markets and M&A.",
    culture: "Sidley has a Midwestern professionalism that distinguishes it from many New York-headquartered competitors — the culture is demanding but less aggressive. The London office is large enough to offer genuine breadth of experience across seats, and trainees note strong training infrastructure and mentoring programmes.",
    interviewFocus: "Sidley interviews cover broad commercial awareness with particular interest in financial services regulation, insurance and life sciences. The firm values well-rounded candidates who can demonstrate interest in its specialist strengths — particularly the insurance and regulatory practices that differentiate Sidley in the London market.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.10–15 per year (London)',
      tcSalaryNote: '~£55,000 – £60,000',
      nqSalaryNote: '~£165,000 – £175,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.sidley.com/en/careers/london/vacation-scheme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.sidley.com/en/careers/london/training-contract',
        },
      ],
      applyUrl: 'https://www.sidley.com/en/careers/london',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'goodwin-procter',
    name: 'Goodwin Procter LLP',
    shortName: 'Goodwin',
    aliases: ['Goodwin', 'Goodwin Procter', 'Goodwin Procter LLP'],
    tier: 'US Firms',
    website: 'https://www.goodwinlaw.com',
    hq: 'Boston',
    offices: ['London', 'Boston', 'New York', 'Washington DC', 'San Francisco', 'Silicon Valley', 'Los Angeles', 'Philadelphia', 'Paris', 'Frankfurt', 'Luxembourg', 'Hong Kong', 'Singapore'],
    practiceAreas: ['Private Equity', 'Technology & Life Sciences', 'Financial Services', 'Real Estate', 'Debt Finance', 'Litigation'],
    knownFor: "Goodwin is one of the fastest-growing elite US firms in London, with particular strength in private equity, technology, life sciences and financial services. The firm has a distinct focus on the innovation economy — advising venture capital funds, growth equity sponsors, and high-growth technology companies alongside traditional PE sponsors.",
    culture: "Goodwin has an entrepreneurial, forward-thinking culture that reflects its focus on innovation-economy clients. The London office has grown rapidly and has a start-up energy combined with institutional rigour. Trainees describe a collaborative environment where creativity and initiative are genuinely valued, and the firm invests heavily in technology-enhanced working.",
    interviewFocus: "Goodwin interviews test knowledge of private equity, venture capital and the technology/life sciences sectors. Candidates should be able to discuss recent PE deals, understand the VC funding cycle, and explain why Goodwin's innovation-economy focus appeals. The firm values candidates who are genuinely interested in technology and its intersection with law.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.8–12 per year (London)',
      tcSalaryNote: '~£55,000 – £60,000',
      nqSalaryNote: '~£165,000 – £175,000',
      deadlines: [
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.goodwinlaw.com/en/careers/london/vacation-scheme',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.goodwinlaw.com/en/careers/london/training-contract',
        },
      ],
      applyUrl: 'https://www.goodwinlaw.com/en/careers/london',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },

  {
    slug: 'dechert',
    name: 'Dechert LLP',
    shortName: 'Dechert',
    aliases: ['Dechert', 'Dechert LLP'],
    tier: 'US Firms',
    website: 'https://www.dechert.com',
    hq: 'Philadelphia',
    offices: ['London', 'Philadelphia', 'New York', 'Washington DC', 'Boston', 'Charlotte', 'Los Angeles', 'San Francisco', 'Austin', 'Paris', 'Frankfurt', 'Munich', 'Brussels', 'Luxembourg', 'Dublin', 'Hong Kong', 'Singapore', 'Beijing'],
    practiceAreas: ['Financial Services', 'Asset Management', 'Private Equity', 'Litigation & Investigations', 'Finance', 'Corporate & Securities'],
    knownFor: "Dechert is one of the leading global firms for financial services and asset management work, with a London office that is widely regarded as having one of the strongest investment funds practices in the City. The firm also has an exceptionally strong white-collar investigations practice that regularly handles high-profile, cross-border regulatory matters.",
    culture: "Dechert London has a specialist, expert-driven culture where depth of knowledge is highly valued. The office is large enough to handle major mandates but maintains a team-oriented feel. Trainees benefit from working with recognised market leaders in niche areas and develop genuine technical expertise during their training contract.",
    interviewFocus: "Dechert interviews focus on financial services knowledge, particularly asset management regulation and fund structures. Candidates interested in investigations should be prepared to discuss recent enforcement actions and regulatory developments. The firm values candidates who demonstrate genuine interest in its core specialisms rather than broad generalist ambitions.",
    trainingContract: {
      seats: 4,
      intakeSizeNote: 'c.10–15 per year (London)',
      tcSalaryNote: '~£55,000 – £60,000',
      nqSalaryNote: '~£165,000 – £175,000',
      deadlines: [
        {
          label: 'Insight Day (First Year)',
          typically: 'Opens September · Closes November',
          applyUrl: 'https://www.dechert.com/about/careers/london-graduate-recruitment/insight-day.html',
        },
        {
          label: 'Summer Vacation Scheme',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.dechert.com/about/careers/london-graduate-recruitment/vacation-scheme.html',
        },
        {
          label: 'Training Contract (direct)',
          typically: 'Opens October · Closes January',
          applyUrl: 'https://www.dechert.com/about/careers/london-graduate-recruitment/training-contract.html',
        },
      ],
      applyUrl: 'https://www.dechert.com/about/careers/london-graduate-recruitment.html',
      lastVerified: '2026-03-03',
    },
    accentColor: 'text-amber-700 dark:text-amber-400',
  },
];

// ── Lookup maps — built once at module load, O(1) thereafter ─────────────────

const _bySlug = new Map<string, FirmProfile>(
  FIRMS.map((f) => [f.slug, f])
);

const _byAlias = new Map<string, string>(); // alias (lowercased) → slug

for (const firm of FIRMS) {
  _byAlias.set(firm.name.toLowerCase(), firm.slug);
  for (const alias of firm.aliases) {
    _byAlias.set(alias.toLowerCase(), firm.slug);
  }
}

export function getFirmBySlug(slug: string): FirmProfile | undefined {
  const firm = _bySlug.get(slug);
  if (!firm) return undefined;
  // Merge assessment data — kept separate to avoid cluttering firm entries
  return { ...firm, assessments: FIRM_ASSESSMENTS[slug] ?? [] };
}

export function firmNameToSlug(name: string): string | undefined {
  return _byAlias.get(name.toLowerCase());
}
