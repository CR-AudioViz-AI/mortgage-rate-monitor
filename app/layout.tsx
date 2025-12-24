// RateUnlock - The Mortgage Calculator That Tells The Truth
// ROOT LAYOUT - Global wrapper with navigation
// Rebranded: December 24, 2025

import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'RateUnlock | See What You\'ll Really Pay',
  description: 'Unlock the truth about your mortgage. True cost analysis, real lender data from HMDA, hidden cost alerts, and AI-powered rate lock timing. Stop guessing. Start knowing.',
  keywords: 'mortgage rates, mortgage calculator, home loan, true cost, HMDA, lender comparison, rate lock, refinance, RateUnlock',
  authors: [{ name: 'CR AudioViz AI, LLC' }],
  openGraph: {
    title: 'RateUnlock | Unlock the Truth About Your Mortgage',
    description: 'See what you\'ll REALLY pay. Not just the teaser rate. 10+ free tools powered by real federal data.',
    type: 'website',
    locale: 'en_US',
    url: 'https://rateunlock.com',
    siteName: 'RateUnlock',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RateUnlock | Unlock Your True Mortgage Cost',
    description: 'See what you\'ll REALLY pay. Stop guessing, start knowing.',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL('https://rateunlock.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${outfit.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} bg-slate-900 text-white antialiased`}>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
