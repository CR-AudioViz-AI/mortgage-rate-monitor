// Javari AI Mortgage Rate Monitoring - Historical Data Sync Cron Job
// Phase 3C: Daily sync of historical mortgage rates from FRED API
// Runs daily at 2 AM UTC
// Created: 2025-11-14 22:40 UTC
// Roy Henderson, CEO @ CR AudioViz AI, LLC

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'development_secret';
  
  if (!authHeader) {
    return false;
  }
  
  const providedSecret = authHeader.replace('Bearer ', '');
  return providedSecret === cronSecret;
}

// Fetch historical data from FRED API
async function fetchHistoricalDataFromFRED(seriesId: string, lookbackDays: number = 365) {
  const fredApiKey = process.env.FRED_API_KEY || 'placeholder_fred_key';
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - lookbackDays);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  try {
    const response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredApiKey}&file_type=json&observation_start=${startDateStr}&observation_end=${endDateStr}&sort_order=asc`
    );

    if (!response.ok) {
      console.error(`FRED API error for ${seriesId}:`, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (!data.observations || data.observations.length === 0) {
      console.warn(`No observations returned for ${seriesId}`);
      return null;
    }

    return data.observations.map((obs: any) => ({
      date: obs.date,
      value: parseFloat(obs.value)
    })).filter((obs: any) => !isNaN(obs.value)); // Filter out invalid values
  } catch (error) {
    console.error(`Error fetching data for ${seriesId}:`, error);
    return null;
  }
}

// Upsert historical data into database
async function upsertHistoricalData(rateType: string, observations: any[]) {
  let insertCount = 0;
  let updateCount = 0;

  for (const obs of observations) {
    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from('mortgage_rate_history')
        .select('id, rate')
        .eq('rate_type', rateType)
        .eq('observation_date', obs.date)
        .single();

      if (existing) {
        // Update if rate changed
        if (existing.rate !== obs.value) {
          const { error } = await supabase
            .from('mortgage_rate_history')
            .update({ rate: obs.value })
            .eq('id', existing.id);

          if (!error) {
            updateCount++;
          }
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('mortgage_rate_history')
          .insert({
            rate_type: rateType,
            observation_date: obs.date,
            rate: obs.value
          });

        if (!error) {
          insertCount++;
        }
      }
    } catch (error) {
      console.error(`Error upserting ${rateType} data for ${obs.date}:`, error);
    }
  }

  return { insertCount, updateCount };
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing cron secret' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting historical data sync job...');

    const rateSeriesMap = {
      '30y_fixed': 'MORTGAGE30US',
      '15y_fixed': 'MORTGAGE15US',
      '5_1_arm': 'MORTGAGE5US'
    };

    const results: any = {};
    let totalInserted = 0;
    let totalUpdated = 0;

    // Fetch and sync data for each rate type
    for (const [rateType, seriesId] of Object.entries(rateSeriesMap)) {
      console.log(`[CRON] Syncing ${rateType}...`);
      
      const observations = await fetchHistoricalDataFromFRED(seriesId, 365); // Last 365 days
      
      if (!observations || observations.length === 0) {
        console.warn(`[CRON] No data retrieved for ${rateType}`);
        results[rateType] = {
          success: false,
          error: 'No data retrieved from FRED'
        };
        continue;
      }

      const { insertCount, updateCount } = await upsertHistoricalData(rateType, observations);
      
      totalInserted += insertCount;
      totalUpdated += updateCount;

      results[rateType] = {
        success: true,
        observations: observations.length,
        inserted: insertCount,
        updated: updateCount
      };

      console.log(`[CRON] ${rateType}: ${insertCount} inserted, ${updateCount} updated`);
    }

    console.log(`[CRON] Historical data sync complete. Total: ${totalInserted} inserted, ${totalUpdated} updated`);

    return NextResponse.json({
      success: true,
      message: 'Historical data sync complete',
      summary: {
        total_inserted: totalInserted,
        total_updated: totalUpdated
      },
      results
    });

  } catch (error) {
    console.error('[CRON] Unexpected error in historical data sync:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
