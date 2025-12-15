// CR AudioViz AI - Mortgage Rate Monitor
// User Dashboard - Handles unconfigured auth gracefully
// December 15, 2025

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, Bell, Settings, LogOut, MapPin, 
  TrendingDown, TrendingUp, Crown, CheckCircle,
  AlertCircle, Plus, Trash2, CreditCard,
  Home, Calculator, Users, BarChart3
} from 'lucide-react';

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
  const { user, profile, loading, signOut, updateProfile, isConfigured } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<RateAlert[]>([]);
  const [currentRates, setCurrentRates] = useState<any[]>([]);
  const [editingState, setEditingState] = useState(false);
  const [selectedState, setSelectedState] = useState(profile?.state || '');

  useEffect(() => {
    // Only redirect if auth is configured and user is not logged in
    if (!loading && isConfigured && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, loading, router, isConfigured]);

  useEffect(() => {
    fetchCurrentRates();
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  useEffect(() => {
    setSelectedState(profile?.state || '');
  }, [profile]);

  async function fetchAlerts() {
    if (!user?.email) return;
    try {
      const response = await fetch(`/api/alerts?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  }

  async function fetchCurrentRates() {
    try {
      const response = await fetch('/api/mortgage/rates');
      const data = await response.json();
      if (data.success) {
        setCurrentRates(data.rates || []);
      }
    } catch (err) {
      console.error('Failed to fetch rates:', err);
    }
  }

  async function handleStateUpdate() {
    if (selectedState && updateProfile) {
      await updateProfile({ state: selectedState });
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

  const tierConfig = {
    free: { label: 'Free', color: 'text-gray-600', bgColor: 'bg-gray-100', alertLimit: 1 },
    pro: { label: 'Pro', color: 'text-blue-600', bgColor: 'bg-blue-100', alertLimit: 5 },
    agent: { label: 'Agent', color: 'text-purple-600', bgColor: 'bg-purple-100', alertLimit: 25 },
  };

  const currentTier = tierConfig[profile?.subscription_tier || 'free'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If auth is not configured, show a preview dashboard
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">Dashboard Preview</h1>
                <p className="text-blue-100">User accounts coming soon!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Notice */}
          <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Settings className="w-6 h-6 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 text-lg">Authentication Coming Soon</h3>
                <p className="text-yellow-700 mt-1">
                  User accounts, rate alerts, and personalized dashboards are being set up. 
                  In the meantime, explore all our free features!
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    View Current Rates
                  </Link>
                  <Link href="/compare" className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Compare Lenders
                  </Link>
                  <Link href="/calculators" className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Use Calculators
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Current Rates Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Key Rates</h2>
              <Link href="/" className="text-blue-600 text-sm hover:underline">View All</Link>
            </div>
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
          </div>
        </div>
      </div>
    );
  }

  // If user is not logged in but auth is configured
  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Full dashboard for logged-in users
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Welcome, {profile?.full_name || user.email?.split('@')[0]}!
              </h1>
              <p className="text-blue-100">
                Manage your rate alerts and preferences
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentTier.bgColor} ${currentTier.color}`}>
                {currentTier.label} Plan
              </span>
              {profile?.subscription_tier === 'free' && (
                <Link
                  href="/pricing"
                  className="flex items-center gap-1 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade
                </Link>
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
                  <p className="font-medium text-gray-900">{user.email}</p>
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
                        {profile?.state ? getStateName(profile.state) : 'Not set'}
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

                <div>
                  <label className="text-sm text-gray-500">Member Since</label>
                  <p className="font-medium text-gray-900">
                    {new Date(profile?.created_at || user.created_at || Date.now()).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
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
          </div>

          {/* Middle & Right Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Rates Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Key Rates</h2>
                <Link href="/" className="text-blue-600 text-sm hover:underline">View All</Link>
              </div>
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
                    {alerts.length} / {currentTier.alertLimit} alerts
                  </span>
                  {alerts.length < currentTier.alertLimit && (
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

              {alerts.length === 0 ? (
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

              {alerts.length >= currentTier.alertLimit && profile?.subscription_tier === 'free' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Want more alerts?</strong> Upgrade to Pro for up to 5 alerts.
                  </p>
                  <Link href="/pricing" className="text-blue-600 text-sm font-medium hover:underline">
                    View plans →
                  </Link>
                </div>
              )}
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription
              </h2>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{currentTier.label} Plan</div>
                  <div className="text-sm text-gray-500">
                    {profile?.subscription_tier === 'free' ? 'Free forever' : 
                     profile?.subscription_status === 'active' ? 'Active subscription' : 'Subscription ended'}
                  </div>
                </div>
                {profile?.subscription_tier === 'free' ? (
                  <Link
                    href="/pricing"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                  >
                    Upgrade
                  </Link>
                ) : (
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Manage
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
