'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Building2, PenLine, GraduationCap, ArrowRight } from 'lucide-react';

type Stage = 'first-year' | 'vs' | 'tc';

const STAGES: { key: Stage; label: string }[] = [
  { key: 'first-year', label: "I'm a first year" },
  { key: 'vs',         label: 'Applying for VS' },
  { key: 'tc',         label: 'Interviews soon' },
];

const STAGE_CONTENT: Record<Stage, {
  heading: string;
  description: string;
  links: { label: string; href: string; Icon: React.ElementType }[];
}> = {
  'first-year': {
    heading: 'Build your foundations first.',
    description: 'Start with the Sector Primers — they give you the vocabulary to understand every deal, story, and interview question.',
    links: [
      { label: 'Sector Primers', href: '/primers', Icon: BookOpen },
      { label: 'Read today\'s briefing', href: '/', Icon: ArrowRight },
    ],
  },
  vs: {
    heading: 'Know your target firms inside out.',
    description: 'Firm profiles, recent deals, culture notes, and a daily quiz to keep your recall sharp for cover letters and assessment days.',
    links: [
      { label: 'Firm Profiles', href: '/firms', Icon: Building2 },
      { label: 'Daily Quiz', href: '/quiz', Icon: PenLine },
    ],
  },
  tc: {
    heading: 'Interview-ready in 10 minutes a day.',
    description: 'Firm-tagged stories, structured talking points, and aptitude test practice — everything you need before assessment day.',
    links: [
      { label: 'Firm Profiles', href: '/firms', Icon: Building2 },
      { label: 'Aptitude Tests', href: '/tests', Icon: GraduationCap },
    ],
  },
};

export function LandingHero() {
  const [stage, setStage] = useState<Stage | null>(null);
  const content = stage ? STAGE_CONTENT[stage] : null;

  return (
    <div className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Label */}
        <p className="font-mono text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-4">
          For law students targeting Magic Circle, Silver Circle &amp; US firm TCs
        </p>

        {/* Headline */}
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 tracking-tight leading-tight mb-5 max-w-2xl">
          Turn today&apos;s deals into confident<br className="hidden sm:block" /> interview answers.
        </h2>

        {/* Stage selector */}
        <p className="text-[13px] text-stone-500 dark:text-stone-400 mb-3">
          Where are you in the journey?
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {STAGES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStage(stage === key ? null : key)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-all ${
                stage === key
                  ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Personalised recommendation */}
        {content && (
          <div className="mb-6 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
            <p className="text-[13px] font-semibold text-stone-800 dark:text-stone-200 mb-1">
              {content.heading}
            </p>
            <p className="text-[13px] text-stone-500 dark:text-stone-400 mb-3">
              {content.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {content.links.map(({ label, href, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[12px] font-medium text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500 transition-colors"
                >
                  <Icon size={12} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Link
            href="/sign-up"
            className="inline-block px-6 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[14px] font-medium hover:opacity-80 transition-opacity"
          >
            Get started — £4/month →
          </Link>
          <p className="text-[12px] text-stone-400 dark:text-stone-500">
            Headlines &amp; summaries below are always free.
          </p>
        </div>

      </div>
    </div>
  );
}
