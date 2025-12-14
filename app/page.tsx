// CR AudioViz AI - Mortgage Rate Monitor
// Homepage - NO DUPLICATE HEADER (uses global Header from layout)
// Fixed: December 14, 2025

'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, ArrowRight, Shield, Clock, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface MortgageRate {
  rateType: string;
  rate: number;
  apr?: number;
  change: number;
  previousRate?: number;
  source: string;
  lastUpdated?: string;
}

export default function HomePage() {
  const [rates, setRates] = useState<MortgageRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchRates(forceRefresh = false) {
    if (forceRefresh) setRefreshing(true);
    
    try {
      const url = forceRefresh 
        ? '/api/mortgage/rates?refresh=true' 
        : '/api/mortgage/rates';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch rates');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setRates(data.rates);
        setLastUpdated(data.lastUpdated);
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

  const rate30Y = rates.find(r => r.rateType === '30-Year Fixed');
  const rate15Y = rates.find(r => r.rateType === '15-Year Fixed');
  const officialRates = rates.filter(r => r.source === 'FRED');
  const calculatedRates = rates.filter(r => r.source === 'CALCULATED');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 text-lg">Loading mortgage rates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sub-header with refresh */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">
                Official rates from Freddie Mac via Federal Reserve
              </span>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <span className="text-sm text-gray-500 hidden sm:block">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {new Date(lastUpdated).toLocaleString()}
                </span>
              )}
              <button
                onClick={() => fetchRates(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Hero Rate Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 30-Year Fixed */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">30-Year Fixed Rate</h2>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Official</span>
            </div>
            <div className="text-5xl font-bold mb-2">
              {rate30Y?.rate.toFixed(2) || '--'}%
            </div>
            {rate30Y?.apr && (
              <div className="text-blue-100 mb-3">APR: {rate30Y.apr.toFixed(3)}%</div>
            )}
            <div className={`flex items-center gap-2 ${(rate30Y?.change || 0) < 0 ? 'text-green-300' : 'text-red-300'}`}>
              {(rate30Y?.change || 0) < 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              <span>{(rate30Y?.change || 0) > 0 ? '+' : ''}{rate30Y?.change?.toFixed(3) || '0.000'}% from last week</span>
            </div>
            <div className="mt-4 text-sm text-blue-200">
              Source: Freddie Mac Primary Mortgage Market Survey
            </div>
          </div>

          {/* 15-Year Fixed */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">15-Year Fixed Rate</h2>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Official</span>
            </div>
            <div className="text-5xl font-bold mb-2">
              {rate15Y?.rate.toFixed(2) || '--'}%
            </div>
            {rate15Y?.apr && (
              <div className="text-green-100 mb-3">APR: {rate15Y.apr.toFixed(3)}%</div>
            )}
            <div className={`flex items-center gap-2 ${(rate15Y?.change || 0) < 0 ? 'text-green-300' : 'text-red-300'}`}>
              {(rate15Y?.change || 0) < 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              <span>{(rate15Y?.change || 0) > 0 ? '+' : ''}{rate15Y?.change?.toFixed(3) || '0.000'}% from last week</span>
            </div>
            <div className="mt-4 text-sm text-green-200">
              Source: Freddie Mac Primary Mortgage Market Survey
            </div>
          </div>
        </div>

        {/* All Rates Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Mortgage Rates</h2>
            <Link 
              href="/rates"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rates.map((rate) => (
              <div 
                key={rate.rateType}
                className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition"
              >
                <div className="text-sm text-gray-500 mb-1">{rate.rateType}</div>
                <div className="text-2xl font-bold text-gray-900">{rate.rate.toFixed(2)}%</div>
                {rate.apr && (
                  <div className="text-xs text-gray-500">APR: {rate.apr.toFixed(3)}%</div>
                )}
                <div className={`flex items-center gap-1 text-sm mt-2 ${
                  rate.change < 0 ? 'text-green-600' : rate.change > 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {rate.change < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  {rate.change > 0 ? '+' : ''}{rate.change.toFixed(3)}%
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rate.source === 'FRED' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {rate.source === 'FRED' ? 'Official' : 'Calculated'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/compare"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Compare Lenders</h3>
            <p className="text-sm text-gray-600">Compare 390+ verified lenders with real rates</p>
          </Link>

          <Link 
            href="/calculators"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth={2} />
                <line x1="8" y1="6" x2="16" y2="6" strokeWidth={2} />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Calculators</h3>
            <p className="text-sm text-gray-600">Payment, affordability, refinance & more</p>
          </Link>

          <Link 
            href="/alerts"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Rate Alerts</h3>
            <p className="text-sm text-gray-600">Get notified when rates hit your target</p>
          </Link>

          <Link 
            href="/historical"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition group"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Historical Data</h3>
            <p className="text-sm text-gray-600">52+ weeks of rate history & trends</p>
          </Link>
        </div>

        {/* Data Source Attribution */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data sourced from Federal Reserve Economic Data (FRED) via Freddie Mac Primary Mortgage Market Survey</p>
          <p className="mt-1">Updated weekly on Thursdays • Real-time Treasury yields</p>
        </div>
      </div>
    </div>
  );
}
