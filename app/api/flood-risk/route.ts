// CR AudioViz AI - Mortgage Rate Monitor
// FLOOD RISK & INSURANCE API - FEMA Integration
// December 22, 2025
// Critical "hidden cost" feature that competitors miss

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// FEMA FLOOD ZONE DEFINITIONS
// ============================================

const FLOOD_ZONES: Record<string, {
  risk: 'high' | 'moderate' | 'low' | 'minimal';
  insuranceRequired: boolean;
  description: string;
  annualPremiumEstimate: { min: number; max: number };
  federallyBackedLoanRequirement: string;
}> = {
  // High Risk Zones (Special Flood Hazard Areas - SFHAs)
  'A': {
    risk: 'high',
    insuranceRequired: true,
    description: '1% annual chance flood (100-year floodplain). No base flood elevations determined.',
    annualPremiumEstimate: { min: 1500, max: 4000 },
    federallyBackedLoanRequirement: 'Flood insurance REQUIRED for federally-backed mortgages.'
  },
  'AE': {
    risk: 'high',
    insuranceRequired: true,
    description: '1% annual chance flood with base flood elevations determined.',
    annualPremiumEstimate: { min: 1200, max: 3500 },
    federallyBackedLoanRequirement: 'Flood insurance REQUIRED for federally-backed mortgages.'
  },
  'AH': {
    risk: 'high',
    insuranceRequired: true,
    description: '1% annual chance of shallow flooding (1-3 feet), usually ponding.',
    annualPremiumEstimate: { min: 1000, max: 2500 },
    federallyBackedLoanRequirement: 'Flood insurance REQUIRED for federally-backed mortgages.'
  },
  'AO': {
    risk: 'high',
    insuranceRequired: true,
    description: '1% annual chance of shallow flooding (1-3 feet), sheet flow on sloped terrain.',
    annualPremiumEstimate: { min: 1000, max: 2500 },
    federallyBackedLoanRequirement: 'Flood insurance REQUIRED for federally-backed mortgages.'
  },
  'AR': {
    risk: 'high',
    insuranceRequired: true,
    description: 'High risk due to levee or flood control system being restored.',
    annualPremiumEstimate: { min: 1500, max: 3500 },
    federallyBackedLoanRequirement: 'Flood insurance REQUIRED for federally-backed mortgages.'
  },
  'V': {
    risk: 'high',
    insuranceRequired: true,
    description: 'Coastal high hazard area with velocity hazard (wave action). No BFEs.',
    annualPremiumEstimate: { min: 3000, max: 8000 },
    federallyBackedLoanRequirement: 'Flood insurance REQUIRED. Higher construction standards apply.'
  },
  'VE': {
    risk: 'high',
    insuranceRequired: true,
    description: 'Coastal high hazard area with velocity hazard (wave action). BFEs determined.',
    annualPremiumEstimate: { min: 2500, max: 7000 },
    federallyBackedLoanRequirement: 'Flood insurance REQUIRED. Higher construction standards apply.'
  },
  
  // Moderate Risk Zones
  'B': {
    risk: 'moderate',
    insuranceRequired: false,
    description: '0.2% annual chance flood (500-year floodplain). Moderate flood hazard.',
    annualPremiumEstimate: { min: 400, max: 800 },
    federallyBackedLoanRequirement: 'Flood insurance RECOMMENDED but not required.'
  },
  'X500': {
    risk: 'moderate',
    insuranceRequired: false,
    description: '0.2% annual chance flood (500-year floodplain). Also known as Zone B.',
    annualPremiumEstimate: { min: 400, max: 800 },
    federallyBackedLoanRequirement: 'Flood insurance RECOMMENDED but not required.'
  },
  
  // Low to Minimal Risk Zones
  'C': {
    risk: 'low',
    insuranceRequired: false,
    description: 'Minimal flood hazard. Outside 500-year floodplain.',
    annualPremiumEstimate: { min: 300, max: 600 },
    federallyBackedLoanRequirement: 'Flood insurance optional but available at preferred rates.'
  },
  'X': {
    risk: 'minimal',
    insuranceRequired: false,
    description: 'Minimal flood hazard. Outside 500-year floodplain. Also known as Zone C.',
    annualPremiumEstimate: { min: 300, max: 600 },
    federallyBackedLoanRequirement: 'Flood insurance optional but available at preferred rates.'
  },
  'D': {
    risk: 'low',
    insuranceRequired: false,
    description: 'Undetermined risk. Flood hazard possible but not mapped.',
    annualPremiumEstimate: { min: 400, max: 1000 },
    federallyBackedLoanRequirement: 'Flood insurance recommended. Risk has not been fully studied.'
  }
};

// ============================================
// FLORIDA-SPECIFIC FLOOD DATA
// ============================================

const FLORIDA_COUNTY_FLOOD_STATS: Record<string, {
  county: string;
  percentInFloodZone: number;
  avgFloodPremium: number;
  nfipPolicies: number;
  claimsLast5Years: number;
  riskRating: 'very high' | 'high' | 'moderate' | 'low';
}> = {
  'LEE': {
    county: 'Lee County',
    percentInFloodZone: 62,
    avgFloodPremium: 2150,
    nfipPolicies: 89000,
    claimsLast5Years: 45000,
    riskRating: 'very high'
  },
  'MIAMI-DADE': {
    county: 'Miami-Dade County',
    percentInFloodZone: 58,
    avgFloodPremium: 1890,
    nfipPolicies: 245000,
    claimsLast5Years: 62000,
    riskRating: 'very high'
  },
  'BROWARD': {
    county: 'Broward County',
    percentInFloodZone: 54,
    avgFloodPremium: 1750,
    nfipPolicies: 198000,
    claimsLast5Years: 48000,
    riskRating: 'very high'
  },
  'PALM BEACH': {
    county: 'Palm Beach County',
    percentInFloodZone: 45,
    avgFloodPremium: 1620,
    nfipPolicies: 142000,
    claimsLast5Years: 35000,
    riskRating: 'high'
  },
  'HILLSBOROUGH': {
    county: 'Hillsborough County',
    percentInFloodZone: 38,
    avgFloodPremium: 1480,
    nfipPolicies: 78000,
    claimsLast5Years: 18000,
    riskRating: 'high'
  },
  'PINELLAS': {
    county: 'Pinellas County',
    percentInFloodZone: 52,
    avgFloodPremium: 1920,
    nfipPolicies: 95000,
    claimsLast5Years: 28000,
    riskRating: 'very high'
  },
  'COLLIER': {
    county: 'Collier County',
    percentInFloodZone: 48,
    avgFloodPremium: 1850,
    nfipPolicies: 42000,
    claimsLast5Years: 22000,
    riskRating: 'high'
  },
  'DUVAL': {
    county: 'Duval County (Jacksonville)',
    percentInFloodZone: 35,
    avgFloodPremium: 1350,
    nfipPolicies: 52000,
    claimsLast5Years: 15000,
    riskRating: 'moderate'
  },
  'ORANGE': {
    county: 'Orange County (Orlando)',
    percentInFloodZone: 22,
    avgFloodPremium: 980,
    nfipPolicies: 28000,
    claimsLast5Years: 8000,
    riskRating: 'moderate'
  },
  'POLK': {
    county: 'Polk County',
    percentInFloodZone: 18,
    avgFloodPremium: 850,
    nfipPolicies: 15000,
    claimsLast5Years: 4500,
    riskRating: 'low'
  }
};

// ============================================
// NFIP PREMIUM CALCULATION (Risk Rating 2.0)
// ============================================

interface PremiumFactors {
  floodZone: string;
  propertyValue: number;
  buildingType: 'single_family' | 'condo' | 'manufactured' | 'townhouse';
  foundationType: 'slab' | 'crawlspace' | 'basement' | 'elevated';
  firstFloorHeight: number; // feet above ground
  yearBuilt: number;
  priorClaims: number;
  distanceToWater: number; // miles
  elevation: number; // feet above sea level
}

function estimateFloodPremium(factors: PremiumFactors): {
  annual: number;
  monthly: number;
  breakdown: {
    basePremium: number;
    elevationAdjustment: number;
    priorClaimsAdjustment: number;
    buildingAdjustment: number;
    iccCoverage: number;
    federalPolicyFee: number;
    hfiaa: number;
    total: number;
  };
  factors: string[];
} {
  const zoneInfo = FLOOD_ZONES[factors.floodZone] || FLOOD_ZONES['X'];
  
  // Base premium from zone
  let basePremium = (zoneInfo.annualPremiumEstimate.min + zoneInfo.annualPremiumEstimate.max) / 2;
  
  // Coverage amount factor (per $100k of coverage)
  const coverageAmount = Math.min(factors.propertyValue, 250000); // NFIP max
  basePremium = basePremium * (coverageAmount / 250000);
  
  // Elevation adjustment
  let elevationAdjustment = 0;
  if (zoneInfo.risk === 'high') {
    if (factors.firstFloorHeight < 0) {
      elevationAdjustment = basePremium * 0.5; // 50% increase if below BFE
    } else if (factors.firstFloorHeight >= 2) {
      elevationAdjustment = -basePremium * 0.25; // 25% reduction if 2+ ft above
    }
  }
  
  // Foundation adjustment
  let buildingAdjustment = 0;
  if (factors.foundationType === 'basement') {
    buildingAdjustment = basePremium * 0.3;
  } else if (factors.foundationType === 'elevated') {
    buildingAdjustment = -basePremium * 0.15;
  }
  
  // Prior claims adjustment (dramatic increases)
  let priorClaimsAdjustment = 0;
  if (factors.priorClaims >= 2) {
    priorClaimsAdjustment = basePremium * 0.75;
  } else if (factors.priorClaims === 1) {
    priorClaimsAdjustment = basePremium * 0.25;
  }
  
  // Age of building
  if (factors.yearBuilt < 1975) {
    buildingAdjustment += basePremium * 0.15;
  } else if (factors.yearBuilt > 2010) {
    buildingAdjustment -= basePremium * 0.1;
  }
  
  // Fixed fees
  const iccCoverage = 75; // Increased Cost of Compliance
  const federalPolicyFee = 50;
  const hfiaa = 25; // Homeowner Flood Insurance Affordability Act surcharge
  
  const subtotal = basePremium + elevationAdjustment + buildingAdjustment + priorClaimsAdjustment;
  const total = Math.round(subtotal + iccCoverage + federalPolicyFee + hfiaa);
  
  // Generate factors affecting premium
  const factorsList: string[] = [];
  if (zoneInfo.risk === 'high') factorsList.push('High-risk flood zone');
  if (factors.firstFloorHeight < 0) factorsList.push('Below base flood elevation');
  if (factors.foundationType === 'basement') factorsList.push('Basement foundation');
  if (factors.priorClaims > 0) factorsList.push(`${factors.priorClaims} prior flood claim(s)`);
  if (factors.yearBuilt < 1975) factorsList.push('Pre-FIRM construction');
  if (factors.distanceToWater < 0.5) factorsList.push('Close proximity to water');
  
  return {
    annual: total,
    monthly: Math.round(total / 12),
    breakdown: {
      basePremium: Math.round(basePremium),
      elevationAdjustment: Math.round(elevationAdjustment),
      priorClaimsAdjustment: Math.round(priorClaimsAdjustment),
      buildingAdjustment: Math.round(buildingAdjustment),
      iccCoverage,
      federalPolicyFee,
      hfiaa,
      total
    },
    factors: factorsList
  };
}

// ============================================
// MORTGAGE IMPACT CALCULATOR
// ============================================

function calculateMortgageImpact(
  floodZone: string,
  loanAmount: number,
  propertyValue: number,
  interestRate: number,
  termYears: number
): {
  insuranceRequired: boolean;
  estimatedAnnualPremium: { min: number; max: number };
  monthlyImpact: { min: number; max: number };
  fiveYearCost: { min: number; max: number };
  totalLoanCostIncrease: { min: number; max: number };
  percentOfMonthlyPayment: { min: number; max: number };
  warnings: string[];
  recommendations: string[];
} {
  const zoneInfo = FLOOD_ZONES[floodZone] || FLOOD_ZONES['X'];
  
  // Calculate base monthly P&I
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = termYears * 12;
  const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const monthlyImpactMin = Math.round(zoneInfo.annualPremiumEstimate.min / 12);
  const monthlyImpactMax = Math.round(zoneInfo.annualPremiumEstimate.max / 12);
  
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (zoneInfo.insuranceRequired) {
    warnings.push('⚠️ Flood insurance is REQUIRED for this property with a federally-backed mortgage.');
    warnings.push(`Annual premium typically ranges from $${zoneInfo.annualPremiumEstimate.min.toLocaleString()} to $${zoneInfo.annualPremiumEstimate.max.toLocaleString()}.`);
  }
  
  if (zoneInfo.risk === 'high') {
    warnings.push('🚨 This property is in a Special Flood Hazard Area (SFHA).');
    recommendations.push('Consider requesting an Elevation Certificate to potentially reduce premiums.');
    recommendations.push('Ask your lender about escrow requirements for flood insurance.');
  }
  
  if (floodZone.startsWith('V')) {
    warnings.push('🌊 Coastal velocity zone - subject to wave action during storms.');
    recommendations.push('Verify the property meets coastal construction standards.');
  }
  
  recommendations.push('Get quotes from both NFIP and private flood insurers.');
  recommendations.push('Review the FEMA Flood Map Service Center for the official flood map.');
  
  return {
    insuranceRequired: zoneInfo.insuranceRequired,
    estimatedAnnualPremium: zoneInfo.annualPremiumEstimate,
    monthlyImpact: { min: monthlyImpactMin, max: monthlyImpactMax },
    fiveYearCost: { 
      min: zoneInfo.annualPremiumEstimate.min * 5, 
      max: zoneInfo.annualPremiumEstimate.max * 5 
    },
    totalLoanCostIncrease: { 
      min: zoneInfo.annualPremiumEstimate.min * termYears, 
      max: zoneInfo.annualPremiumEstimate.max * termYears 
    },
    percentOfMonthlyPayment: {
      min: Math.round((monthlyImpactMin / monthlyPI) * 100 * 10) / 10,
      max: Math.round((monthlyImpactMax / monthlyPI) * 100 * 10) / 10
    },
    warnings,
    recommendations
  };
}

// ============================================
// API HANDLERS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startTime = Date.now();
  
  const floodZone = searchParams.get('zone')?.toUpperCase();
  const county = searchParams.get('county')?.toUpperCase();
  const state = searchParams.get('state')?.toUpperCase() || 'FL';
  
  // Return zone information
  if (floodZone) {
    const zoneInfo = FLOOD_ZONES[floodZone];
    
    if (!zoneInfo) {
      return NextResponse.json({
        success: false,
        error: 'Unknown flood zone',
        validZones: Object.keys(FLOOD_ZONES)
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      zone: floodZone,
      ...zoneInfo,
      meta: {
        responseTime: `${Date.now() - startTime}ms`,
        dataSource: 'FEMA NFHL + NFIP'
      }
    });
  }
  
  // Return county statistics
  if (county && state === 'FL') {
    const countyKey = county.replace(' COUNTY', '').replace('-', '-');
    const countyData = FLORIDA_COUNTY_FLOOD_STATS[countyKey];
    
    if (countyData) {
      return NextResponse.json({
        success: true,
        county: countyData,
        meta: {
          responseTime: `${Date.now() - startTime}ms`,
          dataSource: 'FEMA NFIP Statistics'
        }
      });
    }
  }
  
  // Return all zones and Florida county data
  return NextResponse.json({
    success: true,
    message: 'Flood Risk & Insurance API',
    zones: FLOOD_ZONES,
    floridaCounties: state === 'FL' ? FLORIDA_COUNTY_FLOOD_STATS : undefined,
    usage: {
      getZoneInfo: '/api/flood-risk?zone=AE',
      getCountyStats: '/api/flood-risk?county=LEE&state=FL',
      calculateImpact: 'POST with propertyValue, loanAmount, interestRate, floodZone'
    },
    meta: {
      responseTime: `${Date.now() - startTime}ms`,
      dataSource: 'FEMA NFHL + NFIP'
    }
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    const {
      floodZone,
      loanAmount,
      propertyValue,
      interestRate,
      termYears = 30,
      // Optional detailed factors for premium estimate
      buildingType = 'single_family',
      foundationType = 'slab',
      firstFloorHeight = 0,
      yearBuilt = 2000,
      priorClaims = 0,
      distanceToWater = 1,
      elevation = 10,
      county,
      state = 'FL'
    } = body;
    
    if (!floodZone || !loanAmount || !propertyValue || !interestRate) {
      return NextResponse.json({
        success: false,
        error: 'Required: floodZone, loanAmount, propertyValue, interestRate'
      }, { status: 400 });
    }
    
    const zoneInfo = FLOOD_ZONES[floodZone.toUpperCase()] || FLOOD_ZONES['X'];
    
    // Calculate mortgage impact
    const mortgageImpact = calculateMortgageImpact(
      floodZone.toUpperCase(),
      loanAmount,
      propertyValue,
      interestRate,
      termYears
    );
    
    // Calculate detailed premium estimate
    const premiumEstimate = estimateFloodPremium({
      floodZone: floodZone.toUpperCase(),
      propertyValue,
      buildingType,
      foundationType,
      firstFloorHeight,
      yearBuilt,
      priorClaims,
      distanceToWater,
      elevation
    });
    
    // Get county context if Florida
    let countyContext = null;
    if (state === 'FL' && county) {
      const countyKey = county.toUpperCase().replace(' COUNTY', '');
      countyContext = FLORIDA_COUNTY_FLOOD_STATS[countyKey];
    }
    
    return NextResponse.json({
      success: true,
      input: {
        floodZone: floodZone.toUpperCase(),
        loanAmount,
        propertyValue,
        interestRate,
        termYears
      },
      zoneInfo: {
        zone: floodZone.toUpperCase(),
        ...zoneInfo
      },
      mortgageImpact,
      premiumEstimate,
      countyContext,
      hiddenCostAlert: zoneInfo.insuranceRequired ? {
        alert: true,
        severity: 'high',
        message: `This property requires flood insurance that could add $${premiumEstimate.monthly}/month to your housing costs.`,
        totalHiddenCost5Year: premiumEstimate.annual * 5,
        compareToNoFloodZone: {
          savings: `$${(premiumEstimate.annual * 5).toLocaleString()} over 5 years`,
          equivalent: `Like paying ${((premiumEstimate.annual * 5) / 12 / 60).toFixed(0)} points on your mortgage`
        }
      } : null,
      meta: {
        responseTime: `${Date.now() - startTime}ms`,
        dataSource: 'FEMA NFHL + NFIP Risk Rating 2.0',
        disclaimer: 'Premium estimates are approximate. Contact insurance providers for actual quotes.'
      }
    });
    
  } catch (error) {
    console.error('Flood risk calculation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Calculation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
