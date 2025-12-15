// CR AudioViz AI - Mortgage Rate Monitor
// Main Rates Page (serves as homepage) - All rates with quick actions
// December 14, 2025

'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCw, TrendingUp, TrendingDown, Clock, Shield, 
  Bell, Calculator, BarChart3, Users, ArrowRight, Info
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
}

export default function RatesPage() {
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
  
  // Categorize rates
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
      {/* Sub-header with data info */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">
                Official rates from Freddie Mac via Federal Reserve (FRED)
              </span>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <span className="text-sm text-gray-500 hidden sm:flex items-center gap-1">
                  <Clock className="w-4 h-4" />
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
            <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
              <span className="text-sm text-blue-200">Source: Freddie Mac PMMS</span>
              <Link href="/alerts?rate=30-Year+Fixed" className="text-sm bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition">
                Set Alert
              </Link>
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
            <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
              <span className="text-sm text-green-200">Source: Freddie Mac PMMS</span>
              <Link href="/alerts?rate=15-Year+Fixed" className="text-sm bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition">
                Set Alert
              </Link>
            </div>
          </div>
        </div>

        {/* All Rates Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">All Mortgage Rates</h2>
              <Link href="/historical" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
                View History <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Loan Type</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Rate</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">APR</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Weekly Change</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Source</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rates.map((rate) => (
                  <tr key={rate.rateType} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{rate.rateType}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xl font-bold text-gray-900">{rate.rate.toFixed(2)}%</span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {rate.apr ? `${rate.apr.toFixed(3)}%` : '--'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 ${
                        rate.change < 0 ? 'text-green-600' : rate.change > 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {rate.change < 0 ? <TrendingDown className="w-4 h-4" /> : rate.change > 0 ? <TrendingUp className="w-4 h-4" /> : null}
                        {rate.change > 0 ? '+' : ''}{rate.change.toFixed(3)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        rate.source === 'FRED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {rate.source === 'FRED' ? (
                          <><Shield className="w-3 h-3" /> Official</>
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

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/compare" className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition group">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Compare Lenders</h3>
            <p className="text-sm text-gray-600">390+ verified lenders with real rates</p>
          </Link>

          <Link href="/calculators" className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition group">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition">
              <Calculator className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Calculators</h3>
            <p className="text-sm text-gray-600">Payment, affordability & more</p>
          </Link>

          <Link href="/alerts" className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition group">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Rate Alerts</h3>
            <p className="text-sm text-gray-600">Get notified when rates drop</p>
          </Link>

          <Link href="/historical" className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition group">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Historical Data</h3>
            <p className="text-sm text-gray-600">Rate trends over time</p>
          </Link>
        </div>

        {/* Data Source Info */}
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Data Source:</strong> Rates are sourced from the Federal Reserve Economic Data (FRED), 
              originally from Freddie Mac's Primary Mortgage Market Survey (PMMS). Official rates are updated 
              weekly on Thursdays. Calculated rates (ARM, Jumbo, etc.) are derived from official rates using 
              historical spread patterns.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
