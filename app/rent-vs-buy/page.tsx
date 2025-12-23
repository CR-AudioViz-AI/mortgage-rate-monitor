// CR AudioViz AI - Mortgage Rate Monitor
// Rent vs Buy Calculator
// December 23, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RotatingAds from '@/components/RotatingAds';

interface CalculationResult {
  monthlyRent: number;
  monthlyOwnership: number;
  rentTotal5Year: number;
  buyTotal5Year: number;
  equityBuilt5Year: number;
  netCostBuying5Year: number;
  breakEvenYears: number;
  recommendation: string;
}

export default function RentVsBuyPage() {
  const [homePrice, setHomePrice] = useState(400000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.875);
  const [monthlyRent, setMonthlyRent] = useState(2500);
  const [rentIncrease, setRentIncrease] = useState(3);
  const [homeAppreciation, setHomeAppreciation] = useState(4);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.0);
  const [insuranceAnnual, setInsuranceAnnual] = useState(2400);
  const [maintenancePercent, setMaintenancePercent] = useState(1);
  const [yearsToCompare, setYearsToCompare] = useState(5);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateComparison = () => {
    const downPayment = homePrice * (downPaymentPercent / 100);
    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = 30 * 12;
    
    // Monthly mortgage payment (P&I)
    const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    // Monthly ownership costs
    const monthlyTax = (homePrice * (propertyTaxRate / 100)) / 12;
    const monthlyInsurance = insuranceAnnual / 12;
    const monthlyMaintenance = (homePrice * (maintenancePercent / 100)) / 12;
    const monthlyPMI = downPaymentPercent < 20 ? (loanAmount * 0.005) / 12 : 0;
    
    const totalMonthlyOwnership = monthlyPI + monthlyTax + monthlyInsurance + monthlyMaintenance + monthlyPMI;

    // Calculate over comparison period
    let rentTotal = 0;
    let buyTotal = 0;
    let currentRent = monthlyRent;
    let currentHomeValue = homePrice;
    let principalPaid = 0;
    let remainingBalance = loanAmount;

    for (let year = 1; year <= yearsToCompare; year++) {
      // Rent costs
      rentTotal += currentRent * 12;
      currentRent *= (1 + rentIncrease / 100);

      // Ownership costs
      const yearlyOwnership = totalMonthlyOwnership * 12;
      buyTotal += yearlyOwnership;

      // Calculate principal paid this year (simplified)
      for (let month = 0; month < 12; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPI - interestPayment;
        principalPaid += principalPayment;
        remainingBalance -= principalPayment;
      }

      // Home appreciation
      currentHomeValue *= (1 + homeAppreciation / 100);
    }

    // Equity built = appreciation + principal paid
    const appreciationGain = currentHomeValue - homePrice;
    const equityBuilt = downPayment + principalPaid + appreciationGain;
    
    // Net cost of buying = total costs - equity built
    const netCostBuying = buyTotal + downPayment - equityBuilt;

    // Break-even calculation (simplified)
    let breakEvenYears = 0;
    let cumRent = 0;
    let cumBuy = 0;
    let cumEquity = downPayment;
    let tempRent = monthlyRent;
    let tempHome = homePrice;
    let tempBalance = loanAmount;

    for (let year = 1; year <= 30; year++) {
      cumRent += tempRent * 12;
      cumBuy += totalMonthlyOwnership * 12;
      
      // Principal paid
      for (let month = 0; month < 12; month++) {
        const intPay = tempBalance * monthlyRate;
        const prinPay = monthlyPI - intPay;
        cumEquity += prinPay;
        tempBalance -= prinPay;
      }
      
      // Appreciation
      tempHome *= (1 + homeAppreciation / 100);
      const appGain = tempHome - homePrice;
      
      const netBuyCost = cumBuy + downPayment - cumEquity - appGain;
      
      if (netBuyCost < cumRent && breakEvenYears === 0) {
        breakEvenYears = year;
        break;
      }
      
      tempRent *= (1 + rentIncrease / 100);
    }

    // Recommendation
    let recommendation = '';
    if (breakEvenYears === 0) {
      recommendation = "Renting may be better for your situation. The numbers don't favor buying in the short to medium term.";
    } else if (yearsToCompare >= breakEvenYears) {
      recommendation = `Buying is recommended. You'll break even in year ${breakEvenYears}, and you're planning to stay ${yearsToCompare} years.`;
    } else {
      recommendation = `Consider renting. Break-even is year ${breakEvenYears}, but you're only planning ${yearsToCompare} years. You'd need to stay longer to benefit from buying.`;
    }

    setResult({
      monthlyRent: Math.round(monthlyRent),
      monthlyOwnership: Math.round(totalMonthlyOwnership),
      rentTotal5Year: Math.round(rentTotal),
      buyTotal5Year: Math.round(buyTotal),
      equityBuilt5Year: Math.round(equityBuilt),
      netCostBuying5Year: Math.round(netCostBuying),
      breakEvenYears: breakEvenYears || 99,
      recommendation,
    });
  };

  useEffect(() => {
    calculateComparison();
  }, [homePrice, downPaymentPercent, interestRate, monthlyRent, rentIncrease, homeAppreciation, propertyTaxRate, insuranceAnnual, maintenancePercent, yearsToCompare]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏠 Rent vs Buy Calculator</h1>
          <p className="text-slate-400">Find out if buying a home makes financial sense for your situation</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Renting Inputs */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-amber-400 mb-4">🏢 Renting</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Current Monthly Rent</label>
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Annual Rent Increase (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={rentIncrease}
                    onChange={(e) => setRentIncrease(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Buying Inputs */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-emerald-400 mb-4">🏠 Buying</h2>
              <div className="grid md:grid-cols-2 gap-4">
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
                  <label className="block text-slate-400 text-sm mb-2">Down Payment (%)</label>
                  <input
                    type="number"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.125"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Property Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={propertyTaxRate}
                    onChange={(e) => setPropertyTaxRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Annual Insurance ($)</label>
                  <input
                    type="number"
                    value={insuranceAnnual}
                    onChange={(e) => setInsuranceAnnual(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Home Appreciation (%/yr)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={homeAppreciation}
                    onChange={(e) => setHomeAppreciation(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Time Frame */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <label className="block text-white font-medium mb-2">How long do you plan to stay?</label>
              <select
                value={yearsToCompare}
                onChange={(e) => setYearsToCompare(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
              >
                {[1,2,3,4,5,7,10,15,20,30].map(y => (
                  <option key={y} value={y}>{y} years</option>
                ))}
              </select>
            </div>

            {/* Results */}
            {result && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">📊 {yearsToCompare}-Year Comparison</h2>
                
                {/* Recommendation */}
                <div className={`rounded-xl p-4 mb-6 ${
                  result.breakEvenYears <= yearsToCompare 
                    ? 'bg-emerald-500/20 border border-emerald-500/30' 
                    : 'bg-amber-500/20 border border-amber-500/30'
                }`}>
                  <p className={`font-medium ${
                    result.breakEvenYears <= yearsToCompare ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    💡 {result.recommendation}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Monthly Comparison */}
                  <div className="bg-slate-900/50 rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3">Monthly Costs</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-amber-400">Rent</span>
                        <span className="text-white font-medium">${result.monthlyRent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-400">Own (PITI+)</span>
                        <span className="text-white font-medium">${result.monthlyOwnership.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-700">
                        <span className="text-slate-400">Difference</span>
                        <span className={result.monthlyOwnership > result.monthlyRent ? 'text-red-400' : 'text-emerald-400'}>
                          {result.monthlyOwnership > result.monthlyRent ? '+' : '-'}${Math.abs(result.monthlyOwnership - result.monthlyRent).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total Comparison */}
                  <div className="bg-slate-900/50 rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3">{yearsToCompare}-Year Totals</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-amber-400">Total Rent</span>
                        <span className="text-white font-medium">${result.rentTotal5Year.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-400">Total Buy Costs</span>
                        <span className="text-white font-medium">${result.buyTotal5Year.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-400">Equity Built</span>
                        <span className="text-cyan-400 font-medium">${result.equityBuilt5Year.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                    <p className="text-3xl font-bold text-white">Year {result.breakEvenYears}</p>
                    <p className="text-slate-400 text-sm">Break-Even</p>
                  </div>
                  <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                    <p className="text-3xl font-bold text-cyan-400">${result.equityBuilt5Year.toLocaleString()}</p>
                    <p className="text-slate-400 text-sm">Equity Built</p>
                  </div>
                  <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                    <p className="text-3xl font-bold text-amber-400">${result.rentTotal5Year.toLocaleString()}</p>
                    <p className="text-slate-400 text-sm">Rent "Lost"</p>
                  </div>
                  <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                    <p className={`text-3xl font-bold ${result.netCostBuying5Year < result.rentTotal5Year ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${Math.abs(result.rentTotal5Year - result.netCostBuying5Year).toLocaleString()}
                    </p>
                    <p className="text-slate-400 text-sm">{result.netCostBuying5Year < result.rentTotal5Year ? 'Saved Buying' : 'Saved Renting'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RotatingAds variant="sidebar" showMultiple={2} interval={10000} />
            
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-bold mb-4">🔗 Related Tools</h3>
              <div className="space-y-2">
                <Link href="/true-cost" className="block text-emerald-400 hover:text-emerald-300">
                  💰 True Cost Calculator
                </Link>
                <Link href="/affordability" className="block text-emerald-400 hover:text-emerald-300">
                  📊 Affordability Calculator
                </Link>
                <Link href="/down-payment" className="block text-emerald-400 hover:text-emerald-300">
                  💵 Down Payment Assistance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
