// RateUnlock - Partner Dashboard
// Analytics, leads, and white-label management
// December 24, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PartnerStats {
  views: number;
  interactions: number;
  leads: number;
  conversions: number;
  revenue: number;
}

interface Lead {
  id: string;
  email: string;
  calculator: string;
  homePrice: number;
  loanAmount: number;
  monthlyPayment: number;
  createdAt: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
}

// Demo data - in production this comes from API
const DEMO_STATS: PartnerStats = {
  views: 12483,
  interactions: 8921,
  leads: 342,
  conversions: 47,
  revenue: 4700,
};

const DEMO_LEADS: Lead[] = [
  { id: '1', email: 'john@example.com', calculator: 'true-cost', homePrice: 450000, loanAmount: 360000, monthlyPayment: 2847, createdAt: '2025-12-24T10:30:00Z', status: 'new' },
  { id: '2', email: 'sarah@example.com', calculator: 'affordability', homePrice: 350000, loanAmount: 280000, monthlyPayment: 2198, createdAt: '2025-12-24T09:15:00Z', status: 'contacted' },
  { id: '3', email: 'mike@example.com', calculator: 'refinance', homePrice: 520000, loanAmount: 416000, monthlyPayment: 3294, createdAt: '2025-12-23T16:45:00Z', status: 'qualified' },
  { id: '4', email: 'lisa@example.com', calculator: 'true-cost', homePrice: 380000, loanAmount: 304000, monthlyPayment: 2412, createdAt: '2025-12-23T14:20:00Z', status: 'converted' },
  { id: '5', email: 'david@example.com', calculator: 'arm-vs-fixed', homePrice: 600000, loanAmount: 480000, monthlyPayment: 3782, createdAt: '2025-12-23T11:00:00Z', status: 'new' },
];

export default function PartnerDashboard() {
  const [stats, setStats] = useState<PartnerStats>(DEMO_STATS);
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');

  const conversionRate = ((stats.conversions / stats.leads) * 100).toFixed(1);
  const interactionRate = ((stats.interactions / stats.views) * 100).toFixed(1);

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400';
      case 'contacted': return 'bg-amber-500/20 text-amber-400';
      case 'qualified': return 'bg-emerald-500/20 text-emerald-400';
      case 'converted': return 'bg-violet-500/20 text-violet-400';
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
                  <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981"/>
                    <stop offset="50%" stopColor="#06b6d4"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="29" fill="none" stroke="url(#dashGrad)" strokeWidth="2.5"/>
                <rect x="20" y="27" width="24" height="20" rx="4" fill="url(#dashGrad)"/>
                <path d="M25 27 L25 21 Q25 13 32 13 Q39 13 39 21 L39 27" fill="none" stroke="url(#dashGrad)" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Partner Dashboard</h1>
              <p className="text-slate-400 text-sm">Acme Bank • Pro Plan</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/widgets" className="text-slate-400 hover:text-white text-sm">
              Get Embed Code
            </Link>
            <Link href="/partners/settings" className="text-slate-400 hover:text-white text-sm">
              Settings
            </Link>
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-700 pb-4">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'leads', name: 'Leads', icon: '👥' },
            { id: 'widgets', name: 'Widgets', icon: '🧩' },
            { id: 'integrations', name: 'Integrations', icon: '🔗' },
            { id: 'billing', name: 'Billing', icon: '💳' },
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Date Range Selector */}
            <div className="flex justify-end mb-6">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="ytd">Year to date</option>
              </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-400 text-sm">Widget Views</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.views.toLocaleString()}</p>
                <p className="text-emerald-400 text-sm mt-1">↑ 12.3%</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-400 text-sm">Interactions</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.interactions.toLocaleString()}</p>
                <p className="text-slate-400 text-sm mt-1">{interactionRate}% rate</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-400 text-sm">Leads Captured</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.leads}</p>
                <p className="text-emerald-400 text-sm mt-1">↑ 8.7%</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-400 text-sm">Conversions</p>
                <p className="text-3xl font-bold text-violet-400 mt-1">{stats.conversions}</p>
                <p className="text-slate-400 text-sm mt-1">{conversionRate}% rate</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-400 text-sm">Commission Earned</p>
                <p className="text-3xl font-bold text-cyan-400 mt-1">${stats.revenue.toLocaleString()}</p>
                <p className="text-slate-400 text-sm mt-1">${100}/lead</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="font-semibold text-white mb-4">Traffic by Calculator</h3>
                <div className="space-y-3">
                  {[
                    { name: 'True Cost', value: 45, color: 'bg-emerald-500' },
                    { name: 'Affordability', value: 28, color: 'bg-cyan-500' },
                    { name: 'Refinance', value: 15, color: 'bg-violet-500' },
                    { name: 'Other', value: 12, color: 'bg-slate-500' },
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">{item.name}</span>
                        <span className="text-white">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="font-semibold text-white mb-4">Lead Funnel</h3>
                <div className="space-y-4">
                  {[
                    { stage: 'Views', count: 12483, width: '100%' },
                    { stage: 'Interactions', count: 8921, width: '71%' },
                    { stage: 'Leads', count: 342, width: '27%' },
                    { stage: 'Qualified', count: 89, width: '7%' },
                    { stage: 'Converted', count: 47, width: '4%' },
                  ].map((item, idx) => (
                    <div key={item.stage} className="flex items-center gap-4">
                      <span className="text-slate-400 text-sm w-24">{item.stage}</span>
                      <div className="flex-1 h-8 bg-slate-700 rounded overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-end pr-2"
                          style={{ width: item.width }}
                        >
                          <span className="text-white text-sm font-medium">{item.count.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Leads */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">Recent Leads</h3>
                <button 
                  onClick={() => setActiveTab('leads')}
                  className="text-emerald-400 text-sm hover:underline"
                >
                  View all →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Calculator</th>
                      <th className="pb-3">Loan Amount</th>
                      <th className="pb-3">Monthly</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.slice(0, 5).map((lead) => (
                      <tr key={lead.id} className="border-b border-slate-700/50">
                        <td className="py-3 text-white">{lead.email}</td>
                        <td className="py-3 text-slate-400 capitalize">{lead.calculator.replace('-', ' ')}</td>
                        <td className="py-3 text-white">${lead.loanAmount.toLocaleString()}</td>
                        <td className="py-3 text-white">${lead.monthlyPayment.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 text-sm">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">All Leads</h2>
              <div className="flex gap-2">
                <select className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm">
                  <option value="">All Calculators</option>
                  <option value="true-cost">True Cost</option>
                  <option value="affordability">Affordability</option>
                  <option value="refinance">Refinance</option>
                </select>
                <select className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm">
                  <option value="">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                </select>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Export CSV
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                    <th className="pb-3 pl-4">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Calculator</th>
                    <th className="pb-3">Home Price</th>
                    <th className="pb-3">Loan Amount</th>
                    <th className="pb-3">Monthly</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 pl-4">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="py-3 text-white font-medium">{lead.email}</td>
                      <td className="py-3 text-slate-400 capitalize">{lead.calculator.replace('-', ' ')}</td>
                      <td className="py-3 text-white">${lead.homePrice.toLocaleString()}</td>
                      <td className="py-3 text-white">${lead.loanAmount.toLocaleString()}</td>
                      <td className="py-3 text-emerald-400 font-medium">${lead.monthlyPayment.toLocaleString()}</td>
                      <td className="py-3">
                        <select 
                          defaultValue={lead.status}
                          className={`px-2 py-1 rounded-full text-xs border-0 ${getStatusColor(lead.status)}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                        </select>
                      </td>
                      <td className="py-3 text-slate-400 text-sm">
                        {new Date(lead.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <button className="text-emerald-400 hover:text-emerald-300 text-sm">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center mt-4 text-sm text-slate-400">
              <span>Showing 1-5 of {leads.length} leads</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-slate-700 rounded">Previous</button>
                <button className="px-3 py-1 bg-emerald-600 text-white rounded">1</button>
                <button className="px-3 py-1 bg-slate-700 rounded">2</button>
                <button className="px-3 py-1 bg-slate-700 rounded">3</button>
                <button className="px-3 py-1 bg-slate-700 rounded">Next</button>
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">CRM Integration</h2>
              <p className="text-slate-400 mb-6">Connect your CRM to automatically sync leads</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { name: 'Salesforce', icon: '☁️', connected: false },
                  { name: 'HubSpot', icon: '🟠', connected: true },
                  { name: 'Pipedrive', icon: '🟢', connected: false },
                  { name: 'Zoho CRM', icon: '🔵', connected: false },
                  { name: 'Monday.com', icon: '🟣', connected: false },
                  { name: 'Custom Webhook', icon: '🔗', connected: true },
                ].map((crm) => (
                  <div key={crm.name} className={`p-4 rounded-xl border ${
                    crm.connected ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-700/50 border-slate-600'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{crm.icon}</span>
                        <span className="text-white font-medium">{crm.name}</span>
                      </div>
                      {crm.connected ? (
                        <span className="text-emerald-400 text-sm">Connected ✓</span>
                      ) : (
                        <button className="text-slate-400 text-sm hover:text-white">Connect</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Webhook Configuration</h2>
              <p className="text-slate-400 mb-4">Receive real-time lead notifications</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://your-crm.com/webhook/rateunlock"
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                  />
                </div>
                <div className="flex gap-4">
                  <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Save Webhook
                  </button>
                  <button className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Send Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
