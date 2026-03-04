/**
 * Online assessment data for each firm.
 * Sourced from firm graduate recruitment pages and public accounts.
 * Verify each recruitment cycle — firms change their assessment providers.
 * Last verified: March 2026.
 */

import type { FirmAssessment } from './types';

// Keyed by firm slug
export const FIRM_ASSESSMENTS: Record<string, FirmAssessment[]> = {

  // ─── Magic Circle ────────────────────────────────────────────────────────────

  'allen-overy-shearman': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['SJT', 'Game-based Assessment'],
      notes: 'Uses Arctic Shores game-based assessment at application stage — assesses cognitive and behavioural traits. No Watson Glaser.',
    },
  ],

  'clifford-chance': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['Watson Glaser', 'Verbal Reasoning', 'Numerical Reasoning'],
      notes: 'Online assessment suite completed after initial application shortlist.',
    },
  ],

  'freshfields': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['Watson Glaser', 'Verbal Reasoning'],
      notes: 'Watson Glaser used as an early screening stage before interview invitation.',
    },
  ],

  'linklaters': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['Watson Glaser', 'Verbal Reasoning'],
      notes: 'Online assessments completed as part of the application process.',
    },
  ],

  'slaughter-and-may': [
    {
      programme: 'Vacation Placement / Training Contract',
      tests: [],
      notes: 'Slaughter and May does not typically use online aptitude tests. Selection is based on application form and assessment day performance.',
    },
  ],

  // ─── Silver Circle ────────────────────────────────────────────────────────────

  'herbert-smith-freehills': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['SJT', 'Verbal Reasoning'],
      notes: 'Uses a Capp situational judgement questionnaire as part of online application screening.',
    },
  ],

  'ashurst': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['Watson Glaser', 'Numerical Reasoning'],
      notes: 'Online assessments completed after initial application review.',
    },
  ],

  'travers-smith': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'Travers Smith does not typically use standardised online aptitude tests. Focus is on application form quality and interviews.',
    },
  ],

  'macfarlanes': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No formal online aptitude test. Macfarlanes assesses critical thinking through the interview process directly.',
    },
  ],

  // ─── International ────────────────────────────────────────────────────────────

  'hogan-lovells': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['Watson Glaser', 'Verbal Reasoning'],
      notes: 'Online assessment stage completed shortly after application submission.',
    },
  ],

  'norton-rose-fulbright': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['Watson Glaser'],
      notes: 'Watson Glaser used as a screening tool at the application stage.',
    },
  ],

  'bird-bird': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['SJT'],
      notes: 'Situational judgement questionnaire as part of the online application.',
    },
  ],

  'simmons-simmons': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['Watson Glaser', 'SJT'],
      notes: 'Uses both a critical thinking assessment and a values-based situational judgement questionnaire.',
    },
  ],

  // ─── US Firms ─────────────────────────────────────────────────────────────────

  'latham-watkins': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['Watson Glaser'],
      notes: 'Watson Glaser completed as part of the initial application screening.',
    },
  ],

  'kirkland-ellis': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: [],
      notes: 'No formal online aptitude test. Kirkland uses a written exercise at assessment centre stage.',
    },
  ],

  'davis-polk': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No formal online aptitude test in the Davis Polk London process.',
    },
  ],

  'skadden': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No online aptitude test. Selection is based on application form and a written exercise at assessment stage.',
    },
  ],

  'sullivan-cromwell': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No formal online aptitude test. Sullivan & Cromwell is known for a highly selective application review without standardised testing.',
    },
  ],

  'weil-gotshal-manges': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No standard online aptitude test known to be used for the London training contract.',
    },
  ],

  'gibson-dunn': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No formal online aptitude test in the Gibson Dunn London process.',
    },
  ],

  'cleary-gottlieb': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No standard online aptitude test. Cleary Gottlieb emphasises academic excellence and application quality.',
    },
  ],

  'fried-frank': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No standard online aptitude test for the London training contract.',
    },
  ],

  'ropes-gray': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No standard online aptitude test known for the London office.',
    },
  ],

  'paul-weiss': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No formal online aptitude test in the Paul Weiss London process.',
    },
  ],

  'proskauer': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No standard online aptitude test known for the London training contract.',
    },
  ],

  'white-case': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['Watson Glaser'],
      notes: 'Watson Glaser completed as part of the online application stage.',
    },
  ],

  'milbank': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No standard online aptitude test for Milbank London.',
    },
  ],

  'debevoise-plimpton': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No formal online aptitude test in the Debevoise & Plimpton London process.',
    },
  ],

  'simpson-thacher': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No standard online aptitude test for Simpson Thacher London.',
    },
  ],

  'willkie-farr': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No formal online aptitude test in the Willkie Farr London process.',
    },
  ],

  'sidley-austin': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['Watson Glaser', 'Verbal Reasoning'],
      notes: 'Online assessments at application stage.',
    },
  ],

  'goodwin-procter': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No standard online aptitude test known for Goodwin London.',
    },
  ],

  'dechert': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No formal online aptitude test in the Dechert London process.',
    },
  ],

  // ─── Boutique ─────────────────────────────────────────────────────────────────

  'quinn-emanuel': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No formal online aptitude test. Quinn Emanuel is highly selective based on application quality and interview performance.',
    },
  ],

  'mishcon-de-reya': [
    {
      programme: 'Vacation Scheme / Training Contract',
      tests: ['Watson Glaser'],
      notes: 'Watson Glaser used at application stage as part of online screening.',
    },
  ],

  'stewarts': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No formal online aptitude test for Stewarts.',
    },
  ],

  'bristows': [
    {
      programme: 'All programmes',
      tests: [],
      notes: 'No formal online aptitude test in the Bristows process.',
    },
  ],
};
