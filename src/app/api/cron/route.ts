/**
 * Vercel Cron Endpoint
 * 
 * Triggered automatically every hour by Vercel Cron (configured in vercel.json)
 * Scrapes all 92 locations and sends rate drop alerts.
 * 
 * Schedule: 0 * * * * (every hour on the hour)
 * Security: Optional CRON_SECRET verification
 * 
 * @timestamp 2025-11-12T14:47:00Z
 */

import { NextRequest, NextResponse } from 'next/server';
import { ScraperManager } from '@/lib/scrapers/scraper-manager';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max execution time

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Optional: Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron] Unauthorized access attempt');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  console.log('[Cron] Starting scheduled scraping job...');

  try {
    const manager = new ScraperManager();
    const results = await manager.scrapeAllLocations();

    const duration = Date.now() - startTime;

    console.log('[Cron] Job completed successfully');
    console.log(`  - Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`  - Locations: ${results.successfulLocations}/${results.totalLocations}`);
    console.log(`  - Rates: ${results.totalRates}`);
    console.log(`  - Changes: ${results.totalChanges}`);
    console.log(`  - Alerts: ${results.totalAlerts}`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      results: {
        totalLocations: results.totalLocations,
        successfulLocations: results.successfulLocations,
        totalRates: results.totalRates,
        totalChanges: results.totalChanges,
        totalAlerts: results.totalAlerts,
        errors: results.errors.slice(0, 10), // Limit error output
      },
    });
  } catch (error: any) {
    console.error('[Cron] Job failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
