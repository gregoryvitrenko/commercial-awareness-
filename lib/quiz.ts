import Anthropic from '@anthropic-ai/sdk';
import type { Briefing, DailyQuiz, PracticeSet, QuizQuestion } from './types';

const SYSTEM_PROMPT = `You are a quiz-setter for Folio, a legal prep platform for LLB students targeting Magic Circle, Silver Circle, and elite US law firms. Your questions test whether the student has read and understood today's briefing — not general legal knowledge.`;

function buildStoryBlock(story: { id: string; topic: string; headline: string; summary: string; whyItMatters: unknown; talkingPoint: string }): string {
  const wim =
    typeof story.whyItMatters === 'object' && story.whyItMatters !== null
      ? JSON.stringify(story.whyItMatters)
      : String(story.whyItMatters);

  return `--- STORY ${story.id} [${story.topic}] ---
Headline: ${story.headline}
Summary: ${story.summary}
Why It Matters: ${wim}
Talking Point: ${story.talkingPoint}`;
}

function buildPrompt(briefing: Briefing): string {
  const storiesBlock = briefing.stories.map(buildStoryBlock).join('\n\n');

  return `Today's briefing contains the following ${briefing.stories.length} stories. For each story, write exactly 3 multiple-choice questions that test whether the student has actually read and absorbed it.

${storiesBlock}

Question design rules:
1. Q1 (Commercial Inference) — test whether the student can reason beyond the headline. Do NOT ask about the deal value or any fact visible in the headline alone. Instead ask: why this deal requires a specific regulatory clearance, what financing structure this type of transaction typically uses, which practice area at a Magic Circle firm would lead this mandate, or what the commercial implication is for a named party. The correct answer must require reading the summary AND thinking about it.

2. Q2 (Law Firm Angle) — test understanding from Why It Matters: which UK or US firm is best positioned for this specific work and why (practice group track record, client relationship, regulatory expertise). Distractors must be real competing firms doing similar work — do not use obviously wrong firms.

3. Q3 (Interview So-What) — test the commercial observation a strong candidate would make in an interview: what market trend this connects to, what a trainee would actually do day-to-day on this matter, or which observation best captures the significance for the legal industry.

For each question:
- Write 4 options (A, B, C, D). Exactly one is correct. Distractors must be plausible: use real law firm names (Linklaters, Freshfields, Clifford Chance, Allen & Overy, Latham & Watkins, Kirkland & Ellis, Skadden, Davis Polk), real regulatory bodies (CMA, FCA, PRA, EU Commission, SFO, Takeover Panel), real practice areas (M&A, leveraged finance, capital markets, restructuring, disputes, real estate finance). Never use obviously wrong distractors.
- Write an explanation of 1–2 sentences shown after the student answers. Reference the specific reasoning from the briefing. Help them understand WHY, not just what the correct answer was.
- Never use options like "None of the above" or "All of the above".
- Never use the word "distractor" or "correct answer" in any field.

Return a raw JSON object (no markdown fences, no preamble):

{
  "questions": [
    {
      "storyId": "1",
      "question": "...",
      "options": [
        {"letter": "A", "text": "..."},
        {"letter": "B", "text": "..."},
        {"letter": "C", "text": "..."},
        {"letter": "D", "text": "..."}
      ],
      "correctLetter": "B",
      "explanation": "..."
    }
  ]
}

You must produce exactly ${briefing.stories.length * 3} questions — 3 per story, covering all ${briefing.stories.length} stories in order.`;
}

function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];

  throw new Error('No JSON found in quiz generation response');
}

export async function generateQuiz(briefing: Briefing): Promise<DailyQuiz> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const anthropic = new Anthropic({ apiKey });

  const completion = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: buildPrompt(briefing) },
    ],
  });

  const text = completion.content[0]?.type === 'text' ? completion.content[0].text : '';
  const jsonStr = extractJSON(text);
  const parsed = JSON.parse(jsonStr) as { questions: Array<Record<string, unknown>> };

  const questions: QuizQuestion[] = (parsed.questions ?? []).map((q, i) => ({
    id: `${q.storyId}-${(i % 3) + 1}`,
    storyId: String(q.storyId ?? '1'),
    question: String(q.question ?? ''),
    options: (q.options as Array<{ letter: string; text: string }> ?? []).map((o) => ({
      letter: o.letter as 'A' | 'B' | 'C' | 'D',
      text: String(o.text ?? ''),
    })),
    correctLetter: String(q.correctLetter ?? 'A') as 'A' | 'B' | 'C' | 'D',
    explanation: String(q.explanation ?? ''),
  }));

  return {
    date: briefing.date,
    generatedAt: new Date().toISOString(),
    questions,
  };
}

// ── Weekly practice set generation ────────────────────────────────────────────

const PRACTICE_TOPICS_META: Record<string, string> = {
  'ma': 'Cross-border and domestic deal structures, private equity buyouts, regulatory clearances (CMA, EU Commission, FCA), public takeovers under the Takeover Code, earn-outs and locked-box mechanisms, SPA warranties and indemnities',
  'capital-markets': 'IPOs and secondary offerings on LSE Main Market and AIM, investment-grade and high-yield bond issuances, listing rules, prospectus requirements, underwriting syndicates and stabilisation mechanics, convertible bonds',
  'banking-finance': 'Leveraged buyout financing, revolving credit facilities, intercreditor arrangements, syndicated loans, security packages, SOFR/SONIA transition post-LIBOR, covenant packages, unitranche facilities',
  'energy-tech': 'Infrastructure project finance, energy transition (renewables, hydrogen, offshore wind), tech M&A, IP licensing and structuring, data centre deals, clean energy regulation, digital infrastructure',
  'regulation': 'FCA supervision and enforcement, CMA merger control and market investigations, PRA prudential requirements, EU regulatory divergence post-Brexit, competition law, financial crime and AML obligations',
  'disputes': 'English High Court commercial litigation, international arbitration (ICC, LCIA, SIAC), enforcement of foreign judgments, damages assessment frameworks, third-party funding, cross-border discovery and disclosure',
  'international': 'Cross-border M&A, choice of governing law and jurisdiction clauses, FCPA and UK Bribery Act compliance, bilateral investment treaty arbitration, multi-jurisdictional regulatory clearances, sanctions compliance',
  'ai-law': 'EU AI Act and risk tiers, AI liability frameworks, IP ownership of AI-generated outputs, law firm strategy around AI adoption, legal tech and workflow automation, data protection intersections (UK GDPR and AI)',
};

const PRACTICE_SYSTEM_PROMPT = `You are a quiz-setter for Folio, a legal prep platform for LLB students targeting Magic Circle, Silver Circle, and elite US law firms. Your questions test commercial awareness and legal knowledge about a specific practice area. Questions are evergreen — not tied to any specific news story. They should challenge a student preparing for a training contract interview.`;

function buildPracticePrompt(topicSlug: string, topicLabel: string): string {
  const description = PRACTICE_TOPICS_META[topicSlug] ?? topicLabel;
  return `Generate 9 multiple-choice questions testing commercial awareness and legal knowledge for the practice area: ${topicLabel}.

Context: ${description}

Question design rules (cycle through all three types, 3 of each):

1. Commercial Inference (questions 1, 4, 7) — test whether the student can reason about deal structures, market dynamics, and commercial implications. Do NOT ask purely factual questions. Instead ask about why certain structures are used, what commercial rationale drives a decision, or what the implications are for a named party.

2. Law Firm Angle (questions 2, 5, 8) — test understanding of which UK or US firm is best positioned for specific types of work in this area and why (practice group strength, client relationships, market track record). Distractors must be real competing firms doing similar work — do not use obviously wrong firms.

3. Interview So-What (questions 3, 6, 9) — test the commercial observation a strong candidate would make in an interview: what market trend this area connects to, what a trainee would do day-to-day, or which observation best captures current market significance.

For each question:
- Write 4 options (A, B, C, D). Exactly one is correct. Distractors must be plausible.
- Use real law firm names (Linklaters, Freshfields, Clifford Chance, Allen & Overy, Latham & Watkins, Kirkland & Ellis, Skadden, Davis Polk, Herbert Smith Freehills, Slaughter and May), real regulatory bodies (CMA, FCA, PRA, EU Commission, SFO, Takeover Panel), real practice areas.
- Write an explanation of 1–2 sentences shown after the student answers. Help them understand WHY.
- Never use options like "None of the above" or "All of the above".
- Never use the word "distractor" or "correct answer" in any field.

Return a raw JSON object (no markdown fences, no preamble):

{
  "questions": [
    {
      "id": "1",
      "question": "...",
      "options": [
        {"letter": "A", "text": "..."},
        {"letter": "B", "text": "..."},
        {"letter": "C", "text": "..."},
        {"letter": "D", "text": "..."}
      ],
      "correctLetter": "B",
      "explanation": "..."
    }
  ]
}

You must produce exactly 9 questions.`;
}

export async function generatePracticeSet(topicSlug: string, topicLabel: string): Promise<PracticeSet> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const anthropic = new Anthropic({ apiKey });

  const completion = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8000,
    system: PRACTICE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildPracticePrompt(topicSlug, topicLabel) }],
  });

  const text = completion.content[0]?.type === 'text' ? completion.content[0].text : '';
  const jsonStr = extractJSON(text);
  const parsed = JSON.parse(jsonStr) as { questions: Array<Record<string, unknown>> };

  const questions: QuizQuestion[] = (parsed.questions ?? []).map((q, i) => ({
    id: `practice-${topicSlug}-${i + 1}`,
    storyId: '',
    question: String(q.question ?? ''),
    options: (q.options as Array<{ letter: string; text: string }> ?? []).map((o) => ({
      letter: o.letter as 'A' | 'B' | 'C' | 'D',
      text: String(o.text ?? ''),
    })),
    correctLetter: String(q.correctLetter ?? 'A') as 'A' | 'B' | 'C' | 'D',
    explanation: String(q.explanation ?? ''),
  }));

  return {
    topicSlug,
    topicLabel,
    generatedAt: new Date().toISOString(),
    questions,
  };
}
