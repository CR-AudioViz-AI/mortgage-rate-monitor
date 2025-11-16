'use client';

import React, { useState, useEffect } from 'react';

interface RefinanceInputs {
  currentLoanBalance: number;
  currentInterestRate: number;
  currentMonthlyPayment: number;
  remainingYears: number;
  newInterestRate: number;
  newLoanTerm: number;
  closingCosts: number;
  cashOut: number;
}

interface RefinanceResults {
  newMonthlyPayment: number;
  monthlySavings: number;
  newLoanAmount: number;
  totalInterestCurrent: number;
  totalInterestNew: number;
  interestSavings: number;
  breakEvenMonths: number;
  lifetimeSavings: number;
  shouldRefinance: boolean;
}

export default function RefinanceCalculator() {
  const [inputs, setInputs] = useState<RefinanceInputs>({
    currentLoanBalance: 280000,
    currentInterestRate: 7.5,
    currentMonthlyPayment: 2335,
    remainingYears: 27,
    newInterestRate: 6.0,
    newLoanTerm: 30,
    closingCosts: 3500,
    cashOut: 0,
  });

  const [results, setResults] = useState<RefinanceResults | null>(null);

  useEffect(() => {
    calculateRefinance();
  }, [inputs]);

  const calculateRefinance = () => {
    // Calculate new loan amount (current balance + closing costs + cash out)
    const newLoanAmount =
      inputs.currentLoanBalance + inputs.closingCosts + inputs.cashOut;

    // Calculate new monthly payment
    const newMonthlyRate = inputs.newInterestRate / 100 / 12;
    const newNumPayments = inputs.newLoanTerm * 12;
    const newMonthlyPayment =
      newLoanAmount *
      (newMonthlyRate * Math.pow(1 + newMonthlyRate, newNumPayments)) /
      (Math.pow(1 + newMonthlyRate, newNumPayments) - 1);

    // Calculate total interest on current loan
    const remainingPayments = inputs.remainingYears * 12;
    const totalInterestCurrent =
      inputs.currentMonthlyPayment * remainingPayments -
      inputs.currentLoanBalance;

    // Calculate total interest on new loan
    const totalInterestNew = newMonthlyPayment * newNumPayments - newLoanAmount;

    // Interest savings
    const interestSavings = totalInterestCurrent - totalInterestNew;

    // Monthly savings
    const monthlySavings = inputs.currentMonthlyPayment - newMonthlyPayment;

    // Break-even point (months to recover closing costs)
    const breakEvenMonths =
      monthlySavings > 0 ? inputs.closingCosts / monthlySavings : Infinity;

    // Lifetime savings (accounting for closing costs)
    const lifetimeSavings = interestSavings - inputs.closingCosts;

    // Should refinance? (positive savings and reasonable break-even)
    const shouldRefinance = lifetimeSavings > 0 && breakEvenMonths < 60;

    setResults({
      newMonthlyPayment,
      monthlySavings,
      newLoanAmount,
      totalInterestCurrent,
      totalInterestNew,
      interestSavings,
      breakEvenMonths,
      lifetimeSavings,
      shouldRefinance,
    });
  };

  const handleInputChange = (field: keyof RefinanceInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Refinance Calculator
      </h3>
      <p className="text-gray-600 mb-6">
        Determine if refinancing your mortgage makes financial sense.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Current Loan</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remaining Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={inputs.currentLoanBalance}
                onChange={(e) =>
                  handleInputChange(
                    'currentLoanBalance',
                    parseFloat(e.target.value)
                  )
                }
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.currentInterestRate}
              onChange={(e) =>
                handleInputChange(
                  'currentInterestRate',
                  parseFloat(e.target.value)
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Monthly Payment
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={inputs.currentMonthlyPayment}
                onChange={(e) =>
                  handleInputChange(
                    'currentMonthlyPayment',
                    parseFloat(e.target.value)
                  )
                }
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remaining Years
            </label>
            <input
              type="number"
              value={inputs.remainingYears}
              onChange={(e) =>
                handleInputChange('remainingYears', parseInt(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-4">New Loan</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.newInterestRate}
                onChange={(e) =>
                  handleInputChange('newInterestRate', parseFloat(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Loan Term (years)
              </label>
              <select
                value={inputs.newLoanTerm}
                onChange={(e) =>
                  handleInputChange('newLoanTerm', parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={30}>30 years</option>
                <option value={20}>20 years</option>
                <option value={15}>15 years</option>
                <option value={10}>10 years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closing Costs
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  value={inputs.closingCosts}
                  onChange={(e) =>
                    handleInputChange('closingCosts', parseFloat(e.target.value))
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash Out (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  value={inputs.cashOut}
                  onChange={(e) =>
                    handleInputChange('cashOut', parseFloat(e.target.value))
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">
            Refinance Analysis
          </h4>

          {results && (
            <div className="space-y-4">
              <div
                className={`p-6 rounded-lg border-2 ${
                  results.shouldRefinance
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="text-sm text-gray-600 mb-1">Recommendation</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {results.shouldRefinance
                    ? '✓ Refinance Makes Sense'
                    : '✗ Refinancing May Not Be Worth It'}
                </div>
                <div className="text-sm text-gray-600">
                  {results.shouldRefinance
                    ? `You'll break even in ${Math.round(results.breakEvenMonths)} months`
                    : 'Break-even point is too far out or savings are negative'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Current Monthly Payment
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(inputs.currentMonthlyPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    New Monthly Payment
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(results.newMonthlyPayment)}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    Monthly Savings
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      results.monthlySavings > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(results.monthlySavings)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Total Interest (Current Loan)
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(results.totalInterestCurrent)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Total Interest (New Loan)
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(results.totalInterestNew)}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    Interest Savings
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      results.interestSavings > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(results.interestSavings)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Break-Even Point</span>
                  <span className="font-bold text-blue-900">
                    {results.breakEvenMonths === Infinity
                      ? 'Never'
                      : `${Math.round(results.breakEvenMonths)} months`}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Time to recover {formatCurrency(inputs.closingCosts)} in closing
                  costs
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Lifetime Savings
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      results.lifetimeSavings > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(results.lifetimeSavings)}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Total savings after closing costs
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">
                  💡 Considerations
                </h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Resetting loan term may increase total interest</li>
                  <li>• Consider how long you plan to stay in the home</li>
                  <li>• Check for prepayment penalties on current loan</li>
                  <li>• Factor in your time and hassle of refinancing</li>
                  <li>
                    • Rate must typically drop 0.75-1% to justify refinancing
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
