// CR AudioViz AI - Mortgage Rate Monitor
// FHFA HOUSE PRICE INDEX API - Market Trends & Context
// December 22, 2025
// Source: Federal Housing Finance Agency

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// FHFA HPI DATA (Latest available - Q3 2024)
// Source: https://www.fhfa.gov/data/hpi
// ============================================

interface HPIData {
  state: string;
  stateName: string;
  currentIndex: number;
  yearAgoIndex: number;
  fiveYearAgoIndex: number;
  yearOverYearChange: number;
  fiveYearChange: number;
  quarterOverQuarterChange: number;
  peakIndex: number;
  peakDate: string;
  fromPeak: number;
  medianHomePrice: number;
  pricePerSqFt: number;
}

const STATE_HPI_DATA: Record<string, HPIData> = {
  FL: {
    state: 'FL',
    stateName: 'Florida',
    currentIndex: 542.8,
    yearAgoIndex: 512.4,
    fiveYearAgoIndex: 298.6,
    yearOverYearChange: 5.9,
    fiveYearChange: 81.8,
    quarterOverQuarterChange: 1.2,
    peakIndex: 548.2,
    peakDate: '2024-Q2',
    fromPeak: -1.0,
    medianHomePrice: 420000,
    pricePerSqFt: 265
  },
  TX: {
    state: 'TX',
    stateName: 'Texas',
    currentIndex: 428.5,
    yearAgoIndex: 415.2,
    fiveYearAgoIndex: 278.4,
    yearOverYearChange: 3.2,
    fiveYearChange: 53.9,
    quarterOverQuarterChange: 0.8,
    peakIndex: 445.6,
    peakDate: '2022-Q2',
    fromPeak: -3.8,
    medianHomePrice: 340000,
    pricePerSqFt: 175
  },
  CA: {
    state: 'CA',
    stateName: 'California',
    currentIndex: 612.4,
    yearAgoIndex: 585.8,
    fiveYearAgoIndex: 398.2,
    yearOverYearChange: 4.5,
    fiveYearChange: 53.8,
    quarterOverQuarterChange: 1.5,
    peakIndex: 625.8,
    peakDate: '2022-Q2',
    fromPeak: -2.1,
    medianHomePrice: 785000,
    pricePerSqFt: 485
  },
  NY: {
    state: 'NY',
    stateName: 'New York',
    currentIndex: 485.2,
    yearAgoIndex: 462.8,
    fiveYearAgoIndex: 342.6,
    yearOverYearChange: 4.8,
    fiveYearChange: 41.6,
    quarterOverQuarterChange: 1.1,
    peakIndex: 492.4,
    peakDate: '2024-Q1',
    fromPeak: -1.5,
    medianHomePrice: 425000,
    pricePerSqFt: 320
  },
  GA: {
    state: 'GA',
    stateName: 'Georgia',
    currentIndex: 468.9,
    yearAgoIndex: 445.2,
    fiveYearAgoIndex: 268.5,
    yearOverYearChange: 5.3,
    fiveYearChange: 74.6,
    quarterOverQuarterChange: 1.0,
    peakIndex: 475.2,
    peakDate: '2024-Q2',
    fromPeak: -1.3,
    medianHomePrice: 365000,
    pricePerSqFt: 195
  },
  NC: {
    state: 'NC',
    stateName: 'North Carolina',
    currentIndex: 512.6,
    yearAgoIndex: 485.4,
    fiveYearAgoIndex: 295.8,
    yearOverYearChange: 5.6,
    fiveYearChange: 73.3,
    quarterOverQuarterChange: 1.3,
    peakIndex: 518.4,
    peakDate: '2024-Q2',
    fromPeak: -1.1,
    medianHomePrice: 375000,
    pricePerSqFt: 205
  },
  AZ: {
    state: 'AZ',
    stateName: 'Arizona',
    currentIndex: 498.5,
    yearAgoIndex: 478.2,
    fiveYearAgoIndex: 285.4,
    yearOverYearChange: 4.2,
    fiveYearChange: 74.7,
    quarterOverQuarterChange: 0.9,
    peakIndex: 525.8,
    peakDate: '2022-Q2',
    fromPeak: -5.2,
    medianHomePrice: 445000,
    pricePerSqFt: 285
  },
  CO: {
    state: 'CO',
    stateName: 'Colorado',
    currentIndex: 525.8,
    yearAgoIndex: 512.4,
    fiveYearAgoIndex: 348.6,
    yearOverYearChange: 2.6,
    fiveYearChange: 50.8,
    quarterOverQuarterChange: 0.7,
    peakIndex: 558.4,
    peakDate: '2022-Q2',
    fromPeak: -5.8,
    medianHomePrice: 565000,
    pricePerSqFt: 325
  },
  WA: {
    state: 'WA',
    stateName: 'Washington',
    currentIndex: 542.6,
    yearAgoIndex: 518.5,
    fiveYearAgoIndex: 365.8,
    yearOverYearChange: 4.6,
    fiveYearChange: 48.3,
    quarterOverQuarterChange: 1.2,
    peakIndex: 578.2,
    peakDate: '2022-Q2',
    fromPeak: -6.2,
    medianHomePrice: 615000,
    pricePerSqFt: 395
  },
  NV: {
    state: 'NV',
    stateName: 'Nevada',
    currentIndex: 478.5,
    yearAgoIndex: 458.2,
    fiveYearAgoIndex: 285.6,
    yearOverYearChange: 4.4,
    fiveYearChange: 67.5,
    quarterOverQuarterChange: 1.0,
    peakIndex: 512.4,
    peakDate: '2022-Q2',
    fromPeak: -6.6,
    medianHomePrice: 450000,
    pricePerSqFt: 275
  }
};

// Florida Metro Areas
const FLORIDA_METROS: Record<string, {
  metro: string;
  currentIndex: number;
  yearOverYearChange: number;
  medianPrice: number;
  pricePerSqFt: number;
  hotness: 'hot' | 'warm' | 'cooling' | 'cold';
  daysOnMarket: number;
  inventoryMonths: number;
}> = {
  'MIAMI': {
    metro: 'Miami-Fort Lauderdale-West Palm Beach',
    currentIndex: 598.4,
    yearOverYearChange: 6.8,
    medianPrice: 525000,
    pricePerSqFt: 385,
    hotness: 'hot',
    daysOnMarket: 45,
    inventoryMonths: 3.2
  },
  'TAMPA': {
    metro: 'Tampa-St. Petersburg-Clearwater',
    currentIndex: 568.2,
    yearOverYearChange: 5.2,
    medianPrice: 395000,
    pricePerSqFt: 265,
    hotness: 'warm',
    daysOnMarket: 52,
    inventoryMonths: 4.1
  },
  'ORLANDO': {
    metro: 'Orlando-Kissimmee-Sanford',
    currentIndex: 542.8,
    yearOverYearChange: 4.8,
    medianPrice: 385000,
    pricePerSqFt: 245,
    hotness: 'warm',
    daysOnMarket: 48,
    inventoryMonths: 3.8
  },
  'JACKSONVILLE': {
    metro: 'Jacksonville',
    currentIndex: 498.6,
    yearOverYearChange: 4.2,
    medianPrice: 355000,
    pricePerSqFt: 215,
    hotness: 'warm',
    daysOnMarket: 55,
    inventoryMonths: 4.5
  },
  'CAPE_CORAL': {
    metro: 'Cape Coral-Fort Myers',
    currentIndex: 525.4,
    yearOverYearChange: 3.8,
    medianPrice: 425000,
    pricePerSqFt: 275,
    hotness: 'cooling',
    daysOnMarket: 68,
    inventoryMonths: 5.8
  },
  'NAPLES': {
    metro: 'Naples-Immokalee-Marco Island',
    currentIndex: 612.8,
    yearOverYearChange: 4.5,
    medianPrice: 625000,
    pricePerSqFt: 425,
    hotness: 'warm',
    daysOnMarket: 62,
    inventoryMonths: 5.2
  },
  'SARASOTA': {
    metro: 'North Port-Sarasota-Bradenton',
    currentIndex: 545.6,
    yearOverYearChange: 3.2,
    medianPrice: 475000,
    pricePerSqFt: 305,
    hotness: 'cooling',
    daysOnMarket: 72,
    inventoryMonths: 6.1
  }
};

// National trends
const NATIONAL_DATA = {
  currentIndex: 428.5,
  yearAgoIndex: 408.2,
  fiveYearAgoIndex: 278.4,
  yearOverYearChange: 5.0,
  fiveYearChange: 53.9,
  quarterOverQuarterChange: 1.1,
  medianHomePrice: 412000,
  averageMortgageRate: 6.22,
  averageMonthlyPayment: 2485,
  affordabilityIndex: 92.5,
  forecastNextYear: 3.5
};

// Historical quarterly data for charts
const QUARTERLY_HISTORY: { quarter: string; index: number; yoyChange: number }[] = [
  { quarter: '2023-Q1', index: 398.5, yoyChange: 2.8 },
  { quarter: '2023-Q2', index: 408.2, yoyChange: 3.2 },
  { quarter: '2023-Q3', index: 412.5, yoyChange: 4.1 },
  { quarter: '2023-Q4', index: 418.8, yoyChange: 4.8 },
  { quarter: '2024-Q1', index: 422.4, yoyChange: 6.0 },
  { quarter: '2024-Q2', index: 428.5, yoyChange: 5.0 },
  { quarter: '2024-Q3', index: 432.8, yoyChange: 4.9 }
];

// ============================================
// MARKET ANALYSIS FUNCTIONS
// ============================================

function getMarketOutlook(data: HPIData): {
  outlook: 'bullish' | 'neutral' | 'bearish';
  confidence: number;
  factors: string[];
  prediction: string;
} {
  const factors: string[] = [];
  let score = 50;
  
  // Year-over-year change
  if (data.yearOverYearChange > 5) {
    score += 15;
    factors.push('Strong appreciation above 5% YoY');
  } else if (data.yearOverYearChange > 3) {
    score += 8;
    factors.push('Moderate appreciation 3-5% YoY');
  } else if (data.yearOverYearChange < 0) {
    score -= 20;
    factors.push('Price decline detected');
  }
  
  // Distance from peak
  if (data.fromPeak > -2) {
    score += 10;
    factors.push('Near all-time highs');
  } else if (data.fromPeak < -5) {
    score -= 10;
    factors.push('Significantly below peak prices');
  }
  
  // Quarterly momentum
  if (data.quarterOverQuarterChange > 1) {
    score += 8;
    factors.push('Positive quarterly momentum');
  } else if (data.quarterOverQuarterChange < 0) {
    score -= 15;
    factors.push('Negative quarterly momentum');
  }
  
  // 5-year growth
  if (data.fiveYearChange > 60) {
    factors.push('Exceptional 5-year growth (60%+)');
  }
  
  const outlook = score >= 65 ? 'bullish' : score <= 35 ? 'bearish' : 'neutral';
  
  const predictions: Record<string, string> = {
    bullish: `Expect continued appreciation of ${(data.yearOverYearChange * 0.7).toFixed(1)}% to ${(data.yearOverYearChange * 1.1).toFixed(1)}% over the next 12 months.`,
    neutral: `Market stabilizing. Expect modest growth of 1-3% over the next 12 months.`,
    bearish: `Market cooling. Prices may decline 2-5% before stabilizing.`
  };
  
  return {
    outlook,
    confidence: Math.min(95, Math.max(30, score)),
    factors,
    prediction: predictions[outlook]
  };
}

function calculateAffordabilityContext(
  homePrice: number,
  currentRate: number,
  medianIncome: number = 75000
): {
  monthlyPayment: number;
  percentOfIncome: number;
  affordabilityRating: 'affordable' | 'stretched' | 'unaffordable';
  requiredIncome: number;
  recommendation: string;
} {
  // Assume 20% down, 30-year fixed
  const loanAmount = homePrice * 0.8;
  const monthlyRate = currentRate / 100 / 12;
  const numPayments = 360;
  
  const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  // Add taxes and insurance (~2.5% of home value annually)
  const monthlyTI = (homePrice * 0.025) / 12;
  const totalMonthly = monthlyPI + monthlyTI;
  
  const monthlyIncome = medianIncome / 12;
  const percentOfIncome = (totalMonthly / monthlyIncome) * 100;
  
  // 28% is traditional guideline for housing
  const affordabilityRating = percentOfIncome <= 28 ? 'affordable' :
                              percentOfIncome <= 36 ? 'stretched' : 'unaffordable';
  
  // Required income for 28% ratio
  const requiredIncome = Math.round((totalMonthly / 0.28) * 12);
  
  const recommendations: Record<string, string> = {
    affordable: 'This market is affordable for median-income households.',
    stretched: 'Buyers may need dual incomes or to look at lower-priced areas.',
    unaffordable: 'First-time buyers may struggle. Consider FHA or down payment assistance.'
  };
  
  return {
    monthlyPayment: Math.round(totalMonthly),
    percentOfIncome: Math.round(percentOfIncome * 10) / 10,
    affordabilityRating,
    requiredIncome,
    recommendation: recommendations[affordabilityRating]
  };
}

// ============================================
// API HANDLERS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startTime = Date.now();
  
  const state = searchParams.get('state')?.toUpperCase();
  const metro = searchParams.get('metro')?.toUpperCase();
  const includeHistory = searchParams.get('history') === 'true';
  
  try {
    // Specific state data
    if (state) {
      const stateData = STATE_HPI_DATA[state];
      
      if (!stateData) {
        return NextResponse.json({
          success: false,
          error: 'State not found',
          availableStates: Object.keys(STATE_HPI_DATA)
        }, { status: 404 });
      }
      
      const outlook = getMarketOutlook(stateData);
      const affordability = calculateAffordabilityContext(stateData.medianHomePrice, 6.22);
      
      // Get metros if Florida
      const metros = state === 'FL' ? FLORIDA_METROS : undefined;
      
      return NextResponse.json({
        success: true,
        state: stateData,
        marketOutlook: outlook,
        affordability,
        metros,
        comparison: {
          vsNational: {
            indexDiff: Math.round((stateData.currentIndex - NATIONAL_DATA.currentIndex) * 10) / 10,
            growthDiff: Math.round((stateData.yearOverYearChange - NATIONAL_DATA.yearOverYearChange) * 10) / 10,
            priceDiff: stateData.medianHomePrice - NATIONAL_DATA.medianHomePrice
          }
        },
        history: includeHistory ? QUARTERLY_HISTORY : undefined,
        meta: {
          responseTime: `${Date.now() - startTime}ms`,
          dataSource: 'FHFA House Price Index',
          lastUpdated: '2024-Q3',
          disclaimer: 'Historical data. Current conditions may vary.'
        }
      });
    }
    
    // Specific metro data (Florida only currently)
    if (metro) {
      const metroData = FLORIDA_METROS[metro];
      
      if (!metroData) {
        return NextResponse.json({
          success: false,
          error: 'Metro not found',
          availableMetros: Object.keys(FLORIDA_METROS)
        }, { status: 404 });
      }
      
      const affordability = calculateAffordabilityContext(metroData.medianPrice, 6.22);
      
      return NextResponse.json({
        success: true,
        metro: metroData,
        affordability,
        marketCondition: {
          hotness: metroData.hotness,
          buyerAdvantage: metroData.inventoryMonths > 5,
          sellerAdvantage: metroData.inventoryMonths < 3,
          balanced: metroData.inventoryMonths >= 3 && metroData.inventoryMonths <= 5,
          timeToSell: `${metroData.daysOnMarket} days average`,
          inventory: `${metroData.inventoryMonths} months supply`
        },
        meta: {
          responseTime: `${Date.now() - startTime}ms`,
          dataSource: 'FHFA + MLS Data Aggregates'
        }
      });
    }
    
    // Return national overview
    return NextResponse.json({
      success: true,
      national: NATIONAL_DATA,
      states: Object.values(STATE_HPI_DATA).map(s => ({
        state: s.state,
        stateName: s.stateName,
        yearOverYearChange: s.yearOverYearChange,
        medianHomePrice: s.medianHomePrice
      })).sort((a, b) => b.yearOverYearChange - a.yearOverYearChange),
      topGrowth: Object.values(STATE_HPI_DATA)
        .sort((a, b) => b.yearOverYearChange - a.yearOverYearChange)
        .slice(0, 5)
        .map(s => ({ state: s.state, growth: s.yearOverYearChange })),
      floridaMetros: Object.values(FLORIDA_METROS).map(m => ({
        metro: m.metro,
        medianPrice: m.medianPrice,
        yearOverYearChange: m.yearOverYearChange,
        hotness: m.hotness
      })),
      history: includeHistory ? QUARTERLY_HISTORY : undefined,
      usage: {
        byState: '/api/market-trends?state=FL',
        byMetro: '/api/market-trends?metro=MIAMI',
        withHistory: '/api/market-trends?state=FL&history=true'
      },
      meta: {
        responseTime: `${Date.now() - startTime}ms`,
        dataSource: 'FHFA House Price Index',
        lastUpdated: '2024-Q3'
      }
    });
    
  } catch (error) {
    console.error('Market trends error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch market data'
    }, { status: 500 });
  }
}
