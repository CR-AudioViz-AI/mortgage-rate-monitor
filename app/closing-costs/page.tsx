// CR AudioViz AI - Mortgage Rate Monitor
// Closing Costs Breakdown Calculator
// December 23, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RotatingAds from '@/components/RotatingAds';

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

// State transfer tax rates (per $500 of home price)
const TRANSFER_TAX_RATES: Record<string, number> = {
  'AL': 0.50, 'AK': 0, 'AZ': 0, 'AR': 1.10, 'CA': 1.10, 'CO': 0.01, 'CT': 7.50,
  'DE': 4.00, 'FL': 7.00, 'GA': 1.00, 'HI': 1.50, 'ID': 0, 'IL': 0.50, 'IN': 0,
  'IA': 0.80, 'KS': 0, 'KY': 0.50, 'LA': 0, 'ME': 2.20, 'MD': 5.00, 'MA': 4.56,
  'MI': 7.50, 'MN': 3.30, 'MS': 0, 'MO': 0, 'MT': 0, 'NE': 2.25, 'NV': 1.95,
  'NH': 7.50, 'NJ': 4.00, 'NM': 0, 'NY': 4.00, 'NC': 2.00, 'ND': 0, 'OH': 1.00,
  'OK': 0.75, 'OR': 0, 'PA': 10.00, 'RI': 4.60, 'SC': 1.85, 'SD': 0, 'TN': 3.70,
  'TX': 0, 'UT': 0, 'VT': 6.25, 'VA': 2.50, 'WA': 7.80, 'WV': 2.20, 'WI': 3.00,
  'WY': 0, 'DC': 11.00
};

interface ClosingCost {
  name: string;
  amount: number;
  category: string;
  negotiable: boolean;
  description: string;
}

export default function ClosingCostsPage() {
  const [selectedState, setSelectedState] = useState('');
  const [homePrice, setHomePrice] = useState(400000);
  const [loanAmount, setLoanAmount] = useState(320000);
  const [isNewConstruction, setIsNewConstruction] = useState(false);
  const [costs, setCosts] = useState<ClosingCost[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('mortgageMonitor_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.state) setSelectedState(parsed.state);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    setLoanAmount(homePrice * 0.8);
  }, [homePrice]);

  useEffect(() => {
    calculateCosts();
  }, [selectedState, homePrice, loanAmount, isNewConstruction]);

  const calculateCosts = () => {
    const stateCode = selectedState || 'FL';
    const transferTaxRate = TRANSFER_TAX_RATES[stateCode] || 0;
    const transferTax = Math.round((homePrice / 500) * transferTaxRate);

    const calculatedCosts: ClosingCost[] = [
      // Lender Fees
      {
        name: 'Loan Origination Fee',
        amount: Math.round(loanAmount * 0.01),
        category: 'Lender Fees',
        negotiable: true,
        description: 'Fee charged by lender to process your loan (typically 0.5-1%)'
      },
      {
        name: 'Discount Points',
        amount: 0,
        category: 'Lender Fees',
        negotiable: true,
        description: 'Optional: Pay upfront to lower your interest rate'
      },
      {
        name: 'Application Fee',
        amount: 500,
        category: 'Lender Fees',
        negotiable: true,
        description: 'Fee to process your loan application'
      },
      {
        name: 'Underwriting Fee',
        amount: 750,
        category: 'Lender Fees',
        negotiable: true,
        description: 'Fee for evaluating and verifying your loan'
      },
      {
        name: 'Credit Report Fee',
        amount: 50,
        category: 'Lender Fees',
        negotiable: false,
        description: 'Cost to pull your credit report'
      },
      // Third Party Fees
      {
        name: 'Appraisal Fee',
        amount: 550,
        category: 'Third Party Fees',
        negotiable: false,
        description: 'Professional assessment of home value'
      },
      {
        name: 'Home Inspection',
        amount: 450,
        category: 'Third Party Fees',
        negotiable: false,
        description: 'Optional but highly recommended'
      },
      {
        name: 'Survey Fee',
        amount: isNewConstruction ? 500 : 0,
        category: 'Third Party Fees',
        negotiable: false,
        description: 'Property boundary survey (often required for new construction)'
      },
      {
        name: 'Pest Inspection',
        amount: 125,
        category: 'Third Party Fees',
        negotiable: false,
        description: 'Termite and pest inspection'
      },
      // Title & Recording
      {
        name: 'Title Search',
        amount: 300,
        category: 'Title & Recording',
        negotiable: true,
        description: 'Research to ensure clear title'
      },
      {
        name: 'Title Insurance (Lender)',
        amount: Math.round(loanAmount * 0.005),
        category: 'Title & Recording',
        negotiable: true,
        description: 'Protects lender against title issues'
      },
      {
        name: 'Title Insurance (Owner)',
        amount: Math.round(homePrice * 0.005),
        category: 'Title & Recording',
        negotiable: true,
        description: 'Protects you against title issues (one-time fee)'
      },
      {
        name: 'Recording Fees',
        amount: 150,
        category: 'Title & Recording',
        negotiable: false,
        description: 'Government fee to record your deed'
      },
      // Government Fees
      {
        name: 'Transfer Tax / Stamp Tax',
        amount: transferTax,
        category: 'Government Fees',
        negotiable: false,
        description: `State/local tax on property transfer (${stateCode} rate)`
      },
      // Escrow/Prepaid
      {
        name: 'Homeowners Insurance (1 yr)',
        amount: Math.round(homePrice * 0.004),
        category: 'Escrow / Prepaid',
        negotiable: false,
        description: 'First year of homeowners insurance'
      },
      {
        name: 'Property Tax Escrow',
        amount: Math.round(homePrice * 0.01 * 0.25),
        category: 'Escrow / Prepaid',
        negotiable: false,
        description: 'Initial escrow deposit (2-3 months of taxes)'
      },
      {
        name: 'Prepaid Interest',
        amount: Math.round((loanAmount * 0.07 / 365) * 15),
        category: 'Escrow / Prepaid',
        negotiable: false,
        description: 'Interest from closing to first payment (~15 days)'
      },
      // Attorney/Settlement
      {
        name: 'Attorney Fee',
        amount: ['NY', 'NJ', 'MA', 'CT', 'SC', 'GA', 'WV', 'DE'].includes(stateCode) ? 1500 : 0,
        category: 'Attorney / Settlement',
        negotiable: true,
        description: 'Required in some states for closing'
      },
      {
        name: 'Settlement/Closing Fee',
        amount: 500,
        category: 'Attorney / Settlement',
        negotiable: true,
        description: 'Fee for conducting the closing'
      },
    ];

    setCosts(calculatedCosts.filter(c => c.amount > 0));
  };

  const totalByCategory = (category: string) => {
    return costs.filter(c => c.category === category).reduce((sum, c) => sum + c.amount, 0);
  };

  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);
  const negotiableCosts = costs.filter(c => c.negotiable).reduce((sum, c) => sum + c.amount, 0);
  const percentOfPrice = ((totalCosts / homePrice) * 100).toFixed(1);

  const categories = [...new Set(costs.map(c => c.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📋 Closing Costs Breakdown</h1>
          <p className="text-slate-400">See every fee you'll pay at closing — and which ones you can negotiate</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Property Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  >
                    <option value="">Select State</option>
                    {US_STATES.map(state => (
                      <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Home Price</label>
                  <input
                    type="number"
                    value={homePrice}
                    onChange={(e) => setHomePrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Loan Amount</label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="newConstruction"
                    checked={isNewConstruction}
                    onChange={(e) => setIsNewConstruction(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="newConstruction" className="text-white">New construction</label>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl p-6 border border-emerald-500/30">
              <h3 className="text-emerald-400 font-bold mb-4">Total Closing Costs</h3>
              <p className="text-4xl font-bold text-white mb-2">${totalCosts.toLocaleString()}</p>
              <p className="text-slate-400 text-sm">{percentOfPrice}% of home price</p>
              <div className="mt-4 pt-4 border-t border-emerald-500/30">
                <p className="text-emerald-300 text-sm">
                  💡 Potentially negotiable: ${negotiableCosts.toLocaleString()}
                </p>
              </div>
            </div>

            <RotatingAds variant="sidebar" showMultiple={1} interval={12000} />
          </div>

          {/* Costs Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {categories.map(category => (
              <div key={category} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">{category}</h3>
                  <span className="text-emerald-400 font-bold">
                    ${totalByCategory(category).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-3">
                  {costs.filter(c => c.category === category).map((cost, idx) => (
                    <div 
                      key={idx} 
                      className="flex justify-between items-start p-3 bg-slate-900/50 rounded-xl"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{cost.name}</span>
                          {cost.negotiable && (
                            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
                              Negotiable
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-xs mt-1">{cost.description}</p>
                      </div>
                      <span className="text-white font-medium">${cost.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Cash Needed at Closing */}
            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl p-6 border border-blue-500/30">
              <h3 className="text-blue-400 font-bold mb-4">💵 Cash Needed at Closing</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                  <p className="text-slate-400 text-sm">Down Payment</p>
                  <p className="text-2xl font-bold text-white">${(homePrice - loanAmount).toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                  <p className="text-slate-400 text-sm">Closing Costs</p>
                  <p className="text-2xl font-bold text-white">${totalCosts.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-blue-500/20 rounded-xl">
                  <p className="text-blue-300 text-sm">Total Cash Needed</p>
                  <p className="text-2xl font-bold text-blue-400">${((homePrice - loanAmount) + totalCosts).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-bold mb-4">💡 Tips to Reduce Closing Costs</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>✓ Shop around and compare Loan Estimates from multiple lenders</li>
                <li>✓ Ask the seller for closing cost credits (seller concessions)</li>
                <li>✓ Negotiate lender fees marked as "negotiable"</li>
                <li>✓ Close at the end of the month to reduce prepaid interest</li>
                <li>✓ Ask about no-closing-cost loans (higher rate, but $0 upfront)</li>
                <li>✓ Look for first-time buyer programs that cover closing costs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
