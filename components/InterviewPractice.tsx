'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target,
  BookOpen,
} from 'lucide-react';
import type { InterviewCategory, InterviewQuestion } from '@/lib/interview-data';

// ─── Colour config ────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, {
  accent: string;
  accentBg: string;
  accentBorder: string;
  badge: string;
  dot: string;
}> = {
  emerald: {
    accent: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    accentBorder: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  blue: {
    accent: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-50 dark:bg-blue-950/30',
    accentBorder: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  violet: {
    accent: 'text-violet-600 dark:text-violet-400',
    accentBg: 'bg-violet-50 dark:bg-violet-950/30',
    accentBorder: 'border-violet-200 dark:border-violet-800',
    badge: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
  amber: {
    accent: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-50 dark:bg-amber-950/30',
    accentBorder: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FrequencyBadge({ frequency }: { frequency: InterviewQuestion['frequency'] }) {
  const colors: Record<string, string> = {
    'Very Common': 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    'Common': 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400',
    'Occasional': 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-500',
  };
  return (
    <span className={`font-sans text-[9px] tracking-widest uppercase px-2 py-0.5 rounded ${colors[frequency] ?? colors['Common']}`}>
      {frequency}
    </span>
  );
}

function GuidancePanel({ question }: { question: InterviewQuestion }) {
  return (
    <div className="space-y-5 pt-1">

      {/* Framework */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={12} className="text-stone-400" />
          <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
            Framework — {question.framework}
          </p>
        </div>
        <p className="text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed">
          {question.frameworkExplained}
        </p>
      </div>

      <hr className="border-stone-100 dark:border-stone-800" />

      {/* Example structure */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Target size={12} className="text-stone-400" />
          <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
            Answer structure
          </p>
        </div>
        <p className="text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed italic">
          &ldquo;{question.exampleStructure}&rdquo;
        </p>
      </div>

      <hr className="border-stone-100 dark:border-stone-800" />

      {/* What firms are assessing */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Eye size={12} className="text-stone-400" />
          <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
            What firms are assessing
          </p>
        </div>
        <ul className="space-y-1.5">
          {question.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-stone-600 dark:text-stone-400">
              <CheckCircle2 size={12} className="flex-shrink-0 mt-0.5 text-emerald-500" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-stone-100 dark:border-stone-800" />

      {/* Tips */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={12} className="text-stone-400" />
          <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
            Tips
          </p>
        </div>
        <ul className="space-y-1.5">
          {question.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-stone-600 dark:text-stone-400">
              <span className="flex-shrink-0 w-4 text-stone-300 dark:text-stone-600 font-sans text-[11px] mt-0.5">
                {i + 1}.
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-stone-100 dark:border-stone-800" />

      {/* Common mistakes */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={12} className="text-stone-400" />
          <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
            Common mistakes
          </p>
        </div>
        <ul className="space-y-1.5">
          {question.commonMistakes.map((mistake, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-stone-600 dark:text-stone-400">
              <AlertCircle size={12} className="flex-shrink-0 mt-0.5 text-rose-400 dark:text-rose-500" />
              {mistake}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  category: InterviewCategory;
  questions: InterviewQuestion[];
  date: string;
}

export function InterviewPractice({ category, questions, date }: Props) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [practised, setPractised] = useState<Set<number>>(new Set());

  const colors = COLOR_MAP[category.color] ?? COLOR_MAP.blue;
  const question = questions[index];
  const total = questions.length;

  function goTo(newIndex: number) {
    setIndex(newIndex);
    setRevealed(false);
  }

  function markPractised() {
    setPractised((prev) => new Set(prev).add(index));
  }

  return (
    <>
      <Header date={date} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Back link */}
        <Link
          href="/interview"
          className="inline-flex items-center gap-1.5 font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors mb-6"
        >
          <ArrowLeft size={10} />
          Interview Prep
        </Link>

        {/* Category header */}
        <div className="mb-6">
          <p className={`font-sans text-[10px] tracking-widest uppercase mb-1 ${colors.accent}`}>
            {category.shortName}
          </p>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50 tracking-tight mb-1">
            {category.name}
          </h2>
          <p className="text-[13px] text-stone-500 dark:text-stone-400">
            {category.strapline}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-5">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? `w-5 ${colors.dot}`
                  : practised.has(i)
                  ? `w-2 ${colors.dot} opacity-40`
                  : 'w-2 bg-stone-200 dark:bg-stone-700'
              }`}
              aria-label={`Question ${i + 1}`}
            />
          ))}
          <span className="ml-2 font-sans text-[10px] text-stone-400 dark:text-stone-500">
            {index + 1} / {total}
          </span>
        </div>

        {/* Question card */}
        <div className={`rounded-xl border ${colors.accentBorder} ${colors.accentBg} px-6 py-6 mb-4`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <FrequencyBadge frequency={question.frequency} />
            {practised.has(index) && (
              <span className="flex items-center gap-1 font-sans text-[9px] tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={10} />
                Practised
              </span>
            )}
          </div>

          <p className="font-serif text-[18px] font-bold text-stone-900 dark:text-stone-50 leading-snug mb-3">
            &ldquo;{question.question}&rdquo;
          </p>

          {question.context && (
            <p className="text-[12px] text-stone-500 dark:text-stone-400 leading-relaxed italic border-l-2 border-stone-300 dark:border-stone-600 pl-3">
              {question.context}
            </p>
          )}
        </div>

        {/* Think prompt (before reveal) */}
        {!revealed && (
          <div className="rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-5 py-4 mb-4">
            <p className="text-[13px] text-stone-500 dark:text-stone-400 text-center">
              Take 60 seconds to form your answer out loud — then reveal the guidance.
            </p>
          </div>
        )}

        {/* Reveal / hide button */}
        <button
          onClick={() => {
            setRevealed((r) => !r);
            if (!revealed) markPractised();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-[13px] font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors mb-6"
        >
          {revealed ? (
            <>
              <EyeOff size={13} />
              Hide guidance
            </>
          ) : (
            <>
              <Eye size={13} />
              Show guidance
            </>
          )}
        </button>

        {/* Guidance panel */}
        {revealed && (
          <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-6 py-6 mb-6">
            <GuidancePanel question={question} />
          </div>
        )}

        {/* Category tips (collapsed by default, shown once at top) */}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => goTo(Math.max(0, index - 1))}
            disabled={index === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-[12px] font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={13} />
            Previous
          </button>

          {index < total - 1 ? (
            <button
              onClick={() => goTo(index + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[12px] font-medium hover:opacity-80 transition-opacity"
            >
              Next question
              <ChevronRight size={13} />
            </button>
          ) : (
            <Link
              href="/interview"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[12px] font-medium hover:opacity-80 transition-opacity"
            >
              Back to categories
              <ChevronRight size={13} />
            </Link>
          )}
        </div>

        {/* Category-level tips footer */}
        <div className="mt-8 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 px-5 py-4">
          <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-3">
            {category.shortName} — general tips
          </p>
          <ul className="space-y-2">
            {category.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-stone-500 dark:text-stone-400">
                <span className="flex-shrink-0 w-3 text-stone-300 dark:text-stone-600 font-sans text-[10px] mt-0.5">
                  {i + 1}.
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

      </main>
    </>
  );
}
