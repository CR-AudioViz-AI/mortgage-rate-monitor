// GET /api/health - Health check endpoint
// CR AudioViz AI - Mortgage Rate Monitor
// Roy Henderson @ December 2025

import { NextResponse } from 'next/server';

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'mortgage-rate-monitor',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      fred_api_key: !!process.env.FRED_API_KEY,
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
  };

  const allHealthy = Object.values(healthCheck.checks).every(v => v === true);

  return NextResponse.json(healthCheck, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export const dynamic = 'force-dynamic';
