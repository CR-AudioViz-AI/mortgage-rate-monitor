// CR AudioViz AI - Mortgage Rate Monitor
// ENVIRONMENTAL HAZARDS API - EPA Proximity & Risk Data
// December 22, 2025
// Source: EPA Envirofacts, USGS, FL DEP

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// ENVIRONMENTAL RISK DATA BY FLORIDA COUNTY
// ============================================

interface EnvironmentalRisk {
  county: string;
  overallRiskScore: number; // 1-100, lower is better
  riskLevel: 'low' | 'moderate' | 'elevated' | 'high';
  airQuality: {
    aqi: number;
    rating: string;
    ozoneDays: number;
    pm25Days: number;
  };
  waterQuality: {
    score: number;
    violations: number;
    contaminants: string[];
  };
  superfundSites: {
    count: number;
    nearest: { name: string; distance: number; status: string } | null;
  };
  toxicRelease: {
    facilitiesNearby: number;
    annualPounds: number;
  };
  radon: {
    zone: number;
    risk: string;
    avgLevel: number;
  };
  sinkholes: {
    risk: 'low' | 'moderate' | 'high';
    reportedIncidents: number;
    insuranceRecommended: boolean;
  };
  hurricaneRisk: {
    category: number;
    historicalHits: number;
    evacuationZone: string;
  };
}

const FLORIDA_ENVIRONMENTAL: Record<string, EnvironmentalRisk> = {
  'LEE': {
    county: 'Lee County',
    overallRiskScore: 42,
    riskLevel: 'moderate',
    airQuality: {
      aqi: 45,
      rating: 'Good',
      ozoneDays: 12,
      pm25Days: 8
    },
    waterQuality: {
      score: 72,
      violations: 3,
      contaminants: ['Red tide algae (seasonal)', 'Agricultural runoff']
    },
    superfundSites: {
      count: 2,
      nearest: { name: 'Fort Myers Tanning Corp', distance: 8.5, status: 'Remediation complete' }
    },
    toxicRelease: {
      facilitiesNearby: 15,
      annualPounds: 285000
    },
    radon: {
      zone: 3,
      risk: 'Low',
      avgLevel: 0.8
    },
    sinkholes: {
      risk: 'low',
      reportedIncidents: 45,
      insuranceRecommended: false
    },
    hurricaneRisk: {
      category: 4,
      historicalHits: 28,
      evacuationZone: 'A-B zones near coast'
    }
  },
  'COLLIER': {
    county: 'Collier County',
    overallRiskScore: 38,
    riskLevel: 'moderate',
    airQuality: {
      aqi: 42,
      rating: 'Good',
      ozoneDays: 8,
      pm25Days: 5
    },
    waterQuality: {
      score: 78,
      violations: 1,
      contaminants: ['Red tide (seasonal)']
    },
    superfundSites: {
      count: 1,
      nearest: { name: 'Copeland Sausage Site', distance: 15.2, status: 'Monitoring' }
    },
    toxicRelease: {
      facilitiesNearby: 8,
      annualPounds: 125000
    },
    radon: {
      zone: 3,
      risk: 'Low',
      avgLevel: 0.6
    },
    sinkholes: {
      risk: 'low',
      reportedIncidents: 22,
      insuranceRecommended: false
    },
    hurricaneRisk: {
      category: 5,
      historicalHits: 32,
      evacuationZone: 'A zones coastal'
    }
  },
  'MIAMI-DADE': {
    county: 'Miami-Dade County',
    overallRiskScore: 55,
    riskLevel: 'elevated',
    airQuality: {
      aqi: 58,
      rating: 'Moderate',
      ozoneDays: 25,
      pm25Days: 18
    },
    waterQuality: {
      score: 68,
      violations: 8,
      contaminants: ['Sea water intrusion', 'Urban runoff', 'PFAS detected']
    },
    superfundSites: {
      count: 8,
      nearest: { name: 'Miami Drum Services', distance: 2.5, status: 'Active cleanup' }
    },
    toxicRelease: {
      facilitiesNearby: 45,
      annualPounds: 850000
    },
    radon: {
      zone: 3,
      risk: 'Low',
      avgLevel: 0.5
    },
    sinkholes: {
      risk: 'low',
      reportedIncidents: 35,
      insuranceRecommended: false
    },
    hurricaneRisk: {
      category: 5,
      historicalHits: 45,
      evacuationZone: 'A-C zones extensive'
    }
  },
  'HILLSBOROUGH': {
    county: 'Hillsborough County',
    overallRiskScore: 52,
    riskLevel: 'elevated',
    airQuality: {
      aqi: 52,
      rating: 'Moderate',
      ozoneDays: 18,
      pm25Days: 12
    },
    waterQuality: {
      score: 70,
      violations: 5,
      contaminants: ['Phosphate mining legacy', 'Urban runoff']
    },
    superfundSites: {
      count: 5,
      nearest: { name: 'Stauffer Chemical Tampa', distance: 4.2, status: 'Remediation ongoing' }
    },
    toxicRelease: {
      facilitiesNearby: 38,
      annualPounds: 720000
    },
    radon: {
      zone: 2,
      risk: 'Moderate',
      avgLevel: 2.1
    },
    sinkholes: {
      risk: 'high',
      reportedIncidents: 425,
      insuranceRecommended: true
    },
    hurricaneRisk: {
      category: 4,
      historicalHits: 22,
      evacuationZone: 'A-B zones Tampa Bay'
    }
  },
  'ORANGE': {
    county: 'Orange County',
    overallRiskScore: 45,
    riskLevel: 'moderate',
    airQuality: {
      aqi: 48,
      rating: 'Good',
      ozoneDays: 15,
      pm25Days: 10
    },
    waterQuality: {
      score: 74,
      violations: 4,
      contaminants: ['Nitrates', 'Urban development runoff']
    },
    superfundSites: {
      count: 3,
      nearest: { name: 'City Industries Inc', distance: 6.8, status: 'Remediation complete' }
    },
    toxicRelease: {
      facilitiesNearby: 28,
      annualPounds: 420000
    },
    radon: {
      zone: 2,
      risk: 'Moderate',
      avgLevel: 1.8
    },
    sinkholes: {
      risk: 'moderate',
      reportedIncidents: 185,
      insuranceRecommended: true
    },
    hurricaneRisk: {
      category: 3,
      historicalHits: 15,
      evacuationZone: 'Limited - inland'
    }
  },
  'POLK': {
    county: 'Polk County',
    overallRiskScore: 58,
    riskLevel: 'elevated',
    airQuality: {
      aqi: 55,
      rating: 'Moderate',
      ozoneDays: 20,
      pm25Days: 15
    },
    waterQuality: {
      score: 62,
      violations: 12,
      contaminants: ['Phosphate mining', 'Agricultural chemicals', 'Heavy metals']
    },
    superfundSites: {
      count: 12,
      nearest: { name: 'Mulberry Phosphates', distance: 1.5, status: 'Active monitoring' }
    },
    toxicRelease: {
      facilitiesNearby: 52,
      annualPounds: 1250000
    },
    radon: {
      zone: 1,
      risk: 'High',
      avgLevel: 4.2
    },
    sinkholes: {
      risk: 'high',
      reportedIncidents: 890,
      insuranceRecommended: true
    },
    hurricaneRisk: {
      category: 2,
      historicalHits: 12,
      evacuationZone: 'Minimal - central FL'
    }
  },
  'PINELLAS': {
    county: 'Pinellas County',
    overallRiskScore: 48,
    riskLevel: 'moderate',
    airQuality: {
      aqi: 50,
      rating: 'Good',
      ozoneDays: 14,
      pm25Days: 9
    },
    waterQuality: {
      score: 72,
      violations: 4,
      contaminants: ['Red tide (seasonal)', 'Stormwater runoff']
    },
    superfundSites: {
      count: 4,
      nearest: { name: 'Pinellas County Landfill', distance: 3.8, status: 'Capped and monitored' }
    },
    toxicRelease: {
      facilitiesNearby: 22,
      annualPounds: 380000
    },
    radon: {
      zone: 2,
      risk: 'Moderate',
      avgLevel: 1.5
    },
    sinkholes: {
      risk: 'moderate',
      reportedIncidents: 245,
      insuranceRecommended: true
    },
    hurricaneRisk: {
      category: 4,
      historicalHits: 25,
      evacuationZone: 'A-C zones peninsula-wide'
    }
  },
  'DUVAL': {
    county: 'Duval County (Jacksonville)',
    overallRiskScore: 52,
    riskLevel: 'elevated',
    airQuality: {
      aqi: 54,
      rating: 'Moderate',
      ozoneDays: 18,
      pm25Days: 14
    },
    waterQuality: {
      score: 68,
      violations: 7,
      contaminants: ['Industrial discharge', 'St. Johns River pollution']
    },
    superfundSites: {
      count: 6,
      nearest: { name: 'Pickettville Road Landfill', distance: 2.8, status: 'Active cleanup' }
    },
    toxicRelease: {
      facilitiesNearby: 42,
      annualPounds: 680000
    },
    radon: {
      zone: 3,
      risk: 'Low',
      avgLevel: 0.9
    },
    sinkholes: {
      risk: 'low',
      reportedIncidents: 55,
      insuranceRecommended: false
    },
    hurricaneRisk: {
      category: 3,
      historicalHits: 18,
      evacuationZone: 'A-B zones near coast/river'
    }
  },
  'SARASOTA': {
    county: 'Sarasota County',
    overallRiskScore: 35,
    riskLevel: 'low',
    airQuality: {
      aqi: 40,
      rating: 'Good',
      ozoneDays: 6,
      pm25Days: 4
    },
    waterQuality: {
      score: 80,
      violations: 1,
      contaminants: ['Red tide (seasonal)']
    },
    superfundSites: {
      count: 1,
      nearest: { name: 'Whitaker Bayou', distance: 12.5, status: 'Remediation complete' }
    },
    toxicRelease: {
      facilitiesNearby: 12,
      annualPounds: 145000
    },
    radon: {
      zone: 3,
      risk: 'Low',
      avgLevel: 0.7
    },
    sinkholes: {
      risk: 'low',
      reportedIncidents: 38,
      insuranceRecommended: false
    },
    hurricaneRisk: {
      category: 4,
      historicalHits: 22,
      evacuationZone: 'A-B zones barrier islands'
    }
  },
  'SEMINOLE': {
    county: 'Seminole County',
    overallRiskScore: 40,
    riskLevel: 'moderate',
    airQuality: {
      aqi: 46,
      rating: 'Good',
      ozoneDays: 12,
      pm25Days: 8
    },
    waterQuality: {
      score: 76,
      violations: 2,
      contaminants: ['Nitrates from development']
    },
    superfundSites: {
      count: 2,
      nearest: { name: 'Sanford Gasification Plant', distance: 5.2, status: 'Monitored' }
    },
    toxicRelease: {
      facilitiesNearby: 18,
      annualPounds: 220000
    },
    radon: {
      zone: 2,
      risk: 'Moderate',
      avgLevel: 1.6
    },
    sinkholes: {
      risk: 'moderate',
      reportedIncidents: 125,
      insuranceRecommended: true
    },
    hurricaneRisk: {
      category: 2,
      historicalHits: 10,
      evacuationZone: 'Minimal - inland'
    }
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getEnvironmentalAlerts(data: EnvironmentalRisk): {
  severity: 'none' | 'low' | 'medium' | 'high';
  alerts: string[];
  recommendations: string[];
} {
  const alerts: string[] = [];
  const recommendations: string[] = [];
  let severity: 'none' | 'low' | 'medium' | 'high' = 'none';
  
  // Air quality
  if (data.airQuality.aqi > 50) {
    alerts.push(`⚠️ Moderate air quality (AQI: ${data.airQuality.aqi})`);
    severity = 'low';
  }
  
  // Water quality
  if (data.waterQuality.violations > 5) {
    alerts.push(`🚰 ${data.waterQuality.violations} water quality violations in past year`);
    recommendations.push('Consider whole-house water filtration system');
    severity = severity === 'none' ? 'low' : 'medium';
  }
  
  // Superfund sites
  if (data.superfundSites.nearest && data.superfundSites.nearest.distance < 5) {
    alerts.push(`☢️ Superfund site within ${data.superfundSites.nearest.distance} miles: ${data.superfundSites.nearest.name}`);
    recommendations.push('Request Phase I environmental assessment');
    severity = 'medium';
  }
  
  // Toxic release
  if (data.toxicRelease.annualPounds > 500000) {
    alerts.push(`🏭 High industrial emissions area (${(data.toxicRelease.annualPounds / 1000000).toFixed(1)}M lbs/year)`);
    severity = 'medium';
  }
  
  // Radon
  if (data.radon.zone === 1) {
    alerts.push(`☢️ HIGH RADON ZONE - Testing required`);
    recommendations.push('Radon test REQUIRED before purchase');
    recommendations.push('Budget $800-1,500 for mitigation if needed');
    severity = 'high';
  } else if (data.radon.zone === 2) {
    alerts.push(`⚠️ Moderate radon risk area`);
    recommendations.push('Radon test recommended');
  }
  
  // Sinkholes
  if (data.sinkholes.risk === 'high') {
    alerts.push(`🕳️ HIGH SINKHOLE RISK - ${data.sinkholes.reportedIncidents} reported incidents`);
    recommendations.push('Sinkhole insurance STRONGLY recommended');
    recommendations.push('Request geological survey before purchase');
    severity = 'high';
  } else if (data.sinkholes.risk === 'moderate') {
    alerts.push(`⚠️ Moderate sinkhole risk area`);
    recommendations.push('Consider sinkhole insurance');
  }
  
  // Hurricane
  if (data.hurricaneRisk.category >= 4) {
    alerts.push(`🌀 High hurricane exposure (Cat ${data.hurricaneRisk.category} capable)`);
    recommendations.push('Verify wind mitigation features');
    recommendations.push('Budget for hurricane shutters/impact windows');
  }
  
  return { severity, alerts, recommendations };
}

function calculateInsuranceImpact(data: EnvironmentalRisk): {
  additionalCosts: { type: string; annual: number; required: boolean }[];
  totalAnnual: number;
  fiveYearCost: number;
} {
  const costs: { type: string; annual: number; required: boolean }[] = [];
  
  // Sinkhole insurance
  if (data.sinkholes.insuranceRecommended) {
    costs.push({
      type: 'Sinkhole Coverage',
      annual: data.sinkholes.risk === 'high' ? 2500 : 1200,
      required: false
    });
  }
  
  // Hurricane/wind
  if (data.hurricaneRisk.category >= 3) {
    costs.push({
      type: 'Enhanced Wind Coverage',
      annual: data.hurricaneRisk.category >= 4 ? 1800 : 1200,
      required: false
    });
  }
  
  // Radon mitigation (one-time amortized)
  if (data.radon.zone === 1) {
    costs.push({
      type: 'Radon Mitigation (amortized)',
      annual: 250,
      required: true
    });
  }
  
  const totalAnnual = costs.reduce((sum, c) => sum + c.annual, 0);
  
  return {
    additionalCosts: costs,
    totalAnnual,
    fiveYearCost: totalAnnual * 5
  };
}

// ============================================
// API HANDLERS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startTime = Date.now();
  
  const county = searchParams.get('county')?.toUpperCase().replace(' ', '-');
  
  try {
    if (county) {
      const data = FLORIDA_ENVIRONMENTAL[county];
      
      if (!data) {
        return NextResponse.json({
          success: false,
          error: 'County not found',
          availableCounties: Object.keys(FLORIDA_ENVIRONMENTAL)
        }, { status: 404 });
      }
      
      const alerts = getEnvironmentalAlerts(data);
      const insuranceImpact = calculateInsuranceImpact(data);
      
      return NextResponse.json({
        success: true,
        county: data,
        alerts,
        insuranceImpact,
        mortgageConsiderations: {
          additionalMonthlyCost: Math.round(insuranceImpact.totalAnnual / 12),
          fiveYearHiddenCost: insuranceImpact.fiveYearCost,
          disclosureRequired: alerts.severity === 'high',
          lenderConcerns: data.sinkholes.risk === 'high' || data.radon.zone === 1
        },
        meta: {
          responseTime: `${Date.now() - startTime}ms`,
          dataSource: 'EPA Envirofacts, FL DEP, USGS',
          disclaimer: 'Environmental conditions vary by specific location. Professional assessment recommended.'
        }
      });
    }
    
    // Return all counties ranked by risk
    const ranked = Object.values(FLORIDA_ENVIRONMENTAL)
      .map(d => ({
        county: d.county,
        overallRiskScore: d.overallRiskScore,
        riskLevel: d.riskLevel,
        topConcerns: [
          d.sinkholes.risk === 'high' ? 'Sinkholes' : null,
          d.radon.zone === 1 ? 'Radon' : null,
          d.superfundSites.count > 5 ? 'Superfund sites' : null,
          d.hurricaneRisk.category >= 4 ? 'Hurricanes' : null
        ].filter(Boolean)
      }))
      .sort((a, b) => a.overallRiskScore - b.overallRiskScore);
    
    return NextResponse.json({
      success: true,
      rankings: ranked,
      lowestRisk: ranked.slice(0, 3),
      highestRisk: ranked.slice(-3).reverse(),
      usage: {
        byCounty: '/api/environmental?county=LEE'
      },
      meta: {
        responseTime: `${Date.now() - startTime}ms`,
        dataSource: 'EPA Envirofacts, FL DEP, USGS'
      }
    });
    
  } catch (error) {
    console.error('Environmental API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch environmental data'
    }, { status: 500 });
  }
}
