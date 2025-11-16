'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PaymentInputs {
  homePrice: number;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  hoaFees: number;
}

interface PaymentBreakdown {
  principal: number;
  interest: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  hoaFees: number;
  total: number;
}

interface AmortizationEntry {
  month: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
}

export default function MortgagePaymentCalculator() {
  const [inputs, setInputs] = useState<PaymentInputs>({
    homePrice: 350000,
    downPayment: 70000,
    loanTerm: 30,
    interestRate: 6.5,
    propertyTax: 1.2,
    homeInsurance: 1200,
    pmi: 0,
    hoaFees: 0,
  });

  const [breakdown, setBreakdown] = useState<PaymentBreakdown | null>(null);
  const [amortization, setAmortization] = useState<AmortizationEntry[]>([]);
  const [showAmortization, setShowAmortization] = useState(false);

  useEffect(() => {
    calculatePayment();
  }, [inputs]);

  const calculatePayment = () => {
    const loanAmount = inputs.homePrice - inputs.downPayment;
    const monthlyRate = inputs.interestRate / 100 / 12;
    const numPayments = inputs.loanTerm * 12;

    // Calculate monthly principal & interest using mortgage formula
    const principalInterest =
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    // Calculate first month interest (for breakdown)
    const firstMonthInterest = loanAmount * monthlyRate;
    const firstMonthPrincipal = principalInterest - firstMonthInterest;

    // Calculate other monthly costs
    const monthlyPropertyTax =
      (inputs.homePrice * (inputs.propertyTax / 100)) / 12;
    const monthlyInsurance = inputs.homeInsurance / 12;

    const breakdown: PaymentBreakdown = {
      principal: firstMonthPrincipal,
      interest: firstMonthInterest,
      propertyTax: monthlyPropertyTax,
      homeInsurance: monthlyInsurance,
      pmi: inputs.pmi,
      hoaFees: inputs.hoaFees,
      total:
        principalInterest +
        monthlyPropertyTax +
        monthlyInsurance +
        inputs.pmi +
        inputs.hoaFees,
    };

    setBreakdown(breakdown);

    // Generate amortization schedule
    generateAmortization(loanAmount, monthlyRate, numPayments, principalInterest);
  };

  const generateAmortization = (
    loanAmount: number,
    monthlyRate: number,
    numPayments: number,
    monthlyPayment: number
  ) => {
    const schedule: AmortizationEntry[] = [];
    let balance = loanAmount;

    for (let month = 1; month <= Math.min(numPayments, 360); month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month,
        principalPayment,
        interestPayment,
        remainingBalance: Math.max(balance, 0),
      });

      if (balance <= 0) break;
    }

    setAmortization(schedule);
  };

  const handleInputChange = (field: keyof PaymentInputs, value: number) => {
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

  const downPaymentPercent = (inputs.downPayment / inputs.homePrice) * 100;
  const loanAmount = inputs.homePrice - inputs.downPayment;

  const pieData = breakdown
    ? [
        { name: 'Principal', value: breakdown.principal, color: '#3b82f6' },
        { name: 'Interest', value: breakdown.interest, color: '#ef4444' },
        {
          name: 'Property Tax',
          value: breakdown.propertyTax,
          color: '#10b981',
        },
        {
          name: 'Insurance',
          value: breakdown.homeInsurance,
          color: '#f59e0b',
        },
        ...(breakdown.pmi > 0
          ? [{ name: 'PMI', value: breakdown.pmi, color: '#8b5cf6' }]
          : []),
        ...(breakdown.hoaFees > 0
          ? [{ name: 'HOA', value: breakdown.hoaFees, color: '#06b6d4' }]
          : []),
      ]
    : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Mortgage Payment Calculator
      </h3>
      <p className="text-gray-600 mb-6">
        Calculate your monthly mortgage payment and see a detailed breakdown.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Loan Details</h4>

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
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Down Payment
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
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
              <div className="w-20">
                <input
                  type="number"
                  value={downPaymentPercent.toFixed(0)}
                  onChange={(e) =>
                    handleInputChange(
                      'downPayment',
                      (inputs.homePrice * parseFloat(e.target.value)) / 100
                    )
                  }
                  className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                />
                <span className="text-xs text-gray-500 text-center block mt-1">
                  %
                </span>
              </div>
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
              Loan Term
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

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h5 className="font-semibold text-gray-900 mb-3">
              Additional Costs
            </h5>

            <div className="space-y-3">
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
          </div>
        </div>

        {/* Results Section */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Payment Breakdown</h4>

          {breakdown && (
            <div className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="text-sm text-gray-600 mb-1">
                  Monthly Payment
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  {formatCurrency(breakdown.total)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Loan Amount</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(loanAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Down Payment</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(inputs.downPayment)} (
                    {downPaymentPercent.toFixed(0)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Interest</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(
                      breakdown.interest * inputs.loanTerm * 12
                    )}
                  </span>
                </div>
              </div>

              {/* Payment Breakdown Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-4">
                  Payment Components
                </h5>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showAmortization
                  ? 'Hide Amortization Schedule'
                  : 'View Amortization Schedule'}
              </button>

              {showAmortization && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        <th className="text-left py-2">Month</th>
                        <th className="text-right py-2">Principal</th>
                        <th className="text-right py-2">Interest</th>
                        <th className="text-right py-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amortization.map((entry) => (
                        <tr
                          key={entry.month}
                          className="border-t border-gray-100"
                        >
                          <td className="py-2">{entry.month}</td>
                          <td className="text-right">
                            {formatCurrency(entry.principalPayment)}
                          </td>
                          <td className="text-right">
                            {formatCurrency(entry.interestPayment)}
                          </td>
                          <td className="text-right font-semibold">
                            {formatCurrency(entry.remainingBalance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
