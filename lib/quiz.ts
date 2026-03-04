import Anthropic from '@anthropic-ai/sdk';
import type { Briefing, DailyQuiz, QuizQuestion } from './types';

const SYSTEM_PROMPT = `You are a quiz-setter for Commercial Awareness Daily, a briefing for LLB students targeting Magic Circle, Silver Circle, and elite US law firms. Your questions test whether the student has read and understood today's briefing — not general legal knowledge.`;

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
1. Q1 (Recall) — test a specific fact from the Summary: deal value, adviser name, regulatory body, timeline, financing structure, or named party. Use real figures and names from the text.
2. Q2 (Significance) — test understanding from Why It Matters: which firm is best positioned and why, which practice group, what regulatory requirement applies.
3. Q3 (Interview angle) — test analytical framing from Talking Point: which observation best captures the commercial significance, what the so-what is for law firms.

For each question:
- Write 4 options (A, B, C, D). Exactly one is correct. The three distractors must be plausible — use real firm names, real regulatory bodies, slightly different figures — not obviously wrong.
- Write an explanation of 1–2 sentences shown after the student answers. Reference the specific detail from the briefing. Help them learn, not just score.
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
