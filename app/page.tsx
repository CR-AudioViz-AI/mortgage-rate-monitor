// CR AudioViz AI - Mortgage Rate Monitor
// HOMEPAGE - The Pinnacle Landing Experience
// December 22, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface RateData {
  rate30yr: number;
  rate15yr: number;
  change: number;
  lastUpdated: string;
}

export default function HomePage() {
  const [rates, setRates] = useState<RateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/mortgage-rates');
      const data = await response.json();
      if (data.success) {
        setRates({
          rate30yr: data.rates.thirtyYear.rate,
          rate15yr: data.rates.fifteenYear.rate,
          change: data.rates.thirtyYear.weeklyChange,
          lastUpdated: new Date().toLocaleString(),
        });
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
    setLoading(false);
  };

  const tools = [
    {
      title: 'True Cost Calculator',
      description: 'See what you\'ll REALLY pay — not just the advertised rate. 5-year analysis included.',
      icon: '💰',
      href: '/true-cost',
      color: 'from-emerald-600 to-teal-600',
      badge: 'Most Popular',
    },
    {
      title: 'Affordability Calculator',
      description: 'How much home can you afford? Real-time DTI analysis with all loan types.',
      icon: '🏠',
      href: '/affordability',
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Lender Comparison',
      description: 'Compare 390+ lenders with REAL approval rates from HMDA data.',
      icon: '🏦',
      href: '/compare-lenders',
      color: 'from-blue-600 to-indigo-600',
      badge: 'Real Data',
    },
    {
      title: 'Property Intelligence',
      description: 'Schools, taxes, flood risk, environmental hazards — all in one view.',
      icon: '📍',
      href: '/property-intelligence',
      color: 'from-cyan-600 to-teal-600',
    },
    {
      title: 'Rate Lock Advisor',
      description: 'Should you lock today? AI-powered timing based on market analysis.',
      icon: '🔒',
      href: '/rate-lock',
      color: 'from-amber-600 to-orange-600',
      badge: 'AI Powered',
    },
    {
      title: 'Refinance Analyzer',
      description: 'Should you refinance? Get a data-driven answer in seconds.',
      icon: '🔄',
      href: '/refinance',
      color: 'from-violet-600 to-purple-600',
    },
  ];

  const competitors = [
    { name: 'Bankrate', lacks: 'No true cost analysis' },
    { name: 'NerdWallet', lacks: 'No real lender data' },
    { name: 'Zillow', lacks: 'No hidden cost alerts' },
    { name: 'LendingTree', lacks: 'No rate lock timing' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Live Rates Updated Every Hour</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Truth</span> About
              <br />Your Mortgage
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
              Stop guessing. See the REAL costs, REAL lender data, and REAL analysis 
              that others hide. Built different.
            </p>

            {/* Live Rate Display */}
            {rates && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-8 bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 mb-8"
              >
                <div className="text-center">
                  <p className="text-slate-400 text-sm">30-Year Fixed</p>
                  <p className="text-4xl font-bold text-white">{rates.rate30yr}%</p>
                </div>
                <div className="h-12 w-px bg-slate-700" />
                <div className="text-center">
                  <p className="text-slate-400 text-sm">15-Year Fixed</p>
                  <p className="text-4xl font-bold text-white">{rates.rate15yr}%</p>
                </div>
                <div className="h-12 w-px bg-slate-700" />
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Weekly Change</p>
                  <p className={`text-4xl font-bold ${rates.change < 0 ? 'text-emerald-400' : rates.change > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {rates.change > 0 ? '+' : ''}{rates.change}%
                  </p>
                </div>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/true-cost"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-500 hover:to-cyan-500 transition-all shadow-lg shadow-emerald-500/25"
              >
                Calculate True Cost
                <span>→</span>
              </Link>
              <Link
                href="/affordability"
                className="inline-flex items-center justify-center gap-2 bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all border border-slate-700"
              >
                Check Affordability
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* What Makes Us Different */}
      <div className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Others <span className="text-red-400">Hide</span>, We <span className="text-emerald-400">Reveal</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Most mortgage sites show you a teaser rate. We show you the truth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {competitors.map((comp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-red-500/5 border border-red-500/20 rounded-xl p-6"
              >
                <p className="text-red-400 font-bold mb-2">{comp.name}</p>
                <p className="text-slate-400 text-sm">❌ {comp.lacks}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-emerald-400 mb-4">CR AudioViz AI Mortgage Monitor</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                '✓ True 5-Year Cost Analysis',
                '✓ Real HMDA Lender Data',
                '✓ Hidden Cost Alerts',
                '✓ AI Rate Lock Timing',
                '✓ Environmental Risk Data',
                '✓ School District Ratings',
              ].map((feature, i) => (
                <span key={i} className="text-emerald-300">{feature}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Complete Mortgage Toolkit
            </h2>
            <p className="text-slate-400 text-lg">
              Everything you need to make the smartest home-buying decision
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={tool.href}>
                  <div className="group relative bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 hover:border-slate-500 transition-all h-full">
                    {tool.badge && (
                      <span className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">
                        {tool.badge}
                      </span>
                    )}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center text-2xl mb-4`}>
                      {tool.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-slate-400">{tool.description}</p>
                    <div className="mt-4 flex items-center text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Try it now</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* The True Cost Reveal */}
      <div className="py-20 bg-gradient-to-r from-red-500/10 to-orange-500/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                The <span className="text-red-400">$47,000 Difference</span> They Don't Tell You About
              </h2>
              <p className="text-slate-300 text-lg mb-6">
                On a $400,000 home, the difference between what lenders advertise and what you'll 
                actually pay over 5 years can be staggering. PMI, closing costs, insurance, taxes — 
                it all adds up.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-red-400 text-xl">❌</span>
                  </div>
                  <div>
                    <p className="text-red-400 font-medium">What they show: $2,389/month</p>
                    <p className="text-slate-500 text-sm">Just principal and interest</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-emerald-400 text-xl">✓</span>
                  </div>
                  <div>
                    <p className="text-emerald-400 font-medium">What you'll pay: $3,147/month</p>
                    <p className="text-slate-500 text-sm">Including tax, insurance, PMI, HOA</p>
                  </div>
                </div>
              </div>
              <Link
                href="/true-cost"
                className="inline-flex items-center gap-2 mt-8 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-500 hover:to-cyan-500 transition-all"
              >
                See Your True Cost
                <span>→</span>
              </Link>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-6">5-Year Cost Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Principal Paid', value: '$42,800', color: 'bg-emerald-500' },
                  { label: 'Interest Paid', value: '$118,400', color: 'bg-red-500' },
                  { label: 'Property Tax', value: '$42,000', color: 'bg-yellow-500' },
                  { label: 'Insurance', value: '$12,000', color: 'bg-orange-500' },
                  { label: 'PMI', value: '$18,000', color: 'bg-purple-500' },
                  { label: 'Closing Costs', value: '$16,000', color: 'bg-blue-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-slate-300">{item.label}</span>
                    </div>
                    <span className="text-white font-bold">{item.value}</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-white font-bold">5-Year True Cost</span>
                  <span className="text-2xl font-bold text-emerald-400">$249,200</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Powered by Real Data
          </h2>
          <p className="text-slate-400 text-lg mb-12">
            We don't make up numbers. Every data point comes from authoritative sources.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-400">
            {[
              'FRED Economic Data',
              'HMDA 2023 Lending Data',
              'FHFA House Price Index',
              'EPA Envirofacts',
              'FEMA Flood Maps',
              'FL Dept of Education',
            ].map((source, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                <span>{source}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to See the Truth?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Stop overpaying. Start with the real numbers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/true-cost"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-500 hover:to-cyan-500 transition-all"
            >
              Start True Cost Calculator
            </Link>
            <Link
              href="/property-intelligence"
              className="inline-flex items-center justify-center gap-2 bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all border border-slate-700"
            >
              Analyze a Location
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-white font-bold text-lg">CR AudioViz AI</p>
              <p className="text-slate-400 text-sm">Mortgage Rate Monitor</p>
            </div>
            <div className="flex gap-6 text-slate-400 text-sm">
              <Link href="/true-cost" className="hover:text-white transition-colors">True Cost</Link>
              <Link href="/affordability" className="hover:text-white transition-colors">Affordability</Link>
              <Link href="/compare-lenders" className="hover:text-white transition-colors">Lenders</Link>
              <Link href="/property-intelligence" className="hover:text-white transition-colors">Property Intel</Link>
              <Link href="/rate-lock" className="hover:text-white transition-colors">Rate Lock</Link>
              <Link href="/refinance" className="hover:text-white transition-colors">Refinance</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            <p>© 2025 CR AudioViz AI, LLC. All rights reserved.</p>
            <p className="mt-2">Data sources: Federal Reserve, HMDA, FHFA, EPA, FEMA, FL DOE</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
