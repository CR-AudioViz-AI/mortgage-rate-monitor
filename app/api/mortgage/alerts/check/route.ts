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

// Fetch current mortgage rates from FRED API
async function fetchCurrentRates() {
  const fredApiKey = process.env.FRED_API_KEY || 'placeholder_fred_key';
  
  const rates: any = {};
  const rateSeriesMap = {
    '30y_fixed': 'MORTGAGE30US',
    '15y_fixed': 'MORTGAGE15US',
    '5_1_arm': 'MORTGAGE5US'
  };

  for (const [rateType, seriesId] of Object.entries(rateSeriesMap)) {
    try {
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredApiKey}&file_type=json&sort_order=desc&limit=1`
      );
      
      if (!response.ok) {
        console.error(`Failed to fetch ${rateType} rate:`, response.statusText);
        continue;
      }
      
      const data = await response.json();
      
      if (data.observations && data.observations.length > 0) {
        const latestObs = data.observations[0];
        rates[rateType] = {
          rate: parseFloat(latestObs.value),
          date: latestObs.date
        };
      }
    } catch (error) {
      console.error(`Error fetching ${rateType} rate:`, error);
    }
  }
  
  return rates;
}

// Log email alert (Phase 3B enhancement will integrate actual email sending)
async function logEmailAlert(
  email: string,
  rateType: string,
  currentRate: number,
  threshold: number,
  condition: string
) {
  const rateTypeLabels: any = {
    '30y_fixed': '30-Year Fixed',
    '15y_fixed': '15-Year Fixed',
    '5_1_arm': '5/1 ARM'
  };

  const rateLabel = rateTypeLabels[rateType] || rateType;
  const conditionLabel = condition === 'above' ? 'risen above' : 'fallen below';

  console.log('='.repeat(80));
  console.log('📧 EMAIL ALERT TRIGGERED');
  console.log('='.repeat(80));
  console.log(`To: ${email}`);
  console.log(`Subject: 🚨 Rate Alert: ${rateLabel} has ${conditionLabel} ${threshold}%`);
  console.log(`Rate Type: ${rateLabel}`);
  console.log(`Current Rate: ${currentRate.toFixed(2)}%`);
  console.log(`Threshold: ${threshold}%`);
  console.log(`Condition: ${conditionLabel}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(80));

  // Return success for logging purposes
  // Phase 3B enhancement: Replace this with actual Resend email sending
  return { 
    success: true, 
    messageId: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    note: 'Email logged. Phase 3B will add actual email delivery via Resend API.'
  };
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

    // Fetch current rates
    const currentRates = await fetchCurrentRates();
    
    if (Object.keys(currentRates).length === 0) {
      console.error('[CRON] Failed to fetch any current rates');
      return NextResponse.json(
        { error: 'Failed to fetch current rates' },
        { status: 500 }
      );
    }

    console.log('[CRON] Current rates:', currentRates);

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

    console.log(`[CRON] Checking ${alerts.length} active alerts...`);

    let triggeredCount = 0;
    const results = [];

    // Check each alert
    for (const alert of alerts) {
      const rateData = currentRates[alert.rate_type];
      
      if (!rateData) {
        console.warn(`[CRON] No rate data for ${alert.rate_type}`);
        continue;
      }

      const currentRate = rateData.rate;
      const shouldTrigger = 
        (alert.condition === 'above' && currentRate >= alert.threshold) ||
        (alert.condition === 'below' && currentRate <= alert.threshold);

      if (shouldTrigger) {
        console.log(`[CRON] Alert triggered for user ${alert.user_id}: ${alert.rate_type} ${alert.condition} ${alert.threshold}%`);
        
        // Log email alert
        const emailResult = await logEmailAlert(
          alert.email,
          alert.rate_type,
          currentRate,
          alert.threshold,
          alert.condition
        );

        // Log alert trigger
        const { error: logError } = await supabase
          .from('mortgage_alert_logs')
          .insert({
            alert_id: alert.id,
            user_id: alert.user_id,
            rate_type: alert.rate_type,
            threshold: alert.threshold,
            condition: alert.condition,
            current_rate: currentRate,
            triggered_at: new Date().toISOString(),
            email_sent: emailResult.success,
            email_error: emailResult.error || null
          });

        if (logError) {
          console.error('[CRON] Error logging alert:', logError);
        }

        triggeredCount++;
        results.push({
          alert_id: alert.id,
          user_id: alert.user_id,
          rate_type: alert.rate_type,
          triggered: true,
          email_sent: emailResult.success
        });
      }
    }

    console.log(`[CRON] Alert check complete. Triggered: ${triggeredCount}/${alerts.length}`);

    return NextResponse.json({
      success: true,
      message: 'Alert check complete',
      checked: alerts.length,
      triggered: triggeredCount,
      results
    });

  } catch (error) {
    console.error('[CRON] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
