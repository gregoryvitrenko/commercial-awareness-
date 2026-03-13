'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2, XCircle, RotateCcw, ArrowLeft, Trophy, Flame, Zap, BarChart3 } from 'lucide-react';
import type { DailyQuiz, QuizQuestion, TopicCategory } from '@/lib/types';
import { TOPIC_STYLES } from '@/lib/types';
import type { GamificationData } from '@/lib/quiz-gamification';

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
        <span className={`text-label font-sans font-semibold tracking-[0.12em] uppercase ${styles.label}`}>
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
      <span className="text-label font-sans text-stone-400 dark:text-stone-500 flex-shrink-0">
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
  /** When true: auto-start immediately with all questions (practice mode, no card selection) */
  isPractice?: boolean;
}

type QuizMode = 'streak' | 'practice';
type UIState = 'idle' | 'loading' | 'quiz' | 'results';

export function QuizInterface({ date, initialQuiz, storyMeta, countdown, isPractice = false }: QuizInterfaceProps) {
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

  // Server-persisted gamification (XP / level / streak)
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);

  // Level-up overlay
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(0);

  useEffect(() => {
    // Load streak-specific result for the daily card — never overwritten by practice
    const saved = loadStreakResult(date);
    setStreakResult(saved);
    setPreviousResult(saved); // initialise retry base with streak result

    const streak = loadStreak();
    setStreakCount(streak.count);
    setStreakDone(isStreakDoneToday(date));

    setLastResult(loadLastResult());
    setStats(loadQuizStats());
  }, [date]);

  // Practice mode: auto-start immediately with all questions — no card selection screen
  useEffect(() => {
    if (isPractice && initialQuiz && uiState === 'idle') {
      setQuiz(initialQuiz);
      setActiveQuestions(initialQuiz.questions);
      setCurrentIndex(0);
      setAnswers({});
      setChosen(null);
      setUIState('quiz');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPractice, initialQuiz]);

  // How many questions in streak mode (for labelling before quiz loads)
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

    // streak mode: 1 question per story (keeps the daily brief + preserves streak)
    // practice mode: all questions
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
        }
        setPreviousResult(merged);
        setAnswers(merged.answers);
      } else {
        if (quizMode === 'streak') {
          saveStreakResult(date, result);
          saveLastResult(result.score, result.total, date);
          setStreakResult(result);
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

      // Fire-and-forget gamification POST on first completion only
      if (!isRetry) {
        const completionType = isPractice ? 'practice' : 'daily';
        fetch('/api/quiz/gamification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: completionType }),
        })
          .then((r) => r.json())
          .then((data: GamificationData) => {
            setGamificationData(data);
            if (data.leveledUp) {
              setLevelUpLevel(data.level);
              setShowLevelUp(true);
              setTimeout(() => setShowLevelUp(false), 2600);
            }
          })
          .catch(() => {});
      }
    }
  }

  // ── Level-up overlay ──────────────────────────────────────────────────────
  const levelUpOverlay = showLevelUp && (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-level-up-overlay bg-[#1B2333]/90 pointer-events-none">
      <div className="text-center animate-level-up-number">
        <p className="font-sans text-label tracking-widest uppercase text-white/40 mb-4">
          Level Up
        </p>
        <p className="font-serif text-[7rem] font-bold text-white leading-none tracking-tight">
          {levelUpLevel}
        </p>
      </div>
    </div>
  );

  // ── Idle / loading state ───────────────────────────────────────────────────

  if (uiState === 'idle' || uiState === 'loading') {
    // Daily card always uses streak-specific result — never contaminated by deep practice
    const alreadyDone = streakResult !== null;
    const missedCount = streakResult ? streakResult.total - streakResult.score : 0;

    return (
      <div>
        {levelUpOverlay}
        <h3 className="section-label mb-4">
          Choose your practice
        </h3>

        {/* ── Lifetime stats banner ──────────────────────────────────────── */}
        {stats.total > 0 && (() => {
          const overallPct = Math.round((stats.correct / stats.total) * 100);
          const topicEntries = (Object.entries(stats.topics) as [TopicCategory, TopicStats][])
            .filter(([, s]) => s.total >= 3) // only show topics with enough data
            .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total));
          const best = topicEntries[0];

          return (
            <div className="rounded-card bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-5 py-4 mb-3">
              {/* Summary row */}
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 flex-shrink-0" />
                <span className="font-sans text-label font-semibold tracking-[0.15em] uppercase text-stone-500 dark:text-stone-400">
                  Lifetime Stats
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 mb-4">
                <div>
                  <span className="text-2xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">{stats.total}</span>
                  <span className="text-label font-sans text-stone-400 dark:text-stone-500 ml-1.5">answered</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">{overallPct}%</span>
                  <span className="text-label font-sans text-stone-400 dark:text-stone-500 ml-1.5">accuracy</span>
                </div>
                {best && (
                  <div>
                    <span className={`text-label font-sans font-semibold ${TOPIC_STYLES[best[0]].label}`}>
                      {best[0]}
                    </span>
                    <span className="text-label font-sans text-stone-400 dark:text-stone-500 ml-1">
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
                        <span className={`text-label font-sans font-medium tracking-wide w-[100px] truncate flex-shrink-0 ${TOPIC_STYLES[topic].label}`}>
                          {topic}
                        </span>
                        <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 80 ? 'bg-emerald-500 dark:bg-emerald-400' :
                              pct >= 60 ? 'bg-charcoal/70 dark:bg-charcoal-light' :
                              'bg-rose-500 dark:bg-rose-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-label font-sans text-stone-400 dark:text-stone-500 w-[32px] text-right flex-shrink-0">
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

        {/* ── Daily (streak) card ─────────────────────────────────────────── */}
        <div>
          <div
            onClick={() => !streakDone && fetchAndStart('streak', false)}
            className={`group relative flex flex-col rounded-card bg-stone-900 dark:bg-stone-950 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-stone-900/10 hover:-translate-y-0.5 ${!streakDone ? 'cursor-pointer' : ''}`}
          >
            <div className="relative flex flex-col flex-1 px-5 pt-5 pb-5 gap-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <span className="text-label font-sans font-semibold tracking-widest uppercase text-stone-50">
                    Daily
                  </span>
                  <span className="text-label font-sans text-stone-400">
                    {streakCount_}q
                  </span>
                  {isToday && streakCount > 0 && (
                    <span className="text-label font-sans text-stone-400">
                      · {streakCount}d
                    </span>
                  )}
                </div>
                {isToday && streakDone && (
                  <span className="text-label font-sans text-emerald-400 font-medium">
                    done today
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
                      <span className="text-caption text-stone-400 leading-relaxed">
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
                  ? 'text-emerald-400'
                  : trend === '↓'
                  ? 'text-rose-400'
                  : 'text-stone-400';
                return (
                  <>
                    <div className="flex items-end gap-3 min-h-[52px]">
                      <span className="text-5xl font-bold text-stone-50 tracking-tight leading-none">
                        {pct}%
                      </span>
                      <div className="pb-1 leading-tight">
                        <p className="text-label font-sans font-semibold tracking-[0.14em] uppercase text-charcoal dark:text-charcoal-light">
                          {displayResult.score}/{displayResult.total}
                        </p>
                        {trend && (
                          <p className={`text-label font-sans font-semibold tracking-[0.14em] uppercase ${trendColor}`}>
                            {trend} trend
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-caption text-stone-400 leading-relaxed -mt-1">
                      {streakResult
                        ? (streakDone ? 'Done for today — come back tomorrow.' : 'Today\'s score')
                        : 'Beat it today →'}
                    </p>
                  </>
                );
              })()}

              {errorMsg && (
                <p className="text-caption font-sans text-rose-400">
                  {errorMsg}
                </p>
              )}

              {/* Actions — pinned to bottom */}
              <div className="flex items-center gap-2 flex-wrap mt-auto">
                {uiState === 'loading' && quizMode === 'streak' ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-card bg-stone-50 text-stone-900 text-caption font-sans font-medium">
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
                        className="flex items-center gap-2 px-4 py-2.5 rounded-card bg-stone-50 text-stone-900 text-caption font-sans font-medium hover:bg-white transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Retry {missedCount} missed
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); fetchAndStart('streak', false); }}
                      className="px-4 py-2.5 rounded-card border border-stone-700 text-stone-400 text-caption font-sans hover:text-stone-100 hover:border-stone-500 transition-colors"
                    >
                      Retake
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); fetchAndStart('streak', false); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-card bg-stone-50 hover:bg-white text-stone-900 text-caption font-sans font-medium transition-colors"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    {quiz ? 'Start daily quiz →' : 'Generate & start →'}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // ── Results state ──────────────────────────────────────────────────────────

  if (uiState === 'results' && quiz) {
    const finalAnswers = answers;

    // Scope questions to what was actually in the session
    const scopedQuestions = isPractice
      ? quiz.questions
      : getStreakQuestions(quiz.questions);

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
        {levelUpOverlay}
        {/* Score card */}
        <div>
          <h3 className="section-label mb-3">
            Results
          </h3>
          <div className="rounded-card bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="px-5 py-6 flex items-center gap-5">
              <Trophy className={`w-9 h-9 flex-shrink-0 ${pct >= 80 ? 'text-charcoal dark:text-charcoal-light' : pct >= 60 ? 'text-stone-400' : 'text-stone-300 dark:text-stone-600'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
                  {score} / {total}
                </p>
                <p className="text-caption text-stone-500 dark:text-stone-400 mt-0.5">
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
                <div className="flex items-center gap-2 px-4 py-3 rounded-card bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
                  <Flame className="w-4 h-4 text-stone-400 dark:text-stone-500 flex-shrink-0" />
                  <p className="text-caption text-stone-700 dark:text-stone-300">
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

        {/* Gamification panel — XP earned, shown after first completion only */}
        {gamificationData && !isRetry && (
          <div className="rounded-card bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-5 py-4">
            <p className="section-label mb-3">XP Earned</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {/* Level */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
                  Lvl {gamificationData.level}
                </span>
                <span className="text-label font-sans text-stone-400 dark:text-stone-500">
                  +{quizMode === 'streak' ? 100 : 150} XP
                </span>
              </div>
              {/* XP progress bar */}
              <div className="flex-1 min-w-[120px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-label font-sans text-stone-500 dark:text-stone-400">
                    {gamificationData.xp % 100}/100 XP
                  </span>
                </div>
                <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-charcoal dark:bg-stone-300 rounded-full transition-all duration-500"
                    style={{ width: `${gamificationData.xp % 100}%` }}
                  />
                </div>
              </div>
              {/* Streak */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
                  {gamificationData.streak}
                </span>
                <span className="text-label font-sans text-stone-400 dark:text-stone-500">
                  day streak
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Per-topic breakdown */}
        <div>
          <h3 className="section-label mb-3">
            By practice area
          </h3>
          <div className="rounded-card bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
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
              className="flex items-center gap-2 px-4 py-2 rounded-chrome bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-caption font-sans font-medium hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry {missedCount} missed
            </button>
          )}
          <Link
            href={isPractice ? '/quiz' : '/'}
            className="flex items-center gap-1.5 px-4 py-2 rounded-chrome border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-caption font-sans hover:text-stone-900 dark:hover:text-stone-100 hover:border-stone-400 dark:hover:border-stone-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {isPractice ? 'Back to quiz' : 'Back to briefing'}
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
      'w-full text-left px-4 py-3.5 rounded-card border text-caption font-sans leading-snug transition-colors';

    if (!isAnswered) {
      return `${base} border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800/40 cursor-pointer`;
    }

    if (letter === currentQ.correctLetter) {
      return `${base} border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 cursor-default`;
    }

    if (letter === chosen) {
      return `${base} border-rose-400 dark:border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-100 cursor-default`;
    }

    return `${base} border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-400 dark:text-stone-500 cursor-default opacity-60`;
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      {levelUpOverlay}

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-label font-sans text-stone-400 dark:text-stone-500 tracking-wide">
              {currentIndex + 1} / {activeQuestions.length}
              {isRetry && ' · retry mode'}
            </span>
            {isPractice ? (
              <span className="flex items-center gap-1 text-label font-sans text-stone-400 dark:text-stone-500">
                <Zap className="w-2.5 h-2.5" />
                practice
              </span>
            ) : (
              <span className="flex items-center gap-1 text-label font-sans text-stone-400 dark:text-stone-500">
                <Flame className="w-2.5 h-2.5" />
                daily
              </span>
            )}
          </div>
          <Link
            href="/"
            className="text-label font-sans text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            ← briefing
          </Link>
        </div>
        <div className="h-0.5 bg-stone-200 dark:bg-stone-800 rounded-full">
          <div
            className="h-full rounded-full transition-all duration-300 bg-stone-900 dark:bg-stone-400"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Story context */}
      {meta && (
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
          <span className={`text-label font-sans font-semibold tracking-[0.12em] uppercase ${styles.label}`}>
            {meta.topic}
          </span>
          <span className="text-stone-300 dark:text-stone-700 text-label">·</span>
          <span className="text-label text-stone-500 dark:text-stone-400 font-sans truncate">
            {meta.headline}
          </span>
        </div>
      )}

      {/* Question */}
      <h2 className="font-serif text-subheading sm:text-xl font-bold leading-snug text-stone-900 dark:text-stone-50 tracking-tight mb-6">
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
            <span className="font-sans text-label text-stone-400 dark:text-stone-500 mr-2.5">
              {opt.letter}
            </span>
            {opt.text}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {isAnswered && (
        <div className={`flex items-start gap-3 px-4 py-3.5 rounded-card mb-6 border ${
          isCorrect
            ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-800/40'
            : 'bg-rose-50 dark:bg-rose-900/15 border-rose-200 dark:border-rose-800/40'
        }`}>
          {isCorrect
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            : <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          }
          <p className={`text-caption leading-relaxed ${
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
          className="px-4 py-2 rounded-chrome bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-caption font-sans font-medium hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {currentIndex + 1 === activeQuestions.length ? 'See results →' : 'Next →'}
        </button>
      </div>

    </div>
  );
}
