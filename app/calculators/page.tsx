'use client';

import React, { useState } from 'react';
import AffordabilityCalculator from '@/components/calculators/AffordabilityCalculator';
import MortgagePaymentCalculator from '@/components/calculators/MortgagePaymentCalculator';
import RentVsBuyCalculator from '@/components/calculators/RentVsBuyCalculator';
import RefinanceCalculator from '@/components/calculators/RefinanceCalculator';
import ExtraPaymentCalculator from '@/components/calculators/ExtraPaymentCalculator';

type CalculatorType = 'affordability' | 'payment' | 'rentbuy' | 'refinance' | 'extra';

const calculators = [
  {
    id: 'affordability' as CalculatorType,
    name: 'Affordability',
    icon: '🏠',
    description: 'Calculate how much home you can afford',
    component: AffordabilityCalculator,
  },
  {
    id: 'payment' as CalculatorType,
    name: 'Payment',
    icon: '💰',
    description: 'Calculate your monthly mortgage payment',
    component: MortgagePaymentCalculator,
  },
  {
    id: 'rentbuy' as CalculatorType,
    name: 'Rent vs Buy',
    icon: '⚖️',
    description: 'Compare renting versus buying',
    component: RentVsBuyCalculator,
  },
  {
    id: 'refinance' as CalculatorType,
    name: 'Refinance',
    icon: '🔄',
    description: 'Analyze refinancing your mortgage',
    component: RefinanceCalculator,
  },
  {
    id: 'extra' as CalculatorType,
    name: 'Extra Payments',
    icon: '⚡',
    description: 'See savings from extra payments',
    component: ExtraPaymentCalculator,
  },
];

export default function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('affordability');

  const ActiveComponent = calculators.find((calc) => calc.id === activeCalculator)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mortgage Calculators
          </h1>
          <p className="text-gray-600">
            Free tools to help you make informed home financing decisions
          </p>
        </div>
      </div>

      {/* Calculator Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {calculators.map((calc) => (
              <button
                key={calc.id}
                onClick={() => setActiveCalculator(calc.id)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeCalculator === calc.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{calc.icon}</span>
                  <span>{calc.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculator Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {ActiveComponent && <ActiveComponent />}
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Ready to Compare Lenders?
          </h2>
          <p className="text-blue-100 mb-6">
            Get personalized rate quotes from top lenders
          </p>
          <a
            href="/compare"
            className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Compare Rates Now
          </a>
        </div>
      </div>

      {/* SEO Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Understanding Mortgage Calculators
          </h2>
          <p className="text-gray-600 mb-6">
            Mortgage calculators are essential tools for home buyers, helping you understand
            the financial implications of your home purchase. Whether you're a first-time
            buyer or looking to refinance, these calculators provide valuable insights into
            your mortgage options.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Affordability Calculator
              </h3>
              <p className="text-sm text-gray-600">
                Determine how much home you can afford based on your income, debts, and
                down payment. This calculator uses the 28/36 rule to ensure you don't
                overextend yourself financially.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Calculator
              </h3>
              <p className="text-sm text-gray-600">
                Calculate your exact monthly mortgage payment including principal, interest,
                taxes, insurance, and other costs. View a detailed amortization schedule to
                see how your loan balance decreases over time.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Rent vs Buy Calculator
              </h3>
              <p className="text-sm text-gray-600">
                Make an informed decision about whether to rent or buy. This calculator
                considers home appreciation, investment returns, and the long-term financial
                impact of both options.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Refinance Calculator
              </h3>
              <p className="text-sm text-gray-600">
                Determine if refinancing makes financial sense. Calculate your break-even
                point, potential savings, and see how a lower rate can reduce your total
                interest paid.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Why Use Multiple Calculators?
          </h3>
          <p className="text-gray-600 mb-4">
            Each calculator serves a unique purpose in your home buying journey:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>
              <strong>Start with affordability</strong> - Know your budget before house
              hunting
            </li>
            <li>
              <strong>Use payment calculator</strong> - Understand exact monthly costs for
              specific homes
            </li>
            <li>
              <strong>Compare rent vs buy</strong> - Make the right long-term financial
              decision
            </li>
            <li>
              <strong>Check refinance options</strong> - Save money on your existing
              mortgage
            </li>
            <li>
              <strong>Explore extra payments</strong> - Pay off your loan faster and save
              thousands
            </li>
          </ul>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              💡 Pro Tip: Compare Multiple Scenarios
            </h3>
            <p className="text-sm text-gray-600">
              Don't just calculate once! Try different scenarios with various down payments,
              interest rates, and loan terms. This helps you understand how small changes can
              significantly impact your monthly payment and total cost over the life of the
              loan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
