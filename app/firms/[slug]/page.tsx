import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ExternalLink,
  AlertTriangle,
  MapPin,
  ChevronLeft,
  Briefcase,
  Users,
  BadgeDollarSign,
  TrendingUp,
  Calendar,
  Newspaper,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { getFirmBySlug } from '@/lib/firms-data';
import { requireSubscription } from '@/lib/paywall';
import { listBriefings, getBriefing, getTodayDate } from '@/lib/storage';
import { TOPIC_STYLES, type FirmTier } from '@/lib/types';

export const dynamic = 'force-dynamic';

const TIER_BADGE: Record<FirmTier, string> = {
  'Magic Circle':
    'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  'Silver Circle':
    'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
  'International':
    'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
  'US Firms':
    'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  'Boutique':
    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
};

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-sm px-4 py-3">
      <span className="font-mono text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
        {label}
      </span>
      <span className="text-[13px] font-semibold text-stone-900 dark:text-stone-100 leading-tight">
        {value}
      </span>
    </div>
  );
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-5 py-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-stone-400 dark:text-stone-500">{icon}</span>
      <span className="font-mono text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
        {label}
      </span>
    </div>
  );
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function FirmProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireSubscription();
  const { slug } = await params;
  const firm = getFirmBySlug(slug);
  if (!firm) notFound();

  const today = getTodayDate();

  // ── Recent Stories: scan last 30 days ──────────────────────────────────────
  const allDates = await listBriefings();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const recentDates = allDates.filter((d) => new Date(d) >= cutoff);
  const briefings = await Promise.all(recentDates.map((d) => getBriefing(d)));

  const aliasSet = new Set([
    firm.name.toLowerCase(),
    ...firm.aliases.map((a) => a.toLowerCase()),
  ]);

  type StoryWithDate = { id: string; topic: string; headline: string; date: string };
  const recentStories: StoryWithDate[] = briefings
    .flatMap((b) =>
      b
        ? b.stories.map((s) => ({ id: s.id, topic: s.topic, headline: s.headline, date: b.date }))
        : []
    )
    .filter((s) => {
      const fullStory = briefings
        .find((b) => b?.date === s.date)
        ?.stories.find((st) => st.id === s.id);
      return fullStory?.firms?.some((f) => aliasSet.has(f.toLowerCase()));
    });

  return (
    <>
      <Header date={today} isArchive />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Back link */}
        <Link
          href="/firms"
          className="inline-flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors mb-6"
        >
          <ChevronLeft size={12} />
          All firms
        </Link>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start gap-3 mb-2">
            <h1 className="font-serif text-[28px] sm:text-[34px] font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-tight">
              {firm.name}
            </h1>
            <span
              className={`mt-1.5 shrink-0 inline-block text-[10px] font-sans font-semibold tracking-[0.08em] uppercase px-2.5 py-1 rounded-sm ${TIER_BADGE[firm.tier]}`}
            >
              {firm.tier}
            </span>
          </div>

          {/* HQ + offices */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-1 text-[12px] text-stone-500 dark:text-stone-400">
              <MapPin size={11} className="shrink-0" />
              <span className="font-medium">{firm.hq}</span>
            </div>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <div className="flex flex-wrap gap-1">
              {firm.offices.map((office) => (
                <span
                  key={office}
                  className="text-[10px] px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 rounded-sm border border-stone-200 dark:border-stone-700"
                >
                  {office}
                </span>
              ))}
            </div>
          </div>

          {/* Website */}
          <a
            href={firm.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            <ExternalLink size={11} />
            {firm.website.replace(/^https?:\/\//, '')}
          </a>
        </div>

        <div className="space-y-5">

          {/* ── At a Glance ─────────────────────────────────────────────────── */}
          <SectionCard>
            <SectionHeading icon={<TrendingUp size={13} />} label="At a Glance" />
            <p className="text-[14px] text-stone-700 dark:text-stone-300 leading-[1.7] mb-4">
              {firm.knownFor}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {firm.practiceAreas.map((area) => (
                <span
                  key={area}
                  className="inline-block text-[10px] font-sans font-medium px-2 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700"
                >
                  {area}
                </span>
              ))}
            </div>
          </SectionCard>

          {/* ── Culture ─────────────────────────────────────────────────────── */}
          <SectionCard>
            <SectionHeading icon={<Users size={13} />} label="Culture" />
            <p className="text-[14px] text-stone-700 dark:text-stone-300 leading-[1.7]">
              {firm.culture}
            </p>
          </SectionCard>

          {/* ── Interview Focus ──────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-5 py-5">
            <SectionHeading icon={<Briefcase size={13} />} label="Interview Focus" />
            <div className="border-l-2 border-amber-400 dark:border-amber-500 pl-4">
              <p className="text-[14px] text-stone-700 dark:text-stone-300 leading-[1.7]">
                {firm.interviewFocus}
              </p>
            </div>
          </div>

          {/* ── Training Contract ────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-5 py-5">
            <SectionHeading icon={<BadgeDollarSign size={13} />} label="Training Contract" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <StatBox label="Seats" value={`${firm.trainingContract.seats} seats`} />
              <StatBox label="Intake" value={firm.trainingContract.intakeSizeNote} />
              <StatBox label="TC Salary" value={firm.trainingContract.tcSalaryNote} />
              <StatBox label="NQ Salary" value={firm.trainingContract.nqSalaryNote} />
            </div>
            <a
              href={firm.trainingContract.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-sm bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:opacity-80 transition-opacity"
            >
              Apply for Training Contract
              <ExternalLink size={11} />
            </a>
          </div>

          {/* ── Application Deadlines ────────────────────────────────────────── */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-5 py-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-stone-400 dark:text-stone-500"><Calendar size={13} /></span>
                <span className="font-mono text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">
                  Application Deadlines
                </span>
              </div>
              <a
                href="https://app.the-trackr.com/uk-law/"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-mono font-medium px-2.5 py-1 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                <ExternalLink size={10} />
                Live dates · The Trackr
              </a>
            </div>
            <div className="space-y-3">
              {firm.trainingContract.deadlines.map((deadline) => (
                <div
                  key={deadline.label}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-sm px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-stone-900 dark:text-stone-100 mb-0.5">
                      {deadline.label}
                    </p>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                      {deadline.typically}
                    </p>
                  </div>
                  <a
                    href={deadline.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-sm border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                  >
                    Apply →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* ── Forage Virtual Experience ────────────────────────────────────── */}
          {firm.forageUrl && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-5 py-5">
              <SectionHeading icon={<Briefcase size={13} />} label="Virtual Experience" />
              <p className="text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                {firm.shortName} offers free virtual work experience simulations on Forage — a practical way to explore the firm&apos;s work before applying and a genuine signal of interest for your application.
              </p>
              <a
                href={firm.forageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-sm border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                View Forage simulations
                <ExternalLink size={11} />
              </a>
            </div>
          )}

          {/* ── Recent Stories ───────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-5 py-5">
            <SectionHeading icon={<Newspaper size={13} />} label="Recent Stories" />
            {recentStories.length === 0 ? (
              <p className="text-[13px] text-stone-400 dark:text-stone-500">
                No stories mentioning {firm.shortName} in the last 30 days.
              </p>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {recentStories.map((story) => {
                  const styles =
                    TOPIC_STYLES[story.topic as keyof typeof TOPIC_STYLES] ??
                    TOPIC_STYLES['International'];
                  return (
                    <Link
                      key={`${story.date}-${story.id}`}
                      href={`/story/${story.id}`}
                      className="flex items-start gap-3 py-3 group hover:bg-stone-50 dark:hover:bg-stone-800/30 -mx-5 px-5 transition-colors"
                    >
                      <span
                        className={`mt-1.5 inline-block w-1.5 h-1.5 shrink-0 rounded-full ${styles.dot}`}
                      />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-stone-800 dark:text-stone-200 leading-snug group-hover:underline decoration-stone-400 dark:decoration-stone-500 underline-offset-2">
                          {story.headline}
                        </p>
                        <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 mt-0.5">
                          {formatDisplayDate(story.date)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Disclaimer footer ────────────────────────────────────────────── */}
          <div className="flex items-start gap-2.5 rounded-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 px-4 py-3">
            <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-500 dark:text-amber-400" />
            <p className="text-[12px] text-amber-700 dark:text-amber-300 leading-relaxed">
              Salary and deadline information is approximate and based on publicly available data from prior recruitment cycles.
              Last verified:{' '}
              <span className="font-mono">{firm.trainingContract.lastVerified}</span>.
              Always check the firm&apos;s official graduate recruitment page for confirmed dates.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
