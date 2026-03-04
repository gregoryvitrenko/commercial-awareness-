import { TabBar } from './TabBar';
import { StoryCard } from './StoryCard';
import { ALL_TOPICS } from '@/lib/topics';
import type { Story, TopicCategory } from '@/lib/types';

interface StoryGridProps {
  stories: Story[];
  date: string;
  subscribed?: boolean;
}

export function StoryGrid({ stories, date, subscribed = false }: StoryGridProps) {
  const presentTopics = ALL_TOPICS.filter((t: TopicCategory) => stories.some(s => s.topic === t));

  return (
    <div>
      <TabBar presentTopics={presentTopics} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {stories.map((story, i) => (
          <div key={story.id} id={`story-${story.id}`}>
            <StoryCard story={story} index={i} date={date} subscribed={subscribed} />
          </div>
        ))}
      </div>
    </div>
  );
}
