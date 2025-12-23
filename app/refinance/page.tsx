// CR AudioViz AI - Mortgage Rate Monitor
// REFINANCE ANALYZER - Should You Refinance?
// December 22, 2025

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface RefinanceResult {
  worthIt: boolean;
  monthlySavings: number;
  lifetimeSavings: number;
  breakEvenMonths: number;
  closingCosts: { low: number; high: number };
  newPayment: number;
  currentPayment: number;
  recommendation: string;
  analysis: {
    rateReduction: number;
    termComparison: string;
    equityPosition: string;
  };
}

export default function RefinanceAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RefinanceResult | null>(null);
  
  const [formData, setFormData] = useState({
    // Current loan
    currentBalance: 350000,
    currentRate: 7.25,
    currentPayment: 2389,
    monthsRemaining: 324,
    homeValue: 450000,
    
    // New loan
    newRate: 6.22,
    newTerm: 30,
    closingCostEstimate: 8000,
    
    // Goals
    planToStay: 5,
  });

  const calculateRefinance = async () => {
    setLoading(true);
    
    // Local calculation for immediate feedback
    const currentMonthlyRate = formData.currentRate / 100 / 12;
    const newMonthlyRate = formData.newRate / 100 / 12;
    const newTermMonths = formData.newTerm * 12;
    
    // New monthly payment
    const newPayment = Math.round(
      formData.currentBalance * 
      (newMonthlyRate * Math.pow(1 + newMonthlyRate, newTermMonths)) /
      (Math.pow(1 + newMonthlyRate, newTermMonths) - 1)
    );
    
    // Monthly savings
    const monthlySavings = formData.currentPayment - newPayment;
    
    // Break-even calculation
    const avgClosingCosts = formData.closingCostEstimate;
    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(avgClosingCosts / monthlySavings) : 999;
    
    // Lifetime savings over stay period
    const stayMonths = formData.planToStay * 12;
    const totalSavings = (monthlySavings * stayMonths) - avgClosingCosts;
    
    // LTV
    const ltv = (formData.currentBalance / formData.homeValue) * 100;
    
    // Rate reduction
    const rateReduction = formData.currentRate - formData.newRate;
    
    // Determine if worth it
    const worthIt = breakEvenMonths < stayMonths && monthlySavings > 50;
    
    let recommendation = '';
    if (rateReduction < 0.5) {
      recommendation = "Rate reduction is minimal. Refinancing may not be worth the hassle and costs.";
    } else if (breakEvenMonths > stayMonths) {
      recommendation = `You won't recover closing costs before moving. Consider refinancing only if you'll stay longer than ${breakEvenMonths} months.`;
    } else if (ltv > 80) {
      recommendation = "You may need PMI with this LTV. Factor that into your savings calculation.";
    } else if (worthIt) {
      recommendation = `Great opportunity! You'll recover closing costs in ${breakEvenMonths} months and save ${formatCurrency(totalSavings)} over ${formData.planToStay} years.`;
    } else {
      recommendation = "The numbers are borderline. Consider if the savings justify the effort.";
    }
    
    setResult({
      worthIt,
      monthlySavings,
      lifetimeSavings: totalSavings,
      breakEvenMonths,
      closingCosts: { low: avgClosingCosts * 0.8, high: avgClosingCosts * 1.2 },
      newPayment,
      currentPayment: formData.currentPayment,
      recommendation,
      analysis: {
        rateReduction,
        termComparison: formData.newTerm === 30 ? 'Same term' : formData.newTerm < 30 ? 'Shorter term - pay off faster' : 'Longer term',
        equityPosition: ltv <= 80 ? 'Good equity - no PMI needed' : ltv <= 90 ? 'Moderate equity - may need PMI' : 'Low equity - PMI required',
      },
    });
    
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

  const ltv = ((formData.currentBalance / formData.homeValue) * 100).toFixed(1);
  const equity = formData.homeValue - formData.currentBalance;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Refinance Analyzer
          </h1>
          <p className="text-violet-100 text-lg">
            Should you refinance? Get a data-driven answer in seconds.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            {/* Current Loan */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-sm">1</span>
                Your Current Loan
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm mb-1 block">Current Loan Balance</label>
                  <input
                    type="number"
                    value={formData.currentBalance}
                    onChange={(e) => setFormData({ ...formData, currentBalance: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:border-violet-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 text-sm mb-1 block">Current Rate</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.currentRate}
                        onChange={(e) => setFormData({ ...formData, currentRate: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:border-violet-500 outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm mb-1 block">Current Payment</label>
                    <input
                      type="number"
                      value={formData.currentPayment}
                      onChange={(e) => setFormData({ ...formData, currentPayment: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:border-violet-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-sm mb-1 block">Current Home Value</label>
                  <input
                    type="number"
                    value={formData.homeValue}
                    onChange={(e) => setFormData({ ...formData, homeValue: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:border-violet-500 outline-none"
                  />
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Current LTV</p>
                    <p className={`text-xl font-bold ${Number(ltv) <= 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {ltv}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Equity</p>
                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(equity)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* New Loan */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-sm">2</span>
                New Loan Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-slate-300 text-sm">New Interest Rate</label>
                    <span className="text-white font-bold">{formData.newRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="9"
                    step="0.125"
                    value={formData.newRate}
                    onChange={(e) => setFormData({ ...formData, newRate: Number(e.target.value) })}
                    className="w-full accent-violet-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>4%</span>
                    <span className="text-violet-400">Current avg: 6.22%</span>
                    <span>9%</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-sm mb-2 block">New Loan Term</label>
                  <div className="flex gap-3">
                    {[15, 20, 30].map((term) => (
                      <button
                        key={term}
                        onClick={() => setFormData({ ...formData, newTerm: term })}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all
                          ${formData.newTerm === term
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                      >
                        {term} Years
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-slate-300 text-sm">Estimated Closing Costs</label>
                    <span className="text-white font-bold">{formatCurrency(formData.closingCostEstimate)}</span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="20000"
                    step="500"
                    value={formData.closingCostEstimate}
                    onChange={(e) => setFormData({ ...formData, closingCostEstimate: Number(e.target.value) })}
                    className="w-full accent-violet-500"
                  />
                  <p className="text-slate-500 text-xs mt-1">Typically 2-5% of loan amount</p>
                </div>
              </div>
            </div>

            {/* Your Plans */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-sm">3</span>
                Your Plans
              </h2>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-300 text-sm">How long will you stay?</label>
                  <span className="text-white font-bold">{formData.planToStay} years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={formData.planToStay}
                  onChange={(e) => setFormData({ ...formData, planToStay: Number(e.target.value) })}
                  className="w-full accent-violet-500"
                />
                <p className="text-slate-500 text-xs mt-1">Critical for break-even analysis</p>
              </div>
            </div>

            <button
              onClick={calculateRefinance}
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Refinance'}
            </button>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Main Verdict */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl p-8 text-center ${
                    result.worthIt 
                      ? 'bg-gradient-to-br from-emerald-600 to-green-600' 
                      : 'bg-gradient-to-br from-orange-600 to-red-600'
                  }`}
                >
                  <span className="text-6xl mb-4 block">
                    {result.worthIt ? '✅' : '⚠️'}
                  </span>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {result.worthIt ? 'Yes, Refinance!' : 'Probably Not'}
                  </h2>
                  <p className="text-white/80">{result.recommendation}</p>
                </motion.div>

                {/* Key Numbers */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 text-center">
                    <p className="text-slate-400 text-sm">Monthly Savings</p>
                    <p className={`text-3xl font-bold ${result.monthlySavings > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.monthlySavings > 0 ? '+' : ''}{formatCurrency(result.monthlySavings)}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 text-center">
                    <p className="text-slate-400 text-sm">Break-Even</p>
                    <p className="text-3xl font-bold text-white">
                      {result.breakEvenMonths < 999 ? `${result.breakEvenMonths} mo` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 text-center">
                    <p className="text-slate-400 text-sm">{formData.planToStay}-Year Savings</p>
                    <p className={`text-3xl font-bold ${result.lifetimeSavings > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(result.lifetimeSavings)}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 text-center">
                    <p className="text-slate-400 text-sm">Closing Costs</p>
                    <p className="text-3xl font-bold text-orange-400">
                      {formatCurrency(formData.closingCostEstimate)}
                    </p>
                  </div>
                </div>

                {/* Payment Comparison */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4">Payment Comparison</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                      <div>
                        <p className="text-red-400 font-medium">Current Payment</p>
                        <p className="text-slate-400 text-sm">{formData.currentRate}% rate</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{formatCurrency(result.currentPayment)}</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                      <div>
                        <p className="text-emerald-400 font-medium">New Payment</p>
                        <p className="text-slate-400 text-sm">{formData.newRate}% rate, {formData.newTerm}yr</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{formatCurrency(result.newPayment)}</p>
                    </div>
                  </div>
                </div>

                {/* Analysis Details */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4">Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                      <span className="text-slate-400">Rate Reduction</span>
                      <span className={`font-bold ${result.analysis.rateReduction >= 0.5 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {result.analysis.rateReduction.toFixed(2)}%
                        {result.analysis.rateReduction < 0.5 && ' (minimal)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                      <span className="text-slate-400">Term</span>
                      <span className="text-white font-medium">{result.analysis.termComparison}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                      <span className="text-slate-400">Equity Position</span>
                      <span className="text-white font-medium">{result.analysis.equityPosition}</span>
                    </div>
                  </div>
                </div>

                {/* When to Refinance */}
                <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-6 border border-violet-500/30">
                  <h3 className="text-lg font-bold text-violet-400 mb-4">💡 Refinance Tips</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Generally worth it if you save 0.5%+ on rate</li>
                    <li>• Should break even within 3 years ideally</li>
                    <li>• Consider if you'll stay long enough to benefit</li>
                    <li>• Watch for rate drops - we'll alert you!</li>
                  </ul>
                </div>

                {/* Rate Alert CTA */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-2">Set a Rate Alert</h3>
                  <p className="text-slate-400 mb-4">
                    We'll notify you when rates drop to your target
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      step="0.125"
                      placeholder="Target rate (e.g., 5.5)"
                      className="flex-1 bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:border-violet-500 outline-none"
                    />
                    <button className="bg-violet-600 text-white px-6 rounded-xl font-bold hover:bg-violet-500 transition-all">
                      Alert Me
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-12 border border-slate-700 text-center">
                <span className="text-6xl mb-4 block">🔄</span>
                <h3 className="text-xl font-bold text-white mb-2">Ready to Analyze</h3>
                <p className="text-slate-400">
                  Enter your current loan details and click "Analyze Refinance"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
