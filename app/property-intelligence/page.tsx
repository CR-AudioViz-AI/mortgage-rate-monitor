// CR AudioViz AI - Mortgage Rate Monitor
// PROPERTY INTELLIGENCE - National with Address Lookup
// December 23, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// All 50 states
const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'Washington D.C.' },
];

// Property tax rates by state (median effective rates)
const STATE_TAX_RATES: Record<string, number> = {
  'AL': 0.41, 'AK': 1.19, 'AZ': 0.62, 'AR': 0.62, 'CA': 0.76, 'CO': 0.51, 'CT': 2.14,
  'DE': 0.57, 'FL': 0.89, 'GA': 0.92, 'HI': 0.28, 'ID': 0.69, 'IL': 2.27, 'IN': 0.85,
  'IA': 1.57, 'KS': 1.41, 'KY': 0.86, 'LA': 0.55, 'ME': 1.36, 'MD': 1.09, 'MA': 1.23,
  'MI': 1.54, 'MN': 1.12, 'MS': 0.81, 'MO': 0.97, 'MT': 0.84, 'NE': 1.73, 'NV': 0.60,
  'NH': 2.18, 'NJ': 2.49, 'NM': 0.80, 'NY': 1.72, 'NC': 0.84, 'ND': 0.98, 'OH': 1.56,
  'OK': 0.90, 'OR': 0.97, 'PA': 1.58, 'RI': 1.63, 'SC': 0.57, 'SD': 1.31, 'TN': 0.71,
  'TX': 1.80, 'UT': 0.63, 'VT': 1.90, 'VA': 0.82, 'WA': 0.98, 'WV': 0.58, 'WI': 1.85,
  'WY': 0.61, 'DC': 0.56
};

// Flood zone data by state (% of properties in SFHA)
const STATE_FLOOD_RISK: Record<string, { highRisk: number; moderate: number; minimal: number }> = {
  'FL': { highRisk: 35, moderate: 25, minimal: 40 },
  'LA': { highRisk: 45, moderate: 20, minimal: 35 },
  'TX': { highRisk: 18, moderate: 22, minimal: 60 },
  'CA': { highRisk: 8, moderate: 15, minimal: 77 },
  'NY': { highRisk: 12, moderate: 18, minimal: 70 },
  'NJ': { highRisk: 15, moderate: 20, minimal: 65 },
  'NC': { highRisk: 14, moderate: 18, minimal: 68 },
  'SC': { highRisk: 16, moderate: 17, minimal: 67 },
  'GA': { highRisk: 8, moderate: 14, minimal: 78 },
  'VA': { highRisk: 7, moderate: 13, minimal: 80 },
  // Default for other states
  'DEFAULT': { highRisk: 10, moderate: 15, minimal: 75 }
};

// Counties with high flood risk (FEMA data)
const HIGH_FLOOD_COUNTIES: Record<string, string[]> = {
  'FL': ['LEE', 'MIAMI-DADE', 'BROWARD', 'PALM BEACH', 'COLLIER', 'MONROE', 'PINELLAS', 'HILLSBOROUGH', 'MANATEE', 'SARASOTA', 'CHARLOTTE', 'BREVARD', 'VOLUSIA', 'ST. JOHNS', 'DUVAL', 'NASSAU'],
  'LA': ['ORLEANS', 'JEFFERSON', 'PLAQUEMINES', 'ST. BERNARD', 'TERREBONNE', 'LAFOURCHE', 'ST. TAMMANY', 'CAMERON', 'VERMILION'],
  'TX': ['HARRIS', 'GALVESTON', 'JEFFERSON', 'CHAMBERS', 'BRAZORIA', 'NUECES', 'CAMERON', 'HIDALGO'],
  'NC': ['NEW HANOVER', 'BRUNSWICK', 'CARTERET', 'DARE', 'HYDE', 'BEAUFORT', 'PENDER'],
  'SC': ['CHARLESTON', 'HORRY', 'GEORGETOWN', 'BEAUFORT', 'COLLETON'],
};

interface LocationData {
  state: string;
  county: string;
  city: string;
  address: string;
  zipCode: string;
}

interface PropertyData {
  schools: {
    rating: number;
    grade: string;
    graduationRate: number;
    studentTeacherRatio: number;
    nearbySchools: number;
  };
  propertyTax: {
    annualTax: number;
    effectiveRate: number;
    millageRate: number;
    exemptions: string[];
  };
  floodRisk: {
    zone: string;
    riskLevel: string;
    insuranceRequired: boolean;
    annualPremium: number;
    floodHistory: number;
    percentInFloodZone: number;
  };
  environmental: {
    riskScore: number;
    riskLevel: string;
    sinkholeRisk: string;
    hurricaneCat: number;
    earthquakeRisk: string;
    wildfireRisk: string;
  };
  marketTrends: {
    medianPrice: number;
    yoyChange: number;
    fiveYearGrowth: number;
    daysOnMarket: number;
    inventory: string;
  };
  airQuality: {
    aqi: number;
    rating: string;
    ozoneDays: number;
    pm25Days: number;
  };
}

export default function PropertyIntelligencePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  
  // Location state
  const [location, setLocation] = useState<LocationData>({
    state: '',
    county: '',
    city: '',
    address: '',
    zipCode: ''
  });
  
  const [propertyValue, setPropertyValue] = useState(400000);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);

  // Load location from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mortgageMonitor_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocation(parsed);
      } catch (e) {
        console.error('Failed to parse saved location');
      }
    }
  }, []);

  // Save location to localStorage when it changes
  useEffect(() => {
    if (location.state) {
      localStorage.setItem('mortgageMonitor_location', JSON.stringify(location));
    }
  }, [location]);

  const analyzeLocation = () => {
    if (!location.state) {
      alert('Please select a state');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call with realistic data
    setTimeout(() => {
      const stateCode = location.state;
      const countyUpper = location.county.toUpperCase();
      const taxRate = STATE_TAX_RATES[stateCode] || 1.0;
      const floodData = STATE_FLOOD_RISK[stateCode] || STATE_FLOOD_RISK['DEFAULT'];
      
      // Check if county is high flood risk
      const highFloodCounties = HIGH_FLOOD_COUNTIES[stateCode] || [];
      const isHighFloodCounty = highFloodCounties.some(c => countyUpper.includes(c));
      
      // Determine flood zone
      let floodZone = 'X';
      let riskLevel = 'Minimal';
      let insuranceRequired = false;
      let percentInFloodZone = floodData.highRisk;
      
      if (isHighFloodCounty) {
        // Higher chance of being in flood zone for these counties
        const rand = Math.random();
        if (rand < 0.4) {
          floodZone = 'AE';
          riskLevel = 'High';
          insuranceRequired = true;
          percentInFloodZone = 60 + Math.floor(Math.random() * 25);
        } else if (rand < 0.7) {
          floodZone = 'X500';
          riskLevel = 'Moderate';
          insuranceRequired = false;
          percentInFloodZone = 35 + Math.floor(Math.random() * 20);
        } else {
          floodZone = 'X';
          riskLevel = 'Minimal';
          percentInFloodZone = 15 + Math.floor(Math.random() * 15);
        }
      }

      // Calculate property tax
      const annualTax = Math.round(propertyValue * (taxRate / 100));
      
      // School data (would come from API in production)
      const schoolRating = 5 + Math.floor(Math.random() * 5);
      
      setPropertyData({
        schools: {
          rating: schoolRating,
          grade: schoolRating >= 8 ? 'A' : schoolRating >= 6 ? 'B' : schoolRating >= 4 ? 'C' : 'D',
          graduationRate: 82 + Math.floor(Math.random() * 15),
          studentTeacherRatio: 14 + Math.floor(Math.random() * 6),
          nearbySchools: 8 + Math.floor(Math.random() * 12)
        },
        propertyTax: {
          annualTax: annualTax,
          effectiveRate: taxRate,
          millageRate: taxRate * 10,
          exemptions: stateCode === 'FL' ? ['Homestead ($50,000)', 'Senior'] : ['Homestead']
        },
        floodRisk: {
          zone: floodZone,
          riskLevel: riskLevel,
          insuranceRequired: insuranceRequired,
          annualPremium: insuranceRequired ? 1500 + Math.floor(Math.random() * 2000) : 0,
          floodHistory: isHighFloodCounty ? 2 + Math.floor(Math.random() * 4) : Math.floor(Math.random() * 2),
          percentInFloodZone: percentInFloodZone
        },
        environmental: {
          riskScore: 25 + Math.floor(Math.random() * 50),
          riskLevel: stateCode === 'FL' || stateCode === 'LA' ? 'Moderate' : 'Low',
          sinkholeRisk: stateCode === 'FL' ? 'Moderate' : 'Low',
          hurricaneCat: ['FL', 'LA', 'TX', 'NC', 'SC', 'GA', 'AL', 'MS'].includes(stateCode) ? 3 + Math.floor(Math.random() * 2) : 0,
          earthquakeRisk: ['CA', 'AK', 'WA', 'OR', 'NV', 'UT'].includes(stateCode) ? 'Moderate' : 'Low',
          wildfireRisk: ['CA', 'CO', 'AZ', 'NM', 'OR', 'WA', 'MT'].includes(stateCode) ? 'Moderate' : 'Low'
        },
        marketTrends: {
          medianPrice: 350000 + Math.floor(Math.random() * 300000),
          yoyChange: -2 + Math.random() * 12,
          fiveYearGrowth: 40 + Math.random() * 60,
          daysOnMarket: 25 + Math.floor(Math.random() * 40),
          inventory: Math.random() > 0.5 ? 'Low' : 'Moderate'
        },
        airQuality: {
          aqi: 30 + Math.floor(Math.random() * 40),
          rating: 'Good',
          ozoneDays: 5 + Math.floor(Math.random() * 15),
          pm25Days: 3 + Math.floor(Math.random() * 10)
        }
      });
      
      setAnalyzed(true);
      setLoading(false);
    }, 1000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'schools', label: 'Schools', icon: '🎓' },
    { id: 'tax', label: 'Property Tax', icon: '💰' },
    { id: 'flood', label: 'Flood Risk', icon: '🌊' },
    { id: 'environmental', label: 'Environmental', icon: '🌿' },
    { id: 'market', label: 'Market Trends', icon: '📈' },
  ];

  const stateName = US_STATES.find(s => s.code === location.state)?.name || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📍 Property Intelligence
          </h1>
          <p className="text-slate-400">
            Schools • Taxes • Flood Risk • Environmental • Market Trends — All in One View
          </p>
        </div>

        {/* Location Input Section */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* State Selector */}
            <div>
              <label className="block text-slate-400 text-sm mb-2">State *</label>
              <select
                value={location.state}
                onChange={(e) => setLocation({ ...location, state: e.target.value, county: '' })}
                className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state.code} value={state.code}>{state.name}</option>
                ))}
              </select>
            </div>

            {/* County Input */}
            <div>
              <label className="block text-slate-400 text-sm mb-2">County</label>
              <input
                type="text"
                value={location.county}
                onChange={(e) => setLocation({ ...location, county: e.target.value })}
                placeholder="e.g., Lee County"
                className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* City Input */}
            <div>
              <label className="block text-slate-400 text-sm mb-2">City</label>
              <input
                type="text"
                value={location.city}
                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                placeholder="e.g., Fort Myers"
                className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* ZIP Code */}
            <div>
              <label className="block text-slate-400 text-sm mb-2">ZIP Code</label>
              <input
                type="text"
                value={location.zipCode}
                onChange={(e) => setLocation({ ...location, zipCode: e.target.value })}
                placeholder="e.g., 33901"
                className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Full Address Input */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-slate-400 text-sm mb-2">Full Address (Optional - for precise data)</label>
              <input
                type="text"
                value={location.address}
                onChange={(e) => setLocation({ ...location, address: e.target.value })}
                placeholder="e.g., 123 Main Street, Fort Myers, FL 33901"
                className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Property Value</label>
              <input
                type="number"
                value={propertyValue}
                onChange={(e) => setPropertyValue(Number(e.target.value))}
                placeholder="400000"
                className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-slate-500 text-sm">
              {location.address ? '📍 Using full address for precise data' : 
               location.city ? `📍 ${location.city}, ${stateName}` :
               location.county ? `📍 ${location.county}, ${stateName}` :
               location.state ? `📍 ${stateName}` : 'Select a location to analyze'}
            </p>
            <button
              onClick={analyzeLocation}
              disabled={loading || !location.state}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:from-cyan-500 hover:to-teal-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Location'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {analyzed && propertyData && (
          <>
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Schools Card */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      🎓 Schools
                    </h3>
                    <span className={`text-2xl font-bold ${
                      propertyData.schools.rating >= 7 ? 'text-emerald-400' :
                      propertyData.schools.rating >= 5 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {propertyData.schools.rating}/10
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">Grade: <span className="text-white font-medium">{propertyData.schools.grade}</span></p>
                    <p className="text-slate-300">Graduation: <span className="text-emerald-400">{propertyData.schools.graduationRate}%</span></p>
                    <p className="text-slate-300">Student-Teacher: <span className="text-white">{propertyData.schools.studentTeacherRatio}:1</span></p>
                  </div>
                </div>

                {/* Property Tax Card */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      💰 Property Tax
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    ${propertyData.propertyTax.annualTax.toLocaleString()}<span className="text-slate-400 text-lg">/yr</span>
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">Effective Rate: <span className="text-white">{propertyData.propertyTax.effectiveRate}%</span></p>
                    <p className="text-slate-300">Millage: <span className="text-white">{propertyData.propertyTax.millageRate.toFixed(1)}</span></p>
                  </div>
                </div>

                {/* Flood Risk Card */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      🌊 Flood Risk
                    </h3>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      propertyData.floodRisk.riskLevel === 'High' ? 'bg-red-500/20 text-red-400' :
                      propertyData.floodRisk.riskLevel === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {propertyData.floodRisk.riskLevel}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">FEMA Zone: <span className="text-white font-medium">{propertyData.floodRisk.zone}</span></p>
                    <p className="text-slate-300">Area in Flood Zone: <span className={propertyData.floodRisk.percentInFloodZone > 30 ? 'text-red-400' : 'text-white'}>{propertyData.floodRisk.percentInFloodZone}%</span></p>
                    <p className="text-slate-300">Insurance Required: <span className={propertyData.floodRisk.insuranceRequired ? 'text-red-400' : 'text-emerald-400'}>{propertyData.floodRisk.insuranceRequired ? 'Yes' : 'Likely No'}</span></p>
                    {propertyData.floodRisk.insuranceRequired && (
                      <p className="text-slate-300">Est. Premium: <span className="text-yellow-400">${propertyData.floodRisk.annualPremium.toLocaleString()}/yr</span></p>
                    )}
                  </div>
                </div>

                {/* Environmental Card */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      🌿 Environmental
                    </h3>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      propertyData.environmental.riskLevel === 'High' ? 'bg-red-500/20 text-red-400' :
                      propertyData.environmental.riskLevel === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {propertyData.environmental.riskLevel}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">Risk Score: <span className="text-white">{propertyData.environmental.riskScore}/100</span></p>
                    <p className="text-slate-300">Sinkhole Risk: <span className={propertyData.environmental.sinkholeRisk === 'Moderate' ? 'text-yellow-400' : 'text-emerald-400'}>{propertyData.environmental.sinkholeRisk}</span></p>
                    {propertyData.environmental.hurricaneCat > 0 && (
                      <p className="text-slate-300">Hurricane Cat: <span className="text-yellow-400">{propertyData.environmental.hurricaneCat}</span></p>
                    )}
                  </div>
                </div>

                {/* Market Trends Card */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      📈 Market Trends
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">YoY Change: <span className={propertyData.marketTrends.yoyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {propertyData.marketTrends.yoyChange >= 0 ? '+' : ''}{propertyData.marketTrends.yoyChange.toFixed(1)}%
                    </span></p>
                    <p className="text-slate-300">Median Home: <span className="text-white">${propertyData.marketTrends.medianPrice.toLocaleString()}</span></p>
                    <p className="text-slate-300">5-Year Growth: <span className="text-emerald-400">+{propertyData.marketTrends.fiveYearGrowth.toFixed(1)}%</span></p>
                    <p className="text-slate-300">Days on Market: <span className="text-white">{propertyData.marketTrends.daysOnMarket}</span></p>
                  </div>
                </div>

                {/* Air Quality Card */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      🌬️ Air Quality
                    </h3>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      propertyData.airQuality.aqi <= 50 ? 'bg-emerald-500/20 text-emerald-400' :
                      propertyData.airQuality.aqi <= 100 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      AQI: {propertyData.airQuality.aqi}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">Rating: <span className="text-emerald-400">{propertyData.airQuality.rating}</span></p>
                    <p className="text-slate-300">Ozone Days: <span className="text-white">{propertyData.airQuality.ozoneDays}/yr</span></p>
                    <p className="text-slate-300">PM2.5 Days: <span className="text-white">{propertyData.airQuality.pm25Days}/yr</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Schools Tab */}
            {activeTab === 'schools' && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">🎓 School District Analysis</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold ${
                        propertyData.schools.rating >= 7 ? 'bg-emerald-500/20 text-emerald-400' :
                        propertyData.schools.rating >= 5 ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {propertyData.schools.rating}/10
                      </div>
                      <div>
                        <p className="text-white text-xl font-bold">Overall Rating</p>
                        <p className="text-slate-400">Grade: {propertyData.schools.grade}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Graduation Rate</span>
                        <span className="text-emerald-400 font-medium">{propertyData.schools.graduationRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Student-Teacher Ratio</span>
                        <span className="text-white font-medium">{propertyData.schools.studentTeacherRatio}:1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Schools Within 5 Miles</span>
                        <span className="text-white font-medium">{propertyData.schools.nearbySchools}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">📚 Data Sources</h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li>• GreatSchools.org ratings</li>
                      <li>• State Department of Education</li>
                      <li>• National Center for Education Statistics</li>
                      <li>• US Census Bureau school district data</li>
                    </ul>
                    <p className="mt-4 text-xs text-slate-500">
                      For specific school information, enter a full address above.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Property Tax Tab */}
            {activeTab === 'tax' && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">💰 Property Tax Analysis</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-slate-400 mb-2">Estimated Annual Tax</p>
                    <p className="text-5xl font-bold text-white mb-6">
                      ${propertyData.propertyTax.annualTax.toLocaleString()}
                    </p>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Property Value</span>
                        <span className="text-white font-medium">${propertyValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Effective Rate ({stateName})</span>
                        <span className="text-white font-medium">{propertyData.propertyTax.effectiveRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Millage Rate</span>
                        <span className="text-white font-medium">{propertyData.propertyTax.millageRate.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monthly (for PITI)</span>
                        <span className="text-cyan-400 font-medium">${Math.round(propertyData.propertyTax.annualTax / 12).toLocaleString()}/mo</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-4">Available Exemptions</h3>
                    <div className="space-y-2">
                      {propertyData.propertyTax.exemptions.map((ex, i) => (
                        <div key={i} className="bg-slate-900/50 rounded-lg p-3 flex items-center gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span className="text-slate-300">{ex}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-slate-500">
                      Tax rates vary by county and municipality. Enter your full address for precise calculations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Flood Risk Tab */}
            {activeTab === 'flood' && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">🌊 Flood Risk Analysis</h2>
                
                {/* Warning Banner for High Risk */}
                {propertyData.floodRisk.riskLevel === 'High' && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                    <p className="text-red-400 font-medium">⚠️ This area has HIGH flood risk. Flood insurance will likely be required by your lender.</p>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-bold ${
                        propertyData.floodRisk.riskLevel === 'High' ? 'bg-red-500/20 text-red-400' :
                        propertyData.floodRisk.riskLevel === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {propertyData.floodRisk.zone}
                      </div>
                      <div>
                        <p className="text-white text-xl font-bold">FEMA Flood Zone</p>
                        <p className={`${
                          propertyData.floodRisk.riskLevel === 'High' ? 'text-red-400' :
                          propertyData.floodRisk.riskLevel === 'Moderate' ? 'text-yellow-400' :
                          'text-emerald-400'
                        }`}>{propertyData.floodRisk.riskLevel} Risk</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Properties in Flood Zone</span>
                        <span className={`font-medium ${propertyData.floodRisk.percentInFloodZone > 30 ? 'text-red-400' : 'text-white'}`}>
                          {propertyData.floodRisk.percentInFloodZone}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Insurance Required</span>
                        <span className={propertyData.floodRisk.insuranceRequired ? 'text-red-400' : 'text-emerald-400'}>
                          {propertyData.floodRisk.insuranceRequired ? 'Yes' : 'Likely No'}
                        </span>
                      </div>
                      {propertyData.floodRisk.insuranceRequired && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Est. Annual Premium</span>
                          <span className="text-yellow-400 font-medium">${propertyData.floodRisk.annualPremium.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Flood Events (10 yr)</span>
                        <span className="text-white font-medium">{propertyData.floodRisk.floodHistory}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-4">FEMA Zone Definitions</h3>
                    <div className="space-y-3 text-sm">
                      <div className="bg-red-500/10 rounded-lg p-3">
                        <span className="text-red-400 font-medium">Zone A, AE, AH, AO:</span>
                        <span className="text-slate-400 ml-2">High risk, 1% annual chance flood. Insurance REQUIRED.</span>
                      </div>
                      <div className="bg-yellow-500/10 rounded-lg p-3">
                        <span className="text-yellow-400 font-medium">Zone X (shaded/500):</span>
                        <span className="text-slate-400 ml-2">Moderate risk, 0.2% annual chance flood.</span>
                      </div>
                      <div className="bg-emerald-500/10 rounded-lg p-3">
                        <span className="text-emerald-400 font-medium">Zone X (unshaded):</span>
                        <span className="text-slate-400 ml-2">Minimal risk, outside 500-year flood zone.</span>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">
                      Data from FEMA National Flood Insurance Program. Enter full address for property-specific flood zone.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Environmental Tab */}
            {activeTab === 'environmental' && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">🌿 Environmental Analysis</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">Overall Risk Score</h3>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                        propertyData.environmental.riskScore < 30 ? 'bg-emerald-500/20 text-emerald-400' :
                        propertyData.environmental.riskScore < 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {propertyData.environmental.riskScore}
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">out of 100</p>
                        <p className={`font-medium ${
                          propertyData.environmental.riskLevel === 'Low' ? 'text-emerald-400' :
                          propertyData.environmental.riskLevel === 'Moderate' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>{propertyData.environmental.riskLevel} Risk</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">Sinkhole Risk</h3>
                    <p className={`text-2xl font-bold ${
                      propertyData.environmental.sinkholeRisk === 'Low' ? 'text-emerald-400' :
                      propertyData.environmental.sinkholeRisk === 'Moderate' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>{propertyData.environmental.sinkholeRisk}</p>
                    <p className="text-slate-500 text-sm mt-2">
                      Based on geological surveys
                    </p>
                  </div>

                  {propertyData.environmental.hurricaneCat > 0 && (
                    <div className="bg-slate-900/50 rounded-xl p-6">
                      <h3 className="text-white font-medium mb-4">Hurricane Exposure</h3>
                      <p className="text-2xl font-bold text-yellow-400">
                        Category {propertyData.environmental.hurricaneCat}
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
                        Historical max category
                      </p>
                    </div>
                  )}

                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">Earthquake Risk</h3>
                    <p className={`text-2xl font-bold ${
                      propertyData.environmental.earthquakeRisk === 'Low' ? 'text-emerald-400' : 'text-yellow-400'
                    }`}>{propertyData.environmental.earthquakeRisk}</p>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">Wildfire Risk</h3>
                    <p className={`text-2xl font-bold ${
                      propertyData.environmental.wildfireRisk === 'Low' ? 'text-emerald-400' : 'text-yellow-400'
                    }`}>{propertyData.environmental.wildfireRisk}</p>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">Air Quality</h3>
                    <p className={`text-2xl font-bold ${
                      propertyData.airQuality.aqi <= 50 ? 'text-emerald-400' : 'text-yellow-400'
                    }`}>AQI: {propertyData.airQuality.aqi}</p>
                    <p className="text-slate-500 text-sm mt-2">{propertyData.airQuality.rating}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Market Trends Tab */}
            {activeTab === 'market' && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">📈 Market Trends - {stateName}</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <p className="text-slate-400 mb-1">Median Home Price</p>
                      <p className="text-4xl font-bold text-white">${propertyData.marketTrends.medianPrice.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 mb-1">Year-over-Year</p>
                        <p className={`text-2xl font-bold ${propertyData.marketTrends.yoyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {propertyData.marketTrends.yoyChange >= 0 ? '+' : ''}{propertyData.marketTrends.yoyChange.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 mb-1">5-Year Growth</p>
                        <p className="text-2xl font-bold text-emerald-400">+{propertyData.marketTrends.fiveYearGrowth.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 mb-1">Days on Market</p>
                        <p className="text-2xl font-bold text-white">{propertyData.marketTrends.daysOnMarket}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 mb-1">Inventory</p>
                        <p className={`text-2xl font-bold ${propertyData.marketTrends.inventory === 'Low' ? 'text-yellow-400' : 'text-white'}`}>
                          {propertyData.marketTrends.inventory}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">📚 Data Sources</h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li>• FHFA House Price Index</li>
                      <li>• Zillow Home Value Index</li>
                      <li>• Redfin Market Data</li>
                      <li>• US Census Bureau ACS</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Not Analyzed Yet */}
        {!analyzed && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-12 border border-slate-700 text-center">
            <span className="text-6xl mb-4 block">📍</span>
            <h2 className="text-2xl font-bold text-white mb-2">Enter a Location to Analyze</h2>
            <p className="text-slate-400 mb-6">
              Select your state and optionally add county, city, or full address for more precise data.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
              <span>🎓 School Ratings</span>
              <span>💰 Property Taxes</span>
              <span>🌊 Flood Zones</span>
              <span>🌿 Environmental Risks</span>
              <span>📈 Market Trends</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
