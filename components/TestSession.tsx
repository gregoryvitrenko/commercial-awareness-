'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle, XCircle, RotateCcw, Timer, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { AptitudeQuestion } from '@/lib/aptitude';

// ── Constants ─────────────────────────────────────────────────────────────────

const WG_SUBTYPE_ORDER = [
  'Inference',
  'Recognition of Assumptions',
  'Deduction',
  'Interpretation',
  'Evaluation of Arguments',
] as const;

const WG_SECTION_NUMBER: Record<string, number> = {
  'Inference': 1,
  'Recognition of Assumptions': 2,
  'Deduction': 3,
  'Interpretation': 4,
  'Evaluation of Arguments': 5,
};

const PROPOSED_LABEL: Record<string, string> = {
  'Inference': 'Proposed Inference',
  'Recognition of Assumptions': 'Proposed Assumption',
  'Deduction': 'Proposed Conclusion',
  'Interpretation': 'Proposed Conclusion',
  'Evaluation of Arguments': 'Proposed Argument',
};

const WG_SUBTYPE_DESCRIPTIONS: Record<string, string> = {
  'Inference': 'You will be given a short passage of factual information. After reading it, consider the proposed inference and decide whether it is: True, Probably True, Insufficient Data, Probably False, or False — based solely on the information given.',
  'Recognition of Assumptions': 'You will be presented with a statement. Below each statement is a proposed assumption. Decide whether the assumption is necessarily made in the statement — answer Assumption Made or Assumption Not Made.',
  'Deduction': 'You will be given a passage with a set of premises to treat as true. A proposed conclusion follows. Decide whether it follows beyond doubt from the given premises — Conclusion Follows or Conclusion Does Not Follow.',
  'Interpretation': 'Each item consists of a short passage followed by a proposed conclusion. Decide whether the conclusion follows beyond reasonable doubt from the facts in the passage — Conclusion Follows or Conclusion Does Not Follow.',
  'Evaluation of Arguments': 'Each question poses a proposal or question, followed by one argument. Decide whether the argument is Strong (important and directly addresses the question) or Weak (trivial, irrelevant, or fails to address the question).',
};

interface ExampleQuestion {
  passage: string;
  question: string;
  options: { letter: string; text: string }[];
  correctLetter: string;
  explanation: string;
}

interface SJTExampleQuestion {
  passage: string;
  question: string;
  options: { letter: string; text: string }[];
  correctLetter: string;
  leastEffectiveLetter: string;
  explanation: string;
}

const WG_EXAMPLES: Record<string, ExampleQuestion> = {
  'Inference': {
    passage: 'Two hundred students at City University were randomly divided into two groups of 100. One group was given a new study skills course. The other group was not. All 200 students then took the same end-of-year examination. The average mark for the group that had taken the study skills course was 65%, while the average mark for the other group was 57%.',
    question: 'The new study skills course improved students\' examination performance.',
    options: [
      { letter: 'A', text: 'True' },
      { letter: 'B', text: 'Probably True' },
      { letter: 'C', text: 'Insufficient Data' },
      { letter: 'D', text: 'Probably False' },
      { letter: 'E', text: 'False' },
    ],
    correctLetter: 'B',
    explanation: 'The course group scored higher on average (65% vs 57%), which suggests the course probably helped — but we cannot be certain without ruling out other factors, so "Probably True" is correct rather than "True".',
  },
  'Recognition of Assumptions': {
    passage: 'We need to save time on this project. Let\'s travel to the conference by plane rather than by train.',
    question: 'Travelling by plane will be faster than travelling by train.',
    options: [
      { letter: 'A', text: 'Assumption Made' },
      { letter: 'B', text: 'Assumption Not Made' },
    ],
    correctLetter: 'A',
    explanation: 'The speaker recommends flying to save time, which only makes sense if they assume flying is faster than the train. The assumption is therefore made.',
  },
  'Deduction': {
    passage: 'Some Sundays are rainy. All rainy days are cold.',
    question: 'Some Sundays are cold.',
    options: [
      { letter: 'A', text: 'Conclusion Follows' },
      { letter: 'B', text: 'Conclusion Does Not Follow' },
    ],
    correctLetter: 'A',
    explanation: 'If some Sundays are rainy, and all rainy days are cold, then those rainy Sundays must also be cold — so "Some Sundays are cold" necessarily follows.',
  },
  'Interpretation': {
    passage: 'A study of 10,000 children found that vocabulary growth between ages 3 and 5 was strongly associated with the number of books in the home. Children from homes with more than 50 books scored on average 22% higher on vocabulary tests than those from homes with fewer than 10 books.',
    question: 'Buying more books for young children will improve their vocabulary.',
    options: [
      { letter: 'A', text: 'Conclusion Follows' },
      { letter: 'B', text: 'Conclusion Does Not Follow' },
    ],
    correctLetter: 'B',
    explanation: 'The passage shows an association between books in the home and vocabulary — but association does not establish causation. The conclusion that buying books will improve vocabulary does not follow beyond reasonable doubt.',
  },
  'Evaluation of Arguments': {
    passage: 'Should all law firms be required to publish the salaries of all their employees?',
    question: 'No, because many employees would find it embarrassing if colleagues knew their salary.',
    options: [
      { letter: 'A', text: 'Argument Strong' },
      { letter: 'B', text: 'Argument Weak' },
    ],
    correctLetter: 'B',
    explanation: 'This argument is weak because it focuses on personal embarrassment rather than addressing the broader policy question of whether transparency serves the public interest. A strong argument would engage directly with the key issue.',
  },
};

const SJT_EXAMPLE: SJTExampleQuestion = {
  passage: 'You are a first-year trainee solicitor. Your supervisor asks you to draft a client update email for a major transaction closing tomorrow. You complete the draft and send it to your supervisor for review at 5pm. At 7pm, you realise you accidentally included confidential information about another client in the email. Your supervisor has not yet replied.',
  question: 'Select the MOST effective and LEAST effective response.',
  options: [
    { letter: 'A', text: 'Send a corrected version of the email to your supervisor immediately and explain the error, noting that the original should not be sent.' },
    { letter: 'B', text: 'Wait until the morning to tell your supervisor, as they have likely gone home and there is nothing they can do tonight.' },
    { letter: 'C', text: 'Call your supervisor immediately to flag the error and confirm the email has not been sent.' },
    { letter: 'D', text: 'Delete the email from your Sent folder so there is no record of the mistake.' },
  ],
  correctLetter: 'C',
  leastEffectiveLetter: 'D',
  explanation: 'C is most effective: calling immediately ensures your supervisor can act before any breach occurs — this protects the client and the firm. A is good but a phone call is faster and more urgent given the time pressure. B is poor because waiting overnight risks the email being sent. D is least effective — deleting the email is dishonest and could constitute professional misconduct.',
};

// ── Types ─────────────────────────────────────────────────────────────────────

type UIState = 'loading' | 'quiz' | 'results' | 'error';

type ScheduleItem =
  | { type: 'intro'; subtype: string }
  | { type: 'sjt-intro' }
  | { type: 'question'; questionIndex: number };

interface Answer {
  questionIndex: number;
  selected: string;
  selectedLeast?: string;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TestSessionProps {
  testType: string;
  mode: 'feedback' | 'official';
  questionCount?: number;
  format?: 'quick' | 'full';
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TestSession({ testType, mode, questionCount = 10, format = 'quick' }: TestSessionProps) {
  const isWG = testType === 'watson-glaser';

  const [uiState, setUiState] = useState<UIState>('loading');
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [allSeen, setAllSeen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [scheduleIndex, setScheduleIndex] = useState(0);

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedLeast, setSelectedLeast] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const [timeLeft, setTimeLeft] = useState(900);
  const [timerActive, setTimerActive] = useState(false);

  // ── Auto-start on mount ────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const seenKey = `ca_seen:${testType}`;
        const seenIds = JSON.parse(localStorage.getItem(seenKey) ?? '[]') as string[];

        const res = await fetch('/api/aptitude-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testType, seenIds, count: questionCount }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { questions: AptitudeQuestion[]; allSeen: boolean };
        setAllSeen(data.allSeen ?? false);
        if (cancelled) return;

        const qs = data.questions;
        setQuestions(qs);

        const sched: ScheduleItem[] = [];

        if (isWG) {
          const grouped: Record<string, number[]> = {};
          qs.forEach((q, i) => {
            if (!grouped[q.subtype]) grouped[q.subtype] = [];
            grouped[q.subtype].push(i);
          });
          for (const subtype of WG_SUBTYPE_ORDER) {
            const indices = grouped[subtype];
            if (!indices || indices.length === 0) continue;
            sched.push({ type: 'intro', subtype });
            for (const idx of indices) sched.push({ type: 'question', questionIndex: idx });
          }
          setTimeLeft(questionCount >= 40 ? 1800 : 900);
          setTimerActive(true);
        } else {
          sched.push({ type: 'sjt-intro' });
          qs.forEach((_, i) => sched.push({ type: 'question', questionIndex: i }));
        }

        setSchedule(sched);
        setScheduleIndex(0);
        setUiState('quiz');
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e instanceof Error ? e.message : 'Failed to load questions');
          setUiState('error');
        }
      }
    }

    void load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Timer ──────────────────────────────────────────────────────────────────

  const finishQuiz = useCallback(() => {
    setTimerActive(false);
    setUiState('results');
  }, []);

  useEffect(() => {
    if (!timerActive || !isWG) return;
    if (timeLeft <= 0) { setTimerActive(false); finishQuiz(); return; }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  });

  // ── Persist seen question IDs on session end ───────────────────────────────

  useEffect(() => {
    if (uiState !== 'results' || questions.length === 0) return;
    const seenKey = `ca_seen:${testType}`;
    if (allSeen) {
      // We've now cycled through everything — reset so next session starts fresh
      localStorage.removeItem(seenKey);
    } else {
      const ids = questions.map((q) => q.id);
      const existing = JSON.parse(localStorage.getItem(seenKey) ?? '[]') as string[];
      const merged = Array.from(new Set([...existing, ...ids]));
      localStorage.setItem(seenKey, JSON.stringify(merged));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Navigation ─────────────────────────────────────────────────────────────

  function advance() {
    const next = scheduleIndex + 1;
    if (next >= schedule.length) { finishQuiz(); return; }
    setScheduleIndex(next);
    setSelectedLetter(null);
    setSelectedLeast(null);
    setRevealed(false);
  }

  function recordAnswer(qIndex: number, sel: string, selLeast?: string) {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionIndex === qIndex);
      const entry: Answer = { questionIndex: qIndex, selected: sel, selectedLeast: selLeast };
      if (existing >= 0) { const c = [...prev]; c[existing] = entry; return c; }
      return [...prev, entry];
    });
  }

  function handleWGSelect(letter: string, qIndex: number) {
    if (revealed) return;
    setSelectedLetter(letter);
    recordAnswer(qIndex, letter);
    if (mode === 'feedback') {
      setRevealed(true);
    }
    // official mode: no reveal, Next button appears via selectedLetter check
  }

  function handleSJTConfirm(qIndex: number) {
    if (!selectedLetter || !selectedLeast) return;
    recordAnswer(qIndex, selectedLetter, selectedLeast);
    if (mode === 'feedback') { setRevealed(true); }
    else { advance(); }
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const questionsAnsweredBeforeCurrent = schedule
    .slice(0, scheduleIndex)
    .filter((s): s is { type: 'question'; questionIndex: number } => s.type === 'question')
    .length;

  const totalQuestionsInSchedule = schedule.filter((s) => s.type === 'question').length;

  // ── Results ────────────────────────────────────────────────────────────────

  function calcResults() {
    let correct = 0;
    const bySubtype: Record<string, { correct: number; total: number }> = {};
    for (const answer of answers) {
      const q = questions[answer.questionIndex];
      if (!q) continue;
      if (!bySubtype[q.subtype]) bySubtype[q.subtype] = { correct: 0, total: 0 };
      bySubtype[q.subtype].total++;
      const isCorrect = testType === 'sjt'
        ? answer.selected === q.correctLetter && answer.selectedLeast === q.leastEffectiveLetter
        : answer.selected === q.correctLetter;
      if (isCorrect) { correct++; bySubtype[q.subtype].correct++; }
    }
    return { correct, total: questions.length, bySubtype };
  }

  // ── Shared wrapper ─────────────────────────────────────────────────────────

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
      {/* Minimal top bar */}
      <div className="h-[3px] bg-stone-900 dark:bg-stone-100 shrink-0" />
      <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0">
        <Link
          href={`/tests/${testType}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 rounded-sm px-3 py-1.5 transition-colors"
        >
          <ChevronLeft size={14} />
          Exit
        </Link>
        <span className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
          {testType === 'watson-glaser' ? 'Watson Glaser' : 'Situational Judgement'}
          {' · '}
          {format === 'full' ? 'Full simulation' : 'Quick practice'}
          {' · '}
          {mode === 'feedback' ? 'Feedback' : 'Official'}
        </span>
        {isWG && uiState === 'quiz' ? (
          <div className={`flex items-center gap-1.5 font-sans text-[12px] ${timeLeft < 120 ? 'text-rose-500 dark:text-rose-400' : 'text-stone-400 dark:text-stone-500'}`}>
            <Timer size={12} />
            {formatTime(timeLeft)}
          </div>
        ) : (
          <div className="w-16" /> /* spacer to keep title centred */
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          {children}
        </div>
      </div>
    </div>
  );

  // ── Loading ────────────────────────────────────────────────────────────────

  if (uiState === 'loading') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 mt-24">
          <Loader2 size={22} className="animate-spin text-stone-400" />
          <p className="text-[13px] text-stone-500 dark:text-stone-400">Generating questions…</p>
        </div>
      </Shell>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (uiState === 'error') {
    return (
      <Shell>
        <div className="text-center mt-24 space-y-4">
          <p className="text-[14px] text-rose-600 dark:text-rose-400">{errorMsg}</p>
          <Link
            href={`/tests/${testType}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 rounded-sm px-3 py-1.5 transition-colors"
          >
            <ChevronLeft size={14} /> Back to overview
          </Link>
        </div>
      </Shell>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────

  if (uiState === 'results') {
    const { correct, total, bySubtype } = calcResults();
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
      <Shell>
        <div className="space-y-8">
          {/* Score */}
          <div className="text-center py-6">
            <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-2">Your Score</p>
            <p className="font-serif text-[64px] font-bold text-stone-900 dark:text-stone-50 leading-none">{pct}%</p>
            <p className="text-[14px] text-stone-500 dark:text-stone-400 mt-2">{correct} / {total} correct</p>
          </div>

          {/* Per-subtype breakdown */}
          {Object.keys(bySubtype).length > 1 && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-5 py-4">
              <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-4">Breakdown by section</p>
              <div className="space-y-3">
                {Object.entries(bySubtype).map(([sub, { correct: c, total: t }]) => (
                  <div key={sub} className="flex items-center gap-3">
                    <span className="text-[12px] text-stone-600 dark:text-stone-400 flex-1 min-w-0">{sub}</span>
                    <span className="font-sans text-[11px] text-stone-500 dark:text-stone-400 shrink-0">{c}/{t}</span>
                    <div className="w-24 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-stone-700 dark:bg-stone-300 rounded-full" style={{ width: `${t > 0 ? (c / t) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official mode: full answer review */}
          {mode === 'official' && (
            <div className="space-y-3">
              <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500">Answer Review</p>
              {answers.map((answer) => {
                const q = questions[answer.questionIndex];
                if (!q) return null;
                const isCorrect = testType === 'sjt'
                  ? answer.selected === q.correctLetter && answer.selectedLeast === q.leastEffectiveLetter
                  : answer.selected === q.correctLetter;
                return (
                  <div key={answer.questionIndex} className={`rounded-sm border px-4 py-3 ${isCorrect ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30' : 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30'}`}>
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? <CheckCircle size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" /> : <XCircle size={13} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-0.5">{q.subtype}</p>
                        {q.passage && <p className="text-[11px] text-stone-600 dark:text-stone-400 mb-1 leading-relaxed">{q.passage}</p>}
                        <p className="text-[12px] font-semibold text-stone-800 dark:text-stone-200 mb-1">{q.question}</p>
                        {testType === 'sjt' ? (
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            Most: <span className="font-semibold">{answer.selected}</span>
                            {answer.selected !== q.correctLetter && <span className="text-rose-600 dark:text-rose-400"> (correct: {q.correctLetter})</span>}
                            {' · '}
                            Least: <span className="font-semibold">{answer.selectedLeast}</span>
                            {answer.selectedLeast !== q.leastEffectiveLetter && <span className="text-rose-600 dark:text-rose-400"> (correct: {q.leastEffectiveLetter})</span>}
                          </p>
                        ) : (
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            Your answer: <span className="font-semibold">{answer.selected}</span>
                            {answer.selected !== q.correctLetter && <span className="text-rose-600 dark:text-rose-400"> (correct: {q.correctLetter})</span>}
                          </p>
                        )}
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-2 leading-relaxed border-t border-stone-200 dark:border-stone-700 pt-2">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href={`/tests/${testType}/practice?format=${format}&mode=${mode}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[12px] font-semibold rounded-sm hover:opacity-90 transition-opacity"
            >
              <RotateCcw size={12} />
              Practice again
            </Link>
            <Link
              href={`/tests/${testType}`}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 rounded-sm px-3 py-1.5 transition-colors"
            >
              <ChevronLeft size={14} />
              Back to overview
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────

  const currentItem = schedule[scheduleIndex];
  if (!currentItem) return null;

  // ── Intro screen ───────────────────────────────────────────────────────────

  if (currentItem.type === 'intro' || currentItem.type === 'sjt-intro') {
    const subtype = currentItem.type === 'intro' ? currentItem.subtype : 'Situational Judgement';
    const sectionNum = currentItem.type === 'intro' ? WG_SECTION_NUMBER[subtype] : 1;
    const description = currentItem.type === 'intro'
      ? WG_SUBTYPE_DESCRIPTIONS[subtype]
      : 'Each question presents a realistic workplace scenario. Select the MOST effective and the LEAST effective response from the four options.';
    const example = currentItem.type === 'intro' ? WG_EXAMPLES[subtype] : null;
    const sjtExample = currentItem.type === 'sjt-intro' ? SJT_EXAMPLE : null;

    return (
      <Shell>
        <div>
          <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1">
            {isWG ? `Section ${sectionNum} of 5` : 'Instructions'}
          </p>
          <h2 className="font-serif text-[26px] font-bold text-stone-900 dark:text-stone-50 mb-4">{subtype}</h2>
          <p className="text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed mb-7">{description}</p>

          {/* Worked example */}
          <div className="border border-stone-200 dark:border-stone-700 rounded-sm px-5 py-5 mb-7 bg-stone-50 dark:bg-stone-800/40">
            <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-5">Worked Example</p>

            {example && (
              <>
                <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1">Statement:</p>
                <p className="text-[13px] text-stone-700 dark:text-stone-300 leading-relaxed mb-4">{example.passage}</p>
                <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1">
                  {PROPOSED_LABEL[subtype] ?? 'Proposed Statement'}:
                </p>
                <p className="text-[14px] font-semibold text-stone-800 dark:text-stone-200 mb-5">{example.question}</p>
                <div className={`grid gap-2 mb-5 ${example.options.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-5'}`}>
                  {example.options.map((opt) => (
                    <div
                      key={opt.letter}
                      className={`rounded-sm border px-3 py-2 text-center text-[12px] font-semibold ${
                        opt.letter === example.correctLetter
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200'
                          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      {opt.text}
                    </div>
                  ))}
                </div>
                <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
                  <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1">Answer Feedback:</p>
                  <p className="text-[12px] text-stone-600 dark:text-stone-400 leading-relaxed">{example.explanation}</p>
                </div>
              </>
            )}

            {sjtExample && (
              <>
                <p className="text-[13px] text-stone-700 dark:text-stone-300 leading-relaxed mb-4">{sjtExample.passage}</p>
                <p className="text-[12px] font-semibold text-stone-600 dark:text-stone-400 mb-3">{sjtExample.question}</p>
                <div className="space-y-2 mb-5">
                  {sjtExample.options.map((opt) => {
                    const isMost = opt.letter === sjtExample.correctLetter;
                    const isLeast = opt.letter === sjtExample.leastEffectiveLetter;
                    return (
                      <div key={opt.letter} className={`rounded-sm border px-3 py-2 text-[12px] flex items-start gap-3 ${isMost ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : isLeast ? 'border-rose-400 dark:border-rose-600 bg-rose-50 dark:bg-rose-950/40' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900'}`}>
                        <span className="font-sans text-[11px] text-stone-400 shrink-0 mt-0.5">{opt.letter}</span>
                        <span className={`flex-1 ${isMost ? 'text-emerald-800 dark:text-emerald-200' : isLeast ? 'text-rose-800 dark:text-rose-200' : 'text-stone-600 dark:text-stone-400'}`}>{opt.text}</span>
                        {isMost && <span className="text-[9px] font-sans uppercase tracking-wide text-emerald-600 dark:text-emerald-400 shrink-0">Most</span>}
                        {isLeast && <span className="text-[9px] font-sans uppercase tracking-wide text-rose-600 dark:text-rose-400 shrink-0">Least</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
                  <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1">Answer Feedback:</p>
                  <p className="text-[12px] text-stone-600 dark:text-stone-400 leading-relaxed">{sjtExample.explanation}</p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={advance}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[12px] font-semibold rounded-sm hover:opacity-90 transition-opacity"
          >
            Start section →
          </button>
        </div>
      </Shell>
    );
  }

  // ── Question screen ────────────────────────────────────────────────────────

  const { questionIndex } = currentItem;
  const q = questions[questionIndex];
  if (!q) return null;

  const isSJT = testType === 'sjt';
  const isInference = q.subtype === 'Inference';
  const proposedLabel = PROPOSED_LABEL[q.subtype] ?? 'Proposed Statement';
  const canConfirmSJT = !!selectedLetter && !!selectedLeast && selectedLetter !== selectedLeast;
  const answerIsCorrect = isSJT
    ? selectedLetter === q.correctLetter && selectedLeast === q.leastEffectiveLetter
    : selectedLetter === q.correctLetter;
  const questionNumber = questionsAnsweredBeforeCurrent + 1;

  return (
    <Shell>
      <div>
        {/* Progress bar */}
        <div className="w-full h-0.5 bg-stone-200 dark:bg-stone-800 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-stone-700 dark:bg-stone-300 rounded-full transition-all duration-300"
            style={{ width: `${totalQuestionsInSchedule > 0 ? ((questionNumber - 1) / totalQuestionsInSchedule) * 100 : 0}%` }}
          />
        </div>

        {/* Question counter + subtype */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500">{q.subtype}</span>
          <span className="font-sans text-[10px] text-stone-400 dark:text-stone-500">{questionNumber} / {totalQuestionsInSchedule}</span>
        </div>

        {/* WG: Statement + Proposed X */}
        {!isSJT && (
          <>
            <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1">Statement:</p>
            <p className="text-[15px] text-stone-700 dark:text-stone-300 leading-relaxed mb-6">{q.passage}</p>
            <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1">{proposedLabel}:</p>
            <p className="text-[15px] font-semibold text-stone-800 dark:text-stone-200 leading-snug mb-8">{q.question}</p>
          </>
        )}

        {/* SJT: scenario + question */}
        {isSJT && (
          <>
            <p className="text-[15px] text-stone-700 dark:text-stone-300 leading-relaxed mb-6">{q.passage}</p>
            <p className="text-[13px] font-semibold text-stone-800 dark:text-stone-200 mb-5">{q.question}</p>
          </>
        )}

        {/* WG options */}
        {!isSJT && (
          <div className={`grid gap-2 mb-6 ${isInference ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2'}`}>
            {q.options.map((opt) => {
              const isSelected = selectedLetter === opt.letter;
              const isCorrect = opt.letter === q.correctLetter;
              let cls = 'rounded-sm border px-3 py-3 text-center text-[13px] font-semibold transition-colors ';
              if (revealed) {
                if (isCorrect) cls += 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200';
                else if (isSelected) cls += 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 text-rose-800 dark:text-rose-200';
                else cls += 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-400 dark:text-stone-500';
              } else if (isSelected) {
                cls += 'bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100 text-stone-50 dark:text-stone-900 cursor-pointer';
              } else {
                cls += 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-500 dark:hover:border-stone-400 cursor-pointer';
              }
              return (
                <button key={opt.letter} onClick={() => handleWGSelect(opt.letter, questionIndex)} disabled={revealed} className={cls}>
                  {opt.text}
                </button>
              );
            })}
          </div>
        )}

        {/* SJT options */}
        {isSJT && (
          <div className="space-y-2 mb-6">
            {q.options.map((opt) => {
              const isMostSelected = selectedLetter === opt.letter;
              const isLeastSelected = selectedLeast === opt.letter;
              let rowCls = 'rounded-sm border px-4 py-3 flex items-start gap-3 transition-colors ';
              if (revealed) {
                if (opt.letter === q.correctLetter) rowCls += 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30';
                else if (opt.letter === q.leastEffectiveLetter) rowCls += 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/30';
                else rowCls += 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900';
              } else {
                rowCls += 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900';
              }
              return (
                <div key={opt.letter} className={rowCls}>
                  <span className="font-sans text-[11px] text-stone-400 shrink-0 mt-0.5">{opt.letter}</span>
                  <span className="flex-1 text-[13px] text-stone-700 dark:text-stone-300 leading-relaxed">{opt.text}</span>
                  {!revealed && (
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => { if (isMostSelected) { setSelectedLetter(null); return; } if (selectedLeast === opt.letter) return; setSelectedLetter(opt.letter); }}
                        disabled={selectedLeast === opt.letter}
                        className={`text-[9px] font-sans uppercase tracking-wide px-2 py-0.5 rounded border transition-colors ${isMostSelected ? 'bg-emerald-600 border-emerald-600 text-white' : selectedLeast === opt.letter ? 'border-stone-200 dark:border-stone-700 text-stone-300 dark:text-stone-600 cursor-not-allowed' : 'border-stone-300 dark:border-stone-600 text-stone-500 dark:text-stone-400 hover:border-emerald-400 hover:text-emerald-600'}`}
                      >M</button>
                      <button
                        onClick={() => { if (isLeastSelected) { setSelectedLeast(null); return; } if (selectedLetter === opt.letter) return; setSelectedLeast(opt.letter); }}
                        disabled={selectedLetter === opt.letter}
                        className={`text-[9px] font-sans uppercase tracking-wide px-2 py-0.5 rounded border transition-colors ${isLeastSelected ? 'bg-rose-600 border-rose-600 text-white' : selectedLetter === opt.letter ? 'border-stone-200 dark:border-stone-700 text-stone-300 dark:text-stone-600 cursor-not-allowed' : 'border-stone-300 dark:border-stone-600 text-stone-500 dark:text-stone-400 hover:border-rose-400 hover:text-rose-600'}`}
                      >L</button>
                    </div>
                  )}
                  {revealed && (
                    <div className="flex gap-1.5 shrink-0">
                      {opt.letter === q.correctLetter && <span className="text-[9px] font-sans uppercase tracking-wide px-1.5 py-0.5 rounded border border-emerald-400 text-emerald-600 dark:text-emerald-400">Most</span>}
                      {opt.letter === q.leastEffectiveLetter && <span className="text-[9px] font-sans uppercase tracking-wide px-1.5 py-0.5 rounded border border-rose-400 text-rose-600 dark:text-rose-400">Least</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SJT confirm */}
        {isSJT && !revealed && (
          <button
            onClick={() => handleSJTConfirm(questionIndex)}
            disabled={!canConfirmSJT}
            className="mb-5 inline-flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[12px] font-semibold rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        )}

        {/* Feedback (feedback mode only) */}
        {revealed && mode === 'feedback' && (
          <div className={`rounded-sm border px-4 py-3 mb-5 ${answerIsCorrect ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30' : 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30'}`}>
            <div className="flex items-center gap-2 mb-1.5">
              {answerIsCorrect ? <CheckCircle size={13} className="text-emerald-600 dark:text-emerald-400" /> : <XCircle size={13} className="text-rose-600 dark:text-rose-400" />}
              <span className={`text-[11px] font-semibold ${answerIsCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                {answerIsCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1">Answer Feedback:</p>
            <p className="text-[12px] text-stone-600 dark:text-stone-400 leading-relaxed">{q.explanation}</p>
          </div>
        )}

        {/* Next / Finish */}
        {(revealed || (mode === 'official' && !isSJT && !!selectedLetter)) && (
          <button
            onClick={advance}
            className="inline-flex items-center gap-2 px-4 py-2 border border-stone-200 dark:border-stone-700 text-[12px] font-semibold text-stone-700 dark:text-stone-300 rounded-sm hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {scheduleIndex + 1 >= schedule.length ? 'Finish' : 'Next →'}
          </button>
        )}
      </div>
    </Shell>
  );
}
