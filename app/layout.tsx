// Root Layout
// CR AudioViz AI - Mortgage Rate Monitor
// Roy Henderson @ December 2025

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mortgage Rate Monitor | CR AudioViz AI',
  description: 'Real-time mortgage rates from Freddie Mac. Track 30-year fixed, 15-year fixed, ARM, FHA, VA, and Jumbo rates. Updated weekly.',
  keywords: ['mortgage rates', 'home loan rates', '30 year fixed', '15 year fixed', 'FHA rates', 'VA rates', 'ARM rates'],
  authors: [{ name: 'CR AudioViz AI' }],
  creator: 'CR AudioViz AI',
  publisher: 'CR AudioViz AI',
  openGraph: {
    title: 'Mortgage Rate Monitor | CR AudioViz AI',
    description: 'Real-time mortgage rates from Freddie Mac. Track 30-year fixed, 15-year fixed, ARM, FHA, VA, and Jumbo rates.',
    url: 'https://mortgage-rate-monitor.vercel.app',
    siteName: 'Mortgage Rate Monitor',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mortgage Rate Monitor | CR AudioViz AI',
    description: 'Real-time mortgage rates from Freddie Mac. Track 30-year fixed, 15-year fixed, ARM, FHA, VA, and Jumbo rates.',
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
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
