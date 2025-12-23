// CR AudioViz AI - Mortgage Rate Monitor
// AFFORDABILITY CALCULATOR - How Much Home Can You Afford?
// December 22, 2025

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface AffordabilityResult {
  maxHomePrice: number;
  maxLoanAmount: number;
  monthlyPayment: {
    principalInterest: number;
    propertyTax: number;
    insurance: number;
    pmi: number;
    hoa: number;
    total: number;
  };
  dti: {
    housing: number;
    total: number;
    status: 'excellent' | 'good' | 'acceptable' | 'stretched' | 'denied';
  };
  affordabilityIndex: number;
  recommendations: string[];
  scenarios: {
    comfortable: number;
    maximum: number;
    stretch: number;
  };
}

const LOAN_TYPES = [
  { value: 'conventional', label: 'Conventional', icon: '🏠' },
  { value: 'fha', label: 'FHA', icon: '🏛️' },
  { value: 'va', label: 'VA', icon: '🎖️' },
  { value: 'usda', label: 'USDA', icon: '🌾' },
];

const DTI_STATUS_COLORS = {
  excellent: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  good: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  acceptable: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  stretched: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  denied: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

export default function AffordabilityCalculator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AffordabilityResult | null>(null);
  const [alternatives, setAlternatives] = useState<Record<string, any>>({});
  
  // Form state
  const [formData, setFormData] = useState({
    annualIncome: 85000,
    monthlyDebts: 500,
    downPayment: 50000,
    creditScore: 720,
    interestRate: 6.22,
    loanType: 'conventional',
    hoaMonthly: 0,
    county: 'LEE',
  });

  // Debounced calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateAffordability();
    }, 300);
    return () => clearTimeout(timer);
  }, [formData]);

  const calculateAffordability = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/affordability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.result);
        setAlternatives(data.alternatives || {});
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

  const monthlyIncome = formData.annualIncome / 12;

  // Visual meter for DTI
  const DTIMeter = ({ value, max, label }: { value: number; max: number; label: string }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const getColor = () => {
      if (value <= 28) return 'bg-emerald-500';
      if (value <= 36) return 'bg-green-500';
      if (value <= 43) return 'bg-yellow-500';
      if (value <= 50) return 'bg-orange-500';
      return 'bg-red-500';
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">{label}</span>
          <span className={`font-bold ${value <= 36 ? 'text-emerald-400' : value <= 43 ? 'text-yellow-400' : 'text-red-400'}`}>
            {value.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getColor()} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>0%</span>
          <span className="text-emerald-400">28%</span>
          <span className="text-yellow-400">43%</span>
          <span>{max}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Affordability Calculator
          </h1>
          <p className="text-purple-100 text-lg">
            Find out how much home you can really afford based on your income and debts
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            {/* Income */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6">Your Income & Debts</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-300 font-medium">Annual Income</label>
                    <span className="text-white font-bold">{formatCurrency(formData.annualIncome)}</span>
                  </div>
                  <input
                    type="range"
                    min="30000"
                    max="500000"
                    step="5000"
                    value={formData.annualIncome}
                    onChange={(e) => setFormData({ ...formData, annualIncome: Number(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>$30K</span>
                    <span>$500K</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">
                    Monthly: {formatCurrency(monthlyIncome)}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-300 font-medium">Monthly Debts</label>
                    <span className="text-white font-bold">{formatCurrency(formData.monthlyDebts)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="50"
                    value={formData.monthlyDebts}
                    onChange={(e) => setFormData({ ...formData, monthlyDebts: Number(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    Include: car payments, student loans, credit card minimums
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-300 font-medium">Down Payment Available</label>
                    <span className="text-white font-bold">{formatCurrency(formData.downPayment)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={formData.downPayment}
                    onChange={(e) => setFormData({ ...formData, downPayment: Number(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Loan Details */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6">Loan Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-slate-300 font-medium mb-3 block">Loan Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {LOAN_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, loanType: type.value })}
                        className={`p-3 rounded-xl border text-center transition-all
                          ${formData.loanType === type.value
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'}`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className={`text-sm font-medium ${formData.loanType === type.value ? 'text-purple-400' : 'text-white'}`}>
                          {type.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-300 font-medium">Credit Score</label>
                    <span className={`font-bold ${
                      formData.creditScore >= 760 ? 'text-emerald-400' :
                      formData.creditScore >= 700 ? 'text-green-400' :
                      formData.creditScore >= 660 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {formData.creditScore}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="580"
                    max="850"
                    value={formData.creditScore}
                    onChange={(e) => setFormData({ ...formData, creditScore: Number(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-300 font-medium">Interest Rate</label>
                    <span className="text-white font-bold">{formData.interestRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="10"
                    step="0.125"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-300 font-medium">Monthly HOA (if any)</label>
                    <span className="text-white font-bold">{formatCurrency(formData.hoaMonthly)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="25"
                    value={formData.hoaMonthly}
                    onChange={(e) => setFormData({ ...formData, hoaMonthly: Number(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Main Result */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white"
                >
                  <p className="text-purple-100 text-center mb-2">You Can Afford Up To</p>
                  <p className="text-5xl md:text-6xl font-bold text-center mb-4">
                    {formatCurrency(result.maxHomePrice)}
                  </p>
                  <p className="text-purple-100 text-center">
                    Loan Amount: {formatCurrency(result.maxLoanAmount)}
                  </p>
                </motion.div>

                {/* Scenarios */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4">Price Scenarios</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30 text-center">
                      <p className="text-emerald-400 text-xs uppercase tracking-wide mb-1">Comfortable</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(result.scenarios.comfortable)}</p>
                      <p className="text-slate-400 text-xs mt-1">Room to breathe</p>
                    </div>
                    <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30 text-center">
                      <p className="text-purple-400 text-xs uppercase tracking-wide mb-1">Maximum</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(result.scenarios.maximum)}</p>
                      <p className="text-slate-400 text-xs mt-1">Your limit</p>
                    </div>
                    <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30 text-center">
                      <p className="text-orange-400 text-xs uppercase tracking-wide mb-1">Stretch</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(result.scenarios.stretch)}</p>
                      <p className="text-slate-400 text-xs mt-1">If rates drop</p>
                    </div>
                  </div>
                </div>

                {/* Monthly Payment */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4">Estimated Monthly Payment</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-300">Principal & Interest</span>
                      <span className="text-white font-medium">{formatCurrency(result.monthlyPayment.principalInterest)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-300">Property Tax</span>
                      <span className="text-white font-medium">{formatCurrency(result.monthlyPayment.propertyTax)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-300">Insurance</span>
                      <span className="text-white font-medium">{formatCurrency(result.monthlyPayment.insurance)}</span>
                    </div>
                    {result.monthlyPayment.pmi > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                        <span className="text-yellow-400">PMI</span>
                        <span className="text-yellow-400 font-medium">{formatCurrency(result.monthlyPayment.pmi)}</span>
                      </div>
                    )}
                    {result.monthlyPayment.hoa > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                        <span className="text-slate-300">HOA</span>
                        <span className="text-white font-medium">{formatCurrency(result.monthlyPayment.hoa)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-3 bg-purple-500/10 rounded-lg px-3 -mx-3">
                      <span className="text-purple-400 font-bold">TOTAL</span>
                      <span className="text-purple-400 font-bold text-2xl">{formatCurrency(result.monthlyPayment.total)}</span>
                    </div>
                  </div>
                </div>

                {/* DTI Analysis */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4">Debt-to-Income Analysis</h3>
                  
                  <div className="space-y-6">
                    <DTIMeter value={result.dti.housing} max={50} label="Housing Ratio (Front-End)" />
                    <DTIMeter value={result.dti.total} max={60} label="Total DTI (Back-End)" />
                  </div>

                  <div className={`mt-6 p-4 rounded-xl border ${DTI_STATUS_COLORS[result.dti.status].bg} ${DTI_STATUS_COLORS[result.dti.status].border}`}>
                    <p className={`font-bold ${DTI_STATUS_COLORS[result.dti.status].text} capitalize`}>
                      {result.dti.status === 'excellent' && '🌟 Excellent Position'}
                      {result.dti.status === 'good' && '👍 Good Standing'}
                      {result.dti.status === 'acceptable' && '✓ Acceptable'}
                      {result.dti.status === 'stretched' && '⚠️ Stretched - Use Caution'}
                      {result.dti.status === 'denied' && '❌ May Not Qualify'}
                    </p>
                    <p className="text-slate-300 text-sm mt-1">
                      {result.dti.status === 'excellent' && 'Lenders will love you. You have plenty of room for unexpected expenses.'}
                      {result.dti.status === 'good' && 'You\'re in a solid position. Most lenders will approve you easily.'}
                      {result.dti.status === 'acceptable' && 'You\'ll likely qualify, but you\'re at the edge of comfort.'}
                      {result.dti.status === 'stretched' && 'This is your maximum. Consider a lower price for financial security.'}
                      {result.dti.status === 'denied' && 'Your debt load is too high. Pay down debts or increase income first.'}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {result.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                          <span className="text-lg">{rec.startsWith('⚠️') || rec.startsWith('💡') ? '' : '💡'}</span>
                          <span className="text-slate-300">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alternative Loan Types */}
                {Object.keys(alternatives).length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4">Other Loan Options</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(alternatives).map(([type, data]: [string, any]) => (
                        <button
                          key={type}
                          onClick={() => setFormData({ ...formData, loanType: type })}
                          className="p-4 bg-slate-900/50 rounded-xl border border-slate-600 hover:border-purple-500 transition-all text-left"
                        >
                          <p className="text-purple-400 font-bold uppercase text-sm">{type}</p>
                          <p className="text-2xl font-bold text-white">{formatCurrency(data.maxPrice)}</p>
                          <p className="text-slate-400 text-sm">{formatCurrency(data.monthlyPayment)}/mo</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-12 border border-slate-700 text-center">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">🏠</span>
                  </div>
                  <p className="text-slate-400">Calculating your affordability...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
