import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ExternalLink,
  ShieldCheck,
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
  ArrowUpRight,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { PrintButton } from '@/components/PrintButton';
import { getFirmBySlug } from '@/lib/firms-data';
import { getDiversitySchemes } from '@/lib/diversity-data';
import { requireSubscription } from '@/lib/paywall';
import { listBriefings, getBriefing, getTodayDate } from '@/lib/storage';
import { TOPIC_STYLES, type FirmTier, type DiversitySchemeType } from '@/lib/types';
import { getFirmInterviewPack, type FirmInterviewPack } from '@/lib/firm-pack';
import { CollapsibleQuestions } from '@/components/CollapsibleQuestions';
import { CollapsibleStories } from '@/components/CollapsibleStories';

export const dynamic = 'force-dynamic';

// ── Tier colour maps ───────────────────────────────────────────────────────────

const TIER_BADGE: Record<FirmTier, string> = {
  'Magic Circle':
    'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  'Silver Circle':
    'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
  'National':
    'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
  'International':
    'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
  'US Firms':
    'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  'Boutique':
    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
};

const TIER_STAT_TEXT: Record<FirmTier, string> = {
  'Magic Circle':  'text-blue-600 dark:text-blue-400',
  'Silver Circle': 'text-violet-600 dark:text-violet-400',
  'National':      'text-rose-600 dark:text-rose-400',
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

// ── Layout primitives ─────────────────────────────────────────────────────────

function SectionCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-print-section
      className={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl px-6 py-6 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-stone-400 dark:text-stone-500">{icon}</span>
      <span className="section-label">{label}</span>
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

  // ── Recent Stories ─────────────────────────────────────────────────────────
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

  // ── Interview Pack ────────────────────────────────────────────────────────
  let interviewPack: FirmInterviewPack | null = null;
  try {
    interviewPack = await getFirmInterviewPack(
      firm,
      recentStories.map((s) => s.headline),
    );
  } catch {
    interviewPack = null;
  }

  const tierText = TIER_STAT_TEXT[firm.tier];

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Back link + print */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/firms"
            data-print-hide
            className="inline-flex items-center gap-1.5 text-label text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            <ChevronLeft size={12} />
            All firms
          </Link>
          <PrintButton />
        </div>

        {/* ── Hero card ────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl px-8 py-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start">

            {/* Left: firm identity */}
            <div>
              <p className="section-label mb-3">Firm Intelligence</p>
              <h1 className="font-serif text-5xl sm:text-6xl tracking-tight text-stone-900 dark:text-stone-50 leading-[1.05] mb-6">
                {firm.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2" data-print-hide>
                <a
                  href={firm.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-label font-semibold uppercase tracking-wide px-4 py-1.5 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:opacity-80 transition-opacity"
                >
                  Website
                  <ExternalLink size={10} />
                </a>
                <a
                  href={firm.trainingContract.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-label font-semibold uppercase tracking-wide px-4 py-1.5 rounded-full bg-[#1B2333] text-stone-100 hover:opacity-80 transition-opacity"
                >
                  Apply Now
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {/* Right: 2×2 stat grid */}
            <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
              {[
                { label: 'NQ Salary', value: firm.trainingContract.nqSalaryNote },
                { label: 'TC Salary', value: firm.trainingContract.tcSalaryNote },
                { label: 'Annual Intake', value: firm.trainingContract.intakeSizeNote },
                { label: 'Seats', value: `${firm.trainingContract.seats} seats` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700 rounded-2xl px-4 py-3 text-center"
                >
                  <p className="section-label mb-2">{label}</p>
                  <p className="font-serif text-subheading leading-tight text-stone-800 dark:text-stone-100">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sections ─────────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* About the Firm + Culture | Deadlines sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">

            {/* About + Culture combined */}
            <SectionCard>
              <SectionHeading icon={<TrendingUp size={13} />} label="About the Firm" />
              <p className="text-body text-stone-700 dark:text-stone-300 leading-relaxed mb-4">
                {firm.knownFor}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {firm.practiceAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-block text-label font-medium px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700"
                  >
                    {area}
                  </span>
                ))}
              </div>

              <div className="border-l-2 border-stone-200 dark:border-stone-700 pl-4">
                <p className="section-label mb-2">Culture & Values</p>
                <p className="text-body text-stone-600 dark:text-stone-400 leading-relaxed italic">
                  {firm.culture}
                </p>
              </div>
            </SectionCard>

            {/* Application Deadlines — dark sidebar */}
            <div
              data-print-section
              className="bg-[#1B2333] rounded-3xl px-5 py-5"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="font-serif italic text-subheading text-stone-100 leading-snug">
                  Application Deadlines
                </h2>
                <a
                  href="https://app.the-trackr.com/uk-law/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-print-hide
                  className="shrink-0 inline-flex items-center gap-1 text-label font-medium text-stone-400 hover:text-stone-200 transition-colors mt-0.5"
                >
                  <ExternalLink size={10} />
                  Trackr
                </a>
              </div>
              <div className="space-y-2">
                {firm.trainingContract.deadlines.map((deadline) => {
                  const fmtDate = (iso: string) => {
                    const [y, m, d] = iso.split('-').map(Number);
                    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                  };
                  const hasExact = deadline.openDate || deadline.closeDate;
                  const isClosed = deadline.closeDate ? deadline.closeDate < today : false;
                  return (
                    <a
                      key={deadline.label}
                      href={deadline.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-start justify-between gap-2 bg-[#141C2A] rounded-2xl px-4 py-3 hover:bg-[#1f2d42] transition-colors${isClosed ? ' opacity-50' : ''}`}
                    >
                      <div className="min-w-0">
                        <p className={`text-caption font-semibold leading-snug mb-0.5 ${isClosed ? 'text-stone-400 line-through' : 'text-stone-100'}`}>
                          {deadline.label}
                        </p>
                        {hasExact ? (
                          <p className="text-label font-sans text-stone-400">
                            {deadline.openDate && deadline.closeDate
                              ? `${fmtDate(deadline.openDate)} – ${fmtDate(deadline.closeDate)}`
                              : deadline.closeDate
                              ? `Closes ${fmtDate(deadline.closeDate)}`
                              : `Opens ${fmtDate(deadline.openDate!)}`}
                          </p>
                        ) : null}
                        <p className="text-label font-sans text-stone-500 mt-0.5">
                          {deadline.typically}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 mt-0.5">
                        {!isClosed && deadline.rolling && (
                          <span className="inline-block text-label font-semibold uppercase px-1.5 py-0.5 rounded-full bg-amber-900/40 text-amber-300 border border-amber-700/50">
                            Rolling
                          </span>
                        )}
                        <ArrowUpRight size={13} className="text-stone-500 group-hover:text-stone-300 transition-colors" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Interview Prep: sidebar layout ───────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">

            {/* Left sidebar */}
            <div className="space-y-4">
              {/* Strategic Advice */}
              <div
                data-print-section
                className="bg-[#1B2333] rounded-3xl px-5 py-5"
              >
                <p className="section-label text-stone-400 mb-3">Strategic Advice</p>
                <span aria-hidden="true" className="block font-serif text-4xl text-stone-600 leading-none mb-1 select-none">&ldquo;</span>
                <p className="text-caption text-stone-300 leading-relaxed italic">
                  {firm.interviewFocus}
                </p>
              </div>

              {/* Recent Stories */}
              <SectionCard>
                <SectionHeading icon={<Newspaper size={13} />} label="Recent Stories" />
                <CollapsibleStories stories={recentStories} />
              </SectionCard>
            </div>

            {/* Main: talking points + practice questions */}
            <SectionCard>
              <div className="mb-6">
                <SectionHeading icon={<MessageSquare size={13} />} label="Interview Prep" />
              </div>

              <p className="section-label mb-3">Talking Points</p>
              <p className="text-caption text-stone-400 dark:text-stone-500 mb-5 leading-relaxed">
                Arguments for &ldquo;Why {firm.shortName}?&rdquo; and ready-made observations from recent news. Adapt to your own voice.
              </p>

              {/* Why This Firm — 2-col card grid */}
              {interviewPack && interviewPack.whyThisFirm && interviewPack.whyThisFirm.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {interviewPack.whyThisFirm.map((bullet, i) => (
                    <div
                      key={`why-${i}`}
                      className="relative overflow-hidden bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-2xl p-4"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute right-2 top-2 font-sans text-[56px] font-bold leading-none text-stone-900 dark:text-stone-100 opacity-[0.05] select-none pointer-events-none"
                      >
                        {i + 1}
                      </span>
                      <p className={`section-label ${tierText} mb-2`}>
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      <p className="text-caption text-stone-700 dark:text-stone-300 leading-relaxed relative">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {!interviewPack && (
                <p className="text-caption text-stone-400 dark:text-stone-500 italic mb-2">
                  Talking points are being generated — refresh the page in a moment.
                </p>
              )}
            </SectionCard>
          </div>

          {/* Practice Questions — full width */}
          <SectionCard>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800">
                  <MessageSquare size={14} className="text-stone-400 dark:text-stone-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <p className="section-label">Practice Questions</p>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span className="text-label font-medium uppercase text-emerald-600 dark:text-emerald-500">Active</span>
                    </span>
                  </div>
                  {interviewPack && interviewPack.practiceQuestions.length > 0 && (
                    <p className="font-serif italic text-stone-500 dark:text-stone-400 text-sm">
                      {interviewPack.practiceQuestions.length} curated questions for {firm.shortName}
                    </p>
                  )}
                </div>
              </div>
              <span className="shrink-0 mt-0.5 text-label font-medium uppercase text-stone-400 dark:text-stone-500 print:hidden whitespace-nowrap">
                {interviewPack?.generatedAt
                  ? (() => {
                      const next = new Date(interviewPack.generatedAt);
                      next.setDate(next.getDate() + 7);
                      return `Refreshes ${next.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
                    })()
                  : 'Refreshes weekly'}
              </span>
            </div>
            {interviewPack && interviewPack.practiceQuestions.length > 0 ? (
              <CollapsibleQuestions
                questions={interviewPack.practiceQuestions}
                firmShortName={firm.shortName}
              />
            ) : (
              <p className="text-caption text-stone-400 dark:text-stone-500 italic">
                Practice questions are being generated — refresh the page in a moment.
              </p>
            )}
          </SectionCard>

          {/* Assessments */}
          {firm.assessments && firm.assessments.length > 0 && (
            <SectionCard>
              <div className="flex items-start justify-between gap-3 mb-5">
                <SectionHeading icon={<GraduationCap size={13} />} label="Online Assessments" />
                <Link
                  href="/tests"
                  data-print-hide
                  className="shrink-0 inline-flex items-center gap-1.5 text-label font-medium px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors -mt-0.5"
                >
                  Practice tests →
                </Link>
              </div>
              <div className="space-y-4">
                {firm.assessments.map((assessment) => (
                  <div
                    key={assessment.programme}
                    className="border border-stone-200 dark:border-stone-700 rounded-2xl p-5"
                  >
                    <p className="section-label mb-4">{assessment.programme}</p>
                    {assessment.tests.length === 0 ? (
                      <p className="font-serif italic text-stone-400 dark:text-stone-500 text-base">
                        No formal online assessments
                      </p>
                    ) : (
                      <div className={`grid gap-5 ${assessment.notes ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                        {assessment.notes && (
                          <div>
                            <p className="text-label font-medium uppercase text-stone-400 dark:text-stone-500 mb-2">Method</p>
                            <p className="font-serif italic text-stone-600 dark:text-stone-400 text-base leading-relaxed">
                              &ldquo;{assessment.notes}&rdquo;
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-label font-medium uppercase text-stone-400 dark:text-stone-500 mb-2">Tests</p>
                          <div className="flex flex-wrap gap-2">
                            {assessment.tests.map((test) => (
                              <span
                                key={test}
                                className="text-caption font-medium px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                              >
                                {test}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Virtual Experience */}
          {firm.forageUrl && (
            <SectionCard>
              <SectionHeading icon={<Briefcase size={13} />} label="Virtual Experience" />
              <p className="font-serif italic text-stone-700 dark:text-stone-300 text-xl sm:text-2xl leading-snug mt-4 mb-6">
                Explore {firm.shortName}&apos;s work before you apply — free simulations on Forage, built to mirror real trainee tasks.
              </p>
              <div className="flex flex-wrap items-center gap-4" data-print-hide>
                <a
                  href={firm.forageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-label font-semibold tracking-widest uppercase px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:opacity-80 transition-opacity"
                >
                  View Simulations →
                </a>
                <div className="flex items-center gap-2.5">
                  <span className="text-label font-medium uppercase text-stone-400 dark:text-stone-500">Free Access</span>
                  <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-600 inline-block" />
                  <span className="text-label font-medium uppercase text-stone-400 dark:text-stone-500">Self-Paced</span>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Diversity & Access — 2-col grid */}
          {diversitySchemes.length > 0 && (
            <SectionCard>
              <SectionHeading icon={<Heart size={13} />} label="Diversity & Access Schemes" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {diversitySchemes.map((scheme) => (
                  <div
                    key={scheme.name}
                    className="flex flex-col border border-stone-200 dark:border-stone-700 rounded-2xl px-5 py-5"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="text-label font-medium uppercase text-stone-400 dark:text-stone-500 mb-1">
                          {SCHEME_TYPE_LABEL[scheme.type]}
                        </p>
                        <p className="font-serif text-xl text-stone-900 dark:text-stone-100 leading-snug">
                          {scheme.name}
                        </p>
                      </div>
                      <a
                        href={scheme.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-print-hide
                        className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full border border-stone-200 dark:border-stone-700 text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                        aria-label={`Apply for ${scheme.name}`}
                      >
                        <ArrowUpRight size={13} />
                      </a>
                    </div>
                    <p className="text-caption text-stone-600 dark:text-stone-400 leading-relaxed mb-3 flex-1">
                      {scheme.eligibility}
                    </p>
                    <p className="text-label text-stone-400 dark:text-stone-500">
                      {scheme.typically}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-5 py-4">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800">
              <ShieldCheck size={14} className="text-stone-400 dark:text-stone-500" />
            </div>
            <div>
              <p className="section-label mb-1.5">Data Verification</p>
              <p className="text-caption text-stone-500 dark:text-stone-400 leading-relaxed">
                Salary and deadline information is approximate and based on publicly available data from prior recruitment cycles.
                Last verified: <span className="font-sans">{firm.trainingContract.lastVerified}</span>.
                Always check the firm&apos;s official graduate recruitment page for confirmed dates.
              </p>
            </div>
          </div>

        </div>

        {/* Print footer */}
        <div
          data-print-footer
          className="hidden mt-8 pt-4 border-t border-stone-200 text-label font-sans text-stone-400"
        >
          <p>Generated by Folio — folioapp.co.uk · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="mt-0.5">Salary and deadline information is approximate. Always verify with the firm&apos;s official graduate recruitment page.</p>
        </div>
      </main>
    </>
  );
}
