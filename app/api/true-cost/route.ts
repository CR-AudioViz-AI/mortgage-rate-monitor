// CR AudioViz AI - Mortgage Rate Monitor
// TRUE COST ESTIMATOR API - Complete Mortgage Cost Calculator
// December 22, 2025
// This is the KILLER FEATURE that competitors don't have

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// STATE-SPECIFIC COST TABLES (Florida-focused, expandable)
// ============================================

const STATE_TITLE_INSURANCE_RATES: Record<string, { 
  perThousand: number; 
  minFee: number;
  searchFee: number;
  closingFee: number;
}> = {
  FL: { perThousand: 5.75, minFee: 175, searchFee: 175, closingFee: 395 },
  TX: { perThousand: 5.50, minFee: 200, searchFee: 150, closingFee: 350 },
  CA: { perThousand: 2.50, minFee: 250, searchFee: 200, closingFee: 450 },
  NY: { perThousand: 4.50, minFee: 300, searchFee: 250, closingFee: 500 },
  GA: { perThousand: 5.00, minFee: 175, searchFee: 125, closingFee: 350 },
  NC: { perThousand: 4.75, minFee: 150, searchFee: 125, closingFee: 300 },
  // Default for other states
  DEFAULT: { perThousand: 5.00, minFee: 200, searchFee: 175, closingFee: 400 }
};

const STATE_RECORDING_FEES: Record<string, { deed: number; mortgage: number; perPage: number }> = {
  FL: { deed: 10, mortgage: 10, perPage: 8.50 },
  TX: { deed: 25, mortgage: 25, perPage: 4 },
  CA: { deed: 15, mortgage: 15, perPage: 3 },
  NY: { deed: 50, mortgage: 50, perPage: 5 },
  DEFAULT: { deed: 25, mortgage: 25, perPage: 5 }
};

const STATE_TRANSFER_TAX_RATES: Record<string, { rate: number; perAmount: number; paidBy: string }> = {
  FL: { rate: 0.70, perAmount: 100, paidBy: 'seller' }, // Doc stamps
  TX: { rate: 0, perAmount: 0, paidBy: 'none' }, // No transfer tax
  CA: { rate: 1.10, perAmount: 1000, paidBy: 'split' },
  NY: { rate: 4.00, perAmount: 1000, paidBy: 'seller' },
  DEFAULT: { rate: 1.00, perAmount: 1000, paidBy: 'seller' }
};

// Florida county-specific intangible tax (0.2% of mortgage amount)
const FL_INTANGIBLE_TAX_RATE = 0.002;
const FL_DOC_STAMPS_MORTGAGE_RATE = 0.0035; // $0.35 per $100

// ============================================
// PMI RATE TABLES (based on MGIC/Radian guidelines)
// ============================================

interface PMIRate {
  ltv: [number, number]; // LTV range
  creditScore: [number, number]; // Credit score range
  rate: number; // Annual PMI rate as percentage
}

const PMI_RATES: PMIRate[] = [
  // 95.01% - 97% LTV
  { ltv: [95.01, 97], creditScore: [760, 850], rate: 0.55 },
  { ltv: [95.01, 97], creditScore: [740, 759], rate: 0.69 },
  { ltv: [95.01, 97], creditScore: [720, 739], rate: 0.87 },
  { ltv: [95.01, 97], creditScore: [700, 719], rate: 1.10 },
  { ltv: [95.01, 97], creditScore: [680, 699], rate: 1.40 },
  { ltv: [95.01, 97], creditScore: [660, 679], rate: 1.75 },
  { ltv: [95.01, 97], creditScore: [620, 659], rate: 2.25 },
  
  // 90.01% - 95% LTV
  { ltv: [90.01, 95], creditScore: [760, 850], rate: 0.41 },
  { ltv: [90.01, 95], creditScore: [740, 759], rate: 0.52 },
  { ltv: [90.01, 95], creditScore: [720, 739], rate: 0.65 },
  { ltv: [90.01, 95], creditScore: [700, 719], rate: 0.82 },
  { ltv: [90.01, 95], creditScore: [680, 699], rate: 1.05 },
  { ltv: [90.01, 95], creditScore: [660, 679], rate: 1.31 },
  { ltv: [90.01, 95], creditScore: [620, 659], rate: 1.68 },
  
  // 85.01% - 90% LTV
  { ltv: [85.01, 90], creditScore: [760, 850], rate: 0.30 },
  { ltv: [85.01, 90], creditScore: [740, 759], rate: 0.38 },
  { ltv: [85.01, 90], creditScore: [720, 739], rate: 0.48 },
  { ltv: [85.01, 90], creditScore: [700, 719], rate: 0.61 },
  { ltv: [85.01, 90], creditScore: [680, 699], rate: 0.78 },
  { ltv: [85.01, 90], creditScore: [660, 679], rate: 0.97 },
  { ltv: [85.01, 90], creditScore: [620, 659], rate: 1.24 },
  
  // 80.01% - 85% LTV
  { ltv: [80.01, 85], creditScore: [760, 850], rate: 0.19 },
  { ltv: [80.01, 85], creditScore: [740, 759], rate: 0.24 },
  { ltv: [80.01, 85], creditScore: [720, 739], rate: 0.30 },
  { ltv: [80.01, 85], creditScore: [700, 719], rate: 0.38 },
  { ltv: [80.01, 85], creditScore: [680, 699], rate: 0.48 },
  { ltv: [80.01, 85], creditScore: [660, 679], rate: 0.60 },
  { ltv: [80.01, 85], creditScore: [620, 659], rate: 0.77 },
];

// FHA MIP Rates (as of 2024)
const FHA_UPFRONT_MIP = 0.0175; // 1.75% of loan amount
const FHA_ANNUAL_MIP: { ltv: [number, number]; term: string; rate: number }[] = [
  { ltv: [0, 90], term: '<=15', rate: 0.15 },
  { ltv: [90.01, 95], term: '<=15', rate: 0.40 },
  { ltv: [95.01, 100], term: '<=15', rate: 0.40 },
  { ltv: [0, 90], term: '>15', rate: 0.50 },
  { ltv: [90.01, 95], term: '>15', rate: 0.50 },
  { ltv: [95.01, 100], term: '>15', rate: 0.55 },
];

// VA Funding Fee
const VA_FUNDING_FEES: { 
  downPayment: [number, number]; 
  firstUse: number; 
  subsequentUse: number;
  reserveNationalGuard: number;
}[] = [
  { downPayment: [0, 4.99], firstUse: 2.15, subsequentUse: 3.30, reserveNationalGuard: 2.40 },
  { downPayment: [5, 9.99], firstUse: 1.50, subsequentUse: 1.50, reserveNationalGuard: 1.75 },
  { downPayment: [10, 100], firstUse: 1.25, subsequentUse: 1.25, reserveNationalGuard: 1.50 },
];

// ============================================
// LENDER FEE ESTIMATES (typical ranges)
// ============================================

interface LenderFeeRange {
  lenderType: string;
  originationPercent: [number, number];
  underwritingFee: [number, number];
  processingFee: [number, number];
  applicationFee: [number, number];
  creditReportFee: [number, number];
  floodCertFee: [number, number];
  taxServiceFee: [number, number];
}

const LENDER_FEE_RANGES: LenderFeeRange[] = [
  {
    lenderType: 'national',
    originationPercent: [0.5, 1.0],
    underwritingFee: [400, 900],
    processingFee: [300, 600],
    applicationFee: [0, 500],
    creditReportFee: [30, 75],
    floodCertFee: [15, 30],
    taxServiceFee: [50, 100]
  },
  {
    lenderType: 'credit_union',
    originationPercent: [0, 0.75],
    underwritingFee: [300, 600],
    processingFee: [200, 400],
    applicationFee: [0, 250],
    creditReportFee: [25, 50],
    floodCertFee: [15, 25],
    taxServiceFee: [40, 80]
  },
  {
    lenderType: 'mortgage_broker',
    originationPercent: [0.75, 1.5],
    underwritingFee: [400, 800],
    processingFee: [300, 700],
    applicationFee: [0, 400],
    creditReportFee: [30, 65],
    floodCertFee: [15, 30],
    taxServiceFee: [50, 90]
  },
  {
    lenderType: 'online',
    originationPercent: [0.25, 0.75],
    underwritingFee: [350, 700],
    processingFee: [250, 500],
    applicationFee: [0, 300],
    creditReportFee: [25, 50],
    floodCertFee: [15, 25],
    taxServiceFee: [45, 85]
  }
];

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

function getPMIRate(ltv: number, creditScore: number): number {
  if (ltv <= 80) return 0;
  
  const applicable = PMI_RATES.find(r => 
    ltv >= r.ltv[0] && ltv <= r.ltv[1] &&
    creditScore >= r.creditScore[0] && creditScore <= r.creditScore[1]
  );
  
  return applicable?.rate || 1.0; // Default to 1% if no match
}

function getFHAMIPRate(ltv: number, termYears: number): number {
  const termKey = termYears <= 15 ? '<=15' : '>15';
  const applicable = FHA_ANNUAL_MIP.find(r =>
    ltv >= r.ltv[0] && ltv <= r.ltv[1] && r.term === termKey
  );
  return applicable?.rate || 0.55;
}

function getVAFundingFee(downPaymentPercent: number, isFirstUse: boolean): number {
  const applicable = VA_FUNDING_FEES.find(r =>
    downPaymentPercent >= r.downPayment[0] && downPaymentPercent <= r.downPayment[1]
  );
  if (!applicable) return 2.15;
  return isFirstUse ? applicable.firstUse : applicable.subsequentUse;
}

function getTitleInsuranceCost(propertyValue: number, state: string): {
  ownerPolicy: number;
  lenderPolicy: number;
  searchFee: number;
  closingFee: number;
  total: number;
} {
  const rates = STATE_TITLE_INSURANCE_RATES[state] || STATE_TITLE_INSURANCE_RATES.DEFAULT;
  
  // Owner's policy based on property value
  const ownerPolicy = Math.max(rates.minFee, (propertyValue / 1000) * rates.perThousand);
  
  // Lender's policy typically 40-60% of owner's policy
  const lenderPolicy = ownerPolicy * 0.5;
  
  return {
    ownerPolicy: Math.round(ownerPolicy),
    lenderPolicy: Math.round(lenderPolicy),
    searchFee: rates.searchFee,
    closingFee: rates.closingFee,
    total: Math.round(ownerPolicy + lenderPolicy + rates.searchFee + rates.closingFee)
  };
}

function getRecordingFees(state: string): number {
  const rates = STATE_RECORDING_FEES[state] || STATE_RECORDING_FEES.DEFAULT;
  // Typical mortgage is ~20 pages, deed is ~5 pages
  return rates.deed + rates.mortgage + (25 * rates.perPage);
}

function getFloridaSpecificCosts(loanAmount: number): {
  intangibleTax: number;
  docStampsMortgage: number;
  total: number;
} {
  const intangibleTax = Math.round(loanAmount * FL_INTANGIBLE_TAX_RATE);
  const docStampsMortgage = Math.round(loanAmount * FL_DOC_STAMPS_MORTGAGE_RATE);
  
  return {
    intangibleTax,
    docStampsMortgage,
    total: intangibleTax + docStampsMortgage
  };
}

function estimateLenderFees(loanAmount: number, lenderType: string = 'national'): {
  originationFee: { low: number; high: number };
  underwritingFee: { low: number; high: number };
  processingFee: { low: number; high: number };
  applicationFee: { low: number; high: number };
  otherFees: { low: number; high: number };
  total: { low: number; high: number };
} {
  const fees = LENDER_FEE_RANGES.find(f => f.lenderType === lenderType) || LENDER_FEE_RANGES[0];
  
  const originationLow = Math.round(loanAmount * (fees.originationPercent[0] / 100));
  const originationHigh = Math.round(loanAmount * (fees.originationPercent[1] / 100));
  
  const otherFeesLow = fees.creditReportFee[0] + fees.floodCertFee[0] + fees.taxServiceFee[0];
  const otherFeesHigh = fees.creditReportFee[1] + fees.floodCertFee[1] + fees.taxServiceFee[1];
  
  return {
    originationFee: { low: originationLow, high: originationHigh },
    underwritingFee: { low: fees.underwritingFee[0], high: fees.underwritingFee[1] },
    processingFee: { low: fees.processingFee[0], high: fees.processingFee[1] },
    applicationFee: { low: fees.applicationFee[0], high: fees.applicationFee[1] },
    otherFees: { low: otherFeesLow, high: otherFeesHigh },
    total: {
      low: originationLow + fees.underwritingFee[0] + fees.processingFee[0] + fees.applicationFee[0] + otherFeesLow,
      high: originationHigh + fees.underwritingFee[1] + fees.processingFee[1] + fees.applicationFee[1] + otherFeesHigh
    }
  };
}

function estimatePrepaidItems(
  loanAmount: number,
  interestRate: number,
  propertyValue: number,
  closingDate: Date = new Date()
): {
  prepaidInterest: { low: number; high: number; description: string };
  homeownersInsurance: { low: number; high: number; description: string };
  propertyTaxEscrow: { low: number; high: number; description: string };
  insuranceEscrow: { low: number; high: number; description: string };
  total: { low: number; high: number };
} {
  // Prepaid interest: 15-30 days typically
  const dailyInterest = (loanAmount * (interestRate / 100)) / 365;
  const prepaidInterestLow = Math.round(dailyInterest * 15);
  const prepaidInterestHigh = Math.round(dailyInterest * 30);
  
  // Homeowners insurance: ~0.35% - 0.5% of property value annually
  const annualInsuranceLow = Math.round(propertyValue * 0.0035);
  const annualInsuranceHigh = Math.round(propertyValue * 0.005);
  
  // Property tax escrow: 2-6 months typically (Florida ~1% of value annually)
  const annualPropertyTax = Math.round(propertyValue * 0.01);
  const monthlyTax = annualPropertyTax / 12;
  const propertyTaxEscrowLow = Math.round(monthlyTax * 2);
  const propertyTaxEscrowHigh = Math.round(monthlyTax * 6);
  
  // Insurance escrow: 2-3 months
  const monthlyInsurance = annualInsuranceLow / 12;
  const insuranceEscrowLow = Math.round(monthlyInsurance * 2);
  const insuranceEscrowHigh = Math.round(monthlyInsurance * 3);
  
  return {
    prepaidInterest: {
      low: prepaidInterestLow,
      high: prepaidInterestHigh,
      description: '15-30 days of interest prepaid at closing'
    },
    homeownersInsurance: {
      low: annualInsuranceLow,
      high: annualInsuranceHigh,
      description: 'First year homeowners insurance premium'
    },
    propertyTaxEscrow: {
      low: propertyTaxEscrowLow,
      high: propertyTaxEscrowHigh,
      description: '2-6 months property tax escrow'
    },
    insuranceEscrow: {
      low: insuranceEscrowLow,
      high: insuranceEscrowHigh,
      description: '2-3 months insurance escrow'
    },
    total: {
      low: prepaidInterestLow + annualInsuranceLow + propertyTaxEscrowLow + insuranceEscrowLow,
      high: prepaidInterestHigh + annualInsuranceHigh + propertyTaxEscrowHigh + insuranceEscrowHigh
    }
  };
}

// ============================================
// 5-YEAR TRUE COST CALCULATION
// ============================================

function calculate5YearTrueCost(
  loanAmount: number,
  interestRate: number,
  termYears: number,
  propertyValue: number,
  creditScore: number,
  loanType: 'conventional' | 'fha' | 'va' | 'usda',
  state: string,
  lenderType: string,
  discountPoints: number = 0
): {
  closingCosts: {
    lenderFees: { low: number; high: number };
    titleAndEscrow: number;
    recordingFees: number;
    stateSpecific: number;
    prepaidItems: { low: number; high: number };
    discountPoints: number;
    upfrontMIP?: number;
    vaFundingFee?: number;
    total: { low: number; high: number };
  };
  monthlyPayment: {
    principalAndInterest: number;
    pmi: number;
    propertyTax: number;
    homeownersInsurance: number;
    total: number;
  };
  fiveYearCosts: {
    totalPayments: number;
    principalPaid: number;
    interestPaid: number;
    pmiPaid: number;
    closingCostsAmortized: { low: number; high: number };
    totalTrueCost: { low: number; high: number };
  };
  breakEvenAnalysis: {
    monthsToRecoverClosingCosts: { low: number; high: number };
    monthlySavingsVsRent?: number;
  };
} {
  const ltv = (loanAmount / propertyValue) * 100;
  const downPaymentPercent = 100 - ltv;
  
  // === CLOSING COSTS ===
  
  // Lender fees
  const lenderFees = estimateLenderFees(loanAmount, lenderType);
  
  // Title and escrow
  const titleCosts = getTitleInsuranceCost(propertyValue, state);
  
  // Recording fees
  const recordingFees = getRecordingFees(state);
  
  // State-specific costs
  let stateSpecificCosts = 0;
  if (state === 'FL') {
    const flCosts = getFloridaSpecificCosts(loanAmount);
    stateSpecificCosts = flCosts.total;
  }
  
  // Prepaid items
  const prepaidItems = estimatePrepaidItems(loanAmount, interestRate, propertyValue);
  
  // Discount points
  const pointsCost = Math.round(loanAmount * (discountPoints / 100));
  
  // Loan-type specific costs
  let upfrontMIP = 0;
  let vaFundingFee = 0;
  
  if (loanType === 'fha') {
    upfrontMIP = Math.round(loanAmount * FHA_UPFRONT_MIP);
  } else if (loanType === 'va') {
    const vaFeeRate = getVAFundingFee(downPaymentPercent, true);
    vaFundingFee = Math.round(loanAmount * (vaFeeRate / 100));
  }
  
  const totalClosingCostsLow = lenderFees.total.low + titleCosts.total + recordingFees + 
    stateSpecificCosts + prepaidItems.total.low + pointsCost + upfrontMIP + vaFundingFee;
  const totalClosingCostsHigh = lenderFees.total.high + titleCosts.total + recordingFees + 
    stateSpecificCosts + prepaidItems.total.high + pointsCost + upfrontMIP + vaFundingFee;
  
  // === MONTHLY PAYMENT ===
  
  // Adjust rate for points (typically 0.25% reduction per point)
  const adjustedRate = interestRate - (discountPoints * 0.25);
  const monthlyPI = calculateMonthlyPayment(loanAmount, adjustedRate, termYears);
  
  // PMI/MIP
  let monthlyPMI = 0;
  if (loanType === 'conventional' && ltv > 80) {
    const pmiRate = getPMIRate(ltv, creditScore);
    monthlyPMI = Math.round((loanAmount * (pmiRate / 100)) / 12);
  } else if (loanType === 'fha') {
    const mipRate = getFHAMIPRate(ltv, termYears);
    monthlyPMI = Math.round((loanAmount * (mipRate / 100)) / 12);
  }
  // VA and USDA have no monthly PMI (funding fee is upfront)
  
  // Property tax (Florida ~1% of property value)
  const monthlyPropertyTax = Math.round((propertyValue * 0.01) / 12);
  
  // Homeowners insurance (~0.4% of property value)
  const monthlyInsurance = Math.round((propertyValue * 0.004) / 12);
  
  const totalMonthlyPayment = Math.round(monthlyPI + monthlyPMI + monthlyPropertyTax + monthlyInsurance);
  
  // === 5-YEAR COSTS ===
  
  const totalPayments = totalMonthlyPayment * 60;
  
  // Calculate principal paid over 5 years (amortization)
  let remainingBalance = loanAmount;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  const monthlyRate = adjustedRate / 100 / 12;
  
  for (let month = 1; month <= 60; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPI - interestPayment;
    totalInterestPaid += interestPayment;
    totalPrincipalPaid += principalPayment;
    remainingBalance -= principalPayment;
  }
  
  // PMI for 5 years (or until 80% LTV if sooner)
  let monthsWithPMI = 60;
  if (loanType === 'conventional' && ltv > 80) {
    // Estimate when LTV reaches 80%
    const targetBalance = propertyValue * 0.80;
    let tempBalance = loanAmount;
    for (let m = 1; m <= 60; m++) {
      const interestPmt = tempBalance * monthlyRate;
      const principalPmt = monthlyPI - interestPmt;
      tempBalance -= principalPmt;
      if (tempBalance <= targetBalance) {
        monthsWithPMI = m;
        break;
      }
    }
  }
  const totalPMIPaid = monthlyPMI * monthsWithPMI;
  
  const fiveYearTrueCostLow = Math.round(totalInterestPaid + totalPMIPaid + totalClosingCostsLow);
  const fiveYearTrueCostHigh = Math.round(totalInterestPaid + totalPMIPaid + totalClosingCostsHigh);
  
  // === BREAK-EVEN ANALYSIS ===
  
  // Assuming typical rent would be ~0.8% of property value monthly
  const estimatedRent = Math.round(propertyValue * 0.008);
  const monthlySavingsVsRent = estimatedRent - totalMonthlyPayment;
  
  // Months to recover closing costs through equity building
  const monthlyEquityGain = totalPrincipalPaid / 60;
  const breakEvenMonthsLow = Math.round(totalClosingCostsLow / (monthlyEquityGain + (monthlySavingsVsRent > 0 ? monthlySavingsVsRent : 0)));
  const breakEvenMonthsHigh = Math.round(totalClosingCostsHigh / (monthlyEquityGain + (monthlySavingsVsRent > 0 ? monthlySavingsVsRent : 0)));
  
  return {
    closingCosts: {
      lenderFees: lenderFees.total,
      titleAndEscrow: titleCosts.total,
      recordingFees,
      stateSpecific: stateSpecificCosts,
      prepaidItems: prepaidItems.total,
      discountPoints: pointsCost,
      upfrontMIP: upfrontMIP || undefined,
      vaFundingFee: vaFundingFee || undefined,
      total: { low: totalClosingCostsLow, high: totalClosingCostsHigh }
    },
    monthlyPayment: {
      principalAndInterest: Math.round(monthlyPI),
      pmi: monthlyPMI,
      propertyTax: monthlyPropertyTax,
      homeownersInsurance: monthlyInsurance,
      total: totalMonthlyPayment
    },
    fiveYearCosts: {
      totalPayments,
      principalPaid: Math.round(totalPrincipalPaid),
      interestPaid: Math.round(totalInterestPaid),
      pmiPaid: totalPMIPaid,
      closingCostsAmortized: { low: totalClosingCostsLow, high: totalClosingCostsHigh },
      totalTrueCost: { low: fiveYearTrueCostLow, high: fiveYearTrueCostHigh }
    },
    breakEvenAnalysis: {
      monthsToRecoverClosingCosts: { low: breakEvenMonthsLow, high: breakEvenMonthsHigh },
      monthlySavingsVsRent
    }
  };
}

// ============================================
// API HANDLER
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    const {
      loanAmount,
      propertyValue,
      interestRate,
      termYears = 30,
      creditScore = 740,
      loanType = 'conventional',
      state = 'FL',
      lenderType = 'national',
      discountPoints = 0,
      isRefinance = false,
      currentLoanBalance,
      currentInterestRate
    } = body;
    
    // Validate required fields
    if (!loanAmount || !propertyValue || !interestRate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: loanAmount, propertyValue, interestRate' 
        },
        { status: 400 }
      );
    }
    
    // Calculate LTV
    const ltv = (loanAmount / propertyValue) * 100;
    const downPayment = propertyValue - loanAmount;
    const downPaymentPercent = (downPayment / propertyValue) * 100;
    
    // Main calculation
    const trueCost = calculate5YearTrueCost(
      loanAmount,
      interestRate,
      termYears,
      propertyValue,
      creditScore,
      loanType as 'conventional' | 'fha' | 'va' | 'usda',
      state.toUpperCase(),
      lenderType,
      discountPoints
    );
    
    // Refinance comparison if applicable
    let refinanceAnalysis = null;
    if (isRefinance && currentLoanBalance && currentInterestRate) {
      const currentMonthlyPayment = calculateMonthlyPayment(currentLoanBalance, currentInterestRate, termYears);
      const newMonthlyPayment = trueCost.monthlyPayment.principalAndInterest;
      const monthlySavings = Math.round(currentMonthlyPayment - newMonthlyPayment);
      const avgClosingCosts = (trueCost.closingCosts.total.low + trueCost.closingCosts.total.high) / 2;
      const breakEvenMonths = monthlySavings > 0 ? Math.round(avgClosingCosts / monthlySavings) : null;
      
      refinanceAnalysis = {
        currentPayment: Math.round(currentMonthlyPayment),
        newPayment: newMonthlyPayment,
        monthlySavings,
        breakEvenMonths,
        worthIt: breakEvenMonths !== null && breakEvenMonths <= 36,
        recommendation: breakEvenMonths !== null && breakEvenMonths <= 36 
          ? `Refinancing makes sense! You'll recover closing costs in ${breakEvenMonths} months.`
          : monthlySavings <= 0 
            ? "Refinancing would not save you money at this rate."
            : `Break-even is ${breakEvenMonths} months. Consider if you'll stay that long.`
      };
    }
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      input: {
        loanAmount,
        propertyValue,
        downPayment,
        downPaymentPercent: Math.round(downPaymentPercent * 100) / 100,
        ltv: Math.round(ltv * 100) / 100,
        interestRate,
        termYears,
        creditScore,
        loanType,
        state: state.toUpperCase(),
        lenderType,
        discountPoints
      },
      trueCost,
      refinanceAnalysis,
      scenarios: {
        withOnePoint: loanType === 'conventional' ? calculate5YearTrueCost(
          loanAmount, interestRate, termYears, propertyValue, creditScore,
          'conventional', state.toUpperCase(), lenderType, 1
        ) : null,
        fifteenYear: termYears === 30 ? calculate5YearTrueCost(
          loanAmount, interestRate - 0.68, 15, propertyValue, creditScore,
          loanType as 'conventional' | 'fha' | 'va' | 'usda', state.toUpperCase(), lenderType, 0
        ) : null
      },
      meta: {
        responseTime: `${responseTime}ms`,
        dataSource: 'CR AudioViz AI True Cost Engine',
        disclaimer: 'Estimates only. Actual costs may vary. Not financial advice.',
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('True cost calculation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Calculation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Support GET with query params for simple calculations
  const loanAmount = parseFloat(searchParams.get('loanAmount') || '0');
  const propertyValue = parseFloat(searchParams.get('propertyValue') || '0');
  const interestRate = parseFloat(searchParams.get('rate') || '0');
  
  if (!loanAmount || !propertyValue || !interestRate) {
    return NextResponse.json({
      success: true,
      message: 'True Cost Estimator API',
      usage: {
        method: 'POST',
        body: {
          loanAmount: 'number (required)',
          propertyValue: 'number (required)',
          interestRate: 'number (required)',
          termYears: 'number (default: 30)',
          creditScore: 'number (default: 740)',
          loanType: 'conventional | fha | va | usda (default: conventional)',
          state: 'string (default: FL)',
          lenderType: 'national | credit_union | mortgage_broker | online (default: national)',
          discountPoints: 'number (default: 0)',
          isRefinance: 'boolean (default: false)',
          currentLoanBalance: 'number (for refinance)',
          currentInterestRate: 'number (for refinance)'
        },
        example: {
          loanAmount: 400000,
          propertyValue: 500000,
          interestRate: 6.22,
          termYears: 30,
          creditScore: 740,
          loanType: 'conventional',
          state: 'FL',
          lenderType: 'national'
        }
      },
      features: [
        '✅ State-specific closing costs (FL, TX, CA, NY, GA, NC)',
        '✅ PMI calculation by credit score and LTV',
        '✅ FHA MIP (upfront and annual)',
        '✅ VA funding fee calculation',
        '✅ Title insurance estimates',
        '✅ Recording fees by state',
        '✅ Florida-specific intangible tax and doc stamps',
        '✅ Prepaid items estimation',
        '✅ 5-year true cost analysis',
        '✅ Break-even analysis',
        '✅ Refinance comparison',
        '✅ Scenario comparisons (15-year, with points)'
      ]
    });
  }
  
  // Quick calculation via GET
  const termYears = parseInt(searchParams.get('term') || '30');
  const creditScore = parseInt(searchParams.get('credit') || '740');
  const state = searchParams.get('state') || 'FL';
  
  const trueCost = calculate5YearTrueCost(
    loanAmount,
    interestRate,
    termYears,
    propertyValue,
    creditScore,
    'conventional',
    state.toUpperCase(),
    'national',
    0
  );
  
  return NextResponse.json({
    success: true,
    quickEstimate: {
      monthlyPayment: trueCost.monthlyPayment.total,
      closingCosts: trueCost.closingCosts.total,
      fiveYearTrueCost: trueCost.fiveYearCosts.totalTrueCost
    },
    message: 'Use POST for full analysis'
  });
}
