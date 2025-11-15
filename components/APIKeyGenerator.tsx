// API Key Generator Component
// Allows users to generate API keys for programmatic access

'use client';

import { useState } from 'react';

interface ApiKey {
  key: string;
  created_at: string;
  rate_limit: number;
}

export default function APIKeyGenerator() {
  const [formData, setFormData] = useState({
    name: '',
    rateLimit: '100'
  });

  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setApiKey(null);

    try {
      const response = await fetch('/api/mortgage/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          rate_limit: parseInt(formData.rateLimit)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate API key');
      }

      setApiKey(data);
      setFormData({ name: '', rateLimit: '100' });
    } catch (err) {
      console.error('Error generating API key:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🔑 API Access</h2>
        <p className="text-gray-600">
          Generate an API key for programmatic access to mortgage rate data
        </p>
      </div>

      {/* Generated API Key Display */}
      {apiKey && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-3xl">✅</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-1">API Key Generated!</h3>
              <p className="text-sm text-green-700">
                Copy this key now - it won't be shown again
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <code className="flex-1 text-sm font-mono text-gray-900 break-all">
                {apiKey.key}
              </code>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-700 font-medium">Created:</p>
              <p className="text-gray-900">{new Date(apiKey.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-green-700 font-medium">Rate Limit:</p>
              <p className="text-gray-900">{apiKey.rate_limit} requests/hour</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-900">Error Generating Key</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Generate New API Key</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
              Key Name/Description *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Production App"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              A descriptive name to help you identify this key later
            </p>
          </div>

          <div>
            <label htmlFor="rateLimit" className="block text-sm font-medium text-gray-900 mb-2">
              Rate Limit (requests/hour) *
            </label>
            <select
              id="rateLimit"
              required
              value={formData.rateLimit}
              onChange={(e) => setFormData({ ...formData, rateLimit: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10">10/hour - Free Tier</option>
              <option value="100">100/hour - Basic</option>
              <option value="1000">1,000/hour - Pro</option>
              <option value="10000">10,000/hour - Enterprise</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Higher limits available for production use
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : '🔑 Generate API Key'}
          </button>
        </form>
      </div>

      {/* API Documentation */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📖 Quick Start Guide</h3>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">1. Get Current Rates</h4>
            <div className="bg-gray-900 rounded-lg p-4">
              <code className="text-green-400 text-sm">
                curl https://mortgage-rate-monitor.vercel.app/api/mortgage/rates \<br/>
                &nbsp;&nbsp;-H "X-API-Key: your_api_key_here"
              </code>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">2. Get Historical Data</h4>
            <div className="bg-gray-900 rounded-lg p-4">
              <code className="text-green-400 text-sm">
                curl "https://mortgage-rate-monitor.vercel.app/api/mortgage/rates/historical?days=30" \<br/>
                &nbsp;&nbsp;-H "X-API-Key: your_api_key_here"
              </code>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">3. Create Rate Alert</h4>
            <div className="bg-gray-900 rounded-lg p-4">
              <code className="text-green-400 text-sm">
                curl -X POST https://mortgage-rate-monitor.vercel.app/api/mortgage/alerts \<br/>
                &nbsp;&nbsp;-H "X-API-Key: your_api_key_here" \<br/>
                &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                &nbsp;&nbsp;-d '{'{'}
                  "email": "you@example.com",
                  "rate_type": "30Y Fixed",
                  "threshold_rate": 6.5,
                  "direction": "below"
                {'}'}'
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-xl mb-2">🚀</div>
          <h3 className="font-semibold text-gray-900 mb-1">RESTful API</h3>
          <p className="text-sm text-gray-700">
            Simple HTTP requests with JSON responses
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-xl mb-2">⚡</div>
          <h3 className="font-semibold text-gray-900 mb-1">Real-Time Data</h3>
          <p className="text-sm text-gray-700">
            Live mortgage rates updated continuously
          </p>
        </div>

        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <div className="text-xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-900 mb-1">Rich Analytics</h3>
          <p className="text-sm text-gray-700">
            Historical trends, statistics, and insights
          </p>
        </div>
      </div>

      {/* OpenAPI Spec */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg p-6">
        <h3 className="text-lg font-bold mb-2">Complete API Documentation</h3>
        <p className="text-gray-300 text-sm mb-4">
          Full OpenAPI 3.0 specification available with all endpoints, parameters, and response schemas
        </p>
        <a
          href="/docs/openapi.json"
          target="_blank"
          className="inline-block px-6 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
        >
          📄 View OpenAPI Spec
        </a>
      </div>
    </div>
  );
}
