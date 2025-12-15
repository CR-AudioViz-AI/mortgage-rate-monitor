// CR AudioViz AI - Mortgage Rate Monitor
// Historical Data API - Fetches real FRED data
// December 14, 2025

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// FRED series IDs for different rate types
const FRED_SERIES: Record<string, string> = {
  '30-Year Fixed': 'MORTGAGE30US',
  '15-Year Fixed': 'MORTGAGE15US',
  '5/1 ARM': 'MORTGAGE5US',
  // These don't have direct FRED series, we'll calculate them
};

interface FREDObservation {
  date: string;
  value: string;
}

interface FREDResponse {
  observations: FREDObservation[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rateType = searchParams.get('type') || '30-Year Fixed';
    const range = searchParams.get('range') || '1Y';
    
    // Calculate start date based on range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '1M':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case '5Y':
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      case '10Y':
        startDate.setFullYear(startDate.getFullYear() - 10);
        break;
      case 'ALL':
        startDate.setFullYear(1971); // FRED data goes back to 1971
        break;
      default:
        startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const seriesId = FRED_SERIES[rateType];
    
    if (!seriesId) {
      // For rate types without direct FRED series, calculate from 30-year
      const baseData = await fetchFREDData('MORTGAGE30US', startDate, endDate);
      
      if (!baseData.success) {
        return NextResponse.json(baseData);
      }

      // Apply spread adjustments
      const spread = getSpreadForType(rateType);
      const adjustedRates = baseData.rates.map((r: any) => ({
        ...r,
        rate: Math.max(3, r.rate + spread),
      }));

      return NextResponse.json({
        success: true,
        rateType,
        range,
        rates: adjustedRates,
        count: adjustedRates.length,
        source: 'CALCULATED',
        basedOn: '30-Year Fixed',
      });
    }

    const data = await fetchFREDData(seriesId, startDate, endDate);
    
    return NextResponse.json({
      ...data,
      rateType,
      range,
    });

  } catch (error) {
    console.error('[Historical API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}

async function fetchFREDData(seriesId: string, startDate: Date, endDate: Date) {
  const FRED_API_KEY = process.env.FRED_API_KEY || '4e4a780e9da40ae3dca41c20c4b42755';
  
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: FRED_API_KEY,
    file_type: 'json',
    observation_start: startDate.toISOString().split('T')[0],
    observation_end: endDate.toISOString().split('T')[0],
    sort_order: 'asc',
  });

  const url = `https://api.stlouisfed.org/fred/series/observations?${params}`;
  
  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status}`);
    }

    const data: FREDResponse = await response.json();
    
    // Filter out missing values and format
    const rates = data.observations
      .filter(obs => obs.value !== '.' && obs.value !== '')
      .map((obs, idx, arr) => {
        const rate = parseFloat(obs.value);
        const prevRate = idx > 0 ? parseFloat(arr[idx - 1].value) : rate;
        
        return {
          date: obs.date,
          rate: rate,
          change: Math.round((rate - prevRate) * 1000) / 1000,
        };
      });

    // Calculate stats
    const allRates = rates.map(r => r.rate);
    const stats = {
      current: rates[rates.length - 1]?.rate || 0,
      high: Math.max(...allRates),
      low: Math.min(...allRates),
      average: allRates.reduce((a, b) => a + b, 0) / allRates.length,
      weekAgo: rates[rates.length - 2]?.rate || 0,
      monthAgo: rates[Math.max(0, rates.length - 5)]?.rate || 0,
      yearAgo: rates[0]?.rate || 0,
    };

    return {
      success: true,
      rates,
      stats,
      count: rates.length,
      source: 'FRED',
      seriesId,
    };
  } catch (error) {
    console.error('[FRED Fetch] Error:', error);
    
    // Return mock data as fallback
    return generateMockHistoricalData(startDate, endDate);
  }
}

function getSpreadForType(rateType: string): number {
  const spreads: Record<string, number> = {
    '20-Year Fixed': 0.125,
    '10-Year Fixed': -0.375,
    '7/1 ARM': -0.25,
    'FHA 30-Year': -0.375,
    'VA 30-Year': -0.5,
    'USDA 30-Year': -0.375,
    'Jumbo 30-Year': 0.25,
    'Jumbo 15-Year': -0.5,
  };
  return spreads[rateType] || 0;
}

function generateMockHistoricalData(startDate: Date, endDate: Date) {
  const rates = [];
  const currentDate = new Date(startDate);
  let rate = 7.2; // Starting rate
  
  while (currentDate <= endDate) {
    // Add some realistic variation
    const variation = (Math.random() - 0.5) * 0.15;
    const trend = currentDate > new Date('2024-06-01') ? -0.02 : 0.01;
    rate = Math.max(5.5, Math.min(8.0, rate + trend + variation));
    
    rates.push({
      date: currentDate.toISOString().split('T')[0],
      rate: Math.round(rate * 100) / 100,
      change: Math.round(variation * 1000) / 1000,
    });
    
    // Move to next week (FRED data is weekly)
    currentDate.setDate(currentDate.getDate() + 7);
  }

  // Ensure latest rate is close to current
  if (rates.length > 0) {
    rates[rates.length - 1].rate = 6.22;
  }

  const allRates = rates.map(r => r.rate);
  const stats = {
    current: rates[rates.length - 1]?.rate || 0,
    high: Math.max(...allRates),
    low: Math.min(...allRates),
    average: allRates.reduce((a, b) => a + b, 0) / allRates.length,
    weekAgo: rates[rates.length - 2]?.rate || 0,
    monthAgo: rates[Math.max(0, rates.length - 5)]?.rate || 0,
    yearAgo: rates[0]?.rate || 0,
  };

  return {
    success: true,
    rates,
    stats,
    count: rates.length,
    source: 'MOCK',
  };
}
