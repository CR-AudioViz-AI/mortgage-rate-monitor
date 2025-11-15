'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 0,
    features: [
      'View rates from all 500+ lenders',
      'Basic mortgage calculators',
      'Compare up to 3 lenders',
      '1 rate alert',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    credits: 100,
    popular: true,
    features: [
      'Everything in Free',
      '100 CR AudioViz credits/month',
      'Unlimited lender comparisons',
      'Advanced calculators',
      'Unlimited rate alerts',
      'Document upload & storage',
      'Credit score tracking',
      'Priority email support',
      'Use credits across ALL CR AudioViz products'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    credits: 500,
    features: [
      'Everything in Pro',
      '500 CR AudioViz credits/month',
      'Dedicated mortgage specialist',
      'Custom rate analysis',
      'Pre-approval assistance',
      'Realtor matching service',
      'API access (basic)',
      'Phone support',
      'Use credits across ALL CR AudioViz products'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    credits: 2000,
    features: [
      'Everything in Premium',
      '2000 CR AudioViz credits/month',
      'Full API access',
      'White-label option',
      'Lead management CRM',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 priority support',
      'Use credits across ALL CR AudioViz products',
      'Perfect for realtors & brokers'
    ]
  }
];

// Other CR AudioViz products credits can be used on
const crossPlatformProducts = [
  { name: 'AI Video Generation', cost: '10-50 credits' },
  { name: 'AI Image Creation', cost: '5-25 credits' },
  { name: 'Document Builder', cost: '20 credits' },
  { name: 'Newsletter System', cost: '15 credits' },
  { name: 'Marketing Dashboard', cost: '30 credits' },
  { name: 'Legal AI Assistant', cost: '25 credits' },
  { name: 'Market Oracle (Stock Picks)', cost: '40 credits' },
  { name: 'CRAIverse Access', cost: '50 credits' }
];

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.id === 'free') {
      // Free plan - just redirect to signup
      router.push('/signup');
      return;
    }

    // Redirect to CR AudioViz checkout with plan
    const checkoutUrl = `https://craudiovizai.com/checkout?plan=mortgage_${plan.id}&amount=${plan.price}&credits=${plan.credits}`;
    window.location.href = checkoutUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 mt-2">
            Find the best mortgage rates and use credits across all CR AudioViz products
          </p>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors relative ${
              billingCycle === 'annual'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Annual
            <span className="absolute -top-2 -right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
              Save 20%
            </span>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-blue-500 text-white text-sm font-bold rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">
                    ${billingCycle === 'annual' ? Math.floor(plan.price * 0.8 * 12) : plan.price}
                  </span>
                  <span className="text-gray-600">
                    /{billingCycle === 'annual' ? 'year' : 'month'}
                  </span>
                </div>
                {plan.credits > 0 && (
                  <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium">
                    {billingCycle === 'annual' ? plan.credits * 12 : plan.credits} Credits
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.id === 'free' ? 'Get Started Free' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>

        {/* Credit System Explanation */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🎯 Use Credits Across All CR AudioViz Products
            </h2>
            <p className="text-xl text-gray-600">
              One subscription, unlimited possibilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {crossPlatformProducts.map((product, idx) => (
              <div
                key={idx}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="font-semibold text-gray-900 mb-1">{product.name}</div>
                <div className="text-sm text-gray-600">{product.cost}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3">How Credits Work:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Credits never expire on paid plans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Use them on any CR AudioViz product or service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Unused credits roll over month-to-month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Buy additional credits anytime at $0.25/credit</span>
              </li>
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! Upgrade or downgrade anytime. Changes take effect at the next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                What happens to unused credits?
              </h3>
              <p className="text-gray-600">
                Credits never expire on paid plans and roll over month-to-month. On free plans, credits expire monthly.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Can I use credits on other CR AudioViz products?
              </h3>
              <p className="text-gray-600">
                Absolutely! Credits work across all 60+ CR AudioViz tools including AI video, image generation, document creation, and more.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Is there a money-back guarantee?
              </h3>
              <p className="text-gray-600">
                Yes! We offer a 30-day money-back guarantee on all paid plans. No questions asked.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and ACH bank transfers for enterprise plans.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Do you offer discounts for nonprofits?
              </h3>
              <p className="text-gray-600">
                Yes! We offer 50% off for registered nonprofits, veterans, and first responders. Contact us for details.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to find your perfect mortgage rate?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of homebuyers saving money with CR AudioViz AI
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/compare')}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
            >
              Compare Rates Now
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-lg font-bold text-lg hover:border-gray-400 transition-colors"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
