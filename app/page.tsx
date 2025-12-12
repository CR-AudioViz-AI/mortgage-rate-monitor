'use client';

// Mortgage Rate Monitor - Main Page
// CR AudioViz AI
// Roy Henderson @ December 2025

import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Calculator, Bell, ExternalLink } from 'lucide-react';
import MortgageRateCard from '@/components/MortgageRateCard';
import RateChart from '@/components/RateChart';
import type { MortgageRate } from '@/types/mortgage';

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
    
    // Auto-refresh every 15 minutes
    const interval = setInterval(() => fetchRates(), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Get primary rates for hero section
  const rate30Y = rates.find(r => r.rateType === '30-Year Fixed');
  const rate15Y = rates.find(r => r.rateType === '15-Year Fixed');

  // Separate official and calculated rates
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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mortgage Rate Monitor</h1>
                <p className="text-sm text-gray-500">Powered by CR AudioViz AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <span className="text-sm text-gray-500 hidden sm:block">
                  Updated: {new Date(lastUpdated).toLocaleString()}
                </span>
              )}
              <button
                onClick={() => fetchRates(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="font-medium">Error loading rates</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Hero Section - Primary Rates */}
        <section className="mb-10">
          <div className="grid md:grid-cols-2 gap-6">
            {rate30Y && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium opacity-90">30-Year Fixed Rate</h2>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Official</span>
                </div>
                <div className="mb-4">
                  <span className="text-6xl font-bold">{rate30Y.rate.toFixed(2)}</span>
                  <span className="text-3xl ml-1">%</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  {rate30Y.change > 0 ? (
                    <TrendingUp className="w-5 h-5 text-red-300" />
                  ) : rate30Y.change < 0 ? (
                    <TrendingDown className="w-5 h-5 text-green-300" />
                  ) : null}
                  <span>
                    {rate30Y.change > 0 ? '+' : ''}{rate30Y.change.toFixed(3)}% from last week
                  </span>
                </div>
                <p className="mt-4 text-sm text-white/60">
                  Source: Freddie Mac Primary Mortgage Market Survey
                </p>
              </div>
            )}

            {rate15Y && (
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium opacity-90">15-Year Fixed Rate</h2>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Official</span>
                </div>
                <div className="mb-4">
                  <span className="text-6xl font-bold">{rate15Y.rate.toFixed(2)}</span>
                  <span className="text-3xl ml-1">%</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  {rate15Y.change > 0 ? (
                    <TrendingUp className="w-5 h-5 text-red-300" />
                  ) : rate15Y.change < 0 ? (
                    <TrendingDown className="w-5 h-5 text-green-300" />
                  ) : null}
                  <span>
                    {rate15Y.change > 0 ? '+' : ''}{rate15Y.change.toFixed(3)}% from last week
                  </span>
                </div>
                <p className="mt-4 text-sm text-white/60">
                  Source: Freddie Mac Primary Mortgage Market Survey
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Historical Chart */}
        <section className="mb-10">
          <RateChart />
        </section>

        {/* Calculated/Estimated Rates */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Rate Types</h2>
              <p className="text-gray-500 mt-1">
                Estimated rates based on market spreads
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {calculatedRates.map((rate) => (
              <MortgageRateCard key={rate.rateType} rate={rate} showDetails={true} />
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/calculators"
              className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mortgage Calculator</h3>
                <p className="text-sm text-gray-500">Calculate your payment</p>
              </div>
            </a>

            <a
              href="/compare"
              className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Compare Rates</h3>
                <p className="text-sm text-gray-500">Side-by-side comparison</p>
              </div>
            </a>

            <a
              href="/dashboard"
              className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rate Alerts</h3>
                <p className="text-sm text-gray-500">Get notified on changes</p>
              </div>
            </a>

            <a
              href="/api-docs"
              className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">API Access</h3>
                <p className="text-sm text-gray-500">Integrate our data</p>
              </div>
            </a>
          </div>
        </section>

        {/* Data Attribution */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">About This Data</h3>
          <div className="prose prose-sm text-gray-600 max-w-none">
            <p>
              <strong>Official Rates (30-Year & 15-Year Fixed):</strong> Sourced directly from the 
              Federal Reserve Economic Data (FRED) API, which publishes Freddie Mac&apos;s Primary 
              Mortgage Market Survey (PMMS) data. Updated weekly on Thursdays.
            </p>
            <p className="mt-3">
              <strong>Estimated Rates (ARM, FHA, VA, Jumbo):</strong> Calculated using industry-standard 
              spreads relative to the official 30-Year and 15-Year fixed rates. These are approximations 
              based on typical market conditions and may vary by lender.
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Data provided for informational purposes only. Contact a licensed mortgage professional 
              for actual rate quotes. CR AudioViz AI is not a lender.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">© 2025 CR AudioViz AI, LLC</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">Your Story. Our Design.</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <a href="https://craudiovizai.com" className="hover:text-blue-600 transition-colors">
                Main Site
              </a>
              <a href="/api-docs" className="hover:text-blue-600 transition-colors">
                API Docs
              </a>
              <a href="/pricing" className="hover:text-blue-600 transition-colors">
                Pricing
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
