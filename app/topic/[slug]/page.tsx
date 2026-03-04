import { notFound } from 'next/navigation';
import { getBriefing, getLatestBriefing, getTodayDate } from '@/lib/storage';
import { SLUG_TO_TOPIC, ALL_TOPICS } from '@/lib/topics';
import { Header } from '@/components/Header';
import { TabBar } from '@/components/TabBar';
import { ArticleStory } from '@/components/ArticleStory';

export const dynamic = 'force-dynamic';

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = SLUG_TO_TOPIC[slug];
  if (!topic) notFound();

  const today = getTodayDate();
  const briefing = (await getBriefing(today)) ?? (await getLatestBriefing());
  if (!briefing) notFound();

  const presentTopics = ALL_TOPICS.filter(t => briefing.stories.some(s => s.topic === t));
  const topicStories = briefing.stories.filter(s => s.topic === topic);

  return (
    <>
      <Header date={briefing.date} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        <TabBar presentTopics={presentTopics} activeTopic={topic} />

        {/* Topic heading */}
        <div className="mb-2 mt-4">
          <h2 className="font-serif text-[36px] sm:text-[44px] font-bold text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
            {topic}
          </h2>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2 font-sans">
            {topicStories.length} {topicStories.length === 1 ? 'story' : 'stories'} today
          </p>
        </div>

        {/* Articles */}
        {topicStories.length > 0 ? (
          <div>
            {topicStories.map(story => (
              <ArticleStory key={story.id} story={story} date={briefing.date} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-stone-400 dark:text-stone-500">
            No stories in this category today.
          </p>
        )}

      </main>
    </>
  );
}
