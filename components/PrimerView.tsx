import Link from 'next/link';
import { ChevronLeft, Clock, BookOpen, GraduationCap, MessageSquare, Eye, Target } from 'lucide-react';
import type { Primer } from '@/lib/types';
import { TOPIC_STYLES } from '@/lib/types';
import { renderBold } from '@/lib/bold';

export function PrimerView({ primer }: { primer: Primer }) {
  const styles = TOPIC_STYLES[primer.category];

  return (
    <div>
      {/* Back link */}
      <Link
        href="/primers"
        className="inline-flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors mb-6"
      >
        <ChevronLeft size={12} />
        All primers
      </Link>

      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-block w-2 h-2 rounded-full ${styles.dot}`} />
          <span className={`text-[10px] font-sans font-semibold tracking-[0.08em] uppercase ${styles.label}`}>
            {primer.category}
          </span>
          <span className="text-stone-300 dark:text-stone-700">·</span>
          <div className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500 font-sans">
            <Clock size={10} />
            {primer.readTimeMinutes} min read
          </div>
        </div>
        <h1 className="font-serif text-[28px] sm:text-[34px] font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-tight mb-3">
          {primer.title}
        </h1>
        <p className="text-[15px] text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl">
          {primer.strapline}
        </p>
      </div>

      <div className="space-y-5">
        {/* Sections */}
        {primer.sections.map((section, i) => (
          <div
            key={i}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-5 py-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[10px] text-stone-400 dark:text-stone-500 tracking-widest">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 className="text-[15px] font-bold text-stone-900 dark:text-stone-50 tracking-tight">
                {section.heading}
              </h2>
            </div>
            <p className="text-[14px] text-stone-700 dark:text-stone-300 leading-[1.8]">
              {renderBold(section.body)}
            </p>
          </div>
        ))}

        {/* Key Terms */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={13} className="text-stone-400 dark:text-stone-500" />
            <span className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
              Key Terms
            </span>
          </div>
          <dl className="space-y-4">
            {primer.keyTerms.map((kt) => (
              <div key={kt.term}>
                <dt className="text-[13px] font-semibold text-stone-900 dark:text-stone-100 mb-0.5">
                  {kt.term}
                </dt>
                <dd className="text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed">
                  {kt.definition}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Why It Matters */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={13} className="text-stone-400 dark:text-stone-500" />
            <span className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
              Why This Matters for You
            </span>
          </div>
          <div className="border-l-2 border-amber-400 dark:border-amber-500 pl-4">
            <p className="text-[14px] text-stone-700 dark:text-stone-300 leading-[1.8]">
              {renderBold(primer.whyItMatters)}
            </p>
          </div>
        </div>

        {/* Interview Questions */}
        {primer.interviewQs && primer.interviewQs.length > 0 && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-100 dark:border-stone-800">
              <MessageSquare size={13} className="text-stone-400 dark:text-stone-500" />
              <span className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
                Interview Questions
              </span>
            </div>
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {primer.interviewQs.map((iq, i) => (
                <div key={i} className="px-5 py-5 space-y-4">
                  {/* Question */}
                  <p className="font-serif text-[15px] font-bold text-stone-900 dark:text-stone-50 leading-snug">
                    &ldquo;{iq.question}&rdquo;
                  </p>
                  {/* What they want */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Eye size={11} className="text-stone-400" />
                      <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
                        What they&apos;re assessing
                      </p>
                    </div>
                    <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed">
                      {iq.whatTheyWant}
                    </p>
                  </div>
                  {/* Answer skeleton */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Target size={11} className="text-stone-400" />
                      <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
                        Answer skeleton
                      </p>
                    </div>
                    <p className="text-[13px] text-stone-600 dark:text-stone-300 leading-relaxed border-l-2 border-stone-200 dark:border-stone-700 pl-3">
                      {iq.skeleton}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
