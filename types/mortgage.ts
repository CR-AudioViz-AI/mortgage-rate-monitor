// Mortgage Rate Types
// CR AudioViz AI - Mortgage Rate Monitor
// Roy Henderson @ December 2025

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

export interface HistoricalRate {
  date: string;
  rate: number;
}

export interface RateResponse {
  success: boolean;
  rates: MortgageRate[];
  lastUpdated: string;
  source: string;
  cacheHit?: boolean;
}

export interface HistoricalResponse {
  success: boolean;
  seriesId: string;
  rateType: string;
  data: HistoricalRate[];
  count: number;
}

export interface RateAlert {
  id: string;
  userId: string;
  rateType: string;
  targetRate: number;
  direction: 'above' | 'below';
  enabled: boolean;
  createdAt: string;
}

export interface CalculatorInput {
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  downPayment?: number;
  propertyTax?: number;
  insurance?: number;
  hoa?: number;
}

export interface CalculatorResult {
  monthlyPayment: number;
  principalAndInterest: number;
  totalPayment: number;
  totalInterest: number;
  breakdown: {
    principal: number;
    interest: number;
    taxes: number;
    insurance: number;
    hoa: number;
  };
}

export interface RateComparison {
  rateType: string;
  rate: number;
  monthlyPayment: number;
  totalInterest: number;
  savings?: number;
}

// API Error types
export interface APIError {
  error: string;
  message: string;
  status: number;
}
