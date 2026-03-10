'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, X, ChevronDown, Check, Clock, Send, MessageSquare, Award, XCircle,
  StickyNote, Trash2, Building2,
} from 'lucide-react';
import type { TrackedApplication, ApplicationStatus, FirmDeadline, FirmTier } from '@/lib/types';

// ── Types ────────────────────────────────────────────────────────────────────

interface FirmForClient {
  slug: string;
  name: string;
  shortName: string;
  tier: FirmTier;
  deadlines: FirmDeadline[];
}

interface TrackerDashboardProps {
  initialApplications: TrackedApplication[];
  targetFirmSlugs: string[];
  firms: FirmForClient[];
}

// ── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ApplicationStatus, {
  label: string;
  icon: typeof Check;
  bg: string;
  text: string;
  border: string;
  activeBg: string;
  activeText: string;
}> = {
  'not-started': {
    label: 'Not started',
    icon: Clock,
    bg: 'bg-stone-50 dark:bg-stone-800/60',
    text: 'text-stone-500 dark:text-stone-400',
    border: 'border-stone-200 dark:border-stone-700',
    activeBg: 'bg-stone-200 dark:bg-stone-700',
    activeText: 'text-stone-700 dark:text-stone-200',
  },
  'in-progress': {
    label: 'In progress',
    icon: Clock,
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    activeBg: 'bg-amber-100 dark:bg-amber-900/60',
    activeText: 'text-amber-700 dark:text-amber-300',
  },
  submitted: {
    label: 'Submitted',
    icon: Send,
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    activeBg: 'bg-blue-100 dark:bg-blue-900/60',
    activeText: 'text-blue-700 dark:text-blue-300',
  },
  interview: {
    label: 'Interview',
    icon: MessageSquare,
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-800',
    activeBg: 'bg-violet-100 dark:bg-violet-900/60',
    activeText: 'text-violet-700 dark:text-violet-300',
  },
  offer: {
    label: 'Offer',
    icon: Award,
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    activeBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    activeText: 'text-emerald-700 dark:text-emerald-300',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    activeBg: 'bg-rose-100 dark:bg-rose-900/60',
    activeText: 'text-rose-700 dark:text-rose-300',
  },
};

const ALL_STATUSES: ApplicationStatus[] = [
  'not-started', 'in-progress', 'submitted', 'interview', 'offer', 'rejected',
];

const TIER_ORDER: FirmTier[] = ['Magic Circle', 'Silver Circle', 'National', 'International', 'US Firms', 'Boutique'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(isoDate: string): number | null {
  const close = new Date(isoDate + 'T23:59:59');
  const now = new Date();
  const diff = Math.ceil((close.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Component ────────────────────────────────────────────────────────────────

export function TrackerDashboard({ initialApplications, targetFirmSlugs, firms }: TrackerDashboardProps) {
  const [applications, setApplications] = useState<TrackedApplication[]>(initialApplications);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firmMap = useRef(new Map(firms.map((f) => [f.slug, f])));

  // ── Auto-save ──────────────────────────────────────────────────────────

  const persist = useCallback((items: TrackedApplication[]) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaveStatus('saving');
    saveTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/tracker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applications: items }),
        });
        if (!res.ok) throw new Error();
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 800);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────

  function addApplication(firmSlug: string, programme: string) {
    const exists = applications.some((a) => a.firmSlug === firmSlug && a.programme === programme);
    if (exists) return;

    const item: TrackedApplication = {
      firmSlug,
      programme,
      status: 'not-started',
      notes: '',
      updatedAt: new Date().toISOString(),
    };
    const next = [item, ...applications];
    setApplications(next);
    persist(next);
    setShowAddModal(false);
  }

  function updateStatus(firmSlug: string, programme: string, status: ApplicationStatus) {
    const next = applications.map((a) => {
      if (a.firmSlug !== firmSlug || a.programme !== programme) return a;
      return {
        ...a,
        status,
        appliedAt: status === 'submitted' && !a.appliedAt ? new Date().toISOString().split('T')[0] : a.appliedAt,
        updatedAt: new Date().toISOString(),
      };
    });
    setApplications(next);
    persist(next);
  }

  function updateNotes(firmSlug: string, programme: string, notes: string) {
    const next = applications.map((a) => {
      if (a.firmSlug !== firmSlug || a.programme !== programme) return a;
      return { ...a, notes: notes.slice(0, 500), updatedAt: new Date().toISOString() };
    });
    setApplications(next);
    persist(next);
  }

  function removeApplication(firmSlug: string, programme: string) {
    const next = applications.filter((a) => !(a.firmSlug === firmSlug && a.programme === programme));
    setApplications(next);
    persist(next);
  }

  function toggleNotes(key: string) {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // ── Summary stats ─────────────────────────────────────────────────────

  const submitted = applications.filter((a) => ['submitted', 'interview', 'offer'].includes(a.status)).length;
  const offers = applications.filter((a) => a.status === 'offer').length;

  // Sort by deadline proximity (nearest first), then alphabetically
  const sorted = [...applications].sort((a, b) => {
    const firmA = firmMap.current.get(a.firmSlug);
    const firmB = firmMap.current.get(b.firmSlug);
    const deadA = firmA?.deadlines.find((d) => d.label === a.programme);
    const deadB = firmB?.deadlines.find((d) => d.label === b.programme);
    const daysA = deadA?.closeDate ? (daysUntil(deadA.closeDate) ?? 999) : 999;
    const daysB = deadB?.closeDate ? (daysUntil(deadB.closeDate) ?? 999) : 999;
    if (daysA !== daysB) return daysA - daysB;
    return (firmA?.name ?? '').localeCompare(firmB?.name ?? '');
  });

  return (
    <div>
      {/* Summary + Add button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 text-[12px] font-mono text-stone-500 dark:text-stone-400">
          <span>{applications.length} tracked</span>
          <span className="text-stone-300 dark:text-stone-700">·</span>
          <span>{submitted} submitted</span>
          {offers > 0 && (
            <>
              <span className="text-stone-300 dark:text-stone-700">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{offers} offer{offers !== 1 ? 's' : ''}</span>
            </>
          )}
          {saveStatus === 'saving' && <span className="text-amber-500 animate-pulse">Saving...</span>}
          {saveStatus === 'saved' && <span className="text-emerald-500">Saved</span>}
          {saveStatus === 'error' && <span className="text-rose-500">Save failed</span>}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-sm bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:opacity-80 transition-opacity"
        >
          <Plus size={13} />
          Add application
        </button>
      </div>

      {/* Empty state */}
      {applications.length === 0 && (
        <div className="text-center py-16 px-4">
          <ClipboardListIcon className="mx-auto mb-4 text-stone-300 dark:text-stone-600" />
          <p className="text-[15px] font-medium text-stone-600 dark:text-stone-300 mb-2">
            No applications tracked yet
          </p>
          <p className="text-[13px] text-stone-400 dark:text-stone-500 mb-6 max-w-sm mx-auto">
            Add the firms and programmes you&apos;re applying to. Track your status, deadlines, and notes in one place.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium px-4 py-2.5 rounded-sm bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:opacity-80 transition-opacity"
          >
            <Plus size={14} />
            Add your first application
          </button>
        </div>
      )}

      {/* Application cards */}
      <div className="space-y-3">
        {sorted.map((app) => {
          const firm = firmMap.current.get(app.firmSlug);
          if (!firm) return null;
          const deadline = firm.deadlines.find((d) => d.label === app.programme);
          const days = deadline?.closeDate ? daysUntil(deadline.closeDate) : null;
          const key = `${app.firmSlug}:${app.programme}`;
          const notesOpen = expandedNotes.has(key);
          const cfg = STATUS_CONFIG[app.status];

          return (
            <div
              key={key}
              className={`bg-white dark:bg-stone-900 border rounded-sm overflow-hidden ${cfg.border}`}
            >
              <div className="px-5 py-4">
                {/* Row 1: firm name + programme + deadline */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/firms/${firm.slug}`}
                        className="text-[14px] font-semibold text-stone-900 dark:text-stone-100 hover:underline decoration-stone-400 dark:decoration-stone-500 underline-offset-2"
                      >
                        {firm.name}
                      </Link>
                      <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 tracking-wider uppercase">
                        {firm.tier}
                      </span>
                    </div>
                    <p className="text-[12px] text-stone-500 dark:text-stone-400">
                      {app.programme}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {days !== null && (
                      <span className={`text-[11px] font-mono font-semibold ${
                        days <= 14 ? 'text-rose-600 dark:text-rose-400' :
                        days <= 30 ? 'text-amber-600 dark:text-amber-400' :
                        'text-stone-500 dark:text-stone-400'
                      }`}>
                        {days}d left
                      </span>
                    )}
                    {deadline?.rolling && (
                      <span className="text-[9px] font-sans font-semibold tracking-[0.06em] uppercase px-1.5 py-0.5 rounded-sm bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Rolling
                      </span>
                    )}
                    {deadline && (
                      <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">
                        {deadline.closeDate ? fmtDate(deadline.closeDate) : deadline.typically}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 2: status pills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ALL_STATUSES.map((s) => {
                    const sc = STATUS_CONFIG[s];
                    const isActive = app.status === s;
                    const Icon = sc.icon;
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(app.firmSlug, app.programme, s)}
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-sm border transition-colors ${
                          isActive
                            ? `${sc.activeBg} ${sc.activeText} ${sc.border}`
                            : `bg-white dark:bg-stone-900 text-stone-400 dark:text-stone-500 border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500`
                        }`}
                      >
                        <Icon size={10} />
                        {sc.label}
                      </button>
                    );
                  })}
                </div>

                {/* Row 3: actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleNotes(key)}
                    className="inline-flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                  >
                    <StickyNote size={11} />
                    {notesOpen ? 'Hide notes' : app.notes ? 'Edit notes' : 'Add notes'}
                  </button>
                  {app.appliedAt && (
                    <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">
                      Applied {fmtDate(app.appliedAt)}
                    </span>
                  )}
                  <button
                    onClick={() => removeApplication(app.firmSlug, app.programme)}
                    className="ml-auto inline-flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={11} />
                    Remove
                  </button>
                </div>

                {/* Notes textarea */}
                {notesOpen && (
                  <textarea
                    value={app.notes}
                    onChange={(e) => updateNotes(app.firmSlug, app.programme, e.target.value)}
                    placeholder="Add notes about this application..."
                    maxLength={500}
                    rows={3}
                    className="mt-3 w-full text-[13px] text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-sm px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-500 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add modal */}
      {showAddModal && (
        <AddApplicationModal
          firms={firms}
          targetFirmSlugs={targetFirmSlugs}
          existingKeys={new Set(applications.map((a) => `${a.firmSlug}:${a.programme}`))}
          onAdd={addApplication}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// ── Empty state icon ─────────────────────────────────────────────────────────

function ClipboardListIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-12 h-12 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

// ── Add Application Modal ────────────────────────────────────────────────────

function AddApplicationModal({
  firms,
  targetFirmSlugs,
  existingKeys,
  onAdd,
  onClose,
}: {
  firms: FirmForClient[];
  targetFirmSlugs: string[];
  existingKeys: Set<string>;
  onAdd: (firmSlug: string, programme: string) => void;
  onClose: () => void;
}) {
  const [selectedFirm, setSelectedFirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const targetSet = new Set(targetFirmSlugs);
  const filteredFirms = firms.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.shortName.toLowerCase().includes(search.toLowerCase())
  );

  // Group by tier, target firms first
  const grouped = TIER_ORDER.map((tier) => ({
    tier,
    firms: filteredFirms.filter((f) => f.tier === tier),
  })).filter((g) => g.firms.length > 0);

  const firm = selectedFirm ? firms.find((f) => f.slug === selectedFirm) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm shadow-xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800">
          <h3 className="text-[14px] font-semibold text-stone-900 dark:text-stone-100">
            {firm ? firm.name : 'Add application'}
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-300">
            <X size={16} />
          </button>
        </div>

        {firm ? (
          /* Step 2: Select programme */
          <div className="overflow-y-auto flex-1 px-5 py-4">
            <button
              onClick={() => setSelectedFirm(null)}
              className="text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 mb-4 flex items-center gap-1"
            >
              <ChevronDown size={11} className="rotate-90" />
              Back to firms
            </button>

            <p className="text-[12px] text-stone-500 dark:text-stone-400 mb-3">
              Select a programme to track:
            </p>

            <div className="space-y-2">
              {firm.deadlines.map((d) => {
                const key = `${firm.slug}:${d.label}`;
                const alreadyTracked = existingKeys.has(key);
                const days = d.closeDate ? daysUntil(d.closeDate) : null;

                return (
                  <button
                    key={d.label}
                    onClick={() => !alreadyTracked && onAdd(firm.slug, d.label)}
                    disabled={alreadyTracked}
                    className={`w-full text-left px-4 py-3 rounded-sm border transition-colors ${
                      alreadyTracked
                        ? 'border-stone-200 dark:border-stone-700 opacity-50 cursor-not-allowed'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-medium text-stone-900 dark:text-stone-100">
                        {d.label}
                      </p>
                      {alreadyTracked && (
                        <span className="text-[10px] font-mono text-emerald-500">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
                        {d.closeDate ? fmtDate(d.closeDate) : d.typically}
                      </p>
                      {days !== null && (
                        <span className={`text-[10px] font-mono font-semibold ${
                          days <= 14 ? 'text-rose-600' : days <= 30 ? 'text-amber-600' : 'text-stone-500'
                        }`}>
                          {days}d
                        </span>
                      )}
                      {d.rolling && (
                        <span className="text-[9px] font-sans font-semibold uppercase text-amber-600">
                          Rolling
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Step 1: Select firm */
          <div className="overflow-y-auto flex-1">
            {/* Search */}
            <div className="px-5 pt-4 pb-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search firms..."
                className="w-full text-[13px] text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                autoFocus
              />
            </div>

            {/* Target firms first */}
            {targetFirmSlugs.length > 0 && !search && (
              <div className="px-5 pb-2">
                <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 tracking-widest uppercase mb-2">
                  Your target firms
                </p>
                <div className="space-y-1">
                  {firms
                    .filter((f) => targetSet.has(f.slug))
                    .map((f) => (
                      <FirmRow key={f.slug} firm={f} onClick={() => setSelectedFirm(f.slug)} />
                    ))}
                </div>
                <div className="border-b border-stone-200 dark:border-stone-800 my-3" />
              </div>
            )}

            {/* All firms grouped by tier */}
            <div className="px-5 pb-4">
              {grouped.map((g) => (
                <div key={g.tier} className="mb-4 last:mb-0">
                  <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 tracking-widest uppercase mb-2">
                    {g.tier}
                  </p>
                  <div className="space-y-1">
                    {g.firms.map((f) => (
                      <FirmRow key={f.slug} firm={f} onClick={() => setSelectedFirm(f.slug)} />
                    ))}
                  </div>
                </div>
              ))}

              {filteredFirms.length === 0 && (
                <p className="text-[13px] text-stone-400 dark:text-stone-500 py-4 text-center">
                  No firms match your search.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FirmRow({ firm, onClick }: { firm: FirmForClient; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-left hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors"
    >
      <Building2 size={12} className="text-stone-400 dark:text-stone-500 flex-shrink-0" />
      <span className="text-[13px] text-stone-700 dark:text-stone-300">
        {firm.name}
      </span>
      <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 ml-auto">
        {firm.deadlines.length} programme{firm.deadlines.length !== 1 ? 's' : ''}
      </span>
    </button>
  );
}
