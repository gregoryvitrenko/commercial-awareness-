import { Resend } from 'resend';

const FROM = process.env.EMAIL_FROM ?? 'Commercial Awareness Daily <onboarding@resend.dev>';

function welcomeHtml(firstName: string, todayUrl: string): string {
  const name = firstName ? firstName : 'there';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Commercial Awareness Daily</title>
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
                Commercial Awareness Daily
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
                Your Commercial Awareness Daily subscription is active. Every morning you get a concise briefing on the deals, disputes, and regulatory moves that matter to Magic Circle, Silver Circle and US firm interviews.
              </p>

              <!-- Feature list -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:5px 0;font-size:14px;color:#3f3f46;line-height:1.5;">
                    <span style="color:#16a34a;margin-right:8px;font-weight:600;">✓</span>Daily briefing — 6 curated stories each morning
                  </td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:14px;color:#3f3f46;line-height:1.5;">
                    <span style="color:#16a34a;margin-right:8px;font-weight:600;">✓</span>Quiz — 18 questions to test your recall
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
                You&rsquo;re receiving this because you subscribed to Commercial Awareness Daily.
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
    subject: 'Welcome to Commercial Awareness Daily',
    html: welcomeHtml(firstName ?? '', todayUrl),
  });

  if (error) {
    console.error('[email] Failed to send welcome email:', error);
  }
}
