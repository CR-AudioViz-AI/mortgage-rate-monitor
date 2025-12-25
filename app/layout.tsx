// RateUnlock - The Mortgage Calculator That Tells The Truth
// ROOT LAYOUT - Complete with all meta tags and icons
// Rebranded: December 24, 2025

import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: {
    default: 'RateUnlock | See What You\'ll Really Pay',
    template: '%s | RateUnlock',
  },
  description: 'Unlock the truth about your mortgage. True cost analysis, real lender data from HMDA, hidden cost alerts, and AI-powered rate lock timing. Stop guessing. Start knowing.',
  keywords: ['mortgage rates', 'mortgage calculator', 'home loan', 'true cost', 'HMDA', 'lender comparison', 'rate lock', 'refinance', 'RateUnlock', 'mortgage tools'],
  authors: [{ name: 'CR AudioViz AI, LLC', url: 'https://craudiovizai.com' }],
  creator: 'CR AudioViz AI, LLC',
  publisher: 'CR AudioViz AI, LLC',
  
  // Favicons and Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/rateunlock-icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  
  // Manifest for PWA
  manifest: '/manifest.json',
  
  // Open Graph
  openGraph: {
    title: 'RateUnlock | Unlock the Truth About Your Mortgage',
    description: 'See what you\'ll REALLY pay. Not just the teaser rate. 10+ free tools powered by real federal data.',
    type: 'website',
    locale: 'en_US',
    url: 'https://rateunlock.com',
    siteName: 'RateUnlock',
    images: [
      {
        url: 'https://rateunlock.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RateUnlock - Unlock the Truth About Your Mortgage',
        type: 'image/png',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'RateUnlock | Unlock Your True Mortgage Cost',
    description: 'See what you\'ll REALLY pay. Stop guessing, start knowing. 10+ free mortgage tools.',
    images: ['https://rateunlock.com/twitter-image.png'],
    creator: '@craudiovizai',
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification (add your codes when ready)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },
  
  // Alternate languages (for future expansion)
  alternates: {
    canonical: 'https://rateunlock.com',
  },
  
  // Category
  category: 'finance',
  
  // Base URL
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RateUnlock" />
        <meta name="application-name" content="RateUnlock" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/rateunlock-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'RateUnlock',
              description: 'Unlock the truth about your mortgage with 10+ free calculators and tools.',
              url: 'https://rateunlock.com',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              creator: {
                '@type': 'Organization',
                name: 'CR AudioViz AI, LLC',
                url: 'https://craudiovizai.com',
              },
            }),
          }}
        />
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
