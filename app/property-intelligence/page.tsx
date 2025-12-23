// CR AudioViz AI - Mortgage Rate Monitor
// PROPERTY INTELLIGENCE PAGE - Complete Location Analysis
// December 22, 2025

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationData {
  schools: any;
  propertyTax: any;
  environmental: any;
  floodRisk: any;
  marketTrends: any;
}

const FLORIDA_COUNTIES = [
  'LEE', 'COLLIER', 'MIAMI-DADE', 'BROWARD', 'PALM-BEACH',
  'HILLSBOROUGH', 'PINELLAS', 'ORANGE', 'DUVAL', 'POLK',
  'SARASOTA', 'SEMINOLE'
];

export default function PropertyIntelligence() {
  const [county, setCounty] = useState('LEE');
  const [propertyValue, setPropertyValue] = useState(450000);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LocationData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, [county]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [schools, propertyTax, environmental, floodRisk, marketTrends] = await Promise.all([
        fetch(`/api/schools?county=${county}`).then(r => r.json()),
        fetch(`/api/property-tax?county=${county}`).then(r => r.json()),
        fetch(`/api/environmental?county=${county}`).then(r => r.json()),
        fetch(`/api/flood-risk?county=${county}`).then(r => r.json()),
        fetch(`/api/market-trends?state=FL`).then(r => r.json()),
      ]);

      setData({
        schools: schools.success ? schools : null,
        propertyTax: propertyTax.success ? propertyTax : null,
        environmental: environmental.success ? environmental : null,
        floodRisk: floodRisk.success ? floodRisk : null,
        marketTrends: marketTrends.success ? marketTrends : null,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getScoreColor = (score: number, max: number = 100) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 60) return 'text-green-400';
    if (pct >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-emerald-400 bg-emerald-500/20';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20';
      case 'elevated': return 'text-orange-400 bg-orange-500/20';
      case 'high': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  // Calculate total hidden costs
  const calculateHiddenCosts = () => {
    if (!data) return null;
    
    let annual = 0;
    const items: { name: string; cost: number; type: 'required' | 'recommended' }[] = [];

    // Property tax
    if (data.propertyTax?.county) {
      const taxAmount = Math.round(propertyValue * (data.propertyTax.county.effectiveRate / 100));
      annual += taxAmount;
      items.push({ name: 'Property Tax', cost: taxAmount, type: 'required' });
    }

    // Flood insurance (if applicable)
    if (data.floodRisk?.county?.requiresFloodInsurance) {
      const floodCost = data.floodRisk.county.estimatedAnnualPremium || 1500;
      annual += floodCost;
      items.push({ name: 'Flood Insurance', cost: floodCost, type: 'required' });
    }

    // Environmental insurance
    if (data.environmental?.insuranceImpact) {
      annual += data.environmental.insuranceImpact.totalAnnual;
      data.environmental.insuranceImpact.additionalCosts?.forEach((cost: any) => {
        items.push({ name: cost.type, cost: cost.annual, type: cost.required ? 'required' : 'recommended' });
      });
    }

    return { annual, monthly: Math.round(annual / 12), items };
  };

  const hiddenCosts = calculateHiddenCosts();

  const TabButton = ({ id, label, icon }: { id: string; label: string; icon: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
        ${activeTab === id 
          ? 'bg-cyan-600 text-white' 
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
    >
      <span>{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Property Intelligence
          </h1>
          <p className="text-cyan-100 text-lg">
            Schools • Taxes • Flood Risk • Environmental • Market Trends — All in One View
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-slate-300 font-medium mb-2 block">Florida County</label>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:border-cyan-500 outline-none"
              >
                {FLORIDA_COUNTIES.map(c => (
                  <option key={c} value={c}>{c.replace('-', ' ')} County</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-300 font-medium mb-2 block">Property Value</label>
              <input
                type="number"
                value={propertyValue}
                onChange={(e) => setPropertyValue(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3 px-6 rounded-xl font-bold hover:from-cyan-500 hover:to-teal-500 transition-all disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Analyze Location'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Costs Alert */}
      {hiddenCosts && hiddenCosts.annual > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl p-6 border border-red-500/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                  ⚠️ Hidden Annual Costs
                </h3>
                <p className="text-slate-300 mt-1">
                  Beyond your mortgage, budget for these location-specific expenses
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{formatCurrency(hiddenCosts.annual)}/year</p>
                <p className="text-slate-400">{formatCurrency(hiddenCosts.monthly)}/month extra</p>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4 mt-4">
              {hiddenCosts.items.map((item, i) => (
                <div key={i} className={`rounded-xl p-3 ${item.type === 'required' ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
                  <p className="text-slate-400 text-xs uppercase">{item.type}</p>
                  <p className="text-white font-medium">{item.name}</p>
                  <p className={`font-bold ${item.type === 'required' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {formatCurrency(item.cost)}/yr
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="flex flex-wrap gap-2">
          <TabButton id="overview" label="Overview" icon="📊" />
          <TabButton id="schools" label="Schools" icon="🏫" />
          <TabButton id="taxes" label="Property Tax" icon="💰" />
          <TabButton id="flood" label="Flood Risk" icon="🌊" />
          <TabButton id="environmental" label="Environmental" icon="🌿" />
          <TabButton id="market" label="Market Trends" icon="📈" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="bg-slate-800/50 rounded-2xl p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-400">Loading property intelligence...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && data && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/* Schools Card */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">🏫 Schools</h3>
                    {data.schools?.district && (
                      <span className={`text-2xl font-bold ${getScoreColor(data.schools.district.overallRating, 10)}`}>
                        {data.schools.district.overallRating}/10
                      </span>
                    )}
                  </div>
                  {data.schools?.district && (
                    <>
                      <p className="text-slate-300 mb-2">
                        Grade: <span className="font-bold text-white">{data.schools.district.letterGrade}</span>
                      </p>
                      <p className="text-slate-300 mb-2">
                        Graduation: <span className="text-emerald-400 font-medium">{data.schools.district.graduationRate}%</span>
                      </p>
                      <p className="text-slate-300">
                        Student-Teacher: <span className="text-white">{data.schools.district.studentTeacherRatio}:1</span>
                      </p>
                    </>
                  )}
                </div>

                {/* Property Tax Card */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">💰 Property Tax</h3>
                  </div>
                  {data.propertyTax?.county && (
                    <>
                      <p className="text-3xl font-bold text-white mb-2">
                        {formatCurrency(Math.round(propertyValue * (data.propertyTax.county.effectiveRate / 100)))}
                        <span className="text-slate-400 text-lg font-normal">/yr</span>
                      </p>
                      <p className="text-slate-300 mb-2">
                        Effective Rate: <span className="text-cyan-400 font-medium">{data.propertyTax.county.effectiveRate}%</span>
                      </p>
                      <p className="text-slate-300">
                        Millage: <span className="text-white">{data.propertyTax.county.millageRate}</span>
                      </p>
                    </>
                  )}
                </div>

                {/* Flood Risk Card */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">🌊 Flood Risk</h3>
                    {data.floodRisk?.county && (
                      <span className={`px-3 py-1 rounded-lg font-medium ${getRiskColor(data.floodRisk.county.overallRisk)}`}>
                        {data.floodRisk.county.overallRisk}
                      </span>
                    )}
                  </div>
                  {data.floodRisk?.county && (
                    <>
                      <p className="text-slate-300 mb-2">
                        Properties in Flood Zone: <span className="text-white">{data.floodRisk.county.propertiesInFloodZone}%</span>
                      </p>
                      <p className="text-slate-300 mb-2">
                        Insurance Required: <span className={data.floodRisk.county.requiresFloodInsurance ? 'text-red-400' : 'text-emerald-400'}>
                          {data.floodRisk.county.requiresFloodInsurance ? 'Likely Yes' : 'Likely No'}
                        </span>
                      </p>
                      {data.floodRisk.county.estimatedAnnualPremium && (
                        <p className="text-slate-300">
                          Est. Premium: <span className="text-yellow-400 font-medium">
                            {formatCurrency(data.floodRisk.county.estimatedAnnualPremium)}/yr
                          </span>
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Environmental Card */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">🌿 Environmental</h3>
                    {data.environmental?.county && (
                      <span className={`px-3 py-1 rounded-lg font-medium ${getRiskColor(data.environmental.county.riskLevel)}`}>
                        {data.environmental.county.riskLevel}
                      </span>
                    )}
                  </div>
                  {data.environmental?.county && (
                    <>
                      <p className="text-slate-300 mb-2">
                        Risk Score: <span className="text-white">{data.environmental.county.overallRiskScore}/100</span>
                      </p>
                      <p className="text-slate-300 mb-2">
                        Sinkhole Risk: <span className={getRiskColor(data.environmental.county.sinkholes?.risk).split(' ')[0]}>
                          {data.environmental.county.sinkholes?.risk}
                        </span>
                      </p>
                      <p className="text-slate-300">
                        Hurricane Cat: <span className="text-white">{data.environmental.county.hurricaneRisk?.category}</span>
                      </p>
                    </>
                  )}
                </div>

                {/* Market Trends Card */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">📈 Market Trends</h3>
                  </div>
                  {data.marketTrends?.state && (
                    <>
                      <p className="text-slate-300 mb-2">
                        FL YoY Change: <span className={data.marketTrends.state.yearOverYearChange > 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {data.marketTrends.state.yearOverYearChange > 0 ? '+' : ''}{data.marketTrends.state.yearOverYearChange}%
                        </span>
                      </p>
                      <p className="text-slate-300 mb-2">
                        Median Home: <span className="text-white">{formatCurrency(data.marketTrends.state.medianHomePrice)}</span>
                      </p>
                      <p className="text-slate-300">
                        5-Year Growth: <span className="text-cyan-400 font-medium">+{data.marketTrends.state.fiveYearChange}%</span>
                      </p>
                    </>
                  )}
                </div>

                {/* Air Quality Card */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">🌬️ Air Quality</h3>
                    {data.environmental?.county?.airQuality && (
                      <span className={`px-3 py-1 rounded-lg font-medium ${
                        data.environmental.county.airQuality.aqi <= 50 ? 'text-emerald-400 bg-emerald-500/20' :
                        data.environmental.county.airQuality.aqi <= 100 ? 'text-yellow-400 bg-yellow-500/20' :
                        'text-red-400 bg-red-500/20'
                      }`}>
                        AQI: {data.environmental.county.airQuality.aqi}
                      </span>
                    )}
                  </div>
                  {data.environmental?.county?.airQuality && (
                    <>
                      <p className="text-slate-300 mb-2">
                        Rating: <span className="text-white">{data.environmental.county.airQuality.rating}</span>
                      </p>
                      <p className="text-slate-300 mb-2">
                        Ozone Days: <span className="text-white">{data.environmental.county.airQuality.ozoneDays}/yr</span>
                      </p>
                      <p className="text-slate-300">
                        PM2.5 Days: <span className="text-white">{data.environmental.county.airQuality.pm25Days}/yr</span>
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Schools Tab */}
            {activeTab === 'schools' && data?.schools && (
              <motion.div
                key="schools"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h2 className="text-2xl font-bold text-white mb-6">{data.schools.district?.name || county} School District</h2>
                  
                  <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                      <p className="text-slate-400 text-sm">Overall Rating</p>
                      <p className={`text-4xl font-bold ${getScoreColor(data.schools.district?.overallRating || 0, 10)}`}>
                        {data.schools.district?.overallRating}/10
                      </p>
                    </div>
                    <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                      <p className="text-slate-400 text-sm">Letter Grade</p>
                      <p className="text-4xl font-bold text-white">{data.schools.district?.letterGrade}</p>
                    </div>
                    <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                      <p className="text-slate-400 text-sm">Graduation Rate</p>
                      <p className="text-4xl font-bold text-emerald-400">{data.schools.district?.graduationRate}%</p>
                    </div>
                    <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                      <p className="text-slate-400 text-sm">College Readiness</p>
                      <p className="text-4xl font-bold text-cyan-400">{data.schools.district?.collegeReadiness}%</p>
                    </div>
                  </div>

                  {data.schools.district?.topSchools && (
                    <>
                      <h3 className="text-lg font-bold text-white mb-4">Top Schools in District</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {data.schools.district.topSchools.map((school: any, i: number) => (
                          <div key={i} className="bg-slate-900/50 rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{school.name}</p>
                              <p className="text-slate-400 text-sm">{school.type}</p>
                            </div>
                            <span className={`text-2xl font-bold ${getScoreColor(school.rating, 10)}`}>
                              {school.rating}/10
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Taxes Tab */}
            {activeTab === 'taxes' && data?.propertyTax && (
              <motion.div
                key="taxes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h2 className="text-2xl font-bold text-white mb-6">Property Tax Analysis</h2>
                  
                  <div className="bg-gradient-to-r from-cyan-600/20 to-teal-600/20 rounded-xl p-6 mb-6">
                    <p className="text-slate-300 mb-2">Estimated Annual Tax for {formatCurrency(propertyValue)} Home</p>
                    <p className="text-4xl font-bold text-white">
                      {formatCurrency(Math.round(propertyValue * (data.propertyTax.county?.effectiveRate / 100)))}
                    </p>
                    <p className="text-slate-400 mt-2">
                      {formatCurrency(Math.round(propertyValue * (data.propertyTax.county?.effectiveRate / 100) / 12))}/month
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <p className="text-slate-400 text-sm">Millage Rate</p>
                      <p className="text-2xl font-bold text-white">{data.propertyTax.county?.millageRate}</p>
                      <p className="text-slate-500 text-xs">per $1,000 of assessed value</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <p className="text-slate-400 text-sm">Effective Rate</p>
                      <p className="text-2xl font-bold text-cyan-400">{data.propertyTax.county?.effectiveRate}%</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <p className="text-slate-400 text-sm">Median Tax Bill</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(data.propertyTax.county?.medianTaxBill || 0)}</p>
                    </div>
                  </div>

                  {data.propertyTax.county?.exemptions && (
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-white mb-4">Available Exemptions</h3>
                      <div className="space-y-3">
                        {data.propertyTax.county.exemptions.map((ex: any, i: number) => (
                          <div key={i} className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-white font-medium">{ex.name}</p>
                                <p className="text-slate-400 text-sm">{ex.description}</p>
                              </div>
                              <p className="text-emerald-400 font-bold">Save {formatCurrency(ex.savings)}/yr</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Flood Tab */}
            {activeTab === 'flood' && data?.floodRisk && (
              <motion.div
                key="flood"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h2 className="text-2xl font-bold text-white mb-6">Flood Risk Assessment</h2>
                  
                  <div className={`rounded-xl p-6 mb-6 ${getRiskColor(data.floodRisk.county?.overallRisk)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold">Overall Flood Risk</p>
                        <p className="text-2xl font-bold uppercase">{data.floodRisk.county?.overallRisk}</p>
                      </div>
                      <span className="text-6xl">🌊</span>
                    </div>
                  </div>

                  {data.floodRisk.county && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-slate-900/50 rounded-xl p-4">
                        <p className="text-slate-400 text-sm mb-2">Properties in Flood Zone</p>
                        <p className="text-3xl font-bold text-white">{data.floodRisk.county.propertiesInFloodZone}%</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-xl p-4">
                        <p className="text-slate-400 text-sm mb-2">Estimated Insurance</p>
                        <p className="text-3xl font-bold text-yellow-400">
                          {formatCurrency(data.floodRisk.county.estimatedAnnualPremium || 0)}/yr
                        </p>
                      </div>
                    </div>
                  )}

                  {data.floodRisk.alerts && data.floodRisk.alerts.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-white mb-4">Alerts & Recommendations</h3>
                      <div className="space-y-3">
                        {data.floodRisk.alerts.map((alert: string, i: number) => (
                          <div key={i} className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                            <p className="text-yellow-300">{alert}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Environmental Tab */}
            {activeTab === 'environmental' && data?.environmental && (
              <motion.div
                key="environmental"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h2 className="text-2xl font-bold text-white mb-6">Environmental Analysis</h2>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className={`rounded-xl p-4 ${getRiskColor(data.environmental.county?.sinkholes?.risk)}`}>
                      <p className="text-sm opacity-80">Sinkhole Risk</p>
                      <p className="text-2xl font-bold uppercase">{data.environmental.county?.sinkholes?.risk}</p>
                    </div>
                    <div className={`rounded-xl p-4 ${
                      data.environmental.county?.radon?.zone === 1 ? 'bg-red-500/20 text-red-400' :
                      data.environmental.county?.radon?.zone === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <p className="text-sm opacity-80">Radon Zone</p>
                      <p className="text-2xl font-bold">{data.environmental.county?.radon?.risk}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <p className="text-slate-400 text-sm">Hurricane Category</p>
                      <p className="text-2xl font-bold text-white">{data.environmental.county?.hurricaneRisk?.category}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <p className="text-slate-400 text-sm">Superfund Sites</p>
                      <p className="text-2xl font-bold text-white">{data.environmental.county?.superfundSites?.count}</p>
                    </div>
                  </div>

                  {data.environmental.alerts && (
                    <div className="space-y-3">
                      {data.environmental.alerts.alerts?.map((alert: string, i: number) => (
                        <div key={i} className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30">
                          <p className="text-orange-300">{alert}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Market Tab */}
            {activeTab === 'market' && data?.marketTrends && (
              <motion.div
                key="market"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h2 className="text-2xl font-bold text-white mb-6">Florida Market Trends</h2>
                  
                  <div className="grid md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-sm">Median Home Price</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(data.marketTrends.state?.medianHomePrice || 0)}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-sm">Year-over-Year</p>
                      <p className={`text-2xl font-bold ${(data.marketTrends.state?.yearOverYearChange || 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(data.marketTrends.state?.yearOverYearChange || 0) > 0 ? '+' : ''}{data.marketTrends.state?.yearOverYearChange}%
                      </p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-sm">5-Year Growth</p>
                      <p className="text-2xl font-bold text-cyan-400">+{data.marketTrends.state?.fiveYearChange}%</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-sm">HPI Index</p>
                      <p className="text-2xl font-bold text-white">{data.marketTrends.state?.currentIndex}</p>
                    </div>
                  </div>

                  {data.marketTrends.state?.outlook && (
                    <div className={`rounded-xl p-6 ${
                      data.marketTrends.state.outlook.direction === 'bullish' ? 'bg-emerald-500/10 border border-emerald-500/30' :
                      data.marketTrends.state.outlook.direction === 'bearish' ? 'bg-red-500/10 border border-red-500/30' :
                      'bg-yellow-500/10 border border-yellow-500/30'
                    }`}>
                      <h3 className="text-lg font-bold text-white mb-2">Market Outlook</h3>
                      <p className="text-slate-300">{data.marketTrends.state.outlook.summary}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
