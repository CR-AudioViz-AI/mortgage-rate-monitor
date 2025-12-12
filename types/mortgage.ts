// types/mortgage.ts
// CR AudioViz AI - Mortgage Rate Monitor
// Roy Henderson @ CR AudioViz AI, LLC

export interface MortgageRate {
  rate_type: string;
  rate_code: string;
  current_rate: number;
  previous_rate: number | null;
  change: number;
  change_direction: 'up' | 'down' | 'unchanged';
  source: 'FRED' | 'CALCULATED' | 'API_NINJAS';
  last_updated: string;
  is_estimated: boolean;
}

export interface FredObservation {
  realtime_start: string;
  realtime_end: string;
  date: string;
  value: string;
}

export interface FredResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: FredObservation[];
}

export interface HistoricalRate {
  date: string;
  rate_30yr: number;
  rate_15yr: number;
  rate_20yr: number | null;
  rate_10yr: number | null;
  rate_5_1_arm: number | null;
  rate_7_1_arm: number | null;
  rate_fha: number | null;
  rate_va: number | null;
  rate_jumbo: number | null;
}

export interface MortgageRatesResponse {
  success: boolean;
  rates: MortgageRate[];
  timestamp: string;
  data_source: string;
  cache_ttl: number;
  next_update: string;
}

export interface HistoricalRatesResponse {
  success: boolean;
  data: HistoricalRate[];
  period: string;
  start_date: string;
  end_date: string;
  timestamp: string;
}

// Rate spread configuration for calculated rates
export interface RateSpread {
  rate_type: string;
  rate_code: string;
  base_rate: '30yr' | '15yr';
  spread: number;
  description: string;
}

export const RATE_SPREADS: RateSpread[] = [
  {
    rate_type: '20-Year Fixed',
    rate_code: '20YR_FIXED',
    base_rate: '30yr',
    spread: -0.25,
    description: 'Typically 0.25% below 30-year'
  },
  {
    rate_type: '10-Year Fixed',
    rate_code: '10YR_FIXED',
    base_rate: '15yr',
    spread: -0.35,
    description: 'Typically 0.35% below 15-year'
  },
  {
    rate_type: '5/1 ARM',
    rate_code: '5_1_ARM',
    base_rate: '30yr',
    spread: -0.50,
    description: 'Typically 0.50% below 30-year fixed'
  },
  {
    rate_type: '7/1 ARM',
    rate_code: '7_1_ARM',
    base_rate: '30yr',
    spread: -0.35,
    description: 'Typically 0.35% below 30-year fixed'
  },
  {
    rate_type: 'FHA 30-Year',
    rate_code: 'FHA_30YR',
    base_rate: '30yr',
    spread: -0.50,
    description: 'FHA typically 0.50% below conventional'
  },
  {
    rate_type: 'VA 30-Year',
    rate_code: 'VA_30YR',
    base_rate: '30yr',
    spread: -0.60,
    description: 'VA typically 0.60% below conventional'
  },
  {
    rate_type: 'Jumbo 30-Year',
    rate_code: 'JUMBO_30YR',
    base_rate: '30yr',
    spread: 0.25,
    description: 'Jumbo typically 0.25% above conforming'
  }
];
