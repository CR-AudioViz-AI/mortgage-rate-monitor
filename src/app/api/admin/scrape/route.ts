/**
 * POST /api/admin/scrape
 * 
 * Manually trigger a scraping job (bypasses hourly cron schedule).
 * Useful for testing and on-demand updates.
 * 
 * Request Body:
 * {
 *   location_code?: string (optional, scrapes specific location)
 * }
 * 
 * If no location_code provided, scrapes all 92 locations.
 * 
 * @timestamp 2025-11-12T14:47:00Z
 */

import { NextRequest, NextResponse } from 'next/server';
import { ScraperManager } from '@/lib/scrapers/scraper-manager';
import { LOCATIONS } from '@/lib/config/locations';

export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json().catch(() => ({}));
    const { location_code } = body;

    const manager = new ScraperManager();

    // Single location scrape
    if (location_code) {
      const location = LOCATIONS.find((loc) => loc.code === location_code);

      if (!location) {
        return NextResponse.json(
          {
            success: false,
            error: `Location code '${location_code}' not found`,
          },
          { status: 404 }
        );
      }

      console.log(`[Admin] Manual scrape requested for ${location.name}`);

      const result = await manager.scrapeLocation(location.name, location.code);
      const duration = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        location: location.name,
        location_code: location.code,
        rates_collected: result.rates.length,
        errors: result.errors,
        duration,
        timestamp: new Date().toISOString(),
      });
    }

    // Full scrape of all locations
    console.log('[Admin] Manual scrape requested for ALL locations');

    const results = await manager.scrapeAllLocations();
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      results: {
        totalLocations: results.totalLocations,
        successfulLocations: results.successfulLocations,
        totalRates: results.totalRates,
        totalChanges: results.totalChanges,
        totalAlerts: results.totalAlerts,
        errors: results.errors.slice(0, 20), // Limit error output
      },
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Admin] Manual scrape failed:', error);

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
