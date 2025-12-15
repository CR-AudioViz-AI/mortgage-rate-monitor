// CR AudioViz AI - Mortgage Rate Monitor
// Auth Callback Route - Handles OAuth redirects
// December 14, 2025

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange code for session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user) {
      // Check if profile exists, create if not
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (!existingProfile) {
        await supabase.from('user_profiles').insert({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          subscription_tier: 'free',
        });
      }
    }
  }

  // Redirect to dashboard after auth
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
