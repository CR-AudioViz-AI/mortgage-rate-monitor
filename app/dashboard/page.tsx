// CR AudioViz AI - Mortgage Rate Monitor
// Dashboard - Simple version without central auth
// December 22, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RateData {
  thirtyYear: number;
  fifteenYear: number;
  fhaRate: number;
  vaRate: number;
  weeklyChange: number;
}

export default function DashboardPage() {
  const [rates, setRates] = useState<RateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mortgage/rates')
      .then(r => r.json())
      .then(data => {
        if (data.rates) {
          setRates(data.rates);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Mortgage Rate Dashboard
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
          </div>
        ) : rates ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">30-Year Fixed</p>
              <p className="text-3xl font-bold text-white">{rates.thirtyYear}%</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">15-Year Fixed</p>
              <p className="text-3xl font-bold text-white">{rates.fifteenYear}%</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">FHA 30-Year</p>
              <p className="text-3xl font-bold text-white">{rates.fhaRate}%</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Weekly Change</p>
              <p className={`text-3xl font-bold ${rates.weeklyChange <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {rates.weeklyChange > 0 ? '+' : ''}{rates.weeklyChange}%
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">Unable to load rates</p>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/true-cost" className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-2xl p-6 border border-emerald-500/30 hover:border-emerald-400/50 transition-all">
            <h3 className="text-xl font-bold text-white mb-2">💰 True Cost Calculator</h3>
            <p className="text-slate-400 text-sm">See what you will REALLY pay</p>
          </Link>
          <Link href="/affordability" className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all">
            <h3 className="text-xl font-bold text-white mb-2">📊 Affordability</h3>
            <p className="text-slate-400 text-sm">How much home can you afford?</p>
          </Link>
          <Link href="/compare-lenders" className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all">
            <h3 className="text-xl font-bold text-white mb-2">🏦 Compare Lenders</h3>
            <p className="text-slate-400 text-sm">Real HMDA approval data</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
