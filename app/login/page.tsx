// CR AudioViz AI - Mortgage Rate Monitor
// Login Page - Redirects to Central Auth (craudiovizai.com)
// December 16, 2025
//
// FIXED: Wrapped useSearchParams in Suspense boundary (Next.js 14 requirement)
//
// This app does NOT have its own login system.
// Users are redirected to craudiovizai.com to login.

'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home, ExternalLink, ArrowRight } from 'lucide-react';

const CENTRAL_AUTH_URL = 'https://craudiovizai.com';

// Separate component that uses useSearchParams
function LoginContent() {
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
    <>
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
            <span>Sign In</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleSignupClick}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info text */}
      <div className="text-center mt-6 text-sm text-gray-500">
        <p>
          All CR AudioViz AI products use a single account.
          <br />
          Sign in once, access everything.
        </p>
      </div>

      {/* Back to home */}
      <Link 
        href="/"
        className="block text-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Back to Mortgage Rate Monitor
      </Link>
    </>
  );
}

// Loading fallback for Suspense
function LoginLoading() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Loading...
      </h1>
      <p className="text-gray-600">
        Preparing login redirect...
      </p>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function LoginPage() {
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

        {/* Suspense-wrapped content */}
        <Suspense fallback={<LoginLoading />}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
