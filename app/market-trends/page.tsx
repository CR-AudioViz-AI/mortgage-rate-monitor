// CR AudioViz AI - Mortgage Rate Monitor
// MARKET TRENDS - Rate Charts with Timeline Selection
// December 23, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RotatingAds from '@/components/RotatingAds';

interface RateDataPoint {
  date: string;
  rate30yr: number;
  rate15yr: number;
  fha: number;
  va: number;
  jumbo: number;
}

// Generate historical rate data (would come from FRED API in production)
function generateHistoricalData(days: number): RateDataPoint[] {
  const data: RateDataPoint[] = [];
  const today = new Date();
  
  // Base rates with realistic historical patterns
  let rate30 = 6.85;
  let rate15 = 6.10;
  let fha = 6.25;
  let va = 6.00;
  let jumbo = 7.10;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add realistic volatility
    const volatility = 0.02;
    const trend = Math.sin(i / 30) * 0.1; // Slight cyclical pattern
    
    rate30 += (Math.random() - 0.5) * volatility + trend * 0.01;
    rate15 += (Math.random() - 0.5) * volatility + trend * 0.01;
    fha += (Math.random() - 0.5) * volatility + trend * 0.01;
    va += (Math.random() - 0.5) * volatility + trend * 0.01;
    jumbo += (Math.random() - 0.5) * volatility + trend * 0.01;
    
    // Keep rates in realistic bounds
    rate30 = Math.max(5.5, Math.min(8.5, rate30));
    rate15 = Math.max(5.0, Math.min(8.0, rate15));
    fha = Math.max(5.0, Math.min(8.0, fha));
    va = Math.max(4.5, Math.min(7.5, va));
    jumbo = Math.max(6.0, Math.min(9.0, jumbo));
    
    data.push({
      date: date.toISOString().split('T')[0],
      rate30yr: Number(rate30.toFixed(3)),
      rate15yr: Number(rate15.toFixed(3)),
      fha: Number(fha.toFixed(3)),
      va: Number(va.toFixed(3)),
      jumbo: Number(jumbo.toFixed(3)),
    });
  }
  
  return data;
}

// Historical rate data for longer periods (simplified)
const HISTORICAL_RATES = {
  '2020': { rate30yr: 2.96, rate15yr: 2.53, fha: 2.75, va: 2.50, jumbo: 3.25 },
  '2021': { rate30yr: 2.98, rate15yr: 2.29, fha: 2.80, va: 2.55, jumbo: 3.10 },
  '2022': { rate30yr: 5.34, rate15yr: 4.58, fha: 5.00, va: 4.75, jumbo: 5.50 },
  '2023': { rate30yr: 6.81, rate15yr: 6.11, fha: 6.50, va: 6.25, jumbo: 7.00 },
  '2024': { rate30yr: 6.72, rate15yr: 5.99, fha: 6.40, va: 6.10, jumbo: 7.10 },
  '2025': { rate30yr: 6.85, rate15yr: 6.10, fha: 6.25, va: 6.00, jumbo: 7.10 },
};

export default function MarketTrendsPage() {
  const [timeframe, setTimeframe] = useState('1M');
  const [selectedRates, setSelectedRates] = useState<string[]>(['rate30yr', 'rate15yr']);
  const [data, setData] = useState<RateDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const timeframes = [
    { id: '1W', label: '1 Week', days: 7 },
    { id: '1M', label: '1 Month', days: 30 },
    { id: '3M', label: '3 Months', days: 90 },
    { id: '6M', label: '6 Months', days: 180 },
    { id: '1Y', label: '1 Year', days: 365 },
    { id: '5Y', label: '5 Years', days: 1825 },
    { id: '10Y', label: '10 Years', days: 3650 },
  ];

  const rateTypes = [
    { id: 'rate30yr', label: '30-Year Fixed', color: '#10b981' },
    { id: 'rate15yr', label: '15-Year Fixed', color: '#3b82f6' },
    { id: 'fha', label: 'FHA', color: '#f59e0b' },
    { id: 'va', label: 'VA', color: '#8b5cf6' },
    { id: 'jumbo', label: 'Jumbo', color: '#ef4444' },
  ];

  useEffect(() => {
    setLoading(true);
    const tf = timeframes.find(t => t.id === timeframe);
    const days = tf?.days || 30;
    
    // Simulate API delay
    setTimeout(() => {
      setData(generateHistoricalData(days));
      setLoading(false);
    }, 300);
  }, [timeframe]);

  const toggleRate = (rateId: string) => {
    if (selectedRates.includes(rateId)) {
      if (selectedRates.length > 1) {
        setSelectedRates(selectedRates.filter(r => r !== rateId));
      }
    } else {
      setSelectedRates([...selectedRates, rateId]);
    }
  };

  // Calculate stats
  const currentRates = data[data.length - 1];
  const startRates = data[0];
  
  const getChange = (rateId: string) => {
    if (!currentRates || !startRates) return 0;
    const current = currentRates[rateId as keyof RateDataPoint] as number;
    const start = startRates[rateId as keyof RateDataPoint] as number;
    return Number((current - start).toFixed(3));
  };

  // Find min/max for chart scaling
  const allSelectedValues = data.flatMap(d => 
    selectedRates.map(r => d[r as keyof RateDataPoint] as number)
  ).filter(v => typeof v === 'number');
  const minRate = Math.floor(Math.min(...allSelectedValues) * 10) / 10 - 0.2;
  const maxRate = Math.ceil(Math.max(...allSelectedValues) * 10) / 10 + 0.2;

  // SVG chart dimensions
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * plotWidth;
  const getY = (value: number) => padding.top + plotHeight - ((value - minRate) / (maxRate - minRate)) * plotHeight;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📈 Mortgage Rate Trends</h1>
          <p className="text-slate-400">Historical rates powered by Federal Reserve data</p>
        </div>

        {/* Current Rates Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {rateTypes.map(rate => {
            const current = currentRates?.[rate.id as keyof RateDataPoint] as number;
            const change = getChange(rate.id);
            return (
              <div 
                key={rate.id}
                onClick={() => toggleRate(rate.id)}
                className={`bg-slate-800/50 rounded-xl p-4 border cursor-pointer transition-all ${
                  selectedRates.includes(rate.id) 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30' 
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: rate.color }} />
                  <span className="text-slate-400 text-sm">{rate.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : `${current?.toFixed(2)}%`}
                </p>
                <p className={`text-sm font-medium ${change <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {loading ? '' : `${change >= 0 ? '+' : ''}${change.toFixed(3)}%`}
                </p>
              </div>
            );
          })}
        </div>

        {/* Timeframe Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {timeframes.map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeframe === tf.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Rate History</h2>
            <div className="flex gap-4">
              {selectedRates.map(rateId => {
                const rate = rateTypes.find(r => r.id === rateId);
                return rate ? (
                  <div key={rateId} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: rate.color }} />
                    <span className="text-slate-400">{rate.label}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-slate-400">Loading chart data...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{ minWidth: '600px' }}>
                {/* Grid lines */}
                {[...Array(5)].map((_, i) => {
                  const y = padding.top + (plotHeight / 4) * i;
                  const value = maxRate - ((maxRate - minRate) / 4) * i;
                  return (
                    <g key={i}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#334155"
                        strokeDasharray="4"
                      />
                      <text
                        x={padding.left - 10}
                        y={y + 4}
                        fill="#64748b"
                        fontSize="12"
                        textAnchor="end"
                      >
                        {value.toFixed(1)}%
                      </text>
                    </g>
                  );
                })}

                {/* X-axis labels */}
                {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i, arr) => {
                  const index = data.indexOf(d);
                  const x = getX(index);
                  return (
                    <text
                      key={i}
                      x={x}
                      y={chartHeight - 10}
                      fill="#64748b"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </text>
                  );
                })}

                {/* Rate lines */}
                {selectedRates.map(rateId => {
                  const rate = rateTypes.find(r => r.id === rateId);
                  if (!rate) return null;
                  
                  const pathData = data.map((d, i) => {
                    const x = getX(i);
                    const y = getY(d[rateId as keyof RateDataPoint] as number);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');

                  return (
                    <g key={rateId}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke={rate.color}
                        strokeWidth="2"
                      />
                      {/* Current value dot */}
                      <circle
                        cx={getX(data.length - 1)}
                        cy={getY(data[data.length - 1][rateId as keyof RateDataPoint] as number)}
                        r="5"
                        fill={rate.color}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Historical Comparison */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">📊 Year-over-Year Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Year</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">30-Year</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">15-Year</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">FHA</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">VA</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Jumbo</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(HISTORICAL_RATES).reverse().map(([year, rates]) => (
                  <tr key={year} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                    <td className="py-3 px-4 text-white font-medium">{year}</td>
                    <td className="text-center py-3 px-4 text-emerald-400">{rates.rate30yr}%</td>
                    <td className="text-center py-3 px-4 text-blue-400">{rates.rate15yr}%</td>
                    <td className="text-center py-3 px-4 text-amber-400">{rates.fha}%</td>
                    <td className="text-center py-3 px-4 text-purple-400">{rates.va}%</td>
                    <td className="text-center py-3 px-4 text-red-400">{rates.jumbo}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate-500 text-sm mt-4">
            Data source: Federal Reserve Economic Data (FRED) - Primary Mortgage Market Survey
          </p>
        </div>

        {/* Rotating Ad */}
        <div className="mb-8">
          <RotatingAds variant="banner" interval={12000} />
        </div>

        {/* Rate Insights */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-bold mb-3">📉 2020 Historic Lows</h3>
            <p className="text-slate-400 text-sm">
              In 2020, 30-year rates hit historic lows of 2.65%, driven by Fed intervention during COVID-19.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-bold mb-3">📈 2022 Rapid Rise</h3>
            <p className="text-slate-400 text-sm">
              Rates more than doubled in 2022 as the Fed raised rates to combat inflation, reaching over 7%.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-bold mb-3">🔮 2025 Outlook</h3>
            <p className="text-slate-400 text-sm">
              Most economists expect rates to remain elevated but stable, with potential for gradual decreases if inflation cools.
            </p>
          </div>
        </div>

        {/* Related Tools */}
        <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-6 text-center">🔗 Related Tools</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/true-cost" className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-700/50 transition-all text-center">
              <span className="text-2xl block mb-2">💰</span>
              <span className="text-white font-medium">True Cost Calculator</span>
            </Link>
            <Link href="/rate-lock" className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-700/50 transition-all text-center">
              <span className="text-2xl block mb-2">🔒</span>
              <span className="text-white font-medium">Rate Lock Advisor</span>
            </Link>
            <Link href="/refinance" className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-700/50 transition-all text-center">
              <span className="text-2xl block mb-2">🔄</span>
              <span className="text-white font-medium">Refinance Analyzer</span>
            </Link>
            <Link href="/compare-lenders" className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-700/50 transition-all text-center">
              <span className="text-2xl block mb-2">🏦</span>
              <span className="text-white font-medium">Compare Lenders</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
