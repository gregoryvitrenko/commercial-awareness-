/**
 * Diversity, access, and work experience schemes by firm slug.
 *
 * CREDIBILITY RULE: All entries are manually researched and verified.
 * Schemes change regularly — update `lastVerified` in firms-data.ts and
 * check each firm's access/diversity pages at the start of each cycle.
 *
 * Sources: firm websites, PRIME commitment website (primecommitment.co.uk),
 * Aspiring Solicitors, and Rare Recruitment.
 */

import type { DiversityScheme } from './types';

export const DIVERSITY_SCHEMES: Record<string, DiversityScheme[]> = {

  // ─── Magic Circle ───────────────────────────────────────────────────────────

  'allen-overy-shearman': [
    {
      name: 'Access A&O Shearman',
      type: 'socioeconomic',
      eligibility:
        'Open to first-year undergraduates (or second-year on a four-year course) from underrepresented socioeconomic backgrounds. Provides a week of work experience, mentoring, and insight into City legal careers.',
      typically: 'Applications open October · closes December',
      applyUrl: 'https://earlycareersuk.aoshearman.com/our-programmes',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For year 12 students attending state schools who meet socioeconomic criteria (e.g. household income below £35,000, eligible for free school meals, or first in family to attend university). Provides two weeks of paid work experience.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'clifford-chance': [
    {
      name: 'CC Bursary Scheme',
      type: 'socioeconomic',
      eligibility:
        'Financial bursary of up to £5,000 per year for undergraduates from households with income below a set threshold, combined with guaranteed vacation scheme interview and mentoring support throughout university.',
      typically: 'Applications open September · closes November (first year of university)',
      applyUrl: 'https://jobs.cliffordchance.com/access',
    },
    {
      name: 'CC Spark',
      type: 'work-experience',
      eligibility:
        'Insight programme for year 12 students from state schools, offering a week of immersive work experience across practice groups and business services. Open to students considering a legal career.',
      typically: 'Applications open November · placements run Easter and summer',
      applyUrl: 'https://jobs.cliffordchance.com/access',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For year 12 students attending state schools who meet socioeconomic criteria. Provides two weeks of paid work experience at the firm.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'freshfields': [
    {
      name: 'Freshfields Scholars Programme',
      type: 'socioeconomic',
      eligibility:
        'Targeted at undergraduates from households with income below £35,000 attending any UK university. Provides a £3,000 bursary, a guaranteed vacation scheme place, and a year-round mentor from the firm.',
      typically: 'Applications open October · closes January (first year of university)',
      applyUrl: 'https://www.freshfields.com/en-gb/about-us/responsible-business/diversity-and-inclusion/social-mobility/',
    },
    {
      name: 'Black Heritage Vacation Scheme',
      type: 'ethnicity',
      eligibility:
        'Dedicated vacation scheme places for students who identify as Black or of Black heritage. Full vacation scheme experience with targeted mentoring and networking.',
      typically: 'Applications open October · closes January',
      applyUrl: 'https://www.freshfields.com/en/your-career/united-kingdom/early-careers',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For year 12 students attending state schools who meet socioeconomic criteria. Provides two weeks of paid work experience.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'linklaters': [
    {
      name: 'Pathfinder Programme',
      type: 'socioeconomic',
      eligibility:
        'For first-year undergraduates (or penultimate year on a four-year course) who would be the first in their immediate family to attend university. Includes a week of work experience, mentoring, and financial support.',
      typically: 'Applications open October · closes December',
      applyUrl: 'https://careers.linklaters.com/en/early-careers/university-and-graduate-opportunities/pathfinder',
    },
    {
      name: 'Black Talent Summer School',
      type: 'ethnicity',
      eligibility:
        'Aimed at first-year undergraduates who identify as Black, providing three days of immersive sessions on commercial law, networking with partners and associates, and a fast-track to the vacation scheme.',
      typically: 'Applications open October · event held spring term',
      applyUrl: 'https://www.linklaters.com/en/careers/early-careers',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For year 12 students from state schools meeting socioeconomic criteria. Two weeks of paid work experience at the firm.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'slaughter-and-may': [
    {
      name: 'Diversity Work Experience',
      type: 'socioeconomic',
      eligibility:
        'Open to penultimate-year undergraduates from underrepresented backgrounds, including those from lower socioeconomic backgrounds, ethnic minorities, and students with disabilities. Includes a week at the firm with guaranteed vacation scheme consideration.',
      typically: 'Applications open October · closes December',
      applyUrl: 'https://www.slaughterandmay.com/careers/early-careers/diversity-and-inclusion/',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For year 12 students from state schools meeting socioeconomic eligibility criteria. Two weeks of paid work experience.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  // ─── Silver Circle ───────────────────────────────────────────────────────────

  'herbert-smith-freehills': [
    {
      name: 'HSF Horizons Programme',
      type: 'socioeconomic',
      eligibility:
        'Targeted at first-year undergraduates from state schools in lower household income brackets. Provides a week of work experience at HSF, a bursary of up to £3,000 per year, and a guaranteed vacation scheme interview.',
      typically: 'Applications open October · closes January',
      applyUrl: 'https://www.herbertsmithfreehills.com/careers/students/diversity',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For year 12 students from state schools meeting socioeconomic criteria. Two weeks of paid work experience.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'hogan-lovells': [
    {
      name: 'Ignite Programme',
      type: 'socioeconomic',
      eligibility:
        'Open to first-year undergraduates from households with income below £35,000 or who attended a state school with below-average A-level attainment. Offers a week of work experience and mentoring support.',
      typically: 'Applications open October · closes January',
      applyUrl: 'https://ukearlycareers.hoganlovells.com/hlinclusion',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For year 12 state school students meeting socioeconomic criteria. Two weeks of paid work experience.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'ashurst': [
    {
      name: 'Aspiring Solicitors Partnership',
      type: 'socioeconomic',
      eligibility:
        'Ashurst works with Aspiring Solicitors to provide work experience and networking opportunities for students from underrepresented backgrounds, including those from lower socioeconomic groups and ethnic minorities.',
      typically: 'Rolling applications via Aspiring Solicitors — check aspiringsolicitors.com',
      applyUrl: 'https://www.aspiringsolicitors.co.uk',
    },
    {
      name: 'PRIME Work Experience',
      type: 'work-experience',
      eligibility:
        'For year 12 students from state schools meeting socioeconomic eligibility criteria.',
      typically: 'Applications typically open January · placements run June–July',
      applyUrl: 'https://www.primecommitment.co.uk',
    },
  ],

  'travers-smith': [
    {
      name: 'Diversity Vacation Scheme',
      type: 'socioeconomic',
      eligibility:
        'Reserved vacation scheme places for students from underrepresented backgrounds including those from state schools, lower household incomes, or ethnic minority groups.',
      typically: 'Applications open September · closes October',
      applyUrl: 'https://www.traverssmith.com/difference/widening-access/',
    },
  ],

  // ─── International ───────────────────────────────────────────────────────────

  'linklaters-spain': [], // placeholder — no separate slug

  // ─── US Firms ────────────────────────────────────────────────────────────────

  'kirkland-ellis': [
    {
      name: 'Kirkland Diversity Fellowship',
      type: 'ethnicity',
      eligibility:
        'US-focused programme for law students from underrepresented groups (primarily in the US market). London office opportunities are available via the firm\'s diversity recruitment pipeline — check the London careers page.',
      typically: 'Check kirkland.com/careers for current cycle',
      applyUrl: 'https://www.kirkland.com/sitecontent.cfm?pagename=careers_diversity',
    },
  ],

  'latham-watkins': [
    {
      name: 'Aspiring Solicitors Partnership',
      type: 'socioeconomic',
      eligibility:
        'Latham & Watkins works with Aspiring Solicitors to offer work experience, mentoring, and networking to students from underrepresented backgrounds.',
      typically: 'Rolling applications via Aspiring Solicitors — check aspiringsolicitors.com',
      applyUrl: 'https://www.aspiringsolicitors.co.uk',
    },
  ],
};

/**
 * Returns diversity schemes for a given firm slug, or an empty array.
 */
export function getDiversitySchemes(slug: string): DiversityScheme[] {
  return DIVERSITY_SCHEMES[slug] ?? [];
}
