'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState('overview');
  const [savedSearches, setSavedSearches] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    // Fetch saved searches and alerts
    // For now, using dummy data
    setSavedSearches([
      { id: 1, name: 'FHA Loans in Florida', filters: { loan_type: 'fha', state: 'FL' }, results: 45 },
      { id: 2, name: '30-Year Fixed Best Rates', filters: { loan_type: '30-year-fixed' }, results: 120 },
    ]);
    
    setAlerts([
      { id: 1, loan_type: '30-year-fixed', condition: 'below', target_rate: 6.5, active: true },
      { id: 2, loan_type: '15-year-fixed', condition: 'below', target_rate: 5.8, active: true },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your saved searches and rate alerts</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="flex gap-2 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'searches', label: 'Saved Searches' },
              { id: 'alerts', label: 'Rate Alerts' },
              { id: 'favorites', label: 'Favorite Lenders' },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`px-6 py-3 font-semibold transition ${
                  activeView === view.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview */}
        {activeView === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{savedSearches.length}</div>
                  <div className="text-sm text-gray-600">Saved Searches</div>
                </div>
              </div>
              <button
                onClick={() => setActiveView('searches')}
                className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition"
              >
                View All
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔔</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{alerts.length}</div>
                  <div className="text-sm text-gray-600">Active Alerts</div>
                </div>
              </div>
              <button
                onClick={() => setActiveView('alerts')}
                className="w-full bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition"
              >
                Manage Alerts
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-600">Favorite Lenders</div>
                </div>
              </div>
              <button
                onClick={() => setActiveView('favorites')}
                className="w-full bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition"
              >
                View Favorites
              </button>
            </div>
          </div>
        )}

        {/* Saved Searches */}
        {activeView === 'searches' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Saved Searches</h2>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                + New Search
              </button>
            </div>

            {savedSearches.map((search: any) => (
              <div key={search.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{search.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(search.filters).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {key}: {value as string}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600">{search.results} results found</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                      Run Search
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rate Alerts */}
        {activeView === 'alerts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Rate Alerts</h2>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition">
                + Create Alert
              </button>
            </div>

            {alerts.map((alert: any) => (
              <div key={alert.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {alert.loan_type.replace('-', ' ').toUpperCase()}
                    </h3>
                    <p className="text-gray-700 mb-2">
                      Alert me when rate goes <strong>{alert.condition}</strong>{' '}
                      <strong>{alert.target_rate}%</strong>
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          alert.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {alert.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition">
                      Edit
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Favorites */}
        {activeView === 'favorites' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Favorite Lenders</h2>
            <p className="text-gray-600">Your favorite lenders will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
