import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import type { Briefing } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'data', 'briefings');

function scriptFile(date: string): string {
  return path.join(DATA_DIR, `${date}-podcast.txt`);
}

export function getCachedScript(date: string): string | null {
  try {
    return fs.readFileSync(scriptFile(date), 'utf-8');
  } catch {
    return null;
  }
}

export function saveScript(date: string, script: string): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(scriptFile(date), script, 'utf-8');
}

/**
 * Generates a podcast script for the given briefing and saves it to disk.
 * Returns the script string, or throws on failure.
 * No-ops if a cached script already exists for that date.
 */
export async function generateAndSavePodcastScript(briefing: Briefing): Promise<string> {
  const cached = getCachedScript(briefing.date);
  if (cached) return cached;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');

  const dateStr = new Date(briefing.date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const storiesJson = JSON.stringify(
    briefing.stories.map((s) => ({
      topic: s.topic,
      headline: s.headline,
      summary: s.summary,
      whyItMatters: s.whyItMatters,
    })),
    null,
    2
  );

  const prompt = `You are writing a podcast script for "Commercial Awareness Daily" — a morning audio briefing for law students targeting Magic Circle, Silver Circle, and elite US law firms.

Write a 3–4 minute script (450–550 words of spoken content) for ${dateStr}.

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
- Open with a crisp greeting. Give the date. One sentence on what's ahead — don't list all eight topics.
- Lead with the single most striking story. Hit the headline number first.
- Cover 5–6 stories total. Skip the weakest 2–3 — better to go deeper on fewer than to rush all eight. This is audio, not a written briefing.
- For each story: one headline fact, one "so what for law firms" line, done. Two to three sentences max per story.
- Address the listener directly at least twice: "Worth knowing for interviews." "If a partner asks you about this — here's your line."
- Close with Sector Watch and One to Follow as a quick "what to watch" segment — 2 sentences each, max.
- Sign off: "That's your Commercial Awareness Daily for ${dateStr}. Good morning."

BANNED PATTERNS — these sound robotic when read aloud:
- "This highlights the importance of..." — just say what matters.
- "It remains to be seen whether..." — say "We'll see" or cut it.
- "In a move that signals..." — say what happened, then say why.
- "The deal, which was..." — avoid relative clauses mid-sentence. Split into two sentences.
- Starting consecutive sentences with the same word.
- Any sentence over 30 words.

OUTPUT: Plain spoken text only. No headings, no bullets, no brackets, no stage directions. Just the words the presenter would say, paragraph by paragraph.

Today's stories:
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
  const script = block.type === 'text' ? block.text : '';
  if (!script) throw new Error('Script generation returned empty');

  saveScript(briefing.date, script);
  return script;
}
