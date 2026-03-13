'use client';

import { useState, useEffect } from 'react';
import type { TrackerEntry, TrackerStatus } from '@/lib/types';

const STATUS_OPTIONS: TrackerStatus[] = ['Applied', 'In Progress', 'Submitted', 'Interview', 'Offer', 'Rejected'];

function StatusBadge({ status }: { status: TrackerStatus }) {
  const styles: Record<TrackerStatus, string> = {
    'Applied':     'border border-stone-300 text-stone-500 dark:border-stone-600 dark:text-stone-400',
    'In Progress': 'border border-stone-400 text-stone-600 dark:border-stone-500 dark:text-stone-300',
    'Submitted':   'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Interview':   'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'Offer':       'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'Rejected':    'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase font-sans ${styles[status]}`}>
      {status}
    </span>
  );
}

function formatDeadline(dateStr: string): string {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}

const inputClass = "w-full rounded-[16px] border border-stone-200 dark:border-stone-700 bg-[#F9F7F2] dark:bg-stone-800 px-4 py-2.5 text-[13px] font-sans focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 text-stone-900 dark:text-stone-100";

export function TrackerView() {
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TrackerEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [firm, setFirm] = useState('');
  const [status, setStatus] = useState<TrackerStatus>('Applied');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetch('/api/tracker')
      .then(r => r.json())
      .then(({ entries }) => setEntries(entries ?? []))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setFirm(''); setStatus('Applied'); setDeadline(''); setNotes('');
    setEditingEntry(null);
  }

  function handleEdit(entry: TrackerEntry) {
    setEditingEntry(entry);
    setFirm(entry.firm);
    setStatus(entry.status);
    setDeadline(entry.deadline);
    setNotes(entry.notes);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    const res = await fetch('/api/tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    const data = await res.json();
    setEntries(data.entries ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = editingEntry
        ? { action: 'update', id: editingEntry.id, status, notes }
        : { action: 'add', firm, status, deadline, notes };
      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setEntries(data.entries ?? []);
      setShowForm(false);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  }

  const sortedEntries = [...entries].sort((a, b) => a.deadline.localeCompare(b.deadline));

  return (
    <div>
      {/* Heading row */}
      <div className="flex items-end justify-between mb-12">
        <div className="space-y-2">
          <span className="section-label opacity-40">Application Management</span>
          <h2 className="text-[56px] leading-none font-serif font-bold text-stone-900 dark:text-stone-50">The Tracker</h2>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-5 py-2.5 rounded-full bg-[#2D3436] text-white text-[12px] font-medium tracking-wide hover:bg-[#2D3436]/90 transition-colors whitespace-nowrap"
        >
          + Add Application
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-[24px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 mb-6">
          <h4 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
            {editingEntry ? 'Edit Application' : 'Add Application'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-sans text-stone-400 mb-1.5">Firm</label>
              <input type="text" maxLength={100} required value={firm} onChange={e => setFirm(e.target.value)} className={inputClass} disabled={!!editingEntry} />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-sans text-stone-400 mb-1.5">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as TrackerStatus)} className={inputClass}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-sans text-stone-400 mb-1.5">Deadline</label>
              <input type="date" required value={deadline} onChange={e => setDeadline(e.target.value)} className={inputClass} disabled={!!editingEntry} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] uppercase tracking-widest font-sans text-stone-400 mb-1.5">Notes</label>
              <textarea rows={3} maxLength={500} value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-[16px] bg-[#2D3436] text-white text-[13px] font-medium hover:bg-[#2D3436]/90 disabled:opacity-50 transition-all duration-200">
              {submitting ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-6 py-2.5 rounded-[16px] border border-stone-300 dark:border-stone-700 text-[13px] font-sans text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-[13px] text-stone-400 py-8">Loading...</p>
      ) : (
        <div className="rounded-[24px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800">
                <th className="text-left px-6 py-3 section-label text-stone-400 dark:text-stone-500 font-normal">Firm</th>
                <th className="text-left px-6 py-3 section-label text-stone-400 dark:text-stone-500 font-normal">Status</th>
                <th className="text-left px-6 py-3 section-label text-stone-400 dark:text-stone-500 font-normal">Deadline</th>
                <th className="text-left px-6 py-3 section-label text-stone-400 dark:text-stone-500 font-normal hidden md:table-cell">Notes</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {sortedEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-[13px] text-stone-400 dark:text-stone-500">
                    No applications yet. Click &quot;Add Application&quot; to track your first.
                  </td>
                </tr>
              ) : (
                sortedEntries.map(entry => (
                  <tr key={entry.id} className="border-b border-stone-50 dark:border-stone-800/50 last:border-0 hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-colors">
                    <td className="px-6 py-4 font-serif text-[18px] font-semibold text-stone-900 dark:text-stone-100">{entry.firm}</td>
                    <td className="px-6 py-4"><StatusBadge status={entry.status} /></td>
                    <td className="px-6 py-4 font-sans text-[13px] text-stone-400 dark:text-stone-500">{formatDeadline(entry.deadline)}</td>
                    <td className="px-6 py-4 text-[13px] text-stone-500 dark:text-stone-400 hidden md:table-cell max-w-[200px] truncate">{entry.notes}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-end">
                        <button onClick={() => handleEdit(entry)} className="text-[11px] font-sans uppercase tracking-widest text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(entry.id)} className="text-[11px] font-sans uppercase tracking-widest text-rose-400 hover:text-rose-600 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
