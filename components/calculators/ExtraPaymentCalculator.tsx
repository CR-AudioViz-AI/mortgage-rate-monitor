'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ExtraPaymentInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  extraMonthly: number;
  extraYearly: number;
  oneTimePayment: number;
  oneTimePaymentMonth: number;
}

interface PaymentResults {
  standardPayment: number;
  standardTotalInterest: number;
  standardPayoffMonths: number;
  withExtraPayment: number;
  withExtraTotalInterest: number;
  withExtraPayoffMonths: number;
  interestSaved: number;
  timeSaved: number;
  payoffDateStandard: string;
  payoffDateWithExtra: string;
}

export default function ExtraPaymentCalculator() {
  const [inputs, setInputs] = useState<ExtraPaymentInputs>({
    loanAmount: 300000,
    interestRate: 6.5,
    loanTerm: 30,
    extraMonthly: 200,
    extraYearly: 0,
    oneTimePayment: 0,
    oneTimePaymentMonth: 12,
  });

  const [results, setResults] = useState<PaymentResults | null>(null);

  useEffect(() => {
    calculateExtraPayments();
  }, [inputs]);

  const calculateExtraPayments = () => {
    const monthlyRate = inputs.interestRate / 100 / 12;
    const numPayments = inputs.loanTerm * 12;

    // Calculate standard monthly payment
    const standardPayment =
      inputs.loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    // Calculate standard loan payoff
    let balance = inputs.loanAmount;
    let totalInterest = 0;
    let month = 0;

    while (balance > 0.01 && month < numPayments) {
      month++;
      const interest = balance * monthlyRate;
      const principal = standardPayment - interest;
      totalInterest += interest;
      balance -= principal;
    }

    const standardTotalInterest = totalInterest;
    const standardPayoffMonths = month;

    // Calculate with extra payments
    balance = inputs.loanAmount;
    totalInterest = 0;
    month = 0;

    // Apply one-time payment if specified
    if (inputs.oneTimePayment > 0 && inputs.oneTimePaymentMonth > 0) {
      // Fast-forward to one-time payment month
      for (let i = 1; i <= inputs.oneTimePaymentMonth; i++) {
        if (balance <= 0.01) break;
        const interest = balance * monthlyRate;
        const principal = standardPayment + inputs.extraMonthly - interest;
        totalInterest += interest;
        balance = Math.max(0, balance - principal);
        month++;
      }
      // Apply one-time payment
      balance = Math.max(0, balance - inputs.oneTimePayment);
    }

    // Continue with regular + extra payments
    while (balance > 0.01 && month < numPayments * 2) {
      month++;
      const interest = balance * monthlyRate;
      
      // Add extra yearly payment if it's December (month 12, 24, 36, etc.)
      const extraThisMonth =
        month % 12 === 0 ? inputs.extraMonthly + inputs.extraYearly : inputs.extraMonthly;
      
      const principal = standardPayment + extraThisMonth - interest;
      totalInterest += interest;
      balance = Math.max(0, balance - principal);
      
      if (balance <= 0.01) break;
    }

    const withExtraTotalInterest = totalInterest;
    const withExtraPayoffMonths = month;

    // Calculate savings
    const interestSaved = standardTotalInterest - withExtraTotalInterest;
    const timeSaved = standardPayoffMonths - withExtraPayoffMonths;

    // Calculate payoff dates (from today)
    const today = new Date();
    const standardPayoffDate = new Date(
      today.getFullYear(),
      today.getMonth() + standardPayoffMonths,
      1
    );
    const withExtraPayoffDate = new Date(
      today.getFullYear(),
      today.getMonth() + withExtraPayoffMonths,
      1
    );

    setResults({
      standardPayment,
      standardTotalInterest,
      standardPayoffMonths,
      withExtraPayment: standardPayment + inputs.extraMonthly,
      withExtraTotalInterest,
      withExtraPayoffMonths,
      interestSaved,
      timeSaved,
      payoffDateStandard: standardPayoffDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
      payoffDateWithExtra: withExtraPayoffDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    });
  };

  const handleInputChange = (field: keyof ExtraPaymentInputs, value: number) => {
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

  const chartData = results
    ? [
        {
          name: 'Standard Loan',
          'Total Interest': results.standardTotalInterest,
          'Principal': inputs.loanAmount,
        },
        {
          name: 'With Extra Payments',
          'Total Interest': results.withExtraTotalInterest,
          'Principal': inputs.loanAmount,
        },
      ]
    : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Extra Payment Calculator
      </h3>
      <p className="text-gray-600 mb-6">
        See how extra payments can save you money and pay off your loan faster.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Loan Details</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={inputs.loanAmount}
                onChange={(e) =>
                  handleInputChange('loanAmount', parseFloat(e.target.value))
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

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-4">Extra Payments</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extra Monthly Payment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  value={inputs.extraMonthly}
                  onChange={(e) =>
                    handleInputChange('extraMonthly', parseFloat(e.target.value))
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Applied every month in addition to your regular payment
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extra Yearly Payment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  value={inputs.extraYearly}
                  onChange={(e) =>
                    handleInputChange('extraYearly', parseFloat(e.target.value))
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Applied once per year (e.g., tax refund, bonus)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                One-Time Payment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  value={inputs.oneTimePayment}
                  onChange={(e) =>
                    handleInputChange('oneTimePayment', parseFloat(e.target.value))
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apply One-Time Payment After (months)
              </label>
              <input
                type="number"
                value={inputs.oneTimePaymentMonth}
                onChange={(e) =>
                  handleInputChange(
                    'oneTimePaymentMonth',
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Savings Analysis</h4>

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Without Extra</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(results.standardTotalInterest)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Total interest paid
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">With Extra</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(results.withExtraTotalInterest)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Total interest paid
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Total Savings</div>
                <div className="text-4xl font-bold text-blue-600">
                  {formatCurrency(results.interestSaved)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Pay off {Math.floor(results.timeSaved / 12)} years{' '}
                  {results.timeSaved % 12} months earlier
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Standard Monthly Payment
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(results.standardPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    With Extra Payment
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(results.withExtraPayment)}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Extra Amount/Month
                  </span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(
                      results.withExtraPayment - results.standardPayment
                    )}
                  </span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="Principal" fill="#3b82f6" />
                  <Bar dataKey="Total Interest" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Payoff Date (Standard)
                  </span>
                  <span className="font-semibold text-gray-900">
                    {results.payoffDateStandard}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Payoff Date (With Extra)
                  </span>
                  <span className="font-semibold text-green-600">
                    {results.payoffDateWithExtra}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    Time Saved
                  </span>
                  <span className="font-bold text-blue-600">
                    {Math.floor(results.timeSaved / 12)} years{' '}
                    {results.timeSaved % 12} months
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">
                  💡 Smart Strategies
                </h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Make one extra payment per year saves ~7 years on a 30-year loan</li>
                  <li>• Even $50-100/month makes a significant difference</li>
                  <li>• Specify "principal only" when making extra payments</li>
                  <li>• Use windfalls (bonuses, tax refunds) for lump sum payments</li>
                  <li>• Earlier payments have bigger impact than later ones</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
