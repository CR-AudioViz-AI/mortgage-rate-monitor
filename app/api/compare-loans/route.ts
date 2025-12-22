// CR AudioViz AI - Mortgage Rate Monitor
// 5-YEAR COST COMPARISON CALCULATOR
// December 22, 2025
// Compare multiple loan scenarios side-by-side

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// INTERFACES
// ============================================

interface LoanScenario {
  name: string;
  loanAmount: number;
  interestRate: number;
  termYears: number;
  loanType: 'conventional' | 'fha' | 'va' | 'usda';
  discountPoints: number;
  closingCosts: number;
}

interface ScenarioResult {
  name: string;
  monthlyPayment: {
    principalAndInterest: number;
    pmi: number;
    propertyTax: number;
    insurance: number;
    total: number;
  };
  fiveYearCosts: {
    totalPayments: number;
    principalPaid: number;
    interestPaid: number;
    pmiPaid: number;
    totalCost: number;
  };
  tenYearCosts: {
    totalPayments: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
    totalCost: number;
  };
  loanLifeCosts: {
    totalPayments: number;
    totalInterest: number;
    totalCost: number;
  };
  breakEven: {
    vsRenting: number | null;
    vsOtherScenarios: Record<string, number>;
  };
}

interface ComparisonResult {
  scenarios: ScenarioResult[];
  winner: {
    fiveYear: string;
    tenYear: string;
    totalCost: string;
    monthlyPayment: string;
  };
  insights: string[];
  recommendation: string;
}

// ============================================
// CALCULATION FUNCTIONS
// ============================================

function calculateMonthlyPI(principal: number, annualRate: number, termYears: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  
  if (monthlyRate === 0) return principal / numPayments;
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1);
}

function calculateAmortization(
  principal: number,
  annualRate: number,
  termYears: number,
  months: number
): { principalPaid: number; interestPaid: number; remainingBalance: number } {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPI(principal, annualRate, termYears);
  
  let balance = principal;
  let totalPrincipal = 0;
  let totalInterest = 0;
  
  for (let m = 1; m <= months && balance > 0; m++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
    
    totalInterest += interestPayment;
    totalPrincipal += principalPayment;
    balance -= principalPayment;
  }
  
  return {
    principalPaid: Math.round(totalPrincipal),
    interestPaid: Math.round(totalInterest),
    remainingBalance: Math.round(Math.max(0, balance))
  };
}

function getPMIRate(ltv: number, creditScore: number, loanType: string): number {
  if (loanType === 'va' || loanType === 'usda') return 0;
  
  if (loanType === 'fha') {
    // FHA MIP rates
    if (ltv <= 90) return 0.50;
    if (ltv <= 95) return 0.50;
    return 0.55;
  }
  
  // Conventional PMI
  if (ltv <= 80) return 0;
  
  // Simplified PMI based on LTV and credit score
  if (creditScore >= 760) {
    if (ltv <= 85) return 0.19;
    if (ltv <= 90) return 0.30;
    if (ltv <= 95) return 0.41;
    return 0.55;
  } else if (creditScore >= 720) {
    if (ltv <= 85) return 0.30;
    if (ltv <= 90) return 0.48;
    if (ltv <= 95) return 0.65;
    return 0.87;
  } else if (creditScore >= 680) {
    if (ltv <= 85) return 0.48;
    if (ltv <= 90) return 0.78;
    if (ltv <= 95) return 1.05;
    return 1.40;
  } else {
    if (ltv <= 85) return 0.77;
    if (ltv <= 90) return 1.24;
    if (ltv <= 95) return 1.68;
    return 2.25;
  }
}

function calculatePMIDuration(
  loanAmount: number,
  propertyValue: number,
  annualRate: number,
  termYears: number,
  loanType: string
): number {
  if (loanType === 'va' || loanType === 'usda') return 0;
  
  if (loanType === 'fha') {
    // FHA MIP for life if LTV > 90% and term > 15 years
    const ltv = (loanAmount / propertyValue) * 100;
    if (ltv > 90 && termYears > 15) return termYears * 12;
    return Math.min(11 * 12, termYears * 12); // 11 years or loan term
  }
  
  // Conventional: PMI until 78% LTV
  const targetBalance = propertyValue * 0.78;
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPI(loanAmount, annualRate, termYears);
  
  let balance = loanAmount;
  let months = 0;
  
  while (balance > targetBalance && months < termYears * 12) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    months++;
  }
  
  return months;
}

function calculateScenario(
  scenario: LoanScenario,
  propertyValue: number,
  creditScore: number
): ScenarioResult {
  const ltv = (scenario.loanAmount / propertyValue) * 100;
  
  // Adjust rate for discount points (0.25% reduction per point)
  const effectiveRate = scenario.interestRate - (scenario.discountPoints * 0.25);
  
  // Monthly payments
  const monthlyPI = calculateMonthlyPI(scenario.loanAmount, effectiveRate, scenario.termYears);
  
  const pmiRate = getPMIRate(ltv, creditScore, scenario.loanType);
  const monthlyPMI = Math.round((scenario.loanAmount * (pmiRate / 100)) / 12);
  
  const monthlyPropertyTax = Math.round((propertyValue * 0.01) / 12); // 1% annually
  const monthlyInsurance = Math.round((propertyValue * 0.004) / 12); // 0.4% annually
  
  const totalMonthly = Math.round(monthlyPI + monthlyPMI + monthlyPropertyTax + monthlyInsurance);
  
  // PMI duration
  const pmiMonths = calculatePMIDuration(
    scenario.loanAmount, propertyValue, effectiveRate, scenario.termYears, scenario.loanType
  );
  
  // 5-year calculations
  const fiveYear = calculateAmortization(scenario.loanAmount, effectiveRate, scenario.termYears, 60);
  const fiveYearPMI = monthlyPMI * Math.min(60, pmiMonths);
  
  // 10-year calculations
  const tenYear = calculateAmortization(scenario.loanAmount, effectiveRate, scenario.termYears, 120);
  const tenYearPMI = monthlyPMI * Math.min(120, pmiMonths);
  
  // Full loan calculations
  const fullLoan = calculateAmortization(
    scenario.loanAmount, effectiveRate, scenario.termYears, scenario.termYears * 12
  );
  const totalPMI = monthlyPMI * pmiMonths;
  
  // Points cost
  const pointsCost = Math.round(scenario.loanAmount * (scenario.discountPoints / 100));
  
  return {
    name: scenario.name,
    monthlyPayment: {
      principalAndInterest: Math.round(monthlyPI),
      pmi: monthlyPMI,
      propertyTax: monthlyPropertyTax,
      insurance: monthlyInsurance,
      total: totalMonthly
    },
    fiveYearCosts: {
      totalPayments: totalMonthly * 60,
      principalPaid: fiveYear.principalPaid,
      interestPaid: fiveYear.interestPaid,
      pmiPaid: fiveYearPMI,
      totalCost: fiveYear.interestPaid + fiveYearPMI + scenario.closingCosts + pointsCost
    },
    tenYearCosts: {
      totalPayments: totalMonthly * 120,
      principalPaid: tenYear.principalPaid,
      interestPaid: tenYear.interestPaid,
      remainingBalance: tenYear.remainingBalance,
      totalCost: tenYear.interestPaid + tenYearPMI + scenario.closingCosts + pointsCost
    },
    loanLifeCosts: {
      totalPayments: Math.round(monthlyPI * scenario.termYears * 12),
      totalInterest: fullLoan.interestPaid,
      totalCost: fullLoan.interestPaid + totalPMI + scenario.closingCosts + pointsCost
    },
    breakEven: {
      vsRenting: null, // Calculated later
      vsOtherScenarios: {}
    }
  };
}

function compareScenarios(
  scenarios: ScenarioResult[],
  monthlyRent?: number
): ComparisonResult {
  // Find winners
  const fiveYearWinner = scenarios.reduce((a, b) => 
    a.fiveYearCosts.totalCost < b.fiveYearCosts.totalCost ? a : b
  );
  
  const tenYearWinner = scenarios.reduce((a, b) => 
    a.tenYearCosts.totalCost < b.tenYearCosts.totalCost ? a : b
  );
  
  const totalCostWinner = scenarios.reduce((a, b) => 
    a.loanLifeCosts.totalCost < b.loanLifeCosts.totalCost ? a : b
  );
  
  const monthlyWinner = scenarios.reduce((a, b) => 
    a.monthlyPayment.total < b.monthlyPayment.total ? a : b
  );
  
  // Calculate break-even vs renting
  if (monthlyRent) {
    scenarios.forEach(s => {
      const monthlySavings = monthlyRent - s.monthlyPayment.total;
      if (monthlySavings > 0) {
        s.breakEven.vsRenting = Math.round(s.fiveYearCosts.totalCost / monthlySavings);
      } else {
        // Buying costs more monthly - need to factor in equity
        const monthlyEquityGain = s.fiveYearCosts.principalPaid / 60;
        const netMonthlyCost = s.monthlyPayment.total - monthlyRent;
        // Break-even when equity gained exceeds extra costs
        s.breakEven.vsRenting = netMonthlyCost > 0 
          ? Math.round((s.fiveYearCosts.totalCost) / (monthlyEquityGain - netMonthlyCost))
          : null;
      }
    });
  }
  
  // Calculate break-even between scenarios
  for (let i = 0; i < scenarios.length; i++) {
    for (let j = 0; j < scenarios.length; j++) {
      if (i !== j) {
        const costDiff = scenarios[j].fiveYearCosts.totalCost - scenarios[i].fiveYearCosts.totalCost;
        const monthlyDiff = scenarios[i].monthlyPayment.total - scenarios[j].monthlyPayment.total;
        
        if (monthlyDiff > 0 && costDiff > 0) {
          // Scenario i costs more monthly but less overall
          scenarios[i].breakEven.vsOtherScenarios[scenarios[j].name] = Math.round(costDiff / monthlyDiff);
        }
      }
    }
  }
  
  // Generate insights
  const insights: string[] = [];
  
  // Monthly payment comparison
  const monthlyDiff = scenarios[scenarios.length - 1].monthlyPayment.total - scenarios[0].monthlyPayment.total;
  if (Math.abs(monthlyDiff) > 100) {
    insights.push(`Monthly payment difference: $${Math.abs(monthlyDiff).toLocaleString()}/month between options.`);
  }
  
  // 5-year cost comparison
  const fiveYearDiff = Math.max(...scenarios.map(s => s.fiveYearCosts.totalCost)) - 
                       Math.min(...scenarios.map(s => s.fiveYearCosts.totalCost));
  if (fiveYearDiff > 5000) {
    insights.push(`5-year cost difference: $${fiveYearDiff.toLocaleString()} between best and worst options.`);
  }
  
  // 15-year vs 30-year insight
  const has15Year = scenarios.find(s => s.name.includes('15'));
  const has30Year = scenarios.find(s => s.name.includes('30'));
  if (has15Year && has30Year) {
    const interestSavings = has30Year.loanLifeCosts.totalInterest - has15Year.loanLifeCosts.totalInterest;
    if (interestSavings > 0) {
      insights.push(`15-year saves $${interestSavings.toLocaleString()} in interest over loan life.`);
    }
  }
  
  // Points analysis
  const withPoints = scenarios.find(s => s.name.includes('point'));
  const noPoints = scenarios.find(s => !s.name.includes('point') && s.name.includes('30'));
  if (withPoints && noPoints) {
    const breakEvenMonths = withPoints.breakEven.vsOtherScenarios[noPoints.name];
    if (breakEvenMonths) {
      insights.push(`Buying points breaks even in ${breakEvenMonths} months (${(breakEvenMonths / 12).toFixed(1)} years).`);
    }
  }
  
  // Generate recommendation
  let recommendation = '';
  if (fiveYearWinner.name === totalCostWinner.name) {
    recommendation = `${fiveYearWinner.name} is the best option for both short-term and long-term costs.`;
  } else {
    recommendation = `For a 5-year horizon: ${fiveYearWinner.name}. For long-term ownership: ${totalCostWinner.name}.`;
  }
  
  return {
    scenarios,
    winner: {
      fiveYear: fiveYearWinner.name,
      tenYear: tenYearWinner.name,
      totalCost: totalCostWinner.name,
      monthlyPayment: monthlyWinner.name
    },
    insights,
    recommendation
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
      propertyValue,
      creditScore = 740,
      state = 'FL',
      monthlyRent,
      scenarios: customScenarios,
      // Quick comparison inputs
      loanAmount,
      currentRate,
      compareRates
    } = body;
    
    if (!propertyValue) {
      return NextResponse.json({
        success: false,
        error: 'propertyValue is required'
      }, { status: 400 });
    }
    
    let scenariosToCompare: LoanScenario[] = [];
    
    if (customScenarios && Array.isArray(customScenarios)) {
      // Use custom scenarios
      scenariosToCompare = customScenarios;
    } else if (loanAmount && currentRate) {
      // Generate standard comparison scenarios
      const ltv = (loanAmount / propertyValue) * 100;
      const baseClosingCosts = Math.round(loanAmount * 0.03); // Estimate 3%
      
      scenariosToCompare = [
        {
          name: '30-Year Fixed',
          loanAmount,
          interestRate: currentRate,
          termYears: 30,
          loanType: 'conventional',
          discountPoints: 0,
          closingCosts: baseClosingCosts
        },
        {
          name: '30-Year with 1 Point',
          loanAmount,
          interestRate: currentRate,
          termYears: 30,
          loanType: 'conventional',
          discountPoints: 1,
          closingCosts: baseClosingCosts
        },
        {
          name: '15-Year Fixed',
          loanAmount,
          interestRate: currentRate - 0.68, // Typical 15-year spread
          termYears: 15,
          loanType: 'conventional',
          discountPoints: 0,
          closingCosts: baseClosingCosts
        }
      ];
      
      // Add FHA comparison if LTV > 80%
      if (ltv > 80 && ltv <= 96.5) {
        scenariosToCompare.push({
          name: 'FHA 30-Year',
          loanAmount,
          interestRate: currentRate - 0.25, // FHA typically slightly lower
          termYears: 30,
          loanType: 'fha',
          discountPoints: 0,
          closingCosts: baseClosingCosts + Math.round(loanAmount * 0.0175) // Include UFMIP
        });
      }
      
      // Add rate comparison scenarios if provided
      if (compareRates && Array.isArray(compareRates)) {
        compareRates.forEach((rate: number, idx: number) => {
          scenariosToCompare.push({
            name: `30-Year at ${rate}%`,
            loanAmount,
            interestRate: rate,
            termYears: 30,
            loanType: 'conventional',
            discountPoints: 0,
            closingCosts: baseClosingCosts
          });
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'Provide either custom scenarios or loanAmount + currentRate'
      }, { status: 400 });
    }
    
    // Calculate each scenario
    const calculatedScenarios = scenariosToCompare.map(scenario => 
      calculateScenario(scenario, propertyValue, creditScore)
    );
    
    // Compare scenarios
    const comparison = compareScenarios(calculatedScenarios, monthlyRent);
    
    return NextResponse.json({
      success: true,
      input: {
        propertyValue,
        creditScore,
        state,
        monthlyRent,
        scenarioCount: scenariosToCompare.length
      },
      comparison,
      summary: {
        lowestMonthly: {
          scenario: comparison.winner.monthlyPayment,
          amount: calculatedScenarios.find(s => s.name === comparison.winner.monthlyPayment)?.monthlyPayment.total
        },
        lowest5YearCost: {
          scenario: comparison.winner.fiveYear,
          amount: calculatedScenarios.find(s => s.name === comparison.winner.fiveYear)?.fiveYearCosts.totalCost
        },
        lowestTotalCost: {
          scenario: comparison.winner.totalCost,
          amount: calculatedScenarios.find(s => s.name === comparison.winner.totalCost)?.loanLifeCosts.totalCost
        }
      },
      meta: {
        responseTime: `${Date.now() - startTime}ms`,
        dataSource: 'CR AudioViz AI Comparison Engine',
        disclaimer: 'Estimates only. Actual costs may vary based on lender, timing, and market conditions.'
      }
    });
    
  } catch (error) {
    console.error('Comparison calculation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Calculation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: '5-Year Cost Comparison Calculator API',
    usage: {
      method: 'POST',
      body: {
        propertyValue: 'number (required)',
        creditScore: 'number (default: 740)',
        state: 'string (default: FL)',
        monthlyRent: 'number (optional - for rent vs buy analysis)',
        loanAmount: 'number (for quick comparison)',
        currentRate: 'number (for quick comparison)',
        compareRates: 'number[] (optional additional rates to compare)',
        scenarios: 'array (optional custom scenarios)'
      },
      scenarioFormat: {
        name: 'string',
        loanAmount: 'number',
        interestRate: 'number',
        termYears: 'number',
        loanType: 'conventional | fha | va | usda',
        discountPoints: 'number',
        closingCosts: 'number'
      }
    },
    example: {
      propertyValue: 500000,
      loanAmount: 400000,
      currentRate: 6.22,
      creditScore: 740,
      monthlyRent: 2500
    },
    features: [
      '✅ Compare up to 10 loan scenarios',
      '✅ 5-year, 10-year, and full-term cost analysis',
      '✅ PMI/MIP calculations by loan type',
      '✅ Break-even analysis between scenarios',
      '✅ Rent vs buy comparison',
      '✅ Discount points ROI analysis',
      '✅ Winner identification by time horizon',
      '✅ Automated insights and recommendations'
    ]
  });
}
