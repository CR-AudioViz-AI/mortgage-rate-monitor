'use client';

import { useState } from 'react';

export default function AffordabilityCalculator() {
  const [income, setIncome] = useState<string>('75000');
  const [monthlyDebts, setMonthlyDebts] = useState<string>('500');
  const [downPayment, setDownPayment] = useState<string>('20000');
  const [interestRate, setInterestRate] = useState<string>('7.0');
  const [loanTerm, setLoanTerm] = useState<string>('30');
  
  const calculateAffordability = () => {
    const annualIncome = parseFloat(income) || 0;
    const monthlyInc = annualIncome / 12;
    const debts = parseFloat(monthlyDebts) || 0;
    const down = parseFloat(downPayment) || 0;
    const rate = parseFloat(interestRate) / 100 / 12;
    const months = parseInt(loanTerm) * 12;
    
    // 28% front-end ratio (housing costs)
    const maxHousingPayment = monthlyInc * 0.28;
    
    // 36% back-end ratio (total debt)
    const maxTotalDebt = monthlyInc * 0.36;
    const maxPayment = Math.min(maxHousingPayment, maxTotalDebt - debts);
    
    // Calculate max loan amount using mortgage formula
    // M = P * [r(1+r)^n] / [(1+r)^n - 1]
    // P = M * [(1+r)^n - 1] / [r(1+r)^n]
    
    const maxLoan = maxPayment * ((Math.pow(1 + rate, months) - 1) / (rate * Math.pow(1 + rate, months)));
    const maxHomePrice = maxLoan + down;
    
    return {
      maxHomePrice: Math.round(maxHomePrice),
      maxLoan: Math.round(maxLoan),
      monthlyPayment: Math.round(maxPayment),
      downPayment: down,
      frontEndRatio: ((maxPayment / monthlyInc) * 100).toFixed(1),
      backEndRatio: (((maxPayment + debts) / monthlyInc) * 100).toFixed(1),
    };
  };
  
  const results = calculateAffordability();
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        How Much House Can I Afford?
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Income
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Debt Payments
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={monthlyDebts}
                onChange={(e) => setMonthlyDebts(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Car loans, credit cards, student loans, etc.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Down Payment
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Term (years)
            </label>
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="30">30 years</option>
            </select>
          </div>
        </div>
        
        {/* Results Section */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="text-sm text-blue-700 font-medium mb-2">
              Maximum Home Price
            </div>
            <div className="text-4xl font-bold text-blue-900">
              ${results.maxHomePrice.toLocaleString()}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Max Loan Amount</div>
              <div className="text-xl font-bold text-gray-900">
                ${results.maxLoan.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Monthly Payment</div>
              <div className="text-xl font-bold text-gray-900">
                ${results.monthlyPayment.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Down Payment</div>
              <div className="text-xl font-bold text-gray-900">
                ${results.downPayment.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Loan Term</div>
              <div className="text-xl font-bold text-gray-900">
                {loanTerm} years
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">
              Debt-to-Income Ratios
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-800">Front-End (Housing):</span>
                <span className="font-semibold text-yellow-900">
                  {results.frontEndRatio}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-800">Back-End (Total Debt):</span>
                <span className="font-semibold text-yellow-900">
                  {results.backEndRatio}%
                </span>
              </div>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              Lenders typically require &lt;28% front-end and &lt;36% back-end
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
