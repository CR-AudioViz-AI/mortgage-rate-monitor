// CR AudioViz AI - Mortgage Rate Monitor
// Homepage - Redirects to /rates (single entry point)
// December 14, 2025

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/rates');
}
