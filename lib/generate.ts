import Anthropic from '@anthropic-ai/sdk';
import { jsonrepair } from 'jsonrepair';
import type { Briefing, Story, TopicCategory, WhyItMatters, TalkingPoints, SectorWatchData, OneToFollowData } from './types';
import { getBriefing } from './storage';

const SYSTEM_PROMPT = `You are the briefing engine for Folio, a commercial law intelligence platform for UK law students targeting Magic Circle, Silver Circle, and elite US firms. You write the daily 8am briefing with the confidence of a well-read mid-level associate briefing a partner — direct, commercially sharp, and precise. You state facts from the sources provided, connect them to their legal and commercial significance, and stop when the facts run out. You never hedge, never attribute sources in prose, and never comment on what information is unavailable.`;

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

1. M&A — private equity and M&A deals with UK/European nexus; strongly prefer UK or London-advised transactions
2. Capital Markets — IPOs, equity offerings, debt issuance, and bond markets; prefer London Stock Exchange, UK-listed issuers, or deals governed by English law
3. Banking & Finance — leveraged finance, loan facilities, syndicated lending, private credit, fund finance, and structured finance transactions; prefer transactions involving London market participants or governed by English law
4. Energy & Tech — UK or European energy, infrastructure, or technology with regulatory or transactional relevance (exclude AI — covered separately); prefer stories touching Ofgem, DESNZ, or UK/EU regulatory frameworks
5. Regulation — UK or EU competition law (CMA, EC), financial regulation (FCA, PRA), or regulatory enforcement; strongly prefer FCA, CMA, PRA, ICO, or Ofcom actions over US regulatory stories
6. Disputes — commercially significant UK litigation (High Court, Court of Appeal, Supreme Court), arbitration seated in London, or enforcement action with UK nexus; prefer English law judgments
7. International — cross-border deals, trade law, or global moves with direct relevance to London firms or English law; avoid pure US domestic stories with no UK angle
8. AI & Law — artificial intelligence in UK/EU legal practice or regulation (UK AI regulation, EU AI Act implementation, City firm AI strategies, AI tool adoption by UK law firms, generative AI in English-law deal-making or litigation)

Return a raw JSON object (no markdown fences, no preamble) with this exact structure:

{
  "stories": [
    {
      "topic": "M&A",
      "headline": "One sharp, declarative sentence — name the parties, deal value, and type of transaction",
      "summary": "Write a substantive editorial summary using only facts clearly present in the sources. Target 200–300 words — enough to give the reader real depth without padding. A confident 150-word brief beats a padded 300-word one, but don't cut short when the facts support a fuller picture. Work through this priority order, including each item only if the sources support it: (1) Core event — what happened, who was involved, which sector and jurisdiction. (2) Deal economics — headline value, size, key metrics, consideration structure. (3) Named parties and roles — buyer/seller/target, PE sponsor, advisers on each side with their roles, regulators. (4) Legal and regulatory dimension — approvals needed, regulatory regime, conditions, notable clauses. (5) Strategic context — why this happened, what trend it reflects. The Golden Rule: if a detail is absent from the sources, omit it silently. Never write that something 'was not disclosed', 'could not be confirmed', or 'was not available'. Never use 'according to [source]', 'reports suggest', 'it is unclear', or any phrase that attributes the prose to a source or flags a gap. Never repeat a fact already stated — each point once, then move on. Wrap 4–8 key terms per story in **double asterisks**: deal values, firm names, regulatory bodies, named legislation, central parties.",
      "whyItMatters": {
        "ukFirms": "3–4 sentences. Name the specific Magic Circle firms (Freshfields Bruckhaus Deringer, Linklaters, Allen & Overy Shearman, Clifford Chance, Slaughter and May) or Silver Circle firms (Herbert Smith Freehills, Ashurst, Hogan Lovells, Travers Smith, Macfarlies) best positioned on this matter and explain precisely why — which practice group has the track record, which office has the client relationship, which partner team wins this type of mandate. Note any Takeover Panel, CMA clearance, or FCA authorisation requirements that give UK firms the edge.",
        "usFirms": "2–3 sentences. Name which elite US firms in London (Kirkland & Ellis, Latham & Watkins, Sullivan & Cromwell, Skadden Arps, Paul Weiss, Weil Gotshal & Manges, Davis Polk, Cleary Gottlieb) are the natural choice for the PE sponsor, the leveraged finance package, or the cross-border structuring work, and explain the specific competitive advantage (e.g. Kirkland's dominance of UK PE fund formation, Latham's leveraged finance bench in London). Note any tension with UK firms for the same mandate.",
        "onTheGround": "2–3 sentences. State exactly what a first-seat trainee or NQ at a Magic Circle, Silver Circle, or US firm would do day-to-day on this matter (e.g. drafting CP checklists, running disclosure verification, preparing CMA filing documents, reviewing lock-up agreements). End with one specific data point connecting this to a named broader market cycle or structural trend."
      },
      "talkingPoints": {
        "soundbite": "ONE sentence, max 15 words. Name the deal or firm and the single most striking commercial implication — NOT a restatement of the headline. Do not use phrases like 'significant development', 'marks a new era', or 'signals change'. The sentence should give a student something to say that sounds informed, not just summarised. BAD: 'Carlyle Group\\'s target to raise $200bn is a significant development in private equity.' GOOD: 'PE AUM scale drives larger European M&A mandates — Magic Circle funds practices see direct deal flow as Carlyle deploys capital.'",
        "partnerAnswer": "2–3 sentences, ~50 words. Assume the partner has already read the headline — do not restate it. Lead immediately with the commercial implication: what does this mean for the firm's practice, clients, or deal pipeline? Name the specific practice area and which firms are best positioned to win the work, and briefly why. The student should be able to drop this into a 2-minute partner conversation without sounding like they just read a summary. Zero filler phrases.",
        "fullCommercial": "4–5 sentences, ~100 words. For someone who has not yet seen the story. Open with the headline fact in one sentence. Explain the strategic context — why this happened. Name the specific practice areas and the specific Magic Circle, Silver Circle, or US firms best positioned, with a brief reason (track record, client relationship, regulatory expertise). Connect to one named broader market trend. End with a concrete statement about what work this creates for commercial lawyers. Zero filler phrases."
      },
      "imageQuery": "3–5 word Unsplash search query that captures the INDUSTRY or SETTING of this story — not the legal transaction itself. Think about what a photojournalist would photograph: the sector, the physical environment, or the geography. Examples: 'North Sea oil platform aerial' for an energy deal, 'London financial district skyline' for a City regulation story, 'pharmaceutical laboratory research' for a pharma M&A, 'cargo container port shipping' for a trade dispute, 'semiconductor microchip factory' for a tech acquisition, 'European Parliament Brussels' for EU regulation. NEVER use abstract legal/business terms like 'merger', 'acquisition', 'regulation', 'corporate', 'handshake', 'gavel'. The image should evoke the WORLD the story takes place in, not the legal work itself.",
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
- Geographic priority: This briefing is for UK law students targeting City firms. At least 5 of the 8 stories must have a clear UK or EU nexus (UK parties, English law, London market, UK regulator, or UK court). US-only stories with no UK angle should only appear if nothing stronger is available for that practice area.
- You MUST produce exactly 8 stories. Each of the eight topics must appear exactly once: "M&A", "Capital Markets", "Banking & Finance", "Energy & Tech", "Regulation", "Disputes", "International", "AI & Law"
- sources must be an array of 1–3 real URLs drawn from the SOURCE lines in the news context below. Only include URLs that actually appear in the sources provided. Each URL must be a direct article-level link (e.g. ft.com/content/abc123, reuters.com/markets/deals/...) — NEVER a section page, category index, or homepage (e.g. never ft.com/mergers-acquisitions, never bloomberg.com/markets). If the only available URL for a story is a section/category page, omit it and use [].
- Every story must be from TODAY's news — do not recycle stories from previous days
- Name specific law firms, banks, and advisers wherever the sources mention them
- If a practice area has no strong story from the provided sources, use your training knowledge to produce a credible, current-feeling story for that area — but still mark sources as []
- leadScore is an integer 1–10 rating how newsworthy this story is as a potential front-page lead. Score 8–10 for: landmark deals (£5bn+), sector-wide regulatory decisions, Supreme Court or Court of Appeal rulings, stories affecting multiple practice areas at once, or events that directly move the legal market. Score 5–7 for solid but routine stories (mid-size deals, standard regulatory updates). Score 1–4 for minor or niche stories. Be discriminating — only one story per briefing should score 9 or 10.
- firms must be an array of 2–5 short law firm names explicitly mentioned in this story (e.g. "Freshfields", "Linklaters", "Kirkland"). Use short names only — no "& Partners", no "LLP". If no firms are named, use []
- Before finalising each summary, reread it and remove any sentence that: (a) mentions source availability, paywalls, or what could not be found, (b) uses phrases like 'according to', 'reports suggest', 'it is unclear', 'details were not available', 'no advisers were named', or similar hedging or meta-commentary, (c) repeats a fact already stated with no new angle
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

// Topic → reliable Unsplash fallback queries (guaranteed to return results)
const TOPIC_FALLBACK_QUERIES: Record<string, string> = {
  'M&A': 'London financial district skyline',
  'Capital Markets': 'stock exchange trading floor',
  'Banking & Finance': 'City of London Canary Wharf',
  'Energy & Tech': 'wind turbine energy infrastructure',
  'Regulation': 'Westminster Parliament London',
  'Disputes': 'Royal Courts of Justice London',
  'International': 'world map globe international',
  'AI & Law': 'server room data centre technology',
};

async function searchUnsplash(
  query: string,
  accessKey: string
): Promise<{ url: string; photographer: string; photographerUrl: string } | null> {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
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
}

async function fetchLeadImage(
  imageQuery: string | undefined,
  topic: string = 'International'
): Promise<{
  url: string;
  photographer: string;
  photographerUrl: string;
} | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn('[generate] Unsplash: UNSPLASH_ACCESS_KEY not set — skipping hero image');
    return null;
  }

  const fallback = TOPIC_FALLBACK_QUERIES[topic] || 'London skyline cityscape';

  // Build query list: Claude's AI-generated query first, then topic fallback
  const queries: string[] = [];
  if (imageQuery && imageQuery.length > 3) {
    queries.push(imageQuery);
  }
  queries.push(fallback);

  try {
    for (const query of queries) {
      const result = await searchUnsplash(query, accessKey);
      if (result) {
        console.log(`[generate] Unsplash: found image for query "${query}"`);
        return result;
      }
      console.log(`[generate] Unsplash: no results for "${query}", trying fallback...`);
    }
    console.warn('[generate] Unsplash: all queries returned no results');
    return null;
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

  // 8 primary queries (one per topic) + 7 supplementary + 5 include_domains-targeted = 20 total.
  // search_depth: 'advanced' (2 credits/query) × 20 × 31 days = 1,240 credits/month.
  // Events cron on advanced (10 queries × 2 × 8 runs = 160/month). Total ≈ 1,400/month.
  // Budget: 1,000 free (Researcher plan) + 1,000 pay-as-you-go = 2,000 credits/month.
  // Per-query include_domains biases supplementary queries toward ungated primary sources
  // (law firm press releases, regulator sites, PR wires) so Claude gets full deal detail
  // rather than truncated paywalled excerpts.
  interface TavilyQuery {
    query: string;
    include_domains?: string[];
  }

  const queries: TavilyQuery[] = [
    // ── Primary: one per practice area ──────────────────────────────────────
    { query: `UK M&A private equity deal announced today ${dateLabel}` },
    { query: `UK capital markets IPO equity debt bond issuance London today ${dateLabel}` },
    { query: `UK leveraged finance loan syndicated lending private credit today ${dateLabel}` },
    { query: `UK EU competition law FCA PRA financial regulation today ${dateLabel}` },
    { query: `UK EU energy infrastructure technology deal regulation legal news today ${dateLabel}` },
    { query: `UK High Court Court of Appeal commercial litigation arbitration dispute today ${dateLabel}` },
    { query: `cross-border international deal UK London law firms European nexus today ${dateLabel}` },
    { query: `UK EU AI artificial intelligence law regulation legal practice City firms today ${dateLabel}` },
    // ── Supplementary: high-quality sources + broader deal flow ───────────
    { query: `Financial Times Reuters City of London deal merger acquisition UK ${dateLabel}` },
    { query: `Magic Circle Silver Circle law firm mandate instruction UK today ${dateLabel}` },
    { query: `UK High Court Court of Appeal Supreme Court judgment ruling today ${dateLabel}` },
    { query: `FCA PRA CMA ICO Ofgem regulatory decision enforcement action UK today ${dateLabel}` },
    { query: `UK private credit direct lending fund finance facility today ${dateLabel}` },
    { query: `European cross-border M&A deal PE buyout continental Europe UK angle today ${dateLabel}` },
    { query: `UK ESG sustainability climate regulation green finance legal today ${dateLabel}` },
    // ── Supplementary: non-paywalled primary sources ──────────────────────
    {
      query: `UK law firm deal announcement press release merger acquisition ${dateLabel}`,
      include_domains: [
        'businesswire.com', 'prnewswire.com', 'globenewswire.com',
        'linklaters.com', 'freshfields.com', 'cliffordchance.com',
        'allenovery.com', 'slaughterandmay.com', 'ashurst.com',
        'hsf.com', 'hoganlovells.com', 'kirkland.com', 'lw.com',
        'skadden.com', 'davispolk.com', 'sullcrom.com',
      ],
    },
    {
      query: `FCA CMA PRA ICO regulatory enforcement decision ruling UK statement ${dateLabel}`,
      include_domains: [
        'fca.org.uk', 'cma.gov.uk', 'pra.org.uk', 'judiciary.gov.uk',
        'legislation.gov.uk', 'companieshouse.gov.uk', 'ico.org.uk',
        'ofgem.gov.uk', 'ofcom.org.uk',
      ],
    },
    {
      query: `AI artificial intelligence UK EU law regulation legal technology City firms ${dateLabel}`,
      include_domains: [
        'reuters.com', 'ft.com', 'lawgazette.co.uk',
        'artificialintelligenceact.eu', 'digital-strategy.ec.europa.eu',
        'gov.uk', 'ico.org.uk',
      ],
    },
    {
      query: `law firm deal UK legal news commercial awareness solicitor trainee ${dateLabel}`,
      include_domains: [
        'lawgazette.co.uk', 'legal500.com', 'chambersandpartners.com',
        'thelawyer.com', 'legalcheek.com', 'rollonfriday.com',
      ],
    },
    {
      query: `private equity secondaries continuation fund UK Europe deal today ${dateLabel}`,
      include_domains: [
        'privateequitywire.co.uk', 'buyoutsnews.com', 'pitchbook.com',
        'preqin.com', 'reuters.com', 'ft.com',
      ],
    },
  ];

  const TAVILY_TIMEOUT_MS = 12_000;

  const results = await Promise.all(
    queries.map(({ query, include_domains }) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TAVILY_TIMEOUT_MS);
      return fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: 'advanced', // 2 credits/query — richer content chunks per result
          topic: 'news',
          days: 1,
          max_results: 8,
          include_answer: false,
          ...(include_domains ? { include_domains } : {}),
        }),
      })
        .then((r) => r.json())
        .catch(() => ({ results: [] }))
        .finally(() => clearTimeout(timer));
    })
  );

  const CONTENT_LIMIT = 1000;
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
    max_tokens: 20000,
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
  const parsedData = JSON.parse(repaired);

  // Extract imageQuery from the lead story before buildBriefing strips unknown fields.
  // The lead story is the one with the highest leadScore (buildBriefing sorts by it).
  const rawStories = (parsedData.stories as Record<string, unknown>[]) ?? [];
  const leadRaw = [...rawStories].sort((a, b) => {
    const sa = typeof a.leadScore === 'number' ? a.leadScore : 5;
    const sb = typeof b.leadScore === 'number' ? b.leadScore : 5;
    return sb - sa;
  })[0];
  const leadImageQuery = leadRaw?.imageQuery as string | undefined;
  const leadTopic = (leadRaw?.topic as string) ?? 'International';

  const briefing = buildBriefing(parsedData, today);

  // Fetch a hero image for the lead story from Unsplash (fails silently if key not set)
  const leadStory = briefing.stories[0];
  if (leadStory) {
    const image = await fetchLeadImage(leadImageQuery, leadTopic);
    if (image) {
      leadStory.imageUrl = image.url;
      leadStory.imagePhotographer = image.photographer;
      leadStory.imagePhotographerUrl = image.photographerUrl;
    }
  }

  return briefing;
}
