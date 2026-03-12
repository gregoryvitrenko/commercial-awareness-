'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Scale,
  CheckCircle2,
  Star,
  Share2,
  BookOpen,
} from 'lucide-react';
import {
  AREA_QUESTIONS,
  calculateAreaResult,
  type AreaResult,
  type AreaQuestion,
} from '@/lib/area-quiz-data';

// ─── Colour config ─────────────────────────────────────────────────────────────
// Maps the area color token (from AREA_DESCRIPTIONS) to Tailwind classes.

const AREA_COLORS: Record<string, {
  bg: string; border: string; accent: string; dot: string;
}> = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950/30',   border: 'border-blue-200 dark:border-blue-800',   accent: 'text-blue-600 dark:text-blue-400',   dot: 'bg-blue-500' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800', accent: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', accent: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  emerald:{ bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', accent: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-950/30',  border: 'border-amber-200 dark:border-amber-800',  accent: 'text-amber-600 dark:text-amber-400',  dot: 'bg-amber-500' },
  rose:   { bg: 'bg-rose-50 dark:bg-rose-950/30',   border: 'border-rose-200 dark:border-rose-800',   accent: 'text-rose-600 dark:text-rose-400',   dot: 'bg-rose-500' },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-950/30',   border: 'border-teal-200 dark:border-teal-800',   accent: 'text-teal-600 dark:text-teal-400',   dot: 'bg-teal-500' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800', accent: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500' },
};

// ─── Intro screen ─────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">

      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="h-[3px] bg-stone-900 dark:bg-stone-100" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[12px] font-sans text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Home
          </Link>
          <Link href="/">
            <h1 className="font-serif text-[22px] sm:text-[28px] font-bold tracking-tight text-stone-900 dark:text-stone-50 hover:opacity-75 transition-opacity">
              Folio
            </h1>
          </Link>
          <div className="w-[52px]" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">

          <div className="w-14 h-14 rounded-2xl bg-stone-900 dark:bg-stone-100 flex items-center justify-center mx-auto mb-6">
            <Scale size={24} className="text-stone-50 dark:text-stone-900" />
          </div>

          <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-3">
            Free quiz
          </p>

          <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50 tracking-tight mb-3">
            Which area of law suits you?
          </h2>

          <p className="text-[14px] text-stone-500 dark:text-stone-400 leading-relaxed mb-8 max-w-sm mx-auto">
            10 questions. Rank options in order of preference to discover which practice area matches your interests, working style, and ambitions.
          </p>

          <button
            onClick={onStart}
            className="w-full max-w-xs mx-auto py-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[14px] font-sans font-medium hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
          >
            Start quiz
            <ArrowRight size={14} />
          </button>

          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-4">
            No sign-up required. Results are instant.
          </p>

        </div>
      </main>
    </div>
  );
}

// ─── Question screen (ranking mechanic) ───────────────────────────────────────

function QuestionScreen({
  questionIndex,
  total,
  question,
  rankedOptions,
  onToggleRank,
  onNext,
  onPrev,
}: {
  questionIndex: number;
  total: number;
  question: AreaQuestion;
  rankedOptions: number[];
  onToggleRank: (idx: number) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const progress = ((questionIndex + 1) / total) * 100;
  const allRanked = rankedOptions.length === question.options.length;
  const isLast = questionIndex === total - 1;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">

      <div className="h-[3px] bg-stone-200 dark:bg-stone-800">
        <div
          className="h-full bg-stone-900 dark:bg-stone-100 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1 text-center">
            {questionIndex + 1} of {total}
          </p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center mb-6">
            Rank in order of preference — tap to assign
          </p>

          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50 tracking-tight text-center mb-8 leading-snug">
            {question.question}
          </h2>

          <div className="space-y-3 mb-6">
            {question.options.map((option, i) => {
              const rankIdx = rankedOptions.indexOf(i);
              const isRanked = rankIdx !== -1;
              const rankNum = rankIdx + 1;

              return (
                <button
                  key={i}
                  onClick={() => onToggleRank(i)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all text-[13px] ${
                    isRanked
                      ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 font-medium'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500'
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 text-[10px] font-bold ${
                      isRanked
                        ? 'bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-50'
                        : 'border border-stone-300 dark:border-stone-600'
                    }`}>
                      {isRanked ? rankNum : null}
                    </span>
                    <span className="flex-1">{option.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-center text-[11px] text-stone-400 dark:text-stone-500 mb-4">
            {allRanked
              ? 'All ranked — ready to continue'
              : `${rankedOptions.length} of ${question.options.length} ranked`}
          </p>

          <div className="flex items-center justify-between">
            <button
              onClick={onPrev}
              disabled={questionIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={13} />
              Back
            </button>

            <button
              onClick={onNext}
              disabled={!allRanked}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[12px] font-medium hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLast ? 'See results' : 'Next'}
              <ArrowRight size={13} />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

// ─── Results screen ───────────────────────────────────────────────────────────

function ResultsScreen({ result, onRestart }: { result: AreaResult; onRestart: () => void }) {
  const [copied, setCopied] = useState(false);
  const colors = AREA_COLORS[result.topArea.color] ?? AREA_COLORS.blue;
  const maxScore = Math.max(...Object.values(result.scores));

  function handleShare() {
    const url = window.location.origin + '/area-fit';
    const text = `I got "${result.topArea.key}" on the area of law quiz! Which practice area suits you?`;
    if (navigator.share) {
      navigator.share({ title: 'Area of Law Quiz', text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">

      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="h-[3px] bg-stone-900 dark:bg-stone-100" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[12px] font-sans text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Home
          </Link>
          <Link href="/">
            <h1 className="font-serif text-[22px] sm:text-[28px] font-bold tracking-tight text-stone-900 dark:text-stone-50 hover:opacity-75 transition-opacity">
              Folio
            </h1>
          </Link>
          <div className="w-[52px]" />
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto px-4 sm:px-6 py-10 w-full">

        {/* Result hero */}
        <div className="text-center mb-6">
          <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.border} border flex items-center justify-center mx-auto mb-4`}>
            <Star size={24} className={colors.accent} />
          </div>
          <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-2">
            Your best fit
          </p>
          <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50 tracking-tight mb-2">
            {result.topArea.key}
          </h2>
          <p className="text-[14px] text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm mx-auto">
            {result.topArea.tagline}
          </p>
        </div>

        {/* Score bars */}
        <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800">
            <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
              Your area compatibility scores
            </p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {result.ranking.map(({ area, score }) => {
              const ac = AREA_COLORS[area.color] ?? AREA_COLORS.blue;
              const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
              return (
                <div key={area.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-stone-700 dark:text-stone-300">{area.key}</span>
                    <span className={`font-sans text-[10px] ${ac.accent}`}>{score}</span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div className={`h-full rounded-full ${ac.dot} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* About the area */}
        <div className={`rounded-xl border ${colors.border} ${colors.bg} px-5 py-5 mb-6`}>
          <p className={`font-sans text-[10px] tracking-widest uppercase ${colors.accent} mb-3`}>
            About {result.topArea.key}
          </p>
          <p className="text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
            {result.topArea.description}
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-2">What lawyers in this area do</p>
              <p className="text-[12px] text-stone-500 dark:text-stone-400 leading-relaxed">
                {result.topArea.whatLawyersDo}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-2">Key skills</p>
              <ul className="space-y-1.5">
                {result.topArea.skills.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                    <CheckCircle2 size={10} className="flex-shrink-0 mt-0.5 text-emerald-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Primer link */}
        <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
            <BookOpen size={12} className={colors.accent} />
            <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
              Go deeper
            </p>
          </div>
          <Link
            href={`/primers/${result.topArea.primerSlug}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors group"
          >
            <div>
              <p className="text-[13px] font-medium text-stone-900 dark:text-stone-50 group-hover:underline underline-offset-2">
                Read the {result.topArea.key} primer
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                Background, key terms, and interview questions for this area
              </p>
            </div>
            <ArrowRight size={13} className="flex-shrink-0 text-stone-300 dark:text-stone-600 group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors" />
          </Link>
        </div>

        {/* Share + retake */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-[12px] font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <Share2 size={13} />
            {copied ? 'Copied!' : 'Share result'}
          </button>
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-[12px] font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <RotateCcw size={13} />
            Retake quiz
          </button>
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-xl bg-stone-900 dark:bg-stone-100 px-5 py-5 text-center">
          <p className="text-[14px] font-medium text-stone-50 dark:text-stone-900 mb-2">Ready to go further?</p>
          <p className="text-[12px] text-stone-300 dark:text-stone-600 mb-4">
            Daily briefings, firm interview packs, aptitude tests, a daily quiz, and more — all built for TC applicants.
          </p>
          <Link
            href="/upgrade"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-50 text-[13px] font-medium hover:opacity-80 transition-opacity"
          >
            See plans
            <ArrowRight size={13} />
          </Link>
        </div>

      </main>
    </div>
  );
}

// ─── Main quiz component ──────────────────────────────────────────────────────

type Stage = 'intro' | 'questions' | 'results';

export function AreaQuiz() {
  const [stage, setStage] = useState<Stage>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  // answers[i] = array of option indices in rank order (rank 1 first)
  const [answers, setAnswers] = useState<number[][]>(
    Array(AREA_QUESTIONS.length).fill(null).map(() => [])
  );
  const [result, setResult] = useState<AreaResult | null>(null);

  const total = AREA_QUESTIONS.length;

  const handleToggleRank = useCallback((optionIdx: number) => {
    setAnswers((prev) => {
      const next = prev.map(a => [...a]);
      const ranked = next[currentQ] ?? [];
      const existingIdx = ranked.indexOf(optionIdx);
      if (existingIdx !== -1) {
        ranked.splice(existingIdx, 1);
      } else {
        ranked.push(optionIdx);
      }
      next[currentQ] = ranked;
      return next;
    });
  }, [currentQ]);

  function handleNext() {
    const ranked = answers[currentQ] ?? [];
    if (ranked.length !== AREA_QUESTIONS[currentQ].options.length) return;
    if (currentQ < total - 1) {
      setCurrentQ(q => q + 1);
      window.scrollTo(0, 0);
    } else {
      const r = calculateAreaResult(answers);
      setResult(r);
      setStage('results');
      window.scrollTo(0, 0);
    }
  }

  function handlePrev() {
    if (currentQ > 0) setCurrentQ(q => q - 1);
  }

  function handleRestart() {
    setStage('intro');
    setCurrentQ(0);
    setAnswers(Array(AREA_QUESTIONS.length).fill(null).map(() => []));
    setResult(null);
    window.scrollTo(0, 0);
  }

  if (stage === 'intro') return <IntroScreen onStart={() => setStage('questions')} />;
  if (stage === 'results' && result) return <ResultsScreen result={result} onRestart={handleRestart} />;

  return (
    <QuestionScreen
      questionIndex={currentQ}
      total={total}
      question={AREA_QUESTIONS[currentQ]}
      rankedOptions={answers[currentQ] ?? []}
      onToggleRank={handleToggleRank}
      onNext={handleNext}
      onPrev={handlePrev}
    />
  );
}
