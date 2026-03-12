'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Newspaper, Headphones, BookOpen, Building2, Calendar,
  PenLine, GraduationCap, MessageSquare, Compass, Scale,
  ClipboardList, Bookmark, Menu, X, CalendarDays,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AuthButtons } from './AuthButtons';
import { NavDropdowns } from './NavDropdowns';
import { FolioMark } from './FolioLogo';

interface HeaderProps {
  date: string;
  isArchive?: boolean;
  archiveDate?: string;
}

type MobileNavItem = { label: string; href: string; Icon: React.ElementType };
type MobileNavSection = { label: string; items: MobileNavItem[] };

const MOBILE_NAV_LINKS: MobileNavSection[] = [
  { label: 'Daily', items: [
    { label: 'Briefing', href: '/', Icon: Newspaper },
    { label: 'Podcast', href: '/podcast', Icon: Headphones },
    { label: 'Events', href: '/events', Icon: CalendarDays },
  ]},
  { label: 'Learn', items: [
    { label: 'Primers', href: '/primers', Icon: BookOpen },
    { label: 'Firms', href: '/firms', Icon: Building2 },
  ]},
  { label: 'Archive', items: [
    { label: 'Briefings', href: '/archive', Icon: Calendar },
    { label: 'Podcasts', href: '/podcast/archive', Icon: Headphones },
    { label: 'Quizzes', href: '/quiz/archive', Icon: PenLine },
  ]},
  { label: 'Practice', items: [
    { label: 'Quiz', href: '/quiz', Icon: PenLine },
    { label: 'Tests', href: '/tests', Icon: GraduationCap },
    { label: 'Interview Prep', href: '/interview', Icon: MessageSquare },
    { label: 'Firm Fit Quiz', href: '/firm-fit', Icon: Compass },
    { label: 'Area Fit Quiz', href: '/area-fit', Icon: Scale },
    { label: 'Tracker', href: '/tracker', Icon: ClipboardList },
  ]},
];

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateline(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const start = new Date(year, 0, 1);
  const issue = Math.ceil((d.getTime() - start.getTime()) / 86400000) + 1;
  const vol = year - 2025;
  const dayName = d.toLocaleDateString('en-GB', { weekday: 'long' });
  const dayMonth = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `Vol. ${vol} · No. ${issue} · ${dayName}, ${dayMonth} · London Edition`;
}


export function Header({ date, isArchive = false, archiveDate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayDate = archiveDate ?? date;

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-stone-200 dark:border-stone-800">
      {/* Thick top rule */}
      <div className="h-[3px] bg-stone-900 dark:bg-stone-100" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Row 1: date left · brand centre · auth + hamburger right */}
        <div className="grid grid-cols-3 items-center py-3">
          <span className="hidden sm:block font-sans text-label text-stone-400 dark:text-stone-500 tracking-wide">
            {formatShortDate(displayDate)}
          </span>
          <Link href="/" aria-label="Folio" className="group no-underline flex items-center justify-center text-stone-900 dark:text-stone-50 hover:text-stone-600 dark:hover:text-stone-400 transition-colors">
            <div className="flex items-center gap-1">
              <FolioMark size={26} className="flex-shrink-0" />
              <span className="font-serif text-display tracking-tight" style={{ letterSpacing: '-0.03em' }}>olio</span>
            </div>
          </Link>
          <div className="flex items-center gap-3 justify-end">
            <ThemeToggle />
            <AuthButtons />
            <button
              className="flex md:hidden items-center justify-center w-9 h-9 rounded-chrome text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Dateline */}
        <div className="pb-1 text-center">
          <span className="font-mono text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
            {formatDateline(displayDate)}
          </span>
        </div>

        {/* Row 2: Nav full-width */}
        <div className="flex items-center border-t border-stone-200 dark:border-stone-800">
          {isArchive ? (
            <>
              <span className="flex-1 font-sans text-label tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500 py-2">
                Archive Edition
              </span>
              <div className="flex items-center gap-4">
                <Link
                  href="/archive"
                  className="font-sans text-label font-semibold uppercase text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors py-2"
                >
                  ← Archive
                </Link>
                <Link
                  href="/"
                  className="font-sans text-label font-semibold uppercase text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors py-2"
                >
                  Today →
                </Link>
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center w-full">
              <NavDropdowns />
            </div>
          )}
        </div>

      </div>

      {/* Mobile drawer — shown below header when hamburger is open */}
      {!isArchive && mobileOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-paper">
          <nav className="max-w-5xl mx-auto px-4 py-2 divide-y divide-stone-100 dark:divide-stone-800">
            {MOBILE_NAV_LINKS.map((section) => (
              <div key={section.label} className="py-2">
                <p className="section-label px-1 pb-1">
                  {section.label}
                </p>
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-1 py-3 text-caption font-sans text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors min-h-[44px]"
                  >
                    <item.Icon size={13} className="flex-shrink-0 text-stone-400 dark:text-stone-500" />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
            {/* Saved — standalone */}
            <div className="py-2">
              <Link
                href="/saved"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-1 py-3 text-caption font-sans text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors min-h-[44px]"
              >
                <Bookmark size={13} className="flex-shrink-0 text-stone-400 dark:text-stone-500" />
                Saved
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
