/**
 * Diversity, access, and work experience schemes by firm slug.
 *
 * CREDIBILITY RULE: All entries are manually researched and verified.
 * Schemes change regularly — update `lastVerified` in firms-data.ts and
 * check each firm's access/diversity pages at the start of each cycle.
 *
 * Sources: firm websites, PRIME commitment website (primecommitment.co.uk),
 * Aspiring Solicitors, and Rare Recruitment.
 *
 * Last full audit: 2026-03-15 (55 firms)
 */

import type { DiversityScheme } from './types';

export const DIVERSITY_SCHEMES: Record<string, DiversityScheme[]> = {

  // ─── Magic Circle ───────────────────────────────────────────────────────────

  'allen-overy-shearman': [
    {
      name: 'Smart Start Programme',
      type: 'socioeconomic',
      eligibility:
        'For Year 12 students from lower socioeconomic backgrounds. Available as a five-day in-person week at the London office (Smart Start Week) or as eight virtual webinars (Smart Applications). Students must attend a state-funded school and meet at least one criterion: first-generation university attendee, former free school meals recipient, care experience, refugee/asylum seeker status, armed forces family, or attended a school with below-average university progression. Paid (£400–500 per week).',
      typically: 'Applications open January · closes February · programme runs June–July',
      applyUrl: 'https://earlycareersuk.aoshearman.com/opportunities/smart-start-programme',
    },
    {
      name: 'Black Student Lawyer Programme',
      type: 'ethnicity',
      eligibility:
        'For first-year undergraduates (or second year of a 4-year degree) who identify as Black or of Black mixed heritage. One-week paid placement (£500/week) at the London office with mentoring, work shadowing, and early careers support. Minimum AAB at A-level and on track for a 2:1. Applications open January 5 · closes March 2 · placement runs June 15–19 2026.',
      typically: 'Applications open January · closes March · placement runs June',
      applyUrl: 'https://earlycareersuk.aoshearman.com/opportunities/black-student-lawyer-programme',
    },
    {
      name: 'Step into Law',
      type: 'work-experience',
      eligibility:
        'For Year 13 students considering a career in commercial law. Three in-person touchpoints plus virtual follow-up covering skills workshops, commercial awareness and application support. Minimum predicted grades AAB.',
      typically: 'Applications open January · closes February',
      applyUrl: 'https://earlycareersuk.aoshearman.com/opportunities/step-into-law-scheme',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students attending state schools who meet socioeconomic criteria (e.g. household income below £35,000, eligible for free school meals, or first in family to attend university). Provides two weeks of paid work experience.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'clifford-chance': [
    {
      name: 'ACCESS Programme',
      type: 'socioeconomic',
      eligibility:
        'For Year 12 students (England/Wales) who meet at least two socioeconomic criteria: attended state-funded school since age 11, first-generation university student, received free school meals/Pupil Premium/EMA, attended school with below-average A-level scores, current or former local authority care, current or former carer, refugee or asylum seeker, or parent in lower socioeconomic occupation at age 14 (care experience qualifies independently). 18-month programme including paid virtual work experience (£400/week) and paid in-person placement (£500/week), one-to-one tutoring, and partnership with Aspiring Solicitors covering travel, accommodation, professional attire and IT equipment.',
      typically: 'Applications open September · closes February · Assessment April',
      applyUrl: 'https://jobs.cliffordchance.com/early-careers',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students attending state schools who meet socioeconomic criteria. Provides two weeks of paid work experience at the firm.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'freshfields': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students attending state schools who meet socioeconomic criteria. Provides two weeks of paid work experience.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'linklaters': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria. Two weeks of paid work experience at the firm.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'slaughter-and-may': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic eligibility criteria. Two weeks of paid work experience.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  // ─── Silver Circle ───────────────────────────────────────────────────────────

  'herbert-smith-freehills': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria. Two weeks of paid work experience.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'hogan-lovells': [
    {
      name: 'Launch Pad — First Year Insight Scheme',
      type: 'socioeconomic',
      eligibility:
        'First-year insight scheme for underrepresented students. Hogan Lovells partners with Aspiring Solicitors, the Sutton Trust, Rare Recruitment, Social Mobility Business Partnership, and City Century to widen access. Check the early careers site for current eligibility criteria and dates.',
      typically: 'Check ukearlycareers.hoganlovells.com for current cycle',
      applyUrl: 'https://ukearlycareers.hoganlovells.com',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 state school students meeting socioeconomic criteria. Two weeks of paid work experience.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'ashurst': [
    {
      name: 'Access Ashurst',
      type: 'socioeconomic',
      eligibility:
        'For Year 12 students from low socioeconomic backgrounds. Provides two weeks of paid work experience in the summer following Year 12, skills workshops, and ongoing mentor support through final year of studies.',
      typically: 'Applications open October · placements run summer',
      applyUrl: 'https://www.ashurst.com/en/careers/students-and-graduates/diversity-and-inclusion/',
    },
    {
      name: 'Access Law',
      type: 'socioeconomic',
      eligibility:
        'Virtual programme for penultimate and final year secondary school students from low socioeconomic backgrounds across the UK. Develops knowledge of legal careers and professional skills.',
      typically: 'Applications open August',
      applyUrl: 'https://www.ashurst.com/en/careers/students-and-graduates/diversity-and-inclusion/',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic eligibility criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'travers-smith': [
    {
      name: 'Pathways to Law',
      type: 'socioeconomic',
      eligibility:
        'For university students from state school backgrounds. Provides mentoring, training, and ongoing support throughout undergraduate studies.',
      typically: 'Check traverssmith.com/difference/widening-access for current cycle',
      applyUrl: 'https://www.traverssmith.com/difference/widening-access/',
    },
    {
      name: 'City Horizons',
      type: 'socioeconomic',
      eligibility:
        'For university students from state school backgrounds. Provides mentoring, training, and ongoing support throughout undergraduate studies. Runs alongside the Pathways to Law partnership.',
      typically: 'Check traverssmith.com/difference/widening-access for current cycle',
      applyUrl: 'https://www.traverssmith.com/difference/widening-access/',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'macfarlanes': [
    {
      name: 'Macfarlanes Training Scholarship',
      type: 'socioeconomic',
      eligibility:
        'For first-year LLB students at Brunel University London who are from underrepresented backgrounds. Three-year programme delivered in partnership with Brunel Law School. Applications reopen in early 2026.',
      typically: 'Applications typically open in early calendar year · check macfarlanes.com/join-us/early-careers',
      applyUrl: 'https://www.macfarlanes.com/join-us/early-careers/',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  // ─── National ────────────────────────────────────────────────────────────────

  'eversheds-sutherland': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria. Two weeks of paid work experience.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'cms': [
    {
      name: 'CMS Law Scholarships',
      type: 'socioeconomic',
      eligibility:
        'For Year 12 students (England/Wales) or Year 13 (Northern Ireland) at state-funded, non-fee-paying schools whose parents and grandparents did not attend university, plus at least one further criterion (free school meals eligibility, attendance at a school where 20%+ pupils are FSM eligible, care experience, refugee/asylum seeker status, or POLAR4 quintile 1 area). Approximately 10 scholarships awarded per cycle. Provides up to £3,000 per year through the degree, a trainee buddy, paid first-year work experience (£450), and a fast-track to assessment centres and training contracts.',
      typically: 'Applications for 2026 open later in 2025/2026 — register interest at cmsemergingtalent.com',
      applyUrl: 'https://cmsemergingtalent.com/law-scholarships/',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'addleshaw-goddard': [
    {
      name: 'Aspiring Solicitors Smart Legal Commitment',
      type: 'socioeconomic',
      eligibility:
        'Addleshaw Goddard is a signatory of the Aspiring Solicitors Smart Legal Commitment, providing financial assistance to aspiring lawyers from disadvantaged backgrounds to cover costs of accommodation, technology, and professional clothing when attending work experience or assessment events.',
      typically: 'Rolling — through Aspiring Solicitors',
      applyUrl: 'https://www.aspiringsolicitors.co.uk',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'pinsent-masons': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria. Two weeks of paid work experience.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  // ─── US Firms ─────────────────────────────────────────────────────────────

  'latham-watkins': [
    {
      name: 'Aspiring Solicitors Partnership',
      type: 'socioeconomic',
      eligibility:
        'Latham & Watkins works with Aspiring Solicitors to offer work experience, mentoring, and networking to students from underrepresented backgrounds.',
      typically: 'Rolling applications via Aspiring Solicitors — check aspiringsolicitors.com',
      applyUrl: 'https://www.aspiringsolicitors.co.uk',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'kirkland-ellis': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'skadden': [
    {
      name: 'JUST Program (Justice First Skadden Trainee)',
      type: 'work-experience',
      eligibility:
        'A unique trainee programme launched in 2020 in partnership with the Legal Education Foundation\'s Justice First Fellowship, for prospective trainees with a strong interest in social welfare law. Candidates are recruited through the LEF Justice First Fellowship pipeline. Contact graduate.recruitment.uk@skadden.com for details.',
      typically: 'Check skadden.com/careers for current cycle details',
      applyUrl: 'https://www.skadden.com/careers/attorneys/law-students-and-graduates/united-kingdom',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'weil-gotshal-manges': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'gibson-dunn': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'fried-frank': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'baker-mckenzie': [
    {
      name: 'BEGINNINGS at Baker McKenzie',
      type: 'socioeconomic',
      eligibility:
        'For Year 12 students (England/Wales), S5 (Scotland), or Lower Sixth (Northern Ireland) at state-funded, non-fee-paying schools meeting at least one socioeconomic criterion: local authority care experience, free school meals eligibility, carer status, refugee or asylum seeker background, household with routine/manual occupations, attendance at underperforming schools, or first-generation university eligibility. Must have grade 4+ in English and Maths GCSE. 18-month programme (20 participants per year): virtual skills training, networking events, and a three-day paid summer work experience placement in London. Mentoring and university application support throughout.',
      typically: 'Applications open December 1 · closes January 31 · work experience August',
      applyUrl: 'https://uk-graduates.bakermckenzie.com/beginnings',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'dla-piper': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'sidley-austin': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'white-case': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'goodwin-procter': [
    {
      name: 'Go for Law Scholarship',
      type: 'socioeconomic',
      eligibility:
        'For Year 13 students at state (non-fee paying) schools who are applying to study law at a UK university and meet at least one criterion: first-generation university attendee, eligible for free school meals (current or previous), attendance at a school where 20%+ of pupils are FSM eligible, care experience, refugee or asylum seeker status, or current or former carer. Three-year programme providing £3,750 per year scholarship, career guidance, work experience, mentoring, and a 12-month London Travelcard during the SQE LLM study year.',
      typically: 'Applications closed for 2026 cycle · reopens Summer 2026',
      applyUrl: 'https://www.goodwinlaw.com/en/careers-pages/early-careers-in-the-united-kingdom',
    },
  ],

  // ─── Boutique ────────────────────────────────────────────────────────────────

  'mishcon-de-reya': [
    {
      name: '10,000 Black Interns Partnership',
      type: 'ethnicity',
      eligibility:
        'Mishcon de Reya participates in the 10,000 Black Interns programme, providing paid work experience placements for Black students. Applications via the 10,000 Black Interns platform.',
      typically: 'Applications via 10000blackinterns.com — check current cycle',
      applyUrl: 'https://www.10000blackinterns.com',
    },
    {
      name: 'Sutton Trust Work Experience',
      type: 'socioeconomic',
      eligibility:
        'Mishcon de Reya partners with the Sutton Trust to provide work experience for students from socially mobile backgrounds.',
      typically: 'Via Sutton Trust — check suttontrust.com for current programmes',
      applyUrl: 'https://www.suttontrust.com',
    },
  ],

  'bird-bird': [
    {
      name: 'Early Bird Scholarship',
      type: 'socioeconomic',
      eligibility:
        'Mentoring and support programme to equip aspiring solicitors with skills for their career. Financial assistance available to ensure finances are not a barrier to participation. Full eligibility details on application. Bird & Bird also uses the Contextual Recruitment System and blind application screening, and partners with 10,000 Black Interns.',
      typically: 'Applications open April 6 · closes July 30 · commences September 2026',
      applyUrl: 'https://www.twobirds.com/en/careers/united-kingdom/early-careers',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  // ─── International ───────────────────────────────────────────────────────────

  'norton-rose-fulbright': [
    {
      name: 'Aspiring Black Lawyers Insight Day',
      type: 'ethnicity',
      eligibility:
        'Dedicated insight day for Black aspiring lawyers. Provides an introduction to Norton Rose Fulbright and the commercial law sector. Applications via the graduates portal.',
      typically: 'Check nortonrosefulbright.com/en-gb/graduates for current cycle',
      applyUrl: 'https://www.nortonrosefulbright.com/en-gb/graduates',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'bclp': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'clyde-co': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'cooley': [
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For Year 12 students from state schools meeting socioeconomic criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  // ─── No verified schemes ──────────────────────────────────────────────────
  // These firms had no named diversity/access schemes found on their current
  // careers pages. Entries omitted (getDiversitySchemes returns [] by default).
  //
  // davis-polk, sullivan-cromwell, cleary-gottlieb, ropes-gray, jones-day,
  // mayer-brown, quinn-emanuel, paul-weiss, proskauer, stewarts, bristows,
  // simmons-simmons, milbank, debevoise-plimpton, simpson-thacher, willkie-farr,
  // dechert, covington-burling, reed-smith, taylor-wessing,
  // watson-farley-williams, kennedys, morrison-foerster, winston-strawn

};

/**
 * Returns diversity schemes for a given firm slug, or an empty array.
 */
export function getDiversitySchemes(slug: string): DiversityScheme[] {
  return DIVERSITY_SCHEMES[slug] ?? [];
}
