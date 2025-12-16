// CR AudioViz AI - Mortgage Rate Monitor
// Login Page - Redirects to Central Auth (craudiovizai.com)
// December 16, 2025
//
// This app does NOT have its own login system.
// Users are redirected to craudiovizai.com to login.

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home, ExternalLink, ArrowRight } from 'lucide-react';

const CENTRAL_AUTH_URL = 'https://craudiovizai.com';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    // Auto-redirect after 2 seconds
    const timer = setTimeout(() => {
      const encodedRedirect = encodeURIComponent(
        `${window.location.origin}${redirect}`
      );
      window.location.href = `${CENTRAL_AUTH_URL}/login?redirect=${encodedRedirect}`;
    }, 2000);

    return () => clearTimeout(timer);
  }, [redirect]);

  const handleLoginClick = () => {
    const encodedRedirect = encodeURIComponent(
      `${window.location.origin}${redirect}`
    );
    window.location.href = `${CENTRAL_AUTH_URL}/login?redirect=${encodedRedirect}`;
  };

  const handleSignupClick = () => {
    const encodedRedirect = encodeURIComponent(
      `${window.location.origin}${redirect}`
    );
    window.location.href = `${CENTRAL_AUTH_URL}/signup?redirect=${encodedRedirect}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="text-xl font-bold text-gray-900">Mortgage Rate Monitor</span>
              <span className="block text-xs text-gray-500">by CR AudioViz AI</span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Loading spinner */}
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Redirecting to Login...
          </h1>
          <p className="text-gray-600 mb-6">
            Taking you to CR AudioViz AI to sign in with your account.
          </p>

          {/* Manual buttons if redirect doesn't work */}
          <div className="space-y-3">
            <button
              onClick={handleLoginClick}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleSignupClick}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              Create Account
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            One account for all CR AudioViz AI apps
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-6 bg-white/60 rounded-xl p-4">
          <p className="text-sm text-gray-600 text-center mb-3">
            <strong>Your CR AudioViz AI account includes:</strong>
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 50 free credits
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span> All 60+ AI tools
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Rate alerts
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Saved preferences
            </div>
          </div>
        </div>

        {/* Continue without login */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            Continue browsing without signing in →
          </Link>
        </div>
      </div>
    </div>
  );
}
