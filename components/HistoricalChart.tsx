// Historical Chart Component
// Displays mortgage rate trends over time

'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HistoricalDataPoint {
  date: string;
  '30Y Fixed': number;
  '15Y Fixed': number;
  '5/1 ARM': number;
}

export default function HistoricalChart() {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchHistoricalData();
  }, [days]);

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mortgage/rates/historical?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const result = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        // Transform data for Recharts
        const chartData = result.data.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          '30Y Fixed': item.rate_30y || 0,
          '15Y Fixed': item.rate_15y || 0,
          '5/1 ARM': item.rate_5_1_arm || 0
        }));
        
        setData(chartData);
        setStats(result.statistics);
        setError(null);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading historical data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchHistoricalData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📈 Historical Rate Data</h2>
            <p className="text-sm text-gray-600 mt-1">
              Track mortgage rate trends over time
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDays(7)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                days === 7 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                days === 30 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDays(90)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                days === 90 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setDays(365)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                days === 365 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1 Year
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fontSize: 12 }}
              label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="30Y Fixed" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="15Y Fixed" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="5/1 ARM" 
              stroke="#ec4899" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(stats).map(([rateType, rateStats]: [string, any]) => (
            <div key={rateType} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{rateType}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Average</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {rateStats.average?.toFixed(3)}%
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Minimum</p>
                    <p className="text-sm font-medium text-green-600">
                      {rateStats.min?.toFixed(3)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Maximum</p>
                    <p className="text-sm font-medium text-red-600">
                      {rateStats.max?.toFixed(3)}%
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Volatility</p>
                  <p className="text-sm font-medium text-gray-900">
                    ±{rateStats.volatility?.toFixed(3)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Change</p>
                  <p className={`text-sm font-medium ${rateStats.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {rateStats.change >= 0 ? '+' : ''}{rateStats.change?.toFixed(3)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Market Insights</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Longer-term rates (30Y) typically higher than short-term (15Y)</li>
              <li>• ARM rates often lower but more volatile than fixed rates</li>
              <li>• Look for periods of stability for better refinancing opportunities</li>
              <li>• Historical trends help predict future rate movements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
