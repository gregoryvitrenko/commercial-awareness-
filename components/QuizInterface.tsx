'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2, XCircle, RotateCcw, ArrowLeft, Trophy, Flame, Zap, BarChart3 } from 'lucide-react';
import type { DailyQuiz, QuizQuestion, TopicCategory } from '@/lib/types';
import { TOPIC_STYLES } from '@/lib/types';

// ── localStorage schema ───────────────────────────────────────────────────────

export interface CountdownData {
  firmName: string;
  shortName: string;
  label: string;
  daysLeft: number;
  slug: string;
}

interface StoredResult {
  score: number;
  total: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  completedAt: string;
}

interface LastResultData {
  score: number;
  total: number;
  pct: number;
  date: string;
  prevPct?: number; // pct from the session before (for ↑↓→ trend)
}

interface StreakData {
  lastCompleted: string; // YYYY-MM-DD
  count: number;
}

// Per-mode storage keys (streak and deep are kept separate so each card shows
// its own result. Legacy key quiz-result-${date} kept as fallback for existing data.)
function streakResultKey(date: string) { return `quiz-streak-result-${date}`; }
function deepResultKey(date: string)   { return `quiz-deep-result-${date}`; }
function legacyResultKey(date: string) { return `quiz-result-${date}`; }

function streakDoneKey(date: string) {
  return `quiz-streak-done-${date}`;
}

function loadStreakResult(date: string): StoredResult | null {
  try {
    const raw =
      localStorage.getItem(streakResultKey(date)) ??
      localStorage.getItem(legacyResultKey(date)); // backward-compat fallback
    return raw ? (JSON.parse(raw) as StoredResult) : null;
  } catch {
    return null;
  }
}

function saveStreakResult(date: string, result: StoredResult): void {
  try { localStorage.setItem(streakResultKey(date), JSON.stringify(result)); } catch {}
}

function saveDeepResult(date: string, result: StoredResult): void {
  try { localStorage.setItem(deepResultKey(date), JSON.stringify(result)); } catch {}
}

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem('quiz-streak');
    return raw ? JSON.parse(raw) : { lastCompleted: '', count: 0 };
  } catch {
    return { lastCompleted: '', count: 0 };
  }
}

function isStreakDoneToday(date: string): boolean {
  try {
    return localStorage.getItem(streakDoneKey(date)) === '1';
  } catch {
    return false;
  }
}

// ── Global last-result (cross-day score history) ───────────────────────────

function loadLastResult(): LastResultData | null {
  try {
    const raw = localStorage.getItem('cad-quiz-last-result');
    return raw ? (JSON.parse(raw) as LastResultData) : null;
  } catch {
    return null;
  }
}

function saveLastResult(score: number, total: number, date: string): void {
  try {
    const pct = Math.round((score / total) * 100);
    const prev = loadLastResult();
    const entry: LastResultData = {
      score,
      total,
      pct,
      date,
      prevPct: prev ? prev.pct : undefined,
    };
    localStorage.setItem('cad-quiz-last-result', JSON.stringify(entry));
  } catch {}
}

interface StoryMeta {
  id: string;
  topic: TopicCategory;
  headline: string;
}

// ── Lifetime stats tracking ──────────────────────────────────────────────────

interface TopicStats { total: number; correct: number }
interface QuizStats {
  total: number;
  correct: number;
  topics: Partial<Record<TopicCategory, TopicStats>>;
}

const STATS_KEY = 'folio-quiz-stats';

function loadQuizStats(): QuizStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? (JSON.parse(raw) as QuizStats) : { total: 0, correct: 0, topics: {} };
  } catch {
    return { total: 0, correct: 0, topics: {} };
  }
}

function recordQuizStats(
  questions: QuizQuestion[],
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>,
  storyMeta: StoryMeta[]
): void {
  try {
    const stats = loadQuizStats();
    const topicByStoryId = new Map(storyMeta.map((m) => [m.id, m.topic]));

    for (const q of questions) {
      if (!answers[q.id]) continue; // unanswered
      stats.total++;
      const isCorrect = answers[q.id] === q.correctLetter;
      if (isCorrect) stats.correct++;

      const topic = topicByStoryId.get(q.storyId);
      if (topic) {
        if (!stats.topics[topic]) stats.topics[topic] = { total: 0, correct: 0 };
        stats.topics[topic]!.total++;
        if (isCorrect) stats.topics[topic]!.correct++;
      }
    }

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

// Records today's streak completion; returns the new streak count.
function recordStreakCompletion(date: string): number {
  try { localStorage.setItem(streakDoneKey(date), '1'); } catch {}

  const current = loadStreak();
  const d = new Date(date + 'T12:00:00Z');
  d.setDate(d.getDate() - 1);
  const yesterday = d.toISOString().split('T')[0];

  let newCount: number;
  if (current.lastCompleted === yesterday) {
    newCount = current.count + 1; // streak continues
  } else if (current.lastCompleted === date) {
    newCount = current.count; // already recorded today — no double-count
  } else {
    newCount = 1; // streak broken or first ever
  }

  try {
    localStorage.setItem('quiz-streak', JSON.stringify({ lastCompleted: date, count: newCount }));
  } catch {}

  return newCount;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Pick the first question from each story — used for streak (daily) mode.
function getStreakQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const seen = new Set<string>();
  return questions.filter((q) => {
    if (seen.has(q.storyId)) return false;
    seen.add(q.storyId);
    return true;
  });
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
  countdown?: CountdownData | null;
}

type QuizMode = 'streak' | 'deep';
type UIState = 'idle' | 'loading' | 'quiz' | 'results';

export function QuizInterface({ date, initialQuiz, storyMeta, countdown }: QuizInterfaceProps) {
  // Streak only applies to today's quiz — not archive dates
  const isToday = date === new Date().toLocaleDateString('en-CA');

  const [uiState, setUIState] = useState<UIState>('idle');
  const [quizMode, setQuizMode] = useState<QuizMode>('streak');
  const [quiz, setQuiz] = useState<DailyQuiz | null>(initialQuiz);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [chosen, setChosen] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // previousResult: tracks whatever quiz was last completed (streak OR deep) — used for retry logic
  const [previousResult, setPreviousResult] = useState<StoredResult | null>(null);
  // streakResult: tracks only the streak quiz result — used to display score on Daily card
  const [streakResult, setStreakResult] = useState<StoredResult | null>(null);
  const [isRetry, setIsRetry] = useState(false);

  // Streak state
  const [streakCount, setStreakCount] = useState(0);
  const [streakDone, setStreakDone] = useState(false);
  const [justEarnedStreak, setJustEarnedStreak] = useState(0); // count shown in results

  // Cross-session last result (for score hero on Daily card)
  const [lastResult, setLastResult] = useState<LastResultData | null>(null);

  // Lifetime quiz stats
  const [stats, setStats] = useState<QuizStats>({ total: 0, correct: 0, topics: {} });

  useEffect(() => {
    // Load streak-specific result for the daily card — never overwritten by deep practice
    const saved = loadStreakResult(date);
    setStreakResult(saved);
    setPreviousResult(saved); // initialise retry base with streak result

    const streak = loadStreak();
    setStreakCount(streak.count);
    setStreakDone(isStreakDoneToday(date));

    setLastResult(loadLastResult());
    setStats(loadQuizStats());
  }, [date]);

  // How many questions each mode will use (for labelling before quiz loads)
  const deepCount = initialQuiz?.questions.length ?? 24;
  const streakCount_ = initialQuiz ? getStreakQuestions(initialQuiz.questions).length : storyMeta.length;

  async function fetchAndStart(mode: QuizMode, retryMissed = false) {
    setErrorMsg(null);
    setIsRetry(retryMissed);
    setQuizMode(mode);

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

    if (mode === 'streak') {
      questions = getStreakQuestions(questions);
    }

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

      if (isRetry) {
        // For streak retry: merge against streak answers. For deep retry: merge against previousResult.
        const mergeBase = (quizMode === 'streak' ? (streakResult ?? previousResult) : previousResult)!;
        const merged: StoredResult = {
          score: 0,
          total: mergeBase.total,
          answers: { ...mergeBase.answers, ...nextAnswers },
          completedAt: result.completedAt,
        };
        merged.score = quiz!.questions.filter(
          (q) => merged.answers[q.id] === q.correctLetter
        ).length;
        if (quizMode === 'streak') {
          saveStreakResult(date, merged);
          saveLastResult(merged.score, merged.total, date);
          setStreakResult(merged);
        } else {
          saveDeepResult(date, merged);
        }
        setPreviousResult(merged);
        setAnswers(merged.answers);
      } else {
        if (quizMode === 'streak') {
          saveStreakResult(date, result);
          saveLastResult(result.score, result.total, date);
          setStreakResult(result);
        } else {
          saveDeepResult(date, result);
        }
        setPreviousResult(result);
        setAnswers(nextAnswers);
      }

      // Record lifetime stats (first attempt only — retries would double-count)
      if (!isRetry) {
        recordQuizStats(activeQuestions, nextAnswers, storyMeta);
        setStats(loadQuizStats());
      }

      // Record streak if completing streak mode for today (not an archive date, not a retry)
      if (quizMode === 'streak' && isToday && !isRetry && !streakDone) {
        const newCount = recordStreakCompletion(date);
        setStreakCount(newCount);
        setStreakDone(true);
        setJustEarnedStreak(newCount);
      } else {
        setJustEarnedStreak(0);
      }

      setUIState('results');
    }
  }

  // ── Idle / loading state ───────────────────────────────────────────────────

  if (uiState === 'idle' || uiState === 'loading') {
    // Daily card always uses streak-specific result — never contaminated by deep practice
    const alreadyDone = streakResult !== null;
    const missedCount = streakResult ? streakResult.total - streakResult.score : 0;

    return (
      <div>
        <h3 className="font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-4">
          {alreadyDone ? 'Completed' : isToday ? "Today's quiz" : 'Practice quiz'}
        </h3>

        {/* ── Lifetime stats banner ──────────────────────────────────────── */}
        {stats.total > 0 && (() => {
          const overallPct = Math.round((stats.correct / stats.total) * 100);
          const topicEntries = (Object.entries(stats.topics) as [TopicCategory, TopicStats][])
            .filter(([, s]) => s.total >= 3) // only show topics with enough data
            .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total));
          const best = topicEntries[0];

          return (
            <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-5 py-4 mb-3">
              {/* Summary row */}
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                <span className="font-mono text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400">
                  Lifetime Stats
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 mb-4">
                <div>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{stats.total}</span>
                  <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 ml-1.5">answered</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{overallPct}%</span>
                  <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 ml-1.5">accuracy</span>
                </div>
                {best && (
                  <div>
                    <span className={`text-[11px] font-mono font-semibold ${TOPIC_STYLES[best[0]].label}`}>
                      {best[0]}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 ml-1">
                      {Math.round((best[1].correct / best[1].total) * 100)}% — strongest
                    </span>
                  </div>
                )}
              </div>

              {/* Per-topic mastery bars */}
              {topicEntries.length >= 2 && (
                <div className="space-y-2">
                  {topicEntries.map(([topic, s]) => {
                    const pct = Math.round((s.correct / s.total) * 100);
                    return (
                      <div key={topic} className="flex items-center gap-3">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${TOPIC_STYLES[topic].dot}`} />
                        <span className={`text-[10px] font-mono font-medium tracking-wide w-[100px] truncate flex-shrink-0 ${TOPIC_STYLES[topic].label}`}>
                          {topic}
                        </span>
                        <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 80 ? 'bg-emerald-500 dark:bg-emerald-400' :
                              pct >= 60 ? 'bg-amber-500 dark:bg-amber-400' :
                              'bg-rose-500 dark:bg-rose-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 w-[32px] text-right flex-shrink-0">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* ── Daily (streak) card ───────────────────────────────────────── */}
          <div
            onClick={() => !streakDone && fetchAndStart('streak', false)}
            className={`group relative flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/8 dark:hover:shadow-amber-500/5 hover:-translate-y-0.5 ${!streakDone ? 'cursor-pointer' : ''}`}
          >
            {/* Amber top bar */}
            <div className="h-[3px] bg-amber-400 dark:bg-amber-500/80 flex-shrink-0" />

            {/* Hover tint layer */}
            <div className="pointer-events-none absolute inset-0 bg-amber-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex flex-col flex-1 px-5 pt-5 pb-5 gap-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-900 dark:text-zinc-100">
                    Daily
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                    {streakCount_}q
                  </span>
                  {isToday && streakCount > 0 && (
                    <span className="text-[10px] font-mono text-amber-500 dark:text-amber-400">
                      · 🔥{streakCount}
                    </span>
                  )}
                </div>
                {isToday && streakDone && (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ done today
                  </span>
                )}
              </div>

              {/* Hero: last score (or description if no history) */}
              {(() => {
                // streakResult = today's streak quiz result; lastResult = previous day's streak result
                const displayResult = streakResult ?? lastResult;
                if (!displayResult) {
                  return (
                    <div className="flex items-end min-h-[52px]">
                      <span className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        One question per practice area. Keeps your streak alive.
                      </span>
                    </div>
                  );
                }
                const pct = Math.round((displayResult.score / displayResult.total) * 100);
                // Only show trend when displaying a previous day's result (streakResult is null = not done today)
                const showTrend = !streakResult && lastResult?.prevPct !== undefined;
                const trend = showTrend
                  ? (pct > lastResult!.prevPct! ? '↑' : pct < lastResult!.prevPct! ? '↓' : '→')
                  : null;
                const trendColor = trend === '↑'
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : trend === '↓'
                  ? 'text-rose-500 dark:text-rose-400'
                  : 'text-zinc-400 dark:text-zinc-500';
                return (
                  <>
                    <div className="flex items-end gap-3 min-h-[52px]">
                      <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
                        {pct}%
                      </span>
                      <div className="pb-1 leading-tight">
                        <p className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-amber-500 dark:text-amber-400">
                          {displayResult.score}/{displayResult.total}
                        </p>
                        {trend && (
                          <p className={`text-[10px] font-mono font-semibold tracking-[0.14em] uppercase ${trendColor}`}>
                            {trend} trend
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed -mt-1">
                      {streakResult
                        ? (streakDone ? 'Done for today — come back tomorrow.' : 'Today\'s score')
                        : 'Beat it today →'}
                    </p>
                  </>
                );
              })()}

              {errorMsg && (
                <p className="text-[12px] font-mono text-rose-500 dark:text-rose-400">
                  {errorMsg}
                </p>
              )}

              {/* Actions — pinned to bottom */}
              <div className="flex items-center gap-2 flex-wrap mt-auto">
                {uiState === 'loading' && quizMode === 'streak' ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-[13px] font-sans font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating…
                  </div>
                ) : streakDone ? (
                  <>
                    {missedCount > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Ensure retry uses streak answers (not deep practice answers)
                          if (streakResult) setPreviousResult(streakResult);
                          fetchAndStart('streak', true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[13px] font-sans font-medium hover:opacity-80 transition-opacity"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Retry {missedCount} missed
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); fetchAndStart('streak', false); }}
                      className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-[13px] font-sans hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                    >
                      Retake
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); fetchAndStart('streak', false); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white text-[13px] font-sans font-medium transition-colors"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    {quiz ? 'Start daily quiz →' : 'Generate & start →'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Deep practice card ────────────────────────────────────────── */}
          <div
            onClick={() => fetchAndStart('deep', false)}
            className="group relative flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/8 dark:hover:shadow-violet-500/5 hover:-translate-y-0.5"
          >
            {/* Violet top bar */}
            <div className="h-[3px] bg-violet-400 dark:bg-violet-500/80 flex-shrink-0" />

            {/* Hover tint layer */}
            <div className="pointer-events-none absolute inset-0 bg-violet-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex flex-col flex-1 px-5 pt-5 pb-5 gap-4">
              {/* Header */}
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-900 dark:text-zinc-100">
                  Deep Practice
                </span>
              </div>

              {/* Hero: firm countdown or question count */}
              <div className="flex items-end gap-3 min-h-[52px]">
                <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
                  {countdown ? countdown.daysLeft : deepCount}
                </span>
                <div className="pb-1 leading-tight">
                  {countdown ? (
                    <>
                      <p className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-violet-500 dark:text-violet-400">days to</p>
                      <p className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-violet-500 dark:text-violet-400 max-w-[88px] truncate">
                        {countdown.shortName}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-violet-500 dark:text-violet-400">full</p>
                      <p className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-violet-500 dark:text-violet-400">questions</p>
                    </>
                  )}
                </div>
              </div>

              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed -mt-1">
                {countdown
                  ? `${countdown.label} deadline — keep prepping daily.`
                  : 'All 3 questions per practice area. Full recall drill.'}
              </p>

              {/* Action */}
              <div className="mt-auto">
                {uiState === 'loading' && quizMode === 'deep' ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500 text-white text-[13px] font-sans font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating…
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); fetchAndStart('deep', false); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600 text-white text-[13px] font-sans font-medium transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {quiz ? 'Start deep practice →' : 'Generate & start →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link
            href="/"
            className="text-[12px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            ← Back to briefing
          </Link>
        </div>
      </div>
    );
  }

  // ── Results state ──────────────────────────────────────────────────────────

  if (uiState === 'results' && quiz) {
    const finalAnswers = answers;

    // For streak mode results: only show the questions that were in scope
    const scopedQuestions = quizMode === 'streak'
      ? getStreakQuestions(quiz.questions)
      : quiz.questions;

    const score = scopedQuestions.filter(
      (q) => finalAnswers[q.id] === q.correctLetter
    ).length;
    const total = scopedQuestions.length;
    const missedCount = total - score;
    const pct = Math.round((score / total) * 100);

    const byStory: Record<string, QuizQuestion[]> = {};
    for (const q of scopedQuestions) {
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
              <div className="min-w-0 flex-1">
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

            {/* Streak earned banner */}
            {justEarnedStreak > 0 && (
              <div className="px-5 pb-5">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/30">
                  <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-[13px] text-amber-800 dark:text-amber-200">
                    <span className="font-semibold">{justEarnedStreak}-day streak!</span>
                    {justEarnedStreak === 1
                      ? ' First daily quiz done — come back tomorrow.'
                      : ' Keep coming back daily to extend it.'}
                  </p>
                </div>
              </div>
            )}
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
              onClick={() => fetchAndStart(quizMode, true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-[13px] font-sans font-medium hover:opacity-80 transition-opacity"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry {missedCount} missed
            </button>
          )}
          {quizMode === 'streak' && (
            <button
              onClick={() => fetchAndStart('deep', false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-400 text-[13px] font-sans hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Deep practice
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
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wide">
              {currentIndex + 1} / {activeQuestions.length}
              {isRetry && ' · retry mode'}
            </span>
            {quizMode === 'streak' ? (
              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-500 dark:text-amber-400">
                <Flame className="w-2.5 h-2.5" />
                daily
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-mono text-violet-500 dark:text-violet-400">
                <Zap className="w-2.5 h-2.5" />
                deep
              </span>
            )}
          </div>
          <Link
            href="/"
            className="text-[10px] font-sans text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            ← briefing
          </Link>
        </div>
        <div className="h-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              quizMode === 'streak'
                ? 'bg-amber-500 dark:bg-amber-400'
                : 'bg-violet-500 dark:bg-violet-400'
            }`}
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
