import Groq from 'groq-sdk';
import type { Briefing, Story, TopicCategory } from './types';
import { getBriefing } from './storage';

const SYSTEM_PROMPT = `You are a Commercial Awareness Agent producing daily briefings for a first-year LLB student in London targeting Magic Circle, Silver Circle, and elite US law firms. Your briefings are sharp, factually accurate, and commercially sophisticated. You write for a reader who is intelligent but time-pressed — think briefing a sharp trainee solicitor, not filing a memo.`;

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
Using the news sources provided below, identify the 5–8 highest-signal commercial and legal stories published TODAY. Prioritise stories in this order:

1. M&A and private equity deals with significant UK/European nexus
2. Capital markets, IPOs, restructuring, banking & finance
3. Energy, infrastructure, tech and AI with regulatory or transactional relevance
4. Competition law and financial regulation developments
5. Commercially significant disputes or arbitration
6. Global moves clearly relevant to international firms operating in London

Return a raw JSON object (no markdown fences, no preamble) with this exact structure:

{
  "stories": [
    {
      "topic": "M&A",
      "headline": "One sharp, declarative sentence — name the parties, deal value, and type of transaction",
      "summary": "10–14 sentences. This is the most important field — write it like a detailed briefing note. Cover: (1) who the parties are and their context, (2) what precisely happened, (3) deal value and structure if known, (4) advisers on each side by name, (5) regulatory approvals required and timeline, (6) financing structure or terms, (7) strategic rationale for both sides, (8) broader market context and what drove this deal now, (9) any complications, conditions, or open questions.",
      "whyItMatters": "6–8 sentences. Explain in depth: (1) which specific practice areas this engages and why, (2) what it means for deal flow and client advisory pipelines at the leading firms, (3) the regulatory or policy dimension and what it signals, (4) what a trainee or junior associate would actually work on in this matter, (5) how it connects to broader market themes or cycles, (6) any precedent it sets or question it raises for future transactions.",
      "talkingPoint": "2–3 confident, analytically sharp sentences suitable for a TC interview or vacation scheme partner chat. Lead with a bold observation, then give the so-what for law firms.",
      "sources": ["https://example.com/article-url"]
    }
  ],
  "sectorWatch": "3–4 sentences on the most important broader trend worth tracking this week — name specific firms, regulators, or deals driving it.",
  "oneToFollow": "2 sentences: identify the developing story to monitor and explain precisely why it matters for commercial lawyers."
}

Rules:
- topic must be exactly one of: "M&A", "Capital Markets", "Energy & Tech", "Regulation", "Disputes", "International"
- sources must be an array of 1–3 real URLs drawn from the SOURCE lines in the news context below. Only include URLs that actually appear in the sources provided.
- Every story must be from TODAY's news — do not recycle stories from previous days
- Name specific law firms, banks, and advisers wherever the sources mention them

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

function buildBriefing(parsed: Record<string, unknown>, date: string): Briefing {
  const rawStories = (parsed.stories as Record<string, unknown>[]) ?? [];

  const stories: Story[] = rawStories.map((s, i) => ({
    id: String(i + 1),
    topic: (s.topic as TopicCategory) ?? 'International',
    headline: (s.headline as string) ?? '',
    summary: (s.summary as string) ?? '',
    whyItMatters: (s.whyItMatters as string) ?? '',
    talkingPoint: (s.talkingPoint as string) ?? '',
    sources: (s.sources as string[]) ?? [],
  }));

  return {
    date,
    generatedAt: new Date().toISOString(),
    stories,
    sectorWatch: (parsed.sectorWatch as string) ?? '',
    oneToFollow: (parsed.oneToFollow as string) ?? '',
  };
}

async function searchNews(dateLabel: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return '(no web search — Tavily API key not set)';

  // Date-specific queries anchored to today so Tavily prioritises fresh results
  const queries = [
    `UK M&A private equity deal announced ${dateLabel}`,
    `UK capital markets IPO banking finance news ${dateLabel}`,
    `UK EU competition law financial regulation ${dateLabel}`,
    `energy infrastructure technology AI legal news ${dateLabel}`,
    `UK commercial litigation arbitration dispute ${dateLabel}`,
  ];

  const results = await Promise.all(
    queries.map((q) =>
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          query: q,
          search_depth: 'basic',
          max_results: 3,
          include_answer: false,
        }),
      }).then((r) => r.json())
    )
  );

  const items = results
    .flatMap((r) => (r.results ?? []) as { url: string; title: string; content: string }[])
    .map((item) => `SOURCE: ${item.url}\nTITLE: ${item.title}\nCONTENT: ${item.content}`)
    .join('\n\n---\n\n');

  return items || '(no search results returned)';
}

export async function generateBriefing(): Promise<Briefing> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY environment variable is not set');

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

  const groq = new Groq({ apiKey });

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(dateStr, searchContext, exclusionBlock) },
    ],
    max_tokens: 8192,
    temperature: 0.4, // lower = more disciplined, less likely to repeat familiar narrative patterns
  });

  const text = completion.choices[0]?.message?.content ?? '';
  const jsonStr = extractJSON(text);
  return buildBriefing(JSON.parse(jsonStr), today);
}
