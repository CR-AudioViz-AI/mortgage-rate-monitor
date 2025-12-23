// CR AudioViz AI - Mortgage Rate Monitor
// MAIN DASHBOARD - The Pinnacle Homepage
// December 22, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RateData {
  rate30yr: number;
  rate15yr: number;
  change: number;
}

export default function Dashboard() {
  const [rates, setRates] = useState<RateData | null>(null);

  useEffect(() => {
    fetch('/api/rates')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setRates({
            rate30yr: data.rates.thirtyYear,
            rate15yr: data.rates.fifteenYear,
            change: data.rates.weeklyChange,
          });
        }
      })
      .catch(console.error);
  }, []);

  const tools = [
    {
      title: 'True Cost Calculator',
      description: 'See what you\'ll REALLY pay — not just the advertised rate. Includes closing costs, PMI, taxes, and 5-year analysis.',
      icon: '💰',
      href: '/true-cost',
      color: 'from-emerald-600 to-teal-600',
      badge: 'Most Popular',
    },
    {
      title: 'Affordability Calculator',
      description: 'How much home can you afford? Real-time DTI analysis with comfortable, maximum, and stretch scenarios.',
      icon: '🏠',
      href: '/affordability',
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Lender Comparison',
      description: 'Real approval rates from HMDA data. CFPB reputation scores. Find the right lender for you.',
      icon: '🏦',
      href: '/compare-lenders',
      color: 'from-blue-600 to-indigo-600',
      badge: 'HMDA Data',
    },
    {
      title: 'Property Intelligence',
      description: 'Schools, property tax, flood risk, environmental hazards, market trends — all in one view.',
      icon: '📍',
      href: '/property-intelligence',
      color: 'from-cyan-600 to-teal-600',
      badge: 'New',
    },
    {
      title: 'Rate Lock Advisor',
      description: 'Should you lock today? AI-powered timing recommendations based on market volatility and trends.',
      icon: '🔒',
      href: '/rate-lock',
      color: 'from-amber-600 to-orange-600',
    },
    {
      title: 'Refinance Analyzer',
      description: 'Should you refinance? Get break-even analysis and lifetime savings projection instantly.',
      icon: '🔄',
      href: '/refinance',
      color: 'from-violet-600 to-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-bold">Mortgage Rate</span>
                <span className="text-emerald-400 font-bold ml-1">Monitor</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/true-cost" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">💰 True Cost</Link>
              <Link href="/affordability" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">📊 Affordability</Link>
              <Link href="/compare-lenders" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">🏦 Lenders</Link>
              <Link href="/property-intelligence" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">📍 Property Intel</Link>
              <Link href="/rate-lock" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">🔒 Rate Lock</Link>
              <Link href="/refinance" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">🔄 Refinance</Link>
            </div>
            <Link href="/true-cost">
              <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-emerald-500 hover:to-teal-500 transition-all">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Live Rates Updated Daily
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              The Mortgage Calculator<br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                That Tells the Truth
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              See what you&apos;ll REALLY pay. Compare real lender data. Make confident decisions.
              Built for Florida homebuyers who want the complete picture.
            </p>

            {rates && (
              <div className="inline-flex flex-wrap justify-center gap-6 bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <div className="text-center px-6">
                  <p className="text-slate-400 text-sm mb-1">30-Year Fixed</p>
                  <p className="text-4xl font-bold text-white">{rates.rate30yr}%</p>
                </div>
                <div className="w-px bg-slate-700 hidden md:block" />
                <div className="text-center px-6">
                  <p className="text-slate-400 text-sm mb-1">15-Year Fixed</p>
                  <p className="text-4xl font-bold text-white">{rates.rate15yr}%</p>
                </div>
                <div className="w-px bg-slate-700 hidden md:block" />
                <div className="text-center px-6">
                  <p className="text-slate-400 text-sm mb-1">Weekly Change</p>
                  <p className={`text-4xl font-bold ${rates.change <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {rates.change > 0 ? '+' : ''}{rates.change}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* What We Do Different */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Why We&apos;re Different</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Other calculators show you the advertised rate. We show you reality.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-2xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-white mb-2">What Others Show</h3>
            <p className="text-slate-400">
              &quot;$2,500/month at 6.22%&quot;<br />
              Just principal & interest. No closing costs. No PMI. No taxes. No reality.
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl p-6 border border-emerald-500/30">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-white mb-2">What We Show</h3>
            <p className="text-slate-400">
              &quot;$3,450/month TOTAL&quot;<br />
              Including taxes, insurance, PMI, HOA. Plus 5-year true cost analysis.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Real Data</h3>
            <p className="text-slate-400">
              HMDA lender data. FHFA market trends. EPA environmental data. Not estimates — reality.
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Powerful Tools</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Everything you need to make confident mortgage decisions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link key={tool.title} href={tool.href}>
              <div className="group relative bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 hover:border-slate-500 transition-all h-full cursor-pointer">
                {tool.badge && (
                  <span className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full">
                    {tool.badge}
                  </span>
                )}
                <div className={`w-14 h-14 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-slate-400 text-sm">
                  {tool.description}
                </p>
                <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Try it now →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-slate-800/50 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="text-3xl mb-2 block">🏦</span>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-slate-400 text-sm">Lenders Analyzed</p>
            </div>
            <div>
              <span className="text-3xl mb-2 block">📍</span>
              <p className="text-3xl font-bold text-white">12</p>
              <p className="text-slate-400 text-sm">Florida Counties</p>
            </div>
            <div>
              <span className="text-3xl mb-2 block">📊</span>
              <p className="text-3xl font-bold text-white">50K+</p>
              <p className="text-slate-400 text-sm">Data Points</p>
            </div>
            <div>
              <span className="text-3xl mb-2 block">🔄</span>
              <p className="text-3xl font-bold text-white">Daily</p>
              <p className="text-slate-400 text-sm">Updated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Florida Focus */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-3xl p-8 md:p-12 border border-cyan-500/20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Built for Florida 🌴
              </h2>
              <p className="text-slate-300 mb-6">
                Specialized data for Florida homebuyers: hurricane risk, sinkhole zones, 
                flood insurance requirements, Save Our Homes exemptions, and real county-by-county analysis.
              </p>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 12 Florida counties with detailed data</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Homestead exemption calculator</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Flood zone and insurance requirements</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Sinkhole and radon risk by county</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> School district ratings and rankings</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-4xl font-bold text-white">$420K</p>
                <p className="text-slate-400 text-sm">FL Median Home</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-4xl font-bold text-emerald-400">+5.9%</p>
                <p className="text-slate-400 text-sm">YoY Growth</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-4xl font-bold text-white">45</p>
                <p className="text-slate-400 text-sm">Avg Days on Market</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-4xl font-bold text-cyan-400">HOT</p>
                <p className="text-slate-400 text-sm">Market Status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to See the Truth?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Stop guessing. Start knowing. Get the complete picture of what your mortgage will really cost.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/true-cost">
              <button className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all">
                Calculate True Cost →
              </button>
            </Link>
            <Link href="/affordability">
              <button className="bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-all">
                Check Affordability
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Mortgage Rate Monitor</h3>
              <p className="text-slate-400 text-sm">
                The mortgage calculator that tells the truth. Built by CR AudioViz AI.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Calculators</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/true-cost" className="text-slate-400 hover:text-white">True Cost Calculator</Link></li>
                <li><Link href="/affordability" className="text-slate-400 hover:text-white">Affordability</Link></li>
                <li><Link href="/refinance" className="text-slate-400 hover:text-white">Refinance Analyzer</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Research</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/compare-lenders" className="text-slate-400 hover:text-white">Compare Lenders</Link></li>
                <li><Link href="/property-intelligence" className="text-slate-400 hover:text-white">Property Intelligence</Link></li>
                <li><Link href="/rate-lock" className="text-slate-400 hover:text-white">Rate Lock Advisor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Data Sources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>FRED (Federal Reserve)</li>
                <li>HMDA 2023</li>
                <li>FHFA House Price Index</li>
                <li>EPA / FEMA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            © 2025 CR AudioViz AI, LLC. All rights reserved. Your Story. Our Design.
          </div>
        </div>
      </footer>
    </div>
  );
}
