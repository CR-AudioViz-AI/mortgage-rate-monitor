// CR AudioViz AI - Mortgage Rate Monitor
// Authentication Context - Simplified version (no auth-helpers-nextjs)
// December 15, 2025

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  state?: string;
  subscription_tier: 'free' | 'pro' | 'agent';
  subscription_status: 'active' | 'canceled' | 'past_due' | null;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  session: any | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isConfigured = !!supabase;

  // Fetch user profile from database
  async function fetchProfile(userId: string) {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: userData } = await supabase.auth.getUser();
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            email: userData?.user?.email || '',
            subscription_tier: 'free',
          })
          .select()
          .single();

        if (!createError && newProfile) {
          setProfile(newProfile);
        }
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }

  // Initialize auth state
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
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
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email/password
  async function signUp(email: string, password: string, fullName?: string) {
    if (!supabase) return { error: 'Auth not configured' };
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (!error && data.user) {
        // Create profile
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          subscription_tier: 'free',
        });
      }

      return { error };
    } catch (err) {
      return { error: err };
    }
  }

  // Sign in with email/password
  async function signIn(email: string, password: string) {
    if (!supabase) return { error: 'Auth not configured' };
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (err) {
      return { error: err };
    }
  }

  // Sign in with Google
  async function signInWithGoogle() {
    if (!supabase) return { error: 'Auth not configured' };
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });
      return { error };
    } catch (err) {
      return { error: err };
    }
  }

  // Sign out
  async function signOut() {
    if (!supabase) return;
    
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  }

  // Update profile
  async function updateProfile(updates: Partial<UserProfile>) {
    if (!supabase || !user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      }

      return { error };
    } catch (err) {
      return { error: err };
    }
  }

  // Refresh profile from database
  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.id);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
