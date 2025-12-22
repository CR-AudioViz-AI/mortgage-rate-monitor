// CR AudioViz AI - Mortgage Rate Monitor
// REFINANCE OPTIMIZER API
// December 22, 2025
// Helps users determine when refinancing makes financial sense

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// INTERFACES
// ============================================

interface CurrentLoanDetails {
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  monthlyPayment: number;
  termYears: number;
  monthsRemaining: number;
  loanType: 'conventional' | 'fha' | 'va' | 'usda';
  hasPMI: boolean;
  monthlyPMI?: number;
}

interface RefinanceScenario {
  newRate: number;
  newTermYears: number;
  cashOut?: number;
  closingCostsEstimate: number;
}

interface RefinanceAnalysis {
  worthIt: boolean;
  breakEvenMonths: number;
  monthlySavings: number;
  lifetimeSavings: number;
  newMonthlyPayment: number;
  totalClosingCosts: number;
  recommendation: string;
  details: {
    currentVsNew: {
      currentMonthly: number;
      newMonthly: number;
      difference: number;
    };
    interestSavings: {
      currentRemainingInterest: number;
      newTotalInterest: number;
      netSavings: number;
    };
    timeAnalysis: {
      currentMonthsRemaining: number;
      newMonths: number;
      payoffDateComparison: string;
    };
    equityImpact: {
      currentEquityBuildRate: number; // per month
      newEquityBuildRate: number;
      difference: number;
    };
  };
  scenarios: {
    keepCurrent: { totalCost: number; payoffDate: string };
    refinance: { totalCost: number; payoffDate: string };
    refinanceShorterTerm: { totalCost: number; payoffDate: string } | null;
  };
  warnings: string[];
  tips: string[];
}

// ============================================
// CALCULATION FUNCTIONS
// ============================================

function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  
  if (monthlyRate === 0) return principal / numPayments;
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1);
}

function calculateRemainingInterest(
  balance: number,
  annualRate: number,
  monthsRemaining: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(balance, annualRate, monthsRemaining / 12);
  
  let totalInterest = 0;
  let currentBalance = balance;
  
  for (let m = 0; m < monthsRemaining && currentBalance > 0; m++) {
    const interestPayment = currentBalance * monthlyRate;
    const principalPayment = Math.min(monthlyPayment - interestPayment, currentBalance);
    totalInterest += interestPayment;
    currentBalance -= principalPayment;
  }
  
  return Math.round(totalInterest);
}

function calculateTotalInterest(principal: number, annualRate: number, termYears: number): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);
  const totalPayments = monthlyPayment * termYears * 12;
  return Math.round(totalPayments - principal);
}

function estimateClosingCosts(loanAmount: number, state: string = 'FL'): {
  low: number;
  mid: number;
  high: number;
  breakdown: {
    lenderFees: { low: number; high: number };
    titleAndEscrow: { low: number; high: number };
    appraisal: number;
    other: { low: number; high: number };
  };
} {
  // Refinance closing costs are typically 2-5% of loan amount
  const lenderFeesLow = Math.round(loanAmount * 0.005);
  const lenderFeesHigh = Math.round(loanAmount * 0.015);
  
  const titleLow = Math.round(loanAmount * 0.004);
  const titleHigh = Math.round(loanAmount * 0.008);
  
  const appraisal = 500;
  
  const otherLow = 500;
  const otherHigh = 1500;
  
  // Florida-specific: doc stamps on mortgage (0.35%)
  let stateSpecific = 0;
  if (state === 'FL') {
    stateSpecific = Math.round(loanAmount * 0.0035);
  }
  
  return {
    low: lenderFeesLow + titleLow + appraisal + otherLow + stateSpecific,
    mid: Math.round((lenderFeesLow + lenderFeesHigh) / 2) + 
         Math.round((titleLow + titleHigh) / 2) + 
         appraisal + 
         Math.round((otherLow + otherHigh) / 2) + 
         stateSpecific,
    high: lenderFeesHigh + titleHigh + appraisal + otherHigh + stateSpecific,
    breakdown: {
      lenderFees: { low: lenderFeesLow, high: lenderFeesHigh },
      titleAndEscrow: { low: titleLow, high: titleHigh },
      appraisal,
      other: { low: otherLow + stateSpecific, high: otherHigh + stateSpecific }
    }
  };
}

function analyzeRefinance(
  current: CurrentLoanDetails,
  scenario: RefinanceScenario,
  propertyValue: number
): RefinanceAnalysis {
  const warnings: string[] = [];
  const tips: string[] = [];
  
  // New loan amount (including cash out if any)
  const newLoanAmount = current.currentBalance + (scenario.cashOut || 0);
  
  // LTV check
  const newLTV = (newLoanAmount / propertyValue) * 100;
  if (newLTV > 80) {
    warnings.push(`New LTV of ${newLTV.toFixed(1)}% may require PMI.`);
  }
  if (newLTV > 95) {
    warnings.push('LTV exceeds 95%. May not qualify for refinance.');
  }
  
  // Calculate new monthly payment
  const newMonthlyPI = calculateMonthlyPayment(newLoanAmount, scenario.newRate, scenario.newTermYears);
  const newMonthlyTotal = Math.round(newMonthlyPI);
  
  // Current monthly (P&I only for comparison)
  const currentMonthlyPI = calculateMonthlyPayment(
    current.currentBalance, 
    current.interestRate, 
    current.monthsRemaining / 12
  );
  
  // Monthly savings
  const monthlySavings = Math.round(currentMonthlyPI - newMonthlyPI);
  
  // Break-even calculation
  const closingCosts = scenario.closingCostsEstimate;
  const breakEvenMonths = monthlySavings > 0 
    ? Math.ceil(closingCosts / monthlySavings)
    : Infinity;
  
  // Interest calculations
  const currentRemainingInterest = calculateRemainingInterest(
    current.currentBalance,
    current.interestRate,
    current.monthsRemaining
  );
  
  const newTotalInterest = calculateTotalInterest(
    newLoanAmount,
    scenario.newRate,
    scenario.newTermYears
  );
  
  // Net interest savings (accounting for closing costs)
  const netInterestSavings = currentRemainingInterest - newTotalInterest - closingCosts;
  
  // Lifetime savings
  const lifetimeSavings = Math.round(netInterestSavings);
  
  // Worth it determination
  const worthIt = breakEvenMonths <= 36 && netInterestSavings > 0;
  
  // Time analysis
  const currentPayoffDate = new Date();
  currentPayoffDate.setMonth(currentPayoffDate.getMonth() + current.monthsRemaining);
  
  const newPayoffDate = new Date();
  newPayoffDate.setMonth(newPayoffDate.getMonth() + scenario.newTermYears * 12);
  
  const payoffComparison = newPayoffDate < currentPayoffDate 
    ? `Pay off ${Math.round((currentPayoffDate.getTime() - newPayoffDate.getTime()) / (30 * 24 * 60 * 60 * 1000))} months sooner`
    : newPayoffDate > currentPayoffDate
    ? `Pay off ${Math.round((newPayoffDate.getTime() - currentPayoffDate.getTime()) / (30 * 24 * 60 * 60 * 1000))} months later`
    : 'Same payoff timeline';
  
  // Equity build rate
  const currentFirstYearPrincipal = current.monthlyPayment * 12 - 
    (current.currentBalance * (current.interestRate / 100));
  const newFirstYearPrincipal = newMonthlyPI * 12 - 
    (newLoanAmount * (scenario.newRate / 100));
  
  // Generate recommendation
  let recommendation = '';
  if (worthIt) {
    if (breakEvenMonths <= 12) {
      recommendation = `Strongly recommend refinancing. You'll recover costs in just ${breakEvenMonths} months and save $${lifetimeSavings.toLocaleString()} over the loan life.`;
    } else if (breakEvenMonths <= 24) {
      recommendation = `Refinancing makes sense if you plan to stay ${breakEvenMonths}+ months. Total savings: $${lifetimeSavings.toLocaleString()}.`;
    } else {
      recommendation = `Refinancing is beneficial but requires ${breakEvenMonths} months to break even. Consider your timeline.`;
    }
  } else if (monthlySavings > 0) {
    recommendation = `Monthly savings of $${monthlySavings} exist, but ${breakEvenMonths > 60 ? 'break-even exceeds 5 years' : 'net lifetime savings are negative'}. May not be worth the hassle.`;
  } else {
    recommendation = 'Refinancing would increase your monthly payment. Not recommended unless you need cash out or want to pay off faster.';
  }
  
  // Tips
  if (scenario.newRate > current.interestRate - 0.5) {
    tips.push('Consider waiting for rates to drop at least 0.5% below your current rate.');
  }
  if (current.monthsRemaining < 120) {
    tips.push('With less than 10 years remaining, refinancing benefits are limited.');
  }
  if (closingCosts > newLoanAmount * 0.03) {
    tips.push('Shop around for lower closing costs. Current estimate seems high.');
  }
  if (!worthIt && scenario.newTermYears === 30) {
    tips.push('Consider a 15-year refinance for better total savings.');
  }
  
  // Shorter term scenario
  let shorterTermScenario = null;
  if (scenario.newTermYears === 30) {
    const shorterRate = scenario.newRate - 0.68; // Typical 15-year spread
    const shorterPayment = calculateMonthlyPayment(newLoanAmount, shorterRate, 15);
    const shorterInterest = calculateTotalInterest(newLoanAmount, shorterRate, 15);
    
    shorterTermScenario = {
      totalCost: Math.round(shorterPayment * 180 + closingCosts),
      payoffDate: new Date(new Date().setFullYear(new Date().getFullYear() + 15)).toISOString().split('T')[0]
    };
  }
  
  return {
    worthIt,
    breakEvenMonths: breakEvenMonths === Infinity ? -1 : breakEvenMonths,
    monthlySavings,
    lifetimeSavings,
    newMonthlyPayment: newMonthlyTotal,
    totalClosingCosts: closingCosts,
    recommendation,
    details: {
      currentVsNew: {
        currentMonthly: Math.round(currentMonthlyPI),
        newMonthly: newMonthlyTotal,
        difference: monthlySavings
      },
      interestSavings: {
        currentRemainingInterest,
        newTotalInterest,
        netSavings: netInterestSavings
      },
      timeAnalysis: {
        currentMonthsRemaining: current.monthsRemaining,
        newMonths: scenario.newTermYears * 12,
        payoffDateComparison: payoffComparison
      },
      equityImpact: {
        currentEquityBuildRate: Math.round(currentFirstYearPrincipal / 12),
        newEquityBuildRate: Math.round(newFirstYearPrincipal / 12),
        difference: Math.round((newFirstYearPrincipal - currentFirstYearPrincipal) / 12)
      }
    },
    scenarios: {
      keepCurrent: {
        totalCost: Math.round(currentMonthlyPI * current.monthsRemaining),
        payoffDate: currentPayoffDate.toISOString().split('T')[0]
      },
      refinance: {
        totalCost: Math.round(newMonthlyPI * scenario.newTermYears * 12 + closingCosts),
        payoffDate: newPayoffDate.toISOString().split('T')[0]
      },
      refinanceShorterTerm: shorterTermScenario
    },
    warnings,
    tips
  };
}

// ============================================
// RATE TRIGGER CALCULATOR
// ============================================

function calculateOptimalRefinanceRate(
  currentRate: number,
  currentBalance: number,
  monthsRemaining: number,
  estimatedClosingCosts: number,
  targetBreakEvenMonths: number = 24
): {
  optimalRate: number;
  monthlySavingsNeeded: number;
  explanation: string;
} {
  // Monthly savings needed to hit target break-even
  const monthlySavingsNeeded = Math.ceil(estimatedClosingCosts / targetBreakEvenMonths);
  
  // Current monthly payment
  const currentMonthly = calculateMonthlyPayment(currentBalance, currentRate, monthsRemaining / 12);
  
  // Target monthly payment
  const targetMonthly = currentMonthly - monthlySavingsNeeded;
  
  // Work backwards to find the rate that gives us target monthly payment
  // Using binary search
  let low = 0;
  let high = currentRate;
  let optimalRate = currentRate - 1;
  
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const payment = calculateMonthlyPayment(currentBalance, mid, 30);
    
    if (Math.abs(payment - targetMonthly) < 1) {
      optimalRate = mid;
      break;
    }
    
    if (payment > targetMonthly) {
      high = mid;
    } else {
      low = mid;
    }
  }
  
  return {
    optimalRate: Math.round(optimalRate * 100) / 100,
    monthlySavingsNeeded,
    explanation: `To break even in ${targetBreakEvenMonths} months with $${estimatedClosingCosts.toLocaleString()} in closing costs, you need rates at or below ${optimalRate.toFixed(2)}%.`
  };
}

// ============================================
// API HANDLERS
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    const {
      // Current loan details
      currentBalance,
      currentRate,
      currentPayment,
      originalTermYears = 30,
      monthsRemaining,
      loanType = 'conventional',
      hasPMI = false,
      monthlyPMI = 0,
      
      // Property
      propertyValue,
      state = 'FL',
      
      // Refinance scenario
      newRate,
      newTermYears = 30,
      cashOut = 0,
      closingCosts // Optional - will estimate if not provided
    } = body;
    
    // Validate required fields
    if (!currentBalance || !currentRate || !propertyValue || !newRate) {
      return NextResponse.json({
        success: false,
        error: 'Required: currentBalance, currentRate, propertyValue, newRate'
      }, { status: 400 });
    }
    
    // Calculate months remaining if not provided
    const calcMonthsRemaining = monthsRemaining || originalTermYears * 12;
    
    // Estimate closing costs if not provided
    const closingCostsEstimate = closingCosts || 
      estimateClosingCosts(currentBalance + cashOut, state).mid;
    
    // Build current loan details
    const current: CurrentLoanDetails = {
      originalAmount: currentBalance, // Approximate
      currentBalance,
      interestRate: currentRate,
      monthlyPayment: currentPayment || calculateMonthlyPayment(currentBalance, currentRate, calcMonthsRemaining / 12),
      termYears: originalTermYears,
      monthsRemaining: calcMonthsRemaining,
      loanType: loanType as 'conventional' | 'fha' | 'va' | 'usda',
      hasPMI,
      monthlyPMI
    };
    
    // Build refinance scenario
    const scenario: RefinanceScenario = {
      newRate,
      newTermYears,
      cashOut,
      closingCostsEstimate
    };
    
    // Analyze refinance
    const analysis = analyzeRefinance(current, scenario, propertyValue);
    
    // Calculate optimal rate trigger
    const rateTrigger = calculateOptimalRefinanceRate(
      currentRate,
      currentBalance,
      calcMonthsRemaining,
      closingCostsEstimate,
      24 // Target 24-month break-even
    );
    
    // Additional scenarios
    const additionalScenarios = [];
    
    // What if rates drop another 0.25%?
    if (newRate > 4) {
      const lowerScenario: RefinanceScenario = {
        ...scenario,
        newRate: newRate - 0.25
      };
      const lowerAnalysis = analyzeRefinance(current, lowerScenario, propertyValue);
      additionalScenarios.push({
        scenario: `If rates drop to ${(newRate - 0.25).toFixed(2)}%`,
        breakEvenMonths: lowerAnalysis.breakEvenMonths,
        monthlySavings: lowerAnalysis.monthlySavings,
        recommendation: lowerAnalysis.worthIt ? 'Would be worth it' : 'Still not worth it'
      });
    }
    
    // What about 15-year?
    if (newTermYears === 30) {
      const fifteenYearScenario: RefinanceScenario = {
        ...scenario,
        newRate: newRate - 0.68, // Typical spread
        newTermYears: 15
      };
      const fifteenAnalysis = analyzeRefinance(current, fifteenYearScenario, propertyValue);
      additionalScenarios.push({
        scenario: `15-year at ${(newRate - 0.68).toFixed(2)}%`,
        newPayment: fifteenAnalysis.newMonthlyPayment,
        lifetimeSavings: fifteenAnalysis.lifetimeSavings,
        recommendation: fifteenAnalysis.recommendation
      });
    }
    
    return NextResponse.json({
      success: true,
      input: {
        currentLoan: {
          balance: currentBalance,
          rate: currentRate,
          monthsRemaining: calcMonthsRemaining,
          loanType
        },
        refinanceScenario: {
          newRate,
          newTerm: newTermYears,
          cashOut,
          closingCosts: closingCostsEstimate
        },
        propertyValue
      },
      analysis,
      rateTrigger,
      additionalScenarios,
      closingCostEstimate: estimateClosingCosts(currentBalance + cashOut, state),
      meta: {
        responseTime: `${Date.now() - startTime}ms`,
        dataSource: 'CR AudioViz AI Refinance Engine',
        disclaimer: 'Analysis is for educational purposes. Consult with lenders for actual quotes.'
      }
    });
    
  } catch (error) {
    console.error('Refinance analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Quick refinance check via GET
  const currentRate = parseFloat(searchParams.get('currentRate') || '0');
  const newRate = parseFloat(searchParams.get('newRate') || '0');
  const balance = parseFloat(searchParams.get('balance') || '0');
  
  if (currentRate && newRate && balance) {
    const rateDiff = currentRate - newRate;
    const monthlySavingsEstimate = Math.round((balance * (rateDiff / 100)) / 12);
    const closingCostsEstimate = Math.round(balance * 0.025);
    const breakEvenEstimate = monthlySavingsEstimate > 0 
      ? Math.round(closingCostsEstimate / monthlySavingsEstimate)
      : -1;
    
    return NextResponse.json({
      success: true,
      quickCheck: {
        rateReduction: rateDiff.toFixed(2),
        estimatedMonthlySavings: monthlySavingsEstimate,
        estimatedClosingCosts: closingCostsEstimate,
        estimatedBreakEvenMonths: breakEvenEstimate,
        recommendation: breakEvenEstimate > 0 && breakEvenEstimate <= 36
          ? '✅ Likely worth refinancing'
          : breakEvenEstimate > 36
          ? '⚠️ Long break-even period'
          : '❌ Would not save money'
      },
      message: 'Use POST for detailed analysis'
    });
  }
  
  return NextResponse.json({
    success: true,
    message: 'Refinance Optimizer API',
    quickCheck: {
      method: 'GET',
      params: 'currentRate, newRate, balance',
      example: '/api/refinance?currentRate=7.5&newRate=6.5&balance=350000'
    },
    fullAnalysis: {
      method: 'POST',
      body: {
        currentBalance: 'number (required)',
        currentRate: 'number (required)',
        propertyValue: 'number (required)',
        newRate: 'number (required)',
        currentPayment: 'number (optional)',
        monthsRemaining: 'number (optional)',
        newTermYears: 'number (default: 30)',
        cashOut: 'number (default: 0)',
        closingCosts: 'number (optional - will estimate)',
        state: 'string (default: FL)'
      }
    },
    features: [
      '✅ Break-even analysis',
      '✅ Lifetime savings calculation',
      '✅ Optimal rate trigger',
      '✅ 15-year vs 30-year comparison',
      '✅ Cash-out refinance analysis',
      '✅ Closing cost estimation',
      '✅ State-specific costs (FL doc stamps)',
      '✅ Actionable recommendations'
    ]
  });
}
