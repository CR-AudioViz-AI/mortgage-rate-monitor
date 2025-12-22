// CR AudioViz AI - Mortgage Rate Monitor
// AFFORDABILITY CALCULATOR API - Income-Based Home Analysis
// December 22, 2025

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// DTI AND AFFORDABILITY RULES
// ============================================

const LOAN_GUIDELINES = {
  conventional: {
    maxDTI: 45,
    idealDTI: 36,
    maxHousingRatio: 28,
    minDownPayment: 3,
    minCreditScore: 620,
    pmiRequired: true, // if <20% down
    reserves: 2 // months
  },
  fha: {
    maxDTI: 50,
    idealDTI: 43,
    maxHousingRatio: 31,
    minDownPayment: 3.5,
    minCreditScore: 580,
    pmiRequired: true, // always (MIP)
    reserves: 1
  },
  va: {
    maxDTI: 60,
    idealDTI: 41,
    maxHousingRatio: 35,
    minDownPayment: 0,
    minCreditScore: 620,
    pmiRequired: false,
    reserves: 0
  },
  usda: {
    maxDTI: 44,
    idealDTI: 41,
    maxHousingRatio: 29,
    minDownPayment: 0,
    minCreditScore: 640,
    pmiRequired: false, // guarantee fee instead
    reserves: 0
  }
};

// Florida median incomes by county
const COUNTY_MEDIAN_INCOME: Record<string, number> = {
  'LEE': 68500,
  'COLLIER': 82500,
  'MIAMI-DADE': 59000,
  'BROWARD': 62500,
  'PALM-BEACH': 72000,
  'HILLSBOROUGH': 64500,
  'PINELLAS': 58500,
  'ORANGE': 61500,
  'DUVAL': 60500,
  'POLK': 54500,
  'SARASOTA': 71000,
  'SEMINOLE': 75500
};

// ============================================
// CALCULATION FUNCTIONS
// ============================================

interface AffordabilityInput {
  annualIncome: number;
  monthlyDebts: number;
  downPayment: number;
  creditScore: number;
  interestRate: number;
  loanType: 'conventional' | 'fha' | 'va' | 'usda';
  propertyTaxRate?: number;
  insuranceRate?: number;
  hoaMonthly?: number;
  county?: string;
}

interface AffordabilityResult {
  maxHomePrice: number;
  maxLoanAmount: number;
  monthlyPayment: {
    principalInterest: number;
    propertyTax: number;
    insurance: number;
    pmi: number;
    hoa: number;
    total: number;
  };
  dti: {
    housing: number;
    total: number;
    status: 'excellent' | 'good' | 'acceptable' | 'stretched' | 'denied';
  };
  affordabilityIndex: number;
  recommendations: string[];
  scenarios: {
    comfortable: number;
    maximum: number;
    stretch: number;
  };
}

function calculateMaxHomePrice(input: AffordabilityInput): AffordabilityResult {
  const guidelines = LOAN_GUIDELINES[input.loanType];
  const monthlyIncome = input.annualIncome / 12;
  
  // Max housing payment based on front-end ratio
  const maxHousingPayment = monthlyIncome * (guidelines.maxHousingRatio / 100);
  
  // Max total payment based on back-end ratio (DTI)
  const maxTotalPayment = monthlyIncome * (guidelines.maxDTI / 100) - input.monthlyDebts;
  
  // Use the lower of the two
  const maxPayment = Math.min(maxHousingPayment, maxTotalPayment);
  
  // Property tax rate (default 1% of home value annually)
  const taxRate = input.propertyTaxRate || 0.01;
  const insuranceRate = input.insuranceRate || 0.005; // 0.5% default
  const hoa = input.hoaMonthly || 0;
  
  // PMI rate based on credit score and LTV
  let pmiRate = 0;
  if (guidelines.pmiRequired || input.loanType === 'fha') {
    if (input.loanType === 'fha') {
      pmiRate = 0.0055; // FHA MIP
    } else {
      // Conventional PMI by credit score
      pmiRate = input.creditScore >= 760 ? 0.003 :
                input.creditScore >= 720 ? 0.004 :
                input.creditScore >= 680 ? 0.005 :
                input.creditScore >= 640 ? 0.007 : 0.01;
    }
  }
  
  // Iteratively solve for max home price
  // P&I + Tax + Insurance + PMI + HOA = maxPayment
  const monthlyRate = input.interestRate / 100 / 12;
  const numPayments = 360;
  
  // Start with estimate and iterate
  let homePrice = 0;
  let step = 50000;
  let direction = 1;
  
  for (let i = 0; i < 100; i++) {
    const testPrice = homePrice + (step * direction);
    const loanAmount = testPrice - input.downPayment;
    
    if (loanAmount <= 0) {
      step = step / 2;
      continue;
    }
    
    const pi = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
               (Math.pow(1 + monthlyRate, numPayments) - 1);
    const tax = (testPrice * taxRate) / 12;
    const insurance = (testPrice * insuranceRate) / 12;
    const pmi = input.downPayment / testPrice >= 0.2 ? 0 : (loanAmount * pmiRate) / 12;
    const total = pi + tax + insurance + pmi + hoa;
    
    if (total > maxPayment) {
      if (direction === 1) {
        direction = -1;
        step = step / 2;
      }
    } else {
      if (direction === -1) {
        direction = 1;
        step = step / 2;
      }
      homePrice = testPrice;
    }
    
    if (step < 1000) break;
  }
  
  // Calculate final payment breakdown
  const maxLoanAmount = homePrice - input.downPayment;
  const pi = maxLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
             (Math.pow(1 + monthlyRate, numPayments) - 1);
  const tax = (homePrice * taxRate) / 12;
  const insurance = (homePrice * insuranceRate) / 12;
  const ltv = maxLoanAmount / homePrice;
  const pmi = ltv <= 0.8 ? 0 : (maxLoanAmount * pmiRate) / 12;
  const totalPayment = pi + tax + insurance + pmi + hoa;
  
  // Calculate DTI ratios
  const housingRatio = (totalPayment / monthlyIncome) * 100;
  const totalDTI = ((totalPayment + input.monthlyDebts) / monthlyIncome) * 100;
  
  // DTI status
  const dtiStatus = totalDTI <= 28 ? 'excellent' :
                    totalDTI <= 36 ? 'good' :
                    totalDTI <= guidelines.idealDTI ? 'acceptable' :
                    totalDTI <= guidelines.maxDTI ? 'stretched' : 'denied';
  
  // Calculate affordability index (100 = median income can afford median home)
  const medianIncome = input.county ? COUNTY_MEDIAN_INCOME[input.county] || 65000 : 65000;
  const affordabilityIndex = Math.round((input.annualIncome / medianIncome) * 100);
  
  // Recommendations
  const recommendations: string[] = [];
  
  if (dtiStatus === 'stretched') {
    recommendations.push('⚠️ This is at your maximum limit. Consider a lower price for financial flexibility.');
  }
  if (ltv > 0.8 && input.loanType === 'conventional') {
    recommendations.push('💡 With 20% down, you could eliminate PMI and save ' + 
                        `$${Math.round(pmi)}/month`);
  }
  if (input.creditScore < 740 && input.loanType === 'conventional') {
    recommendations.push('💡 Improving credit to 740+ could lower your rate by 0.25-0.5%');
  }
  if (input.loanType === 'conventional' && ltv > 0.97) {
    recommendations.push('💡 Consider FHA - allows 3.5% down with lower PMI');
  }
  if (totalDTI > 40) {
    recommendations.push('⚠️ High DTI may limit lender options. Pay down debt first.');
  }
  
  // Scenarios
  const comfortable = Math.round(homePrice * 0.85);
  const stretch = Math.round(homePrice * 1.1);
  
  return {
    maxHomePrice: Math.round(homePrice),
    maxLoanAmount: Math.round(maxLoanAmount),
    monthlyPayment: {
      principalInterest: Math.round(pi),
      propertyTax: Math.round(tax),
      insurance: Math.round(insurance),
      pmi: Math.round(pmi),
      hoa: Math.round(hoa),
      total: Math.round(totalPayment)
    },
    dti: {
      housing: Math.round(housingRatio * 10) / 10,
      total: Math.round(totalDTI * 10) / 10,
      status: dtiStatus
    },
    affordabilityIndex,
    recommendations,
    scenarios: {
      comfortable,
      maximum: Math.round(homePrice),
      stretch
    }
  };
}

function calculateIncomeNeeded(
  homePrice: number,
  downPayment: number,
  interestRate: number,
  monthlyDebts: number
): {
  incomeNeeded: number;
  monthlyPayment: number;
  assumedDTI: number;
} {
  const loanAmount = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = 360;
  
  const pi = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
             (Math.pow(1 + monthlyRate, numPayments) - 1);
  const tax = (homePrice * 0.01) / 12;
  const insurance = (homePrice * 0.005) / 12;
  const pmi = downPayment / homePrice < 0.2 ? (loanAmount * 0.005) / 12 : 0;
  const totalPayment = pi + tax + insurance + pmi;
  
  // Using 36% DTI as target
  const totalMonthlyWithDebt = totalPayment + monthlyDebts;
  const monthlyIncomeNeeded = totalMonthlyWithDebt / 0.36;
  const annualIncomeNeeded = monthlyIncomeNeeded * 12;
  
  return {
    incomeNeeded: Math.round(annualIncomeNeeded),
    monthlyPayment: Math.round(totalPayment),
    assumedDTI: 36
  };
}

// ============================================
// API HANDLERS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startTime = Date.now();
  
  // Quick income-needed calculation
  const homePrice = searchParams.get('homePrice');
  const downPayment = searchParams.get('downPayment');
  const rate = searchParams.get('rate');
  const debts = searchParams.get('monthlyDebts');
  
  if (homePrice && downPayment && rate) {
    const result = calculateIncomeNeeded(
      parseFloat(homePrice),
      parseFloat(downPayment),
      parseFloat(rate),
      parseFloat(debts || '0')
    );
    
    return NextResponse.json({
      success: true,
      message: 'Income needed calculation',
      result,
      meta: {
        responseTime: `${Date.now() - startTime}ms`
      }
    });
  }
  
  // Return API documentation
  return NextResponse.json({
    success: true,
    message: 'Affordability Calculator API',
    quickCheck: {
      method: 'GET',
      params: 'homePrice, downPayment, rate, monthlyDebts',
      example: '/api/affordability?homePrice=400000&downPayment=80000&rate=6.22&monthlyDebts=500',
      returns: 'Income needed to afford home'
    },
    fullAnalysis: {
      method: 'POST',
      body: {
        annualIncome: 'number (required)',
        monthlyDebts: 'number (required) - car, student loans, credit cards',
        downPayment: 'number (required)',
        creditScore: 'number (required)',
        interestRate: 'number (required)',
        loanType: 'conventional | fha | va | usda',
        propertyTaxRate: 'number (optional, default 1%)',
        insuranceRate: 'number (optional, default 0.5%)',
        hoaMonthly: 'number (optional)',
        county: 'string (optional, for affordability index)'
      }
    },
    features: [
      '✅ Max home price calculation',
      '✅ DTI analysis (front & back end)',
      '✅ PMI/MIP calculation',
      '✅ Loan type comparison',
      '✅ Affordability index',
      '✅ Comfortable/max/stretch scenarios',
      '✅ Personalized recommendations'
    ],
    loanGuidelines: LOAN_GUIDELINES,
    meta: {
      responseTime: `${Date.now() - startTime}ms`
    }
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    const {
      annualIncome,
      monthlyDebts = 0,
      downPayment,
      creditScore,
      interestRate,
      loanType = 'conventional',
      propertyTaxRate,
      insuranceRate,
      hoaMonthly,
      county
    } = body;
    
    if (!annualIncome || downPayment === undefined || !creditScore || !interestRate) {
      return NextResponse.json({
        success: false,
        error: 'Required: annualIncome, downPayment, creditScore, interestRate'
      }, { status: 400 });
    }
    
    // Calculate for requested loan type
    const primaryResult = calculateMaxHomePrice({
      annualIncome,
      monthlyDebts,
      downPayment,
      creditScore,
      interestRate,
      loanType,
      propertyTaxRate,
      insuranceRate,
      hoaMonthly,
      county
    });
    
    // Calculate alternatives
    const alternatives: Record<string, { maxPrice: number; monthlyPayment: number }> = {};
    
    for (const lt of ['conventional', 'fha', 'va', 'usda'] as const) {
      if (lt !== loanType) {
        // Check eligibility
        const guidelines = LOAN_GUIDELINES[lt];
        if (creditScore >= guidelines.minCreditScore && 
            (downPayment / primaryResult.maxHomePrice) * 100 >= guidelines.minDownPayment) {
          const altResult = calculateMaxHomePrice({
            ...body,
            loanType: lt,
            interestRate: lt === 'fha' ? interestRate + 0.125 : 
                         lt === 'va' ? interestRate - 0.25 : interestRate
          });
          alternatives[lt] = {
            maxPrice: altResult.maxHomePrice,
            monthlyPayment: altResult.monthlyPayment.total
          };
        }
      }
    }
    
    // Income comparison to county median
    const medianIncome = county ? COUNTY_MEDIAN_INCOME[county.toUpperCase()] : null;
    
    return NextResponse.json({
      success: true,
      input: {
        annualIncome,
        monthlyDebts,
        downPayment,
        creditScore,
        interestRate,
        loanType,
        county
      },
      result: primaryResult,
      alternatives,
      countyContext: medianIncome ? {
        medianIncome,
        yourPercentile: annualIncome >= medianIncome * 2 ? 'Top 10%' :
                        annualIncome >= medianIncome * 1.5 ? 'Top 25%' :
                        annualIncome >= medianIncome ? 'Above median' :
                        annualIncome >= medianIncome * 0.8 ? 'Near median' : 'Below median',
        buyingPower: primaryResult.affordabilityIndex >= 100 ? 'Strong' : 
                     primaryResult.affordabilityIndex >= 80 ? 'Moderate' : 'Limited'
      } : null,
      meta: {
        responseTime: `${Date.now() - startTime}ms`,
        dataSource: 'CR AudioViz AI Affordability Engine',
        disclaimer: 'Estimates only. Final approval depends on full underwriting.'
      }
    });
    
  } catch (error) {
    console.error('Affordability calculation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Calculation failed'
    }, { status: 500 });
  }
}
