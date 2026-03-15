/**
 * Firm link audit script.
 *
 * Fetches every external URL in firms-data.ts and diversity-data.ts,
 * grabs the page <title> and first <h1>, and outputs a table so you
 * can spot mismatches (e.g. "SPARK" linking to a generic careers page).
 *
 * Usage:  npx tsx scripts/check-firm-links.ts
 * Output: scripts/link-audit.tsv  (tab-separated, open in Excel/Sheets)
 */

import { FIRMS } from '../lib/firms-data';
import { DIVERSITY_SCHEMES } from '../lib/diversity-data';
import * as fs from 'fs';
import * as path from 'path';

interface LinkEntry {
  firm: string;
  type: string;
  label: string;
  url: string;
}

function collectLinks(): LinkEntry[] {
  const links: LinkEntry[] = [];

  for (const firm of FIRMS) {
    // Main website
    links.push({ firm: firm.name, type: 'website', label: 'Website', url: firm.website });

    // Top-level apply URL
    if (firm.trainingContract.applyUrl) {
      links.push({ firm: firm.name, type: 'applyUrl', label: 'Main Apply Page', url: firm.trainingContract.applyUrl });
    }

    // Per-deadline apply URLs
    for (const dl of firm.trainingContract.deadlines) {
      if (dl.applyUrl) {
        links.push({ firm: firm.name, type: 'deadline', label: dl.label, url: dl.applyUrl });
      }
    }

    // Forage
    if (firm.forageUrl) {
      links.push({ firm: firm.name, type: 'forage', label: 'Forage Virtual Experience', url: firm.forageUrl });
    }

    // Diversity schemes
    const schemes = DIVERSITY_SCHEMES[firm.slug] || [];
    for (const scheme of schemes) {
      if (scheme.applyUrl) {
        links.push({ firm: firm.name, type: 'diversity', label: scheme.name, url: scheme.applyUrl });
      }
    }
  }

  return links;
}

// Dedupe by URL (many deadlines share the same URL)
function dedupeLinks(links: LinkEntry[]): LinkEntry[] {
  const seen = new Map<string, LinkEntry[]>();
  for (const link of links) {
    const existing = seen.get(link.url);
    if (existing) {
      existing.push(link);
    } else {
      seen.set(link.url, [link]);
    }
  }

  const deduped: LinkEntry[] = [];
  for (const [url, entries] of seen) {
    // Merge labels for same firm+url
    const byFirm = new Map<string, string[]>();
    for (const e of entries) {
      const labels = byFirm.get(e.firm) || [];
      labels.push(e.label);
      byFirm.set(e.firm, labels);
    }
    for (const [firm, labels] of byFirm) {
      deduped.push({
        firm,
        type: entries[0].type,
        label: [...new Set(labels)].join(' / '),
        url,
      });
    }
  }
  return deduped;
}

async function fetchPageInfo(url: string): Promise<{ status: number; title: string; h1: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

    const clean = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);

    return {
      status: res.status,
      title: titleMatch ? clean(titleMatch[1]) : '(no title)',
      h1: h1Match ? clean(h1Match[1]) : '(no h1)',
    };
  } catch (err: any) {
    return {
      status: 0,
      title: `ERROR: ${err.code || err.message || 'unknown'}`,
      h1: '',
    };
  }
}

async function main() {
  const allLinks = collectLinks();
  const links = dedupeLinks(allLinks);

  console.log(`Found ${allLinks.length} total URLs (${links.length} unique). Fetching...\n`);

  // Process in batches of 10 to avoid hammering servers
  const results: string[] = [];
  results.push(['Firm', 'Type', 'Label', 'Status', 'Page Title', 'Page H1', 'URL'].join('\t'));

  const BATCH = 10;
  for (let i = 0; i < links.length; i += BATCH) {
    const batch = links.slice(i, i + BATCH);
    const infos = await Promise.all(batch.map((l) => fetchPageInfo(l.url)));

    for (let j = 0; j < batch.length; j++) {
      const link = batch[j];
      const info = infos[j];
      const statusFlag = info.status === 200 ? '200' : info.status === 0 ? 'ERR' : `${info.status}`;
      results.push([link.firm, link.type, link.label, statusFlag, info.title, info.h1, link.url].join('\t'));

      // Print progress
      const idx = i + j + 1;
      const icon = info.status === 200 ? '✓' : '✗';
      console.log(`[${idx}/${links.length}] ${icon} ${link.firm} — ${link.label}`);
    }
  }

  const outPath = path.join(__dirname, 'link-audit.tsv');
  fs.writeFileSync(outPath, results.join('\n'), 'utf-8');
  console.log(`\nDone. Report saved to: ${outPath}`);
  console.log('Open in Excel/Google Sheets to review.');
}

main();
