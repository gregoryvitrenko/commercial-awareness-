'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { OnboardingData, OnboardingStage } from '@/lib/onboarding';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FirmOption {
  slug: string;
  shortName: string;
}

interface OnboardingFormProps {
  firms: FirmOption[];
  initialData: OnboardingData | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGES: { key: OnboardingStage; label: string; desc: string }[] = [
  { key: 'first-year', label: 'First year',       desc: 'Open days & insight schemes' },
  { key: 'vs',         label: 'Vacation scheme',  desc: 'Cover letters & assessment days' },
  { key: 'tc',         label: 'Interviews soon',  desc: 'TC interviews in the next 6 months' },
];

const MAX_FIRMS = 5;

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingForm({ firms, initialData }: OnboardingFormProps) {
  const router = useRouter();
  const isUpdate = !!initialData;

  const [stage, setStage]               = useState<OnboardingStage | null>(initialData?.stage ?? null);
  const [selectedFirms, setSelectedFirms] = useState<string[]>(initialData?.targetFirms ?? []);
  const [search, setSearch]             = useState('');
  const [saving, setSaving]             = useState(false);

  // ── Firm helpers ────────────────────────────────────────────────────────────

  const filteredFirms = firms.filter((f) =>
    f.shortName.toLowerCase().includes(search.toLowerCase()),
  );

  function toggleFirm(slug: string) {
    setSelectedFirms((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_FIRMS) return prev;
      return [...prev, slug];
    });
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!stage || saving) return;
    setSaving(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, targetFirms: selectedFirms }),
      });
    } finally {
      router.push('/');
      router.refresh(); // ensure server components re-fetch with new data
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-md">

      {/* Heading */}
      <div className="mb-8">
        <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-2">
          {isUpdate ? 'Your profile' : 'Getting started'}
        </p>
        <h2 className="font-serif text-[26px] font-bold text-stone-900 dark:text-stone-50 tracking-tight mb-1">
          {isUpdate ? 'Update your preferences' : 'Personalise your briefing'}
        </h2>
        <p className="text-[13px] text-stone-500 dark:text-stone-400">
          Helps us surface the most relevant firms and stories for you.
        </p>
      </div>

      {/* ── Q1: Stage ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-[12px] font-medium text-stone-700 dark:text-stone-300 mb-3">
          Where are you in the journey?
        </p>
        <div className="flex flex-col gap-2">
          {STAGES.map(({ key, label, desc }) => {
            const active = stage === key;
            return (
              <button
                key={key}
                onClick={() => setStage(key)}
                className={`w-full text-left px-4 py-3 rounded-lg border text-[13px] transition-all ${
                  active
                    ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500'
                }`}
              >
                <span className="font-medium">{label}</span>
                <span
                  className={`ml-2 text-[11px] ${
                    active
                      ? 'text-stone-400 dark:text-stone-600'
                      : 'text-stone-400 dark:text-stone-500'
                  }`}
                >
                  — {desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Q2: Target firms ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] font-medium text-stone-700 dark:text-stone-300">
            Which firms are you targeting?
          </p>
          <span className="text-[11px] text-stone-400 dark:text-stone-500 tabular-nums">
            {selectedFirms.length}/{MAX_FIRMS}
          </span>
        </div>

        {/* Selected firm tags */}
        {selectedFirms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {selectedFirms.map((slug) => {
              const firm = firms.find((f) => f.slug === slug);
              return (
                <button
                  key={slug}
                  onClick={() => toggleFirm(slug)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[11px] font-medium hover:opacity-75 transition-opacity"
                >
                  {firm?.shortName} ×
                </button>
              );
            })}
          </div>
        )}

        {/* Search input */}
        <input
          type="text"
          placeholder="Search firms…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-2 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-[13px] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-500"
        />

        {/* Firm pill grid */}
        <div className="max-h-52 overflow-y-auto rounded-lg border border-stone-200 dark:border-stone-700 p-3">
          {filteredFirms.length === 0 ? (
            <p className="text-[12px] text-stone-400 dark:text-stone-500 text-center py-4">
              No firms match &ldquo;{search}&rdquo;
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {filteredFirms.map((f) => {
                const selected = selectedFirms.includes(f.slug);
                const disabled = !selected && selectedFirms.length >= MAX_FIRMS;
                return (
                  <button
                    key={f.slug}
                    onClick={() => !disabled && toggleFirm(f.slug)}
                    disabled={disabled}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                      selected
                        ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                        : disabled
                          ? 'bg-stone-50 dark:bg-stone-800/50 text-stone-300 dark:text-stone-600 border-stone-100 dark:border-stone-800 cursor-not-allowed'
                          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500'
                    }`}
                  >
                    {f.shortName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5">
          Optional — you can update this any time.
        </p>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!stage || saving}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[13px] font-medium hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : isUpdate ? 'Save changes →' : 'Continue →'}
        </button>
        <Link
          href="/"
          className="text-[12px] text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
        >
          {isUpdate ? 'Cancel' : 'Skip for now'}
        </Link>
      </div>

    </div>
  );
}
