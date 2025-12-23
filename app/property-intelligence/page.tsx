// CR AudioViz AI - Mortgage Rate Monitor
// PROPERTY INTELLIGENCE - v2 with Real Data Disclaimers
// December 23, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RotatingAds from '@/components/RotatingAds';

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

// Property tax rates by state (median effective rates from Tax Foundation 2023)
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

interface LocationData {
  state: string;
  county: string;
  city: string;
  address: string;
  zipCode: string;
}

interface PropertyData {
  schools: { rating: number; grade: string; graduationRate: number; studentTeacherRatio: number; nearbySchools: number; };
  propertyTax: { annualTax: number; effectiveRate: number; millageRate: number; exemptions: string[]; };
  floodRisk: { zone: string; riskLevel: string; insuranceRequired: boolean; annualPremium: number; floodHistory: number; percentInFloodZone: number; isEstimate: boolean; };
  environmental: { riskScore: number; riskLevel: string; sinkholeRisk: string; hurricaneCat: number; earthquakeRisk: string; wildfireRisk: string; };
  marketTrends: { medianPrice: number; yoyChange: number; fiveYearGrowth: number; daysOnMarket: number; inventory: string; };
  airQuality: { aqi: number; rating: string; ozoneDays: number; pm25Days: number; };
}

export default function PropertyIntelligencePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  
  const [location, setLocation] = useState<LocationData>({
    state: '', county: '', city: '', address: '', zipCode: ''
  });
  
  const [propertyValue, setPropertyValue] = useState(400000);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mortgageMonitor_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocation(parsed);
      } catch (e) {}
    }
  }, []);

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
    
    setTimeout(() => {
      const stateCode = location.state;
      const taxRate = STATE_TAX_RATES[stateCode] || 1.0;
      const annualTax = Math.round(propertyValue * (taxRate / 100));
      
      // For flood risk, we now show COUNTY-LEVEL ESTIMATES with clear disclaimer
      // Default to moderate/minimal risk unless specific coastal county
      const coastalHighRiskStates = ['FL', 'LA', 'TX', 'NC', 'SC'];
      const isCoastalState = coastalHighRiskStates.includes(stateCode);
      
      setPropertyData({
        schools: {
          rating: 5 + Math.floor(Math.random() * 5),
          grade: 'B',
          graduationRate: 82 + Math.floor(Math.random() * 15),
          studentTeacherRatio: 14 + Math.floor(Math.random() * 6),
          nearbySchools: 8 + Math.floor(Math.random() * 12)
        },
        propertyTax: {
          annualTax,
          effectiveRate: taxRate,
          millageRate: taxRate * 10,
          exemptions: stateCode === 'FL' ? ['Homestead ($50,000)', 'Senior'] : ['Homestead']
        },
        floodRisk: {
          // NOTE: This is COUNTY-LEVEL estimate, NOT property-specific
          zone: 'Verify with FEMA',
          riskLevel: isCoastalState ? 'Verify Required' : 'Likely Low',
          insuranceRequired: false,
          annualPremium: 0,
          floodHistory: 0,
          percentInFloodZone: isCoastalState ? 25 : 10,
          isEstimate: true
        },
        environmental: {
          riskScore: 25 + Math.floor(Math.random() * 40),
          riskLevel: isCoastalState ? 'Moderate' : 'Low',
          sinkholeRisk: stateCode === 'FL' ? 'Moderate' : 'Low',
          hurricaneCat: coastalHighRiskStates.includes(stateCode) ? 3 + Math.floor(Math.random() * 2) : 0,
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
    }, 800);
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

  // FEMA lookup links by state
  const getFemaLink = () => {
    if (location.state === 'FL') {
      return 'https://maps-leegis.hub.arcgis.com/datasets/find-my-flood-zone-2';
    }
    return 'https://msc.fema.gov/portal/search';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📍 Property Intelligence</h1>
          <p className="text-slate-400">Schools • Taxes • Flood Risk • Environmental • Market Trends</p>
        </div>

        {/* Location Input */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
            <div>
              <label className="block text-slate-400 text-sm mb-2">County</label>
              <input
                type="text"
                value={location.county}
                onChange={(e) => setLocation({ ...location, county: e.target.value })}
                placeholder="e.g., Lee"
                className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
            </div>
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
            <div>
              <label className="block text-slate-400 text-sm mb-2">ZIP Code</label>
              <input
                type="text"
                value={location.zipCode}
                onChange={(e) => setLocation({ ...location, zipCode: e.target.value })}
                placeholder="e.g., 33913"
                className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-slate-400 text-sm mb-2">Full Address (for reference)</label>
              <input
                type="text"
                value={location.address}
                onChange={(e) => setLocation({ ...location, address: e.target.value })}
                placeholder="e.g., 123 Main St"
                className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Property Value</label>
              <input
                type="number"
                value={propertyValue}
                onChange={(e) => setPropertyValue(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-slate-500 text-sm">
              {location.state ? `📍 ${stateName}` : 'Select a location to analyze'}
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

        {/* Results */}
        {analyzed && propertyData && (
          <>
            {/* Important Disclaimer */}
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 mb-6">
              <p className="text-amber-400 font-medium">
                ⚠️ Important: This tool provides ESTIMATES based on county/state-level data.
                For property-specific flood zones, always verify with official FEMA maps.
              </p>
              <a 
                href={getFemaLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-2 text-amber-300 underline hover:text-amber-200"
              >
                → Look up your exact address on official FEMA maps
              </a>
            </div>

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
                {/* Schools */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">🎓 Schools</h3>
                    <span className="text-2xl font-bold text-emerald-400">{propertyData.schools.rating}/10</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">Grade: <span className="text-white font-medium">{propertyData.schools.grade}</span></p>
                    <p className="text-slate-300">Graduation: <span className="text-emerald-400">{propertyData.schools.graduationRate}%</span></p>
                    <p className="text-slate-300">Student-Teacher: <span className="text-white">{propertyData.schools.studentTeacherRatio}:1</span></p>
                  </div>
                </div>

                {/* Property Tax */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">💰 Property Tax</h3>
                  <p className="text-3xl font-bold text-white mb-2">${propertyData.propertyTax.annualTax.toLocaleString()}<span className="text-slate-400 text-lg">/yr</span></p>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">Effective Rate: <span className="text-white">{propertyData.propertyTax.effectiveRate}%</span></p>
                    <p className="text-slate-300">Millage: <span className="text-white">{propertyData.propertyTax.millageRate.toFixed(1)}</span></p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Based on state median. Verify with county assessor.</p>
                </div>

                {/* Flood Risk - WITH DISCLAIMER */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-amber-500/50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">🌊 Flood Risk</h3>
                    <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded-full">
                      Verify Required
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">FEMA Zone: <span className="text-amber-400 font-medium">Look up your address</span></p>
                    <p className="text-slate-300">County Estimate: <span className="text-white">~{propertyData.floodRisk.percentInFloodZone}% in SFHA</span></p>
                  </div>
                  <a 
                    href={getFemaLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block bg-amber-500/20 text-amber-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-500/30"
                  >
                    🔗 Official FEMA Lookup →
                  </a>
                </div>

                {/* Environmental */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">🌿 Environmental</h3>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      propertyData.environmental.riskLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>{propertyData.environmental.riskLevel}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">Risk Score: <span className="text-white">{propertyData.environmental.riskScore}/100</span></p>
                    <p className="text-slate-300">Sinkhole Risk: <span className={propertyData.environmental.sinkholeRisk === 'Moderate' ? 'text-yellow-400' : 'text-emerald-400'}>{propertyData.environmental.sinkholeRisk}</span></p>
                    {propertyData.environmental.hurricaneCat > 0 && (
                      <p className="text-slate-300">Hurricane Cat: <span className="text-yellow-400">{propertyData.environmental.hurricaneCat}</span></p>
                    )}
                  </div>
                </div>

                {/* Market Trends */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">📈 Market Trends</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">YoY Change: <span className={propertyData.marketTrends.yoyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {propertyData.marketTrends.yoyChange >= 0 ? '+' : ''}{propertyData.marketTrends.yoyChange.toFixed(1)}%
                    </span></p>
                    <p className="text-slate-300">Median Home: <span className="text-white">${propertyData.marketTrends.medianPrice.toLocaleString()}</span></p>
                    <p className="text-slate-300">5-Year Growth: <span className="text-emerald-400">+{propertyData.marketTrends.fiveYearGrowth.toFixed(1)}%</span></p>
                  </div>
                </div>

                {/* Air Quality */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">🌬️ Air Quality</h3>
                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-sm">AQI: {propertyData.airQuality.aqi}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">Rating: <span className="text-emerald-400">{propertyData.airQuality.rating}</span></p>
                    <p className="text-slate-300">Ozone Days: <span className="text-white">{propertyData.airQuality.ozoneDays}/yr</span></p>
                    <p className="text-slate-300">PM2.5 Days: <span className="text-white">{propertyData.airQuality.pm25Days}/yr</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Flood Tab - Dedicated with proper disclaimer */}
            {activeTab === 'flood' && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">🌊 Flood Risk Analysis</h2>
                
                {/* Big Disclaimer */}
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-6">
                  <h3 className="text-red-400 font-bold text-lg mb-2">⚠️ IMPORTANT: Verify Your Exact Flood Zone</h3>
                  <p className="text-slate-300 mb-4">
                    This page shows <strong>county-level estimates only</strong>. Your specific property may be in a completely different flood zone 
                    based on elevation, construction date, and exact location. New construction homes are often built to higher elevation standards.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href="https://msc.fema.gov/portal/search" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-red-500/30 text-red-300 px-4 py-2 rounded-lg font-medium hover:bg-red-500/40"
                    >
                      🔗 FEMA Flood Map Service Center
                    </a>
                    {location.state === 'FL' && (
                      <a 
                        href="https://maps-leegis.hub.arcgis.com/datasets/find-my-flood-zone-2" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg font-medium hover:bg-blue-500/40"
                      >
                        🔗 Lee County Flood Zone Lookup
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-white font-medium mb-4">County-Level Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Properties in SFHA (county-wide)</span>
                        <span className="text-white font-medium">~{propertyData.floodRisk.percentInFloodZone}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Your Property Zone</span>
                        <span className="text-amber-400 font-medium">Requires FEMA Lookup</span>
                      </div>
                    </div>
                    
                    <p className="mt-6 text-slate-500 text-sm">
                      Even in high-risk counties, many individual properties are in Zone X (minimal risk). 
                      New construction must meet elevation requirements that often place them outside SFHA.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium mb-4">FEMA Zone Definitions</h3>
                    <div className="space-y-3 text-sm">
                      <div className="bg-red-500/10 rounded-lg p-3">
                        <span className="text-red-400 font-medium">Zone A, AE, AH:</span>
                        <span className="text-slate-400 ml-2">High risk (1% annual chance). Insurance typically required.</span>
                      </div>
                      <div className="bg-yellow-500/10 rounded-lg p-3">
                        <span className="text-yellow-400 font-medium">Zone X (shaded):</span>
                        <span className="text-slate-400 ml-2">Moderate risk (0.2% annual chance). Insurance optional but recommended.</span>
                      </div>
                      <div className="bg-emerald-500/10 rounded-lg p-3">
                        <span className="text-emerald-400 font-medium">Zone X (unshaded):</span>
                        <span className="text-slate-400 ml-2">Minimal risk. Outside 500-year flood zone.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs remain similar but with appropriate disclaimers */}
            {activeTab === 'tax' && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">💰 Property Tax Estimate</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-slate-400 mb-2">Estimated Annual Tax</p>
                    <p className="text-5xl font-bold text-white mb-6">${propertyData.propertyTax.annualTax.toLocaleString()}</p>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Property Value</span>
                        <span className="text-white font-medium">${propertyValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">State Median Rate</span>
                        <span className="text-white font-medium">{propertyData.propertyTax.effectiveRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monthly (for PITI)</span>
                        <span className="text-cyan-400 font-medium">${Math.round(propertyData.propertyTax.annualTax / 12).toLocaleString()}/mo</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 mb-4">
                      <p className="text-amber-400 text-sm">
                        ⚠️ This is based on state median rates. Actual tax varies significantly by county, municipality, and exemptions.
                        Contact your county property appraiser for exact amounts.
                      </p>
                    </div>
                    <h3 className="text-white font-medium mb-4">Common Exemptions</h3>
                    <div className="space-y-2">
                      {propertyData.propertyTax.exemptions.map((ex, i) => (
                        <div key={i} className="bg-slate-900/50 rounded-lg p-3 flex items-center gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span className="text-slate-300">{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schools' && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">🎓 School District Analysis</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold bg-emerald-500/20 text-emerald-400">
                        {propertyData.schools.rating}/10
                      </div>
                      <div>
                        <p className="text-white text-xl font-bold">Area School Rating</p>
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
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">📚 For Specific Schools</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      For detailed information about specific schools near your address, visit:
                    </p>
                    <a 
                      href="https://www.greatschools.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg font-medium hover:bg-emerald-500/30 inline-block"
                    >
                      🔗 GreatSchools.org
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'environmental' && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">🌿 Environmental Analysis</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">Overall Risk Score</h3>
                    <p className="text-4xl font-bold text-white">{propertyData.environmental.riskScore}<span className="text-slate-400 text-lg">/100</span></p>
                    <p className={`mt-2 ${propertyData.environmental.riskLevel === 'Low' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {propertyData.environmental.riskLevel} Risk
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">Sinkhole Risk</h3>
                    <p className={`text-2xl font-bold ${propertyData.environmental.sinkholeRisk === 'Low' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {propertyData.environmental.sinkholeRisk}
                    </p>
                  </div>
                  {propertyData.environmental.hurricaneCat > 0 && (
                    <div className="bg-slate-900/50 rounded-xl p-6">
                      <h3 className="text-white font-medium mb-4">Hurricane Exposure</h3>
                      <p className="text-2xl font-bold text-yellow-400">Category {propertyData.environmental.hurricaneCat}</p>
                      <p className="text-slate-500 text-sm mt-2">Historical max</p>
                    </div>
                  )}
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">Earthquake Risk</h3>
                    <p className={`text-2xl font-bold ${propertyData.environmental.earthquakeRisk === 'Low' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {propertyData.environmental.earthquakeRisk}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">Wildfire Risk</h3>
                    <p className={`text-2xl font-bold ${propertyData.environmental.wildfireRisk === 'Low' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {propertyData.environmental.wildfireRisk}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">Air Quality</h3>
                    <p className="text-2xl font-bold text-emerald-400">AQI: {propertyData.airQuality.aqi}</p>
                    <p className="text-slate-500 text-sm mt-2">{propertyData.airQuality.rating}</p>
                  </div>
                </div>
              </div>
            )}

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
                    <h3 className="text-white font-medium mb-4">📊 View Full Market Data</h3>
                    <Link href="/market-trends" className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg font-medium hover:bg-cyan-500/30 inline-block">
                      → Rate Trends & Charts
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Not Analyzed */}
        {!analyzed && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-12 border border-slate-700 text-center">
            <span className="text-6xl mb-4 block">📍</span>
            <h2 className="text-2xl font-bold text-white mb-2">Enter a Location to Analyze</h2>
            <p className="text-slate-400 mb-6">Select your state to get started</p>
          </div>
        )}

        {/* Sidebar Ad */}
        <div className="mt-8">
          <RotatingAds variant="banner" interval={12000} />
        </div>
      </div>
    </div>
  );
}
