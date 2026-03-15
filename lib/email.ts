import { Resend } from 'resend';
import crypto from 'crypto';

const FROM = process.env.EMAIL_FROM ?? 'Folio <hello@folioapp.co.uk>';

// ── Unsubscribe HMAC helpers ───────────────────────────────────────────────────

export function signUnsubscribeToken(email: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(email).digest('hex');
}

export function buildUnsubscribeUrl(email: string, siteUrl: string): string {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error('[email] CRON_SECRET env var not set — cannot build unsubscribe URL');
  const sig = signUnsubscribeToken(email, secret);
  return `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&sig=${sig}`;
}

// ── Topic accent colours ───────────────────────────────────────────────────────

const TOPIC_COLORS: Record<string, string> = {
  'M&A':                '#2563eb',
  'Capital Markets':    '#7c3aed',
  'Banking & Finance':  '#ea580c',
  'Energy & Tech':      '#059669',
  'Regulation':         '#d97706',
  'Disputes':           '#e11d48',
  'International':      '#0d9488',
  'AI & Law':           '#4f46e5',
};

// ── Shared design tokens ──────────────────────────────────────────────────────

const T = {
  bg:          '#F5F2ED',   // warm cream page background
  card:        '#FFFFFF',
  border:      '#E8E3DA',
  header:      '#1C1917',   // stone-900
  headerText:  '#F5F2ED',
  body:        '#292524',   // stone-800
  muted:       '#78716C',   // stone-500
  faint:       '#A8A29E',   // stone-400
  cta:         '#1C1917',
  ctaText:     '#FFFFFF',
  serif:       "Georgia, 'Times New Roman', serif",
  sans:        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
};

// ── Welcome email ─────────────────────────────────────────────────────────────

function welcomeHtml(firstName: string, todayUrl: string): string {
  const name = firstName || 'there';
  const features = [
    ['Daily briefing', '8 curated stories every morning — deals, disputes, and regulatory shifts'],
    ['Daily quiz',     '24 questions to sharpen your commercial recall'],
    ['Audio briefing', 'The full briefing read aloud — listen on your commute'],
    ['Firm profiles',  'Salaries, deadlines, interview packs for 55+ firms'],
  ];

  const featureRows = features.map(([title, desc]) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid ${T.border};">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="20" valign="top" style="padding-top: 1px;">
              <div style="width: 6px; height: 6px; background: ${T.body}; border-radius: 50%; margin-top: 6px;"></div>
            </td>
            <td>
              <span style="font-family: ${T.serif}; font-size: 14px; color: ${T.body}; font-weight: bold;">${title}</span>
              <span style="font-family: ${T.sans}; font-size: 13px; color: ${T.muted};"> — ${desc}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Folio</title>
</head>
<body style="margin:0;padding:0;background:${T.bg};font-family:${T.sans};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${T.bg};padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Wordmark -->
          <tr>
            <td style="padding-bottom: 20px;" align="center">
              <span style="font-family:${T.serif};font-size:28px;font-weight:bold;color:${T.body};letter-spacing:-0.02em;">Folio</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:${T.card};border:1px solid ${T.border};border-radius:4px;overflow:hidden;">

              <!-- Card header -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${T.header};padding:28px 36px;">
                    <p style="margin:0;font-family:${T.serif};font-size:22px;color:${T.headerText};line-height:1.3;">
                      You&rsquo;re in, ${name}.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Card body -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px 36px 28px;">
                    <p style="margin:0 0 28px;font-family:${T.sans};font-size:15px;color:${T.muted};line-height:1.65;">
                      Your Folio subscription is active. Every morning you get a concise commercial law briefing — the kind of content that turns a competent interviewee into one who clearly follows the market.
                    </p>

                    <!-- Features -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                      ${featureRows}
                    </table>

                    <!-- CTA -->
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:${T.cta};border-radius:3px;">
                          <a href="${todayUrl}" style="display:inline-block;padding:13px 28px;font-family:${T.sans};font-size:14px;font-weight:600;color:${T.ctaText};text-decoration:none;letter-spacing:0.01em;">
                            Read today&rsquo;s briefing &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0 0;" align="center">
              <p style="margin:0;font-family:${T.sans};font-size:12px;color:${T.faint};line-height:1.6;">
                You&rsquo;re receiving this because you subscribed to Folio.
                Manage your subscription in account settings.
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

// ── Weekly digest template ────────────────────────────────────────────────────

export interface DigestStory {
  headline: string;
  topic: string;
  summary: string;
  date: string; // YYYY-MM-DD
}

function digestHtml(
  stories: DigestStory[],
  siteUrl: string,
  weekLabel: string,
  unsubscribeUrl: string,
  referralLink?: string,
): string {
  const storyRows = stories.map((s) => {
    const color = TOPIC_COLORS[s.topic] ?? T.muted;
    const [year, month, day] = s.date.split('-').map(Number);
    const dateStr = new Date(year, month - 1, day)
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const summary = s.summary.length > 180 ? s.summary.slice(0, 177) + '...' : s.summary;

    return `
    <tr>
      <td style="padding: 0 0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <!-- Colour accent bar -->
            <td width="3" style="background:${color};border-radius:2px;">&nbsp;</td>
            <td width="16">&nbsp;</td>
            <td>
              <p style="margin:0 0 5px;font-family:${T.sans};font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${color};">
                ${s.topic}&ensp;&middot;&ensp;${dateStr}
              </p>
              <p style="margin:0 0 6px;font-family:${T.serif};font-size:16px;font-weight:bold;color:${T.body};line-height:1.4;">
                ${s.headline}
              </p>
              <p style="margin:0;font-family:${T.sans};font-size:13px;color:${T.muted};line-height:1.6;">
                ${summary}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="border-bottom:1px solid ${T.border};padding-bottom:20px;"></td></tr>`;
  }).join('');

  const referralBlock = referralLink ? `
  <tr>
    <td style="padding: 24px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${T.bg};border:1px solid ${T.border};border-radius:3px;padding:20px 24px;">
        <tr>
          <td>
            <p style="margin:0 0 6px;font-family:${T.serif};font-size:15px;font-weight:bold;color:${T.body};">Share Folio</p>
            <p style="margin:0 0 12px;font-family:${T.sans};font-size:13px;color:${T.muted};line-height:1.5;">Get a free month when three friends subscribe using your link.</p>
            <p style="margin:0;font-family:${T.sans};font-size:12px;color:${T.faint};word-break:break-all;">${referralLink}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Folio Weekly Digest</title>
</head>
<body style="margin:0;padding:0;background:${T.bg};font-family:${T.sans};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${T.bg};padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Wordmark -->
          <tr>
            <td style="padding-bottom: 20px;" align="center">
              <span style="font-family:${T.serif};font-size:28px;font-weight:bold;color:${T.body};letter-spacing:-0.02em;">Folio</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:${T.card};border:1px solid ${T.border};border-radius:4px;overflow:hidden;">

              <!-- Card header -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${T.header};padding:28px 36px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0;font-family:${T.serif};font-size:20px;color:${T.headerText};line-height:1.3;">
                            Weekly Digest
                          </p>
                        </td>
                        <td align="right" valign="middle">
                          <p style="margin:0;font-family:${T.sans};font-size:11px;color:#A8A29E;letter-spacing:0.06em;text-transform:uppercase;">
                            ${weekLabel}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Intro -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:28px 36px 8px;">
                    <p style="margin:0;font-family:${T.sans};font-size:14px;color:${T.muted};line-height:1.65;">
                      The most significant story from each practice area this week — curated for training contract and vacation scheme interviews.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Stories -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:20px 36px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${storyRows}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:28px 36px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:${T.cta};border-radius:3px;">
                          <a href="${siteUrl}" style="display:inline-block;padding:13px 28px;font-family:${T.sans};font-size:14px;font-weight:600;color:${T.ctaText};text-decoration:none;letter-spacing:0.01em;">
                            Read full briefings &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${referralBlock}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0 0;" align="center">
              <p style="margin:0;font-family:${T.sans};font-size:12px;color:${T.faint};line-height:1.6;">
                You&rsquo;re receiving this because you subscribe to Folio.&ensp;
                <a href="${unsubscribeUrl}" style="color:${T.faint};text-decoration:underline;">Unsubscribe</a>
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

// ── Send functions ────────────────────────────────────────────────────────────

export async function sendWeeklyDigest(
  to: string,
  stories: DigestStory[],
  weekLabel: string,
  subject: string,
  unsubscribeUrl: string,
  referralLink?: string,
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping digest');
    return { success: false, error: 'No API key' };
  }

  const resend = new Resend(apiKey);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.folioapp.co.uk';

  const { error } = await resend.emails.send({
    from: FROM,
    replyTo: 'feedbackfolioapp@gmail.com',
    to,
    subject,
    html: digestHtml(stories, siteUrl, weekLabel, unsubscribeUrl, referralLink),
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:hello@folioapp.co.uk?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.folioapp.co.uk';

  const { error } = await resend.emails.send({
    from: FROM,
    replyTo: 'feedbackfolioapp@gmail.com',
    to,
    subject: 'Welcome to Folio',
    html: welcomeHtml(firstName ?? '', siteUrl),
  });

  if (error) {
    console.error('[email] Failed to send welcome email:', error);
  }
}
