'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Newspaper, Headphones, BookOpen, Building2, Calendar,
  PenLine, GraduationCap, Bookmark, ChevronDown, MessageSquare, Compass, Scale,
  ClipboardList,
} from 'lucide-react';

type NavItem = { label: string; href: string; Icon: React.ElementType };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Daily',
    items: [
      { label: 'Briefing', href: '/', Icon: Newspaper },
      { label: 'Podcast', href: '/podcast', Icon: Headphones },
    ],
  },
  {
    label: 'Learn',
    items: [
      { label: 'Primers', href: '/primers', Icon: BookOpen },
      { label: 'Firms', href: '/firms', Icon: Building2 },
    ],
  },
  {
    label: 'Archive',
    items: [
      { label: 'Briefings', href: '/archive', Icon: Calendar },
      { label: 'Podcasts', href: '/podcast/archive', Icon: Headphones },
      { label: 'Quizzes', href: '/quiz/archive', Icon: PenLine },
    ],
  },
  {
    label: 'Practice',
    items: [
      { label: 'Quiz', href: '/quiz', Icon: PenLine },
      { label: 'Tests', href: '/tests', Icon: GraduationCap },
      { label: 'Interview Prep', href: '/interview', Icon: MessageSquare },
      { label: 'Firm Fit Quiz', href: '/firm-fit', Icon: Compass },
      { label: 'Area Fit Quiz', href: '/area-fit', Icon: Scale },
      { label: 'Tracker', href: '/tracker', Icon: ClipboardList },
    ],
  },
];

const TRIGGER_CLS =
  'flex items-center gap-1 px-5 py-2 text-label font-sans font-semibold uppercase text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors';

export function NavDropdowns() {
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={navRef} className="flex items-center w-full">

      {NAV_GROUPS.map((group) => (
        <div
          key={group.label}
          className="relative"
          onMouseEnter={() => setOpen(group.label)}
          onMouseLeave={() => setOpen(null)}
        >
          <button
            onClick={() => setOpen(open === group.label ? null : group.label)}
            className={TRIGGER_CLS}
          >
            {group.label}
            <ChevronDown
              size={9}
              className={`ml-0.5 transition-transform duration-150 ${open === group.label ? 'rotate-180' : ''}`}
            />
          </button>

          {open === group.label && (
            <div className="absolute top-full left-0 z-50 min-w-[152px] rounded-b-xl rounded-tr-xl bg-paper border border-t-0 border-stone-200 dark:border-stone-800 shadow-lg shadow-stone-200/50 dark:shadow-stone-950/50 py-1 overflow-hidden">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(null)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-sans text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
                >
                  <item.Icon size={12} className="flex-shrink-0 text-stone-400 dark:text-stone-500" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Saved — single item, direct link */}
      <Link href="/saved" className={TRIGGER_CLS}>
        <Bookmark size={11} />
        Saved
      </Link>

    </div>
  );
}
