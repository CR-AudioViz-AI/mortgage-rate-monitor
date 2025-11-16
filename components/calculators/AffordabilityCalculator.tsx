'use client';

import React, { useState, useEffect } from 'react';

interface AffordabilityInputs {
  annualIncome: number;
  monthlyDebts: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  hoaFees: number;
}

interface AffordabilityResults {
  maxHomePrice: number;
  maxLoanAmount: number;
  monthlyPayment: number;
  dti: number;
  canAfford: boolean;
}

export default function AffordabilityCalculator() {
  const [inputs, setInputs] = useState<AffordabilityInputs>({
    annualIncome: 80000,
    monthlyDebts: 500,
    downPayment: 20000,
    interestRate: 6.5,
    loanTerm: 30,
    propertyTax: 1.2,
    homeInsurance: 100,
    pmi: 0,
    hoaFees: 0,
  });

  const [results, setResults] = useState<AffordabilityResults | null>(null);

  useEffect(() => {
    calculateAffordability();
  }, [inputs]);

  const calculateAffordability = () => {
    const monthlyIncome = inputs.annualIncome / 12;
    const maxMonthlyPayment = monthlyIncome * 0.28; // 28% front-end ratio
    const maxTotalDebt = monthlyIncome * 0.36; // 36% back-end ratio
    
    // Calculate available for mortgage payment after debts
    const availableForMortgage = Math.min(
      maxMonthlyPayment,
      maxTotalDebt - inputs.monthlyDebts
    );

    // Subtract non-principal costs
    const availableForPrincipalInterest =
      availableForMortgage -
      inputs.homeInsurance -
      inputs.pmi -
      inputs.hoaFees;

    // Calculate max loan amount using mortgage formula
    const monthlyRate = inputs.interestRate / 100 / 12;
    const numPayments = inputs.loanTerm * 12;
    
    const maxLoanAmount =
      availableForPrincipalInterest *
      ((Math.pow(1 + monthlyRate, numPayments) - 1) /
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments)));

    const maxHomePrice = maxLoanAmount + inputs.downPayment;
    
    // Calculate monthly property tax
    const monthlyPropertyTax = (maxHomePrice * (inputs.propertyTax / 100)) / 12;
    
    // Total monthly payment
    const monthlyPayment =
      availableForPrincipalInterest +
      monthlyPropertyTax +
      inputs.homeInsurance +
      inputs.pmi +
      inputs.hoaFees;

    // Calculate DTI
    const dti = ((monthlyPayment + inputs.monthlyDebts) / monthlyIncome) * 100;

    setResults({
      maxHomePrice,
      maxLoanAmount,
      monthlyPayment,
      dti,
      canAfford: dti <= 43, // 43% is typical max DTI
    });
  };

  const handleInputChange = (field: keyof AffordabilityInputs, value: number) => {
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
        Affordability Calculator
      </h3>
      <p className="text-gray-600 mb-6">
        Calculate how much home you can afford based on your income and debts.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Your Information</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Income
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={inputs.annualIncome}
                onChange={(e) =>
                  handleInputChange('annualIncome', parseFloat(e.target.value))
                }
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Debts (car, credit cards, etc.)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={inputs.monthlyDebts}
                onChange={(e) =>
                  handleInputChange('monthlyDebts', parseFloat(e.target.value))
                }
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Down Payment
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={inputs.downPayment}
                onChange={(e) =>
                  handleInputChange('downPayment', parseFloat(e.target.value))
                }
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
              value={inputs.interestRate}
              onChange={(e) =>
                handleInputChange('interestRate', parseFloat(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Term (years)
            </label>
            <select
              value={inputs.loanTerm}
              onChange={(e) =>
                handleInputChange('loanTerm', parseInt(e.target.value))
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
              Property Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.propertyTax}
              onChange={(e) =>
                handleInputChange('propertyTax', parseFloat(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Insurance (monthly)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={inputs.homeInsurance}
                onChange={(e) =>
                  handleInputChange('homeInsurance', parseFloat(e.target.value))
                }
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PMI (monthly)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={inputs.pmi}
                onChange={(e) =>
                  handleInputChange('pmi', parseFloat(e.target.value))
                }
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HOA Fees (monthly)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={inputs.hoaFees}
                onChange={(e) =>
                  handleInputChange('hoaFees', parseFloat(e.target.value))
                }
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Your Results</h4>

          {results && (
            <div className="space-y-4">
              <div
                className={`p-6 rounded-lg border-2 ${
                  results.canAfford
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="text-sm text-gray-600 mb-1">
                  Maximum Home Price
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(results.maxHomePrice)}
                </div>
                <div className="mt-2 text-sm">
                  {results.canAfford ? (
                    <span className="text-green-600 font-medium">
                      ✓ Within budget
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      ⚠ May be difficult to qualify
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Loan Amount</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(results.maxLoanAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Down Payment</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(inputs.downPayment)}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Payment</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(results.monthlyPayment)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Debt-to-Income Ratio
                  </span>
                  <span
                    className={`font-semibold ${
                      results.dti <= 36
                        ? 'text-green-600'
                        : results.dti <= 43
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {results.dti.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      results.dti <= 36
                        ? 'bg-green-500'
                        : results.dti <= 43
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(results.dti, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {results.dti <= 36
                    ? 'Excellent - Well within recommended limits'
                    : results.dti <= 43
                    ? 'Good - Within acceptable range'
                    : 'High - May be difficult to qualify'}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">
                  💡 Quick Tips
                </h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Aim for a DTI below 36% for best rates</li>
                  <li>• 20% down payment avoids PMI</li>
                  <li>• Consider property taxes and insurance in budget</li>
                  <li>• Pre-approval helps in competitive markets</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
