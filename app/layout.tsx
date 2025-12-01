// Javari AI Mortgage Rate Monitoring - Root Layout
// Created: 2025-11-14 23:26 UTC
// Roy Henderson, CEO @ CR AudioViz AI, LLC

import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Javari AI Mortgage Rate Monitoring',
  description: 'Professional mortgage rate monitoring API with real-time data, historical analytics, and email alerts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}        {/* Javari AI */}
        <Script src="https://javariai.com/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
