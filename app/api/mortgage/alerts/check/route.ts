// Javari AI Mortgage Rate Monitoring - Alert Checker Cron Job
// Phase 3B: Background job to check rates and send email alerts
// Runs every 6 hours
// Created: 2025-11-14 22:32 UTC
// Roy Henderson, CEO @ CR AudioViz AI, LLC

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'development_secret';
  
  if (!authHeader) {
    return false;
  }
  
  const providedSecret = authHeader.replace('Bearer ', '');
  return providedSecret === cronSecret;
}

// Main cron handler
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing cron secret' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting alert check job...');
    console.log('[CRON] Phase 3B: Email alerts currently in logging mode');
    console.log('[CRON] Future enhancement: Add actual email delivery');

    // Fetch all active alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('mortgage_rate_alerts')
      .select('*')
      .eq('is_active', true);

    if (alertsError) {
      console.error('[CRON] Error fetching alerts:', alertsError);
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 }
      );
    }

    if (!alerts || alerts.length === 0) {
      console.log('[CRON] No active alerts to check');
      return NextResponse.json({
        success: true,
        message: 'No active alerts',
        checked: 0,
        triggered: 0
      });
    }

    console.log(`[CRON] Found ${alerts.length} active alerts`);
    console.log('[CRON] Alert checking logic will be implemented in Phase 3B enhancement');

    return NextResponse.json({
      success: true,
      message: 'Alert check complete (stub)',
      checked: alerts.length,
      triggered: 0,
      note: 'Phase 3B enhancement pending: Rate checking and email delivery'
    });

  } catch (error) {
    console.error('[CRON] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
