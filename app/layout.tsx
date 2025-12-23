// CR AudioViz AI - Mortgage Rate Monitor
// ROOT LAYOUT - Global wrapper with navigation
// December 22, 2025

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mortgage Rate Monitor | CR AudioViz AI',
  description: 'See the REAL costs of your mortgage. True cost analysis, HMDA lender data, hidden cost alerts, and AI-powered rate lock timing. Built different.',
  keywords: 'mortgage rates, mortgage calculator, home loan, true cost, HMDA, lender comparison, rate lock, refinance',
  authors: [{ name: 'CR AudioViz AI, LLC' }],
  openGraph: {
    title: 'Mortgage Rate Monitor | CR AudioViz AI',
    description: 'See the REAL costs of your mortgage. Not just the teaser rate.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mortgage Rate Monitor | CR AudioViz AI',
    description: 'See the REAL costs of your mortgage.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/favicon.ico" />
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
