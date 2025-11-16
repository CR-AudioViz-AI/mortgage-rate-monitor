'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
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
  timeRange?: '7d' | '30d' | '90d' | '1y' | '5y' | 'all';
  showComparison?: boolean;
}

export default function HistoricalRateChart({
  lenderId,
  timeRange = '30d',
  showComparison = false,
}: HistoricalRateChartProps) {
  const [data, setData] = useState<RateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'rate_30y',
    'rate_15y',
  ]);

  useEffect(() => {
    fetchHistoricalData();
  }, [lenderId, timeRange]);

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (lenderId) params.append('lender_id', lenderId);
      params.append('range', timeRange);

      const response = await fetch(`/api/mortgage/historical?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching historical data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRate = (value: number) => {
    return `${value.toFixed(3)}%`;
  };

  const metricColors: Record<string, string> = {
    rate_30y: '#3b82f6',
    rate_15y: '#10b981',
    rate_fha: '#f59e0b',
    rate_va: '#8b5cf6',
    rate_arm: '#ef4444',
  };

  const metricLabels: Record<string, string> = {
    rate_30y: '30-Year Fixed',
    rate_15y: '15-Year Fixed',
    rate_fha: 'FHA',
    rate_va: 'VA',
    rate_arm: '5/1 ARM',
  };

  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600">
          <p className="font-semibold">Error loading chart</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">No historical data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Historical Mortgage Rates
        </h3>
        <p className="text-sm text-gray-600">
          {lenderId
            ? 'Lender-specific rate trends'
            : 'National average rate trends'}
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['7d', '30d', '90d', '1y', '5y', 'all'].map((range) => (
          <button
            key={range}
            onClick={() => fetchHistoricalData()}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range === '7d'
              ? '7 Days'
              : range === '30d'
              ? '30 Days'
              : range === '90d'
              ? '90 Days'
              : range === '1y'
              ? '1 Year'
              : range === '5y'
              ? '5 Years'
              : 'All Time'}
          </button>
        ))}
      </div>

      {/* Metric Toggles */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(metricLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => toggleMetric(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedMetrics.includes(key)
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: selectedMetrics.includes(key)
                ? metricColors[key]
                : undefined,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {Object.entries(metricColors).map(([key, color]) => (
              <linearGradient
                key={key}
                id={`color${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => formatRate(value)}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            }
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => metricLabels[value] || value}
          />
          {selectedMetrics.map((metric) => (
            <Area
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={metricColors[metric]}
              strokeWidth={2}
              fill={`url(#color${metric})`}
              name={metric}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {selectedMetrics.map((metric) => {
          const values = data.map((d) => d[metric as keyof RateData]);
          const latest = values[values.length - 1] as number;
          const previous = values[values.length - 2] as number;
          const change = latest - previous;
          const min = Math.min(...(values as number[]));
          const max = Math.max(...(values as number[]));

          return (
            <div
              key={metric}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <div className="text-xs text-gray-600 mb-1">
                {metricLabels[metric]}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formatRate(latest)}
              </div>
              <div
                className={`text-xs font-medium ${
                  change > 0
                    ? 'text-red-600'
                    : change < 0
                    ? 'text-green-600'
                    : 'text-gray-600'
                }`}
              >
                {change > 0 ? '↑' : change < 0 ? '↓' : '—'}{' '}
                {Math.abs(change).toFixed(3)}%
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Range: {formatRate(min)} - {formatRate(max)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
