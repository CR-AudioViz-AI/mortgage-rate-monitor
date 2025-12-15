// CR AudioViz AI - Mortgage Rate Monitor
// Historical Data Page - Real FRED data, rate type selection
// December 14, 2025

'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Calendar, Download, 
  BarChart3, Info, RefreshCw, ChevronDown
} from 'lucide-react';

interface HistoricalRate {
  date: string;
  rate: number;
  change: number;
}

interface RateStats {
  current: number;
  weekAgo: number;
  monthAgo: number;
  yearAgo: number;
  high: number;
  low: number;
  average: number;
}

const RATE_TYPES = [
  { id: '30-Year Fixed', label: '30-Year Fixed', official: true },
  { id: '15-Year Fixed', label: '15-Year Fixed', official: true },
  { id: '5/1 ARM', label: '5/1 ARM', official: true },
  { id: '7/1 ARM', label: '7/1 ARM', official: false },
  { id: '20-Year Fixed', label: '20-Year Fixed', official: false },
  { id: '10-Year Fixed', label: '10-Year Fixed', official: false },
  { id: 'FHA 30-Year', label: 'FHA 30-Year', official: false },
  { id: 'VA 30-Year', label: 'VA 30-Year', official: false },
  { id: 'Jumbo 30-Year', label: 'Jumbo 30-Year', official: false },
];

const TIME_RANGES = [
  { id: '1M', label: '1 Month' },
  { id: '3M', label: '3 Months' },
  { id: '6M', label: '6 Months' },
  { id: '1Y', label: '1 Year' },
  { id: '5Y', label: '5 Years' },
  { id: '10Y', label: '10 Years' },
  { id: 'ALL', label: 'All Time' },
];

export default function HistoricalPage() {
  const [historicalData, setHistoricalData] = useState<HistoricalRate[]>([]);
  const [stats, setStats] = useState<RateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRateType, setSelectedRateType] = useState('30-Year Fixed');
  const [timeRange, setTimeRange] = useState('1Y');
  const [source, setSource] = useState('');

  useEffect(() => {
    fetchHistoricalData();
  }, [selectedRateType, timeRange]);

  async function fetchHistoricalData() {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/mortgage/historical?type=${encodeURIComponent(selectedRateType)}&range=${timeRange}`
      );
      const data = await response.json();
      
      if (data.success) {
        setHistoricalData(data.rates || []);
        setStats(data.stats || null);
        setSource(data.source || 'Unknown');
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load historical data');
    } finally {
      setLoading(false);
    }
  }

  // Chart calculations
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  
  const rates = historicalData.map(d => d.rate);
  const minRate = rates.length > 0 ? Math.floor(Math.min(...rates) * 10) / 10 - 0.2 : 5;
  const maxRate = rates.length > 0 ? Math.ceil(Math.max(...rates) * 10) / 10 + 0.2 : 8;
  
  const xScale = (i: number) => {
    if (historicalData.length <= 1) return padding.left;
    return padding.left + (i / (historicalData.length - 1)) * (chartWidth - padding.left - padding.right);
  };
  
  const yScale = (rate: number) => {
    const range = maxRate - minRate;
    if (range === 0) return chartHeight / 2;
    return chartHeight - padding.bottom - ((rate - minRate) / range) * (chartHeight - padding.top - padding.bottom);
  };
  
  const pathData = historicalData.map((d, i) => {
    return `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.rate)}`;
  }).join(' ');

  const selectedRateInfo = RATE_TYPES.find(r => r.id === selectedRateType);

  // Export to CSV
  function exportToCSV() {
    if (historicalData.length === 0) return;
    
    const headers = ['Date', 'Rate (%)', 'Weekly Change (%)'];
    const rows = historicalData.map(d => [d.date, d.rate.toFixed(2), d.change.toFixed(3)]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mortgage-rates-${selectedRateType.replace(/\s+/g, '-')}-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Historical Rate Data</h1>
          <p className="text-xl text-indigo-100">
            Track mortgage rate trends from Freddie Mac PMMS via Federal Reserve (FRED)
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Rate Type Selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Rate Type</label>
              <select
                value={selectedRateType}
                onChange={(e) => setSelectedRateType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                {RATE_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label} {type.official ? '(Official)' : '(Calculated)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div className="flex gap-1">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    timeRange === range.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.id}
                </button>
              ))}
            </div>

            {/* Export */}
            <button
              onClick={exportToCSV}
              disabled={historicalData.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Source indicator */}
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <Info className="w-4 h-4" />
            <span>
              Data source: <strong>{source === 'FRED' ? 'Federal Reserve (Official)' : source === 'CALCULATED' ? 'Calculated from 30-Year Fixed' : source}</strong>
              {selectedRateInfo && !selectedRateInfo.official && (
                <span className="text-orange-600 ml-2">(Based on historical spreads)</span>
              )}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading historical data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 mb-6">
            <strong>Error:</strong> {error}
            <button onClick={fetchHistoricalData} className="ml-4 underline">Retry</button>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Current</div>
              <div className="text-2xl font-bold text-gray-900">{stats.current.toFixed(2)}%</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Week Ago</div>
              <div className="text-2xl font-bold text-gray-900">{stats.weekAgo.toFixed(2)}%</div>
              <div className={`text-sm ${stats.current < stats.weekAgo ? 'text-green-600' : stats.current > stats.weekAgo ? 'text-red-600' : 'text-gray-500'}`}>
                {stats.current !== stats.weekAgo && (stats.current < stats.weekAgo ? '↓' : '↑')} 
                {((stats.current - stats.weekAgo)).toFixed(3)}%
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Month Ago</div>
              <div className="text-2xl font-bold text-gray-900">{stats.monthAgo.toFixed(2)}%</div>
              <div className={`text-sm ${stats.current < stats.monthAgo ? 'text-green-600' : stats.current > stats.monthAgo ? 'text-red-600' : 'text-gray-500'}`}>
                {((stats.current - stats.monthAgo)).toFixed(3)}%
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Year Ago</div>
              <div className="text-2xl font-bold text-gray-900">{stats.yearAgo.toFixed(2)}%</div>
              <div className={`text-sm ${stats.current < stats.yearAgo ? 'text-green-600' : stats.current > stats.yearAgo ? 'text-red-600' : 'text-gray-500'}`}>
                {((stats.current - stats.yearAgo)).toFixed(3)}%
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">{timeRange} High</div>
              <div className="text-2xl font-bold text-red-600">{stats.high.toFixed(2)}%</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">{timeRange} Low</div>
              <div className="text-2xl font-bold text-green-600">{stats.low.toFixed(2)}%</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">{timeRange} Average</div>
              <div className="text-2xl font-bold text-gray-900">{stats.average.toFixed(2)}%</div>
            </div>
          </div>
        )}

        {/* Chart */}
        {!loading && historicalData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedRateType} Rate History
            </h2>

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
                {historicalData
                  .filter((_, i) => i % Math.max(1, Math.ceil(historicalData.length / 8)) === 0 || i === historicalData.length - 1)
                  .map((d) => {
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
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                />

                {/* Gradient definition */}
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>

                {/* Current rate indicator */}
                {historicalData.length > 0 && (
                  <g>
                    <circle
                      cx={xScale(historicalData.length - 1)}
                      cy={yScale(historicalData[historicalData.length - 1].rate)}
                      r={6}
                      fill="#4f46e5"
                    />
                    <text
                      x={xScale(historicalData.length - 1) - 10}
                      y={yScale(historicalData[historicalData.length - 1].rate) - 15}
                      className="text-sm font-bold"
                      fill="#4f46e5"
                    >
                      {historicalData[historicalData.length - 1].rate.toFixed(2)}%
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!loading && historicalData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Weekly Rate Data ({historicalData.length} weeks)</h2>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Rate</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Weekly Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[...historicalData].reverse().map((row, idx) => (
                    <tr key={row.date} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {new Date(row.date).toLocaleDateString('en-US', { 
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        {row.rate.toFixed(2)}%
                      </td>
                      <td className={`px-6 py-3 text-right text-sm font-medium ${
                        row.change < 0 ? 'text-green-600' : row.change > 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {row.change !== 0 && (
                          <>
                            {row.change < 0 ? <TrendingDown className="w-4 h-4 inline mr-1" /> : <TrendingUp className="w-4 h-4 inline mr-1" />}
                            {row.change > 0 ? '+' : ''}{row.change.toFixed(3)}%
                          </>
                        )}
                        {row.change === 0 && '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && historicalData.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No Historical Data</h3>
            <p className="text-gray-500 mt-2">Select a different rate type or time range</p>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Data Source:</strong> Historical rates are sourced from the Federal Reserve Economic Data (FRED), 
              originally from Freddie Mac's Primary Mortgage Market Survey (PMMS). Data is available back to 1971 for 
              conventional mortgages. ARM and specialty loan rates are calculated based on historical spread patterns 
              from the 30-year fixed rate baseline.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
