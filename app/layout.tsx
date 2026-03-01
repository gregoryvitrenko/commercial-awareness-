import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Commercial Awareness Daily',
  description:
    'Daily commercial awareness briefing for LLB students targeting Magic Circle, Silver Circle, and elite US law firms.',
  robots: 'noindex, nofollow', // Personal tool — keep private
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans min-h-screen transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
