// Javari AI Mortgage Rate Monitor - Interactive Homepage
// Created: 2025-11-15
// Roy Henderson, CEO @ CR AudioViz AI, LLC

'use client';

import { useState, useEffect } from 'react';
import CurrentRates from '@/components/CurrentRates';
import EmailAlertForm from '@/components/EmailAlertForm';
import HistoricalChart from '@/components/HistoricalChart';
import APIKeyGenerator from '@/components/APIKeyGenerator';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'rates' | 'alerts' | 'history' | 'api'>('rates');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🏠 Javari AI Mortgage Monitor
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time mortgage rates powered by AI
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>CR AudioViz AI, LLC</p>
              <p>Roy Henderson, CEO</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-lg shadow-md p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('rates')}
            className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'rates'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Current Rates
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📧 Email Alerts
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📈 Historical Data
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'api'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🔑 API Access
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-12">
        {activeTab === 'rates' && <CurrentRates />}
        {activeTab === 'alerts' && <EmailAlertForm />}
        {activeTab === 'history' && <HistoricalChart />}
        {activeTab === 'api' && <APIKeyGenerator />}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm">
              © 2025 CR AudioViz AI, LLC | Built with Next.js 14, Supabase, and Vercel
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Production Ready | Phase 3 Complete
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
