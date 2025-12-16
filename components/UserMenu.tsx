// CR AudioViz AI - Mortgage Rate Monitor
// User Menu Component - Shows central auth user info
// December 16, 2025

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCentralAuth } from '@/contexts/CentralAuthContext';
import { 
  User, LogOut, Settings, CreditCard, Coins,
  ChevronDown, ExternalLink, Crown, Bell
} from 'lucide-react';

const CENTRAL_URL = 'https://craudiovizai.com';

export default function UserMenu() {
  const { user, profile, credits, isAuthenticated, loading, isPremium, loginWithRedirect, logout } = useCentralAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => loginWithRedirect()}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/25"
      >
        Sign In
      </button>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  const tierColors = {
    free: 'bg-gray-100 text-gray-600',
    starter: 'bg-blue-100 text-blue-700',
    pro: 'bg-purple-100 text-purple-700',
    premium: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition"
      >
        {/* Avatar */}
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
        )}
        
        {/* Credits badge */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          <Coins className="w-3 h-3" />
          {credits?.balance?.toLocaleString() || 0}
        </div>
        
        <ChevronDown className={`w-4 h-4 text-gray-500 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            {/* Subscription Badge */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierColors[profile?.subscription_tier || 'free']}`}>
                {isPremium && <Crown className="w-3 h-3 inline mr-1" />}
                {(profile?.subscription_tier || 'free').charAt(0).toUpperCase() + (profile?.subscription_tier || 'free').slice(1)}
              </span>
              {!isPremium && (
                <a
                  href={`${CENTRAL_URL}/pricing`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Upgrade
                </a>
              )}
            </div>
          </div>

          {/* Credits */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-gray-600">Credits</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900">{credits?.balance?.toLocaleString() || 0}</span>
                <a
                  href={`${CENTRAL_URL}/credits`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-600 hover:underline"
                >
                  Buy more
                </a>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User className="w-4 h-4 text-gray-400" />
              Dashboard
            </Link>
            <Link
              href="/alerts"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Bell className="w-4 h-4 text-gray-400" />
              Rate Alerts
            </Link>
            <a
              href={`${CENTRAL_URL}/settings`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              Account Settings
              <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
            </a>
            <a
              href={`${CENTRAL_URL}/billing`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <CreditCard className="w-4 h-4 text-gray-400" />
              Billing
              <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
            </a>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Central Platform Link */}
          <div className="border-t border-gray-100 mt-1 pt-2 pb-1 px-4">
            <a
              href={CENTRAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Open CR AudioViz AI
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
