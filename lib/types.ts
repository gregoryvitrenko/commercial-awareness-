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
  { badge: string; border: string; label: string; shadow: string }
> = {
  'M&A': {
    badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    border: 'border-l-4 border-l-blue-500',
    label: 'text-blue-400',
    shadow: 'shadow-blue-500/5',
  },
  'Capital Markets': {
    badge: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    border: 'border-l-4 border-l-violet-500',
    label: 'text-violet-400',
    shadow: 'shadow-violet-500/5',
  },
  'Energy & Tech': {
    badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    border: 'border-l-4 border-l-emerald-500',
    label: 'text-emerald-400',
    shadow: 'shadow-emerald-500/5',
  },
  'Regulation': {
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    border: 'border-l-4 border-l-amber-500',
    label: 'text-amber-400',
    shadow: 'shadow-amber-500/5',
  },
  'Disputes': {
    badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    border: 'border-l-4 border-l-rose-500',
    label: 'text-rose-400',
    shadow: 'shadow-rose-500/5',
  },
  'International': {
    badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    border: 'border-l-4 border-l-cyan-500',
    label: 'text-cyan-400',
    shadow: 'shadow-cyan-500/5',
  },
};
