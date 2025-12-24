// RateUnlock - The Mortgage Calculator That Tells The Truth
// HOMEPAGE - Rebranded with Gradient Pulse Theme
// December 24, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RotatingAds, { ProductShowcase } from '@/components/RotatingAds';
import { RateUnlockLogoAnimated } from '@/components/RateUnlockLogo';

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
      color: 'from-emerald-600 via-cyan-600 to-violet-600', badge: 'Most Popular',
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
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-cyan-600/10 to-violet-600/10" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-40 right-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            {/* Animated Logo Badge */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <RateUnlockLogoAnimated size="xl" />
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-violet-500/20 rounded-full blur-xl -z-10 animate-pulse" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-violet-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-emerald-500/30">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Live Rates • Updated Daily • All 50 States
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Unlock
              </span>{' '}
              the Truth<br />
              About Your Mortgage
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Stop guessing what you&apos;ll pay. <span className="text-emerald-400 font-medium">RateUnlock</span> reveals the complete picture — 
              real lender data, hidden costs, and AI-powered insights. 10+ free tools.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-800/80 border border-slate-600 text-white px-4 py-3 rounded-xl w-64 focus:border-emerald-500 focus:outline-none backdrop-blur"
              >
                <option value="">Select Your State</option>
                {US_STATES.map(state => (
                  <option key={state.code} value={state.code}>{state.name}</option>
                ))}
              </select>
              <Link href="/true-cost">
                <button className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:from-emerald-500 hover:via-cyan-500 hover:to-violet-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40">
                  Unlock My True Cost →
                </button>
              </Link>
            </div>

            {/* Live Rates Display */}
            <div className="inline-flex flex-wrap justify-center gap-4 md:gap-6 bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <div className="text-center px-4 md:px-6">
                <p className="text-slate-400 text-sm mb-1">30-Year Fixed</p>
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {loading ? '...' : `${rates?.rate30yr.toFixed(2)}%`}
                </p>
              </div>
              <div className="w-px bg-slate-700 hidden md:block" />
              <div className="text-center px-4 md:px-6">
                <p className="text-slate-400 text-sm mb-1">15-Year Fixed</p>
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {loading ? '...' : `${rates?.rate15yr.toFixed(2)}%`}
                </p>
              </div>
              <div className="w-px bg-slate-700 hidden md:block" />
              <div className="text-center px-4 md:px-6">
                <p className="text-slate-400 text-sm mb-1">FHA 30-Year</p>
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {loading ? '...' : `${rates?.fhaRate.toFixed(2)}%`}
                </p>
              </div>
              <div className="w-px bg-slate-700 hidden md:block" />
              <div className="text-center px-4 md:px-6">
                <p className="text-slate-400 text-sm mb-1">Weekly Change</p>
                <p className={`text-3xl md:text-4xl font-bold ${rates && rates.change < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {loading ? '...' : `${rates && rates.change > 0 ? '+' : ''}${rates?.change.toFixed(2)}%`}
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
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Real HMDA Lender Data
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">✓</span> FRED Federal Reserve Rates
            </div>
            <div className="flex items-center gap-2">
              <span className="text-violet-400">✓</span> All 50 States
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> 100% Free
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">✓</span> 10+ Tools
            </div>
          </div>
        </div>
      </div>

      {/* Rotating Ads */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <RotatingAds />
      </div>

      {/* Calculators Section */}
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
              <div className="group relative bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-all h-full cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10">
                {tool.badge && (
                  <span className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/30">
                    {tool.badge}
                  </span>
                )}
                <div className={`w-14 h-14 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {tool.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:via-cyan-400 group-hover:to-violet-400 group-hover:bg-clip-text transition-all">
                  {tool.title}
                </h3>
                <p className="text-slate-400 text-sm">{tool.description}</p>
                <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Unlock now →
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
              <div className="group relative bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all h-full cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10">
                {tool.badge && (
                  <span className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 text-xs px-2 py-1 rounded-full border border-cyan-500/30">
                    {tool.badge}
                  </span>
                )}
                <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {tool.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
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
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">10+</p>
              <p className="text-slate-400 text-sm">Free Tools</p>
            </div>
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">8,000+</p>
              <p className="text-slate-400 text-sm">Lenders</p>
            </div>
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">50</p>
              <p className="text-slate-400 text-sm">States</p>
            </div>
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">2M+</p>
              <p className="text-slate-400 text-sm">Data Points</p>
            </div>
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Daily</p>
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
        <div className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Unlock the Truth?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Stop guessing. Start knowing. Get the complete picture of what your mortgage will really cost.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/true-cost">
                <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-lg">
                  Unlock True Cost →
                </button>
              </Link>
              <Link href="/compare-lenders">
                <button className="bg-white/20 backdrop-blur text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all border border-white/30">
                  Compare Lenders
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="footerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981"/>
                      <stop offset="50%" stopColor="#06b6d4"/>
                      <stop offset="100%" stopColor="#8b5cf6"/>
                    </linearGradient>
                  </defs>
                  <circle cx="32" cy="32" r="29" fill="none" stroke="url(#footerGrad)" strokeWidth="2.5"/>
                  <circle cx="32" cy="32" r="23" fill="none" stroke="url(#footerGrad)" strokeWidth="1.5" strokeDasharray="5 2.5" opacity="0.5"/>
                  <rect x="20" y="27" width="24" height="20" rx="4" fill="url(#footerGrad)"/>
                  <path d="M25 27 L25 21 Q25 13 32 13 Q39 13 39 21 L39 27" fill="none" stroke="url(#footerGrad)" strokeWidth="4" strokeLinecap="round"/>
                  <circle cx="32" cy="35" r="3" fill="#0f172a"/>
                  <rect x="30.5" y="37" width="3" height="5" rx="1" fill="#0f172a"/>
                </svg>
                <span className="font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent text-xl">RateUnlock</span>
              </div>
              <p className="text-slate-400 text-sm">
                Unlock the truth about your mortgage. 10+ free tools for homebuyers nationwide.
              </p>
              <a href="https://craudiovizai.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 text-sm hover:text-emerald-300 mt-2 inline-block">
                A CR AudioViz AI Product
              </a>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Calculators</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/true-cost" className="text-slate-400 hover:text-emerald-400 transition-colors">True Cost Calculator</Link></li>
                <li><Link href="/affordability" className="text-slate-400 hover:text-emerald-400 transition-colors">Affordability</Link></li>
                <li><Link href="/arm-vs-fixed" className="text-slate-400 hover:text-emerald-400 transition-colors">ARM vs Fixed</Link></li>
                <li><Link href="/rent-vs-buy" className="text-slate-400 hover:text-emerald-400 transition-colors">Rent vs Buy</Link></li>
                <li><Link href="/refinance" className="text-slate-400 hover:text-emerald-400 transition-colors">Refinance Analyzer</Link></li>
                <li><Link href="/closing-costs" className="text-slate-400 hover:text-emerald-400 transition-colors">Closing Costs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Research</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/compare-lenders" className="text-slate-400 hover:text-cyan-400 transition-colors">Compare Lenders</Link></li>
                <li><Link href="/property-intelligence" className="text-slate-400 hover:text-cyan-400 transition-colors">Property Intelligence</Link></li>
                <li><Link href="/rate-lock" className="text-slate-400 hover:text-cyan-400 transition-colors">Rate Lock Advisor</Link></li>
                <li><Link href="/down-payment" className="text-slate-400 hover:text-cyan-400 transition-colors">Down Payment Help</Link></li>
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
