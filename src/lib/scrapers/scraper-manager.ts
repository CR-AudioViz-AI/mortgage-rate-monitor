/**
 * Scraper Manager
 * 
 * Orchestrates all mortgage rate scrapers with intelligent features:
 * - Parallel execution for efficiency
 * - Intelligent fallback (Zillow → Bankrate → MND)
 * - Median aggregation for accuracy
 * - Rate change detection (≥0.25% threshold)
 * - Automatic alert triggering
 * - Database persistence
 * - Comprehensive error handling
 * 
 * Manages 92 locations across 3 sources with smart batching.
 * 
 * @timestamp 2025-11-12T14:44:00Z
 */

import { createClient } from '@supabase/supabase-js';
import { ZillowScraper } from './zillow-scraper';
import { BankrateScraper } from './bankrate-scraper';
import { MortgageNewsDailyScraper } from './mortgage-news-daily-scraper';
import { RateData } from './base-scraper';
import { sendRateAlert } from '../notifications/email-service';
import { LOCATIONS } from '../config/locations';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AggregatedRate {
  location: string;
  locationCode: string;
  rateType: '30-year-fixed' | '15-year-fixed' | '5-1-arm';
  rate: number;
  apr: number;
  points: number;
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  scrapedAt: Date;
}

interface ScrapingResult {
  success: boolean;
  location: string;
  locationCode: string;
  rates: AggregatedRate[];
  errors: string[];
  duration: number;
}

interface ChangeDetection {
  location: string;
  locationCode: string;
  rateType: string;
  oldRate: number;
  newRate: number;
  change: number;
  changePercent: number;
}

export class ScraperManager {
  private zillowScraper: ZillowScraper;
  private bankrateScraper: BankrateScraper;
  private mndScraper: MortgageNewsDailyScraper;

  constructor() {
    this.zillowScraper = new ZillowScraper();
    this.bankrateScraper = new BankrateScraper();
    this.mndScraper = new MortgageNewsDailyScraper();
  }

  /**
   * Scrape all 92 locations with intelligent batching
   */
  async scrapeAllLocations(): Promise<{
    totalLocations: number;
    successfulLocations: number;
    totalRates: number;
    totalChanges: number;
    totalAlerts: number;
    duration: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    console.log(`[ScraperManager] Starting scrape of ${LOCATIONS.length} locations...`);

    const results: ScrapingResult[] = [];
    const errors: string[] = [];
    let totalRates = 0;
    let totalChanges = 0;
    let totalAlerts = 0;

    // Process locations in batches of 10 to avoid overwhelming servers
    const batchSize = 10;
    for (let i = 0; i < LOCATIONS.length; i += batchSize) {
      const batch = LOCATIONS.slice(i, i + batchSize);
      console.log(`[ScraperManager] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(LOCATIONS.length / batchSize)}`);

      const batchPromises = batch.map((location) =>
        this.scrapeLocation(location.name, location.code).catch((error) => {
          const errorMsg = `Failed to scrape ${location.name}: ${error.message}`;
          console.error(`[ScraperManager] ${errorMsg}`);
          errors.push(errorMsg);
          return null;
        })
      );

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        if (result) {
          results.push(result);
          totalRates += result.rates.length;

          // Detect changes and send alerts
          try {
            const changes = await this.detectChanges(result.rates);
            totalChanges += changes.length;

            for (const change of changes) {
              // Only alert on significant drops (≥0.25%)
              if (change.change <= -0.25) {
                const alertsSent = await this.sendAlertsForChange(change);
                totalAlerts += alertsSent;
              }
            }
          } catch (error: any) {
            errors.push(`Failed to detect changes for ${result.location}: ${error.message}`);
          }
        }
      }

      // Small delay between batches to be respectful
      if (i + batchSize < LOCATIONS.length) {
        await this.sleep(2000);
      }
    }

    const duration = Date.now() - startTime;
    const successfulLocations = results.filter((r) => r.success).length;

    console.log(`[ScraperManager] Scraping complete!`);
    console.log(`  - Locations: ${successfulLocations}/${LOCATIONS.length}`);
    console.log(`  - Rates: ${totalRates}`);
    console.log(`  - Changes detected: ${totalChanges}`);
    console.log(`  - Alerts sent: ${totalAlerts}`);
    console.log(`  - Duration: ${(duration / 1000).toFixed(2)}s`);

    return {
      totalLocations: LOCATIONS.length,
      successfulLocations,
      totalRates,
      totalChanges,
      totalAlerts,
      duration,
      errors,
    };
  }

  /**
   * Scrape a single location using all 3 sources with intelligent fallback
   */
  async scrapeLocation(location: string, locationCode: string): Promise<ScrapingResult> {
    const startTime = Date.now();
    console.log(`[ScraperManager] Scraping ${location} (${locationCode})...`);

    const errors: string[] = [];

    // Run all 3 scrapers in parallel
    const [zillowResult, bankrateResult, mndResult] = await Promise.all([
      this.zillowScraper.scrape(location, locationCode),
      this.bankrateScraper.scrape(location, locationCode),
      this.mndScraper.scrape(location, locationCode),
    ]);

    // Collect all successful rate data
    const allRates: RateData[] = [];

    if (zillowResult.success && zillowResult.data) {
      allRates.push(...zillowResult.data);
    } else {
      errors.push(`Zillow: ${zillowResult.error}`);
    }

    if (bankrateResult.success && bankrateResult.data) {
      allRates.push(...bankrateResult.data);
    } else {
      errors.push(`Bankrate: ${bankrateResult.error}`);
    }

    if (mndResult.success && mndResult.data) {
      allRates.push(...mndResult.data);
    } else {
      errors.push(`MortgageNewsDaily: ${mndResult.error}`);
    }

    // If no data from any source, fail
    if (allRates.length === 0) {
      throw new Error(`All scrapers failed for ${location}`);
    }

    // Aggregate rates by type
    const aggregatedRates = this.aggregateRates(allRates);

    // Store in database
    await this.storeRates(aggregatedRates);

    const duration = Date.now() - startTime;

    return {
      success: true,
      location,
      locationCode,
      rates: aggregatedRates,
      errors,
      duration,
    };
  }

  /**
   * Aggregate rates from multiple sources using median
   */
  private aggregateRates(rates: RateData[]): AggregatedRate[] {
    const grouped = new Map<string, RateData[]>();

    // Group by location and rate type
    for (const rate of rates) {
      const key = `${rate.locationCode}-${rate.rateType}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(rate);
    }

    const aggregated: AggregatedRate[] = [];

    // Aggregate each group
    for (const [key, groupRates] of grouped) {
      const rates = groupRates.map((r) => r.rate).sort((a, b) => a - b);
      const aprs = groupRates.map((r) => r.apr).sort((a, b) => a - b);
      const points = groupRates.map((r) => r.points || 0).sort((a, b) => a - b);

      // Use median for better accuracy
      const medianRate = this.median(rates);
      const medianApr = this.median(aprs);
      const medianPoints = this.median(points);

      // Determine confidence based on number of sources
      let confidence: 'high' | 'medium' | 'low';
      if (groupRates.length >= 3) confidence = 'high';
      else if (groupRates.length === 2) confidence = 'medium';
      else confidence = 'low';

      aggregated.push({
        location: groupRates[0].location,
        locationCode: groupRates[0].locationCode,
        rateType: groupRates[0].rateType,
        rate: medianRate,
        apr: medianApr,
        points: medianPoints,
        sources: groupRates.map((r) => r.source),
        confidence,
        scrapedAt: new Date(),
      });
    }

    return aggregated;
  }

  /**
   * Calculate median of an array
   */
  private median(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }

    return sorted[mid];
  }

  /**
   * Store aggregated rates in database
   */
  private async storeRates(rates: AggregatedRate[]): Promise<void> {
    if (rates.length === 0) return;

    // Insert into mortgage_rates table
    const rateInserts = rates.map((rate) => ({
      location: rate.location,
      location_code: rate.locationCode,
      rate_type: rate.rateType,
      rate: rate.rate,
      apr: rate.apr,
      points: rate.points,
      sources: rate.sources,
      confidence: rate.confidence,
      scraped_at: rate.scrapedAt.toISOString(),
    }));

    const { error: ratesError } = await supabase
      .from('mortgage_rates')
      .insert(rateInserts);

    if (ratesError) {
      console.error('[ScraperManager] Failed to insert rates:', ratesError);
      throw new Error(`Failed to store rates: ${ratesError.message}`);
    }

    // Update rate_snapshots for latest rates
    for (const rate of rates) {
      const { error: snapshotError } = await supabase
        .from('rate_snapshots')
        .upsert(
          {
            location_code: rate.locationCode,
            rate_type: rate.rateType,
            current_rate: rate.rate,
            previous_rate: null, // Will be set by trigger
            change_amount: 0,
            change_percent: 0,
            updated_at: rate.scrapedAt.toISOString(),
          },
          {
            onConflict: 'location_code,rate_type',
          }
        );

      if (snapshotError) {
        console.error('[ScraperManager] Failed to update snapshot:', snapshotError);
      }
    }
  }

  /**
   * Detect significant rate changes
   */
  private async detectChanges(rates: AggregatedRate[]): Promise<ChangeDetection[]> {
    const changes: ChangeDetection[] = [];

    for (const rate of rates) {
      // Get previous rate from snapshots
      const { data: snapshot } = await supabase
        .from('rate_snapshots')
        .select('previous_rate')
        .eq('location_code', rate.locationCode)
        .eq('rate_type', rate.rateType)
        .single();

      if (snapshot?.previous_rate) {
        const change = rate.rate - snapshot.previous_rate;
        const changePercent = (change / snapshot.previous_rate) * 100;

        // Only track changes ≥ 0.25% (in either direction)
        if (Math.abs(changePercent) >= 0.25) {
          changes.push({
            location: rate.location,
            locationCode: rate.locationCode,
            rateType: rate.rateType,
            oldRate: snapshot.previous_rate,
            newRate: rate.rate,
            change,
            changePercent,
          });
        }
      }
    }

    return changes;
  }

  /**
   * Send alerts for rate changes
   */
  private async sendAlertsForChange(change: ChangeDetection): Promise<number> {
    // Get all active alerts for this location and rate type
    const { data: alerts } = await supabase
      .from('alert_configs')
      .select('*')
      .eq('location_code', change.locationCode)
      .eq('rate_type', change.rateType)
      .eq('is_active', true)
      .gte('threshold_percent', Math.abs(change.changePercent));

    if (!alerts || alerts.length === 0) return 0;

    let sentCount = 0;

    for (const alert of alerts) {
      // Check daily limit (max 5 alerts per day)
      const { count } = await supabase
        .from('alert_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_email', alert.user_email)
        .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (count && count >= 5) {
        console.log(`[ScraperManager] Daily alert limit reached for ${alert.user_email}`);
        continue;
      }

      // Send email
      try {
        await sendRateAlert({
          to: alert.user_email,
          location: change.location,
          rateType: change.rateType,
          oldRate: change.oldRate,
          newRate: change.newRate,
          changePercent: change.changePercent,
        });

        // Log alert
        await supabase.from('alert_history').insert({
          user_email: alert.user_email,
          location_code: change.locationCode,
          rate_type: change.rateType,
          old_rate: change.oldRate,
          new_rate: change.newRate,
          change_percent: change.changePercent,
          sent_at: new Date().toISOString(),
        });

        sentCount++;
      } catch (error: any) {
        console.error(`[ScraperManager] Failed to send alert to ${alert.user_email}:`, error);
      }
    }

    return sentCount;
  }

  /**
   * Get scraping statistics
   */
  async getStats(): Promise<any> {
    const zillow = this.zillowScraper.getStats();
    const bankrate = this.bankrateScraper.getStats();
    const mnd = this.mndScraper.getStats();

    return {
      scrapers: {
        zillow,
        bankrate,
        mortgageNewsDaily: mnd,
      },
      totalRequests: zillow.requestCount + bankrate.requestCount + mnd.requestCount,
    };
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
