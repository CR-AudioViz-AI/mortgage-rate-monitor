// CR AudioViz AI - Mortgage Rate Monitor
// ENHANCED HOMEPAGE - All Tools, Rotating Ads
// December 23, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RotatingAds, { ProductShowcase } from '@/components/RotatingAds';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mortgage/rates')
      .then(r => r.json())
      .then(data => {
        if (data.rates) {
          setRates({
            rate30yr: data.rates.thirtyYear || data.rates.rate30yr || 6.85,
            rate15yr: data.rates.fifteenYear || data.rates.rate15yr || 6.10,
            fhaRate: data.rates.fhaRate || 6.25,
            vaRate: data.rates.vaRate || 6.00,
            change: data.rates.weeklyChange || data.rates.change || -0.02,
          });
        }
      })
      .catch(() => {
        setRates({ rate30yr: 6.85, rate15yr: 6.10, fhaRate: 6.25, vaRate: 6.00, change: -0.02 });
      })
      .finally(() => setLoading(false));
  }, []);

  const calculators = [
    {
      title: 'True Cost Calculator',
      description: 'See what you\'ll REALLY pay — closing costs, PMI, taxes, insurance, and 5-year total cost analysis.',
      icon: '💰', href: '/true-cost',
      color: 'from-emerald-600 to-teal-600', badge: 'Most Popular',
    },
    {
      title: 'Affordability',
      description: 'How much home can you afford? Real-time DTI analysis with comfortable and stretch scenarios.',
      icon: '📊', href: '/affordability',
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'ARM vs Fixed',
      description: 'Compare adjustable-rate and fixed-rate mortgages. Find your break-even point.',
      icon: '⚖️', href: '/arm-vs-fixed',
      color: 'from-blue-600 to-indigo-600', badge: 'New',
    },
    {
      title: 'Rent vs Buy',
      description: 'Should you rent or buy? Compare total costs over time including equity building.',
      icon: '🏠', href: '/rent-vs-buy',
      color: 'from-amber-600 to-orange-600', badge: 'New',
    },
    {
      title: 'Refinance Analyzer',
      description: 'Should you refinance? Instant break-even analysis and lifetime savings projection.',
      icon: '🔄', href: '/refinance',
      color: 'from-violet-600 to-purple-600',
    },
    {
      title: 'Closing Costs',
      description: 'See every fee you\'ll pay at closing — and which ones you can negotiate.',
      icon: '📋', href: '/closing-costs',
      color: 'from-cyan-600 to-teal-600', badge: 'New',
    },
  ];

  const research = [
    {
      title: 'Compare Lenders',
      description: 'Real HMDA approval rates, current rates, closing times, and side-by-side comparison.',
      icon: '🏦', href: '/compare-lenders',
      color: 'from-blue-600 to-indigo-600', badge: 'Real Data',
    },
    {
      title: 'Property Intelligence',
      description: 'Schools, taxes, flood zones, environmental risks, and market trends for any address.',
      icon: '📍', href: '/property-intelligence',
      color: 'from-cyan-600 to-teal-600',
    },
    {
      title: 'Rate Lock Advisor',
      description: 'Should you lock today or wait? AI-powered timing based on market conditions.',
      icon: '🔒', href: '/rate-lock',
      color: 'from-amber-600 to-orange-600',
    },
    {
      title: 'Down Payment Help',
      description: 'Find federal and state programs that can help you buy with less money down.',
      icon: '💵', href: '/down-payment',
      color: 'from-emerald-600 to-green-600', badge: 'New',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
              10+ free tools trusted by homebuyers nationwide.
            </p>

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

            {/* Live Rates */}
            <div className="inline-flex flex-wrap justify-center gap-4 md:gap-6 bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <div className="text-center px-4 md:px-6">
                <p className="text-slate-400 text-sm mb-1">30-Year Fixed</p>
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {loading ? '...' : `${rates?.rate30yr}%`}
                </p>
              </div>
              <div className="w-px bg-slate-700 hidden md:block" />
              <div className="text-center px-4 md:px-6">
                <p className="text-slate-400 text-sm mb-1">15-Year Fixed</p>
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {loading ? '...' : `${rates?.rate15yr}%`}
                </p>
              </div>
              <div className="w-px bg-slate-700 hidden md:block" />
              <div className="text-center px-4 md:px-6">
                <p className="text-slate-400 text-sm mb-1">FHA 30-Year</p>
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {loading ? '...' : `${rates?.fhaRate}%`}
                </p>
              </div>
              <div className="w-px bg-slate-700 hidden md:block" />
              <div className="text-center px-4 md:px-6">
                <p className="text-slate-400 text-sm mb-1">Weekly Change</p>
                <p className={`text-3xl md:text-4xl font-bold ${!rates || rates.change <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {loading ? '...' : `${rates?.change > 0 ? '+' : ''}${rates?.change}%`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="bg-slate-800/30 border-y border-slate-700/50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Real HMDA Lender Data</div>
            <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> FRED Federal Reserve Rates</div>
            <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> All 50 States</div>
            <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 100% Free</div>
            <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 10+ Tools</div>
          </div>
        </div>
      </div>

      {/* Rotating Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <RotatingAds variant="banner" interval={10000} />
      </div>

      {/* Calculators Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">🧮 Mortgage Calculators</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Everything you need to make confident mortgage decisions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((tool) => (
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
                <p className="text-slate-400 text-sm">{tool.description}</p>
                <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Try it free →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Research Tools */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">🔍 Research Tools</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Compare lenders, analyze properties, find assistance programs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {research.map((tool) => (
            <Link key={tool.title} href={tool.href}>
              <div className="group relative bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 hover:border-slate-500 transition-all h-full cursor-pointer">
                {tool.badge && (
                  <span className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full">
                    {tool.badge}
                  </span>
                )}
                <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-slate-400 text-sm">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-slate-800/50 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-white">10+</p>
              <p className="text-slate-400 text-sm">Free Tools</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">8,000+</p>
              <p className="text-slate-400 text-sm">Lenders</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">50</p>
              <p className="text-slate-400 text-sm">States</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">2M+</p>
              <p className="text-slate-400 text-sm">Data Points</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">Daily</p>
              <p className="text-slate-400 text-sm">Updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* CR AudioViz AI Product Showcase */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ProductShowcase />
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
            <Link href="/compare-lenders">
              <button className="bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-all">
                Compare Lenders
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
                The mortgage calculator that tells the truth. 10+ free tools for homebuyers nationwide.
              </p>
              <a href="https://craudiovizai.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 text-sm hover:text-emerald-300 mt-2 inline-block">
                A CR AudioViz AI Product
              </a>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Calculators</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/true-cost" className="text-slate-400 hover:text-white">True Cost Calculator</Link></li>
                <li><Link href="/affordability" className="text-slate-400 hover:text-white">Affordability</Link></li>
                <li><Link href="/arm-vs-fixed" className="text-slate-400 hover:text-white">ARM vs Fixed</Link></li>
                <li><Link href="/rent-vs-buy" className="text-slate-400 hover:text-white">Rent vs Buy</Link></li>
                <li><Link href="/refinance" className="text-slate-400 hover:text-white">Refinance Analyzer</Link></li>
                <li><Link href="/closing-costs" className="text-slate-400 hover:text-white">Closing Costs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Research</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/compare-lenders" className="text-slate-400 hover:text-white">Compare Lenders</Link></li>
                <li><Link href="/property-intelligence" className="text-slate-400 hover:text-white">Property Intelligence</Link></li>
                <li><Link href="/rate-lock" className="text-slate-400 hover:text-white">Rate Lock Advisor</Link></li>
                <li><Link href="/down-payment" className="text-slate-400 hover:text-white">Down Payment Help</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Data Sources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>FRED (Federal Reserve)</li>
                <li>HMDA 2023</li>
                <li>FHFA House Price Index</li>
                <li>FEMA Flood Maps</li>
                <li>EPA Environmental Data</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© 2025 CR AudioViz AI, LLC. All rights reserved.</p>
            <p className="text-slate-600 text-xs">Your Story. Our Design. Everyone connects. Everyone wins.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
