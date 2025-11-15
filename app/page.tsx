'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState('');
  const [loanType, setLoanType] = useState('conventional');
  const [marketRates, setMarketRates] = useState({
    rate_30y: 6.11,
    rate_15y: 5.50,
    rate_arm: 6.13
  });

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/compare?zip=${zipCode}&loan_type=${loanType}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find Your Perfect Mortgage Rate
            </h1>
            <p className="text-2xl md:text-3xl text-blue-100 mb-8">
              Compare 500+ lenders • Save thousands • Get quotes in minutes
            </p>

            {/* Quick Search */}
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
              <form onSubmit={handleQuickSearch} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter ZIP code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                      Loan Type
                    </label>
                    <select
                      value={loanType}
                      onChange={(e) => setLoanType(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="conventional">Conventional</option>
                      <option value="fha">FHA</option>
                      <option value="va">VA</option>
                      <option value="usda">USDA</option>
                      <option value="jumbo">Jumbo</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  🔍 Compare Rates Now
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Current Market Rates */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            📊 Current National Average Rates
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">30-Year Fixed</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {marketRates.rate_30y.toFixed(2)}%
              </div>
              <p className="text-gray-600">Most popular mortgage term</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">15-Year Fixed</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {marketRates.rate_15y.toFixed(2)}%
              </div>
              <p className="text-gray-600">Pay off faster, save on interest</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">5/1 ARM</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {marketRates.rate_arm.toFixed(2)}%
              </div>
              <p className="text-gray-600">Lower initial rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose CR AudioViz Mortgage Monitor?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to find and secure the best mortgage rate
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🏦',
                title: '500+ Lenders',
                description: 'Compare rates from national banks, regional lenders, local credit unions, and online lenders all in one place'
              },
              {
                icon: '📍',
                title: 'Location-Based Filtering',
                description: 'Enter your ZIP code and see only lenders that actually service your area. No wasted time.'
              },
              {
                icon: '🎯',
                title: 'Smart Lender Types',
                description: 'Filter by national, state, regional, local, credit unions, or online-only lenders'
              },
              {
                icon: '💰',
                title: 'All Loan Types',
                description: 'Conventional, FHA, VA, USDA, Jumbo - whatever you need, we have it'
              },
              {
                icon: '📧',
                title: 'Rate Alerts',
                description: 'Get instant email notifications when rates drop to your target level'
              },
              {
                icon: '📊',
                title: 'Historical Data',
                description: '5 years of rate trends to help you time your purchase or refinance perfectly'
              },
              {
                icon: '🔐',
                title: 'You Own Your Data',
                description: 'Unlike LendingTree, we never sell your leads. You control who contacts you.'
              },
              {
                icon: '💳',
                title: 'CR AudioViz Credits',
                description: 'Use your credits across 60+ CR AudioViz tools - not just mortgages'
              },
              {
                icon: '🤝',
                title: 'Realtor Integration',
                description: 'Optional connection to partner realtors in your area for end-to-end support'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Enter Your Info', description: 'ZIP code, loan type, down payment, credit score range' },
              { step: 2, title: 'See Available Lenders', description: 'Filter by type, sort by rate, compare side-by-side' },
              { step: 3, title: 'Select & Compare', description: 'Choose up to 3 lenders to compare in detail' },
              { step: 4, title: 'Get Quotes', description: 'Submit one form, get quotes from all selected lenders' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Lenders</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-600 mb-2">$2.4M</div>
                <div className="text-gray-600">Saved for Users</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600">Happy Homebuyers</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-600 mb-2">4.8★</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Save Thousands on Your Mortgage?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Compare rates from 500+ lenders in seconds. No obligation. No hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => router.push('/compare')}
              className="px-10 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Compare Rates Now
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              View Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">CR AudioViz AI</h3>
              <p className="text-gray-400">
                Your Story. Our Design.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/compare" className="hover:text-white">Rate Comparison</a></li>
                <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="/calculators" className="hover:text-white">Calculators</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
                <li><a href="/guides" className="hover:text-white">Guides</a></li>
                <li><a href="/api" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://craudiovizai.com/about" className="hover:text-white">About</a></li>
                <li><a href="https://craudiovizai.com/contact" className="hover:text-white">Contact</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 CR AudioViz AI, LLC. All rights reserved. NMLS #TBD</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
