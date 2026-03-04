import type { TopicCategory } from './types';

export const TOPIC_SLUGS: Record<TopicCategory, string> = {
  'M&A': 'ma',
  'Capital Markets': 'capital-markets',
  'Energy & Tech': 'energy-tech',
  'Regulation': 'regulation',
  'Disputes': 'disputes',
  'International': 'international',
  'AI & Law': 'ai-law',
};

export const SLUG_TO_TOPIC: Record<string, TopicCategory> = Object.fromEntries(
  Object.entries(TOPIC_SLUGS).map(([topic, slug]) => [slug, topic as TopicCategory])
);

export const ALL_TOPICS: TopicCategory[] = [
  'M&A', 'Capital Markets', 'Energy & Tech', 'Regulation', 'Disputes', 'International', 'AI & Law',
];
