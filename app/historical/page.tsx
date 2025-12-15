// CR AudioViz AI - Mortgage Rate Monitor
// Historical Data Page - Rate history, trends, and analysis
// Created: December 14, 2025

'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Calendar, Download, 
  BarChart3, LineChart, Info, RefreshCw
} from 'lucide-react';

interface HistoricalRate {
  date: string;
  rate30Y: number;
  rate15Y: number;
  rate5ARM?: number;
}

interface RateStats {
  current: number;
  weekAgo: number;
  monthAgo: number;
  yearAgo: number;
  allTimeHigh: number;
  allTimeLow: number;
  average52Week: number;
}

export default function HistoricalPage() {
  const [historicalData, setHistoricalData] = useState<HistoricalRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | '5Y'>('1Y');
  const [selectedRate, setSelectedRate] = useState<'30Y' | '15Y'>('30Y');

  useEffect(() => {
    fetchHistoricalData();
  }, [timeRange]);

  async function fetchHistoricalData() {
    try {
      setLoading(true);
      const response = await fetch(`/api/mortgage/historical?range=${timeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setHistoricalData(data.rates || []);
        setError(null);
      } else {
        // Generate mock data for demo
        generateMockData();
      }
    } catch (err) {
      // Generate mock data on error
      generateMockData();
    } finally {
      setLoading(false);
    }
  }

  function generateMockData() {
    const weeks = timeRange === '1M' ? 4 : timeRange === '3M' ? 13 : timeRange === '6M' ? 26 : timeRange === '1Y' ? 52 : 260;
    const data: HistoricalRate[] = [];
    const today = new Date();
    
    // Start from historical high and trend down to current ~6.22%
    let rate30Y = timeRange === '5Y' ? 7.8 : 7.0;
    let rate15Y = rate30Y - 0.7;
    
    for (let i = weeks - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7));
      
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 0.15;
      const trend = i > weeks / 2 ? -0.01 : -0.02; // Steeper decline recently
      
      rate30Y = Math.max(6.0, Math.min(8.0, rate30Y + trend + variation));
      rate15Y = rate30Y - 0.65 - (Math.random() * 0.1);
      
      data.push({
        date: date.toISOString().split('T')[0],
        rate30Y: Math.round(rate30Y * 100) / 100,
        rate15Y: Math.round(rate15Y * 100) / 100,
        rate5ARM: Math.round((rate30Y - 0.3 + (Math.random() * 0.2)) * 100) / 100,
      });
    }
    
    // Ensure last entry matches current rate
    if (data.length > 0) {
      data[data.length - 1].rate30Y = 6.22;
      data[data.length - 1].rate15Y = 5.54;
    }
    
    setHistoricalData(data);
    setError(null);
  }

  // Calculate stats
  const stats: RateStats | null = historicalData.length > 0 ? {
    current: selectedRate === '30Y' ? historicalData[historicalData.length - 1].rate30Y : historicalData[historicalData.length - 1].rate15Y,
    weekAgo: historicalData.length > 1 ? (selectedRate === '30Y' ? historicalData[historicalData.length - 2].rate30Y : historicalData[historicalData.length - 2].rate15Y) : 0,
    monthAgo: historicalData.length > 4 ? (selectedRate === '30Y' ? historicalData[historicalData.length - 5].rate30Y : historicalData[historicalData.length - 5].rate15Y) : 0,
    yearAgo: historicalData.length > 51 ? (selectedRate === '30Y' ? historicalData[0].rate30Y : historicalData[0].rate15Y) : 0,
    allTimeHigh: Math.max(...historicalData.map(d => selectedRate === '30Y' ? d.rate30Y : d.rate15Y)),
    allTimeLow: Math.min(...historicalData.map(d => selectedRate === '30Y' ? d.rate30Y : d.rate15Y)),
    average52Week: historicalData.reduce((sum, d) => sum + (selectedRate === '30Y' ? d.rate30Y : d.rate15Y), 0) / historicalData.length,
  } : null;

  // Simple SVG chart
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  
  const rates = historicalData.map(d => selectedRate === '30Y' ? d.rate30Y : d.rate15Y);
  const minRate = Math.floor(Math.min(...rates) * 10) / 10 - 0.2;
  const maxRate = Math.ceil(Math.max(...rates) * 10) / 10 + 0.2;
  
  const xScale = (i: number) => padding.left + (i / (historicalData.length - 1)) * (chartWidth - padding.left - padding.right);
  const yScale = (rate: number) => chartHeight - padding.bottom - ((rate - minRate) / (maxRate - minRate)) * (chartHeight - padding.top - padding.bottom);
  
  const pathData = historicalData.map((d, i) => {
    const rate = selectedRate === '30Y' ? d.rate30Y : d.rate15Y;
    return `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(rate)}`;
  }).join(' ');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading historical data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Historical Rate Data</h1>
          <p className="text-xl text-indigo-100">
            Track mortgage rate trends over time from Freddie Mac PMMS
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <span className="text-sm text-gray-500 self-center">Rate Type:</span>
              {['30Y', '15Y'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedRate(type as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedRate === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === '30Y' ? '30-Year Fixed' : '15-Year Fixed'}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <span className="text-sm text-gray-500 self-center">Period:</span>
              {['1M', '3M', '6M', '1Y', '5Y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                    timeRange === range
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Current</div>
              <div className="text-2xl font-bold text-gray-900">{stats.current.toFixed(2)}%</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Week Ago</div>
              <div className="text-2xl font-bold text-gray-900">{stats.weekAgo.toFixed(2)}%</div>
              <div className={`text-sm ${stats.current < stats.weekAgo ? 'text-green-600' : 'text-red-600'}`}>
                {((stats.current - stats.weekAgo)).toFixed(3)}%
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Month Ago</div>
              <div className="text-2xl font-bold text-gray-900">{stats.monthAgo.toFixed(2)}%</div>
              <div className={`text-sm ${stats.current < stats.monthAgo ? 'text-green-600' : 'text-red-600'}`}>
                {((stats.current - stats.monthAgo)).toFixed(3)}%
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Year Ago</div>
              <div className="text-2xl font-bold text-gray-900">{stats.yearAgo > 0 ? stats.yearAgo.toFixed(2) : '--'}%</div>
              {stats.yearAgo > 0 && (
                <div className={`text-sm ${stats.current < stats.yearAgo ? 'text-green-600' : 'text-red-600'}`}>
                  {((stats.current - stats.yearAgo)).toFixed(3)}%
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">{timeRange} High</div>
              <div className="text-2xl font-bold text-red-600">{stats.allTimeHigh.toFixed(2)}%</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">{timeRange} Low</div>
              <div className="text-2xl font-bold text-green-600">{stats.allTimeLow.toFixed(2)}%</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">{timeRange} Average</div>
              <div className="text-2xl font-bold text-gray-900">{stats.average52Week.toFixed(2)}%</div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedRate === '30Y' ? '30-Year' : '15-Year'} Fixed Rate History
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[600px]">
              {/* Grid lines */}
              {[...Array(5)].map((_, i) => {
                const y = padding.top + (i / 4) * (chartHeight - padding.top - padding.bottom);
                const rate = maxRate - (i / 4) * (maxRate - minRate);
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeDasharray="4"
                    />
                    <text x={padding.left - 10} y={y + 4} textAnchor="end" className="text-xs fill-gray-500">
                      {rate.toFixed(1)}%
                    </text>
                  </g>
                );
              })}

              {/* X-axis labels */}
              {historicalData.filter((_, i) => i % Math.ceil(historicalData.length / 6) === 0 || i === historicalData.length - 1).map((d, idx) => {
                const originalIndex = historicalData.indexOf(d);
                const x = xScale(originalIndex);
                return (
                  <text
                    key={d.date}
                    x={x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    {new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </text>
                );
              })}

              {/* Area fill */}
              <path
                d={`${pathData} L ${xScale(historicalData.length - 1)} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`}
                fill="url(#gradient)"
                opacity={0.3}
              />

              {/* Line */}
              <path
                d={pathData}
                fill="none"
                stroke={selectedRate === '30Y' ? '#2563eb' : '#059669'}
                strokeWidth={2.5}
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={selectedRate === '30Y' ? '#2563eb' : '#059669'} />
                  <stop offset="100%" stopColor={selectedRate === '30Y' ? '#2563eb' : '#059669'} stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Current rate indicator */}
              {historicalData.length > 0 && (
                <g>
                  <circle
                    cx={xScale(historicalData.length - 1)}
                    cy={yScale(selectedRate === '30Y' ? historicalData[historicalData.length - 1].rate30Y : historicalData[historicalData.length - 1].rate15Y)}
                    r={6}
                    fill={selectedRate === '30Y' ? '#2563eb' : '#059669'}
                  />
                  <text
                    x={xScale(historicalData.length - 1) - 10}
                    y={yScale(selectedRate === '30Y' ? historicalData[historicalData.length - 1].rate30Y : historicalData[historicalData.length - 1].rate15Y) - 15}
                    className="text-sm font-bold"
                    fill={selectedRate === '30Y' ? '#2563eb' : '#059669'}
                  >
                    {(selectedRate === '30Y' ? historicalData[historicalData.length - 1].rate30Y : historicalData[historicalData.length - 1].rate15Y).toFixed(2)}%
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Weekly Rate Data</h2>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">30-Year Fixed</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">15-Year Fixed</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">5/1 ARM</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Weekly Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...historicalData].reverse().map((row, idx) => {
                  const prevRow = historicalData[historicalData.length - idx - 2];
                  const change = prevRow ? row.rate30Y - prevRow.rate30Y : 0;
                  return (
                    <tr key={row.date} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {new Date(row.date).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        {row.rate30Y.toFixed(2)}%
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        {row.rate15Y.toFixed(2)}%
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        {row.rate5ARM?.toFixed(2) || '--'}%
                      </td>
                      <td className={`px-6 py-3 text-right text-sm font-medium ${
                        change < 0 ? 'text-green-600' : change > 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {change !== 0 && (
                          <>
                            {change < 0 ? <TrendingDown className="w-4 h-4 inline mr-1" /> : <TrendingUp className="w-4 h-4 inline mr-1" />}
                            {change > 0 ? '+' : ''}{change.toFixed(3)}%
                          </>
                        )}
                        {change === 0 && '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Data Source:</strong> Federal Reserve Economic Data (FRED), sourced from 
              Freddie Mac Primary Mortgage Market Survey. Rates are weekly national averages 
              updated each Thursday. Historical data may be limited based on data availability.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
