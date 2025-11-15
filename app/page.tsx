'use client';

import { useState } from 'react';
import CurrentRates from '@/components/CurrentRates';
import EmailAlertForm from '@/components/EmailAlertForm';
import HistoricalChart from '@/components/HistoricalChart';
import APIKeyGenerator from '@/components/APIKeyGenerator';

type TabId = 'rates' | 'alerts' | 'historical' | 'api';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'rates', label: 'Current Rates', icon: '📊' },
  { id: 'alerts', label: 'Email Alerts', icon: '🔔' },
  { id: 'historical', label: 'Historical Data', icon: '📈' },
  { id: 'api', label: 'API Access', icon: '🔑' }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('rates');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🏠 Mortgage Rate Monitor
              </h1>
              <p className="text-gray-600">
                Real-time mortgage rates, alerts, and analytics
              </p>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-sm text-gray-500">Powered by</div>
              <div className="text-lg font-bold text-blue-600">CR AudioViz AI</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'rates' && (
          <div className="animate-fadeIn">
            <CurrentRates />
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🔔 Set Up Email Alerts
                </h2>
                <p className="text-gray-600">
                  Get notified when mortgage rates hit your target. We'll monitor rates 24/7 and email you instantly when conditions match.
                </p>
              </div>
              <EmailAlertForm />
            </div>

            {/* Alert Info */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">How Email Alerts Work</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span><strong>Instant notifications:</strong> Receive emails within minutes of rate changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span><strong>24/7 monitoring:</strong> We check rates every 6 hours automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span><strong>Multiple alerts:</strong> Create as many alerts as you need for different rate types</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span><strong>No spam:</strong> You'll only receive emails when your conditions are met</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'historical' && (
          <div className="animate-fadeIn">
            <HistoricalChart />
          </div>
        )}

        {activeTab === 'api' && (
          <div className="animate-fadeIn">
            <div className="space-y-6">
              {/* API Key Generator */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🔑 API Access
                </h2>
                <APIKeyGenerator />
              </div>

              {/* API Documentation */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Available Endpoints</h3>
                
                <div className="space-y-6">
                  {/* GET /rates */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-md font-mono text-sm font-semibold">GET</span>
                      <code className="text-lg font-mono">/api/mortgage/rates</code>
                    </div>
                    <p className="text-gray-600 mb-2">Get current mortgage rates for all types</p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "rates": [
    {
      "rate_type": "30Y Fixed",
      "current_rate": 6.875,
      "previous_rate": 6.750,
      "change_percent": 1.85,
      "last_updated": "2025-11-15T20:00:00Z"
    }
  ],
  "timestamp": "2025-11-15T20:00:00Z"
}`}
                    </pre>
                  </div>

                  {/* POST /alerts */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md font-mono text-sm font-semibold">POST</span>
                      <code className="text-lg font-mono">/api/mortgage/alerts</code>
                    </div>
                    <p className="text-gray-600 mb-2">Create a new email alert for rate changes</p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Request
{
  "email": "you@example.com",
  "rate_type": "30Y Fixed",
  "threshold_rate": 6.5,
  "direction": "below"
}

// Response
{
  "success": true,
  "alert_id": "alert_123abc"
}`}
                    </pre>
                  </div>

                  {/* GET /historical */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-md font-mono text-sm font-semibold">GET</span>
                      <code className="text-lg font-mono">/api/mortgage/rates/historical?days=30</code>
                    </div>
                    <p className="text-gray-600 mb-2">Get historical rate data with optional time range</p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "data": [
    {
      "date": "2025-11-15",
      "rate_30y": 6.875,
      "rate_15y": 6.250,
      "rate_5_1_arm": 6.125
    }
  ],
  "statistics": {
    "30Y Fixed": {
      "average": 6.850,
      "min": 6.500,
      "max": 7.125
    }
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Rate Limits */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Rate Limits & Usage</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">⚡</span>
                    <span><strong>Free tier:</strong> 100 requests per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">⚡</span>
                    <span><strong>Pro tier:</strong> 10,000 requests per day ($29/month)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">⚡</span>
                    <span><strong>Headers:</strong> Include your API key in <code className="bg-gray-200 px-1 rounded">X-API-Key</code> header</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">
              Built with ❤️ by <strong>CR AudioViz AI, LLC</strong>
            </p>
            <p className="text-gray-500">
              Real-time mortgage data • Email alerts • Historical analytics • Developer API
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
