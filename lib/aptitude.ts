import Anthropic from '@anthropic-ai/sdk';

export interface AptitudeQuestion {
  id: string;
  subtype: string;   // e.g. "Inference", "Deduction", "Workplace scenario"
  passage: string;   // Statement/passage before the proposed item
  question: string;  // The proposed item text (Proposed Inference / Assumption / etc.)
  options: { letter: string; text: string }[];
  correctLetter: string;
  /** SJT only — the least effective response */
  leastEffectiveLetter?: string;
  explanation: string;
}

// ── JSON extraction (same pattern as quiz.ts) ─────────────────────────────────

function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];

  throw new Error('No JSON found in aptitude question generation response');
}

// ── Watson Glaser ─────────────────────────────────────────────────────────────

// Fixed options per WG subtype — matching the real Pearson Watson Glaser format
const WG_SUBTYPE_OPTIONS: Record<string, { letter: string; text: string }[]> = {
  'Inference': [
    { letter: 'A', text: 'True' },
    { letter: 'B', text: 'Probably True' },
    { letter: 'C', text: 'Insufficient Data' },
    { letter: 'D', text: 'Probably False' },
    { letter: 'E', text: 'False' },
  ],
  'Recognition of Assumptions': [
    { letter: 'A', text: 'Assumption Made' },
    { letter: 'B', text: 'Assumption Not Made' },
  ],
  'Deduction': [
    { letter: 'A', text: 'Conclusion Follows' },
    { letter: 'B', text: 'Conclusion Does Not Follow' },
  ],
  'Interpretation': [
    { letter: 'A', text: 'Conclusion Follows' },
    { letter: 'B', text: 'Conclusion Does Not Follow' },
  ],
  'Evaluation of Arguments': [
    { letter: 'A', text: 'Argument Strong' },
    { letter: 'B', text: 'Argument Weak' },
  ],
};

function buildWGPrompt(count: number): string {
  return `Generate ${count} Watson Glaser Critical Thinking practice questions for UK law firm applicants. Spread questions across these 5 subtypes (roughly 2 per subtype): Inference, Recognition of Assumptions, Deduction, Interpretation, Evaluation of Arguments.

Each question must follow the EXACT official Watson Glaser format for its subtype. The "passage" is the Statement. The "question" is the Proposed item (Inference/Assumption/Conclusion/Argument text — NOT a question sentence). The options are FIXED per subtype as described below.

SUBTYPE FORMATS:

1. INFERENCE — "passage": factual passage (3–5 sentences, business/legal/economic context). "question": one proposed inference statement. Fixed options A–E:
   A = True, B = Probably True, C = Insufficient Data, D = Probably False, E = False
   The correct answer reflects how strongly the statement follows from the passage alone.

2. RECOGNITION OF ASSUMPTIONS — "passage": one statement someone has made (e.g. "We should move the meeting online to save time."). "question": one unstated assumption. Fixed options:
   A = Assumption Made, B = Assumption Not Made
   Choose whichever is correct. Explanations must show the logical reasoning.

3. DEDUCTION — "passage": 2–3 premises (treat as absolutely true even if unusual). "question": one proposed conclusion. Fixed options:
   A = Conclusion Follows, B = Conclusion Does Not Follow
   A conclusion follows only if it must be true given the premises — not just probably true.

4. INTERPRETATION — "passage": passage of factual statements. "question": one proposed conclusion. Fixed options:
   A = Conclusion Follows, B = Conclusion Does Not Follow
   A conclusion follows only if the evidence in the passage makes it beyond reasonable doubt.

5. EVALUATION OF ARGUMENTS — "passage": a question or proposal (e.g. "Should law firms be required to publish salary bands?"). "question": one argument for or against. Fixed options:
   A = Argument Strong, B = Argument Weak
   A strong argument is both important and directly relevant to the question. Weak = trivial, irrelevant, or based on emotion.

Key rules:
- Base all reasoning strictly on information given — do not assume outside knowledge
- Use business, commercial, legal or economic contexts (not science or sports)
- The explanation must clearly show WHY the correct answer is right using the passage/premises

Return raw JSON only (no markdown):
{
  "questions": [
    {
      "subtype": "Inference",
      "passage": "...",
      "question": "...",
      "options": [
        {"letter": "A", "text": "True"},
        {"letter": "B", "text": "Probably True"},
        {"letter": "C", "text": "Insufficient Data"},
        {"letter": "D", "text": "Probably False"},
        {"letter": "E", "text": "False"}
      ],
      "correctLetter": "C",
      "explanation": "..."
    },
    {
      "subtype": "Recognition of Assumptions",
      "passage": "...",
      "question": "...",
      "options": [
        {"letter": "A", "text": "Assumption Made"},
        {"letter": "B", "text": "Assumption Not Made"}
      ],
      "correctLetter": "A",
      "explanation": "..."
    }
  ]
}

Generate exactly ${count} questions.`;
}

// ── SJT ───────────────────────────────────────────────────────────────────────

function buildSJTPrompt(count: number): string {
  return `Generate ${count} Situational Judgement Test (SJT) practice questions for UK law firm applicants.

This follows the real AmberJack/law firm SJT format used by firms like Clifford Chance and A&O Shearman: candidates must identify BOTH the most effective AND least effective response from 4 options. This is harder than picking just one answer.

Each question presents a realistic scenario that a trainee solicitor or vacation scheme student might face. The scenario should test professional values including: client service, teamwork, integrity, resilience under pressure, knowing when to escalate, and managing competing priorities.

For each question:
- Write a 3–5 sentence scenario describing a specific professional situation
- Present 4 response options (A–D):
  - One should be clearly the MOST effective (correct)
  - One should be clearly the LEAST effective (worst)
  - Two should be plausible but suboptimal (not clearly best or worst)
- The question asks: "Select the MOST effective and LEAST effective response."
- In the explanation: explain which is most effective and WHY, which is least effective and WHY, and briefly characterise the middle two options

Key rules for scenarios:
- Situations must be specific and realistic — not vague or generic
- The least effective option usually: ignores the problem, acts inappropriately, breaches confidentiality, or escalates unnecessarily
- The most effective option usually: addresses the issue directly, maintains professionalism, protects client/firm relationships, involves a senior colleague when genuinely needed
- Make the two middle options plausible — candidates should have to think carefully

Return raw JSON only (no markdown):
{
  "questions": [
    {
      "subtype": "Workplace scenario",
      "passage": "...",
      "question": "Select the MOST effective and LEAST effective response.",
      "options": [
        {"letter": "A", "text": "..."},
        {"letter": "B", "text": "..."},
        {"letter": "C", "text": "..."},
        {"letter": "D", "text": "..."}
      ],
      "correctLetter": "B",
      "leastEffectiveLetter": "D",
      "explanation": "B is most effective because... D is least effective because... A and C are plausible but suboptimal because..."
    }
  ]
}

Generate exactly ${count} questions.`;
}

// ── Bank building ─────────────────────────────────────────────────────────────

const BANK_BATCHES: Record<string, number> = { 'watson-glaser': 3, 'sjt': 2 };
export const BANK_TTL_DAYS = 7;

/** Build a full question bank for a test type by running parallel batches. */
export async function buildAptitudeBank(
  testType: 'watson-glaser' | 'sjt',
): Promise<AptitudeQuestion[]> {
  const batches = BANK_BATCHES[testType] ?? 2;
  const results = await Promise.all(
    Array.from({ length: batches }, () => generateAptitudeQuestions(testType, 10)),
  );
  const all = results.flat();
  all.forEach((q, i) => { q.id = `${testType}-${i + 1}`; });
  return all;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateAptitudeQuestions(
  testType: 'watson-glaser' | 'sjt',
  count = 10,
): Promise<AptitudeQuestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const anthropic = new Anthropic({ apiKey });

  const prompt = testType === 'watson-glaser'
    ? buildWGPrompt(count)
    : buildSJTPrompt(count);

  const completion = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 6000,
    system: 'You are a test-setter for UK law firm aptitude assessments. Generate realistic, challenging practice questions that accurately reflect real Watson Glaser and SJT formats.',
    messages: [{ role: 'user', content: prompt }],
  });

  const text = completion.content[0]?.type === 'text' ? completion.content[0].text : '';
  const jsonStr = extractJSON(text);
  const parsed = JSON.parse(jsonStr) as { questions: Array<Record<string, unknown>> };

  // Normalise WG options: override with canonical fixed options per subtype
  return (parsed.questions ?? []).map((q, i) => {
    const subtype = String(q.subtype ?? 'Question');
    const fixedOptions = testType === 'watson-glaser'
      ? (WG_SUBTYPE_OPTIONS[subtype] ?? (q.options as Array<{ letter: string; text: string }>))
      : (q.options as Array<{ letter: string; text: string }>);

    const base: AptitudeQuestion = {
      id: `${testType}-${i + 1}`,
      subtype,
      passage: String(q.passage ?? ''),
      question: String(q.question ?? ''),
      options: (fixedOptions ?? []).map((o) => ({
        letter: String(o.letter),
        text: String(o.text),
      })),
      correctLetter: String(q.correctLetter ?? 'A'),
      explanation: String(q.explanation ?? ''),
    };
    if (testType === 'sjt' && q.leastEffectiveLetter) {
      base.leastEffectiveLetter = String(q.leastEffectiveLetter);
    }
    return base;
  });
}
