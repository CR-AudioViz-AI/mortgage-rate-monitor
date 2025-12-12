// app/api/mortgage/rates/route.ts
// CR AudioViz AI - Mortgage Rate Monitor API
// Roy Henderson @ CR AudioViz AI, LLC
// Real-time mortgage rates from FRED + calculated spreads

import { NextRequest, NextResponse } from 'next/server';
import { getAllMortgageRates, getRatesByCategory } from '@/lib/mortgage-rates';
import { MortgageRatesResponse } from '@/types/mortgage';

// Cache control: Rates update weekly on Thursdays
// Revalidate every hour to balance freshness with API efficiency
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as 'fixed' | 'arm' | 'government' | 'jumbo' | null;
    const format = searchParams.get('format') || 'full';

    let rates;
    let dataSource: string;
    let lastUpdated: string;

    if (category) {
      // Get filtered rates by category
      rates = await getRatesByCategory(category);
      const allRates = await getAllMortgageRates();
      dataSource = allRates.dataSource;
      lastUpdated = allRates.lastUpdated;
    } else {
      // Get all rates
      const result = await getAllMortgageRates();
      rates = result.rates;
      dataSource = result.dataSource;
      lastUpdated = result.lastUpdated;
    }

    // Calculate next update time (next Thursday at noon EST)
    const now = new Date();
    const nextThursday = new Date(now);
    nextThursday.setDate(now.getDate() + ((4 - now.getDay() + 7) % 7 || 7));
    nextThursday.setHours(12, 0, 0, 0);

    // Simple format for widgets
    if (format === 'simple') {
      return NextResponse.json({
        success: true,
        rates: rates.map(r => ({
          type: r.rate_type,
          rate: r.current_rate,
          change: r.change,
          estimated: r.is_estimated,
        })),
        updated: lastUpdated,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      });
    }

    // Full response
    const response: MortgageRatesResponse = {
      success: true,
      rates,
      timestamp: now.toISOString(),
      data_source: dataSource,
      cache_ttl: 3600,
      next_update: nextThursday.toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    console.error('Error fetching mortgage rates:', error);
    
    // Return cached fallback data if available, otherwise error
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch mortgage rates',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
