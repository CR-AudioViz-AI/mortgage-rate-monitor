'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SavedSearch {
  id: string;
  name: string;
  loan_type: string;
  loan_amount: number;
  down_payment: number;
  credit_score: number;
  state: string;
  created_at: string;
  search_count: number;
}

interface RateAlert {
  id: string;
  loan_type: string;
  term_years: number;
  target_rate: number;
  current_rate: number;
  status: string;
  created_at: string;
  last_checked: string;
}

interface UserPreferences {
  email_alerts: boolean;
  sms_alerts: boolean;
  alert_frequency: string;
  preferred_lenders: string[];
  max_commute_distance: number;
}

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<'searches' | 'alerts' | 'preferences'>('searches');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [rateAlerts, setRateAlerts] = useState<RateAlert[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_alerts: true,
    sms_alerts: false,
    alert_frequency: 'daily',
    preferred_lenders: [],
    max_commute_distance: 30,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch saved searches
      const searchesResponse = await fetch('/api/user/searches');
      if (searchesResponse.ok) {
        const searchesData = await searchesResponse.json();
        setSavedSearches(searchesData.searches || []);
      }

      // Fetch rate alerts
      const alertsResponse = await fetch('/api/alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setRateAlerts(alertsData.alerts || []);
      }

      // Fetch preferences
      const prefsResponse = await fetch('/api/user/preferences');
      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        setPreferences(prefsData.preferences || preferences);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSearch = async (searchId: string) => {
    try {
      const response = await fetch(`/api/user/searches/${searchId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSavedSearches((prev) => prev.filter((s) => s.id !== searchId));
      }
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setRateAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const updatePreferences = async () => {
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      alert('Preferences updated successfully!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update preferences');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your searches, alerts, and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('searches')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'searches'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Saved Searches ({savedSearches.length})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'alerts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Rate Alerts ({rateAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'preferences'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Saved Searches Tab */}
        {activeTab === 'searches' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Saved Searches</h2>
              <Link
                href="/compare"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + New Search
              </Link>
            </div>

            {savedSearches.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedSearches.map((search) => (
                  <div
                    key={search.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-gray-900">{search.name}</h3>
                      <button
                        onClick={() => deleteSearch(search.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Loan Type:</span>
                        <span className="font-medium text-gray-900">
                          {search.loan_type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(search.loan_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Down Payment:</span>
                        <span className="font-medium text-gray-900">
                          {search.down_payment}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Credit Score:</span>
                        <span className="font-medium text-gray-900">
                          {search.credit_score}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-medium text-gray-900">{search.state}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        Used {search.search_count} times
                      </span>
                      <Link
                        href={`/compare?search_id=${search.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Results →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No saved searches yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Save your favorite searches to quickly compare rates
                </p>
                <Link
                  href="/compare"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Searching
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Rate Alerts Tab */}
        {activeTab === 'alerts' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Rate Alerts</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                + New Alert
              </button>
            </div>

            {rateAlerts.length > 0 ? (
              <div className="space-y-4">
                {rateAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {alert.loan_type} - {alert.term_years} Year
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {alert.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-gray-600">Target Rate</div>
                            <div className="text-lg font-bold text-blue-600">
                              {alert.target_rate.toFixed(3)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Current Rate</div>
                            <div className="text-lg font-bold text-gray-900">
                              {alert.current_rate.toFixed(3)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Difference</div>
                            <div
                              className={`text-lg font-bold ${
                                alert.current_rate <= alert.target_rate
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {alert.current_rate <= alert.target_rate ? '✓ Met' : '⚠ Not Yet'}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Last checked: {new Date(alert.last_checked).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="ml-4 text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-5xl mb-4">🔔</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No rate alerts set
                </h3>
                <p className="text-gray-600 mb-6">
                  Get notified when rates drop to your target level
                </p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Alert
                </button>
              </div>
            )}
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences</h2>

            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.email_alerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, email_alerts: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">Email alerts</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.sms_alerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, sms_alerts: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">SMS alerts</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Frequency
                </label>
                <select
                  value={preferences.alert_frequency}
                  onChange={(e) =>
                    setPreferences({ ...preferences, alert_frequency: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="realtime">Real-time</option>
                  <option value="daily">Daily digest</option>
                  <option value="weekly">Weekly summary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Commute Distance (miles)
                </label>
                <input
                  type="number"
                  value={preferences.max_commute_distance}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      max_commute_distance: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={updatePreferences}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
