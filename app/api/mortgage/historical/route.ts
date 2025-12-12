// GET /api/mortgage/historical - Historical mortgage rates for charting
// CR AudioViz AI - Mortgage Rate Monitor
// Roy Henderson @ December 2025

import { NextResponse } from 'next/server';
import { getHistoricalRates, FRED_SERIES } from '@/lib/fred-api';
import type { HistoricalResponse, HistoricalRate } from '@/types/mortgage';

// Valid series IDs
const VALID_SERIES: Record<string, string> = {
  '30y': FRED_SERIES.MORTGAGE_30Y,
  '15y': FRED_SERIES.MORTGAGE_15Y,
  'MORTGAGE30US': FRED_SERIES.MORTGAGE_30Y,
  'MORTGAGE15US': FRED_SERIES.MORTGAGE_15Y,
};

const RATE_TYPE_NAMES: Record<string, string> = {
  [FRED_SERIES.MORTGAGE_30Y]: '30-Year Fixed',
  [FRED_SERIES.MORTGAGE_15Y]: '15-Year Fixed',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters
    const seriesParam = searchParams.get('series') || '30y';
    const limitParam = searchParams.get('limit') || '52';
    
    // Validate and resolve series ID
    const seriesId = VALID_SERIES[seriesParam] || VALID_SERIES['30y'];
    const limit = Math.min(Math.max(parseInt(limitParam, 10) || 52, 1), 520); // 1-520 weeks (10 years)

    // Fetch historical data
    const observations = await getHistoricalRates(seriesId, limit);

    // Transform to simpler format
    const data: HistoricalRate[] = observations
      .filter(obs => obs.value !== '.')
      .map(obs => ({
        date: obs.date,
        rate: parseFloat(obs.value),
      }))
      .reverse(); // Chronological order

    const response: HistoricalResponse = {
      success: true,
      seriesId,
      rateType: RATE_TYPE_NAMES[seriesId] || '30-Year Fixed',
      data,
      count: data.length,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Historical rates API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch historical rates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Revalidate every hour
export const revalidate = 3600;
