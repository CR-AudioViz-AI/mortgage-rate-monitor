// app/api/mortgage/historical/route.ts
// CR AudioViz AI - Historical Mortgage Rates API
// Roy Henderson @ CR AudioViz AI, LLC

import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalRatesWithSpreads } from '@/lib/mortgage-rates';
import { HistoricalRatesResponse } from '@/types/mortgage';

// Cache historical data for longer since it changes less frequently
export const revalidate = 7200; // 2 hours

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || '1Y') as '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';
    const rateType = searchParams.get('type'); // Optional: filter to specific rate type

    // Validate period
    const validPeriods = ['1M', '3M', '6M', '1Y', '5Y', 'ALL'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid period',
          valid_periods: validPeriods,
        },
        { status: 400 }
      );
    }

    const historicalData = await getHistoricalRatesWithSpreads(period);

    // If specific rate type requested, filter the data
    let filteredData = historicalData;
    if (rateType) {
      const rateKey = `rate_${rateType.toLowerCase().replace('-', '_').replace('/', '_')}` as keyof typeof historicalData[0];
      filteredData = historicalData.map(entry => ({
        date: entry.date,
        rate: entry[rateKey] as number || entry.rate_30yr,
      })) as any;
    }

    // Calculate start and end dates
    const dates = historicalData.map(d => d.date);
    const startDate = dates[0] || '';
    const endDate = dates[dates.length - 1] || '';

    const response: HistoricalRatesResponse = {
      success: true,
      data: filteredData,
      period,
      start_date: startDate,
      end_date: endDate,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch historical rates',
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
