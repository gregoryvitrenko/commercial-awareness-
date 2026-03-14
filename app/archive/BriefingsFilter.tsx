'use client';

import { useState } from 'react';
import Link from 'next/link';

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatLongDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

interface BriefingsFilterProps {
  allDates: string[];
  firmDates: Record<string, string[]>;
  today: string;
}

export function BriefingsFilter({ allDates, firmDates, today }: BriefingsFilterProps) {
  const [selectedFirm, setSelectedFirm] = useState('');

  const firms = Object.keys(firmDates).sort();
  const displayDates = selectedFirm ? (firmDates[selectedFirm] ?? []) : allDates;

  return (
    <div>
      {firms.length > 0 && (
        <div className="mb-5">
          <select
            value={selectedFirm}
            onChange={(e) => setSelectedFirm(e.target.value)}
            className="w-full text-[11px] font-sans px-3 py-2 rounded-chrome border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600"
          >
            <option value="">All firms</option>
            {firms.map((firm) => (
              <option key={firm} value={firm}>{firm}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-0">
        {displayDates.length === 0 ? (
          <p className="text-caption text-stone-400">No briefings found for this firm.</p>
        ) : (
          displayDates.slice(0, 30).map((date) => (
            <Link
              key={date}
              href={date === today ? '/' : `/archive/${date}`}
              className="group block"
            >
              <div className="py-2 border-b border-stone-100 dark:border-stone-800/50">
                <span className="text-caption text-stone-400 dark:text-stone-500 block mb-0.5">
                  {formatShortDate(date)}
                </span>
                <span className="font-serif text-body text-stone-800 dark:text-stone-200 group-hover:underline underline-offset-2">
                  {formatLongDate(date)}
                </span>
              </div>
            </Link>
          ))
        )}
        {allDates.length === 0 && !selectedFirm && (
          <p className="text-caption text-stone-400">No entries yet.</p>
        )}
      </div>
    </div>
  );
}
