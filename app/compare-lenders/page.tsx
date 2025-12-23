// CR AudioViz AI - Mortgage Rate Monitor
// LENDER COMPARISON PAGE - Real Data, Real Scores
// December 22, 2025

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Lender {
  id: string;
  name: string;
  type: string;
  headquartersState: string;
  nationalApprovalRate: number;
  avgClosingDays: number;
  specialties: string[];
  minCreditScore: number;
  cfpbScore?: number;
  floridaData?: {
    floridaMarketShare: number;
    floridaOriginations2023: number;
    floridaApprovalRate: number;
    avgLoanAmount: number;
  };
  matchScore?: number;
}

interface MarketData {
  state: string;
  year: number;
  totalApplications: number;
  totalOriginations: number;
  averageLoanAmount: number;
  approvalRate: number;
}

const LOAN_TYPE_FILTERS = [
  { value: '', label: 'All Loan Types' },
  { value: 'conventional', label: 'Conventional' },
  { value: 'fha', label: 'FHA' },
  { value: 'va', label: 'VA' },
  { value: 'usda', label: 'USDA' },
  { value: 'jumbo', label: 'Jumbo' },
];

const SORT_OPTIONS = [
  { value: 'matchScore', label: 'Best Match' },
  { value: 'approvalRate', label: 'Highest Approval Rate' },
  { value: 'closingDays', label: 'Fastest Closing' },
  { value: 'cfpbScore', label: 'Best Reputation' },
  { value: 'marketShare', label: 'Most Active in FL' },
];

export default function LenderComparison() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLenders, setSelectedLenders] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    loanType: '',
    minApprovalRate: 0,
    maxClosingDays: 60,
  });
  const [sortBy, setSortBy] = useState('matchScore');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    fetchLenders();
  }, []);

  const fetchLenders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hmda-lenders?state=FL');
      const data = await response.json();
      if (data.success) {
        setLenders(data.lenders);
        setMarket(data.market);
      }
    } catch (error) {
      console.error('Error fetching lenders:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 70) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
    if (score >= 70) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const filteredLenders = lenders
    .filter(l => {
      if (filters.loanType && !l.specialties.some(s => s.toLowerCase().includes(filters.loanType))) {
        return false;
      }
      if (l.nationalApprovalRate < filters.minApprovalRate) return false;
      if (l.avgClosingDays > filters.maxClosingDays) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'approvalRate':
          return b.nationalApprovalRate - a.nationalApprovalRate;
        case 'closingDays':
          return a.avgClosingDays - b.avgClosingDays;
        case 'cfpbScore':
          return (b.cfpbScore || 0) - (a.cfpbScore || 0);
        case 'marketShare':
          return (b.floridaData?.floridaMarketShare || 0) - (a.floridaData?.floridaMarketShare || 0);
        default:
          return (b.matchScore || 0) - (a.matchScore || 0);
      }
    });

  const toggleLenderSelection = (id: string) => {
    setSelectedLenders(prev => 
      prev.includes(id) 
        ? prev.filter(l => l !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Lender Comparison
          </h1>
          <p className="text-blue-100 text-lg">
            Real approval rates from HMDA data • CFPB reputation scores • Florida market analysis
          </p>
        </div>
      </div>

      {/* Market Overview */}
      {market && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">Florida Mortgage Market ({market.year})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm">Total Applications</p>
                <p className="text-2xl font-bold text-white">{formatNumber(market.totalApplications)}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Total Originations</p>
                <p className="text-2xl font-bold text-emerald-400">{formatNumber(market.totalOriginations)}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Avg Loan Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(market.averageLoanAmount)}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Market Approval Rate</p>
                <p className="text-2xl font-bold text-blue-400">{market.approvalRate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="text-slate-400 text-sm mb-1 block">Loan Type</label>
            <select
              value={filters.loanType}
              onChange={(e) => setFilters({ ...filters, loanType: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 text-white"
            >
              {LOAN_TYPE_FILTERS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="text-slate-400 text-sm mb-1 block">Min Approval Rate: {filters.minApprovalRate}%</label>
            <input
              type="range"
              min="0"
              max="80"
              value={filters.minApprovalRate}
              onChange={(e) => setFilters({ ...filters, minApprovalRate: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-slate-400 text-sm mb-1 block">Max Closing Days: {filters.maxClosingDays}</label>
            <input
              type="range"
              min="14"
              max="60"
              value={filters.maxClosingDays}
              onChange={(e) => setFilters({ ...filters, maxClosingDays: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-slate-400 text-sm mb-1 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 text-white"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Compare Bar */}
      {selectedLenders.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 py-4 px-4 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">
                {selectedLenders.length} lender{selectedLenders.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                {selectedLenders.map(id => {
                  const lender = lenders.find(l => l.id === id);
                  return lender ? (
                    <span key={id} className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
                      {lender.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedLenders([])}
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
              >
                Clear
              </button>
              <button
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-all"
              >
                Compare Selected →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lender Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-400">Loading lender data...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLenders.map((lender, index) => (
              <motion.div
                key={lender.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-slate-800/50 backdrop-blur rounded-2xl border transition-all cursor-pointer
                  ${selectedLenders.includes(lender.id) 
                    ? 'border-blue-500 ring-2 ring-blue-500/30' 
                    : 'border-slate-700 hover:border-slate-500'}`}
                onClick={() => toggleLenderSelection(lender.id)}
              >
                {/* Card Header */}
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">{lender.name}</h3>
                      <p className="text-slate-400 text-sm capitalize">{lender.type.replace('_', ' ')}</p>
                    </div>
                    {lender.cfpbScore && (
                      <div className={`px-3 py-1 rounded-lg border ${getScoreBg(lender.cfpbScore)}`}>
                        <span className={`font-bold ${getScoreColor(lender.cfpbScore)}`}>
                          {lender.cfpbScore}
                        </span>
                        <span className="text-slate-400 text-xs ml-1">/ 100</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1">
                    {lender.specialties.map(spec => (
                      <span key={spec} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wide">Approval Rate</p>
                    <p className={`text-2xl font-bold ${
                      lender.nationalApprovalRate >= 70 ? 'text-emerald-400' :
                      lender.nationalApprovalRate >= 65 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {lender.nationalApprovalRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wide">Avg Closing</p>
                    <p className={`text-2xl font-bold ${
                      lender.avgClosingDays <= 25 ? 'text-emerald-400' :
                      lender.avgClosingDays <= 35 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {lender.avgClosingDays} days
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wide">Min Credit</p>
                    <p className="text-xl font-bold text-white">{lender.minCreditScore}</p>
                  </div>
                  {lender.floridaData && (
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wide">FL Market Share</p>
                      <p className="text-xl font-bold text-blue-400">{lender.floridaData.floridaMarketShare}%</p>
                    </div>
                  )}
                </div>

                {/* Florida-Specific Data */}
                {lender.floridaData && (
                  <div className="px-6 pb-6">
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Florida Performance</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">2023 Originations</span>
                        <span className="text-white font-medium">{formatNumber(lender.floridaData.floridaOriginations2023)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-300">FL Approval Rate</span>
                        <span className="text-emerald-400 font-medium">{lender.floridaData.floridaApprovalRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-300">Avg Loan Amount</span>
                        <span className="text-white font-medium">{formatCurrency(lender.floridaData.avgLoanAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selection Indicator */}
                <div className={`mx-6 mb-6 py-3 rounded-xl text-center font-medium transition-all
                  ${selectedLenders.includes(lender.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {selectedLenders.includes(lender.id) ? '✓ Selected for Comparison' : 'Click to Compare'}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredLenders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No lenders match your criteria.</p>
            <button
              onClick={() => setFilters({ loanType: '', minApprovalRate: 0, maxClosingDays: 60 })}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Data Source Footer */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 text-center">
          <p className="text-slate-400 text-sm">
            Data sourced from <span className="text-white">HMDA 2023</span> (Home Mortgage Disclosure Act) 
            and <span className="text-white">CFPB Consumer Complaints Database</span>. 
            Approval rates and market data reflect actual reported lending activity.
          </p>
        </div>
      </div>
    </div>
  );
}
