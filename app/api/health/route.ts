// GET /api/health - Health check endpoint
// CR AudioViz AI - Mortgage Rate Monitor
// Roy Henderson @ December 2025

import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    fred_api_key: !!process.env.FRED_API_KEY,
    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  };

  // 2026-08-19: `status` was the literal 'healthy' while the checks beneath it
  // could all be false. This endpoint really did serve
  // {status:'healthy', checks:{fred_api_key:false}} under an HTTP 503 - the body
  // contradicting itself and its own status code. Without the FRED key this
  // service cannot fetch a single mortgage rate, which is its entire purpose.
  //
  // A summary that does not derive from its detail is worse than no summary:
  // anything reading the body believed the service was fine. It is now computed,
  // and the failing check names itself so a reader knows WHAT is wrong rather
  // than only that something is.
  const failing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);
  const allHealthy = failing.length === 0;

  const healthCheck = {
    status: allHealthy ? 'healthy' : 'degraded',
    failing,
    timestamp: new Date().toISOString(),
    service: 'mortgage-rate-monitor',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks,
  };

  return NextResponse.json(healthCheck, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export const dynamic = 'force-dynamic';
