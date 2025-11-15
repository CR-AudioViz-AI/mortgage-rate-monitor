// Email Alert Form Component
// Allows users to create custom rate alerts

'use client';

import { useState } from 'react';

export default function EmailAlertForm() {
  const [formData, setFormData] = useState({
    email: '',
    rate_type: '30Y Fixed',
    threshold: '',
    direction: 'below'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/mortgage/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          rate_type: formData.rate_type,
          threshold_rate: parseFloat(formData.threshold),
          direction: formData.direction
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create alert');
      }

      setSuccess(true);
      setFormData({
        email: '',
        rate_type: '30Y Fixed',
        threshold: '',
        direction: 'below'
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error creating alert:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📧 Set Up Email Alerts</h2>
        <p className="text-gray-600">
          Get notified instantly when mortgage rates reach your target level
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✅</div>
            <div>
              <h3 className="font-semibold text-green-900">Alert Created Successfully!</h3>
              <p className="text-sm text-green-700 mt-1">
                We'll email you when the rate condition is met.
              </p>
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
              <h3 className="font-semibold text-red-900">Error Creating Alert</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Rate Type */}
          <div>
            <label htmlFor="rate_type" className="block text-sm font-medium text-gray-900 mb-2">
              Rate Type *
            </label>
            <select
              id="rate_type"
              required
              value={formData.rate_type}
              onChange={(e) => setFormData({ ...formData, rate_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="30Y Fixed">30-Year Fixed</option>
              <option value="15Y Fixed">15-Year Fixed</option>
              <option value="5/1 ARM">5/1 ARM</option>
            </select>
          </div>

          {/* Threshold Rate */}
          <div>
            <label htmlFor="threshold" className="block text-sm font-medium text-gray-900 mb-2">
              Target Rate (%) *
            </label>
            <input
              type="number"
              id="threshold"
              required
              step="0.001"
              min="0"
              max="20"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
              placeholder="6.500"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the rate at which you want to be notified
            </p>
          </div>

          {/* Direction */}
          <div>
            <label htmlFor="direction" className="block text-sm font-medium text-gray-900 mb-2">
              Alert When Rate Goes *
            </label>
            <select
              id="direction"
              required
              value={formData.direction}
              onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="below">Below target rate (📉 Rate drops)</option>
              <option value="above">Above target rate (📈 Rate rises)</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Alert...' : '📧 Create Email Alert'}
          </button>
        </form>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-xl mb-2">⚡</div>
          <h3 className="font-semibold text-gray-900 mb-1">Instant Notifications</h3>
          <p className="text-sm text-gray-700">
            Receive emails within minutes when your rate condition is met
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-xl mb-2">🔐</div>
          <h3 className="font-semibold text-gray-900 mb-1">Privacy Protected</h3>
          <p className="text-sm text-gray-700">
            Your email is never shared and you can unsubscribe anytime
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">How often are rates checked?</h4>
            <p className="text-sm text-gray-600">
              Rates are monitored continuously and alerts are triggered in real-time when your threshold is met.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Can I create multiple alerts?</h4>
            <p className="text-sm text-gray-600">
              Yes! You can create as many alerts as you need for different rate types and thresholds.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">How do I manage or delete alerts?</h4>
            <p className="text-sm text-gray-600">
              Each email notification includes an unsubscribe link to manage your alert preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
