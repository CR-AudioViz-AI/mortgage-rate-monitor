'use client';

import { useState } from 'react';

export default function PaymentCalculator() {
  const [homePrice, setHomePrice] = useState<string>('350000');
  const [downPayment, setDownPayment] = useState<string>('70000');
  const [interestRate, setInterestRate] = useState<string>('7.0');
  const [loanTerm, setLoanTerm] = useState<string>('30');
  const [propertyTax, setPropertyTax] = useState<string>('3500');
  const [homeInsurance, setHomeInsurance] = useState<string>('1200');
  const [hoaFees, setHoaFees] = useState<string>('0');
  
  const calculatePayment = () => {
    const price = parseFloat(homePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const principal = price - down;
    const rate = parseFloat(interestRate) / 100 / 12;
    const months = parseInt(loanTerm) * 12;
    
    // Monthly principal & interest
    const monthlyPI = principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    
    // Monthly property tax and insurance
    const monthlyTax = (parseFloat(propertyTax) || 0) / 12;
    const monthlyInsurance = (parseFloat(homeInsurance) || 0) / 12;
    const monthlyHOA = (parseFloat(hoaFees) || 0);
    
    // PMI (if down payment < 20%)
    const downPercent = (down / price) * 100;
    const monthlyPMI = downPercent < 20 ? (principal * 0.005) / 12 : 0;
    
    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA + monthlyPMI;
    
    return {
      principal,
      monthlyPI: Math.round(monthlyPI),
      monthlyTax: Math.round(monthlyTax),
      monthlyInsurance: Math.round(monthlyInsurance),
      monthlyHOA: Math.round(monthlyHOA),
      monthlyPMI: Math.round(monthlyPMI),
      totalMonthly: Math.round(totalMonthly),
      downPercent: downPercent.toFixed(1),
      totalInterest: Math.round(monthlyPI * months - principal),
    };
  };
  
  const results = calculatePayment();
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Mortgage Payment Calculator
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Down Payment ({results.downPercent}%)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Term
            </label>
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="30">30 years</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Property Tax
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={propertyTax}
                onChange={(e) => setPropertyTax(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Home Insurance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={homeInsurance}
                onChange={(e) => setHomeInsurance(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly HOA Fees
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={hoaFees}
                onChange={(e) => setHoaFees(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="text-sm text-green-700 font-medium mb-2">
              Total Monthly Payment
            </div>
            <div className="text-4xl font-bold text-green-900">
              ${results.totalMonthly.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Payment Breakdown</h3>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Principal & Interest</span>
              <span className="font-semibold">${results.monthlyPI.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Property Tax</span>
              <span className="font-semibold">${results.monthlyTax.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Home Insurance</span>
              <span className="font-semibold">${results.monthlyInsurance.toLocaleString()}</span>
            </div>
            
            {results.monthlyHOA > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">HOA Fees</span>
                <span className="font-semibold">${results.monthlyHOA.toLocaleString()}</span>
              </div>
            )}
            
            {results.monthlyPMI > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">PMI</span>
                <span className="font-semibold">${results.monthlyPMI.toLocaleString()}</span>
              </div>
            )}
            
            <div className="pt-3 border-t border-gray-300 flex justify-between font-bold">
              <span>Total</span>
              <span>${results.totalMonthly.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-xs text-blue-700 mb-1">Loan Amount</div>
              <div className="text-lg font-bold text-blue-900">
                ${results.principal.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-xs text-blue-700 mb-1">Total Interest</div>
              <div className="text-lg font-bold text-blue-900">
                ${results.totalInterest.toLocaleString()}
              </div>
            </div>
          </div>
          
          {parseFloat(results.downPercent) < 20 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> PMI required (down payment &lt; 20%)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
