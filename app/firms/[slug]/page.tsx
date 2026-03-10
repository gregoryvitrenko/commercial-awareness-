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
  Heart,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { PrintButton } from '@/components/PrintButton';
import { getFirmBySlug } from '@/lib/firms-data';
import { getDiversitySchemes } from '@/lib/diversity-data';
import { requireSubscription } from '@/lib/paywall';
import { listBriefings, getBriefing, getTodayDate } from '@/lib/storage';
import { TOPIC_STYLES, type FirmTier, type DiversitySchemeType } from '@/lib/types';
import { getFirmInterviewPack, type FirmInterviewPack } from '@/lib/firm-pack';

export const dynamic = 'force-dynamic';

// ── Tier colour maps ───────────────────────────────────────────────────────────

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

const TIER_LEFT_BORDER: Record<FirmTier, string> = {
  'Magic Circle':  'border-l-blue-500 dark:border-l-blue-400',
  'Silver Circle': 'border-l-violet-500 dark:border-l-violet-400',
  'International': 'border-l-teal-500 dark:border-l-teal-400',
  'US Firms':      'border-l-amber-500 dark:border-l-amber-400',
  'Boutique':      'border-l-emerald-500 dark:border-l-emerald-400',
};

const TIER_STAT_TEXT: Record<FirmTier, string> = {
  'Magic Circle':  'text-blue-600 dark:text-blue-400',
  'Silver Circle': 'text-violet-600 dark:text-violet-400',
  'International': 'text-teal-600 dark:text-teal-400',
  'US Firms':      'text-amber-600 dark:text-amber-400',
  'Boutique':      'text-emerald-600 dark:text-emerald-400',
};

// ── Diversity scheme maps ─────────────────────────────────────────────────────

const SCHEME_TYPE_BADGE: Record<DiversitySchemeType, string> = {
  socioeconomic:
    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  ethnicity:
    'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
  'work-experience':
    'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  gender:
    'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
  disability:
    'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
};

const SCHEME_TYPE_LABEL: Record<DiversitySchemeType, string> = {
  socioeconomic: 'Socioeconomic',
  ethnicity: 'Ethnicity',
  'work-experience': 'Work Experience',
  gender: 'Gender',
  disability: 'Disability',
};

// ── Shared layout primitives ──────────────────────────────────────────────────

/** Card with optional tier-coloured left accent */
function SectionCard({
  children,
  accent = '',
  className = '',
}: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      data-print-section
      className={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-6 py-5
        ${accent ? `border-l-[3px] ${accent}` : ''}
        ${className}`}
    >
      {children}
    </div>
  );
}

/** Section label — sans-semibold, more readable than mono stone-400 */
function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-stone-400 dark:text-stone-500">{icon}</span>
      <span className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-500 dark:text-stone-400">
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

// ── Page ─────────────────────────────────────────────────────────────────────

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
  const diversitySchemes = getDiversitySchemes(slug);

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

  type StoryWithDate = {
    id: string;
    topic: string;
    headline: string;
    date: string;
    talkingPoint: string;
    firms: string[];
  };
  const recentStories: StoryWithDate[] = briefings
    .flatMap((b) =>
      b
        ? b.stories.map((s) => ({
            id: s.id,
            topic: s.topic,
            headline: s.headline,
            date: b.date,
            talkingPoint: s.talkingPoint ?? '',
            firms: s.firms ?? [],
          }))
        : []
    )
    .filter((s) => s.firms.some((f) => aliasSet.has(f.toLowerCase())));

  // ── Interview Pack: 10 practice questions, cached per firm ────────────────
  let interviewPack: FirmInterviewPack | null = null;
  try {
    interviewPack = await getFirmInterviewPack(
      firm,
      recentStories.map((s) => s.headline),
    );
  } catch {
    // Non-fatal — page renders without questions if generation fails
    interviewPack = null;
  }

  const tierAccent = TIER_LEFT_BORDER[firm.tier];
  const tierText   = TIER_STAT_TEXT[firm.tier];

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Back link + print button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/firms"
            data-print-hide
            className="inline-flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            <ChevronLeft size={12} />
            All firms
          </Link>
          <PrintButton />
        </div>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className={`mb-8 pl-5 border-l-[4px] ${tierAccent}`}>
          <h1 className="font-serif text-[30px] sm:text-[36px] font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-tight mb-2">
            {firm.name}
          </h1>

          {/* Tier + HQ inline */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`shrink-0 inline-block text-[10px] font-sans font-semibold tracking-[0.08em] uppercase px-2.5 py-1 rounded-sm ${TIER_BADGE[firm.tier]}`}
            >
              {firm.tier}
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <div className="flex items-center gap-1 text-[12px] text-stone-500 dark:text-stone-400">
              <MapPin size={11} className="shrink-0" />
              <span className="font-medium">{firm.hq}</span>
            </div>
          </div>

          {/* Offices */}
          {firm.offices.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {firm.offices.map((office) => (
                <span
                  key={office}
                  className="text-[10px] px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 rounded-sm border border-stone-200 dark:border-stone-700"
                >
                  {office}
                </span>
              ))}
            </div>
          )}

          {/* Website */}
          <a
            href={firm.website}
            target="_blank"
            rel="noopener noreferrer"
            data-print-hide
            className="inline-flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            <ExternalLink size={11} />
            {firm.website.replace(/^https?:\/\//, '')}
          </a>
        </div>

        <div className="space-y-4">

          {/* ── At a Glance ─────────────────────────────────────────────────── */}
          <SectionCard accent={tierAccent}>
            <SectionHeading icon={<TrendingUp size={13} />} label="At a Glance" />
            <p className="text-[15px] text-stone-700 dark:text-stone-300 leading-[1.75] mb-4">
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
          <SectionCard accent={tierAccent}>
            <SectionHeading icon={<Users size={13} />} label="Culture" />
            <p className="text-[15px] text-stone-700 dark:text-stone-300 leading-[1.75]">
              {firm.culture}
            </p>
          </SectionCard>

          {/* ── Interview Focus ──────────────────────────────────────────────── */}
          <SectionCard accent={tierAccent}>
            <SectionHeading icon={<Briefcase size={13} />} label="Interview Focus" />
            <div className="border-l-2 border-amber-400 dark:border-amber-500 pl-4">
              <p className="text-[15px] text-stone-700 dark:text-stone-300 leading-[1.75]">
                {firm.interviewFocus}
              </p>
            </div>
          </SectionCard>

          {/* ── Why This Firm? ──────────────────────────────────────────────── */}
          {interviewPack && interviewPack.whyThisFirm && interviewPack.whyThisFirm.length > 0 && (
            <SectionCard accent={tierAccent}>
              <SectionHeading icon={<Lightbulb size={13} />} label="Why This Firm?" />
              <p className="text-[12px] text-stone-400 dark:text-stone-500 mb-4 leading-relaxed">
                Concrete talking points for &ldquo;Why {firm.shortName}?&rdquo; — anchored to the firm&apos;s market position and recent deals. Adapt to your own voice.
              </p>
              <ul className="space-y-3">
                {interviewPack.whyThisFirm.map((bullet, i) => (
                  <li key={i} className="flex gap-3">
                    <span className={`shrink-0 font-mono text-[10px] font-bold mt-0.5 ${tierText}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-[14px] text-stone-700 dark:text-stone-300 leading-[1.7]">
                      {bullet}
                    </p>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {/* ── Assessments ─────────────────────────────────────────────────── */}
          {firm.assessments && firm.assessments.length > 0 && (
            <SectionCard accent={tierAccent}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <SectionHeading icon={<GraduationCap size={13} />} label="Online Assessments" />
                <Link
                  href="/tests"
                  data-print-hide
                  className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-mono font-medium px-2.5 py-1 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors -mt-0.5"
                >
                  Practice tests →
                </Link>
              </div>
              <div className="space-y-3">
                {firm.assessments.map((assessment) => (
                  <div
                    key={assessment.programme}
                    className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-sm px-4 py-3"
                  >
                    <p className="text-[11px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">
                      {assessment.programme}
                    </p>
                    {assessment.tests.length === 0 ? (
                      <p className="text-[12px] text-stone-400 dark:text-stone-500 italic">
                        No formal online assessments
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {assessment.tests.map((test) => (
                          <span
                            key={test}
                            className="inline-block text-[10px] font-sans font-semibold px-2 py-0.5 rounded-sm bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-300 dark:border-stone-600"
                          >
                            {test}
                          </span>
                        ))}
                      </div>
                    )}
                    {assessment.notes && (
                      <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5 leading-relaxed">
                        {assessment.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ── Training Contract ────────────────────────────────────────────── */}
          <SectionCard accent={tierAccent}>
            <SectionHeading icon={<BadgeDollarSign size={13} />} label="Training Contract" />

            {/* NQ salary hero stat + secondary stats */}
            <div className="flex flex-wrap items-end gap-8 mb-5 pb-5 border-b border-stone-100 dark:border-stone-800">
              {/* NQ — big */}
              <div>
                <p className="font-mono text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1">
                  NQ Salary
                </p>
                <p className={`font-mono text-[28px] sm:text-[32px] font-bold leading-none tracking-tight ${tierText}`}>
                  {firm.trainingContract.nqSalaryNote}
                </p>
              </div>

              {/* Supporting stats */}
              <div className="flex flex-wrap gap-6 pb-1">
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-0.5">
                    TC Salary
                  </p>
                  <p className="font-mono text-[15px] font-semibold text-stone-700 dark:text-stone-200">
                    {firm.trainingContract.tcSalaryNote}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-0.5">
                    Intake
                  </p>
                  <p className="font-mono text-[15px] font-semibold text-stone-700 dark:text-stone-200">
                    {firm.trainingContract.intakeSizeNote}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-0.5">
                    Seats
                  </p>
                  <p className="font-mono text-[15px] font-semibold text-stone-700 dark:text-stone-200">
                    {firm.trainingContract.seats}
                  </p>
                </div>
              </div>
            </div>

            <a
              href={firm.trainingContract.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-print-hide
              className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-sm bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:opacity-80 transition-opacity"
            >
              Apply for Training Contract
              <ExternalLink size={11} />
            </a>
          </SectionCard>

          {/* ── Application Deadlines ────────────────────────────────────────── */}
          <SectionCard accent={tierAccent}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <SectionHeading icon={<Calendar size={13} />} label="Application Deadlines" />
              <a
                href="https://app.the-trackr.com/uk-law/"
                target="_blank"
                rel="noopener noreferrer"
                data-print-hide
                className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-mono font-medium px-2.5 py-1 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors -mt-0.5"
              >
                <ExternalLink size={10} />
                Live dates · The Trackr
              </a>
            </div>
            <div className="space-y-3">
              {firm.trainingContract.deadlines.map((deadline) => {
                // Format exact dates if available
                const fmtDate = (iso: string) => {
                  const [y, m, d] = iso.split('-').map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                };
                const hasExact = deadline.openDate || deadline.closeDate;
                // Closed check: ISO YYYY-MM-DD strings compare lexicographically correctly
                const isClosed = deadline.closeDate ? deadline.closeDate < today : false;

                return (
                <div
                  key={deadline.label}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-sm px-4 py-3${isClosed ? ' opacity-60' : ''}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-[13px] font-semibold ${isClosed ? 'text-stone-500 dark:text-stone-400' : 'text-stone-900 dark:text-stone-100'}`}>
                        {deadline.label}
                      </p>
                      {isClosed && (
                        <span className="inline-block font-mono text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700">
                          Closed
                        </span>
                      )}
                      {!isClosed && deadline.rolling && (
                        <span className="inline-block text-[9px] font-sans font-semibold tracking-[0.06em] uppercase px-1.5 py-0.5 rounded-sm bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Rolling
                        </span>
                      )}
                    </div>
                    {hasExact ? (
                      <p className={`text-[11px] font-mono ${isClosed ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-600 dark:text-stone-300'}`}>
                        {deadline.openDate && deadline.closeDate
                          ? `${fmtDate(deadline.openDate)} – ${fmtDate(deadline.closeDate)}`
                          : deadline.closeDate
                          ? `Closes ${fmtDate(deadline.closeDate)}`
                          : `Opens ${fmtDate(deadline.openDate!)}`}
                        <span className="text-stone-400 dark:text-stone-500 ml-2">
                          ({deadline.typically})
                        </span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                        {deadline.typically}
                      </p>
                    )}
                  </div>
                  {!isClosed && (
                  <a
                    href={deadline.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-print-hide
                    className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-sm border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                  >
                    Apply →
                  </a>
                  )}
                </div>
                );
              })}
            </div>
          </SectionCard>

          {/* ── Forage Virtual Experience ────────────────────────────────────── */}
          {firm.forageUrl && (
            <SectionCard accent={tierAccent}>
              <SectionHeading icon={<Briefcase size={13} />} label="Virtual Experience" />
              <p className="text-[14px] text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                {firm.shortName} offers free virtual work experience simulations on Forage — a practical way to explore the firm&apos;s work before applying and a genuine signal of interest for your application.
              </p>
              <a
                href={firm.forageUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-print-hide
                className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-sm border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                View Forage simulations
                <ExternalLink size={11} />
              </a>
            </SectionCard>
          )}

          {/* ── Diversity & Access Schemes ───────────────────────────────────── */}
          {diversitySchemes.length > 0 && (
            <SectionCard accent={tierAccent}>
              <SectionHeading icon={<Heart size={13} />} label="Diversity & Access Schemes" />
              <div className="space-y-3">
                {diversitySchemes.map((scheme) => (
                  <div
                    key={scheme.name}
                    className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-sm px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <p className="text-[13px] font-semibold text-stone-900 dark:text-stone-100">
                          {scheme.name}
                        </p>
                        <span
                          className={`inline-block text-[9px] font-sans font-semibold tracking-[0.08em] uppercase px-2 py-0.5 rounded-sm ${SCHEME_TYPE_BADGE[scheme.type]}`}
                        >
                          {SCHEME_TYPE_LABEL[scheme.type]}
                        </span>
                      </div>
                      <p className="text-[12px] text-stone-600 dark:text-stone-400 leading-relaxed mb-1.5">
                        {scheme.eligibility}
                      </p>
                      <p className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
                        {scheme.typically}
                      </p>
                    </div>
                    <a
                      href={scheme.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-print-hide
                      className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-sm border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                    >
                      Apply →
                    </a>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ── Recent Stories ───────────────────────────────────────────────── */}
          <SectionCard accent={tierAccent}>
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
                      className="flex items-start gap-3 py-3 group hover:bg-stone-50 dark:hover:bg-stone-800/30 -mx-6 px-6 transition-colors"
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
          </SectionCard>

          {/* ── News Talking Points ──────────────────────────────────────────── */}
          {recentStories.length > 0 && (
            <SectionCard accent={tierAccent}>
              <SectionHeading icon={<MessageSquare size={13} />} label="Interview Talking Points" />
              <p className="text-[12px] text-stone-400 dark:text-stone-500 mb-4 leading-relaxed">
                These are the interview angles on recent stories mentioning {firm.shortName}. Each
                one gives you a ready-made observation to deploy when an interviewer asks{' '}
                &ldquo;What&apos;s caught your attention in the news recently?&rdquo;
              </p>
              <div className="space-y-4">
                {recentStories
                  .filter((s) => s.talkingPoint)
                  .map((story) => {
                    const styles =
                      TOPIC_STYLES[story.topic as keyof typeof TOPIC_STYLES] ??
                      TOPIC_STYLES['International'];
                    return (
                      <div
                        key={`tp-${story.date}-${story.id}`}
                        className="border-l-2 border-stone-200 dark:border-stone-700 pl-4"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`inline-block w-1.5 h-1.5 shrink-0 rounded-full ${styles.dot}`} />
                          <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                            {formatDisplayDate(story.date)} · {story.topic}
                          </p>
                        </div>
                        <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 leading-snug mb-1.5">
                          {story.headline}
                        </p>
                        <p className="text-[14px] text-stone-700 dark:text-stone-300 leading-[1.7]">
                          {story.talkingPoint}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </SectionCard>
          )}

          {/* ── Practice Interview Questions ──────────────────────────────────── */}
          <SectionCard accent={tierAccent}>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <SectionHeading icon={<HelpCircle size={13} />} label="Practice Interview Questions" />
                <p className="text-[12px] text-stone-400 dark:text-stone-500 leading-relaxed -mt-1">
                  10 questions tailored to {firm.shortName} — drawn from the firm&apos;s profile,
                  practice areas, and recent news. Try answering each one aloud before reading on.
                </p>
              </div>
              <span className="shrink-0 mt-0.5 inline-block text-[9px] font-mono font-medium tracking-widest uppercase px-2 py-1 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 print:hidden">
                Refreshes weekly
              </span>
            </div>

            {interviewPack && interviewPack.practiceQuestions.length > 0 ? (
              <ol className="space-y-4">
                {interviewPack.practiceQuestions.map((question, i) => (
                  <li
                    key={i}
                    className="flex gap-4 group"
                  >
                    <span
                      className={`shrink-0 font-mono text-[11px] font-bold tracking-tight mt-0.5 ${tierText} opacity-70`}
                    >
                      Q{i + 1}
                    </span>
                    <p className="text-[14px] text-stone-700 dark:text-stone-300 leading-[1.7]">
                      {question}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[13px] text-stone-400 dark:text-stone-500 italic">
                Interview questions are being generated — refresh the page in a moment.
              </p>
            )}
          </SectionCard>

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

        {/* Print-only footer */}
        <div
          data-print-footer
          className="hidden mt-8 pt-4 border-t border-stone-200 text-[10px] font-mono text-stone-400"
        >
          <p>
            Generated by Folio — folioapp.co.uk · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="mt-0.5">
            Salary and deadline information is approximate. Always verify with the firm&apos;s official graduate recruitment page.
          </p>
        </div>
      </main>
    </>
  );
}
