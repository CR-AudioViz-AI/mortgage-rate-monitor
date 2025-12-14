// CR AudioViz AI - Mortgage Rate Monitor
// Current Rates Page - All rates with details and historical context
// Created: December 14, 2025

'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, RefreshCw, Info, 
  Calendar, Clock, Shield, ExternalLink, BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface MortgageRate {
  rateType: string;
  rate: number;
  apr?: number;
  change: number;
  previousRate?: number;
  source: string;
  lastUpdated?: string;
  weekAgo?: number;
  monthAgo?: number;
  yearAgo?: number;
}

interface MarketIndicator {
  name: string;
  value: number;
  change: number;
}

export default function RatesPage() {
  const [rates, setRates] = useState<MortgageRate[]>([]);
  const [marketData, setMarketData] = useState<{
    treasuryYields: MarketIndicator[];
    mortgageSpread: number;
    dataDate: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fixed' | 'arm' | 'government' | 'jumbo'>('all');

  async function fetchRates(forceRefresh = false) {
    if (forceRefresh) setRefreshing(true);
    
    try {
      const url = forceRefresh 
        ? '/api/mortgage/rates?refresh=true' 
        : '/api/mortgage/rates';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setRates(data.rates);
        setLastUpdated(data.lastUpdated);
        setMarketData({
          treasuryYields: data.treasuryYields || [],
          mortgageSpread: data.mortgageSpread || 0,
          dataDate: data.dataDate || '',
        });
        setError(null);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rates');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchRates();
    const interval = setInterval(() => fetchRates(), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Categorize rates
  const categorizedRates = {
    fixed: rates.filter(r => r.rateType.includes('Fixed') && !r.rateType.includes('Jumbo') && !r.rateType.includes('FHA') && !r.rateType.includes('VA') && !r.rateType.includes('USDA')),
    arm: rates.filter(r => r.rateType.includes('ARM')),
    government: rates.filter(r => r.rateType.includes('FHA') || r.rateType.includes('VA') || r.rateType.includes('USDA')),
    jumbo: rates.filter(r => r.rateType.includes('Jumbo')),
  };

  const filteredRates = selectedCategory === 'all' 
    ? rates 
    : categorizedRates[selectedCategory] || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading rates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Current Mortgage Rates</h1>
              <p className="text-xl text-blue-100">
                Official rates from Freddie Mac Primary Mortgage Market Survey
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              {lastUpdated && (
                <div className="text-sm text-blue-200">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {new Date(lastUpdated).toLocaleString()}
                </div>
              )}
              <button
                onClick={() => fetchRates(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Market Context */}
          {marketData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {marketData.treasuryYields.map((yield_) => (
                <div key={yield_.name} className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-sm text-blue-200">{yield_.name}</div>
                  <div className="text-2xl font-bold">{yield_.value.toFixed(2)}%</div>
                  <div className={`text-sm ${yield_.change < 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {yield_.change > 0 ? '+' : ''}{yield_.change.toFixed(2)}%
                  </div>
                </div>
              ))}
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-sm text-blue-200">Mortgage Spread</div>
                <div className="text-2xl font-bold">{marketData.mortgageSpread.toFixed(2)}%</div>
                <div className="text-sm text-blue-300">vs 10Y Treasury</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Category Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Rates', count: rates.length },
            { id: 'fixed', label: 'Fixed Rate', count: categorizedRates.fixed.length },
            { id: 'arm', label: 'ARM', count: categorizedRates.arm.length },
            { id: 'government', label: 'FHA/VA/USDA', count: categorizedRates.government.length },
            { id: 'jumbo', label: 'Jumbo', count: categorizedRates.jumbo.length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Rates Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Loan Type</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Rate</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">APR</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Change</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Source</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRates.map((rate) => (
                  <tr key={rate.rateType} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{rate.rateType}</div>
                      <div className="text-sm text-gray-500">
                        {rate.rateType.includes('ARM') 
                          ? 'Adjustable after initial period'
                          : rate.rateType.includes('Jumbo')
                            ? 'Loans above conforming limits'
                            : rate.rateType.includes('FHA')
                              ? 'Min 3.5% down, credit flexible'
                              : rate.rateType.includes('VA')
                                ? 'Veterans, 0% down available'
                                : rate.rateType.includes('USDA')
                                  ? 'Rural areas, 0% down'
                                  : 'Conforming loan limits'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-2xl font-bold text-gray-900">{rate.rate.toFixed(2)}%</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-lg text-gray-700">
                        {rate.apr ? `${rate.apr.toFixed(3)}%` : '--'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${
                        rate.change < 0 ? 'text-green-600' : rate.change > 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {rate.change < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : rate.change > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : null}
                        <span className="font-medium">
                          {rate.change > 0 ? '+' : ''}{rate.change.toFixed(3)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">vs last week</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        rate.source === 'FRED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {rate.source === 'FRED' ? (
                          <>
                            <Shield className="w-3 h-3" />
                            Official
                          </>
                        ) : 'Calculated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        href={`/alerts?rate=${encodeURIComponent(rate.rateType)}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Set Alert
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Official Data</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Our rates come directly from the Federal Reserve Economic Data (FRED), 
              sourced from Freddie Mac's Primary Mortgage Market Survey - the industry standard.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Weekly Updates</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Freddie Mac surveys lenders every week and releases new rates on Thursdays. 
              Our system automatically fetches the latest data as soon as it's available.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Compare Lenders</h3>
            </div>
            <p className="text-gray-600 text-sm">
              While these are national averages, individual lenders may offer different rates.
              <Link href="/compare" className="text-blue-600 hover:underline ml-1">
                Compare 390+ lenders →
              </Link>
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Disclaimer:</strong> Rates shown are national averages and may vary based on 
              credit score, loan amount, down payment, and other factors. APR includes estimated 
              fees and points. Actual rates from lenders may differ. Always get personalized quotes 
              from multiple lenders before making decisions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
