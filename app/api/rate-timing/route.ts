// CR AudioViz AI - Mortgage Rate Monitor
// RATE ALERT & TIMING OPTIMIZER API
// December 22, 2025
// Helps users decide WHEN to lock rates

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// RATE HISTORY & VOLATILITY DATA
// ============================================

// Simulated recent rate history (last 90 days)
const RATE_HISTORY: { date: string; rate: number }[] = [
  { date: '2024-09-23', rate: 6.08 },
  { date: '2024-09-30', rate: 6.12 },
  { date: '2024-10-07', rate: 6.32 },
  { date: '2024-10-14', rate: 6.44 },
  { date: '2024-10-21', rate: 6.54 },
  { date: '2024-10-28', rate: 6.72 },
  { date: '2024-11-04', rate: 6.79 },
  { date: '2024-11-11', rate: 6.78 },
  { date: '2024-11-18', rate: 6.84 },
  { date: '2024-11-25', rate: 6.81 },
  { date: '2024-12-02', rate: 6.69 },
  { date: '2024-12-09', rate: 6.60 },
  { date: '2024-12-16', rate: 6.22 }
];

// Lock period pricing (typical spreads)
const LOCK_PRICING = {
  15: { spread: 0.000, description: '15-day lock' },
  30: { spread: 0.000, description: '30-day lock (standard)' },
  45: { spread: 0.125, description: '45-day lock' },
  60: { spread: 0.250, description: '60-day lock' },
  90: { spread: 0.375, description: '90-day lock' }
};

// Economic events calendar
const UPCOMING_EVENTS: { date: string; event: string; impact: 'high' | 'medium' | 'low'; direction: 'rates_up' | 'rates_down' | 'uncertain' }[] = [
  { date: '2024-12-27', event: 'Initial Jobless Claims', impact: 'medium', direction: 'uncertain' },
  { date: '2025-01-03', event: 'ISM Manufacturing PMI', impact: 'medium', direction: 'uncertain' },
  { date: '2025-01-10', event: 'Employment Report (Jobs Friday)', impact: 'high', direction: 'uncertain' },
  { date: '2025-01-14', event: 'CPI Inflation Report', impact: 'high', direction: 'uncertain' },
  { date: '2025-01-29', event: 'FOMC Interest Rate Decision', impact: 'high', direction: 'uncertain' },
  { date: '2025-01-30', event: 'GDP First Estimate', impact: 'high', direction: 'uncertain' }
];

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

function calculateVolatility(history: typeof RATE_HISTORY): {
  dailyVolatility: number;
  weeklyVolatility: number;
  volatilityRating: 'low' | 'moderate' | 'high' | 'extreme';
  maxSwing: number;
  trend: 'falling' | 'rising' | 'stable';
  trendStrength: number;
} {
  if (history.length < 2) {
    return {
      dailyVolatility: 0,
      weeklyVolatility: 0,
      volatilityRating: 'low',
      maxSwing: 0,
      trend: 'stable',
      trendStrength: 0
    };
  }
  
  // Calculate week-over-week changes
  const weeklyChanges: number[] = [];
  for (let i = 1; i < history.length; i++) {
    weeklyChanges.push(Math.abs(history[i].rate - history[i-1].rate));
  }
  
  const avgWeeklyChange = weeklyChanges.reduce((a, b) => a + b, 0) / weeklyChanges.length;
  const dailyVolatility = avgWeeklyChange / 7;
  
  // Max swing in period
  const rates = history.map(h => h.rate);
  const maxSwing = Math.max(...rates) - Math.min(...rates);
  
  // Trend analysis
  const recentRate = history[history.length - 1].rate;
  const oldRate = history[0].rate;
  const rateDiff = recentRate - oldRate;
  
  const trend = rateDiff < -0.1 ? 'falling' : rateDiff > 0.1 ? 'rising' : 'stable';
  const trendStrength = Math.abs(rateDiff);
  
  // Volatility rating
  const volatilityRating = avgWeeklyChange < 0.05 ? 'low' :
                           avgWeeklyChange < 0.10 ? 'moderate' :
                           avgWeeklyChange < 0.20 ? 'high' : 'extreme';
  
  return {
    dailyVolatility: Math.round(dailyVolatility * 1000) / 1000,
    weeklyVolatility: Math.round(avgWeeklyChange * 1000) / 1000,
    volatilityRating,
    maxSwing: Math.round(maxSwing * 100) / 100,
    trend,
    trendStrength: Math.round(trendStrength * 100) / 100
  };
}

function generateLockRecommendation(
  currentRate: number,
  closingDays: number,
  volatility: ReturnType<typeof calculateVolatility>,
  loanAmount: number
): {
  recommendation: 'lock_now' | 'wait' | 'float_cautiously';
  confidence: number;
  rationale: string[];
  riskAssessment: {
    ifRatesRise: { probability: number; costImpact: number };
    ifRatesFall: { probability: number; savingsImpact: number };
  };
  optimalLockPeriod: number;
  targetRate: number | null;
  alerts: string[];
} {
  const rationale: string[] = [];
  const alerts: string[] = [];
  let score = 50; // Start neutral
  
  // Factor 1: Trend
  if (volatility.trend === 'rising') {
    score += 20;
    rationale.push('Rates are trending upward - locking protects against increases');
  } else if (volatility.trend === 'falling') {
    score -= 15;
    rationale.push('Rates are trending downward - waiting may yield better rates');
  }
  
  // Factor 2: Volatility
  if (volatility.volatilityRating === 'high' || volatility.volatilityRating === 'extreme') {
    score += 15;
    rationale.push(`${volatility.volatilityRating.toUpperCase()} volatility - locking reduces risk`);
    alerts.push(`⚠️ High volatility period - rates swung ${volatility.maxSwing}% recently`);
  }
  
  // Factor 3: Closing timeline
  if (closingDays <= 21) {
    score += 10;
    rationale.push('Short closing window - less time to react to rate changes');
  } else if (closingDays > 45) {
    score -= 5;
    rationale.push('Long closing window - more flexibility to time the lock');
  }
  
  // Factor 4: Upcoming events
  const highImpactEvents = UPCOMING_EVENTS.filter(e => {
    const eventDate = new Date(e.date);
    const closeDate = new Date();
    closeDate.setDate(closeDate.getDate() + closingDays);
    return eventDate <= closeDate && e.impact === 'high';
  });
  
  if (highImpactEvents.length > 0) {
    score += 10;
    rationale.push(`${highImpactEvents.length} high-impact economic events before closing`);
    highImpactEvents.forEach(e => alerts.push(`📅 ${e.event} on ${e.date}`));
  }
  
  // Factor 5: Current rate vs recent history
  const avgRecent = RATE_HISTORY.slice(-4).reduce((a, b) => a + b.rate, 0) / 4;
  if (currentRate < avgRecent - 0.1) {
    score += 15;
    rationale.push(`Current rate (${currentRate}%) is below recent average (${avgRecent.toFixed(2)}%)`);
  }
  
  // Recommendation
  const recommendation = score >= 65 ? 'lock_now' :
                         score <= 35 ? 'wait' : 'float_cautiously';
  
  // Risk assessment
  const monthlyRate = currentRate / 100 / 12;
  const basePayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, 360)) /
                      (Math.pow(1 + monthlyRate, 360) - 1);
  
  const higherRate = (currentRate + 0.25) / 100 / 12;
  const higherPayment = loanAmount * (higherRate * Math.pow(1 + higherRate, 360)) /
                        (Math.pow(1 + higherRate, 360) - 1);
  
  const lowerRate = (currentRate - 0.125) / 100 / 12;
  const lowerPayment = loanAmount * (lowerRate * Math.pow(1 + lowerRate, 360)) /
                       (Math.pow(1 + lowerRate, 360) - 1);
  
  // Optimal lock period
  const optimalLockPeriod = closingDays <= 15 ? 15 :
                            closingDays <= 30 ? 30 :
                            closingDays <= 45 ? 45 :
                            closingDays <= 60 ? 60 : 90;
  
  // Target rate (if waiting)
  const targetRate = recommendation === 'wait' ? 
                     Math.round((currentRate - 0.125) * 100) / 100 : null;
  
  return {
    recommendation,
    confidence: Math.min(95, Math.max(30, score)),
    rationale,
    riskAssessment: {
      ifRatesRise: {
        probability: volatility.trend === 'rising' ? 65 : volatility.trend === 'falling' ? 25 : 45,
        costImpact: Math.round((higherPayment - basePayment) * 360)
      },
      ifRatesFall: {
        probability: volatility.trend === 'falling' ? 55 : volatility.trend === 'rising' ? 20 : 35,
        savingsImpact: Math.round((basePayment - lowerPayment) * 360)
      }
    },
    optimalLockPeriod,
    targetRate,
    alerts
  };
}

function createRateAlerts(
  targetRate: number,
  currentRate: number,
  loanAmount: number
): {
  alertLevels: { rate: number; action: string; savings: number }[];
  estimatedWaitTime: string | null;
} {
  const monthlyRate = currentRate / 100 / 12;
  const basePayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, 360)) /
                      (Math.pow(1 + monthlyRate, 360) - 1);
  
  const alertLevels = [
    { rate: currentRate - 0.125, action: 'Consider locking', savings: 0 },
    { rate: currentRate - 0.25, action: 'Good time to lock', savings: 0 },
    { rate: currentRate - 0.375, action: 'Excellent rate - lock immediately', savings: 0 },
    { rate: currentRate + 0.125, action: 'Rates rising - lock if not already', savings: 0 },
    { rate: currentRate + 0.25, action: 'Lock urgently if still floating', savings: 0 }
  ].map(level => {
    const levelMonthlyRate = level.rate / 100 / 12;
    const levelPayment = loanAmount * (levelMonthlyRate * Math.pow(1 + levelMonthlyRate, 360)) /
                         (Math.pow(1 + levelMonthlyRate, 360) - 1);
    return {
      ...level,
      rate: Math.round(level.rate * 1000) / 1000,
      savings: Math.round((basePayment - levelPayment) * 360)
    };
  });
  
  // Estimated wait time based on recent trend
  const volatility = calculateVolatility(RATE_HISTORY);
  let estimatedWaitTime: string | null = null;
  
  if (volatility.trend === 'falling' && targetRate < currentRate) {
    const rateGap = currentRate - targetRate;
    const weeksNeeded = Math.ceil(rateGap / volatility.weeklyVolatility);
    estimatedWaitTime = weeksNeeded <= 4 ? `${weeksNeeded} weeks` : 
                        weeksNeeded <= 12 ? `${Math.ceil(weeksNeeded / 4)} months` : 'Unknown';
  }
  
  return { alertLevels, estimatedWaitTime };
}

// ============================================
// API HANDLERS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startTime = Date.now();
  
  const currentRate = parseFloat(searchParams.get('rate') || '6.22');
  
  // Return current market analysis
  const volatility = calculateVolatility(RATE_HISTORY);
  
  return NextResponse.json({
    success: true,
    currentRate,
    rateHistory: RATE_HISTORY.slice(-8),
    volatility,
    upcomingEvents: UPCOMING_EVENTS.slice(0, 5),
    lockPricing: LOCK_PRICING,
    quickAnalysis: {
      trend: volatility.trend,
      volatilityRating: volatility.volatilityRating,
      suggestion: volatility.trend === 'rising' ? 'Consider locking soon' :
                  volatility.trend === 'falling' ? 'May benefit from waiting' :
                  'Market stable - lock at your convenience'
    },
    usage: {
      fullAnalysis: 'POST /api/rate-timing with closingDays, loanAmount, currentRate'
    },
    meta: {
      responseTime: `${Date.now() - startTime}ms`,
      dataSource: 'CR AudioViz AI Rate Monitor',
      lastUpdated: new Date().toISOString()
    }
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    const {
      currentRate = 6.22,
      closingDays = 30,
      loanAmount,
      targetRate
    } = body;
    
    if (!loanAmount) {
      return NextResponse.json({
        success: false,
        error: 'Required: loanAmount'
      }, { status: 400 });
    }
    
    const volatility = calculateVolatility(RATE_HISTORY);
    const recommendation = generateLockRecommendation(
      currentRate,
      closingDays,
      volatility,
      loanAmount
    );
    
    const alerts = createRateAlerts(
      targetRate || currentRate - 0.125,
      currentRate,
      loanAmount
    );
    
    // Calculate lock period costs
    const lockCosts = Object.entries(LOCK_PRICING).map(([days, info]) => {
      const adjustedRate = currentRate + info.spread;
      const monthlyRate = adjustedRate / 100 / 12;
      const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, 360)) /
                      (Math.pow(1 + monthlyRate, 360) - 1);
      const extraCost = info.spread > 0 ? Math.round(payment * 360 * (info.spread / currentRate)) : 0;
      
      return {
        days: parseInt(days),
        description: info.description,
        rateAdjustment: info.spread,
        effectiveRate: Math.round(adjustedRate * 1000) / 1000,
        monthlyPayment: Math.round(payment),
        extraCost
      };
    });
    
    return NextResponse.json({
      success: true,
      input: {
        currentRate,
        closingDays,
        loanAmount,
        targetRate
      },
      marketAnalysis: {
        volatility,
        recentTrend: {
          direction: volatility.trend,
          magnitude: volatility.trendStrength,
          description: volatility.trend === 'falling' ? 
                       `Rates have fallen ${volatility.trendStrength}% recently` :
                       volatility.trend === 'rising' ?
                       `Rates have risen ${volatility.trendStrength}% recently` :
                       'Rates have been stable'
        },
        upcomingEvents: UPCOMING_EVENTS.filter(e => {
          const eventDate = new Date(e.date);
          const closeDate = new Date();
          closeDate.setDate(closeDate.getDate() + closingDays);
          return eventDate <= closeDate;
        })
      },
      recommendation,
      lockOptions: lockCosts,
      alertSetup: alerts,
      actionPlan: {
        immediate: recommendation.recommendation === 'lock_now' ?
                   `Lock your rate at ${currentRate}% for ${recommendation.optimalLockPeriod} days` :
                   `Monitor rates - target: ${recommendation.targetRate || currentRate - 0.125}%`,
        ifRatesRise: 'Lock immediately if rates exceed ' + (currentRate + 0.125).toFixed(3) + '%',
        ifRatesFall: recommendation.targetRate ?
                     `Lock when rates hit ${recommendation.targetRate}%` :
                     'Continue monitoring for opportunities'
      },
      meta: {
        responseTime: `${Date.now() - startTime}ms`,
        dataSource: 'CR AudioViz AI Rate Timing Engine',
        disclaimer: 'Rate forecasts are estimates. Actual rates may vary significantly.'
      }
    });
    
  } catch (error) {
    console.error('Rate timing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Analysis failed'
    }, { status: 500 });
  }
}
