// lib/fred-api.ts
// CR AudioViz AI - FRED API Integration
// Roy Henderson @ CR AudioViz AI, LLC
// Federal Reserve Economic Data - Official Mortgage Rate Source

import { FredResponse, FredObservation } from '@/types/mortgage';

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

// FRED Series IDs for mortgage rates
export const FRED_SERIES = {
  MORTGAGE_30YR: 'MORTGAGE30US',
  MORTGAGE_15YR: 'MORTGAGE15US',
} as const;

export type FredSeriesId = typeof FRED_SERIES[keyof typeof FRED_SERIES];

interface FetchSeriesOptions {
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

/**
 * Fetch observations from FRED API
 */
export async function fetchFredSeries(
  seriesId: FredSeriesId,
  options: FetchSeriesOptions = {}
): Promise<FredObservation[]> {
  const apiKey = process.env.FRED_API_KEY;
  
  if (!apiKey) {
    throw new Error('FRED_API_KEY environment variable is not set');
  }

  const {
    limit = 10,
    sortOrder = 'desc',
    startDate,
    endDate,
  } = options;

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: 'json',
    sort_order: sortOrder,
    limit: limit.toString(),
  });

  if (startDate) {
    params.append('observation_start', startDate);
  }
  if (endDate) {
    params.append('observation_end', endDate);
  }

  const url = `${FRED_BASE_URL}/series/observations?${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
    }

    const data: FredResponse = await response.json();
    
    // Filter out any observations with "." value (missing data)
    return data.observations.filter(obs => obs.value !== '.');
  } catch (error) {
    console.error(`Error fetching FRED series ${seriesId}:`, error);
    throw error;
  }
}

/**
 * Get current mortgage rates from FRED
 */
export async function getCurrentMortgageRates(): Promise<{
  rate30yr: number;
  rate15yr: number;
  prev30yr: number | null;
  prev15yr: number | null;
  lastUpdated: string;
}> {
  try {
    // Fetch both series in parallel
    const [obs30yr, obs15yr] = await Promise.all([
      fetchFredSeries(FRED_SERIES.MORTGAGE_30YR, { limit: 2 }),
      fetchFredSeries(FRED_SERIES.MORTGAGE_15YR, { limit: 2 }),
    ]);

    if (obs30yr.length === 0 || obs15yr.length === 0) {
      throw new Error('No mortgage rate data available from FRED');
    }

    return {
      rate30yr: parseFloat(obs30yr[0].value),
      rate15yr: parseFloat(obs15yr[0].value),
      prev30yr: obs30yr.length > 1 ? parseFloat(obs30yr[1].value) : null,
      prev15yr: obs15yr.length > 1 ? parseFloat(obs15yr[1].value) : null,
      lastUpdated: obs30yr[0].date,
    };
  } catch (error) {
    console.error('Error getting current mortgage rates:', error);
    throw error;
  }
}

/**
 * Get historical mortgage rates for charting
 */
export async function getHistoricalRates(
  period: '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL' = '1Y'
): Promise<{ date: string; rate30yr: number; rate15yr: number }[]> {
  const endDate = new Date().toISOString().split('T')[0];
  let startDate: string;
  let limit: number;

  switch (period) {
    case '1M':
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      limit = 5;
      break;
    case '3M':
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      limit = 13;
      break;
    case '6M':
      startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      limit = 26;
      break;
    case '1Y':
      startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      limit = 52;
      break;
    case '5Y':
      startDate = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      limit = 260;
      break;
    case 'ALL':
      startDate = '1971-04-01'; // FRED data starts from 1971
      limit = 2800;
      break;
    default:
      startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      limit = 52;
  }

  try {
    const [obs30yr, obs15yr] = await Promise.all([
      fetchFredSeries(FRED_SERIES.MORTGAGE_30YR, {
        limit,
        sortOrder: 'asc',
        startDate,
        endDate,
      }),
      fetchFredSeries(FRED_SERIES.MORTGAGE_15YR, {
        limit,
        sortOrder: 'asc',
        startDate,
        endDate,
      }),
    ]);

    // Create a map for easy lookup
    const rate15yrMap = new Map(
      obs15yr.map(obs => [obs.date, parseFloat(obs.value)])
    );

    // Combine data, matching by date
    return obs30yr.map(obs => ({
      date: obs.date,
      rate30yr: parseFloat(obs.value),
      rate15yr: rate15yrMap.get(obs.date) ?? 0,
    }));
  } catch (error) {
    console.error('Error getting historical rates:', error);
    throw error;
  }
}

/**
 * Check FRED API health
 */
export async function checkFredApiHealth(): Promise<boolean> {
  try {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) return false;

    const response = await fetch(
      `${FRED_BASE_URL}/series?series_id=MORTGAGE30US&api_key=${apiKey}&file_type=json`,
      { next: { revalidate: 0 } }
    );

    return response.ok;
  } catch {
    return false;
  }
}
