import Anthropic from '@anthropic-ai/sdk';
import { jsonrepair } from 'jsonrepair';
import type { Briefing, Story, TopicCategory, WhyItMatters, TalkingPoints, SectorWatchData, OneToFollowData } from './types';
import { getBriefing } from './storage';

const SYSTEM_PROMPT = `You are the briefing engine for Folio, a legal-prep platform producing daily commercial awareness briefings for a first-year LLB student in London targeting Magic Circle, Silver Circle, and elite US law firms. Your briefings are grounded in the specific facts, figures, names, and details from the news sources provided. Every claim — deal value, adviser name, regulatory body, timeline, financing term — must be traceable to a source article. You write with the precision of a senior lawyer who has read the originals, not a generalist who has skimmed headlines.`;

function buildExclusionBlock(previousBriefing: Briefing | null): string {
  if (!previousBriefing || previousBriefing.stories.length === 0) return '';

  const storyList = previousBriefing.stories
    .map(
      (s, i) =>
        `${i + 1}. [${s.topic}] ${s.headline}\n   Key entities: ${s.summary.slice(0, 120)}…`
    )
    .join('\n');

  return `
⛔ HARD EXCLUSION — recent briefings already covered these stories. You MUST NOT include:
- Any story involving the same company, deal, regulator, court case, or person named below
- Any story that is a continuation, update, or reframing of the same underlying event
- Any story in the same sector with the same narrative arc

Recently covered stories to avoid:
${storyList}

If the news sources below contain updates to these exact stories, skip them entirely and find fresher angles.
`;
}

function buildUserPrompt(
  dateStr: string,
  searchContext: string,
  exclusionBlock: string
): string {
  return `Today is ${dateStr}.
${exclusionBlock}
Using the news sources provided below, produce exactly 8 stories — one for each of the practice areas below. You MUST cover all eight; omitting any area is an error. Select the highest-signal story available from TODAY's news in each area:

1. M&A — private equity and M&A deals with UK/European nexus
2. Capital Markets — IPOs, equity offerings, debt issuance, and bond markets
3. Banking & Finance — leveraged finance, loan facilities, syndicated lending, private credit, fund finance, and structured finance transactions
4. Energy & Tech — energy, infrastructure, or technology with regulatory or transactional relevance (exclude AI — covered separately)
5. Regulation — competition law, financial regulation, or regulatory enforcement
6. Disputes — commercially significant litigation, arbitration, or enforcement action
7. International — cross-border deals, trade law, or global moves relevant to London firms
8. AI & Law — artificial intelligence in legal practice (firm AI strategies, AI tool adoption, AI-related regulation such as the EU AI Act, generative AI in deal-making or litigation, or AI literacy requirements in trainee recruitment)

Return a raw JSON object (no markdown fences, no preamble) with this exact structure:

{
  "stories": [
    {
      "topic": "M&A",
      "headline": "One sharp, declarative sentence — name the parties, deal value, and type of transaction",
      "summary": "10–14 sentences. Write as a senior lawyer who has read the source articles. You MUST include: exact deal value (or 'undisclosed' if not reported), named advisers on each side with their roles (e.g. 'Freshfields advised the target; Linklaters advised the acquirer'), specific regulatory bodies and the exact approval timeline stated in the sources, the precise financing structure (debt/equity split, debt providers named if known), named parties with a line on who they are and why they matter, the strategic rationale as articulated by the principals or as evidenced by the facts, market context grounded in specific numbers or comparables from the sources, and any explicit conditions, break fees, or open questions mentioned. Do not round figures or omit specifics that appear in the source material.",
      "whyItMatters": {
        "ukFirms": "3–4 sentences. Name the specific Magic Circle firms (Freshfields Bruckhaus Deringer, Linklaters, Allen & Overy Shearman, Clifford Chance, Slaughter and May) or Silver Circle firms (Herbert Smith Freehills, Ashurst, Hogan Lovells, Travers Smith, Macfarlies) best positioned on this matter and explain precisely why — which practice group has the track record, which office has the client relationship, which partner team wins this type of mandate. Note any Takeover Panel, CMA clearance, or FCA authorisation requirements that give UK firms the edge.",
        "usFirms": "2–3 sentences. Name which elite US firms in London (Kirkland & Ellis, Latham & Watkins, Sullivan & Cromwell, Skadden Arps, Paul Weiss, Weil Gotshal & Manges, Davis Polk, Cleary Gottlieb) are the natural choice for the PE sponsor, the leveraged finance package, or the cross-border structuring work, and explain the specific competitive advantage (e.g. Kirkland's dominance of UK PE fund formation, Latham's leveraged finance bench in London). Note any tension with UK firms for the same mandate.",
        "onTheGround": "2–3 sentences. State exactly what a first-seat trainee or NQ at a Magic Circle, Silver Circle, or US firm would do day-to-day on this matter (e.g. drafting CP checklists, running disclosure verification, preparing CMA filing documents, reviewing lock-up agreements). End with one specific data point connecting this to a named broader market cycle or structural trend."
      },
      "talkingPoints": {
        "soundbite": "ONE sentence, max 15 words. Name the deal or firm and the single most striking commercial implication — NOT a restatement of the headline. Do not use phrases like 'significant development', 'marks a new era', or 'signals change'. The sentence should give a student something to say that sounds informed, not just summarised. BAD: 'Carlyle Group\\'s target to raise $200bn is a significant development in private equity.' GOOD: 'PE AUM scale drives larger European M&A mandates — Magic Circle funds practices see direct deal flow as Carlyle deploys capital.'",
        "partnerAnswer": "2–3 sentences, ~50 words. Lead with a specific commercial observation that goes beyond the headline — name the deal and then immediately explain what it means for law firms: which practice area specifically (M&A, leveraged finance, capital markets, restructuring, disputes), which specific firms are best positioned, and why. The student should be able to drop this into a 2-minute partner conversation without sounding like they just read a summary. Zero filler phrases ('it is worth noting', 'this highlights the importance of').",
        "fullCommercial": "4–5 sentences, ~100 words. Open with the headline fact. Explain the strategic context (WHY this deal or event happened — what drove it). Name the specific practice areas and the specific Magic Circle, Silver Circle, or US firms best positioned and explain why (track record, client relationships, regulatory expertise). Connect to one named broader market trend. End with a concrete statement about what work this creates for commercial lawyers. Zero filler phrases."
      },
      "leadScore": 7,
      "sources": ["https://example.com/article-url"],
      "firms": ["Freshfields", "Linklaters"]
    }
  ],
  "sectorWatch": {
    "trend": "3–6 word label for the macro trend, e.g. 'PE Pipeline Unclogging' or 'CMA Fintech Crackdown' — short, sharp, no filler",
    "body": "3–4 sentences on the most important broader trend worth tracking this week — name specific firms, regulators, or deals driving it."
  },
  "oneToFollow": {
    "story": "One sharp sentence naming the specific developing story — name the case, deal, regulatory process, or firm move",
    "why": "2 sentences explaining precisely why this matters for commercial lawyers and which practice groups it will affect most."
  }
}

Rules:
- You MUST produce exactly 8 stories. Each of the eight topics must appear exactly once: "M&A", "Capital Markets", "Banking & Finance", "Energy & Tech", "Regulation", "Disputes", "International", "AI & Law"
- sources must be an array of 1–3 real URLs drawn from the SOURCE lines in the news context below. Only include URLs that actually appear in the sources provided. Each URL must be a direct article-level link (e.g. ft.com/content/abc123, reuters.com/markets/deals/...) — NEVER a section page, category index, or homepage (e.g. never ft.com/mergers-acquisitions, never bloomberg.com/markets). If the only available URL for a story is a section/category page, omit it and use [].
- Every story must be from TODAY's news — do not recycle stories from previous days
- Name specific law firms, banks, and advisers wherever the sources mention them
- If a practice area has no strong story from the provided sources, use your training knowledge to produce a credible, current-feeling story for that area — but still mark sources as []
- leadScore is an integer 1–10 rating how newsworthy this story is as a potential front-page lead. Score 8–10 for: landmark deals (£5bn+), sector-wide regulatory decisions, Supreme Court or Court of Appeal rulings, stories affecting multiple practice areas at once, or events that directly move the legal market. Score 5–7 for solid but routine stories (mid-size deals, standard regulatory updates). Score 1–4 for minor or niche stories. Be discriminating — only one story per briefing should score 9 or 10.
- firms must be an array of 2–5 short law firm names explicitly mentioned in this story (e.g. "Freshfields", "Linklaters", "Kirkland"). Use short names only — no "& Partners", no "LLP". If no firms are named, use []
- In the summary and all three whyItMatters sub-fields, wrap 4–8 key terms per paragraph in **double asterisks** like this: **CMA**, **£4.2bn**, **Freshfields**, **Article 101 TFEU**. Bold only the most scan-worthy facts: deal values, firm names, regulatory bodies, named legislation, and central named parties. Do not bold every proper noun — be selective so bolding carries weight.

Tone: Intelligent but not stuffy. Brief a sharp colleague, not a filing report. Zero filler phrases ("it is worth noting", "this highlights the importance of", "in conclusion"). If a number is imprecise, say so briefly rather than omitting it.

--- RECENT NEWS SOURCES ---

${searchContext}`;
}

function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];

  throw new Error('No JSON object found in model response');
}

function repairJSON(raw: string): string {
  return jsonrepair(raw);
}

function parseSectorWatch(raw: unknown): SectorWatchData | string {
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object' && 'trend' in raw && 'body' in raw) {
    const r = raw as Record<string, unknown>;
    return { trend: String(r.trend ?? ''), body: String(r.body ?? '') };
  }
  return String(raw ?? '');
}

function parseOneToFollow(raw: unknown): OneToFollowData | string {
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object' && 'story' in raw && 'why' in raw) {
    const r = raw as Record<string, unknown>;
    return { story: String(r.story ?? ''), why: String(r.why ?? '') };
  }
  return String(raw ?? '');
}

async function fetchLeadImage(headline: string): Promise<{
  url: string;
  photographer: string;
  photographerUrl: string;
} | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  // Use first 6 words of headline as search query — specific enough for good results
  const query = headline.split(' ').slice(0, 6).join(' ');

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      results?: Array<{
        urls: { regular: string };
        user: { name: string; links: { html: string } };
      }>;
    };
    const photo = data.results?.[0];
    if (!photo) return null;
    return {
      url: photo.urls.regular,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
    };
  } catch {
    return null;
  }
}

function buildBriefing(parsed: Record<string, unknown>, date: string): Briefing {
  const rawStories = (parsed.stories as Record<string, unknown>[]) ?? [];

  // Sort by leadScore descending before assigning IDs so id=1 is always the lead
  rawStories.sort((a, b) => {
    const scoreA = typeof a.leadScore === 'number' ? a.leadScore : 5;
    const scoreB = typeof b.leadScore === 'number' ? b.leadScore : 5;
    return scoreB - scoreA;
  });

  const stories: Story[] = rawStories.map((s, i) => {
    // Parse 3-tier talking points (new format) or fall back to legacy string
    const rawTP = s.talkingPoints as Record<string, unknown> | undefined;
    const talkingPoints: TalkingPoints | undefined =
      rawTP && typeof rawTP === 'object' && 'soundbite' in rawTP
        ? {
            soundbite: String(rawTP.soundbite ?? ''),
            partnerAnswer: String(rawTP.partnerAnswer ?? ''),
            fullCommercial: String(rawTP.fullCommercial ?? ''),
          }
        : undefined;

    return {
      id: String(i + 1),
      topic: (s.topic as TopicCategory) ?? 'International',
      headline: (s.headline as string) ?? '',
      summary: (s.summary as string) ?? '',
      whyItMatters: (s.whyItMatters as WhyItMatters | string) ?? '',
      // Soundbite populates talkingPoint for backward compat (quiz gen, firm pages, etc.)
      talkingPoint: talkingPoints?.soundbite ?? (s.talkingPoint as string) ?? '',
      talkingPoints,
      sources: (s.sources as string[]) ?? [],
      firms: (s.firms as string[]) ?? [],
      leadScore: typeof s.leadScore === 'number' ? s.leadScore : undefined,
    };
  });

  return {
    date,
    generatedAt: new Date().toISOString(),
    stories,
    sectorWatch: parseSectorWatch(parsed.sectorWatch),
    oneToFollow: parseOneToFollow(parsed.oneToFollow),
  };
}

async function searchNews(dateLabel: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return '(no web search — Tavily API key not set)';

  // Date-specific queries anchored to today so Tavily prioritises fresh results
  const queries = [
    `UK M&A private equity deal announced ${dateLabel}`,
    `UK capital markets IPO equity debt bond issuance ${dateLabel}`,
    `UK leveraged finance loan syndicated lending private credit ${dateLabel}`,
    `UK EU competition law financial regulation ${dateLabel}`,
    `energy infrastructure technology legal news ${dateLabel}`,
    `UK commercial litigation arbitration dispute ${dateLabel}`,
    `cross-border international trade deal London law firms ${dateLabel}`,
    `AI artificial intelligence law firms legal practice regulation ${dateLabel}`,
  ];

  const TAVILY_TIMEOUT_MS = 12_000; // 12 s per request — fail fast rather than hang

  const results = await Promise.all(
    queries.map((q) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TAVILY_TIMEOUT_MS);
      return fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          api_key: apiKey,
          query: q,
          search_depth: 'basic', // 'advanced' is slow; basic is plenty for news
          topic: 'news',         // news-optimised index — avoids stale evergreen pages
          days: 1,               // only results published in the last 24 hours
          max_results: 5,
          include_answer: false,
        }),
      })
        .then((r) => r.json())
        .catch(() => ({ results: [] })) // on timeout or network error, return empty
        .finally(() => clearTimeout(timer));
    })
  );

  const CONTENT_LIMIT = 800;
  const items = results
    .flatMap((r) => (r.results ?? []) as { url: string; title: string; content: string }[])
    .map((item) => {
      const content = item.content.length > CONTENT_LIMIT
        ? item.content.slice(0, CONTENT_LIMIT).trimEnd() + '…'
        : item.content;
      return `SOURCE: ${item.url}\nTITLE: ${item.title}\nCONTENT: ${content}`;
    })
    .join('\n\n---\n\n');

  return items || '(no search results returned)';
}

export async function generateBriefing(): Promise<Briefing> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is not set');

  const today = new Date().toISOString().split('T')[0];
  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Load the last two briefings to build a strong exclusion list
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const [yesterdayBriefing, twoDaysAgoBriefing] = await Promise.all([
    getBriefing(yesterday.toISOString().split('T')[0]),
    getBriefing(twoDaysAgo.toISOString().split('T')[0]),
  ]);

  // Merge both days into one exclusion block (yesterday + day before)
  const combinedBriefing: Briefing | null = yesterdayBriefing
    ? {
        ...yesterdayBriefing,
        stories: [
          ...yesterdayBriefing.stories,
          ...(twoDaysAgoBriefing?.stories ?? []),
        ],
      }
    : twoDaysAgoBriefing;

  const exclusionBlock = buildExclusionBlock(combinedBriefing);

  const useWebSearch = process.env.USE_WEB_SEARCH !== 'false';
  const searchContext = useWebSearch
    ? await searchNews(dateStr)
    : '(web search disabled — using training data only)';

  const anthropic = new Anthropic({ apiKey });

  const completion = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: buildUserPrompt(dateStr, searchContext, exclusionBlock) },
    ],
  });

  if (completion.stop_reason === 'max_tokens') {
    console.warn('[generate] Claude response truncated — output hit max_tokens limit');
  }

  const text = completion.content[0]?.type === 'text' ? completion.content[0].text : '';
  const jsonStr = extractJSON(text);
  let repaired: string;
  try {
    repaired = repairJSON(jsonStr);
    JSON.parse(repaired); // validate before passing downstream
  } catch (err) {
    console.error('[generate] JSON repair failed. Raw Claude output (first 500 chars):', jsonStr.slice(0, 500));
    console.error('[generate] JSON repair error:', err);
    throw err;
  }
  const briefing = buildBriefing(JSON.parse(repaired), today);

  // Fetch a hero image for the lead story from Unsplash (fails silently if key not set)
  const leadStory = briefing.stories[0];
  if (leadStory) {
    const image = await fetchLeadImage(leadStory.headline);
    if (image) {
      leadStory.imageUrl = image.url;
      leadStory.imagePhotographer = image.photographer;
      leadStory.imagePhotographerUrl = image.photographerUrl;
    }
  }

  return briefing;
}
