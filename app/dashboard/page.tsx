// CR AudioViz AI - Mortgage Rate Monitor
// Dashboard - Uses Central Auth from craudiovizai.com
// December 16, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCentralAuth, useRequireAuth } from '@/contexts/CentralAuthContext';
import { 
  User, Bell, MapPin, TrendingDown, TrendingUp, Crown, 
  CheckCircle, AlertCircle, Plus, Trash2, ExternalLink,
  Home, Calculator, Users, BarChart3, Coins, CreditCard
} from 'lucide-react';

const CENTRAL_URL = 'https://craudiovizai.com';

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'Washington D.C.' },
];

interface RateAlert {
  id: string;
  rate_type: string;
  target_rate: number;
  direction: 'below' | 'above';
  active: boolean;
  verified: boolean;
  created_at: string;
}

export default function DashboardPage() {
  // Require authentication - redirects to central login if not authenticated
  const { isAuthenticated, loading: authLoading } = useRequireAuth('/dashboard');
  
  const { user, profile, credits, isPremium, updateMortgagePrefs } = useCentralAuth();
  
  const [alerts, setAlerts] = useState<RateAlert[]>([]);
  const [currentRates, setCurrentRates] = useState<any[]>([]);
  const [editingState, setEditingState] = useState(false);
  const [selectedState, setSelectedState] = useState(profile?.mortgage_state || '');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchData();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    setSelectedState(profile?.mortgage_state || '');
  }, [profile]);

  async function fetchData() {
    setLoadingData(true);
    try {
      const [alertsRes, ratesRes] = await Promise.all([
        fetch(`/api/alerts?email=${encodeURIComponent(user?.email || '')}`),
        fetch('/api/mortgage/rates'),
      ]);
      
      const alertsData = await alertsRes.json();
      const ratesData = await ratesRes.json();
      
      if (alertsData.success) setAlerts(alertsData.alerts || []);
      if (ratesData.success) setCurrentRates(ratesData.rates || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoadingData(false);
    }
  }

  async function handleStateUpdate() {
    if (selectedState) {
      await updateMortgagePrefs({ state: selectedState });
      localStorage.setItem('mortgage_user_state', selectedState);
      setEditingState(false);
    }
  }

  async function deleteAlert(alertId: string) {
    try {
      await fetch(`/api/alerts?id=${alertId}`, { method: 'DELETE' });
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  }

  const getStateName = (code: string) => {
    return US_STATES.find(s => s.code === code)?.name || code;
  };

  // Alert limits based on subscription
  const alertLimits = {
    free: 1,
    starter: 3,
    pro: 10,
    premium: 25,
  };
  const maxAlerts = alertLimits[profile?.subscription_tier || 'free'];

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Welcome, {profile?.full_name || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-blue-100">
                Your mortgage tracking dashboard
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              {/* Credits */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur rounded-lg">
                <Coins className="w-4 h-4 text-amber-300" />
                <span className="font-bold">{credits?.balance?.toLocaleString() || 0}</span>
                <span className="text-blue-200 text-sm">credits</span>
              </div>
              
              {/* Subscription */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPremium ? 'bg-amber-100 text-amber-700' : 'bg-white/20 text-white'
              }`}>
                {isPremium && <Crown className="w-3 h-3 inline mr-1" />}
                {(profile?.subscription_tier || 'free').charAt(0).toUpperCase() + (profile?.subscription_tier || 'free').slice(1)}
              </span>
              
              {!isPremium && (
                <a
                  href={`${CENTRAL_URL}/pricing`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Settings */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Your State</label>
                  {editingState ? (
                    <div className="flex gap-2 mt-1">
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select state</option>
                        {US_STATES.map(state => (
                          <option key={state.code} value={state.code}>{state.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleStateUpdate}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingState(false)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {profile?.mortgage_state ? getStateName(profile.mortgage_state) : 'Not set'}
                      </p>
                      <button
                        onClick={() => setEditingState(true)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Settings Link */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <a
                  href={`${CENTRAL_URL}/settings`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <CreditCard className="w-4 h-4" />
                  Manage Account & Billing
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link href="/" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                  <Home className="w-5 h-5 text-gray-400" />
                  <span>Current Rates</span>
                </Link>
                <Link href="/compare" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span>Compare Lenders</span>
                </Link>
                <Link href="/calculators" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                  <Calculator className="w-5 h-5 text-gray-400" />
                  <span>Calculators</span>
                </Link>
                <Link href="/historical" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                  <span>Historical Data</span>
                </Link>
              </div>
            </div>

            {/* Cross-sell other CR apps */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">More from CR AudioViz AI</h2>
              <p className="text-sm text-gray-600 mb-4">
                Your account works across all our apps. Try these:
              </p>
              <div className="space-y-2">
                <a
                  href={`${CENTRAL_URL}/tools`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition"
                >
                  <span className="font-medium">60+ AI Creative Tools</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
                <a
                  href="https://crav-cardverse.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition"
                >
                  <span className="font-medium">CravCards Trading</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Middle & Right Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Rates Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Today's Key Rates</h2>
                <Link href="/" className="text-blue-600 text-sm hover:underline">View All</Link>
              </div>
              {loadingData ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="bg-gray-100 rounded-lg p-3 animate-pulse h-20" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentRates.slice(0, 4).map(rate => (
                    <div key={rate.rateType} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500 mb-1">{rate.rateType}</div>
                      <div className="text-2xl font-bold text-gray-900">{rate.rate?.toFixed(2)}%</div>
                      <div className={`text-sm flex items-center gap-1 ${
                        rate.change < 0 ? 'text-green-600' : rate.change > 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {rate.change < 0 ? <TrendingDown className="w-3 h-3" /> : rate.change > 0 ? <TrendingUp className="w-3 h-3" /> : null}
                        {rate.change?.toFixed(3)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rate Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Rate Alerts
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {alerts.length} / {maxAlerts} alerts
                  </span>
                  {alerts.length < maxAlerts && (
                    <Link
                      href="/alerts"
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Alert
                    </Link>
                  )}
                </div>
              </div>

              {loadingData ? (
                <div className="space-y-3">
                  {[1,2].map(i => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse h-16" />
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No rate alerts set</p>
                  <Link href="/alerts" className="text-blue-600 hover:underline">
                    Create your first alert
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => {
                    const currentRate = currentRates.find(r => r.rateType === alert.rate_type);
                    const isTriggered = currentRate && (
                      (alert.direction === 'below' && currentRate.rate <= alert.target_rate) ||
                      (alert.direction === 'above' && currentRate.rate >= alert.target_rate)
                    );

                    return (
                      <div
                        key={alert.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isTriggered ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {alert.rate_type} {alert.direction} {alert.target_rate}%
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            {alert.verified ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-3 h-3" /> Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-yellow-600">
                                <AlertCircle className="w-3 h-3" /> Pending verification
                              </span>
                            )}
                            {currentRate && (
                              <span>• Current: {currentRate.rate?.toFixed(2)}%</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isTriggered && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Triggered!
                            </span>
                          )}
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {alerts.length >= maxAlerts && !isPremium && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Want more alerts?</strong> Upgrade your plan for more rate alerts.
                  </p>
                  <a 
                    href={`${CENTRAL_URL}/pricing`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    View plans →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
