// CR AudioViz AI - Mortgage Rate Monitor
// Navigation Component with All Tools
// December 23, 2025

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdown, setToolsDropdown] = useState(false);

  const calculators = [
    { name: 'True Cost Calculator', href: '/true-cost', icon: '💰', badge: 'Popular' },
    { name: 'Affordability', href: '/affordability', icon: '📊' },
    { name: 'ARM vs Fixed', href: '/arm-vs-fixed', icon: '⚖️', badge: 'New' },
    { name: 'Rent vs Buy', href: '/rent-vs-buy', icon: '🏠', badge: 'New' },
    { name: 'Refinance Analyzer', href: '/refinance', icon: '🔄' },
    { name: 'Closing Costs', href: '/closing-costs', icon: '📋', badge: 'New' },
  ];

  const research = [
    { name: 'Compare Lenders', href: '/compare-lenders', icon: '🏦' },
    { name: 'Property Intelligence', href: '/property-intelligence', icon: '📍' },
    { name: 'Rate Lock Advisor', href: '/rate-lock', icon: '🔒' },
    { name: 'Down Payment Help', href: '/down-payment', icon: '💵', badge: 'New' },
    { name: 'Market Trends', href: '/market-trends', icon: '📈' },
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold">Mortgage</span>
              <span className="text-emerald-400 font-bold ml-1">Monitor</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setToolsDropdown(!toolsDropdown)}
                onMouseEnter={() => setToolsDropdown(true)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1"
              >
                🧮 Calculators
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {toolsDropdown && (
                <div 
                  className="absolute top-full left-0 mt-1 w-64 bg-slate-800 rounded-xl border border-slate-700 shadow-xl py-2"
                  onMouseLeave={() => setToolsDropdown(false)}
                >
                  <div className="px-3 py-2">
                    <p className="text-slate-500 text-xs font-medium uppercase">Calculators</p>
                  </div>
                  {calculators.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between px-3 py-2 hover:bg-slate-700/50 text-slate-300 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        {item.name}
                      </span>
                      {item.badge && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                  <div className="border-t border-slate-700 my-2" />
                  <div className="px-3 py-2">
                    <p className="text-slate-500 text-xs font-medium uppercase">Research</p>
                  </div>
                  {research.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between px-3 py-2 hover:bg-slate-700/50 text-slate-300 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        {item.name}
                      </span>
                      {item.badge && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <Link href="/true-cost" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">
              💰 True Cost
            </Link>
            <Link href="/compare-lenders" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">
              🏦 Lenders
            </Link>
            <Link href="/property-intelligence" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">
              📍 Property Intel
            </Link>
            <Link href="/rate-lock" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">
              🔒 Rate Lock
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-3">
            <Link href="/true-cost" className="hidden sm:block">
              <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-emerald-500 hover:to-teal-500 transition-all">
                Get Started
              </button>
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800">
            <div className="space-y-1">
              <p className="px-3 py-2 text-slate-500 text-xs font-medium uppercase">Calculators</p>
              {calculators.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              <div className="border-t border-slate-700 my-2" />
              <p className="px-3 py-2 text-slate-500 text-xs font-medium uppercase">Research</p>
              {research.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              <div className="pt-4">
                <Link href="/true-cost" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-lg font-medium">
                    Get Started Free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CR AudioViz AI Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-center gap-2 text-xs">
          <span className="text-slate-500">Powered by</span>
          <a href="https://craudiovizai.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-medium">
            CR AudioViz AI
          </a>
          <span className="text-slate-500">• 60+ AI Tools</span>
        </div>
      </div>
    </nav>
  );
}
