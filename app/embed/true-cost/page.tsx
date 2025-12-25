// RateUnlock - Embeddable True Cost Calculator
// Standalone embed page for partner websites
// December 24, 2025

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface PartnerConfig {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  leadCapture: boolean;
  callbackUrl?: string;
}

const DEFAULT_CONFIG: PartnerConfig = {
  id: 'rateunlock',
  name: 'RateUnlock',
  primaryColor: '#10b981',
  secondaryColor: '#8b5cf6',
  leadCapture: true,
};

export default function EmbedTrueCostPage() {
  const searchParams = useSearchParams();
  const partnerId = searchParams.get('partner') || 'rateunlock';
  const theme = searchParams.get('theme') || 'dark';
  
  const [config, setConfig] = useState<PartnerConfig>(DEFAULT_CONFIG);
  const [homePrice, setHomePrice] = useState(400000);
  const [downPayment, setDownPayment] = useState(80000);
  const [interestRate, setInterestRate] = useState(6.85);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState(1.2);
  const [insurance, setInsurance] = useState(1200);
  const [hoa, setHoa] = useState(0);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Calculate all costs
  const loanAmount = homePrice - downPayment;
  const downPaymentPercent = (downPayment / homePrice) * 100;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  
  // Monthly P&I
  const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  // PMI (if down payment < 20%)
  const pmiRate = downPaymentPercent < 20 ? 0.005 : 0;
  const monthlyPMI = (loanAmount * pmiRate) / 12;
  
  // Property tax
  const monthlyPropertyTax = (homePrice * (propertyTax / 100)) / 12;
  
  // Insurance
  const monthlyInsurance = insurance / 12;
  
  // HOA
  const monthlyHOA = hoa;
  
  // Total monthly
  const totalMonthly = monthlyPI + monthlyPMI + monthlyPropertyTax + monthlyInsurance + monthlyHOA;
  
  // Total over life of loan
  const totalPayments = monthlyPI * numPayments;
  const totalInterest = totalPayments - loanAmount;
  
  // 5-year cost
  const fiveYearCost = totalMonthly * 60;
  
  // Closing costs estimate (2-5% of loan)
  const closingCosts = loanAmount * 0.03;

  // Track view
  useEffect(() => {
    fetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerId,
        event: 'view',
        data: { calculator: 'true-cost', theme },
      }),
    }).catch(() => {});
    
    // Notify parent of height for auto-resize
    const sendHeight = () => {
      window.parent.postMessage({
        type: 'rateunlock-resize',
        height: document.body.scrollHeight,
      }, '*');
    };
    sendHeight();
    window.addEventListener('resize', sendHeight);
    return () => window.removeEventListener('resize', sendHeight);
  }, [partnerId, theme]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerId,
        event: 'lead',
        data: {
          email: leadEmail,
          calculator: 'true-cost',
          homePrice,
          loanAmount,
          monthlyPayment: totalMonthly,
        },
      }),
    });
    
    setLeadSubmitted(true);
  };

  const bgClass = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const cardClass = theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100';
  const inputClass = theme === 'dark' 
    ? 'bg-slate-800 border-slate-600 text-white' 
    : 'bg-white border-slate-300 text-slate-900';

  return (
    <div className={`${bgClass} ${textClass} min-h-screen p-4 font-sans`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="embedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={config.primaryColor} />
                <stop offset="100%" stopColor={config.secondaryColor} />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="29" fill="none" stroke="url(#embedGrad)" strokeWidth="2.5"/>
            <rect x="20" y="27" width="24" height="20" rx="4" fill="url(#embedGrad)"/>
            <path d="M25 27 L25 21 Q25 13 32 13 Q39 13 39 21 L39 27" fill="none" stroke="url(#embedGrad)" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <span className="font-bold text-lg">
            <span style={{ color: config.primaryColor }}>True Cost</span> Calculator
          </span>
        </div>
        <a 
          href="https://rateunlock.com?ref=embed" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`text-xs ${mutedClass} hover:underline`}
        >
          Powered by RateUnlock
        </a>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className={`${cardClass} rounded-xl p-6`}>
          <h3 className="font-semibold mb-4">Loan Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm ${mutedClass} mb-1`}>Home Price</label>
              <input
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className={`w-full ${inputClass} border rounded-lg px-4 py-2`}
              />
            </div>
            
            <div>
              <label className={`block text-sm ${mutedClass} mb-1`}>
                Down Payment ({downPaymentPercent.toFixed(0)}%)
              </label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className={`w-full ${inputClass} border rounded-lg px-4 py-2`}
              />
              <input
                type="range"
                min={0}
                max={homePrice * 0.5}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm ${mutedClass} mb-1`}>Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.125"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className={`w-full ${inputClass} border rounded-lg px-4 py-2`}
                />
              </div>
              <div>
                <label className={`block text-sm ${mutedClass} mb-1`}>Loan Term</label>
                <select
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className={`w-full ${inputClass} border rounded-lg px-4 py-2`}
                >
                  <option value={30}>30 Years</option>
                  <option value={15}>15 Years</option>
                  <option value={20}>20 Years</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm ${mutedClass} mb-1`}>Property Tax (%/yr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={propertyTax}
                  onChange={(e) => setPropertyTax(Number(e.target.value))}
                  className={`w-full ${inputClass} border rounded-lg px-4 py-2`}
                />
              </div>
              <div>
                <label className={`block text-sm ${mutedClass} mb-1`}>Insurance ($/yr)</label>
                <input
                  type="number"
                  value={insurance}
                  onChange={(e) => setInsurance(Number(e.target.value))}
                  className={`w-full ${inputClass} border rounded-lg px-4 py-2`}
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm ${mutedClass} mb-1`}>HOA ($/mo)</label>
              <input
                type="number"
                value={hoa}
                onChange={(e) => setHoa(Number(e.target.value))}
                className={`w-full ${inputClass} border rounded-lg px-4 py-2`}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Monthly Payment */}
          <div className={`${cardClass} rounded-xl p-6`}>
            <p className={`text-sm ${mutedClass} mb-1`}>Total Monthly Payment</p>
            <p className="text-4xl font-bold" style={{ color: config.primaryColor }}>
              ${totalMonthly.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={mutedClass}>Principal & Interest</span>
                <span>${monthlyPI.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className={mutedClass}>Property Tax</span>
                <span>${monthlyPropertyTax.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className={mutedClass}>Insurance</span>
                <span>${monthlyInsurance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
              {monthlyPMI > 0 && (
                <div className="flex justify-between">
                  <span className={mutedClass}>PMI</span>
                  <span>${monthlyPMI.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              {monthlyHOA > 0 && (
                <div className="flex justify-between">
                  <span className={mutedClass}>HOA</span>
                  <span>${monthlyHOA.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
            </div>
          </div>

          {/* True Cost Summary */}
          <div className={`${cardClass} rounded-xl p-6`}>
            <h4 className="font-semibold mb-3">True Cost Analysis</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className={mutedClass}>Loan Amount</p>
                <p className="font-semibold">${loanAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className={mutedClass}>Total Interest</p>
                <p className="font-semibold text-amber-500">${totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className={mutedClass}>Closing Costs (est.)</p>
                <p className="font-semibold">${closingCosts.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className={mutedClass}>5-Year Cost</p>
                <p className="font-semibold">${fiveYearCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
            
            {downPaymentPercent < 20 && (
              <div className="mt-4 bg-amber-500/20 text-amber-400 text-sm p-3 rounded-lg">
                💡 With {downPaymentPercent.toFixed(0)}% down, you&apos;ll pay ~${(monthlyPMI * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}/yr in PMI until you reach 20% equity.
              </div>
            )}
          </div>

          {/* Lead Capture */}
          {config.leadCapture && !leadSubmitted && (
            <div className={`${cardClass} rounded-xl p-6`}>
              <h4 className="font-semibold mb-2">Get Your Full Report</h4>
              <p className={`text-sm ${mutedClass} mb-3`}>
                Enter your email for a detailed breakdown and personalized lender recommendations.
              </p>
              <form onSubmit={handleLeadSubmit} className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  required
                  className={`flex-1 ${inputClass} border rounded-lg px-4 py-2`}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-medium text-white"
                  style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}
                >
                  Send
                </button>
              </form>
            </div>
          )}
          
          {leadSubmitted && (
            <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-xl text-center">
              ✓ Check your email for your personalized report!
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={`mt-6 pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} text-center`}>
        <p className={`text-xs ${mutedClass}`}>
          Estimates only. Actual costs may vary. 
          <a href="https://rateunlock.com" target="_blank" rel="noopener noreferrer" className="ml-1 underline">
            Visit RateUnlock.com
          </a> for more tools.
        </p>
      </div>
    </div>
  );
}
