// lib/mortgage-rates.ts
// CR AudioViz AI - Mortgage Rate Service
// Roy Henderson @ CR AudioViz AI, LLC
// Option C: Hybrid approach with FRED + Calculated Spreads

import { getCurrentMortgageRates, getHistoricalRates } from './fred-api';
import { MortgageRate, RATE_SPREADS, HistoricalRate } from '@/types/mortgage';

/**
 * Get all mortgage rates (FRED actual + calculated estimates)
 * This implements Option C - Hybrid approach
 */
export async function getAllMortgageRates(): Promise<{
  rates: MortgageRate[];
  lastUpdated: string;
  dataSource: string;
}> {
  try {
    // Get actual rates from FRED
    const fredRates = await getCurrentMortgageRates();
    
    const rates: MortgageRate[] = [];
    const now = new Date().toISOString();

    // Add 30-Year Fixed (FRED - Official)
    const change30yr = fredRates.prev30yr 
      ? Number((fredRates.rate30yr - fredRates.prev30yr).toFixed(2))
      : 0;
    
    rates.push({
      rate_type: '30-Year Fixed',
      rate_code: '30YR_FIXED',
      current_rate: fredRates.rate30yr,
      previous_rate: fredRates.prev30yr,
      change: change30yr,
      change_direction: change30yr > 0 ? 'up' : change30yr < 0 ? 'down' : 'unchanged',
      source: 'FRED',
      last_updated: fredRates.lastUpdated,
      is_estimated: false,
    });

    // Add 15-Year Fixed (FRED - Official)
    const change15yr = fredRates.prev15yr 
      ? Number((fredRates.rate15yr - fredRates.prev15yr).toFixed(2))
      : 0;

    rates.push({
      rate_type: '15-Year Fixed',
      rate_code: '15YR_FIXED',
      current_rate: fredRates.rate15yr,
      previous_rate: fredRates.prev15yr,
      change: change15yr,
      change_direction: change15yr > 0 ? 'up' : change15yr < 0 ? 'down' : 'unchanged',
      source: 'FRED',
      last_updated: fredRates.lastUpdated,
      is_estimated: false,
    });

    // Add calculated rates based on industry-standard spreads
    for (const spread of RATE_SPREADS) {
      const baseRate = spread.base_rate === '30yr' ? fredRates.rate30yr : fredRates.rate15yr;
      const prevBaseRate = spread.base_rate === '30yr' ? fredRates.prev30yr : fredRates.prev15yr;
      
      const calculatedRate = Number((baseRate + spread.spread).toFixed(2));
      const prevCalculatedRate = prevBaseRate 
        ? Number((prevBaseRate + spread.spread).toFixed(2))
        : null;
      
      const change = prevCalculatedRate 
        ? Number((calculatedRate - prevCalculatedRate).toFixed(2))
        : 0;

      rates.push({
        rate_type: spread.rate_type,
        rate_code: spread.rate_code,
        current_rate: calculatedRate,
        previous_rate: prevCalculatedRate,
        change,
        change_direction: change > 0 ? 'up' : change < 0 ? 'down' : 'unchanged',
        source: 'CALCULATED',
        last_updated: fredRates.lastUpdated,
        is_estimated: true,
      });
    }

    return {
      rates,
      lastUpdated: fredRates.lastUpdated,
      dataSource: 'Federal Reserve Economic Data (FRED) + Industry Spreads',
    };
  } catch (error) {
    console.error('Error getting all mortgage rates:', error);
    throw error;
  }
}

/**
 * Get a specific rate by code
 */
export async function getRateByCode(code: string): Promise<MortgageRate | null> {
  const { rates } = await getAllMortgageRates();
  return rates.find(r => r.rate_code === code) || null;
}

/**
 * Get rates by category
 */
export async function getRatesByCategory(category: 'fixed' | 'arm' | 'government' | 'jumbo'): Promise<MortgageRate[]> {
  const { rates } = await getAllMortgageRates();
  
  switch (category) {
    case 'fixed':
      return rates.filter(r => 
        ['30YR_FIXED', '15YR_FIXED', '20YR_FIXED', '10YR_FIXED'].includes(r.rate_code)
      );
    case 'arm':
      return rates.filter(r => r.rate_code.includes('ARM'));
    case 'government':
      return rates.filter(r => 
        r.rate_code.startsWith('FHA') || r.rate_code.startsWith('VA')
      );
    case 'jumbo':
      return rates.filter(r => r.rate_code.includes('JUMBO'));
    default:
      return rates;
  }
}

/**
 * Get historical rates with calculated spreads
 */
export async function getHistoricalRatesWithSpreads(
  period: '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL' = '1Y'
): Promise<HistoricalRate[]> {
  const fredHistorical = await getHistoricalRates(period);
  
  return fredHistorical.map(entry => ({
    date: entry.date,
    rate_30yr: entry.rate30yr,
    rate_15yr: entry.rate15yr,
    rate_20yr: Number((entry.rate30yr - 0.25).toFixed(2)),
    rate_10yr: Number((entry.rate15yr - 0.35).toFixed(2)),
    rate_5_1_arm: Number((entry.rate30yr - 0.50).toFixed(2)),
    rate_7_1_arm: Number((entry.rate30yr - 0.35).toFixed(2)),
    rate_fha: Number((entry.rate30yr - 0.50).toFixed(2)),
    rate_va: Number((entry.rate30yr - 0.60).toFixed(2)),
    rate_jumbo: Number((entry.rate30yr + 0.25).toFixed(2)),
  }));
}

/**
 * Calculate monthly payment
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numPayments;
  }
  
  const payment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return Number(payment.toFixed(2));
}

/**
 * Calculate affordability
 */
export function calculateAffordability(
  annualIncome: number,
  monthlyDebts: number,
  downPayment: number,
  annualRate: number,
  years: number = 30,
  dtiRatio: number = 0.43
): {
  maxHomePrice: number;
  maxLoanAmount: number;
  estimatedMonthlyPayment: number;
  totalInterest: number;
} {
  const monthlyIncome = annualIncome / 12;
  const maxMonthlyPayment = (monthlyIncome * dtiRatio) - monthlyDebts;
  
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  
  // Solve for principal from monthly payment
  let maxLoanAmount: number;
  if (monthlyRate === 0) {
    maxLoanAmount = maxMonthlyPayment * numPayments;
  } else {
    maxLoanAmount = maxMonthlyPayment * 
      (Math.pow(1 + monthlyRate, numPayments) - 1) / 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
  }
  
  const maxHomePrice = maxLoanAmount + downPayment;
  const totalPayments = maxMonthlyPayment * numPayments;
  const totalInterest = totalPayments - maxLoanAmount;
  
  return {
    maxHomePrice: Math.round(maxHomePrice),
    maxLoanAmount: Math.round(maxLoanAmount),
    estimatedMonthlyPayment: Math.round(maxMonthlyPayment),
    totalInterest: Math.round(totalInterest),
  };
}

/**
 * Compare loan scenarios
 */
export function compareLoanScenarios(
  principal: number,
  scenarios: { rate: number; years: number; name: string }[]
): {
  name: string;
  rate: number;
  years: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}[] {
  return scenarios.map(scenario => {
    const monthlyPayment = calculateMonthlyPayment(principal, scenario.rate, scenario.years);
    const totalPayment = monthlyPayment * scenario.years * 12;
    const totalInterest = totalPayment - principal;
    
    return {
      name: scenario.name,
      rate: scenario.rate,
      years: scenario.years,
      monthlyPayment,
      totalPayment: Number(totalPayment.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
    };
  });
}

/**
 * Format rate for display
 */
export function formatRate(rate: number): string {
  return `${rate.toFixed(2)}%`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get rate trend description
 */
export function getRateTrend(current: number, previous: number | null): string {
  if (previous === null) return 'No change data available';
  
  const diff = current - previous;
  const absDiff = Math.abs(diff);
  
  if (absDiff < 0.01) return 'Unchanged from last week';
  if (diff > 0) return `Up ${absDiff.toFixed(2)}% from last week`;
  return `Down ${absDiff.toFixed(2)}% from last week`;
}
