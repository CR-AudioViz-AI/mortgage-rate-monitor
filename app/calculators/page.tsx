'use client';

import { useState } from 'react';
import AffordabilityCalculator from '@/components/calculators/AffordabilityCalculator';
import PaymentCalculator from '@/components/calculators/PaymentCalculator';

export default function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState('affordability');
  
  const calculators = [
    { id: 'affordability', name: 'Affordability', icon: '🏠' },
    { id: 'payment', name: 'Payment', icon: '💰' },
    { id: 'rent-vs-buy', name: 'Rent vs Buy', icon: '📊' },
    { id: 'refinance', name: 'Refinance', icon: '🔄' },
    { id: 'extra-payment', name: 'Extra Payment', icon: '⚡' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mortgage Calculators
          </h1>
          <p className="text-xl text-gray-600">
            Professional tools to help you make informed decisions
          </p>
        </div>
        
        {/* Calculator Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {calculators.map((calc) => (
              <button
                key={calc.id}
                onClick={() => setActiveCalculator(calc.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  activeCalculator === calc.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="text-2xl">{calc.icon}</span>
                <span>{calc.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Calculator Content */}
        <div>
          {activeCalculator === 'affordability' && <AffordabilityCalculator />}
          {activeCalculator === 'payment' && <PaymentCalculator />}
          {activeCalculator === 'rent-vs-buy' && <RentVsBuyCalculator />}
          {activeCalculator === 'refinance' && <RefinanceCalculator />}
          {activeCalculator === 'extra-payment' && <ExtraPaymentCalculator />}
        </div>
      </div>
    </div>
  );
}

// Rent vs Buy Calculator
function RentVsBuyCalculator() {
  const [monthlyRent, setMonthlyRent] = useState('2000');
  const [homePrice, setHomePrice] = useState('350000');
  const [downPayment, setDownPayment] = useState('70000');
  const [interestRate, setInterestRate] = useState('7.0');
  const [years, setYears] = useState('5');
  
  const calculate = () => {
    const rent = parseFloat(monthlyRent);
    const price = parseFloat(homePrice);
    const down = parseFloat(downPayment);
    const rate = parseFloat(interestRate) / 100 / 12;
    const months = parseInt(years) * 12;
    const principal = price - down;
    
    const monthlyPayment = principal * (rate * Math.pow(1 + rate, 360)) / (Math.pow(1 + rate, 360) - 1);
    const totalRentCost = rent * months;
    const totalOwnCost = (monthlyPayment + (price * 0.01 / 12)) * months + down;
    
    const homeAppreciation = price * Math.pow(1.03, parseInt(years)) - price;
    const netOwnershipCost = totalOwnCost - homeAppreciation;
    
    return {
      totalRentCost: Math.round(totalRentCost),
      totalOwnCost: Math.round(totalOwnCost),
      netOwnershipCost: Math.round(netOwnershipCost),
      savings: Math.round(totalRentCost - netOwnershipCost),
      homeAppreciation: Math.round(homeAppreciation),
    };
  };
  
  const results = calculate();
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Rent vs Buy Calculator</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Home Price</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input type="number" value={homePrice} onChange={(e) => setHomePrice(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
            <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon (years)</label>
            <select value={years} onChange={(e) => setYears(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="3">3 years</option>
              <option value="5">5 years</option>
              <option value="7">7 years</option>
              <option value="10">10 years</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-xs text-red-700 mb-1">Total Rent Cost</div>
              <div className="text-xl font-bold text-red-900">${results.totalRentCost.toLocaleString()}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-xs text-blue-700 mb-1">Net Buy Cost</div>
              <div className="text-xl font-bold text-blue-900">${results.netOwnershipCost.toLocaleString()}</div>
            </div>
          </div>
          <div className={`rounded-lg p-6 border-2 ${results.savings > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="text-sm font-medium mb-2">{results.savings > 0 ? 'Buying Saves' : 'Renting Saves'}</div>
            <div className="text-3xl font-bold">${Math.abs(results.savings).toLocaleString()}</div>
            <p className="text-sm mt-2">over {years} years</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Home Appreciation</span>
                <span className="font-semibold">${results.homeAppreciation.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Refinance Calculator
function RefinanceCalculator() {
  const [currentLoan, setCurrentLoan] = useState('280000');
  const [currentRate, setCurrentRate] = useState('8.0');
  const [newRate, setNewRate] = useState('6.5');
  const [closingCosts, setClosingCosts] = useState('5000');
  
  const calculate = () => {
    const loan = parseFloat(currentLoan);
    const oldRate = parseFloat(currentRate) / 100 / 12;
    const newR = parseFloat(newRate) / 100 / 12;
    const closing = parseFloat(closingCosts);
    
    const oldPayment = loan * (oldRate * Math.pow(1 + oldRate, 360)) / (Math.pow(1 + oldRate, 360) - 1);
    const newPayment = loan * (newR * Math.pow(1 + newR, 360)) / (Math.pow(1 + newR, 360) - 1);
    const monthlySavings = oldPayment - newPayment;
    const breakEvenMonths = closing / monthlySavings;
    
    return {
      oldPayment: Math.round(oldPayment),
      newPayment: Math.round(newPayment),
      monthlySavings: Math.round(monthlySavings),
      breakEvenMonths: Math.round(breakEvenMonths),
      firstYearSavings: Math.round(monthlySavings * 12 - closing),
    };
  };
  
  const results = calculate();
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Refinance Calculator</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Loan Balance</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input type="number" value={currentLoan} onChange={(e) => setCurrentLoan(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Interest Rate (%)</label>
            <input type="number" step="0.1" value={currentRate} onChange={(e) => setCurrentRate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Interest Rate (%)</label>
            <input type="number" step="0.1" value={newRate} onChange={(e) => setNewRate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Closing Costs</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input type="number" value={closingCosts} onChange={(e) => setClosingCosts(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="text-sm text-green-700 mb-2">Monthly Savings</div>
            <div className="text-4xl font-bold text-green-900">${results.monthlySavings.toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Old Payment</div>
              <div className="text-xl font-bold text-gray-900">${results.oldPayment.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">New Payment</div>
              <div className="text-xl font-bold text-gray-900">${results.newPayment.toLocaleString()}</div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-700 mb-1">Break-Even Point</div>
            <div className="text-2xl font-bold text-blue-900">{results.breakEvenMonths} months</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Extra Payment Calculator
function ExtraPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState('280000');
  const [interestRate, setInterestRate] = useState('7.0');
  const [extraPayment, setExtraPayment] = useState('200');
  
  const calculate = () => {
    const loan = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12;
    const extra = parseFloat(extraPayment);
    
    const normalPayment = loan * (rate * Math.pow(1 + rate, 360)) / (Math.pow(1 + rate, 360) - 1);
    const newPayment = normalPayment + extra;
    
    let balance = loan;
    let months = 0;
    while (balance > 0 && months < 360) {
      balance = balance * (1 + rate) - newPayment;
      months++;
    }
    
    const monthsSaved = 360 - months;
    const interestSaved = (normalPayment * 360 - loan) - (newPayment * months - loan);
    
    return {
      normalPayment: Math.round(normalPayment),
      newPayment: Math.round(newPayment),
      monthsSaved,
      yearsSaved: (monthsSaved / 12).toFixed(1),
      interestSaved: Math.round(interestSaved),
    };
  };
  
  const results = calculate();
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Extra Payment Calculator</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
            <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Extra Monthly Payment</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input type="number" value={extraPayment} onChange={(e) => setExtraPayment(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <div className="text-sm text-purple-700 mb-2">Total Interest Saved</div>
            <div className="text-4xl font-bold text-purple-900">${results.interestSaved.toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Time Saved</div>
              <div className="text-xl font-bold text-gray-900">{results.yearsSaved} years</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">New Payment</div>
              <div className="text-xl font-bold text-gray-900">${results.newPayment.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
