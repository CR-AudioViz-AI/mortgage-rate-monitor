// CR AudioViz AI - Mortgage Rate Monitor
// Pricing Page - Free, Pro, Agent tiers
// December 14, 2025

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Check, X, Zap, Crown, Building2, Star,
  Bell, BarChart3, Download, Users, Code,
  Shield, Clock, Calculator, TrendingUp
} from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for homebuyers researching rates',
    price: 0,
    priceMonthly: 0,
    icon: Star,
    color: 'gray',
    features: [
      { text: 'View all current rates', included: true },
      { text: 'Compare up to 5 lenders/day', included: true },
      { text: '1 rate alert', included: true },
      { text: '30-day historical data', included: true },
      { text: 'All calculators', included: true },
      { text: 'Unlimited lender views', included: false },
      { text: 'Export to CSV', included: false },
      { text: '5+ year historical data', included: false },
      { text: 'Saved lender lists', included: false },
      { text: 'Embeddable widget', included: false },
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious homebuyers & homeowners',
    price: 9.99,
    priceMonthly: 9.99,
    priceYearly: 99,
    icon: Zap,
    color: 'blue',
    features: [
      { text: 'View all current rates', included: true },
      { text: 'Unlimited lender comparisons', included: true },
      { text: '5 rate alerts', included: true },
      { text: '5-year historical data', included: true },
      { text: 'All calculators', included: true },
      { text: 'Unlimited lender views', included: true },
      { text: 'Export to CSV', included: true },
      { text: '3 saved lender lists', included: true },
      { text: 'Email support', included: true },
      { text: 'Embeddable widget', included: false },
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    id: 'agent',
    name: 'Agent & Broker',
    description: 'For real estate professionals',
    price: 29.99,
    priceMonthly: 29.99,
    priceYearly: 299,
    icon: Building2,
    color: 'purple',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: '25 rate alerts', included: true },
      { text: 'All historical data (1971+)', included: true },
      { text: 'Unlimited saved lender lists', included: true },
      { text: 'Embeddable rate widget', included: true, highlight: true },
      { text: 'Branded share links', included: true, highlight: true },
      { text: 'Client rate notifications', included: true, highlight: true },
      { text: 'Market report PDFs', included: true },
      { text: 'Priority email support', included: true },
      { text: 'API access (coming soon)', included: true },
    ],
    cta: 'Start Agent Trial',
    popular: false,
  },
];

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes! You can cancel your subscription at any time. Your access continues until the end of your billing period.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes, Pro and Agent plans include a 7-day free trial. No credit card required to start.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover) through our secure Stripe payment processor.',
  },
  {
    q: 'Can I upgrade or downgrade?',
    a: 'Absolutely. You can change your plan at any time. Upgrades take effect immediately; downgrades apply at your next billing cycle.',
  },
  {
    q: 'What is the embeddable widget?',
    a: 'A code snippet you can add to your website that displays live mortgage rates. Perfect for real estate agents and mortgage brokers.',
  },
  {
    q: 'Where does the rate data come from?',
    a: 'Our rates come from Freddie Mac via the Federal Reserve (FRED). These are the official Primary Mortgage Market Survey rates, the gold standard for mortgage rate data.',
  },
];

export default function PricingPage() {
  const { user, profile } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.price === 0) return 0;
    return billingCycle === 'yearly' ? (plan.priceYearly || plan.price * 10) : plan.priceMonthly;
  };

  const getPriceDisplay = (plan: typeof plans[0]) => {
    const price = getPrice(plan);
    if (price === 0) return 'Free';
    return `$${price}${billingCycle === 'yearly' ? '/year' : '/mo'}`;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (!plan.priceYearly) return 0;
    const monthlyCost = plan.priceMonthly * 12;
    return monthlyCost - plan.priceYearly;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Start free and upgrade when you need more. No hidden fees, cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center bg-white/10 backdrop-blur rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                billingCycle === 'monthly' ? 'bg-white text-blue-600' : 'text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                billingCycle === 'yearly' ? 'bg-white text-blue-600' : 'text-white'
              }`}
            >
              Yearly <span className="text-green-300 ml-1">Save 17%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = profile?.subscription_tier === plan.id;
            const savings = getSavings(plan);

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center text-sm font-medium py-1">
                    Most Popular
                  </div>
                )}

                <div className={`p-6 ${plan.popular ? 'pt-10' : ''}`}>
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.color === 'gray' ? 'bg-gray-100' :
                      plan.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        plan.color === 'gray' ? 'text-gray-600' :
                        plan.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price === 0 ? 'Free' : `$${getPrice(plan)}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500">
                          /{billingCycle === 'yearly' ? 'year' : 'mo'}
                        </span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && savings > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Save ${savings}/year
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  {isCurrentPlan ? (
                    <div className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-xl text-center">
                      Current Plan
                    </div>
                  ) : (
                    <Link
                      href={user ? `/checkout?plan=${plan.id}&cycle=${billingCycle}` : `/login?redirect=/pricing`}
                      className={`block w-full py-3 font-semibold rounded-xl text-center transition ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : plan.id === 'agent'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  )}

                  {/* Features */}
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className={`w-5 h-5 flex-shrink-0 ${
                            feature.highlight ? 'text-purple-600' : 'text-green-600'
                          }`} />
                        ) : (
                          <X className="w-5 h-5 flex-shrink-0 text-gray-300" />
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.text}
                          {feature.highlight && (
                            <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                              Agent Exclusive
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          What's Included in Every Plan
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: TrendingUp, title: 'Live Rates', desc: 'Updated weekly from Freddie Mac' },
            { icon: Shield, title: 'Official Data', desc: 'Federal Reserve (FRED) source' },
            { icon: Calculator, title: 'All Calculators', desc: 'Affordability, payment, refinance' },
            { icon: Users, title: '390+ Lenders', desc: 'Compare nationwide lenders' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Features */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for Real Estate Professionals</h2>
            <p className="text-purple-100 max-w-2xl mx-auto">
              The Agent plan gives you tools to impress clients and close more deals
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Embeddable Widget',
                desc: 'Add live mortgage rates to your website with a simple code snippet. Keeps visitors on your site longer.',
                icon: Code,
              },
              {
                title: 'Branded Share Links',
                desc: 'Send clients a rates.craudiovizai.com/your-name link that showcases your professionalism.',
                icon: Users,
              },
              {
                title: 'Market Reports',
                desc: 'Generate beautiful PDF reports showing rate trends for your local market. Perfect for listings.',
                icon: BarChart3,
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-6">
                  <Icon className="w-10 h-10 mb-4 text-purple-200" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-purple-100">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make Smarter Mortgage Decisions?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of homebuyers and professionals who trust Mortgage Rate Monitor for accurate, up-to-date rate information.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={user ? '/dashboard' : '/login'}
              className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition"
            >
              Get Started Free
            </Link>
            <Link
              href="/compare"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition"
            >
              Compare Lenders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
