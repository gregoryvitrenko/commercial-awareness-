import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SiteFooter } from '@/components/SiteFooter';
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

export const metadata: Metadata = {
  title: 'Folio — Legal prep, done properly.',
  description:
    'Daily briefings, aptitude tests, firm profiles, and interview prep for law students targeting Magic Circle, Silver Circle, and elite US law firms.',
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
        <body className="bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans min-h-screen transition-colors duration-200">
          <Providers>
            {children}
            <SiteFooter />
          </Providers>
          <ScrollToTop />
        </body>
      </html>
    </ClerkProvider>
  );
}
