// GET /api/mortgage/rates - Real-time mortgage rates from FRED
// CR AudioViz AI - Mortgage Rate Monitor
// Roy Henderson @ December 2025

import { NextResponse } from 'next/server';
import { getAllMortgageRates } from '@/lib/fred-api';
import type { RateResponse, MortgageRate } from '@/types/mortgage';

// Cache rates in memory for 15 minutes
let cachedRates: MortgageRate[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    // Check URL params
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const rateType = searchParams.get('type'); // Filter by specific type

    // Check cache
    const now = Date.now();
    const cacheValid = cachedRates && (now - cacheTimestamp) < CACHE_DURATION;

    let rates: MortgageRate[];
    let cacheHit = false;

    if (cacheValid && !forceRefresh) {
      rates = cachedRates!;
      cacheHit = true;
    } else {
      // Fetch fresh data from FRED
      rates = await getAllMortgageRates();
      
      // Update cache
      cachedRates = rates;
      cacheTimestamp = now;
    }

    // Filter by rate type if specified
    if (rateType) {
      rates = rates.filter(r => 
        r.rateType.toLowerCase().includes(rateType.toLowerCase())
      );
    }

    const response: RateResponse = {
      success: true,
      rates,
      lastUpdated: new Date(cacheTimestamp).toISOString(),
      source: 'Federal Reserve Economic Data (FRED) - Freddie Mac PMMS',
      cacheHit,
    };

    // Add performance header
    const duration = Date.now() - startTime;

    return NextResponse.json(response, {
      headers: {
        'X-Response-Time': `${duration}ms`,
        'X-Cache': cacheHit ? 'HIT' : 'MISS',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Mortgage rates API error:', error);

    // Return cached data if available, even if stale
    if (cachedRates) {
      return NextResponse.json({
        success: true,
        rates: cachedRates,
        lastUpdated: new Date(cacheTimestamp).toISOString(),
        source: 'Federal Reserve Economic Data (FRED) - CACHED/STALE',
        cacheHit: true,
        warning: 'Using stale cached data due to API error',
      }, {
        headers: {
          'X-Cache': 'STALE',
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch mortgage rates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Revalidate every 15 minutes
export const revalidate = 900;
