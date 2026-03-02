export type TopicCategory =
  | 'M&A'
  | 'Capital Markets'
  | 'Energy & Tech'
  | 'Regulation'
  | 'Disputes'
  | 'International';

export interface Story {
  id: string;
  topic: TopicCategory;
  headline: string;
  summary: string;
  whyItMatters: string;
  talkingPoint: string;
  sources?: string[];
}

export interface Briefing {
  date: string;        // YYYY-MM-DD
  generatedAt: string; // ISO 8601
  stories: Story[];
  sectorWatch: string;
  oneToFollow: string;
}

export const TOPIC_STYLES: Record<
  TopicCategory,
  { badge: string; topBorder: string; label: string }
> = {
  'M&A': {
    badge: 'text-blue-600 dark:text-blue-400',
    topBorder: 'border-t-2 border-t-blue-500',
    label: 'text-blue-600 dark:text-blue-400',
  },
  'Capital Markets': {
    badge: 'text-violet-600 dark:text-violet-400',
    topBorder: 'border-t-2 border-t-violet-500',
    label: 'text-violet-600 dark:text-violet-400',
  },
  'Energy & Tech': {
    badge: 'text-emerald-600 dark:text-emerald-400',
    topBorder: 'border-t-2 border-t-emerald-500',
    label: 'text-emerald-600 dark:text-emerald-400',
  },
  'Regulation': {
    badge: 'text-amber-600 dark:text-amber-400',
    topBorder: 'border-t-2 border-t-amber-500',
    label: 'text-amber-600 dark:text-amber-400',
  },
  'Disputes': {
    badge: 'text-rose-600 dark:text-rose-400',
    topBorder: 'border-t-2 border-t-rose-500',
    label: 'text-rose-600 dark:text-rose-400',
  },
  'International': {
    badge: 'text-cyan-600 dark:text-cyan-400',
    topBorder: 'border-t-2 border-t-cyan-500',
    label: 'text-cyan-600 dark:text-cyan-400',
  },
};
