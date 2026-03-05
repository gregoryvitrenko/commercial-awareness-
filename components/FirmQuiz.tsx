'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Building2,
  CheckCircle2,
  Trophy,
  Share2,
  Sparkles,
  Lock,
  Zap,
  BookOpen,
} from 'lucide-react';
import {
  SHORT_QUESTIONS,
  LONG_QUESTIONS,
  calculateResult,
  type QuizResult,
  type QuizQuestion,
} from '@/lib/firm-quiz-data';

// ─── Colour config ────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, {
  bg: string; border: string; badge: string; text: string; accent: string; dot: string; ring: string;
}> = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950/30',   border: 'border-blue-200 dark:border-blue-800',   badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',     text: 'text-blue-700 dark:text-blue-300',   accent: 'text-blue-600 dark:text-blue-400',   dot: 'bg-blue-500',   ring: 'ring-blue-500/30' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800', badge: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300', text: 'text-violet-700 dark:text-violet-300', accent: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500', ring: 'ring-violet-500/30' },
  emerald:{ bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300', text: 'text-emerald-700 dark:text-emerald-300', accent: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', ring: 'ring-emerald-500/30' },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-950/30',   border: 'border-teal-200 dark:border-teal-800',   badge: 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300',     text: 'text-teal-700 dark:text-teal-300',   accent: 'text-teal-600 dark:text-teal-400',   dot: 'bg-teal-500',   ring: 'ring-teal-500/30' },
  rose:   { bg: 'bg-rose-50 dark:bg-rose-950/30',   border: 'border-rose-200 dark:border-rose-800',   badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',     text: 'text-rose-700 dark:text-rose-300',   accent: 'text-rose-600 dark:text-rose-400',   dot: 'bg-rose-500',   ring: 'ring-rose-500/30' },
};

// ─── Intro screen ─────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: (format: 'short' | 'long') => void }) {
  const [selected, setSelected] = useState<'short' | 'long'>('short');

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
              Commercial Awareness
            </h1>
          </Link>
          <div className="w-[52px]" /> {/* spacer to center title */}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">

          <div className="w-14 h-14 rounded-2xl bg-stone-900 dark:bg-stone-100 flex items-center justify-center mx-auto mb-6">
            <Building2 size={24} className="text-stone-50 dark:text-stone-900" />
          </div>

          <p className="font-mono text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-3">
            Free quiz
          </p>

          <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50 tracking-tight mb-3">
            Which type of law firm suits you?
          </h2>

          <p className="text-[14px] text-stone-500 dark:text-stone-400 leading-relaxed mb-8 max-w-sm mx-auto">
            Rank options in order of preference. Get a personalised firm tier recommendation and 3 specific firm suggestions.
          </p>

          {/* Format selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([
              { key: 'short' as const, Icon: Zap,      label: 'Quick',    sub: '10 questions · ~2 min' },
              { key: 'long'  as const, Icon: BookOpen,  label: 'In-depth', sub: '15 questions · ~5 min' },
            ]).map(({ key, Icon, label, sub }) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${
                  selected === key
                    ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-400 dark:hover:border-stone-500'
                }`}
              >
                <Icon size={18} className={selected === key ? 'text-stone-50 dark:text-stone-900' : 'text-stone-400 dark:text-stone-500'} />
                <div>
                  <p className={`text-[13px] font-semibold ${selected === key ? 'text-stone-50 dark:text-stone-900' : 'text-stone-800 dark:text-stone-200'}`}>
                    {label}
                  </p>
                  <p className={`text-[11px] mt-0.5 ${selected === key ? 'text-stone-300 dark:text-stone-600' : 'text-stone-400 dark:text-stone-500'}`}>
                    {sub}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => onStart(selected)}
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
  question: QuizQuestion;
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

      {/* Progress bar */}
      <div className="h-[3px] bg-stone-200 dark:bg-stone-800">
        <div
          className="h-full bg-stone-900 dark:bg-stone-100 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Question counter + instruction */}
          <p className="font-mono text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1 text-center">
            {questionIndex + 1} of {total}
          </p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center mb-6">
            Rank in order of preference — tap to assign
          </p>

          {/* Question */}
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50 tracking-tight text-center mb-8 leading-snug">
            {question.question}
          </h2>

          {/* Options */}
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

          {/* Progress hint */}
          <p className="text-center text-[11px] text-stone-400 dark:text-stone-500 mb-4">
            {allRanked
              ? 'All ranked — ready to continue'
              : `${rankedOptions.length} of ${question.options.length} ranked`}
          </p>

          {/* Navigation */}
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

function ResultsScreen({ result, onRestart }: { result: QuizResult; onRestart: () => void }) {
  const [copied, setCopied] = useState(false);
  const colors = TIER_COLORS[result.topTier.color] ?? TIER_COLORS.blue;
  const maxScore = Math.max(...Object.values(result.scores));

  function handleShare() {
    const url = window.location.origin + '/firm-fit';
    const text = `I got "${result.topTier.name}" on the law firm compatibility quiz! Which type of firm suits you?`;
    if (navigator.share) {
      navigator.share({ title: 'Firm Fit Quiz', text, url }).catch(() => {});
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
              Commercial Awareness
            </h1>
          </Link>
          <div className="w-[52px]" />
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto px-4 sm:px-6 py-10 w-full">

        {/* Trophy */}
        <div className="text-center mb-6">
          <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.border} border flex items-center justify-center mx-auto mb-4`}>
            <Trophy size={24} className={colors.accent} />
          </div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-2">
            Your best fit
          </p>
          <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50 tracking-tight mb-2">
            {result.topTier.name}
          </h2>
          <p className="text-[14px] text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm mx-auto">
            {result.topTier.tagline}
          </p>
        </div>

        {/* Score bars */}
        <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800">
            <p className="font-mono text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
              Your compatibility scores
            </p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {result.ranking.map(({ tier, score }) => {
              const tc = TIER_COLORS[tier.color] ?? TIER_COLORS.blue;
              const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
              return (
                <div key={tier.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-stone-700 dark:text-stone-300">{tier.name}</span>
                    <span className={`font-mono text-[10px] ${tc.accent}`}>{score}</span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div className={`h-full rounded-full ${tc.dot} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* About your result */}
        <div className={`rounded-xl border ${colors.border} ${colors.bg} px-5 py-5 mb-6`}>
          <p className={`font-mono text-[10px] tracking-widest uppercase ${colors.accent} mb-3`}>
            About {result.topTier.name}
          </p>
          <p className="text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
            {result.topTier.description}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-2">Strengths</p>
              <ul className="space-y-1.5">
                {result.topTier.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                    <CheckCircle2 size={10} className="flex-shrink-0 mt-0.5 text-emerald-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-2">Consider</p>
              <ul className="space-y-1.5">
                {result.topTier.tradeoffs.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-500 mt-1" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recommended firms */}
        <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
            <Sparkles size={12} className={colors.accent} />
            <p className="font-mono text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
              Firms to explore
            </p>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {result.recommendedFirms.map((firm) => (
              <Link
                key={firm.slug}
                href={`/firms/${firm.slug}`}
                className="flex items-start gap-3 px-5 py-4 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors group"
              >
                <Building2 size={14} className={`flex-shrink-0 mt-0.5 ${colors.accent}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-stone-900 dark:text-stone-50 group-hover:underline underline-offset-2">{firm.name}</p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{firm.reason}</p>
                </div>
                <ArrowRight size={12} className="flex-shrink-0 mt-1 text-stone-300 dark:text-stone-600 group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors" />
              </Link>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/30">
            <Link
              href="/firms"
              className="flex items-center justify-center gap-2 text-[12px] font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              <Lock size={10} />
              Explore all 38 firm profiles
              <ArrowRight size={12} />
            </Link>
          </div>
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
          <p className="text-[14px] font-medium text-stone-50 dark:text-stone-900 mb-2">Want the full picture?</p>
          <p className="text-[12px] text-stone-300 dark:text-stone-600 mb-4">
            Access interview packs, detailed firm profiles, daily quizzes, aptitude tests, and more.
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

export function FirmQuiz() {
  const [stage, setStage] = useState<Stage>('intro');
  const [format, setFormat] = useState<'short' | 'long'>('short');
  const [currentQ, setCurrentQ] = useState(0);
  // answers[i] = array of option indices in rank order (first element = rank 1)
  const [answers, setAnswers] = useState<number[][]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);

  const activeQuestions = format === 'short' ? SHORT_QUESTIONS : LONG_QUESTIONS;
  const total = activeQuestions.length;

  function handleStart(f: 'short' | 'long') {
    const qs = f === 'short' ? SHORT_QUESTIONS : LONG_QUESTIONS;
    setFormat(f);
    setAnswers(Array(qs.length).fill(null).map(() => []));
    setCurrentQ(0);
    setStage('questions');
  }

  const handleToggleRank = useCallback((optionIdx: number) => {
    setAnswers((prev) => {
      const next = prev.map(a => [...a]);
      const ranked = next[currentQ] ?? [];
      const existingIdx = ranked.indexOf(optionIdx);
      if (existingIdx !== -1) {
        // De-rank: remove it; options that were ranked after it shift up
        ranked.splice(existingIdx, 1);
      } else {
        // Rank: append to end (gets next available rank number)
        ranked.push(optionIdx);
      }
      next[currentQ] = ranked;
      return next;
    });
  }, [currentQ]);

  function handleNext() {
    const ranked = answers[currentQ] ?? [];
    if (ranked.length !== activeQuestions[currentQ].options.length) return;
    if (currentQ < total - 1) {
      setCurrentQ(q => q + 1);
      window.scrollTo(0, 0);
    } else {
      const r = calculateResult(answers, activeQuestions);
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
    setAnswers([]);
    setResult(null);
    window.scrollTo(0, 0);
  }

  if (stage === 'intro') return <IntroScreen onStart={handleStart} />;
  if (stage === 'results' && result) return <ResultsScreen result={result} onRestart={handleRestart} />;

  return (
    <QuestionScreen
      questionIndex={currentQ}
      total={total}
      question={activeQuestions[currentQ]}
      rankedOptions={answers[currentQ] ?? []}
      onToggleRank={handleToggleRank}
      onNext={handleNext}
      onPrev={handlePrev}
    />
  );
}
