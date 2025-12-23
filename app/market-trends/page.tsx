// CR AudioViz AI - Mortgage Rate Monitor
// MARKET TRENDS PAGE - Rate history and projections
// December 22, 2025

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RateHistory {
  date: string;
  rate30yr: number;
  rate15yr: number;
}

interface MarketData {
  currentRates: {
    thirtyYear: { rate: number; weeklyChange: number };
    fifteenYear: { rate: number; weeklyChange: number };
  };
  historicalRates: RateHistory[];
  stateData: {
    state: string;
    yearOverYearChange: number;
    medianHomePrice: number;
    currentIndex: number;
  };
  metros: {
    name: string;
    yearOverYearChange: number;
    medianPrice: number;
  }[];
}

export default function MarketTrends() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MarketData | null>(null);
  const [selectedState, setSelectedState] = useState('FL');

  useEffect(() => {
    fetchData();
  }, [selectedState]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ratesRes, trendsRes] = await Promise.all([
        fetch('/api/mortgage-rates'),
        fetch(`/api/market-trends?state=${selectedState}`),
      ]);
      
      const ratesData = await ratesRes.json();
      const trendsData = await trendsRes.json();

      if (ratesData.success && trendsData.success) {
        setData({
          currentRates: ratesData.rates,
          historicalRates: ratesData.history || [],
          stateData: trendsData.state,
          metros: trendsData.metros || [],
        });
      }
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

  // Simple chart visualization
  const RateChart = ({ history }: { history: RateHistory[] }) => {
    if (!history.length) return null;
    
    const maxRate = Math.max(...history.map(h => h.rate30yr)) + 0.5;
    const minRate = Math.min(...history.map(h => h.rate30yr)) - 0.5;
    const range = maxRate - minRate;

    return (
      <div className="relative h-64 mt-6">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-400">
          <span>{maxRate.toFixed(1)}%</span>
          <span>{((maxRate + minRate) / 2).toFixed(1)}%</span>
          <span>{minRate.toFixed(1)}%</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-14 h-56 relative border-l border-b border-slate-700">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-slate-800"
                style={{ top: `${i * 50}%` }}
              />
            ))}
          </div>
          
          {/* Data points and line */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Area fill */}
            <path
              d={`
                M 0 ${((maxRate - history[0].rate30yr) / range) * 100}%
                ${history.map((h, i) => {
                  const x = (i / (history.length - 1)) * 100;
                  const y = ((maxRate - h.rate30yr) / range) * 100;
                  return `L ${x}% ${y}%`;
                }).join(' ')}
                L 100% 100%
                L 0 100%
                Z
              `}
              fill="url(#rateGradient)"
            />
            
            {/* Line */}
            <path
              d={`
                M 0 ${((maxRate - history[0].rate30yr) / range) * 100}%
                ${history.map((h, i) => {
                  const x = (i / (history.length - 1)) * 100;
                  const y = ((maxRate - h.rate30yr) / range) * 100;
                  return `L ${x}% ${y}%`;
                }).join(' ')}
              `}
              fill="none"
              stroke="rgb(16, 185, 129)"
              strokeWidth="2"
            />
          </svg>
          
          {/* Data point dots */}
          <div className="absolute inset-0 flex justify-between items-end">
            {history.map((h, i) => {
              const y = ((maxRate - h.rate30yr) / range) * 100;
              return (
                <div
                  key={i}
                  className="relative group"
                  style={{ position: 'absolute', left: `${(i / (history.length - 1)) * 100}%`, bottom: `${100 - y}%` }}
                >
                  <div className="w-2 h-2 bg-emerald-400 rounded-full -translate-x-1 -translate-y-1 group-hover:scale-150 transition-transform" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {h.rate30yr}% • {h.date}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="ml-14 flex justify-between text-xs text-slate-400 mt-2">
          <span>{history[0]?.date}</span>
          <span>{history[Math.floor(history.length / 2)]?.date}</span>
          <span>{history[history.length - 1]?.date}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Market Trends
          </h1>
          <p className="text-indigo-100 text-lg">
            Rate history, housing prices, and market analysis
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-slate-800/50 rounded-2xl p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-400">Loading market data...</p>
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Current Rates */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">30-Year Fixed</h2>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    data.currentRates.thirtyYear.weeklyChange < 0 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : data.currentRates.thirtyYear.weeklyChange > 0
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {data.currentRates.thirtyYear.weeklyChange > 0 ? '+' : ''}
                    {data.currentRates.thirtyYear.weeklyChange}% weekly
                  </span>
                </div>
                <p className="text-5xl font-bold text-white mb-2">
                  {data.currentRates.thirtyYear.rate}%
                </p>
                <p className="text-slate-400">National average rate</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">15-Year Fixed</h2>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    data.currentRates.fifteenYear.weeklyChange < 0 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : data.currentRates.fifteenYear.weeklyChange > 0
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {data.currentRates.fifteenYear.weeklyChange > 0 ? '+' : ''}
                    {data.currentRates.fifteenYear.weeklyChange}% weekly
                  </span>
                </div>
                <p className="text-5xl font-bold text-white mb-2">
                  {data.currentRates.fifteenYear.rate}%
                </p>
                <p className="text-slate-400">National average rate</p>
              </motion.div>
            </div>

            {/* Rate History Chart */}
            {data.historicalRates.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white">Rate History (Last 90 Days)</h2>
                <RateChart history={data.historicalRates} />
              </div>
            )}

            {/* State Market Data */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Housing Market</h2>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-slate-900 border border-slate-600 rounded-lg py-2 px-4 text-white"
                >
                  <option value="FL">Florida</option>
                  <option value="TX">Texas</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="GA">Georgia</option>
                </select>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">Median Home Price</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(data.stateData.medianHomePrice)}</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">Year-over-Year</p>
                  <p className={`text-3xl font-bold ${
                    data.stateData.yearOverYearChange > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {data.stateData.yearOverYearChange > 0 ? '+' : ''}{data.stateData.yearOverYearChange}%
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">FHFA House Price Index</p>
                  <p className="text-3xl font-bold text-white">{data.stateData.currentIndex}</p>
                </div>
              </div>

              {/* Metro Areas */}
              {data.metros.length > 0 && (
                <>
                  <h3 className="text-lg font-bold text-white mb-4">Metro Areas</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.metros.map((metro, i) => (
                      <div key={i} className="bg-slate-900/50 rounded-xl p-4">
                        <p className="text-white font-medium">{metro.name}</p>
                        <div className="flex justify-between mt-2">
                          <span className="text-slate-400 text-sm">{formatCurrency(metro.medianPrice)}</span>
                          <span className={`text-sm font-medium ${
                            metro.yearOverYearChange > 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {metro.yearOverYearChange > 0 ? '+' : ''}{metro.yearOverYearChange}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Market Insights */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-2xl p-6 border border-indigo-500/30">
              <h2 className="text-xl font-bold text-white mb-4">📊 Market Insights</h2>
              <div className="space-y-3 text-slate-300">
                <p>
                  • Mortgage rates have {data.currentRates.thirtyYear.weeklyChange < 0 ? 'decreased' : 'increased'} by 
                  {' '}{Math.abs(data.currentRates.thirtyYear.weeklyChange)}% this week.
                </p>
                <p>
                  • Florida home prices are up {data.stateData.yearOverYearChange}% year-over-year, 
                  with a median price of {formatCurrency(data.stateData.medianHomePrice)}.
                </p>
                <p>
                  • {data.currentRates.thirtyYear.rate < 7 
                    ? 'Rates are relatively favorable for buyers considering a purchase.' 
                    : 'Higher rates are impacting affordability - consider waiting for a rate drop.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-2xl p-12 text-center">
            <p className="text-slate-400">Unable to load market data</p>
          </div>
        )}
      </div>
    </div>
  );
}
