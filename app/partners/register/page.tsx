// RateUnlock - Partner Registration
// Self-service signup for institutions
// December 24, 2025

'use client';

import { useState } from 'react';
import Link from 'next/link';

const INSTITUTION_TYPES = [
  { id: 'bank', name: 'Bank', icon: '🏦' },
  { id: 'credit-union', name: 'Credit Union', icon: '🏛️' },
  { id: 'mortgage-broker', name: 'Mortgage Broker', icon: '📋' },
  { id: 'real-estate', name: 'Real Estate Agency', icon: '🏠' },
  { id: 'fintech', name: 'Fintech Company', icon: '💻' },
  { id: 'media', name: 'Media/Publisher', icon: '📰' },
  { id: 'other', name: 'Other', icon: '🔧' },
];

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'All 10+ calculators',
      'RateUnlock branding',
      'Basic analytics',
      'Community support',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 99,
    features: [
      'Everything in Free',
      'Remove RateUnlock branding',
      'Lead capture forms',
      'Email support',
      'Custom colors',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    popular: true,
    features: [
      'Everything in Basic',
      'White-label subdomain',
      'CRM/webhook integration',
      'Lead routing rules',
      '$50/qualified lead',
      'Priority support',
      'Custom logo',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    features: [
      'Everything in Pro',
      'Custom domain',
      'API access',
      'Dedicated success manager',
      'Custom development',
      'SLA guarantee',
      'Volume pricing',
    ],
  },
];

export default function PartnerRegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    companyName: '',
    institutionType: '',
    website: '',
    
    // Step 2: Contact
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    
    // Step 3: Plan
    plan: 'pro',
    
    // Step 4: Customization
    primaryColor: '#10b981',
    secondaryColor: '#8b5cf6',
    logo: null as File | null,
    subdomain: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // In production: Submit to API
      const response = await fetch('/api/partners/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Registration failed');
      
      // Redirect to partner dashboard
      window.location.href = '/partners/dashboard?welcome=true';
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.companyName && formData.institutionType && formData.website;
      case 2:
        return formData.firstName && formData.lastName && formData.email;
      case 3:
        return formData.plan;
      case 4:
        return formData.subdomain;
      default:
        return true;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-slate-900/95 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="regGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981"/>
                  <stop offset="50%" stopColor="#06b6d4"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="29" fill="none" stroke="url(#regGrad)" strokeWidth="2.5"/>
              <rect x="20" y="27" width="24" height="20" rx="4" fill="url(#regGrad)"/>
              <path d="M25 27 L25 21 Q25 13 32 13 Q39 13 39 21 L39 27" fill="none" stroke="url(#regGrad)" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            <span className="font-bold text-xl text-white">Partner Registration</span>
          </Link>
          <Link href="/partners" className="text-slate-400 hover:text-white text-sm">
            Already a partner? Sign in
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {['Company', 'Contact', 'Plan', 'Setup'].map((label, idx) => (
            <div key={label} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step > idx + 1
                  ? 'bg-emerald-500 text-white'
                  : step === idx + 1
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {step > idx + 1 ? '✓' : idx + 1}
              </div>
              <span className={`ml-2 text-sm ${step >= idx + 1 ? 'text-white' : 'text-slate-500'}`}>
                {label}
              </span>
              {idx < 3 && (
                <div className={`w-16 h-1 mx-4 rounded ${
                  step > idx + 1 ? 'bg-emerald-500' : 'bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Company Info */}
        {step === 1 && (
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Tell us about your company</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Company Name *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="Acme Bank"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">Institution Type *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {INSTITUTION_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => updateField('institutionType', type.id)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        formData.institutionType === type.id
                          ? 'bg-emerald-500/20 border-2 border-emerald-500'
                          : 'bg-slate-700/50 border-2 border-transparent hover:border-slate-600'
                      }`}
                    >
                      <span className="text-2xl block">{type.icon}</span>
                      <span className="text-white text-sm mt-2 block">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">Website *</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Your contact information</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">Work Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Job Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Marketing Director"
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Choose Plan */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose your plan</h2>
            
            <div className="grid md:grid-cols-4 gap-4">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => updateField('plan', plan.id)}
                  className={`rounded-2xl p-6 text-left transition-all ${
                    formData.plan === plan.id
                      ? 'bg-gradient-to-b from-emerald-500/20 to-slate-800/50 border-2 border-emerald-500'
                      : 'bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {plan.popular && (
                    <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-white mt-2">{plan.name}</h3>
                  <p className="text-3xl font-bold text-white mt-2">
                    {plan.price === null ? 'Custom' : plan.price === 0 ? 'Free' : `$${plan.price}`}
                    {plan.price !== null && plan.price > 0 && (
                      <span className="text-sm text-slate-400 font-normal">/mo</span>
                    )}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="text-slate-400 text-sm flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-slate-500 text-sm">
                        +{plan.features.length - 4} more
                      </li>
                    )}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Customization */}
        {step === 4 && (
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Set up your white-label</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Subdomain *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => updateField('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="yourcompany"
                    className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                  />
                  <span className="text-slate-400">.rateunlock.com</span>
                </div>
                <p className="text-slate-500 text-sm mt-2">
                  Your calculators will be available at {formData.subdomain || 'yourcompany'}.rateunlock.com
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => updateField('primaryColor', e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => updateField('primaryColor', e.target.value)}
                      className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => updateField('secondaryColor', e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => updateField('secondaryColor', e.target.value)}
                      className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 font-mono"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">Preview</label>
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-600">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})` }}
                    >
                      {formData.companyName?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{formData.companyName || 'Your Company'}</p>
                      <p className="text-slate-400 text-sm">Mortgage Calculators</p>
                    </div>
                  </div>
                  <button 
                    className="mt-4 px-6 py-2 rounded-lg text-white font-medium"
                    style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})` }}
                  >
                    Calculate Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-500/20 text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`px-6 py-3 rounded-lg font-medium ${
                canProceed()
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className={`px-8 py-3 rounded-lg font-medium ${
                canProceed() && !loading
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
