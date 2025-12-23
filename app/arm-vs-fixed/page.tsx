// CR AudioViz AI - Mortgage Rate Monitor
// ARM vs Fixed Rate Comparison Calculator
// December 23, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RotatingAds from '@/components/RotatingAds';

interface CalculationResult {
  fixedMonthly: number;
  armInitialMonthly: number;
  fixedTotal5Year: number;
  armTotal5Year: number;
  breakEvenYear: number;
  savings5Year: number;
  recommendation: string;
  riskLevel: string;
}

export default function ARMvsFixedPage() {
  const [loanAmount, setLoanAmount] = useState(400000);
  const [fixedRate, setFixedRate] = useState(6.875);
  const [armInitialRate, setArmInitialRate] = useState(5.875);
  const [armCaps, setArmCaps] = useState({ initial: 2, periodic: 2, lifetime: 5 });
  const [armType, setArmType] = useState('5/1');
  const [loanTerm, setLoanTerm] = useState(30);
  const [planToStay, setPlanToStay] = useState(7);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateComparison = () => {
    // Fixed rate calculation
    const fixedMonthlyRate = fixedRate / 100 / 12;
    const totalPayments = loanTerm * 12;
    const fixedMonthly = loanAmount * (fixedMonthlyRate * Math.pow(1 + fixedMonthlyRate, totalPayments)) / (Math.pow(1 + fixedMonthlyRate, totalPayments) - 1);

    // ARM initial calculation
    const armMonthlyRate = armInitialRate / 100 / 12;
    const armInitialMonthly = loanAmount * (armMonthlyRate * Math.pow(1 + armMonthlyRate, totalPayments)) / (Math.pow(1 + armMonthlyRate, totalPayments) - 1);

    // Calculate 5-year totals (simplified - ARM assumes rate increases after fixed period)
    const armFixedPeriod = parseInt(armType.split('/')[0]);
    const fixedTotal5Year = fixedMonthly * 60;
    
    // ARM: fixed period + adjustment
    let armTotal5Year = 0;
    let currentArmRate = armInitialRate;
    for (let year = 1; year <= 5; year++) {
      if (year <= armFixedPeriod) {
        armTotal5Year += armInitialMonthly * 12;
      } else {
        // Assume rate increases by cap each year after fixed period
        currentArmRate = Math.min(currentArmRate + armCaps.periodic, armInitialRate + armCaps.lifetime);
        const newMonthlyRate = currentArmRate / 100 / 12;
        const newMonthly = loanAmount * (newMonthlyRate * Math.pow(1 + newMonthlyRate, totalPayments)) / (Math.pow(1 + newMonthlyRate, totalPayments) - 1);
        armTotal5Year += newMonthly * 12;
      }
    }

    const savings5Year = fixedTotal5Year - armTotal5Year;
    
    // Find break-even year
    let breakEvenYear = 0;
    let fixedCumulative = 0;
    let armCumulative = 0;
    currentArmRate = armInitialRate;
    
    for (let year = 1; year <= 30; year++) {
      fixedCumulative += fixedMonthly * 12;
      
      if (year <= armFixedPeriod) {
        armCumulative += armInitialMonthly * 12;
      } else {
        currentArmRate = Math.min(currentArmRate + armCaps.periodic, armInitialRate + armCaps.lifetime);
        const newMonthlyRate = currentArmRate / 100 / 12;
        const newMonthly = loanAmount * (newMonthlyRate * Math.pow(1 + newMonthlyRate, totalPayments)) / (Math.pow(1 + newMonthlyRate, totalPayments) - 1);
        armCumulative += newMonthly * 12;
      }
      
      if (armCumulative > fixedCumulative && breakEvenYear === 0) {
        breakEvenYear = year;
      }
    }

    // Determine recommendation
    let recommendation = '';
    let riskLevel = 'Moderate';
    
    if (planToStay <= armFixedPeriod) {
      recommendation = `ARM recommended. You plan to stay ${planToStay} years, within the ${armFixedPeriod}-year fixed period. Save ~$${Math.round(savings5Year).toLocaleString()} over 5 years.`;
      riskLevel = 'Low';
    } else if (planToStay < breakEvenYear) {
      recommendation = `ARM could work. Break-even is year ${breakEvenYear}. You might save money, but rates could rise unexpectedly.`;
      riskLevel = 'Moderate';
    } else {
      recommendation = `Fixed recommended. You plan to stay ${planToStay} years, past the break-even point of year ${breakEvenYear}. The certainty is worth it.`;
      riskLevel = 'Low';
    }

    setResult({
      fixedMonthly: Math.round(fixedMonthly),
      armInitialMonthly: Math.round(armInitialMonthly),
      fixedTotal5Year: Math.round(fixedTotal5Year),
      armTotal5Year: Math.round(armTotal5Year),
      breakEvenYear,
      savings5Year: Math.round(savings5Year),
      recommendation,
      riskLevel,
    });
  };

  useEffect(() => {
    calculateComparison();
  }, [loanAmount, fixedRate, armInitialRate, armType, loanTerm, planToStay]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⚖️ ARM vs Fixed Calculator</h1>
          <p className="text-slate-400">Compare adjustable-rate and fixed-rate mortgages to find your best option</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Details */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Loan Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Loan Amount</label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Loan Term (Years)</label>
                  <select
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  >
                    <option value={30}>30 Years</option>
                    <option value={15}>15 Years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">How long do you plan to stay?</label>
                  <select
                    value={planToStay}
                    onChange={(e) => setPlanToStay(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,15,20,30].map(y => (
                      <option key={y} value={y}>{y} years</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Rate Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Fixed Rate */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-blue-400 mb-4">🔒 Fixed Rate</h3>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.125"
                    value={fixedRate}
                    onChange={(e) => setFixedRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  />
                </div>
                {result && (
                  <div className="mt-4 pt-4 border-t border-blue-500/30">
                    <p className="text-slate-400 text-sm">Monthly Payment</p>
                    <p className="text-3xl font-bold text-white">${result.fixedMonthly.toLocaleString()}</p>
                    <p className="text-slate-400 text-sm mt-2">Same for entire loan</p>
                  </div>
                )}
              </div>

              {/* ARM Rate */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-amber-400 mb-4">📊 Adjustable Rate (ARM)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">ARM Type</label>
                    <select
                      value={armType}
                      onChange={(e) => setArmType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                    >
                      <option value="3/1">3/1 ARM (3 years fixed)</option>
                      <option value="5/1">5/1 ARM (5 years fixed)</option>
                      <option value="7/1">7/1 ARM (7 years fixed)</option>
                      <option value="10/1">10/1 ARM (10 years fixed)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Initial Rate (%)</label>
                    <input
                      type="number"
                      step="0.125"
                      value={armInitialRate}
                      onChange={(e) => setArmInitialRate(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                    />
                  </div>
                </div>
                {result && (
                  <div className="mt-4 pt-4 border-t border-amber-500/30">
                    <p className="text-slate-400 text-sm">Initial Monthly Payment</p>
                    <p className="text-3xl font-bold text-white">${result.armInitialMonthly.toLocaleString()}</p>
                    <p className="text-slate-400 text-sm mt-2">Fixed for first {armType.split('/')[0]} years</p>
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            {result && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">📊 Comparison Results</h2>
                
                {/* Recommendation */}
                <div className={`rounded-xl p-4 mb-6 ${
                  result.riskLevel === 'Low' ? 'bg-emerald-500/20 border border-emerald-500/30' :
                  'bg-yellow-500/20 border border-yellow-500/30'
                }`}>
                  <p className={`font-medium ${
                    result.riskLevel === 'Low' ? 'text-emerald-400' : 'text-yellow-400'
                  }`}>
                    💡 {result.recommendation}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-white font-medium mb-3">5-Year Comparison</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fixed Total (5 yr)</span>
                        <span className="text-white font-medium">${result.fixedTotal5Year.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ARM Total (5 yr)</span>
                        <span className="text-white font-medium">${result.armTotal5Year.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-700">
                        <span className="text-slate-400">Potential Savings</span>
                        <span className={`font-bold ${result.savings5Year > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {result.savings5Year > 0 ? '+' : ''}${result.savings5Year.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-3">Key Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Break-Even Year</span>
                        <span className="text-white font-medium">Year {result.breakEvenYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Initial Monthly Savings</span>
                        <span className="text-emerald-400 font-medium">
                          ${(result.fixedMonthly - result.armInitialMonthly).toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Risk Level</span>
                        <span className={`font-medium ${
                          result.riskLevel === 'Low' ? 'text-emerald-400' : 'text-yellow-400'
                        }`}>{result.riskLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RotatingAds variant="sidebar" showMultiple={2} interval={10000} />
            
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-bold mb-4">📚 ARM Basics</h3>
              <div className="space-y-3 text-sm text-slate-400">
                <p><span className="text-white font-medium">5/1 ARM:</span> Rate fixed for 5 years, then adjusts annually.</p>
                <p><span className="text-white font-medium">Caps:</span> Limits on how much rate can increase (typically 2/2/5).</p>
                <p><span className="text-white font-medium">Best for:</span> People who plan to sell or refinance before adjustment.</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-bold mb-4">🔗 Related Tools</h3>
              <div className="space-y-2">
                <Link href="/true-cost" className="block text-emerald-400 hover:text-emerald-300">
                  💰 True Cost Calculator
                </Link>
                <Link href="/refinance" className="block text-emerald-400 hover:text-emerald-300">
                  🔄 Refinance Analyzer
                </Link>
                <Link href="/affordability" className="block text-emerald-400 hover:text-emerald-300">
                  📊 Affordability Calculator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
