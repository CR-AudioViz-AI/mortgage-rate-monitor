'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RentBuyInputs {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  propertyTax: number;
  homeInsurance: number;
  hoa: number;
  maintenance: number;
  homeAppreciation: number;
  rentAmount: number;
  rentIncrease: number;
  investmentReturn: number;
  yearsToAnalyze: number;
}

interface CostComparison {
  year: number;
  buyingCost: number;
  rentingCost: number;
  buyingEquity: number;
}

export default function RentVsBuyCalculator() {
  const [inputs, setInputs] = useState<RentBuyInputs>({
    homePrice: 350000,
    downPayment: 70000,
    interestRate: 6.5,
    loanTerm: 30,
    propertyTax: 1.2,
    homeInsurance: 1200,
    hoa: 0,
    maintenance: 1,
    homeAppreciation: 3,
    rentAmount: 2000,
    rentIncrease: 3,
    investmentReturn: 7,
    yearsToAnalyze: 10,
  });

  const [comparison, setComparison] = useState<CostComparison[]>([]);
  const [breakEvenYear, setBreakEvenYear] = useState<number | null>(null);

  useEffect(() => {
    calculateComparison();
  }, [inputs]);

  const calculateComparison = () => {
    const loanAmount = inputs.homePrice - inputs.downPayment;
    const monthlyRate = inputs.interestRate / 100 / 12;
    const numPayments = inputs.loanTerm * 12;

    // Monthly mortgage payment (P&I only)
    const monthlyMortgage =
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const results: CostComparison[] = [];
    let cumulativeBuyingCost = inputs.downPayment; // Start with down payment
    let cumulativeRentingCost = 0;
    let homeValue = inputs.homePrice;
    let remainingLoan = loanAmount;
    let rentInvestment = inputs.downPayment; // Invest down payment if renting
    let breakEven: number | null = null;

    for (let year = 1; year <= inputs.yearsToAnalyze; year++) {
      // Buying costs for the year
      let yearlyBuyingCost = 0;
      let yearlyPrincipalPaid = 0;

      for (let month = 1; month <= 12; month++) {
        const interestPayment = remainingLoan * monthlyRate;
        const principalPayment = monthlyMortgage - interestPayment;
        yearlyPrincipalPaid += principalPayment;
        remainingLoan = Math.max(0, remainingLoan - principalPayment);
        yearlyBuyingCost += monthlyMortgage;
      }

      // Add other buying costs
      const yearlyPropertyTax = homeValue * (inputs.propertyTax / 100);
      const yearlyMaintenance = homeValue * (inputs.maintenance / 100);
      yearlyBuyingCost +=
        yearlyPropertyTax +
        inputs.homeInsurance +
        inputs.hoa * 12 +
        yearlyMaintenance;

      // Appreciate home value
      homeValue *= 1 + inputs.homeAppreciation / 100;

      cumulativeBuyingCost += yearlyBuyingCost;

      // Renting costs for the year
      const yearlyRent = inputs.rentAmount * 12;
      cumulativeRentingCost += yearlyRent;

      // Invest the difference (if any)
      const monthlySavings = Math.max(
        0,
        (yearlyBuyingCost - yearlyRent) / 12
      );
      for (let month = 1; month <= 12; month++) {
        rentInvestment += monthlySavings;
        rentInvestment *= 1 + inputs.investmentReturn / 100 / 12;
      }
      rentInvestment *= 1 + inputs.investmentReturn / 100; // Annual return

      // Calculate equity (home value - remaining loan)
      const equity = homeValue - remainingLoan;

      results.push({
        year,
        buyingCost: cumulativeBuyingCost,
        rentingCost: cumulativeRentingCost + rentInvestment,
        buyingEquity: equity,
      });

      // Check for break-even point
      if (
        breakEven === null &&
        equity > rentInvestment
      ) {
        breakEven = year;
      }

      // Increase rent for next year
      inputs.rentAmount *= 1 + inputs.rentIncrease / 100;
    }

    setComparison(results);
    setBreakEvenYear(breakEven);
  };

  const handleInputChange = (field: keyof RentBuyInputs, value: number) => {
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

  const finalComparison = comparison[comparison.length - 1];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Rent vs Buy Calculator
      </h3>
      <p className="text-gray-600 mb-6">
        Compare the long-term financial impact of renting versus buying a home.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="md:col-span-1 space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Buying Details</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={inputs.homePrice}
                onChange={(e) =>
                  handleInputChange('homePrice', parseFloat(e.target.value))
                }
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Tax (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.propertyTax}
              onChange={(e) =>
                handleInputChange('propertyTax', parseFloat(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Insurance (annual)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={inputs.homeInsurance}
                onChange={(e) =>
                  handleInputChange('homeInsurance', parseFloat(e.target.value))
                }
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maintenance (% of home value)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.maintenance}
              onChange={(e) =>
                handleInputChange('maintenance', parseFloat(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Appreciation (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.homeAppreciation}
              onChange={(e) =>
                handleInputChange('homeAppreciation', parseFloat(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-4">Renting Details</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rent
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  value={inputs.rentAmount}
                  onChange={(e) =>
                    handleInputChange('rentAmount', parseFloat(e.target.value))
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rent Increase (% per year)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.rentIncrease}
                onChange={(e) =>
                  handleInputChange('rentIncrease', parseFloat(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Return (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.investmentReturn}
                onChange={(e) =>
                  handleInputChange('investmentReturn', parseFloat(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years to Analyze
            </label>
            <input
              type="number"
              value={inputs.yearsToAnalyze}
              onChange={(e) =>
                handleInputChange('yearsToAnalyze', parseInt(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="md:col-span-2">
          <h4 className="font-semibold text-gray-900 mb-4">
            {inputs.yearsToAnalyze}-Year Comparison
          </h4>

          {finalComparison && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Buying</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(finalComparison.buyingEquity)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Total equity built
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Renting</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(finalComparison.rentingCost)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Invested savings
                  </div>
                </div>
              </div>

              {breakEvenYear && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="font-semibold text-gray-900">
                    Break-even Point
                  </div>
                  <div className="text-sm text-gray-600">
                    Buying becomes more advantageous after{' '}
                    <span className="font-bold text-yellow-700">
                      {breakEvenYear} years
                    </span>
                  </div>
                </div>
              )}

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={comparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="buyingEquity"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Buying Equity"
                  />
                  <Line
                    type="monotone"
                    dataKey="rentingCost"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Renting + Investments"
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">
                  Detailed Breakdown (Year {inputs.yearsToAnalyze})
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total cost of buying:</span>
                    <span className="font-semibold">
                      {formatCurrency(finalComparison.buyingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Home equity built:</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(finalComparison.buyingEquity)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-2">
                    <span className="text-gray-600">Total rent paid:</span>
                    <span className="font-semibold">
                      {formatCurrency(finalComparison.rentingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investments value:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(finalComparison.rentingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-2 font-bold">
                    <span className="text-gray-900">Winner:</span>
                    <span
                      className={
                        finalComparison.buyingEquity > finalComparison.rentingCost
                          ? 'text-blue-600'
                          : 'text-green-600'
                      }
                    >
                      {finalComparison.buyingEquity > finalComparison.rentingCost
                        ? 'Buying'
                        : 'Renting'}{' '}
                      by{' '}
                      {formatCurrency(
                        Math.abs(
                          finalComparison.buyingEquity - finalComparison.rentingCost
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">
                  💡 Assumptions
                </h5>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Renting invests down payment and savings difference</li>
                  <li>• Home appreciates at {inputs.homeAppreciation}% annually</li>
                  <li>• Rent increases {inputs.rentIncrease}% annually</li>
                  <li>
                    • Investments return {inputs.investmentReturn}% annually
                  </li>
                  <li>• Does not include tax benefits or transaction costs</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
