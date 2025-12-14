// CR AudioViz AI - Mortgage Rate Monitor
// Enhanced Payment Calculator with Full Escrow Costs
// Created: 2025-12-14

'use client';

import { useState, useEffect } from 'react';
import { 
  Calculator, DollarSign, Percent, Home, Shield,
  Building, FileText, PiggyBank, TrendingDown, Info,
  ChevronDown, ChevronUp
} from 'lucide-react';

interface CalculationResult {
  monthlyPrincipalInterest: number;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  monthlyPMI: number;
  monthlyHOA: number;
  monthlyFloodInsurance: number;
  monthlySpecialAssessment: number;
  monthlyOther: number;
  totalMonthlyPayment: number;
  totalMonthlyEscrow: number;
  totalInterest: number;
  totalCost: number;
  loanAmount: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
}

export default function PaymentCalculator() {
  // Basic inputs
  const [homePrice, setHomePrice] = useState('400000');
  const [downPayment, setDownPayment] = useState('80000');
  const [downPaymentType, setDownPaymentType] = useState<'amount' | 'percent'>('amount');
  const [interestRate, setInterestRate] = useState('6.22');
  const [loanTerm, setLoanTerm] = useState('30');
  
  // Escrow & Additional Costs
  const [propertyTax, setPropertyTax] = useState('4800'); // Annual
  const [homeInsurance, setHomeInsurance] = useState('1800'); // Annual
  const [pmiRate, setPmiRate] = useState('0.5'); // Annual % of loan
  const [hoaFees, setHoaFees] = useState('0'); // Monthly
  const [floodInsurance, setFloodInsurance] = useState('0'); // Annual
  const [specialAssessment, setSpecialAssessment] = useState('0'); // Monthly
  const [otherMonthly, setOtherMonthly] = useState('0'); // Monthly
  
  // UI state
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Calculate whenever inputs change
  useEffect(() => {
    calculate();
  }, [homePrice, downPayment, downPaymentType, interestRate, loanTerm, 
      propertyTax, homeInsurance, pmiRate, hoaFees, floodInsurance, 
      specialAssessment, otherMonthly]);

  function calculate() {
    const price = parseFloat(homePrice) || 0;
    let downPaymentAmount: number;
    let downPaymentPercent: number;

    if (downPaymentType === 'percent') {
      downPaymentPercent = parseFloat(downPayment) || 0;
      downPaymentAmount = price * (downPaymentPercent / 100);
    } else {
      downPaymentAmount = parseFloat(downPayment) || 0;
      downPaymentPercent = price > 0 ? (downPaymentAmount / price) * 100 : 0;
    }

    const loanAmount = price - downPaymentAmount;
    const monthlyRate = (parseFloat(interestRate) || 0) / 100 / 12;
    const numberOfPayments = (parseInt(loanTerm) || 30) * 12;

    // Monthly P&I calculation
    let monthlyPrincipalInterest = 0;
    if (monthlyRate > 0 && loanAmount > 0) {
      monthlyPrincipalInterest = loanAmount * 
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else if (loanAmount > 0) {
      monthlyPrincipalInterest = loanAmount / numberOfPayments;
    }

    // Escrow calculations
    const monthlyPropertyTax = (parseFloat(propertyTax) || 0) / 12;
    const monthlyHomeInsurance = (parseFloat(homeInsurance) || 0) / 12;
    const monthlyFloodInsurance = (parseFloat(floodInsurance) || 0) / 12;
    const monthlyHOA = parseFloat(hoaFees) || 0;
    const monthlySpecialAssessment = parseFloat(specialAssessment) || 0;
    const monthlyOther = parseFloat(otherMonthly) || 0;

    // PMI calculation (typically required if down payment < 20%)
    let monthlyPMI = 0;
    if (downPaymentPercent < 20 && loanAmount > 0) {
      const annualPMI = loanAmount * ((parseFloat(pmiRate) || 0.5) / 100);
      monthlyPMI = annualPMI / 12;
    }

    // Totals
    const totalMonthlyEscrow = monthlyPropertyTax + monthlyHomeInsurance + 
      monthlyPMI + monthlyFloodInsurance;
    
    const totalMonthlyPayment = monthlyPrincipalInterest + totalMonthlyEscrow + 
      monthlyHOA + monthlySpecialAssessment + monthlyOther;

    const totalInterest = (monthlyPrincipalInterest * numberOfPayments) - loanAmount;
    const totalCost = totalMonthlyPayment * numberOfPayments + downPaymentAmount;

    setResult({
      monthlyPrincipalInterest,
      monthlyPropertyTax,
      monthlyHomeInsurance,
      monthlyPMI,
      monthlyHOA,
      monthlyFloodInsurance,
      monthlySpecialAssessment,
      monthlyOther,
      totalMonthlyPayment,
      totalMonthlyEscrow,
      totalInterest,
      totalCost,
      loanAmount,
      downPaymentAmount,
      downPaymentPercent,
    });
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Payment Calculator</h2>
            <p className="text-blue-100">Complete monthly payment with all costs</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Basic Inputs */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                Loan Details
              </h3>

              {/* Home Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Home Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={homePrice}
                    onChange={(e) => setHomePrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="400000"
                  />
                </div>
              </div>

              {/* Down Payment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Down Payment
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    {downPaymentType === 'amount' ? (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    ) : (
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    )}
                    <input
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={downPaymentType === 'amount' ? '80000' : '20'}
                    />
                  </div>
                  <select
                    value={downPaymentType}
                    onChange={(e) => {
                      setDownPaymentType(e.target.value as 'amount' | 'percent');
                      setDownPayment(e.target.value === 'percent' ? '20' : '80000');
                    }}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="amount">$</option>
                    <option value="percent">%</option>
                  </select>
                </div>
                {result && (
                  <p className="mt-1 text-sm text-gray-500">
                    {formatCurrency(result.downPaymentAmount)} ({result.downPaymentPercent.toFixed(1)}%)
                  </p>
                )}
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="6.22"
                  />
                </div>
              </div>

              {/* Loan Term */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Term
                </label>
                <select
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30">30 years</option>
                  <option value="25">25 years</option>
                  <option value="20">20 years</option>
                  <option value="15">15 years</option>
                  <option value="10">10 years</option>
                </select>
              </div>
            </div>

            {/* Advanced/Escrow Section */}
            <div className="border-t pt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Taxes, Insurance & Escrow
                </h3>
                {showAdvanced ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  {/* Property Tax */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Tax (Annual)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={propertyTax}
                        onChange={(e) => setPropertyTax(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="4800"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatCurrency(parseFloat(propertyTax || '0') / 12)}/month
                    </p>
                  </div>

                  {/* Homeowners Insurance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Homeowners Insurance (Annual)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={homeInsurance}
                        onChange={(e) => setHomeInsurance(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="1800"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatCurrency(parseFloat(homeInsurance || '0') / 12)}/month
                    </p>
                  </div>

                  {/* PMI Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PMI Rate (Annual % of Loan)
                      <span className="ml-2 text-xs text-gray-500">
                        {result && result.downPaymentPercent >= 20 ? '(Not required - 20%+ down)' : ''}
                      </span>
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.1"
                        value={pmiRate}
                        onChange={(e) => setPmiRate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.5"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Typically 0.3% - 1.5% annually. Removed when equity reaches 20%.
                    </p>
                  </div>

                  {/* HOA Fees */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HOA Fees (Monthly)
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={hoaFees}
                        onChange={(e) => setHoaFees(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Flood Insurance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Flood Insurance (Annual)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={floodInsurance}
                        onChange={(e) => setFloodInsurance(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Required if in a flood zone. Avg $700-$2,000/year.
                    </p>
                  </div>

                  {/* Special Assessments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Assessments (Monthly)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={specialAssessment}
                        onChange={(e) => setSpecialAssessment(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      One-time or recurring fees for community improvements.
                    </p>
                  </div>

                  {/* Other Monthly Costs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Other Monthly Costs
                    </label>
                    <div className="relative">
                      <PiggyBank className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={otherMonthly}
                        onChange={(e) => setOtherMonthly(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Maintenance reserves, utilities budget, etc.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              {/* Total Monthly Payment */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl p-6">
                <div className="text-sm text-blue-100 mb-1">Total Monthly Payment</div>
                <div className="text-4xl font-bold mb-2">
                  {formatCurrencyDetailed(result.totalMonthlyPayment)}
                </div>
                <div className="text-sm text-blue-200">
                  Loan Amount: {formatCurrency(result.loanAmount)}
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Monthly Payment Breakdown</h4>
                
                <div className="space-y-3">
                  {/* Principal & Interest */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <span className="text-gray-700">Principal & Interest</span>
                    </div>
                    <span className="font-semibold">{formatCurrencyDetailed(result.monthlyPrincipalInterest)}</span>
                  </div>

                  {/* Property Tax */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-700">Property Tax</span>
                    </div>
                    <span className="font-semibold">{formatCurrencyDetailed(result.monthlyPropertyTax)}</span>
                  </div>

                  {/* Home Insurance */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-gray-700">Home Insurance</span>
                    </div>
                    <span className="font-semibold">{formatCurrencyDetailed(result.monthlyHomeInsurance)}</span>
                  </div>

                  {/* PMI */}
                  {result.monthlyPMI > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-700">PMI</span>
                      </div>
                      <span className="font-semibold">{formatCurrencyDetailed(result.monthlyPMI)}</span>
                    </div>
                  )}

                  {/* HOA */}
                  {result.monthlyHOA > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-gray-700">HOA Fees</span>
                      </div>
                      <span className="font-semibold">{formatCurrencyDetailed(result.monthlyHOA)}</span>
                    </div>
                  )}

                  {/* Flood Insurance */}
                  {result.monthlyFloodInsurance > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                        <span className="text-gray-700">Flood Insurance</span>
                      </div>
                      <span className="font-semibold">{formatCurrencyDetailed(result.monthlyFloodInsurance)}</span>
                    </div>
                  )}

                  {/* Special Assessment */}
                  {result.monthlySpecialAssessment > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-gray-700">Special Assessment</span>
                      </div>
                      <span className="font-semibold">{formatCurrencyDetailed(result.monthlySpecialAssessment)}</span>
                    </div>
                  )}

                  {/* Other */}
                  {result.monthlyOther > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span className="text-gray-700">Other Costs</span>
                      </div>
                      <span className="font-semibold">{formatCurrencyDetailed(result.monthlyOther)}</span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Escrow Total</span>
                      <span className="font-bold text-green-600">
                        {formatCurrencyDetailed(result.totalMonthlyEscrow)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Loan Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Loan Amount</div>
                    <div className="text-lg font-semibold">{formatCurrency(result.loanAmount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Down Payment</div>
                    <div className="text-lg font-semibold">{formatCurrency(result.downPaymentAmount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Total Interest</div>
                    <div className="text-lg font-semibold text-red-600">{formatCurrency(result.totalInterest)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Total Cost</div>
                    <div className="text-lg font-semibold">{formatCurrency(result.totalCost)}</div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Escrow Account Info</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Lenders collect escrow monthly and pay taxes/insurance when due</li>
                      <li>• PMI is automatically removed at 20% equity (request at 22%)</li>
                      <li>• Escrow amounts may be adjusted annually based on actual costs</li>
                      <li>• HOA and special assessments are typically not escrowed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
