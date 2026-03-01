import Anthropic from '@anthropic-ai/sdk';
import type { Briefing, Story, TopicCategory } from './types';

const SYSTEM_PROMPT = `You are a Commercial Awareness Agent producing daily briefings for a first-year LLB student in London targeting Magic Circle, Silver Circle, and elite US law firms. Your briefings are sharp, factually accurate, and commercially sophisticated. You write for a reader who is intelligent but time-pressed — think briefing a sharp trainee solicitor, not filing a memo.`;

function buildUserPrompt(dateStr: string): string {
  return `Today is ${dateStr}.

Search for the 5–8 highest-signal commercial and legal stories from the last 24 hours. Prioritise stories in this order:

1. M&A and private equity deals with significant UK/European nexus
2. Capital markets, IPOs, restructuring, banking & finance
3. Energy, infrastructure, tech and AI with regulatory or transactional relevance
4. Competition law and financial regulation developments
5. Commercially significant disputes or arbitration
6. Global moves clearly relevant to international firms operating in London

Search across: FT, Reuters, Bloomberg, BBC Business, The Economist, The Lawyer, Law.com, Legal Business, and the insights/news pages of A&O Shearman, Slaughter and May, Clifford Chance, Linklaters, Freshfields, Latham & Watkins, Kirkland & Ellis.

Return a raw JSON object (no markdown fences, no preamble) with this exact structure:

{
  "stories": [
    {
      "topic": "M&A",
      "headline": "One sharp, declarative sentence",
      "summary": "3–4 sentences. Factually accurate — who, what, where, numbers if known.",
      "whyItMatters": "2–3 sentences on client impact, deal flow, or strategic implications for law firms.",
      "talkingPoint": "One punchy, confident sentence you could drop into a vacation scheme or TC interview."
    }
  ],
  "sectorWatch": "2–3 sentences on the most important broader trend worth tracking this week.",
  "oneToFollow": "One sentence identifying a developing story to monitor over the next few days."
}

Rules for topic field — must be exactly one of: "M&A", "Capital Markets", "Energy & Tech", "Regulation", "Disputes", "International"

Tone: Intelligent but not stuffy. Brief a sharp colleague, not a filing report. Zero filler phrases ("it is worth noting", "this highlights the importance of", "in conclusion"). If a number is imprecise, say so briefly rather than omitting it.`;
}

function extractJSON(text: string): string {
  // Try fenced code block first
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Try bare JSON object
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
  }));

  return {
    date,
    generatedAt: new Date().toISOString(),
    stories,
    sectorWatch: (parsed.sectorWatch as string) ?? '',
    oneToFollow: (parsed.oneToFollow as string) ?? '',
  };
}

async function generateWithWebSearch(
  client: Anthropic,
  today: string,
  dateStr: string,
): Promise<Briefing> {
  const messages: Anthropic.Messages.MessageParam[] = [
    { role: 'user', content: buildUserPrompt(dateStr) },
  ];

  const MAX_ITERATIONS = 20;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-6',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ type: 'web_search_20250305' as any, name: 'web_search' }],
      messages,
    });

    const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
    const textBlocks = response.content.filter((b) => b.type === 'text');

    if (response.stop_reason === 'end_turn' || toolUseBlocks.length === 0) {
      const text = textBlocks
        .map((b) => (b as Anthropic.Messages.TextBlock).text)
        .join('');
      const jsonStr = extractJSON(text);
      return buildBriefing(JSON.parse(jsonStr), today);
    }

    // Continue the agentic search loop
    messages.push({ role: 'assistant', content: response.content });

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = toolUseBlocks.map((b) => ({
      type: 'tool_result',
      tool_use_id: (b as Anthropic.Messages.ToolUseBlock).id,
      content: '',
    }));

    messages.push({ role: 'user', content: toolResults });
  }

  throw new Error('Reached max iteration limit during web-search generation loop');
}

async function generatePlain(
  client: Anthropic,
  today: string,
  dateStr: string,
): Promise<Briefing> {
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-6',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(dateStr) }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.Messages.TextBlock).text)
    .join('');

  const jsonStr = extractJSON(text);
  return buildBriefing(JSON.parse(jsonStr), today);
}

export async function generateBriefing(): Promise<Briefing> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is not set');

  const client = new Anthropic({ apiKey });

  const today = new Date().toISOString().split('T')[0];
  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const useWebSearch = process.env.USE_WEB_SEARCH !== 'false';

  if (useWebSearch) {
    return generateWithWebSearch(client, today, dateStr);
  }
  return generatePlain(client, today, dateStr);
}
