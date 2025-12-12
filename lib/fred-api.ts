// FRED API Client - Federal Reserve Economic Data
// CR AudioViz AI - Mortgage Rate Monitor
// Roy Henderson @ December 2025

export interface FREDObservation {
  date: string;
  value: string;
  realtime_start: string;
  realtime_end: string;
}

export interface FREDResponse {
  observations: FREDObservation[];
  count: number;
}

export interface MortgageRate {
  rateType: string;
  rate: number;
  previousRate: number;
  change: number;
  changePercent: number;
  date: string;
  source: 'FRED' | 'CALCULATED';
  seriesId?: string;
}

// FRED Series IDs for mortgage rates
export const FRED_SERIES = {
  MORTGAGE_30Y: 'MORTGAGE30US',
  MORTGAGE_15Y: 'MORTGAGE15US',
} as const;

// Industry-standard rate spreads for calculated rates
const RATE_SPREADS = {
  '20-Year Fixed': { base: 'MORTGAGE_30Y', spread: -0.25 },
  '10-Year Fixed': { base: 'MORTGAGE_15Y', spread: -0.35 },
  '5/1 ARM': { base: 'MORTGAGE_30Y', spread: -0.55 },
  '7/1 ARM': { base: 'MORTGAGE_30Y', spread: -0.40 },
  'FHA 30-Year': { base: 'MORTGAGE_30Y', spread: -0.45 },
  'VA 30-Year': { base: 'MORTGAGE_30Y', spread: -0.55 },
  'Jumbo 30-Year': { base: 'MORTGAGE_30Y', spread: 0.30 },
} as const;

const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

/**
 * Fetch mortgage rate data from FRED API
 */
export async function fetchFREDRate(
  seriesId: string,
  limit: number = 2
): Promise<FREDObservation[]> {
  if (!FRED_API_KEY) {
    throw new Error('FRED_API_KEY environment variable is not set');
  }

  const url = new URL(FRED_BASE_URL);
  url.searchParams.set('series_id', seriesId);
  url.searchParams.set('api_key', FRED_API_KEY);
  url.searchParams.set('file_type', 'json');
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('sort_order', 'desc');

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
  }

  const data: FREDResponse = await response.json();
  return data.observations;
}

/**
 * Get current mortgage rate with previous rate for comparison
 */
export async function getMortgageRate(
  seriesId: string,
  rateType: string
): Promise<MortgageRate> {
  const observations = await fetchFREDRate(seriesId, 2);

  if (!observations || observations.length === 0) {
    throw new Error(`No data available for series ${seriesId}`);
  }

  const currentRate = parseFloat(observations[0].value);
  const previousRate = observations.length > 1 
    ? parseFloat(observations[1].value) 
    : currentRate;

  const change = currentRate - previousRate;
  const changePercent = previousRate !== 0 
    ? (change / previousRate) * 100 
    : 0;

  return {
    rateType,
    rate: currentRate,
    previousRate,
    change: Math.round(change * 1000) / 1000,
    changePercent: Math.round(changePercent * 100) / 100,
    date: observations[0].date,
    source: 'FRED',
    seriesId,
  };
}

/**
 * Calculate estimated rate based on base rate and spread
 */
export function calculateRate(
  baseRate: number,
  spread: number,
  rateType: string,
  date: string,
  previousBaseRate: number
): MortgageRate {
  const rate = Math.round((baseRate + spread) * 1000) / 1000;
  const previousRate = Math.round((previousBaseRate + spread) * 1000) / 1000;
  const change = rate - previousRate;
  const changePercent = previousRate !== 0 
    ? (change / previousRate) * 100 
    : 0;

  return {
    rateType,
    rate,
    previousRate,
    change: Math.round(change * 1000) / 1000,
    changePercent: Math.round(changePercent * 100) / 100,
    date,
    source: 'CALCULATED',
  };
}

/**
 * Get all mortgage rates (official + calculated)
 */
export async function getAllMortgageRates(): Promise<MortgageRate[]> {
  try {
    // Fetch official FRED rates
    const [rate30Y, rate15Y] = await Promise.all([
      getMortgageRate(FRED_SERIES.MORTGAGE_30Y, '30-Year Fixed'),
      getMortgageRate(FRED_SERIES.MORTGAGE_15Y, '15-Year Fixed'),
    ]);

    const rates: MortgageRate[] = [rate30Y, rate15Y];

    // Calculate other rate types based on spreads
    for (const [rateType, config] of Object.entries(RATE_SPREADS)) {
      const baseRate = config.base === 'MORTGAGE_30Y' ? rate30Y : rate15Y;
      
      const calculatedRate = calculateRate(
        baseRate.rate,
        config.spread,
        rateType,
        baseRate.date,
        baseRate.previousRate
      );
      
      rates.push(calculatedRate);
    }

    // Sort by rate type for consistent ordering
    const sortOrder = [
      '30-Year Fixed',
      '20-Year Fixed', 
      '15-Year Fixed',
      '10-Year Fixed',
      '7/1 ARM',
      '5/1 ARM',
      'FHA 30-Year',
      'VA 30-Year',
      'Jumbo 30-Year',
    ];

    return rates.sort((a, b) => 
      sortOrder.indexOf(a.rateType) - sortOrder.indexOf(b.rateType)
    );
  } catch (error) {
    console.error('Error fetching mortgage rates:', error);
    throw error;
  }
}

/**
 * Get historical rates for charting
 */
export async function getHistoricalRates(
  seriesId: string = FRED_SERIES.MORTGAGE_30Y,
  limit: number = 52
): Promise<FREDObservation[]> {
  return fetchFREDRate(seriesId, limit);
}
