End the current session by completing the full end-of-session protocol:

1. Update `/Users/gregoryvitrenko/.claude/projects/-Users-gregoryvitrenko-Documents-CommercialAwareness/memory/MEMORY.md` to reflect ALL changes made this session. Be thorough — add new features, update existing entries, remove anything outdated. This is non-negotiable.

2. Run `git add -u` then `git add` any new untracked files that belong in the repo (exclude data/subscriptions.json, data/bookmarks.json, data/comments.json, .env.local, and other gitignored files).

3. Commit with a concise but descriptive message summarising the session's work.

4. Attempt `git push origin main`.

5. If the push fails, warn: "⚠️ Commit saved locally but push failed — run `git push origin main` in your terminal to sync to GitHub."

Do not skip any step. Do not ask for confirmation before starting — just execute the full protocol.

6. Finally, output a "Quick start for next session" block formatted exactly like this, ready to copy-paste:

---
**QUICK START — paste this at the start of your next session:**

```
We're working on Commercial Awareness Daily (Next.js 15, TypeScript, Tailwind). Last session: [1-sentence summary of what was done]. Current state: [1 sentence on where things stand]. Next up: [the most logical next task or what was left unfinished]. Anything I should know before we start?
```
---

Fill in the three bracketed sections based on the actual session. Keep each to one sentence.
