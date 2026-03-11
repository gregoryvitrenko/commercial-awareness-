import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SiteFooter } from '@/components/SiteFooter';
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
        <body className="bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans min-h-screen flex flex-col transition-colors duration-200">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebApplication',
                name: 'Folio',
                url: 'https://www.folioapp.co.uk',
                description: siteDescription,
                applicationCategory: 'EducationalApplication',
                operatingSystem: 'Web',
                offers: {
                  '@type': 'Offer',
                  price: '4.00',
                  priceCurrency: 'GBP',
                  description: 'Monthly subscription for full access',
                },
                audience: {
                  '@type': 'Audience',
                  audienceType: 'UK law students preparing for training contract applications',
                },
                featureList: [
                  'Daily commercial awareness briefings with AI-curated legal news',
                  'Watson Glaser and SJT aptitude test practice',
                  'Training contract interview preparation',
                  'Firm profiles for 46 UK and US law firms',
                  'Audio briefings with human-quality voice',
                  'Daily quiz with streak tracking',
                  'Legal events calendar with .ics export',
                ],
              }),
            }}
          />
          <Providers>
            <main className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </Providers>
          <ScrollToTop />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
