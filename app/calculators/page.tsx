// CR AudioViz AI - Mortgage Rate Monitor
// Comprehensive Calculators Page
// December 14, 2025

'use client';

import { useState, useEffect } from 'react';
import { 
  Calculator, Home, DollarSign, TrendingDown, RefreshCw,
  PiggyBank, Percent, Calendar, HelpCircle, CheckCircle,
  ArrowRight, Info, ChevronDown, ChevronUp
} from 'lucide-react';

type CalculatorType = 'affordability' | 'payment' | 'refinance';

export default function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('affordability');
  const [currentRates, setCurrentRates] = useState<any>({});

  useEffect(() => {
    fetchRates();
  }, []);

  async function fetchRates() {
    try {
      const response = await fetch('/api/mortgage/rates');
      const data = await response.json();
      if (data.success) {
        const ratesMap: any = {};
        data.rates.forEach((r: any) => {
          ratesMap[r.rateType] = r.rate;
        });
        setCurrentRates(ratesMap);
      }
    } catch (err) {
      console.error('Failed to fetch rates:', err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Mortgage Calculators</h1>
          <p className="text-green-100">
            Make informed decisions with our free calculators
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calculator Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'affordability', label: 'How Much Can I Afford?', icon: Home },
            { id: 'payment', label: 'Monthly Payment', icon: DollarSign },
            { id: 'refinance', label: 'Should I Refinance?', icon: RefreshCw },
          ].map(calc => {
            const Icon = calc.icon;
            return (
              <button
                key={calc.id}
                onClick={() => setActiveCalculator(calc.id as CalculatorType)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition ${
                  activeCalculator === calc.id
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {calc.label}
              </button>
            );
          })}
        </div>

        {/* Calculator Content */}
        {activeCalculator === 'affordability' && (
          <AffordabilityCalculator currentRate={currentRates['30-Year Fixed'] || 6.5} />
        )}
        {activeCalculator === 'payment' && (
          <PaymentCalculator currentRates={currentRates} />
        )}
        {activeCalculator === 'refinance' && (
          <RefinanceCalculator currentRate={currentRates['30-Year Fixed'] || 6.5} />
        )}
      </div>
    </div>
  );
}

// ==================== AFFORDABILITY CALCULATOR ====================

function AffordabilityCalculator({ currentRate }: { currentRate: number }) {
  const [annualIncome, setAnnualIncome] = useState<number>(100000);
  const [monthlyDebts, setMonthlyDebts] = useState<number>(500);
  const [downPayment, setDownPayment] = useState<number>(50000);
  const [interestRate, setInterestRate] = useState<number>(currentRate);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [propertyTax, setPropertyTax] = useState<number>(1.2);
  const [insurance, setInsurance] = useState<number>(1200);
  const [hoa, setHoa] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setInterestRate(currentRate);
  }, [currentRate]);

  // Calculate affordability
  const monthlyIncome = annualIncome / 12;
  
  // Use 28% front-end ratio (housing costs) and 36% back-end ratio (total debts)
  const maxHousingPayment = monthlyIncome * 0.28;
  const maxTotalDebtPayment = monthlyIncome * 0.36;
  const maxMortgagePayment = Math.min(maxHousingPayment, maxTotalDebtPayment - monthlyDebts);

  // Calculate monthly property tax and insurance
  const monthlyPropertyTax = (propertyTax / 100) * 300000 / 12; // Estimate based on $300k home
  const monthlyInsurance = insurance / 12;
  const monthlyHoa = hoa;

  // Principal + Interest only
  const maxPIPayment = Math.max(0, maxMortgagePayment - monthlyPropertyTax - monthlyInsurance - monthlyHoa);

  // Calculate max loan amount using mortgage formula
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  
  let maxLoanAmount = 0;
  if (monthlyRate > 0 && maxPIPayment > 0) {
    maxLoanAmount = maxPIPayment * ((Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments)));
  }

  const maxHomePrice = maxLoanAmount + downPayment;
  
  // PMI estimate (if down payment < 20%)
  const downPaymentPercent = (downPayment / maxHomePrice) * 100;
  const needsPMI = downPaymentPercent < 20;
  const monthlyPMI = needsPMI ? (maxLoanAmount * 0.005) / 12 : 0;

  // Actual monthly payment breakdown
  const actualMonthlyPayment = maxPIPayment + monthlyPropertyTax + monthlyInsurance + monthlyHoa + monthlyPMI;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Home className="w-6 h-6 text-green-600" />
          How Much House Can You Afford?
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Household Income
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Before taxes (gross income)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Debt Payments
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={monthlyDebts}
                onChange={(e) => setMonthlyDebts(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Car loans, credit cards, student loans, etc.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Down Payment
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.125"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Term
              </label>
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              >
                <option value={30}>30 years</option>
                <option value={20}>20 years</option>
                <option value={15}>15 years</option>
                <option value={10}>10 years</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Advanced Options
          </button>

          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Tax Rate (% of home value)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={propertyTax}
                  onChange={(e) => setPropertyTax(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Insurance
                </label>
                <input
                  type="number"
                  value={insurance}
                  onChange={(e) => setInsurance(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly HOA Fees
                </label>
                <input
                  type="number"
                  value={hoa}
                  onChange={(e) => setHoa(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Main Result */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
          <p className="text-green-100 mb-2">You can afford a home up to</p>
          <div className="text-5xl font-bold mb-4">{formatCurrency(maxHomePrice)}</div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-green-100 text-sm">Loan Amount</p>
              <p className="text-xl font-semibold">{formatCurrency(maxLoanAmount)}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Down Payment</p>
              <p className="text-xl font-semibold">{formatCurrency(downPayment)} ({downPaymentPercent.toFixed(1)}%)</p>
            </div>
          </div>
        </div>

        {/* Monthly Payment Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Estimated Monthly Payment</h3>
          <div className="text-3xl font-bold text-gray-900 mb-4">{formatCurrency(actualMonthlyPayment)}/mo</div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Principal & Interest</span>
              <span className="font-medium">{formatCurrency(maxPIPayment)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Property Tax</span>
              <span className="font-medium">{formatCurrency(monthlyPropertyTax)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Home Insurance</span>
              <span className="font-medium">{formatCurrency(monthlyInsurance)}</span>
            </div>
            {monthlyHoa > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">HOA Fees</span>
                <span className="font-medium">{formatCurrency(monthlyHoa)}</span>
              </div>
            )}
            {needsPMI && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1">
                  PMI
                  <span className="text-xs text-orange-600">(down payment &lt;20%)</span>
                </span>
                <span className="font-medium">{formatCurrency(monthlyPMI)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Tips to Afford More
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Increase down payment to avoid PMI</li>
            <li>• Pay down existing debts first</li>
            <li>• Improve credit score for better rates</li>
            <li>• Consider a 15-year loan for lower total interest</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ==================== PAYMENT CALCULATOR ====================

function PaymentCalculator({ currentRates }: { currentRates: any }) {
  const [homePrice, setHomePrice] = useState<number>(400000);
  const [downPayment, setDownPayment] = useState<number>(80000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(currentRates['30-Year Fixed'] || 6.5);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [propertyTax, setPropertyTax] = useState<number>(1.2);
  const [insurance, setInsurance] = useState<number>(1200);
  const [hoa, setHoa] = useState<number>(0);
  const [usePercent, setUsePercent] = useState(true);

  useEffect(() => {
    if (currentRates['30-Year Fixed']) {
      setInterestRate(currentRates['30-Year Fixed']);
    }
  }, [currentRates]);

  // Sync down payment and percent
  useEffect(() => {
    if (usePercent) {
      setDownPayment(homePrice * (downPaymentPercent / 100));
    }
  }, [homePrice, downPaymentPercent, usePercent]);

  const loanAmount = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;

  // Calculate P&I
  let monthlyPI = 0;
  if (monthlyRate > 0) {
    monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  const monthlyPropertyTax = (propertyTax / 100) * homePrice / 12;
  const monthlyInsurance = insurance / 12;
  const needsPMI = (downPayment / homePrice) < 0.2;
  const monthlyPMI = needsPMI ? (loanAmount * 0.005) / 12 : 0;

  const totalMonthly = monthlyPI + monthlyPropertyTax + monthlyInsurance + hoa + monthlyPMI;
  const totalInterest = (monthlyPI * numPayments) - loanAmount;
  const totalCost = homePrice + totalInterest + (monthlyPropertyTax + monthlyInsurance + hoa + monthlyPMI) * numPayments;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Calculate Monthly Payment
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Home Price</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={Math.round(downPayment)}
                  onChange={(e) => {
                    setDownPayment(Number(e.target.value));
                    setDownPaymentPercent((Number(e.target.value) / homePrice) * 100);
                    setUsePercent(false);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="relative w-24">
                <input
                  type="number"
                  value={downPaymentPercent}
                  onChange={(e) => {
                    setDownPaymentPercent(Number(e.target.value));
                    setUsePercent(true);
                  }}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
              <select
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              >
                {Object.entries(currentRates).map(([type, rate]) => (
                  <option key={type} value={rate as number}>
                    {type}: {(rate as number).toFixed(2)}%
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term</label>
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              >
                <option value={30}>30 years</option>
                <option value={20}>20 years</option>
                <option value={15}>15 years</option>
                <option value={10}>10 years</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Tax %</label>
              <input
                type="number"
                step="0.1"
                value={propertyTax}
                onChange={(e) => setPropertyTax(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance/yr</label>
              <input
                type="number"
                value={insurance}
                onChange={(e) => setInsurance(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HOA/mo</label>
              <input
                type="number"
                value={hoa}
                onChange={(e) => setHoa(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <p className="text-blue-100 mb-2">Your Monthly Payment</p>
          <div className="text-5xl font-bold mb-4">{formatCurrency(totalMonthly)}</div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-blue-100 text-sm">Loan Amount</p>
              <p className="text-xl font-semibold">{formatCurrency(loanAmount)}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Total Interest</p>
              <p className="text-xl font-semibold">{formatCurrency(totalInterest)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Payment Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Principal & Interest</span>
              <span className="font-medium">{formatCurrency(monthlyPI)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Property Tax</span>
              <span className="font-medium">{formatCurrency(monthlyPropertyTax)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Home Insurance</span>
              <span className="font-medium">{formatCurrency(monthlyInsurance)}</span>
            </div>
            {hoa > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">HOA Fees</span>
                <span className="font-medium">{formatCurrency(hoa)}</span>
              </div>
            )}
            {needsPMI && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">PMI</span>
                <span className="font-medium text-orange-600">{formatCurrency(monthlyPMI)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Monthly</span>
              <span className="font-bold text-xl">{formatCurrency(totalMonthly)}</span>
            </div>
          </div>
        </div>

        {needsPMI && (
          <div className="bg-orange-50 rounded-xl p-4">
            <h4 className="font-semibold text-orange-900 flex items-center gap-2">
              <Info className="w-4 h-4" />
              PMI Notice
            </h4>
            <p className="text-sm text-orange-800 mt-1">
              With less than 20% down, you'll pay PMI. Put down {formatCurrency(homePrice * 0.2)} to avoid it and save {formatCurrency(monthlyPMI)}/month.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== REFINANCE CALCULATOR ====================

function RefinanceCalculator({ currentRate }: { currentRate: number }) {
  const [currentLoanBalance, setCurrentLoanBalance] = useState<number>(300000);
  const [currentInterestRate, setCurrentInterestRate] = useState<number>(7.5);
  const [currentMonthlyPayment, setCurrentMonthlyPayment] = useState<number>(2098);
  const [remainingYears, setRemainingYears] = useState<number>(27);
  const [newInterestRate, setNewInterestRate] = useState<number>(currentRate);
  const [newLoanTerm, setNewLoanTerm] = useState<number>(30);
  const [closingCosts, setClosingCosts] = useState<number>(6000);
  const [rollClosingCosts, setRollClosingCosts] = useState(false);

  useEffect(() => {
    setNewInterestRate(currentRate);
  }, [currentRate]);

  // Calculate new payment
  const newLoanAmount = rollClosingCosts ? currentLoanBalance + closingCosts : currentLoanBalance;
  const newMonthlyRate = newInterestRate / 100 / 12;
  const newNumPayments = newLoanTerm * 12;

  let newMonthlyPayment = 0;
  if (newMonthlyRate > 0) {
    newMonthlyPayment = newLoanAmount * (newMonthlyRate * Math.pow(1 + newMonthlyRate, newNumPayments)) / (Math.pow(1 + newMonthlyRate, newNumPayments) - 1);
  }

  const monthlySavings = currentMonthlyPayment - newMonthlyPayment;
  const breakevenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : Infinity;

  // Total cost comparison
  const remainingCurrentCost = currentMonthlyPayment * remainingYears * 12;
  const totalNewCost = (newMonthlyPayment * newNumPayments) + (rollClosingCosts ? 0 : closingCosts);
  const lifetimeSavings = remainingCurrentCost - totalNewCost;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const shouldRefinance = monthlySavings > 0 && breakevenMonths < remainingYears * 12;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-green-600" />
          Should You Refinance?
        </h2>

        <div className="space-y-5">
          <h3 className="font-semibold text-gray-700 border-b pb-2">Current Mortgage</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Loan Balance</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={currentLoanBalance}
                onChange={(e) => setCurrentLoanBalance(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Rate</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.125"
                  value={currentInterestRate}
                  onChange={(e) => setCurrentInterestRate(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years Remaining</label>
              <input
                type="number"
                value={remainingYears}
                onChange={(e) => setRemainingYears(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Monthly Payment (P&I)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={currentMonthlyPayment}
                onChange={(e) => setCurrentMonthlyPayment(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
          </div>

          <h3 className="font-semibold text-gray-700 border-b pb-2 pt-4">New Loan Options</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Rate</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.125"
                  value={newInterestRate}
                  onChange={(e) => setNewInterestRate(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-green-50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Today's rate: {currentRate}%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Term</label>
              <select
                value={newLoanTerm}
                onChange={(e) => setNewLoanTerm(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              >
                <option value={30}>30 years</option>
                <option value={20}>20 years</option>
                <option value={15}>15 years</option>
                <option value={10}>10 years</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Closing Costs</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={closingCosts}
                onChange={(e) => setClosingCosts(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={rollClosingCosts}
                onChange={(e) => setRollClosingCosts(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded"
              />
              Roll closing costs into loan
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Recommendation */}
        <div className={`rounded-2xl p-6 ${shouldRefinance ? 'bg-gradient-to-br from-green-600 to-emerald-700' : 'bg-gradient-to-br from-orange-500 to-red-600'} text-white`}>
          <div className="flex items-center gap-2 mb-2">
            {shouldRefinance ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <Info className="w-6 h-6" />
            )}
            <span className="font-semibold">
              {shouldRefinance ? 'Refinancing Makes Sense!' : 'Consider Waiting'}
            </span>
          </div>
          <p className="text-white/90 mb-4">
            {shouldRefinance 
              ? `You could save ${formatCurrency(monthlySavings)}/month and break even in ${breakevenMonths} months.`
              : monthlySavings <= 0 
                ? 'Your current rate is already competitive.'
                : `Breakeven would take ${breakevenMonths} months - longer than your remaining term.`
            }
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-white/70 text-sm">New Payment</p>
              <p className="text-2xl font-bold">{formatCurrency(newMonthlyPayment)}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Monthly Savings</p>
              <p className="text-2xl font-bold">
                {monthlySavings > 0 ? '+' : ''}{formatCurrency(monthlySavings)}
              </p>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Side-by-Side Comparison</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-2"></th>
                <th className="pb-2">Current</th>
                <th className="pb-2">New Loan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-2 text-gray-600">Interest Rate</td>
                <td className="py-2 font-medium">{currentInterestRate}%</td>
                <td className="py-2 font-medium text-green-600">{newInterestRate}%</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Monthly Payment</td>
                <td className="py-2 font-medium">{formatCurrency(currentMonthlyPayment)}</td>
                <td className="py-2 font-medium">{formatCurrency(newMonthlyPayment)}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Remaining Cost</td>
                <td className="py-2 font-medium">{formatCurrency(remainingCurrentCost)}</td>
                <td className="py-2 font-medium">{formatCurrency(totalNewCost)}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Breakeven</td>
                <td className="py-2 text-gray-400">—</td>
                <td className="py-2 font-medium">
                  {breakevenMonths < Infinity ? `${breakevenMonths} months` : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {lifetimeSavings > 0 && (
          <div className="bg-green-50 rounded-xl p-4">
            <h4 className="font-semibold text-green-900">Lifetime Savings</h4>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(lifetimeSavings)}</p>
            <p className="text-sm text-green-600">over the life of the loan</p>
          </div>
        )}
      </div>
    </div>
  );
}
