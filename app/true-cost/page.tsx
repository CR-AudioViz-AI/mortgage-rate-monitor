// CR AudioViz AI - Mortgage Rate Monitor
// TRUE COST CALCULATOR PAGE - The Feature That Sets Us Apart
// December 22, 2025

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrueCostResult {
  closingCosts: {
    lenderFees: { low: number; high: number };
    titleAndEscrow: number;
    recordingFees: number;
    stateSpecific: number;
    prepaidItems: { low: number; high: number };
    discountPoints: number;
    total: { low: number; high: number };
  };
  monthlyPayment: {
    principalAndInterest: number;
    pmi: number;
    propertyTax: number;
    homeownersInsurance: number;
    total: number;
  };
  fiveYearCosts: {
    totalPayments: number;
    principalPaid: number;
    interestPaid: number;
    pmiPaid: number;
    totalTrueCost: { low: number; high: number };
  };
  scenarios?: {
    withOnePoint?: any;
    fifteenYear?: any;
  };
}

const STATES = [
  { code: 'FL', name: 'Florida' },
  { code: 'TX', name: 'Texas' },
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'GA', name: 'Georgia' },
  { code: 'NC', name: 'North Carolina' },
];

const LOAN_TYPES = [
  { value: 'conventional', label: 'Conventional', description: 'Traditional loan, 3-20% down' },
  { value: 'fha', label: 'FHA', description: 'Government-backed, 3.5% down min' },
  { value: 'va', label: 'VA', description: 'Veterans, 0% down' },
  { value: 'usda', label: 'USDA', description: 'Rural areas, 0% down' },
];

const LENDER_TYPES = [
  { value: 'national', label: 'Big Bank', fees: 'Higher fees, established' },
  { value: 'credit_union', label: 'Credit Union', fees: 'Lower fees, membership required' },
  { value: 'mortgage_broker', label: 'Mortgage Broker', fees: 'Shops multiple lenders' },
  { value: 'online', label: 'Online Lender', fees: 'Lower overhead, faster' },
];

export default function TrueCostCalculator() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrueCostResult | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    propertyValue: 500000,
    downPayment: 100000,
    interestRate: 6.22,
    termYears: 30,
    creditScore: 740,
    loanType: 'conventional',
    state: 'FL',
    lenderType: 'national',
    discountPoints: 0,
  });

  const loanAmount = formData.propertyValue - formData.downPayment;
  const ltv = ((loanAmount / formData.propertyValue) * 100).toFixed(1);
  const downPaymentPercent = ((formData.downPayment / formData.propertyValue) * 100).toFixed(1);

  const calculateTrueCost = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/true-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanAmount,
          propertyValue: formData.propertyValue,
          interestRate: formData.interestRate,
          termYears: formData.termYears,
          creditScore: formData.creditScore,
          loanType: formData.loanType,
          state: formData.state,
          lenderType: formData.lenderType,
          discountPoints: formData.discountPoints,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.trueCost);
        setStep(5);
      }
    } catch (error) {
      console.error('Calculation error:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatRange = (range: { low: number; high: number }) => {
    return `${formatCurrency(range.low)} - ${formatCurrency(range.high)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            True Cost Calculator
          </h1>
          <p className="text-emerald-100 text-lg">
            See what you'll REALLY pay — not just the advertised rate
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-2">
          {['Property', 'Loan Details', 'Your Profile', 'Options', 'Results'].map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${step > i + 1 ? 'bg-emerald-500 text-white' : 
                  step === i + 1 ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/30' : 
                  'bg-slate-700 text-slate-400'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              {i < 4 && (
                <div className={`w-12 md:w-24 h-1 mx-2 rounded ${step > i + 1 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          {['Property', 'Loan', 'Profile', 'Options', 'Results'].map((label, i) => (
            <span key={i} className={step === i + 1 ? 'text-emerald-400 font-medium' : ''}>{label}</span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Property Value */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Property Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Property Value</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">$</span>
                    <input
                      type="number"
                      value={formData.propertyValue}
                      onChange={(e) => setFormData({ ...formData, propertyValue: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl py-4 px-12 text-2xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="2000000"
                    step="10000"
                    value={formData.propertyValue}
                    onChange={(e) => setFormData({ ...formData, propertyValue: Number(e.target.value) })}
                    className="w-full mt-4 accent-emerald-500"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-1">
                    <span>$100K</span>
                    <span>$2M</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Down Payment</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">$</span>
                    <input
                      type="number"
                      value={formData.downPayment}
                      onChange={(e) => setFormData({ ...formData, downPayment: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl py-4 px-12 text-2xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[5, 10, 15, 20, 25].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setFormData({ ...formData, downPayment: Math.round(formData.propertyValue * (pct / 100)) })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                          ${Math.round((formData.downPayment / formData.propertyValue) * 100) === pct
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Loan Amount</span>
                    <span className="text-2xl font-bold text-white">{formatCurrency(loanAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-400">LTV Ratio</span>
                    <span className={`font-medium ${Number(ltv) > 80 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {ltv}% {Number(ltv) > 80 && '(PMI Required)'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
              >
                Continue →
              </button>
            </motion.div>
          )}

          {/* Step 2: Loan Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Loan Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Interest Rate</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl py-4 px-6 text-2xl text-white focus:border-emerald-500 outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">%</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Current average: 6.22% (30-year fixed)</p>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Loan Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {LOAN_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, loanType: type.value })}
                        className={`p-4 rounded-xl border text-left transition-all
                          ${formData.loanType === type.value
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'}`}
                      >
                        <div className={`font-bold ${formData.loanType === type.value ? 'text-emerald-400' : 'text-white'}`}>
                          {type.label}
                        </div>
                        <div className="text-sm text-slate-400">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Loan Term</label>
                  <div className="flex gap-3">
                    {[15, 20, 30].map((term) => (
                      <button
                        key={term}
                        onClick={() => setFormData({ ...formData, termYears: term })}
                        className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all
                          ${formData.termYears === term
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                      >
                        {term} Years
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2 font-medium">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-4 px-4 text-white focus:border-emerald-500 outline-none"
                  >
                    {STATES.map((state) => (
                      <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-700 text-white py-4 rounded-xl font-bold hover:bg-slate-600 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 transition-all"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Your Profile */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Your Profile</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Credit Score</label>
                  <input
                    type="range"
                    min="580"
                    max="850"
                    value={formData.creditScore}
                    onChange={(e) => setFormData({ ...formData, creditScore: Number(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-400">Your Score</span>
                    <span className={`text-3xl font-bold ${
                      formData.creditScore >= 760 ? 'text-emerald-400' :
                      formData.creditScore >= 700 ? 'text-green-400' :
                      formData.creditScore >= 660 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {formData.creditScore}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 mt-1">
                    <span>580 (Fair)</span>
                    <span>850 (Excellent)</span>
                  </div>
                  <div className={`mt-3 p-3 rounded-lg text-sm ${
                    formData.creditScore >= 760 ? 'bg-emerald-500/10 text-emerald-300' :
                    formData.creditScore >= 700 ? 'bg-green-500/10 text-green-300' :
                    formData.creditScore >= 660 ? 'bg-yellow-500/10 text-yellow-300' : 
                    'bg-red-500/10 text-red-300'
                  }`}>
                    {formData.creditScore >= 760 ? '🌟 Excellent! You qualify for the best rates and lowest PMI.' :
                     formData.creditScore >= 700 ? '👍 Good credit. You\'ll get competitive rates.' :
                     formData.creditScore >= 660 ? '⚠️ Fair credit. Consider FHA for better terms.' :
                     '🔴 Your options may be limited. FHA is recommended.'}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Lender Type</label>
                  <div className="space-y-3">
                    {LENDER_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, lenderType: type.value })}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex justify-between items-center
                          ${formData.lenderType === type.value
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'}`}
                      >
                        <div>
                          <div className={`font-bold ${formData.lenderType === type.value ? 'text-emerald-400' : 'text-white'}`}>
                            {type.label}
                          </div>
                          <div className="text-sm text-slate-400">{type.fees}</div>
                        </div>
                        {formData.lenderType === type.value && (
                          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-slate-700 text-white py-4 rounded-xl font-bold hover:bg-slate-600 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 transition-all"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Options */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Additional Options</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Discount Points</label>
                  <p className="text-sm text-slate-500 mb-4">
                    Pay upfront to lower your rate. 1 point = 1% of loan amount = ~0.25% rate reduction
                  </p>
                  <div className="flex gap-3">
                    {[0, 0.5, 1, 1.5, 2].map((points) => (
                      <button
                        key={points}
                        onClick={() => setFormData({ ...formData, discountPoints: points })}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all
                          ${formData.discountPoints === points
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                      >
                        {points}
                      </button>
                    ))}
                  </div>
                  {formData.discountPoints > 0 && (
                    <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Points Cost:</span>
                        <span className="text-white font-medium">
                          {formatCurrency(loanAmount * (formData.discountPoints / 100))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-400">Effective Rate:</span>
                        <span className="text-emerald-400 font-medium">
                          {(formData.interestRate - (formData.discountPoints * 0.25)).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary Before Calculation */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-600">
                  <h3 className="text-lg font-bold text-white mb-4">Your Loan Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Property Value</span>
                      <div className="text-white font-medium">{formatCurrency(formData.propertyValue)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Loan Amount</span>
                      <div className="text-white font-medium">{formatCurrency(loanAmount)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Down Payment</span>
                      <div className="text-white font-medium">{formatCurrency(formData.downPayment)} ({downPaymentPercent}%)</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Interest Rate</span>
                      <div className="text-white font-medium">{formData.interestRate}%</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Loan Type</span>
                      <div className="text-white font-medium capitalize">{formData.loanType}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Term</span>
                      <div className="text-white font-medium">{formData.termYears} Years</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Credit Score</span>
                      <div className="text-white font-medium">{formData.creditScore}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">State</span>
                      <div className="text-white font-medium">{formData.state}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-slate-700 text-white py-4 rounded-xl font-bold hover:bg-slate-600 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={calculateTrueCost}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Calculating...
                    </span>
                  ) : (
                    'Calculate True Cost →'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Results */}
          {step === 5 && result && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Hero Result */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <p className="text-emerald-100 mb-2">Your 5-Year TRUE Cost</p>
                  <p className="text-5xl md:text-6xl font-bold mb-2">
                    {formatRange(result.fiveYearCosts.totalTrueCost)}
                  </p>
                  <p className="text-emerald-100">
                    This is what you'll ACTUALLY pay over 5 years (interest + closing costs + PMI)
                  </p>
                </div>
              </div>

              {/* Monthly Payment Breakdown */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Monthly Payment Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-300">Principal & Interest</span>
                    <span className="text-white font-bold">{formatCurrency(result.monthlyPayment.principalAndInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-300">Property Tax</span>
                    <span className="text-white font-bold">{formatCurrency(result.monthlyPayment.propertyTax)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-300">Homeowner's Insurance</span>
                    <span className="text-white font-bold">{formatCurrency(result.monthlyPayment.homeownersInsurance)}</span>
                  </div>
                  {result.monthlyPayment.pmi > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-yellow-400">PMI (until 80% LTV)</span>
                      <span className="text-yellow-400 font-bold">{formatCurrency(result.monthlyPayment.pmi)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 bg-emerald-500/10 rounded-lg px-3 -mx-3">
                    <span className="text-emerald-400 font-bold">TOTAL MONTHLY</span>
                    <span className="text-emerald-400 font-bold text-2xl">{formatCurrency(result.monthlyPayment.total)}</span>
                  </div>
                </div>
              </div>

              {/* Closing Costs */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Estimated Closing Costs</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-300">Lender Fees</span>
                    <span className="text-white">{formatRange(result.closingCosts.lenderFees)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-300">Title & Escrow</span>
                    <span className="text-white">{formatCurrency(result.closingCosts.titleAndEscrow)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-300">Recording Fees</span>
                    <span className="text-white">{formatCurrency(result.closingCosts.recordingFees)}</span>
                  </div>
                  {result.closingCosts.stateSpecific > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-300">State-Specific (Tax/Stamps)</span>
                      <span className="text-white">{formatCurrency(result.closingCosts.stateSpecific)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-300">Prepaid Items</span>
                    <span className="text-white">{formatRange(result.closingCosts.prepaidItems)}</span>
                  </div>
                  {result.closingCosts.discountPoints > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-300">Discount Points</span>
                      <span className="text-white">{formatCurrency(result.closingCosts.discountPoints)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 bg-red-500/10 rounded-lg px-3 -mx-3">
                    <span className="text-red-400 font-bold">TOTAL CLOSING</span>
                    <span className="text-red-400 font-bold text-xl">{formatRange(result.closingCosts.total)}</span>
                  </div>
                </div>
              </div>

              {/* 5-Year Analysis */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">5-Year Cost Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-sm">Total Payments</p>
                    <p className="text-white font-bold text-lg">{formatCurrency(result.fiveYearCosts.totalPayments)}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-sm">Principal Paid</p>
                    <p className="text-emerald-400 font-bold text-lg">{formatCurrency(result.fiveYearCosts.principalPaid)}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-sm">Interest Paid</p>
                    <p className="text-red-400 font-bold text-lg">{formatCurrency(result.fiveYearCosts.interestPaid)}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-sm">PMI Paid</p>
                    <p className="text-yellow-400 font-bold text-lg">{formatCurrency(result.fiveYearCosts.pmiPaid)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-700 text-white py-4 rounded-xl font-bold hover:bg-slate-600 transition-all"
                >
                  ← Start Over
                </button>
                <button
                  onClick={() => setShowComparison(true)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-blue-500 hover:to-indigo-500 transition-all"
                >
                  Compare Scenarios
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 transition-all"
                >
                  Save & Get Alerts
                </button>
              </div>

              {/* What Competitors Show vs What We Show */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">Why This Matters</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                    <h4 className="text-red-400 font-bold mb-2">❌ What Others Show</h4>
                    <p className="text-3xl font-bold text-white">{formatCurrency(result.monthlyPayment.principalAndInterest)}/mo</p>
                    <p className="text-slate-400 text-sm mt-1">"Your monthly payment at {formData.interestRate}%"</p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                    <h4 className="text-emerald-400 font-bold mb-2">✅ What We Show (Reality)</h4>
                    <p className="text-3xl font-bold text-white">{formatCurrency(result.monthlyPayment.total)}/mo</p>
                    <p className="text-slate-400 text-sm mt-1">True payment including taxes, insurance, PMI</p>
                  </div>
                </div>
                <p className="text-center text-slate-400 mt-4">
                  That's <span className="text-red-400 font-bold">{formatCurrency(result.monthlyPayment.total - result.monthlyPayment.principalAndInterest)}/month MORE</span> than advertised rates suggest!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
