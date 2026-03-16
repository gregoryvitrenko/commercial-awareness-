import Anthropic from '@anthropic-ai/sdk';
import type { Briefing } from '@/lib/types';
import { getCachedScript, saveScript } from '@/lib/podcast-storage';
import { getDailyCharBudget } from '@/lib/char-usage';

/**
 * Generates a podcast script for the given briefing and saves it to disk.
 * Returns the script string, or throws on failure.
 * No-ops if a cached script already exists for that date.
 *
 * The script length is dynamically capped to the daily ElevenLabs character
 * budget so that every day of the month gets audio without exceeding the
 * 100K/month Creator tier limit.
 */
export async function generateAndSavePodcastScript(briefing: Briefing): Promise<string> {
  const cached = await getCachedScript(briefing.date);
  if (cached) return cached;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');

  // ── Dynamic budget ──────────────────────────────────────────────────────────
  // 100K chars / 30 days ≈ 3,333 chars/day. Shorter months = more room.
  // Reserve 5% for safety (rounding, punctuation variance).
  const rawBudget = await getDailyCharBudget();
  const charBudget = Math.floor(rawBudget * 0.95);

  // Rough ratio: ~7 characters per word (including spaces/punctuation).
  // Clamp to a sensible range so the prompt stays coherent.
  const wordBudget = Math.max(300, Math.min(650, Math.floor(charBudget / 7)));

  const dateStr = new Date(briefing.date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Top 3 by leadScore — already sorted descending by generate.ts
  const topStories = briefing.stories.slice(0, 3);

  const storiesJson = JSON.stringify(
    topStories.map((s) => ({
      topic: s.topic,
      headline: s.headline,
      summary: s.summary,
      whyItMatters: s.whyItMatters,
      talkingPoints: s.talkingPoints,
    })),
    null,
    2
  );

  const prompt = `You are writing a podcast script for "Folio Daily" — a morning audio briefing for law students targeting Magic Circle, Silver Circle, and elite US law firms.

Write a script for ${dateStr}. Your HARD LIMIT is ${wordBudget} words / ${charBudget} characters of spoken content. Do NOT exceed this — the text-to-speech system will be charged per character and we have a strict monthly budget. Count carefully. Aim for ${wordBudget - 20}–${wordBudget} words.

You have exactly three stories. These are the three highest-importance stories from today's briefing, selected by lead score. Do not add others. Go deeper on each one — this is a considered briefing, not a headline ticker.

VOICE & RHYTHM — this will be read aloud by a single TTS voice. Every word must sound natural when spoken, not read:
- ALWAYS use contractions: it's, don't, that's, won't, hasn't, they're, we've. Never write "it is", "do not", "that is" etc.
- Vary sentence length constantly. Follow a long sentence (18–25 words) with a short punchy one (3–8 words). Then medium. Then short again. Monotonous rhythm kills the ear.
- Use em-dashes for natural mid-sentence pauses — the TTS voice will breathe there. Use full stops for hard stops. Use commas sparingly.
- Front-load the interesting fact. "A four-billion-pound takeover — that's the headline from Freshfields this morning." Not "Freshfields has advised on a takeover valued at four billion pounds."
- Max 2 named entities per sentence. If you're naming a firm, a deal value, AND a regulatory body — split it across two sentences.
- Write numbers as words when spoken: "four point two billion", not "£4.2bn". Abbreviations should be spelled out: "CMA" stays as "CMA" (the voice handles acronyms), but "£" becomes "pounds", "%" becomes "per cent".

TRANSITIONS — ban all of these: "Meanwhile", "Furthermore", "In addition", "Turning now to", "Moving on to", "It is worth noting", "It is also important". Instead:
- Jump straight in: "Capital markets. A big IPO just landed."
- Use the topic as a one-word opener: "Disputes." or "Regulation." — then go.
- Or use a question: "What about the energy sector?" — then answer it.
- Silence IS a transition. A full stop and a new paragraph is enough.

STRUCTURE:
- Open with a crisp greeting. Give the date. One sentence on what's ahead — name the three topics, no more.
- For each story: spend 3–5 sentences. Hit the headline fact first. Then the commercial context — which practice areas, which firms. Then one concrete interview line the listener can actually use. End each story cleanly before moving on.
- Address the listener directly at least twice: "Worth knowing for interviews." "If a partner asks you about this — here's your line."
- After the three stories, close with Sector Watch and One to Follow as a quick "what to watch" segment — 1–2 sentences each, max.
- Sign off: "That's your Folio Daily for ${dateStr}. Good morning."

BANNED PATTERNS — these sound robotic when read aloud:
- "This highlights the importance of..." — just say what matters.
- "It remains to be seen whether..." — say "We'll see" or cut it.
- "In a move that signals..." — say what happened, then say why.
- "The deal, which was..." — avoid relative clauses mid-sentence. Split into two sentences.
- Starting consecutive sentences with the same word.
- Any sentence over 30 words.

OUTPUT: Plain spoken text only. No headings, no bullets, no brackets, no stage directions. Just the words the presenter would say, paragraph by paragraph. MUST be under ${charBudget} characters total.

Today's top three stories:
${storiesJson}

Sector Watch: ${briefing.sectorWatch}
One to Follow: ${briefing.oneToFollow}`;

  const anthropic = new Anthropic({ apiKey });
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = message.content[0];
  let script = block.type === 'text' ? block.text : '';
  if (!script) throw new Error('Script generation returned empty');

  // Hard truncation safety net — if Claude overshot, trim to budget.
  // This should rarely fire since the prompt enforces the limit.
  if (script.length > charBudget) {
    console.warn(
      `[podcast] Script was ${script.length} chars, truncating to ${charBudget} (budget). ` +
      `Lost ${script.length - charBudget} chars.`
    );
    // Trim at last sentence boundary within budget
    const trimmed = script.slice(0, charBudget);
    const lastPeriod = trimmed.lastIndexOf('.');
    script = lastPeriod > charBudget * 0.8 ? trimmed.slice(0, lastPeriod + 1) : trimmed;
  }

  console.log(
    `[podcast] Script for ${briefing.date}: ${script.length} chars, ` +
    `budget ${charBudget} chars (${rawBudget} raw daily budget)`
  );

  await saveScript(briefing.date, script);
  return script;
}
