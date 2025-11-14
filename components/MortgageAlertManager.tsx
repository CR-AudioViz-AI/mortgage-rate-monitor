'use client';

// Javari AI Mortgage Rate Monitoring - Alert Management UI Component
// Phase 3B: Interactive UI for creating and managing rate alerts
// Created: 2025-11-14 22:34 UTC
// Roy Henderson, CEO @ CR AudioViz AI, LLC

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Alert {
  id: string;
  rate_type: string;
  threshold: number;
  condition: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export default function MortgageAlertManager() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    rate_type: '30y_fixed',
    threshold: '',
    condition: 'below',
    email: ''
  });

  // Load alerts on mount
  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please sign in to manage alerts');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/mortgage/alerts', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }

  async function createAlert(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please sign in to create alerts');
        return;
      }

      const response = await fetch('/api/mortgage/alerts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rate_type: formData.rate_type,
          threshold: parseFloat(formData.threshold),
          condition: formData.condition,
          email: formData.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create alert');
      }

      // Reset form and reload alerts
      setFormData({
        rate_type: '30y_fixed',
        threshold: '',
        condition: 'below',
        email: ''
      });
      setShowForm(false);
      await loadAlerts();
    } catch (err: any) {
      console.error('Error creating alert:', err);
      setError(err.message || 'Failed to create alert');
    }
  }

  async function deleteAlert(alertId: string) {
    try {
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please sign in to delete alerts');
        return;
      }

      const response = await fetch(`/api/mortgage/alerts?alert_id=${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete alert');
      }

      await loadAlerts();
    } catch (err) {
      console.error('Error deleting alert:', err);
      setError('Failed to delete alert');
    }
  }

  const rateTypeLabels: any = {
    '30y_fixed': '30-Year Fixed',
    '15y_fixed': '15-Year Fixed',
    '5_1_arm': '5/1 ARM'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rate Alerts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          disabled={alerts.length >= 10}
        >
          {showForm ? 'Cancel' : '+ New Alert'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {alerts.length >= 10 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          You've reached the maximum of 10 active alerts. Delete an alert to create a new one.
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Create New Alert</h3>
          <form onSubmit={createAlert} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate Type
                </label>
                <select
                  value={formData.rate_type}
                  onChange={(e) => setFormData({ ...formData, rate_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="30y_fixed">30-Year Fixed</option>
                  <option value="15y_fixed">15-Year Fixed</option>
                  <option value="5_1_arm">5/1 ARM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="below">Falls Below</option>
                  <option value="above">Rises Above</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threshold (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 6.50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              Create Alert
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No active alerts</p>
            <p className="text-sm">Create an alert to get notified when rates change</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {rateTypeLabels[alert.rate_type]}
                    </span>
                    <span className="text-sm text-gray-500">
                      {alert.condition === 'below' ? '↓' : '↑'} {alert.condition} {alert.threshold}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    📧 {alert.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    Created {new Date(alert.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
