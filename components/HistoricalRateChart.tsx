'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RateData {
  date: string;
  rate_30y: number;
  rate_15y: number;
  rate_fha: number;
  rate_va: number;
  rate_arm: number;
}

interface HistoricalRateChartProps {
  lenderId?: string;
  range?: '7d' | '30d' | '90d' | '1y' | '5y' | 'all';
}

export default function HistoricalRateChart({
  lenderId,
  range = '30d',
}: HistoricalRateChartProps) {
  const [data, setData] = useState<RateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState(range);
  const [visibleLines, setVisibleLines] = useState({
    rate_30y: true,
    rate_15y: true,
    rate_fha: false,
    rate_va: false,
    rate_arm: false,
  });

  useEffect(() => {
    fetchHistoricalData();
  }, [selectedRange, lenderId]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        range: selectedRange,
        ...(lenderId && { lender_id: lenderId }),
      });

      const response = await fetch(`/api/mortgage/historical?${params}`);
      
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
  };

  const toggleLine = (key: keyof typeof visibleLines) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatRate = (value: number) => {
    return `${value.toFixed(3)}%`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-red-600">
          <p className="font-semibold">Error loading chart data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Historical Mortgage Rates
        </h2>

        {/* Range Selector */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
            { value: '1y', label: '1 Year' },
            { value: '5y', label: '5 Years' },
            { value: 'all', label: 'All Time' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedRange(value as typeof selectedRange)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedRange === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12 }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              formatter={(value: number) => formatRate(value)}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />

            {visibleLines.rate_30y && (
              <Line
                type="monotone"
                dataKey="rate_30y"
                stroke="#3b82f6"
                strokeWidth={2}
                name="30-Year Fixed"
                dot={false}
              />
            )}

            {visibleLines.rate_15y && (
              <Line
                type="monotone"
                dataKey="rate_15y"
                stroke="#10b981"
                strokeWidth={2}
                name="15-Year Fixed"
                dot={false}
              />
            )}

            {visibleLines.rate_fha && (
              <Line
                type="monotone"
                dataKey="rate_fha"
                stroke="#f59e0b"
                strokeWidth={2}
                name="FHA"
                dot={false}
              />
            )}

            {visibleLines.rate_va && (
              <Line
                type="monotone"
                dataKey="rate_va"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="VA"
                dot={false}
              />
            )}

            {visibleLines.rate_arm && (
              <Line
                type="monotone"
                dataKey="rate_arm"
                stroke="#ef4444"
                strokeWidth={2}
                name="ARM"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Controls */}
      <div className="flex flex-wrap gap-4">
        {[
          { key: 'rate_30y', label: '30-Year Fixed', color: 'bg-blue-600' },
          { key: 'rate_15y', label: '15-Year Fixed', color: 'bg-green-600' },
          { key: 'rate_fha', label: 'FHA', color: 'bg-yellow-600' },
          { key: 'rate_va', label: 'VA', color: 'bg-purple-600' },
          { key: 'rate_arm', label: 'ARM', color: 'bg-red-600' },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => toggleLine(key as keyof typeof visibleLines)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition ${
              visibleLines[key as keyof typeof visibleLines]
                ? 'border-gray-800 bg-gray-50'
                : 'border-gray-300 bg-white opacity-50'
            }`}
          >
            <div className={`w-4 h-4 rounded-full ${color}`}></div>
            <span className="font-medium text-gray-900">{label}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      {data.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { key: 'rate_30y', label: '30-Year' },
            { key: 'rate_15y', label: '15-Year' },
            { key: 'rate_fha', label: 'FHA' },
            { key: 'rate_va', label: 'VA' },
            { key: 'rate_arm', label: 'ARM' },
          ].map(({ key, label }) => {
            const latestRate = data[data.length - 1][key as keyof RateData];
            const previousRate = data[0][key as keyof RateData];
            const change = Number(latestRate) - Number(previousRate);
            
            return (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">{label}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatRate(Number(latestRate))}
                </div>
                <div
                  className={`text-sm font-medium ${
                    change > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(3)}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
