// CR AudioViz AI - Mortgage Rate Monitor
// CENTRALIZED AUTH - Uses craudiovizai.com auth system
// December 16, 2025
// 
// This app does NOT have its own login - it uses the central auth from craudiovizai.com
// Users login once at craudiovizai.com and are authenticated across all CR apps

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, Session } from '@supabase/supabase-js';

// Central website URL
const CENTRAL_AUTH_URL = 'https://craudiovizai.com';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  credits_balance: number;
  subscription_tier: 'free' | 'starter' | 'pro' | 'premium';
  subscription_status: 'active' | 'canceled' | 'past_due' | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  // Mortgage-specific preferences (stored locally)
  mortgage_state?: string;
  saved_lenders?: string[];
}

interface CreditBalance {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  credits: CreditBalance | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  // Actions
  loginWithRedirect: (returnTo?: string) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkCredits: (required: number) => Promise<boolean>;
  deductCredits: (amount: number, reason: string) => Promise<boolean>;
  updateMortgagePrefs: (prefs: { state?: string; saved_lenders?: string[] }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function CentralAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  // Fetch user profile from central profiles table
  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Profile fetch error:', err);
      return null;
    }
  }

  // Fetch credits from central user_credits table
  async function fetchCredits(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('balance, lifetime_earned, lifetime_spent')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching credits:', error);
        return null;
      }

      return data || { balance: 0, lifetime_earned: 0, lifetime_spent: 0 };
    } catch (err) {
      console.error('Credits fetch error:', err);
      return null;
    }
  }

  // Fetch mortgage-specific preferences
  async function fetchMortgagePrefs(userId: string) {
    try {
      const { data } = await supabase
        .from('mortgage_user_prefs')
        .select('state, saved_lenders')
        .eq('user_id', userId)
        .single();

      return data;
    } catch {
      return null;
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          const [profileData, creditsData, mortgagePrefs] = await Promise.all([
            fetchProfile(session.user.id),
            fetchCredits(session.user.id),
            fetchMortgagePrefs(session.user.id),
          ]);

          if (profileData) {
            setProfile({
              ...profileData,
              mortgage_state: mortgagePrefs?.state,
              saved_lenders: mortgagePrefs?.saved_lenders,
            });
          }
          setCredits(creditsData);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          const [profileData, creditsData] = await Promise.all([
            fetchProfile(session.user.id),
            fetchCredits(session.user.id),
          ]);
          if (profileData) setProfile(profileData);
          setCredits(creditsData);
        } else {
          setProfile(null);
          setCredits(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Redirect to central login
  function loginWithRedirect(returnTo?: string) {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const redirectUrl = returnTo || currentUrl;
    const encodedRedirect = encodeURIComponent(redirectUrl);
    window.location.href = `${CENTRAL_AUTH_URL}/login?redirect=${encodedRedirect}`;
  }

  // Logout
  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCredits(null);
    setSession(null);
    // Optionally redirect to central logout
    // window.location.href = `${CENTRAL_AUTH_URL}/logout`;
  }

  // Refresh profile
  async function refreshProfile() {
    if (user) {
      const [profileData, creditsData] = await Promise.all([
        fetchProfile(user.id),
        fetchCredits(user.id),
      ]);
      if (profileData) setProfile(profileData);
      setCredits(creditsData);
    }
  }

  // Check if user has enough credits
  async function checkCredits(required: number): Promise<boolean> {
    if (!user) return false;
    
    // Refresh credits first
    const fresh = await fetchCredits(user.id);
    if (fresh) setCredits(fresh);
    
    return (fresh?.balance || 0) >= required;
  }

  // Deduct credits (calls central API)
  async function deductCredits(amount: number, reason: string): Promise<boolean> {
    if (!user) return false;

    try {
      const response = await fetch(`${CENTRAL_AUTH_URL}/api/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'deduct',
          userId: user.id,
          amount,
          appId: 'mortgage-rate-monitor',
          reason,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh credits
        const fresh = await fetchCredits(user.id);
        if (fresh) setCredits(fresh);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Deduct credits error:', err);
      return false;
    }
  }

  // Update mortgage-specific preferences
  async function updateMortgagePrefs(prefs: { state?: string; saved_lenders?: string[] }) {
    if (!user) return;

    try {
      await supabase
        .from('mortgage_user_prefs')
        .upsert({
          user_id: user.id,
          ...prefs,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      // Update local state
      setProfile(prev => prev ? { ...prev, ...prefs } : null);
    } catch (err) {
      console.error('Update prefs error:', err);
    }
  }

  const isAuthenticated = !!user;
  const isPremium = profile?.subscription_tier !== 'free' && profile?.subscription_status === 'active';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        credits,
        session,
        loading,
        isAuthenticated,
        isPremium,
        loginWithRedirect,
        logout,
        refreshProfile,
        checkCredits,
        deductCredits,
        updateMortgagePrefs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useCentralAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useCentralAuth must be used within a CentralAuthProvider');
  }
  return context;
}

// Helper hook for protected routes
export function useRequireAuth(redirectTo?: string) {
  const { isAuthenticated, loading, loginWithRedirect } = useCentralAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      loginWithRedirect(redirectTo);
    }
  }, [loading, isAuthenticated, redirectTo]);

  return { isAuthenticated, loading };
}

// Helper hook for premium features
export function useRequirePremium() {
  const { isPremium, isAuthenticated, loading, loginWithRedirect } = useCentralAuth();

  return {
    isPremium,
    isAuthenticated,
    loading,
    requirePremium: () => {
      if (!isAuthenticated) {
        loginWithRedirect();
        return false;
      }
      return isPremium;
    },
  };
}
