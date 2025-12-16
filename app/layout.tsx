// CR AudioViz AI - Mortgage Rate Monitor
// Root Layout - With Centralized Auth Provider
// December 16, 2025

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { CentralAuthProvider } from '@/contexts/CentralAuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mortgage Rate Monitor | CR AudioViz AI',
  description: 'Real-time mortgage rates from Freddie Mac. Compare 500+ lenders, track 30-year fixed, 15-year fixed, ARM, FHA, VA, and Jumbo rates. Updated weekly.',
  metadataBase: new URL('https://mortgage-rate-monitor.vercel.app'),
  authors: [{ name: 'CR AudioViz AI' }],
  keywords: [
    'mortgage rates',
    'home loan rates',
    '30 year fixed',
    '15 year fixed',
    'FHA rates',
    'VA rates',
    'ARM rates',
    'mortgage calculator',
    'lender comparison',
  ],
  creator: 'CR AudioViz AI',
  publisher: 'CR AudioViz AI',
  robots: 'index, follow',
  openGraph: {
    title: 'Mortgage Rate Monitor | CR AudioViz AI',
    description: 'Real-time mortgage rates from Freddie Mac. Compare 500+ lenders and find your best rate.',
    url: 'https://mortgage-rate-monitor.vercel.app',
    siteName: 'Mortgage Rate Monitor',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mortgage Rate Monitor | CR AudioViz AI',
    description: 'Real-time mortgage rates from Freddie Mac. Compare 500+ lenders.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CentralAuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4">Mortgage Rate Monitor</h3>
                  <p className="text-gray-400 text-sm">
                    Official mortgage rates from Freddie Mac via FRED. Compare 500+ lenders nationwide.
                  </p>
                  <p className="text-gray-500 text-xs mt-4">
                    © 2025 CR AudioViz AI, LLC. All rights reserved.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Tools</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="/" className="hover:text-white">Current Rates</a></li>
                    <li><a href="/compare" className="hover:text-white">Compare Lenders</a></li>
                    <li><a href="/calculators" className="hover:text-white">Calculators</a></li>
                    <li><a href="/alerts" className="hover:text-white">Rate Alerts</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Resources</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="/historical" className="hover:text-white">Historical Data</a></li>
                    <li><a href="/api-docs" className="hover:text-white">API Documentation</a></li>
                    <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
                    <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Data Sources</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>Freddie Mac PMMS</li>
                    <li>Federal Reserve (FRED)</li>
                    <li>U.S. Treasury</li>
                    <li>NMLS Consumer Access</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                <p>
                  Part of the{' '}
                  <a 
                    href="https://craudiovizai.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    CR AudioViz AI
                  </a>{' '}
                  platform. One account, 60+ AI tools.
                </p>
              </div>
            </div>
          </footer>
        </CentralAuthProvider>
      </body>
    </html>
  );
}
