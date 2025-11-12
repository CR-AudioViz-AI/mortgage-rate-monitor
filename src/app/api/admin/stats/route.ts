/**
 * GET /api/admin/stats
 * 
 * Get system statistics for monitoring and dashboard.
 * Shows scraping performance, alert activity, and data coverage.
 * 
 * Query Parameters:
 * - days: Number of days to include in stats (default: 7)
 * 
 * @timestamp 2025-11-12T14:47:00Z
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') || '7'), 365);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get scraping statistics
    const { data: scrapingLogs, error: logsError } = await supabase
      .from('scraping_logs')
      .select('*')
      .gte('scraped_at', startDate.toISOString());

    if (logsError) throw logsError;

    // Get rate statistics
    const { data: rates, error: ratesError } = await supabase
      .from('mortgage_rates')
      .select('*')
      .gte('scraped_at', startDate.toISOString());

    if (ratesError) throw ratesError;

    // Get alert statistics
    const { data: alerts, error: alertsError } = await supabase
      .from('alert_history')
      .select('*')
      .gte('sent_at', startDate.toISOString());

    if (alertsError) throw alertsError;

    // Get active alert configs
    const { data: activeAlerts, error: activeAlertsError } = await supabase
      .from('alert_configs')
      .select('*')
      .eq('is_active', true);

    if (activeAlertsError) throw activeAlertsError;

    // Get latest rates count
    const { count: latestRatesCount } = await supabase
      .from('latest_rates_view')
      .select('*', { count: 'exact', head: true });

    // Calculate scraping stats
    const totalScrapes = scrapingLogs.length;
    const successfulScrapes = scrapingLogs.filter((log) => log.status === 'success').length;
    const failedScrapes = scrapingLogs.filter((log) => log.status === 'failed').length;
    const successRate = totalScrapes > 0 ? (successfulScrapes / totalScrapes) * 100 : 0;

    // Calculate average scrape duration
    const durations = scrapingLogs
      .filter((log) => log.duration_ms)
      .map((log) => log.duration_ms);
    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    // Calculate rates by source
    const ratesBySource = rates.reduce((acc: any, rate: any) => {
      const sources = rate.sources || [];
      sources.forEach((source: string) => {
        acc[source] = (acc[source] || 0) + 1;
      });
      return acc;
    }, {});

    // Calculate alert stats
    const totalAlertsSent = alerts.length;
    const uniqueUsers = new Set(alerts.map((alert: any) => alert.user_email)).size;

    // Get most recent scrape time
    const mostRecentScrape = scrapingLogs.length > 0
      ? new Date(Math.max(...scrapingLogs.map((log) => new Date(log.scraped_at).getTime())))
      : null;

    // Calculate rate coverage by location
    const locationCoverage = rates.reduce((acc: any, rate: any) => {
      acc[rate.location_code] = (acc[rate.location_code] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      period: {
        days,
        start: startDate.toISOString(),
        end: new Date().toISOString(),
      },
      scraping: {
        totalScrapes,
        successfulScrapes,
        failedScrapes,
        successRate: parseFloat(successRate.toFixed(2)),
        averageDurationMs: Math.round(avgDuration),
        mostRecentScrape: mostRecentScrape?.toISOString() || null,
      },
      rates: {
        totalRatesCollected: rates.length,
        latestRatesAvailable: latestRatesCount || 0,
        ratesBySource,
        locationsCovered: Object.keys(locationCoverage).length,
      },
      alerts: {
        totalAlertsSent,
        activeAlertConfigs: activeAlerts?.length || 0,
        uniqueUsersNotified: uniqueUsers,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] /admin/stats error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
