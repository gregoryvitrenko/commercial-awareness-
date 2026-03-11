import { Resend } from 'resend';
import crypto from 'crypto';

const FROM = process.env.EMAIL_FROM ?? 'Folio <hello@folioapp.co.uk>';

// ── Unsubscribe HMAC helpers ───────────────────────────────────────────────────

/**
 * Returns a 64-char hex HMAC-SHA256 signature for the given email address.
 * Used to sign and verify one-click unsubscribe URLs.
 */
export function signUnsubscribeToken(email: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(email).digest('hex');
}

/**
 * Builds a fully-qualified, HMAC-signed unsubscribe URL.
 * Reads CRON_SECRET from env; throws if not set (prevents silent unsigned links).
 */
export function buildUnsubscribeUrl(email: string, siteUrl: string): string {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error('[email] CRON_SECRET env var not set — cannot build unsubscribe URL');
  const sig = signUnsubscribeToken(email, secret);
  return `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&sig=${sig}`;
}

function welcomeHtml(firstName: string, todayUrl: string): string {
  const name = firstName ? firstName : 'there';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Folio</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#09090b;border-radius:12px 12px 0 0;padding:28px 36px;">
              <p style="margin:0;font-size:11px;font-family:'Courier New',monospace;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;">
                Folio
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px 36px 28px;border-left:1px solid #e4e4e7;border-right:1px solid #e4e4e7;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;line-height:1.3;">
                You&rsquo;re in, ${name}.
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
                Your Folio subscription is active. Every morning you get a concise briefing on the deals, disputes, and regulatory moves that matter to training contract and vacation scheme applications.
              </p>

              <!-- Feature list -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:5px 0;font-size:14px;color:#3f3f46;line-height:1.5;">
                    <span style="color:#16a34a;margin-right:8px;font-weight:600;">✓</span>Daily briefing — 8 curated stories each morning
                  </td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:14px;color:#3f3f46;line-height:1.5;">
                    <span style="color:#16a34a;margin-right:8px;font-weight:600;">✓</span>Quiz — 24 questions to test your recall
                  </td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:14px;color:#3f3f46;line-height:1.5;">
                    <span style="color:#16a34a;margin-right:8px;font-weight:600;">✓</span>Audio briefing — listen on the go
                  </td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:14px;color:#3f3f46;line-height:1.5;">
                    <span style="color:#16a34a;margin-right:8px;font-weight:600;">✓</span>Full articles + save for later
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#09090b;border-radius:8px;">
                    <a href="${todayUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
                      Read today&rsquo;s briefing &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 12px 12px;padding:20px 36px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                You&rsquo;re receiving this because you subscribed to Folio.
                Manage your subscription at any time from your account settings.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Topic colours for the digest ──────────────────────────────────────────────

const TOPIC_COLORS: Record<string, string> = {
  'M&A': '#2563eb',
  'Capital Markets': '#7c3aed',
  'Banking & Finance': '#ea580c',
  'Energy & Tech': '#059669',
  'Regulation': '#d97706',
  'Disputes': '#e11d48',
  'International': '#0d9488',
  'AI & Law': '#4f46e5',
};

// ── Weekly digest template ──────────────────────────────────────────────────

export interface DigestStory {
  headline: string;
  topic: string;
  summary: string;
  date: string; // YYYY-MM-DD
}

function digestHtml(stories: DigestStory[], siteUrl: string, weekLabel: string): string {
  const storyRows = stories
    .map((s) => {
      const color = TOPIC_COLORS[s.topic] ?? '#71717a';
      const [, month, day] = s.date.split('-').map(Number);
      const dateStr = new Date(Number(s.date.split('-')[0]), month - 1, day)
        .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #f4f4f5;">
            <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;letter-spacing:0.1em;text-transform:uppercase;color:${color};font-weight:600;">
              ${s.topic} · ${dateStr}
            </p>
            <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#09090b;line-height:1.4;">
              ${s.headline}
            </p>
            <p style="margin:0;font-size:13px;color:#52525b;line-height:1.55;">
              ${s.summary.length > 160 ? s.summary.slice(0, 157) + '...' : s.summary}
            </p>
          </td>
        </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Folio Weekly Digest</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#09090b;border-radius:12px 12px 0 0;padding:28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;font-family:'Courier New',monospace;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;">
                      Folio
                    </p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:11px;font-family:'Courier New',monospace;letter-spacing:0.08em;text-transform:uppercase;color:#52525b;">
                      Weekly Digest
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px 36px 28px;border-left:1px solid #e4e4e7;border-right:1px solid #e4e4e7;">
              <h1 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#09090b;line-height:1.3;">
                Your weekly Folio briefing
              </h1>
              <p style="margin:0 0 24px;font-size:13px;color:#a1a1aa;font-family:'Courier New',monospace;letter-spacing:0.04em;">
                ${weekLabel}
              </p>

              <p style="margin:0 0 20px;font-size:14px;color:#52525b;line-height:1.6;">
                Here are the most important stories from this week. Each one is the kind of deal, dispute, or regulatory shift that could come up in a training contract interview.
              </p>

              <!-- Stories -->
              <table width="100%" cellpadding="0" cellspacing="0">
                ${storyRows}
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td style="background:#09090b;border-radius:8px;">
                    <a href="${siteUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
                      Read full briefings &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 12px 12px;padding:20px 36px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                You&rsquo;re receiving this because you subscribe to Folio.
                Manage your subscription at any time from your account settings.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWeeklyDigest(
  to: string,
  stories: DigestStory[],
  weekLabel: string,
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping digest');
    return { success: false, error: 'No API key' };
  }

  const resend = new Resend(apiKey);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Folio Weekly Digest — ${weekLabel}`,
    html: digestHtml(stories, siteUrl, weekLabel),
  });

  if (error) {
    console.error(`[email] Digest send failed for ${to}:`, error);
    return { success: false, error: String(error) };
  }
  return { success: true };
}

export async function sendWelcomeEmail(to: string, firstName?: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping welcome email');
    return;
  }

  const resend = new Resend(apiKey);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';
  const todayUrl = siteUrl;

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to Folio',
    html: welcomeHtml(firstName ?? '', todayUrl),
  });

  if (error) {
    console.error('[email] Failed to send welcome email:', error);
  }
}
