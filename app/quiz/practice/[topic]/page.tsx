import { requireSubscription } from '@/lib/paywall';
import { getBriefing, getLatestBriefing, getQuiz, getTodayDate } from '@/lib/storage';
import { Header } from '@/components/Header';
import { QuizInterface } from '@/components/QuizInterface';
import type { TopicCategory } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

const SLUG_TO_TOPIC: Record<string, TopicCategory> = {
  'ma': 'M&A',
  'capital-markets': 'Capital Markets',
  'banking-finance': 'Banking & Finance',
  'energy-tech': 'Energy & Tech',
  'regulation': 'Regulation',
  'disputes': 'Disputes',
  'international': 'International',
  'ai-law': 'AI & Law',
};

export default async function QuizPracticePage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  await requireSubscription();

  const { topic: topicSlug } = await params;
  const topicLabel = SLUG_TO_TOPIC[topicSlug];

  const today = getTodayDate();
  const briefingResult = await getBriefing(today);
  const briefing = briefingResult ?? await getLatestBriefing();

  if (!topicLabel || !briefing) {
    return (
      <>
        <Header date={today} />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/quiz" className="inline-flex items-center gap-2 section-label text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors mb-8">
            <ArrowLeft size={12} /> Back to Quiz
          </Link>
          <p className="text-body text-stone-500 dark:text-stone-400">
            {!topicLabel ? 'Practice area not found.' : 'No briefing available yet.'}
          </p>
        </main>
      </>
    );
  }

  const quiz = await getQuiz(briefing.date);
  const topicStories = briefing.stories.filter((s) => s.topic === topicLabel);
  const topicStoryIds = new Set(topicStories.map((s) => s.id));
  const topicQuestions = (quiz?.questions ?? []).filter((q) => topicStoryIds.has(q.storyId));
  const topicQuiz = quiz && topicQuestions.length > 0 ? { ...quiz, questions: topicQuestions } : null;

  const storyMeta = briefing.stories.map((s) => ({
    id: s.id,
    topic: s.topic as TopicCategory,
    headline: s.headline,
  }));

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/quiz" className="inline-flex items-center gap-2 section-label text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors mb-8">
          <ArrowLeft size={12} /> Back to Quiz
        </Link>
        <div className="space-y-4 mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold opacity-40 font-sans">Deep Practice</span>
          <h2 className="text-5xl font-serif text-stone-900 dark:text-stone-50">{topicLabel}</h2>
          <p className="max-w-xl opacity-60 text-lg font-light font-sans">
            {topicQuestions.length} question{topicQuestions.length !== 1 ? 's' : ''} from today&apos;s briefing
          </p>
        </div>
        {topicQuiz ? (
          <QuizInterface date={briefing.date} initialQuiz={topicQuiz} storyMeta={storyMeta} countdown={null} />
        ) : (
          <div className="rounded-card border border-stone-200 dark:border-stone-800 p-10 text-center">
            <p className="text-body text-stone-500 dark:text-stone-400">
              No questions available for {topicLabel} today. Check back after the morning update.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
