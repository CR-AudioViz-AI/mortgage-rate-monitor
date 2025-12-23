// CR AudioViz AI - Mortgage Rate Monitor
// Pricing Page - Simple version
// December 22, 2025

'use client';

import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for homebuyers researching rates',
    features: [
      'View all current rates',
      'Compare up to 5 lenders/day',
      '1 rate alert',
      '30-day historical data',
      'All calculators'
    ],
    cta: 'Get Started Free',
    color: 'slate'
  },
  {
    name: 'Pro',
    price: 9.99,
    description: 'For serious homebuyers & homeowners',
    features: [
      'Everything in Free',
      'Unlimited lender comparisons',
      'Unlimited rate alerts',
      '5+ year historical data',
      'Export to CSV',
      'Saved lender lists',
      'Priority support'
    ],
    cta: 'Start Pro Trial',
    color: 'emerald',
    popular: true
  },
  {
    name: 'Agent',
    price: 29.99,
    description: 'For real estate professionals',
    features: [
      'Everything in Pro',
      'White-label reports',
      'Client management',
      'Embeddable widget',
      'API access',
      'Team accounts',
      'Custom branding'
    ],
    cta: 'Contact Sales',
    color: 'blue'
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400">
            Choose the plan that fits your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-slate-800/50 rounded-2xl p-8 border ${
                plan.popular 
                  ? 'border-emerald-500/50 ring-2 ring-emerald-500/20' 
                  : 'border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                {plan.price > 0 && <span className="text-slate-400">/month</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300">
                    <span className="text-emerald-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-emerald-400 hover:text-emerald-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
