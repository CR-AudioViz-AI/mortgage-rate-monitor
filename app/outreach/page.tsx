// RateUnlock - Outreach Dashboard
// Manage lender outreach campaigns
// December 24, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Lender {
  lei: string;
  name: string;
  state: string;
  totalLoans: number;
  approvalRate: number;
  avgLoanAmount: number;
  lenderType: string;
  website?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetCount: number;
  sent: number;
  opened: number;
  replied: number;
  converted: number;
}

const DEMO_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Q1 Credit Union Push', status: 'active', targetCount: 500, sent: 342, opened: 187, replied: 34, converted: 8 },
  { id: '2', name: 'Top 100 Banks', status: 'paused', targetCount: 100, sent: 100, opened: 45, replied: 12, converted: 3 },
  { id: '3', name: 'FL Mortgage Brokers', status: 'completed', targetCount: 250, sent: 250, opened: 98, replied: 28, converted: 11 },
];

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function OutreachDashboard() {
  const [activeTab, setActiveTab] = useState('lenders');
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);
  const [loading, setLoading] = useState(false);
  const [selectedLenders, setSelectedLenders] = useState<Set<string>>(new Set());
  
  // Filters
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [minLoans, setMinLoans] = useState(1000);
  
  // Email composer
  const [showComposer, setShowComposer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('bank-initial');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Fetch lenders
  const fetchLenders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stateFilter) params.append('state', stateFilter);
      if (typeFilter) params.append('type', typeFilter);
      params.append('minLoans', minLoans.toString());
      params.append('limit', '100');
      
      const response = await fetch(`/api/outreach?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setLenders(data.lenders);
      }
    } catch (error) {
      console.error('Failed to fetch lenders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLenders();
  }, [stateFilter, typeFilter, minLoans]);

  const toggleLender = (lei: string) => {
    const newSelected = new Set(selectedLenders);
    if (newSelected.has(lei)) {
      newSelected.delete(lei);
    } else {
      newSelected.add(lei);
    }
    setSelectedLenders(newSelected);
  };

  const selectAll = () => {
    if (selectedLenders.size === lenders.length) {
      setSelectedLenders(new Set());
    } else {
      setSelectedLenders(new Set(lenders.map(l => l.lei)));
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400';
      case 'paused': return 'bg-amber-500/20 text-amber-400';
      case 'completed': return 'bg-slate-500/20 text-slate-400';
      case 'draft': return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
                <defs>
                  <linearGradient id="outGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981"/>
                    <stop offset="50%" stopColor="#06b6d4"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="29" fill="none" stroke="url(#outGrad)" strokeWidth="2.5"/>
                <rect x="20" y="27" width="24" height="20" rx="4" fill="url(#outGrad)"/>
                <path d="M25 27 L25 21 Q25 13 32 13 Q39 13 39 21 L39 27" fill="none" stroke="url(#outGrad)" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Outreach Center</h1>
              <p className="text-slate-400 text-sm">8,234 lenders • 1.5M+ realtors</p>
            </div>
          </div>
          <button 
            onClick={() => setShowComposer(true)}
            className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            + New Campaign
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Lenders', value: '8,234', icon: '🏦' },
            { label: 'Emails Sent', value: '12,492', icon: '📧' },
            { label: 'Open Rate', value: '42%', icon: '👀' },
            { label: 'Reply Rate', value: '8.3%', icon: '💬' },
            { label: 'Conversions', value: '47', icon: '✅' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <span>{stat.icon}</span>
                <span className="text-slate-400 text-sm">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
          {[
            { id: 'lenders', name: 'Lender Database', icon: '🏦' },
            { id: 'campaigns', name: 'Campaigns', icon: '📧' },
            { id: 'templates', name: 'Templates', icon: '📝' },
            { id: 'associations', name: 'Associations', icon: '🤝' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        {/* Lenders Tab */}
        {activeTab === 'lenders' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">State</label>
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All States</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="bank">Banks</option>
                    <option value="credit-union">Credit Unions</option>
                    <option value="mortgage-company">Mortgage Companies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Min Loans/Year</label>
                  <input
                    type="number"
                    value={minLoans}
                    onChange={(e) => setMinLoans(parseInt(e.target.value) || 0)}
                    className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm w-32"
                  />
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">{selectedLenders.size} selected</span>
                  <button
                    onClick={() => setShowComposer(true)}
                    disabled={selectedLenders.size === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedLenders.size > 0
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Email Selected
                  </button>
                  <button className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium">
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Lender Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-400 text-sm border-b border-slate-700 bg-slate-800/50">
                    <th className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedLenders.size === lenders.length && lenders.length > 0}
                        onChange={selectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="p-4">Lender</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">State</th>
                    <th className="p-4">Loans/Year</th>
                    <th className="p-4">Approval Rate</th>
                    <th className="p-4">Avg Loan</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Loading lenders...
                      </td>
                    </tr>
                  ) : lenders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No lenders match your filters
                      </td>
                    </tr>
                  ) : (
                    lenders.map((lender) => (
                      <tr key={lender.lei} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedLenders.has(lender.lei)}
                            onChange={() => toggleLender(lender.lei)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{lender.name}</p>
                            {lender.website && (
                              <a href={`https://${lender.website}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 text-xs hover:underline">
                                {lender.website}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-400 capitalize">{lender.lenderType.replace('-', ' ')}</td>
                        <td className="p-4 text-white">{lender.state}</td>
                        <td className="p-4 text-white">{lender.totalLoans.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={lender.approvalRate >= 0.7 ? 'text-emerald-400' : 'text-amber-400'}>
                            {(lender.approvalRate * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="p-4 text-white">${(lender.avgLoanAmount / 1000).toFixed(0)}K</td>
                        <td className="p-4">
                          <button className="text-emerald-400 hover:text-emerald-300 text-sm">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{campaign.targetCount} targets</p>
                  </div>
                  <div className="flex gap-2">
                    {campaign.status === 'active' && (
                      <button className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded text-sm">
                        Pause
                      </button>
                    )}
                    {campaign.status === 'paused' && (
                      <button className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm">
                        Resume
                      </button>
                    )}
                    <button className="px-3 py-1 bg-slate-700 text-white rounded text-sm">
                      View Details
                    </button>
                  </div>
                </div>
                
                {/* Progress bars */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Sent', value: campaign.sent, total: campaign.targetCount, color: 'bg-blue-500' },
                    { label: 'Opened', value: campaign.opened, total: campaign.sent, color: 'bg-cyan-500' },
                    { label: 'Replied', value: campaign.replied, total: campaign.opened, color: 'bg-emerald-500' },
                    { label: 'Converted', value: campaign.converted, total: campaign.replied, color: 'bg-violet-500' },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">{metric.label}</span>
                        <span className="text-white">{metric.value}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${metric.color} rounded-full`}
                          style={{ width: `${metric.total > 0 ? (metric.value / metric.total) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-slate-500 text-xs mt-1">
                        {metric.total > 0 ? ((metric.value / metric.total) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Associations Tab */}
        {activeTab === 'associations' && (
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: 'Credit Union National Association', acronym: 'CUNA', members: '5,000+', reach: 'Credit Unions nationwide', icon: '🏛️' },
              { name: 'Mortgage Bankers Association', acronym: 'MBA', members: '2,000+', reach: 'Mortgage lenders & servicers', icon: '🏦' },
              { name: 'National Association of Mortgage Brokers', acronym: 'NAMB', members: '40,000+', reach: 'Independent brokers', icon: '📋' },
              { name: 'National Association of Realtors', acronym: 'NAR', members: '1.5M+', reach: 'Real estate agents', icon: '🏠' },
              { name: 'American Bankers Association', acronym: 'ABA', members: '4,000+', reach: 'Banks of all sizes', icon: '💰' },
              { name: 'National Credit Union Administration', acronym: 'NCUA', members: '5,100+', reach: 'Federally insured CUs', icon: '🛡️' },
            ].map((assoc) => (
              <div key={assoc.acronym} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{assoc.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{assoc.name}</h3>
                    <p className="text-slate-400 text-sm">{assoc.acronym}</p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-emerald-400 font-bold">{assoc.members}</span>
                        <span className="text-slate-400 ml-1">members</span>
                      </div>
                      <div className="text-slate-400">{assoc.reach}</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Compose Campaign</h2>
                <button onClick={() => setShowComposer(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Campaign Name</label>
                <input
                  type="text"
                  placeholder="Q1 Bank Outreach"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2"
                >
                  <option value="bank-initial">Bank - Initial Outreach</option>
                  <option value="credit-union-initial">Credit Union - Initial</option>
                  <option value="broker-initial">Broker - Lead Gen</option>
                  <option value="realtor-initial">Realtor - Free Tools</option>
                  <option value="follow-up-1">Follow Up #1</option>
                  <option value="follow-up-2">Follow Up #2 (Final)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Free Mortgage Calculators for {bank_name}"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">Body</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={10}
                  placeholder="Hi {first_name},

I noticed {bank_name} originated..."
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 font-mono text-sm"
                />
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-sm">
                  <strong>Variables:</strong> {'{'}first_name{'}'}, {'{'}bank_name{'}'}, {'{'}loan_count{'}'}, {'{'}approval_rate{'}'}, {'{'}sender_name{'}'}
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-700 flex justify-between">
              <button
                onClick={() => setShowComposer(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg"
              >
                Cancel
              </button>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-700 text-white rounded-lg">
                  Save Draft
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-medium">
                  Send to {selectedLenders.size || 'All'} Lenders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
