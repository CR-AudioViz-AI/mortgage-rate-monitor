// Current Mortgage Rates Display Component
// Fetches live data from API and displays with trend indicators

'use client';

import { useState, useEffect } from 'react';

interface RateData {
  rate_type: string;
  current_rate: number;
  previous_rate: number;
  change_percent: number;
  last_updated: string;
}

export default function CurrentRates() {
  const [rates, setRates] = useState<RateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    fetchRates();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mortgage/rates');
      
      if (!response.ok) {
        throw new Error('Failed to fetch rates');
      }

      const data = await response.json();
      
      if (data.rates && Array.isArray(data.rates)) {
        setRates(data.rates);
        setLastUpdate(new Date().toLocaleString());
        setError(null);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getRateIcon = (rateType: string) => {
    if (rateType.includes('30')) return '🏡';
    if (rateType.includes('15')) return '🏠';
    return '📊';
  };

  const getTrendIcon = (changePercent: number) => {
    if (changePercent > 0) return '📈';
    if (changePercent < 0) return '📉';
    return '➡️';
  };

  const getTrendColor = (changePercent: number) => {
    if (changePercent > 0) return 'text-red-600';
    if (changePercent < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  if (loading && rates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading current rates...</p>
        </div>
      </div>
    );
  }

  if (error && rates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Rates</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRates}
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
            <h2 className="text-2xl font-bold text-gray-900">Current Mortgage Rates</h2>
            <p className="text-sm text-gray-600 mt-1">
              Live data updated every 5 minutes
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Last updated:</p>
            <p className="text-sm font-medium text-gray-900">{lastUpdate}</p>
          </div>
        </div>
      </div>

      {/* Rate Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {rates.map((rate) => (
          <div
            key={rate.rate_type}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{getRateIcon(rate.rate_type)}</div>
              <div className={`text-2xl ${getTrendColor(rate.change_percent)}`}>
                {getTrendIcon(rate.change_percent)}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {rate.rate_type}
            </h3>

            <div className="mb-4">
              <div className="text-4xl font-bold text-gray-900">
                {rate.current_rate.toFixed(3)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Previous: {rate.previous_rate.toFixed(3)}%
              </div>
            </div>

            <div className={`text-sm font-medium ${getTrendColor(rate.change_percent)}`}>
              {rate.change_percent > 0 ? '+' : ''}
              {rate.change_percent.toFixed(2)}% change
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">About These Rates</h3>
            <p className="text-sm text-gray-700">
              Rates are aggregated from multiple lenders and updated continuously throughout the day.
              Historical data shows that rates typically change 0.1-0.3% per month on average.
              Set up email alerts below to get notified when rates drop to your target level.
            </p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchRates}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Rates'}
        </button>
      </div>
    </div>
  );
}
