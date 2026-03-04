'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2, XCircle, RotateCcw, ArrowLeft, Trophy } from 'lucide-react';
import type { DailyQuiz, QuizQuestion, TopicCategory } from '@/lib/types';
import { TOPIC_STYLES } from '@/lib/types';

// ── localStorage schema ───────────────────────────────────────────────────────

interface StoredResult {
  score: number;
  total: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  completedAt: string;
}

function resultKey(date: string) {
  return `quiz-result-${date}`;
}

function loadResult(date: string): StoredResult | null {
  try {
    const raw = localStorage.getItem(resultKey(date));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveResult(date: string, result: StoredResult): void {
  try {
    localStorage.setItem(resultKey(date), JSON.stringify(result));
  } catch {}
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface StoryMeta {
  id: string;
  topic: TopicCategory;
  headline: string;
}

// ── Per-topic result row (archive-style) ──────────────────────────────────────

function TopicRow({
  topic,
  questions,
  answers,
}: {
  topic: TopicCategory;
  questions: QuizQuestion[];
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
}) {
  const styles = TOPIC_STYLES[topic];
  const correct = questions.filter((q) => answers[q.id] === q.correctLetter).length;
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
        <span className={`text-[10px] font-mono font-semibold tracking-[0.12em] uppercase ${styles.label}`}>
          {topic}
        </span>
        <div className="flex items-center gap-1 ml-2">
          {questions.map((q) => {
            const isCorrect = answers[q.id] === q.correctLetter;
            return (
              <span
                key={q.id}
                className={`inline-block w-2 h-2 rounded-full ${
                  isCorrect
                    ? 'bg-emerald-500 dark:bg-emerald-400'
                    : 'bg-rose-500 dark:bg-rose-400'
                }`}
              />
            );
          })}
        </div>
      </div>
      <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 flex-shrink-0">
        {correct}/{questions.length}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface QuizInterfaceProps {
  date: string;
  initialQuiz: DailyQuiz | null;
  storyMeta: StoryMeta[];
}

type UIState = 'idle' | 'loading' | 'quiz' | 'results';

export function QuizInterface({ date, initialQuiz, storyMeta }: QuizInterfaceProps) {
  const [uiState, setUIState] = useState<UIState>('idle');
  const [quiz, setQuiz] = useState<DailyQuiz | null>(initialQuiz);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [chosen, setChosen] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previousResult, setPreviousResult] = useState<StoredResult | null>(null);
  const [isRetry, setIsRetry] = useState(false);

  useEffect(() => {
    const saved = loadResult(date);
    setPreviousResult(saved);
  }, [date]);

  async function fetchAndStart(retryMissed = false) {
    setErrorMsg(null);
    setIsRetry(retryMissed);

    let resolvedQuiz = quiz;

    if (!resolvedQuiz) {
      setUIState('loading');
      try {
        const res = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to generate quiz');
        resolvedQuiz = data.quiz as DailyQuiz;
        setQuiz(resolvedQuiz);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Quiz generation failed.');
        setUIState('idle');
        return;
      }
    }

    let questions = resolvedQuiz.questions;

    if (retryMissed && previousResult) {
      questions = questions.filter(
        (q) => previousResult.answers[q.id] !== q.correctLetter
      );
      if (questions.length === 0) {
        setUIState('idle');
        return;
      }
    }

    setActiveQuestions(questions);
    setCurrentIndex(0);
    setAnswers({});
    setChosen(null);
    setUIState('quiz');
  }

  function handleSelect(letter: 'A' | 'B' | 'C' | 'D') {
    if (chosen !== null) return;
    setChosen(letter);
  }

  function handleNext() {
    if (chosen === null || !activeQuestions[currentIndex]) return;

    const q = activeQuestions[currentIndex];
    const nextAnswers = { ...answers, [q.id]: chosen };
    setAnswers(nextAnswers);
    setChosen(null);

    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const score = activeQuestions.filter(
        (aq) => nextAnswers[aq.id] === aq.correctLetter
      ).length;

      const result: StoredResult = {
        score,
        total: activeQuestions.length,
        answers: nextAnswers,
        completedAt: new Date().toISOString(),
      };

      if (isRetry && previousResult) {
        const merged: StoredResult = {
          score: 0,
          total: previousResult.total,
          answers: { ...previousResult.answers, ...nextAnswers },
          completedAt: result.completedAt,
        };
        merged.score = quiz!.questions.filter(
          (q) => merged.answers[q.id] === q.correctLetter
        ).length;
        saveResult(date, merged);
        setPreviousResult(merged);
        setAnswers(merged.answers);
      } else {
        saveResult(date, result);
        setPreviousResult(result);
        setAnswers(nextAnswers);
      }

      setUIState('results');
    }
  }

  // ── Idle / loading state ───────────────────────────────────────────────────

  if (uiState === 'idle' || uiState === 'loading') {
    const alreadyDone = previousResult !== null;
    const missedCount = previousResult ? previousResult.total - previousResult.score : 0;

    return (
      <div>
        <h3 className="font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">
          {alreadyDone ? 'Completed' : "Today's quiz"}
        </h3>
        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-5 py-6 space-y-4">
            <div>
              {alreadyDone && previousResult ? (
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  You scored {previousResult.score}/{previousResult.total}
                </p>
              ) : (
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {quiz ? '18 questions ready' : 'Test your recall'}
                </p>
              )}
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                {alreadyDone
                  ? missedCount > 0
                    ? `${missedCount} question${missedCount !== 1 ? 's' : ''} answered incorrectly — retry to improve your score.`
                    : 'Perfect score — all questions correct.'
                  : '3 questions per practice area · immediate feedback · explanations after each answer'}
              </p>
            </div>

            {errorMsg && (
              <p className="text-[12px] font-mono text-rose-500 dark:text-rose-400">
                {errorMsg}
              </p>
            )}

            <div className="flex items-center gap-3 flex-wrap pt-1">
              {uiState === 'loading' ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-[13px] font-sans font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating questions…
                </div>
              ) : alreadyDone ? (
                <>
                  {missedCount > 0 && (
                    <button
                      onClick={() => fetchAndStart(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-[13px] font-sans font-medium hover:opacity-80 transition-opacity"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry {missedCount} missed
                    </button>
                  )}
                  <button
                    onClick={() => fetchAndStart(false)}
                    className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-[13px] font-sans hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                  >
                    Retake full quiz
                  </button>
                </>
              ) : (
                <button
                  onClick={() => fetchAndStart(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-[13px] font-sans font-medium hover:opacity-80 transition-opacity"
                >
                  {quiz ? 'Start quiz →' : 'Generate & start quiz →'}
                </button>
              )}

              <Link
                href="/"
                className="text-[12px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                ← Back to briefing
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Results state ──────────────────────────────────────────────────────────

  if (uiState === 'results' && quiz) {
    const finalAnswers = answers;
    const score = quiz.questions.filter(
      (q) => finalAnswers[q.id] === q.correctLetter
    ).length;
    const total = quiz.questions.length;
    const missedCount = total - score;
    const pct = Math.round((score / total) * 100);

    const byStory: Record<string, QuizQuestion[]> = {};
    for (const q of quiz.questions) {
      if (!byStory[q.storyId]) byStory[q.storyId] = [];
      byStory[q.storyId].push(q);
    }

    return (
      <div className="space-y-8">
        {/* Score card */}
        <div>
          <h3 className="font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">
            Results
          </h3>
          <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-5 py-6 flex items-center gap-5">
              <Trophy className={`w-9 h-9 flex-shrink-0 ${pct >= 80 ? 'text-amber-500' : pct >= 60 ? 'text-zinc-400' : 'text-zinc-300 dark:text-zinc-600'}`} />
              <div className="min-w-0">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {score} / {total}
                </p>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {pct >= 90
                    ? 'Excellent — interview-ready recall.'
                    : pct >= 70
                    ? 'Strong. Review the misses before your next application.'
                    : pct >= 50
                    ? 'Decent start. Re-read the stories you dropped marks on.'
                    : 'Keep going — read the explanations and retry.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Per-topic breakdown */}
        <div>
          <h3 className="font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">
            By practice area
          </h3>
          <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {storyMeta.map((meta) => {
              const qs = byStory[meta.id] ?? [];
              if (qs.length === 0) return null;
              return (
                <TopicRow
                  key={meta.id}
                  topic={meta.topic}
                  questions={qs}
                  answers={finalAnswers}
                />
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {missedCount > 0 && (
            <button
              onClick={() => fetchAndStart(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-[13px] font-sans font-medium hover:opacity-80 transition-opacity"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry {missedCount} missed
            </button>
          )}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-[13px] font-sans hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to briefing
          </Link>
        </div>
      </div>
    );
  }

  // ── Quiz state ─────────────────────────────────────────────────────────────

  const currentQ = activeQuestions[currentIndex];
  if (!currentQ) return null;

  const meta = storyMeta.find((m) => m.id === currentQ.storyId);
  const styles = meta ? TOPIC_STYLES[meta.topic] : TOPIC_STYLES['International'];
  const progress = (currentIndex + 1) / activeQuestions.length;
  const isAnswered = chosen !== null;
  const isCorrect = chosen === currentQ.correctLetter;

  function optionStyle(letter: 'A' | 'B' | 'C' | 'D'): string {
    const base =
      'w-full text-left px-4 py-3.5 rounded-xl border text-[14px] font-sans leading-snug transition-colors';

    if (!isAnswered) {
      return `${base} border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer`;
    }

    if (letter === currentQ.correctLetter) {
      return `${base} border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 cursor-default`;
    }

    if (letter === chosen) {
      return `${base} border-rose-400 dark:border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-100 cursor-default`;
    }

    return `${base} border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 cursor-default opacity-60`;
  }

  return (
    <div className="max-w-2xl mx-auto py-10">

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wide">
            {currentIndex + 1} / {activeQuestions.length}
            {isRetry && ' · retry mode'}
          </span>
          <Link
            href="/"
            className="text-[10px] font-sans text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            ← briefing
          </Link>
        </div>
        <div className="h-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full">
          <div
            className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Story context */}
      {meta && (
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
          <span className={`text-[10px] font-mono font-semibold tracking-[0.12em] uppercase ${styles.label}`}>
            {meta.topic}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700 text-[10px]">·</span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans truncate">
            {meta.headline}
          </span>
        </div>
      )}

      {/* Question */}
      <h2 className="font-serif text-[20px] sm:text-[22px] font-bold leading-snug text-zinc-900 dark:text-zinc-50 tracking-tight mb-6">
        {currentQ.question}
      </h2>

      {/* Options */}
      <div className="space-y-2.5 mb-6">
        {currentQ.options.map((opt) => (
          <button
            key={opt.letter}
            onClick={() => handleSelect(opt.letter)}
            className={optionStyle(opt.letter)}
          >
            <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 mr-2.5">
              {opt.letter}
            </span>
            {opt.text}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {isAnswered && (
        <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl mb-6 border ${
          isCorrect
            ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-800/40'
            : 'bg-rose-50 dark:bg-rose-900/15 border-rose-200 dark:border-rose-800/40'
        }`}>
          {isCorrect
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            : <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          }
          <p className={`text-[13px] leading-relaxed ${
            isCorrect
              ? 'text-emerald-800 dark:text-emerald-200'
              : 'text-rose-800 dark:text-rose-200'
          }`}>
            <span className="font-semibold">{isCorrect ? 'Correct. ' : `Incorrect — answer is ${currentQ.correctLetter}. `}</span>
            {currentQ.explanation}
          </p>
        </div>
      )}

      {/* Next button */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-[13px] font-sans font-medium hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {currentIndex + 1 === activeQuestions.length ? 'See results →' : 'Next →'}
        </button>
      </div>

    </div>
  );
}
