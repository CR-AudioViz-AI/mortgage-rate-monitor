import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mortgage Rate Monitor',
  description: 'Real-time mortgage rate monitoring for 92 US locations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
