'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRates();
  }, []);
  
  const fetchRates = async () => {
    try {
      const res = await fetch('/api/mortgage/rates');
      if (res.ok) {
        const data = await res.json();
        setRates(data);
      }
    } catch (err) {
      console.error('Failed to fetch rates:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏠 Mortgage Rate Monitor
          </h1>
          <p className="text-gray-600">
            Real-time mortgage rates and alerts
          </p>
        </div>

        {/* Current Rates */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Rates</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading rates...</p>
            </div>
          ) : rates ? (
            <div className="grid md:grid-cols-3 gap-6">
              {rates.rates?.map((rate: any) => (
                <div key={rate.rate_type} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{rate.rate_type}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {rate.current_rate.toFixed(3)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Previous: {rate.previous_rate.toFixed(3)}%
                  </div>
                  <div className={`text-sm font-medium ${
                    rate.change_percent > 0 ? 'text-red-600' : 
                    rate.change_percent < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {rate.change_percent > 0 ? '↑' : rate.change_percent < 0 ? '↓' : '→'} 
                    {Math.abs(rate.change_percent).toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Unable to load rates. Please check API connection.</p>
          )}
        </div>

        {/* Email Alert Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Alerts</h2>
          <EmailAlertForm />
        </div>

        {/* API Info */}
        <div className="bg-gray-900 text-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
          <div className="space-y-2 font-mono text-sm">
            <div><span className="text-green-400">GET</span> /api/mortgage/rates</div>
            <div><span className="text-blue-400">POST</span> /api/mortgage/alerts</div>
            <div><span className="text-green-400">GET</span> /api/mortgage/rates/historical</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailAlertForm() {
  const [email, setEmail] = useState('');
  const [rateType, setRateType] = useState('30Y Fixed');
  const [threshold, setThreshold] = useState('');
  const [direction, setDirection] = useState('below');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const res = await fetch('/api/mortgage/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          rate_type: rateType,
          threshold_rate: parseFloat(threshold),
          direction
        })
      });
      
      if (res.ok) {
        setMessage('✅ Alert created successfully!');
        setEmail('');
        setThreshold('');
      } else {
        setMessage('❌ Failed to create alert');
      }
    } catch (err) {
      setMessage('❌ Error: ' + String(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rate Type</label>
        <select
          value={rateType}
          onChange={(e) => setRateType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option>30Y Fixed</option>
          <option>15Y Fixed</option>
          <option>5/1 ARM</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Target Rate (%)</label>
        <input
          type="number"
          required
          step="0.001"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="6.500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alert When</label>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="below">Rate goes below target</option>
          <option value="above">Rate goes above target</option>
        </select>
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Create Alert
      </button>
      
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </form>
  );
}
