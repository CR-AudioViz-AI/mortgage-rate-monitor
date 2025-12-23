// CR AudioViz AI - Mortgage Rate Monitor
// NATIONAL HOMEPAGE - For All US Homebuyers
// December 22, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RateData {
  rate30yr: number;
  rate15yr: number;
  fhaRate: number;
  vaRate: number;
  change: number;
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'Washington D.C.' },
];

export default function HomePage() {
  const [rates, setRates] = useState<RateData | null>(null);
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    fetch('/api/mortgage/rates')
      .then(r => r.json())
      .then(data => {
        if (data.rates) {
          setRates({
            rate30yr: data.rates.thirtyYear,
            rate15yr: data.rates.fifteenYear,
            fhaRate: data.rates.fhaRate,
            vaRate: data.rates.vaRate,
            change: data.rates.weeklyChange,
          });
        }
      })
      .catch(console.error);
  }, []);

  const tools = [
    {
      title: 'True Cost Calculator',
      description: 'See what you\'ll REALLY pay — not just the advertised rate. Includes closing costs, PMI, taxes, insurance, and 5-year total cost analysis.',
      icon: '💰',
      href: '/true-cost',
      color: 'from-emerald-600 to-teal-600',
      badge: 'Most Popular',
    },
    {
      title: 'Affordability Calculator',
      description: 'How much home can you afford? Real-time DTI analysis with comfortable, maximum, and stretch scenarios based on your income.',
      icon: '🏠',
      href: '/affordability',
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Lender Comparison',
      description: 'Compare lenders using real HMDA approval data. See actual approval rates, closing times, and CFPB reputation scores.',
      icon: '🏦',
      href: '/compare-lenders',
      color: 'from-blue-600 to-indigo-600',
      badge: 'Real Data',
    },
    {
      title: 'Property Intelligence',
      description: 'Everything about your location: school ratings, property taxes, flood zones, environmental risks, and market trends.',
      icon: '📍',
      href: '/property-intelligence',
      color: 'from-cyan-600 to-teal-600',
      badge: 'New',
    },
    {
      title: 'Rate Lock Advisor',
      description: 'Should you lock today or wait? AI-powered timing recommendations based on market volatility, trends, and economic events.',
      icon: '🔒',
      href: '/rate-lock',
      color: 'from-amber-600 to-orange-600',
    },
    {
      title: 'Refinance Analyzer',
      description: 'Should you refinance? Instant break-even analysis, monthly savings projection, and lifetime cost comparison.',
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
              Live Rates • Updated Daily • All 50 States
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              The Mortgage Calculator<br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                That Tells the Truth
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              See what you&apos;ll REALLY pay. Compare real lender data. Make confident decisions.
              Trusted by homebuyers nationwide.
            </p>

            {/* State Selector */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-xl w-64 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select Your State</option>
                {US_STATES.map(state => (
                  <option key={state.code} value={state.code}>{state.name}</option>
                ))}
              </select>
              <Link href="/true-cost">
                <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 transition-all">
                  Calculate My True Cost →
                </button>
              </Link>
            </div>

            {/* Live Rates Display */}
            {rates && (
              <div className="inline-flex flex-wrap justify-center gap-4 md:gap-6 bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <div className="text-center px-4 md:px-6">
                  <p className="text-slate-400 text-sm mb-1">30-Year Fixed</p>
                  <p className="text-3xl md:text-4xl font-bold text-white">{rates.rate30yr}%</p>
                </div>
                <div className="w-px bg-slate-700 hidden md:block" />
                <div className="text-center px-4 md:px-6">
                  <p className="text-slate-400 text-sm mb-1">15-Year Fixed</p>
                  <p className="text-3xl md:text-4xl font-bold text-white">{rates.rate15yr}%</p>
                </div>
                <div className="w-px bg-slate-700 hidden md:block" />
                <div className="text-center px-4 md:px-6">
                  <p className="text-slate-400 text-sm mb-1">FHA 30-Year</p>
                  <p className="text-3xl md:text-4xl font-bold text-white">{rates.fhaRate}%</p>
                </div>
                <div className="w-px bg-slate-700 hidden md:block" />
                <div className="text-center px-4 md:px-6">
                  <p className="text-slate-400 text-sm mb-1">Weekly Change</p>
                  <p className={`text-3xl md:text-4xl font-bold ${rates.change <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {rates.change > 0 ? '+' : ''}{rates.change}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-slate-800/30 border-y border-slate-700/50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Real HMDA Lender Data
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> FRED Federal Reserve Rates
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> All 50 States Supported
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> 100% Free to Use
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> No Login Required
            </div>
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
              &quot;$2,500/month at 6.5%&quot;<br />
              Just principal &amp; interest. No closing costs. No PMI. No taxes. No insurance. Not reality.
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl p-6 border border-emerald-500/30">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-white mb-2">What We Show</h3>
            <p className="text-slate-400">
              &quot;$3,450/month TOTAL&quot;<br />
              Including property taxes, homeowners insurance, PMI, HOA. Plus 5-year true cost analysis.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Real Data</h3>
            <p className="text-slate-400">
              HMDA lender approval rates. FRED mortgage data. EPA environmental data. FEMA flood maps. Not estimates — facts.
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Powerful Free Tools</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Everything you need to make confident mortgage decisions — completely free
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
                  Try it free →
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
              <p className="text-3xl font-bold text-white">8,000+</p>
              <p className="text-slate-400 text-sm">Lenders Nationwide</p>
            </div>
            <div>
              <span className="text-3xl mb-2 block">📍</span>
              <p className="text-3xl font-bold text-white">50</p>
              <p className="text-slate-400 text-sm">States Covered</p>
            </div>
            <div>
              <span className="text-3xl mb-2 block">📊</span>
              <p className="text-3xl font-bold text-white">2M+</p>
              <p className="text-slate-400 text-sm">HMDA Data Points</p>
            </div>
            <div>
              <span className="text-3xl mb-2 block">🔄</span>
              <p className="text-3xl font-bold text-white">Daily</p>
              <p className="text-slate-400 text-sm">Rate Updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* State-Specific Section */}
      {selectedState && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-3xl p-8 md:p-12 border border-cyan-500/20">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Personalized for {US_STATES.find(s => s.code === selectedState)?.name} 🏠
              </h2>
              <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                Get state-specific data including local lender approval rates, county property taxes, 
                school ratings, flood zones, and environmental information.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={`/compare-lenders?state=${selectedState}`}>
                  <button className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 transition-all">
                    🏦 {US_STATES.find(s => s.code === selectedState)?.name} Lenders
                  </button>
                </Link>
                <Link href={`/property-intelligence?state=${selectedState}`}>
                  <button className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 transition-all">
                    📍 Property Data
                  </button>
                </Link>
                <Link href="/true-cost">
                  <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all">
                    💰 Calculate True Cost
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* For Professionals */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-slate-800/50 rounded-3xl p-8 md:p-12 border border-slate-700">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-emerald-400 text-sm font-medium">FOR PROFESSIONALS</span>
              <h2 className="text-3xl font-bold text-white mt-2 mb-4">
                Are You a Lender or Real Estate Agent?
              </h2>
              <p className="text-slate-300 mb-6">
                Get your institution listed, access premium features, or partner with us to reach 
                homebuyers actively searching for mortgages.
              </p>
              <ul className="space-y-3 text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Featured lender placement
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Lead generation tools
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> White-label calculators
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> API access
                </li>
              </ul>
              <Link href="/pricing">
                <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-500 hover:to-teal-500 transition-all">
                  View Professional Plans →
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-white">$0</p>
                <p className="text-slate-400 text-sm">Free for Homebuyers</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-emerald-400">Pro</p>
                <p className="text-slate-400 text-sm">$9.99/month</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-400">Agent</p>
                <p className="text-slate-400 text-sm">$29.99/month</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-purple-400">Lender</p>
                <p className="text-slate-400 text-sm">Contact Us</p>
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
                The mortgage calculator that tells the truth. Free for all homebuyers nationwide.
              </p>
              <p className="text-slate-500 text-xs mt-4">
                Built by CR AudioViz AI
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Calculators</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/true-cost" className="text-slate-400 hover:text-white">True Cost Calculator</Link></li>
                <li><Link href="/affordability" className="text-slate-400 hover:text-white">Affordability</Link></li>
                <li><Link href="/refinance" className="text-slate-400 hover:text-white">Refinance Analyzer</Link></li>
                <li><Link href="/rate-lock" className="text-slate-400 hover:text-white">Rate Lock Advisor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Research</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/compare-lenders" className="text-slate-400 hover:text-white">Compare Lenders</Link></li>
                <li><Link href="/property-intelligence" className="text-slate-400 hover:text-white">Property Intelligence</Link></li>
                <li><Link href="/market-trends" className="text-slate-400 hover:text-white">Market Trends</Link></li>
                <li><Link href="/dashboard" className="text-slate-400 hover:text-white">Dashboard</Link></li>
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
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 CR AudioViz AI, LLC. All rights reserved.
            </p>
            <p className="text-slate-600 text-xs">
              Your Story. Our Design. Everyone connects. Everyone wins.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
