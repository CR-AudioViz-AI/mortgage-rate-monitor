'use client';

// RateChart Component - Historical mortgage rate visualization
// CR AudioViz AI - Mortgage Rate Monitor
// Roy Henderson @ December 2025

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { HistoricalRate } from '@/types/mortgage';

interface RateChartProps {
  initialData?: HistoricalRate[];
  seriesId?: string;
  height?: number;
}

export default function RateChart({ 
  initialData, 
  seriesId = '30y',
  height = 400 
}: RateChartProps) {
  const [data, setData] = useState<HistoricalRate[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('1y');

  const limitMap = {
    '1m': 4,
    '3m': 13,
    '6m': 26,
    '1y': 52,
  };

  useEffect(() => {
    if (initialData) return;

    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/mortgage/historical?series=${seriesId}&limit=${limitMap[timeRange]}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }
        
        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [seriesId, timeRange, initialData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-xl" style={{ height }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500">Loading chart data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-red-50 rounded-xl p-8" style={{ height }}>
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load chart</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-xl p-8" style={{ height }}>
        <p className="text-gray-500">No historical data available</p>
      </div>
    );
  }

  // Calculate min/max for Y axis
  const rates = data.map(d => d.rate);
  const minRate = Math.floor(Math.min(...rates) * 10) / 10 - 0.2;
  const maxRate = Math.ceil(Math.max(...rates) * 10) / 10 + 0.2;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Rate History</h3>
        
        {/* Time Range Selector */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(['1m', '3m', '6m', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                timeRange === range
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height - 100}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            domain={[minRate, maxRate]}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelFormatter={formatTooltipDate}
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Rate']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="rate"
            name="30-Year Fixed Rate"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#2563eb' }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-500">
        <span>Source: Federal Reserve Economic Data (FRED)</span>
        <span>Updated weekly on Thursdays</span>
      </div>
    </div>
  );
}
