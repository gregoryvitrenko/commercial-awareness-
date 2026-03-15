import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SiteFooter } from '@/components/SiteFooter';
import { ReferralTracker } from '@/components/ReferralTracker';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// Force all pages to render dynamically — @clerk/nextjs references `window`
// during static generation which causes build failures.
export const dynamic = 'force-dynamic';

const siteDescription =
  'Daily commercial awareness briefings, aptitude tests, firm profiles, and training contract interview prep for UK law students targeting Magic Circle, Silver Circle, and elite US law firms. £4/month.';

export const metadata: Metadata = {
  title: {
    default: 'Folio — Daily commercial awareness for law students',
    template: '%s | Folio',
  },
  description: siteDescription,
  metadataBase: new URL('https://www.folioapp.co.uk'),
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Folio',
    title: 'Folio — Daily commercial awareness for law students',
    description: siteDescription,
    url: 'https://www.folioapp.co.uk',
  },
  twitter: {
    card: 'summary',
    title: 'Folio — Daily commercial awareness for law students',
    description: siteDescription,
  },
  verification: {
    other: {
      'msvalidate.01': 'ADA2FD8E90198BEFA8169721C51FDEB6',
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} scroll-smooth`}
        suppressHydrationWarning
      >
        <body className="bg-paper dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans min-h-screen flex flex-col transition-colors duration-200">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify([
                {
                  '@context': 'https://schema.org',
                  '@type': 'SoftwareApplication',
                  name: 'Folio',
                  url: 'https://www.folioapp.co.uk',
                  description: siteDescription,
                  applicationCategory: 'EducationalApplication',
                  applicationSubCategory: 'LegalEducation',
                  operatingSystem: 'Web',
                  inLanguage: 'en-GB',
                  offers: {
                    '@type': 'Offer',
                    price: '4.00',
                    priceCurrency: 'GBP',
                    description: 'Monthly subscription — full access to all features',
                    availability: 'https://schema.org/InStock',
                  },
                  audience: {
                    '@type': 'EducationalAudience',
                    educationalRole: 'student',
                    audienceType: 'UK law students preparing for Magic Circle and US firm training contract applications',
                  },
                  featureList: [
                    'Daily commercial awareness briefings curated from FT, Reuters, and legal press',
                    'AI-generated interview talking points and "Why this firm?" answers',
                    'Watson Glaser and SJT aptitude test practice banks',
                    'Training contract interview preparation with firm-specific practice questions',
                    'Firm profiles for 46 UK and US law firms including Magic Circle and Silver Circle',
                    'Audio briefings narrated by AI voice',
                    'Daily quiz with XP streak tracking',
                    'Legal events and deadline calendar with .ics export',
                    'Sector primers covering M&A, Capital Markets, Banking, Energy, Regulation, Disputes, International, and AI & Law',
                  ],
                  keywords: 'commercial awareness, training contract, Magic Circle, law student, TC preparation, Watson Glaser, SJT, legal news briefing, UK law firms',
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'Organization',
                  name: 'Folio',
                  url: 'https://www.folioapp.co.uk',
                  description: 'Daily commercial law briefings for future City trainees.',
                  contactPoint: {
                    '@type': 'ContactPoint',
                    email: 'feedbackfolioapp@gmail.com',
                    contactType: 'customer support',
                  },
                },
              ]),
            }}
          />
          <Providers>
            <main className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </Providers>
          <ReferralTracker />
          <ScrollToTop />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
