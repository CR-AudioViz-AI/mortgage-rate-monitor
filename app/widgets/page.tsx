// RateUnlock - Widget Generator for Partners
// Self-service embed code generation
// December 24, 2025

'use client';

import { useState } from 'react';
import Link from 'next/link';

const CALCULATORS = [
  { id: 'true-cost', name: 'True Cost Calculator', icon: '💰', description: 'Complete mortgage cost analysis with PMI, taxes, insurance' },
  { id: 'affordability', name: 'Affordability Calculator', icon: '📊', description: 'How much home can your visitors afford?' },
  { id: 'arm-vs-fixed', name: 'ARM vs Fixed', icon: '⚖️', description: 'Compare adjustable vs fixed rate mortgages' },
  { id: 'rent-vs-buy', name: 'Rent vs Buy', icon: '🏠', description: 'Should your visitors rent or buy?' },
  { id: 'refinance', name: 'Refinance Analyzer', icon: '🔄', description: 'Is refinancing worth it for your visitors?' },
  { id: 'closing-costs', name: 'Closing Costs', icon: '📋', description: 'Estimate all closing costs upfront' },
  { id: 'rate-lock', name: 'Rate Lock Advisor', icon: '🔒', description: 'AI-powered rate lock timing' },
  { id: 'down-payment', name: 'Down Payment Help', icon: '💵', description: 'Find assistance programs by state' },
  { id: 'compare-lenders', name: 'Lender Comparison', icon: '🏦', description: 'Real HMDA data on 8,000+ lenders' },
  { id: 'property-intel', name: 'Property Intelligence', icon: '📍', description: 'Schools, taxes, flood zones, market data' },
];

const THEMES = [
  { id: 'dark', name: 'Dark', preview: 'bg-slate-900' },
  { id: 'light', name: 'Light', preview: 'bg-white' },
  { id: 'auto', name: 'Auto (matches user preference)', preview: 'bg-gradient-to-r from-slate-900 to-white' },
];

export default function WidgetGeneratorPage() {
  const [selectedCalc, setSelectedCalc] = useState('true-cost');
  const [theme, setTheme] = useState('dark');
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('700');
  const [partnerId, setPartnerId] = useState('');
  const [copied, setCopied] = useState(false);

  const partnerParam = partnerId ? `&partner=${partnerId}` : '';
  const embedUrl = `https://rateunlock.com/embed/${selectedCalc}?theme=${theme}${partnerParam}`;
  
  const embedCode = `<!-- RateUnlock ${selectedCalc} Calculator -->
<iframe 
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  scrolling="no"
  style="border: none; border-radius: 16px; overflow: hidden; max-width: 100%;"
  allow="clipboard-write"
  title="RateUnlock Calculator"
></iframe>
<script>
  window.addEventListener('message', function(e) {
    if (e.data.type === 'rateunlock-resize') {
      var iframe = document.querySelector('iframe[src*="rateunlock.com"]');
      if (iframe) iframe.style.height = e.data.height + 'px';
    }
  });
</script>
<!-- Powered by RateUnlock.com - Free mortgage calculators -->`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedCalculator = CALCULATORS.find(c => c.id === selectedCalc);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981"/>
                  <stop offset="50%" stopColor="#06b6d4"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="29" fill="none" stroke="url(#navGrad)" strokeWidth="2.5"/>
              <rect x="20" y="27" width="24" height="20" rx="4" fill="url(#navGrad)"/>
              <path d="M25 27 L25 21 Q25 13 32 13 Q39 13 39 21 L39 27" fill="none" stroke="url(#navGrad)" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            <span className="font-bold text-xl">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">Rate</span>
              <span className="text-white">Unlock</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/partners" className="text-slate-400 hover:text-white text-sm">Partner Portal</Link>
            <Link href="/partners/register">
              <button className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Become a Partner
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Free for All Partners
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Embed <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">RateUnlock</span> on Your Site
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Add powerful mortgage calculators to your website in seconds. Free for everyone. 
            Premium features for registered partners.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Calculator Selection */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">1. Choose Calculator</h3>
              <div className="grid grid-cols-2 gap-3">
                {CALCULATORS.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => setSelectedCalc(calc.id)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      selectedCalc === calc.id
                        ? 'bg-emerald-500/20 border-2 border-emerald-500'
                        : 'bg-slate-700/50 border-2 border-transparent hover:border-slate-600'
                    }`}
                  >
                    <span className="text-2xl">{calc.icon}</span>
                    <p className="font-medium text-white text-sm mt-2">{calc.name}</p>
                  </button>
                ))}
              </div>
              {selectedCalculator && (
                <p className="text-slate-400 text-sm mt-4">
                  {selectedCalculator.description}
                </p>
              )}
            </div>

            {/* Theme Selection */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">2. Choose Theme</h3>
              <div className="flex gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex-1 p-4 rounded-xl transition-all ${
                      theme === t.id
                        ? 'ring-2 ring-emerald-500'
                        : 'hover:ring-2 hover:ring-slate-600'
                    }`}
                  >
                    <div className={`w-full h-12 rounded-lg ${t.preview} border border-slate-600`} />
                    <p className="text-white text-sm mt-2">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Settings */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">3. Set Dimensions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Width</label>
                  <select
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2"
                  >
                    <option value="100%">100% (Responsive)</option>
                    <option value="600px">600px</option>
                    <option value="800px">800px</option>
                    <option value="1000px">1000px</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Height</label>
                  <select
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2"
                  >
                    <option value="500">500px (Compact)</option>
                    <option value="700">700px (Standard)</option>
                    <option value="900">900px (Full)</option>
                    <option value="auto">Auto (Resize to content)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Partner ID */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">4. Partner ID (Optional)</h3>
              <p className="text-slate-400 text-sm mb-3">
                Register as a partner to track leads, customize branding, and earn commissions.
              </p>
              <input
                type="text"
                placeholder="your-partner-id"
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2"
              />
              <Link href="/partners/register" className="text-emerald-400 text-sm hover:underline mt-2 inline-block">
                Don&apos;t have a Partner ID? Register free →
              </Link>
            </div>
          </div>

          {/* Preview & Code */}
          <div className="space-y-6">
            {/* Live Preview */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Live Preview</h3>
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 text-sm hover:underline"
                >
                  Open in new tab →
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-600" style={{ height: '400px' }}>
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Calculator Preview"
                />
              </div>
            </div>

            {/* Embed Code */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Embed Code</h3>
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {copied ? '✓ Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-sm text-slate-300 border border-slate-700">
                <code>{embedCode}</code>
              </pre>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
                <p className="text-2xl font-bold text-emerald-400">10+</p>
                <p className="text-slate-400 text-sm">Calculators</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
                <p className="text-2xl font-bold text-cyan-400">Free</p>
                <p className="text-slate-400 text-sm">For Everyone</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
                <p className="text-2xl font-bold text-violet-400">$100</p>
                <p className="text-slate-400 text-sm">Per Lead*</p>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Tiers */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Partner Tiers</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                name: 'Free',
                price: '$0',
                features: ['All 10+ calculators', 'RateUnlock branding', 'Basic analytics', 'Community support'],
                cta: 'Start Free',
                highlight: false,
              },
              {
                name: 'Basic',
                price: '$99/mo',
                features: ['Everything in Free', 'Remove branding option', 'Lead capture', 'Email support', 'Custom colors'],
                cta: 'Get Started',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$299/mo',
                features: ['Everything in Basic', 'White-label domain', 'CRM integration', 'Lead routing', '$50/lead commission', 'Priority support'],
                cta: 'Most Popular',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                features: ['Everything in Pro', 'Custom development', 'API access', 'Dedicated success manager', 'SLA guarantee', 'Volume discounts'],
                cta: 'Contact Sales',
                highlight: false,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 border ${
                  tier.highlight
                    ? 'bg-gradient-to-b from-emerald-500/20 to-slate-800/50 border-emerald-500'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                {tier.highlight && (
                  <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-white mt-2">{tier.name}</h3>
                <p className="text-3xl font-bold text-white mt-2">
                  {tier.price}
                  {tier.price !== 'Custom' && <span className="text-sm text-slate-400 font-normal">/mo</span>}
                </p>
                <ul className="mt-4 space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="text-slate-400 text-sm flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full mt-6 py-2 rounded-lg font-medium ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
