// CR AudioViz AI - Mortgage Rate Monitor
// PROPERTY TAX ESTIMATOR API - County-Specific Tax Rates
// December 22, 2025

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// FLORIDA COUNTY TAX DATA (2024)
// Source: Florida Department of Revenue
// ============================================

interface CountyTaxData {
  county: string;
  countyCode: string;
  millageRate: number; // Per $1,000 of taxable value
  averageEffectiveRate: number; // Percentage of market value
  medianTaxBill: number;
  medianHomeValue: number;
  homesteadExemption: number;
  additionalExemptions: string[];
  schoolDistrict: number;
  municipal: number;
  special: number;
  total: number;
}

const FLORIDA_COUNTIES: Record<string, CountyTaxData> = {
  'LEE': {
    county: 'Lee County',
    countyCode: 'LEE',
    millageRate: 18.2,
    averageEffectiveRate: 0.89,
    medianTaxBill: 3850,
    medianHomeValue: 425000,
    homesteadExemption: 50000,
    additionalExemptions: ['Senior (65+): Additional $50,000', 'Disabled Veteran: Full exemption'],
    schoolDistrict: 7.15,
    municipal: 3.85,
    special: 2.45,
    total: 18.2
  },
  'COLLIER': {
    county: 'Collier County',
    countyCode: 'COLLIER',
    millageRate: 15.8,
    averageEffectiveRate: 0.72,
    medianTaxBill: 4250,
    medianHomeValue: 585000,
    homesteadExemption: 50000,
    additionalExemptions: ['Senior (65+): Additional $50,000'],
    schoolDistrict: 6.25,
    municipal: 3.15,
    special: 2.85,
    total: 15.8
  },
  'MIAMI-DADE': {
    county: 'Miami-Dade County',
    countyCode: 'MIAMI-DADE',
    millageRate: 19.5,
    averageEffectiveRate: 0.95,
    medianTaxBill: 4850,
    medianHomeValue: 510000,
    homesteadExemption: 50000,
    additionalExemptions: ['Senior (65+): Additional $50,000', 'Disabled Veteran: Full exemption'],
    schoolDistrict: 7.85,
    municipal: 5.25,
    special: 2.15,
    total: 19.5
  },
  'BROWARD': {
    county: 'Broward County',
    countyCode: 'BROWARD',
    millageRate: 18.8,
    averageEffectiveRate: 0.92,
    medianTaxBill: 4650,
    medianHomeValue: 485000,
    homesteadExemption: 50000,
    additionalExemptions: ['Senior (65+): Additional $50,000'],
    schoolDistrict: 7.45,
    municipal: 4.85,
    special: 2.25,
    total: 18.8
  },
  'PALM-BEACH': {
    county: 'Palm Beach County',
    countyCode: 'PALM-BEACH',
    millageRate: 17.2,
    averageEffectiveRate: 0.85,
    medianTaxBill: 5250,
    medianHomeValue: 545000,
    homesteadExemption: 50000,
    additionalExemptions: ['Senior (65+): Additional $50,000'],
    schoolDistrict: 6.85,
    municipal: 4.25,
    special: 2.65,
    total: 17.2
  },
  'HILLSBOROUGH': {
    county: 'Hillsborough County',
    countyCode: 'HILLSBOROUGH',
    millageRate: 19.8,
    averageEffectiveRate: 0.98,
    medianTaxBill: 4150,
    medianHomeValue: 395000,
    homesteadExemption: 50000,
    additionalExemptions: ['Senior (65+): Additional $50,000', 'Disabled Veteran: Full exemption'],
    schoolDistrict: 8.15,
    municipal: 5.45,
    special: 1.95,
    total: 19.8
  },
  'PINELLAS': {
    county: 'Pinellas County',
    countyCode: 'PINELLAS',
    millageRate: 20.5,
    averageEffectiveRate: 1.02,
    medianTaxBill: 4350,
    medianHomeValue: 385000,
    homesteadExemption: 50000,
    additionalExemptions: ['Senior (65+): Additional $50,000'],
    schoolDistrict: 8.25,
    municipal: 5.85,
    special: 2.15,
    total: 20.5
  },
  'ORANGE': {
    county: 'Orange County',
    countyCode: 'ORANGE',
    millageRate: 18.5,
    averageEffectiveRate: 0.91,
    medianTaxBill: 3650,
    medianHomeValue: 385000,
    homesteadExemption: 50000,
    additionalExemptions: ['Senior (65+): Additional $50,000', 'Disabled Veteran: Full exemption'],
    schoolDistrict: 7.55,
    municipal: 4.75,
    special: 2.05,
    total: 18.5
  },
  'DUVAL': {
    county: 'Duval County (Jacksonville)',
    countyCode: 'DUVAL',
    millageRate: 19.2,
    averageEffectiveRate: 0.95,
    medianTaxBill: 3450,
    medianHomeValue: 345000,
    homesteadExemption: 50000,
    additionalExemptions: ['Senior (65+): Additional $50,000'],
    schoolDistrict: 7.85,
    municipal: 5.15,
    special: 1.95,
    total: 19.2
  },
  'POLK': {
    county: 'Polk County',
    countyCode: 'POLK',
    millageRate: 17.8,
    averageEffectiveRate: 0.88,
    medianTaxBill: 2850,
    medianHomeValue: 315000,
    homesteadExemption: 50000,
    additionalExemptions: ['Senior (65+): Additional $50,000'],
    schoolDistrict: 7.25,
    municipal: 4.35,
    special: 1.95,
    total: 17.8
  },
  'BREVARD': {
    county: 'Brevard County',
    countyCode: 'BREVARD',
    millageRate: 16.5,
    averageEffectiveRate: 0.82,
    medianTaxBill: 3250,
    medianHomeValue: 365000,
    homesteadExemption: 50000,
    additionalExemptions: ['Senior (65+): Additional $50,000'],
    schoolDistrict: 6.75,
    municipal: 4.15,
    special: 1.85,
    total: 16.5
  },
  'VOLUSIA': {
    county: 'Volusia County',
    countyCode: 'VOLUSIA',
    millageRate: 17.2,
    averageEffectiveRate: 0.85,
    medianTaxBill: 3050,
    medianHomeValue: 335000,
    homesteadExemption: 50000,
    additionalExemptions: ['Senior (65+): Additional $50,000'],
    schoolDistrict: 6.95,
    municipal: 4.45,
    special: 1.75,
    total: 17.2
  }
};

// State averages for comparison
const STATE_AVERAGES: Record<string, { effectiveRate: number; medianTax: number }> = {
  FL: { effectiveRate: 0.89, medianTax: 3850 },
  TX: { effectiveRate: 1.80, medianTax: 4850 },
  CA: { effectiveRate: 0.76, medianTax: 5850 },
  NY: { effectiveRate: 1.72, medianTax: 6250 },
  GA: { effectiveRate: 0.92, medianTax: 2650 },
  NC: { effectiveRate: 0.84, medianTax: 2450 }
};

// ============================================
// CALCULATION FUNCTIONS
// ============================================

function calculatePropertyTax(
  marketValue: number,
  county: CountyTaxData,
  isHomestead: boolean = true,
  isSenior: boolean = false,
  isDisabledVet: boolean = false
): {
  assessedValue: number;
  taxableValue: number;
  exemptions: { type: string; amount: number }[];
  annualTax: number;
  monthlyTax: number;
  breakdown: {
    county: number;
    school: number;
    municipal: number;
    special: number;
  };
  effectiveRate: number;
  savingsFromExemptions: number;
} {
  // Florida assesses at 100% of market value (just value)
  const assessedValue = marketValue;
  
  // Calculate exemptions
  const exemptions: { type: string; amount: number }[] = [];
  let totalExemptions = 0;
  
  if (isDisabledVet) {
    exemptions.push({ type: 'Disabled Veteran', amount: assessedValue });
    totalExemptions = assessedValue; // Full exemption
  } else {
    if (isHomestead) {
      exemptions.push({ type: 'Homestead', amount: 50000 });
      totalExemptions += 50000;
    }
    
    if (isSenior && isHomestead) {
      exemptions.push({ type: 'Senior (65+)', amount: 50000 });
      totalExemptions += 50000;
    }
  }
  
  // Taxable value
  const taxableValue = Math.max(0, assessedValue - totalExemptions);
  
  // Calculate tax by category
  const countyTax = (taxableValue / 1000) * (county.total - county.schoolDistrict - county.municipal - county.special);
  const schoolTax = (taxableValue / 1000) * county.schoolDistrict;
  const municipalTax = (taxableValue / 1000) * county.municipal;
  const specialTax = (taxableValue / 1000) * county.special;
  
  const annualTax = Math.round(countyTax + schoolTax + municipalTax + specialTax);
  const monthlyTax = Math.round(annualTax / 12);
  
  // Calculate savings from exemptions
  const taxWithoutExemptions = Math.round((assessedValue / 1000) * county.total);
  const savingsFromExemptions = taxWithoutExemptions - annualTax;
  
  // Effective rate (tax as % of market value)
  const effectiveRate = Math.round((annualTax / marketValue) * 10000) / 100;
  
  return {
    assessedValue,
    taxableValue,
    exemptions,
    annualTax,
    monthlyTax,
    breakdown: {
      county: Math.round(countyTax),
      school: Math.round(schoolTax),
      municipal: Math.round(municipalTax),
      special: Math.round(specialTax)
    },
    effectiveRate,
    savingsFromExemptions
  };
}

function estimateFirstYearTax(
  purchasePrice: number,
  county: CountyTaxData,
  isHomestead: boolean = true
): {
  warning: string;
  estimatedTax: number;
  explanation: string;
} {
  // First year often assessed at purchase price
  const tax = calculatePropertyTax(purchasePrice, county, isHomestead);
  
  return {
    warning: '⚠️ First-year taxes may be higher than previous owner paid',
    estimatedTax: tax.annualTax,
    explanation: `When you purchase a home, the assessed value resets to the purchase price. ` +
                 `If the previous owner had Save Our Homes protection, your taxes could be ` +
                 `significantly higher. Budget for $${tax.monthlyTax}/month in property taxes.`
  };
}

// ============================================
// API HANDLERS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startTime = Date.now();
  
  const county = searchParams.get('county')?.toUpperCase().replace(' ', '-');
  const state = searchParams.get('state')?.toUpperCase() || 'FL';
  
  try {
    if (state !== 'FL') {
      return NextResponse.json({
        success: true,
        message: 'Currently only Florida county data is available',
        stateAverage: STATE_AVERAGES[state] || null,
        availableStates: ['FL'],
        allStateAverages: STATE_AVERAGES
      });
    }
    
    if (county) {
      const countyData = FLORIDA_COUNTIES[county];
      
      if (!countyData) {
        return NextResponse.json({
          success: false,
          error: 'County not found',
          availableCounties: Object.keys(FLORIDA_COUNTIES)
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        county: countyData,
        comparison: {
          vsStateAverage: {
            rateDiff: Math.round((countyData.averageEffectiveRate - STATE_AVERAGES.FL.effectiveRate) * 100) / 100,
            taxDiff: countyData.medianTaxBill - STATE_AVERAGES.FL.medianTax
          }
        },
        meta: {
          responseTime: `${Date.now() - startTime}ms`,
          dataSource: 'Florida Department of Revenue',
          year: 2024
        }
      });
    }
    
    // Return all Florida counties
    return NextResponse.json({
      success: true,
      state: 'FL',
      stateAverage: STATE_AVERAGES.FL,
      counties: Object.values(FLORIDA_COUNTIES).map(c => ({
        county: c.county,
        code: c.countyCode,
        millageRate: c.millageRate,
        effectiveRate: c.averageEffectiveRate,
        medianTaxBill: c.medianTaxBill
      })).sort((a, b) => a.effectiveRate - b.effectiveRate),
      lowestTax: Object.values(FLORIDA_COUNTIES)
        .sort((a, b) => a.averageEffectiveRate - b.averageEffectiveRate)
        .slice(0, 3)
        .map(c => ({ county: c.county, rate: c.averageEffectiveRate })),
      highestTax: Object.values(FLORIDA_COUNTIES)
        .sort((a, b) => b.averageEffectiveRate - a.averageEffectiveRate)
        .slice(0, 3)
        .map(c => ({ county: c.county, rate: c.averageEffectiveRate })),
      usage: {
        byCounty: '/api/property-tax?county=LEE',
        calculate: 'POST /api/property-tax with propertyValue, county, isHomestead, etc.'
      },
      meta: {
        responseTime: `${Date.now() - startTime}ms`,
        dataSource: 'Florida Department of Revenue',
        year: 2024
      }
    });
    
  } catch (error) {
    console.error('Property tax error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tax data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    const {
      propertyValue,
      county,
      isHomestead = true,
      isSenior = false,
      isDisabledVet = false,
      isPurchase = false
    } = body;
    
    if (!propertyValue || !county) {
      return NextResponse.json({
        success: false,
        error: 'Required: propertyValue, county'
      }, { status: 400 });
    }
    
    const countyKey = county.toUpperCase().replace(' ', '-');
    const countyData = FLORIDA_COUNTIES[countyKey];
    
    if (!countyData) {
      return NextResponse.json({
        success: false,
        error: 'County not found',
        availableCounties: Object.keys(FLORIDA_COUNTIES)
      }, { status: 404 });
    }
    
    const taxCalculation = calculatePropertyTax(
      propertyValue,
      countyData,
      isHomestead,
      isSenior,
      isDisabledVet
    );
    
    const firstYearWarning = isPurchase ? estimateFirstYearTax(propertyValue, countyData, isHomestead) : null;
    
    // Compare to state and county medians
    const comparison = {
      vsCountyMedian: {
        yourTax: taxCalculation.annualTax,
        medianTax: countyData.medianTaxBill,
        difference: taxCalculation.annualTax - countyData.medianTaxBill,
        percentDiff: Math.round(((taxCalculation.annualTax - countyData.medianTaxBill) / countyData.medianTaxBill) * 100)
      },
      vsStateMedian: {
        yourTax: taxCalculation.annualTax,
        medianTax: STATE_AVERAGES.FL.medianTax,
        difference: taxCalculation.annualTax - STATE_AVERAGES.FL.medianTax
      }
    };
    
    // Impact on mortgage
    const mortgageImpact = {
      monthlyEscrow: taxCalculation.monthlyTax,
      annualCost: taxCalculation.annualTax,
      fiveYearCost: taxCalculation.annualTax * 5,
      percentOfHomeValue: taxCalculation.effectiveRate
    };
    
    return NextResponse.json({
      success: true,
      input: {
        propertyValue,
        county: countyData.county,
        isHomestead,
        isSenior,
        isDisabledVet
      },
      taxCalculation,
      firstYearWarning,
      comparison,
      mortgageImpact,
      tips: [
        isHomestead ? null : '💡 File for Homestead Exemption by March 1 to save ~$900-1,200/year',
        isSenior ? null : '💡 Seniors 65+ may qualify for additional $50,000 exemption',
        '💡 "Save Our Homes" caps annual increases at 3% for homesteaded properties',
        isPurchase ? '⚠️ Your tax bill may differ significantly from what the seller paid' : null
      ].filter(Boolean),
      meta: {
        responseTime: `${Date.now() - startTime}ms`,
        dataSource: 'Florida Department of Revenue',
        year: 2024,
        disclaimer: 'Estimates only. Contact your county property appraiser for exact figures.'
      }
    });
    
  } catch (error) {
    console.error('Property tax calculation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Calculation failed'
    }, { status: 500 });
  }
}
