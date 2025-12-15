// CR AudioViz AI - Mortgage Rate Monitor
// Auth Callback Route - Simplified (no auth-helpers-nextjs)
// December 15, 2025

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');

  // If there's an error, redirect to login with error message
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  // If no code, just redirect to dashboard
  if (!code) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Get Supabase credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL('/login?error=config', request.url));
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Auth exchange error:', exchangeError);
      return NextResponse.redirect(new URL('/login?error=exchange', request.url));
    }

    if (data?.session?.user) {
      // Check if profile exists, create if not
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', data.session.user.id)
        .single();

      if (!existingProfile) {
        await supabase.from('user_profiles').insert({
          id: data.session.user.id,
          email: data.session.user.email,
          full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name,
          subscription_tier: 'free',
        });
      }
    }
  } catch (err) {
    console.error('Auth callback error:', err);
    return NextResponse.redirect(new URL('/login?error=unknown', request.url));
  }

  // Redirect to dashboard after auth
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
