// CR AudioViz AI - Mortgage Rate Monitor
// Auth Callback Route - Works with central craudiovizai.com auth
// December 16, 2025
//
// This handles OAuth callbacks and redirects from the central auth system

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      // Exchange code for session
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
      }

      if (session?.user) {
        // Check if mortgage preferences exist, create if not
        const { data: existingPrefs } = await supabase
          .from('mortgage_user_prefs')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (!existingPrefs) {
          // Create default mortgage preferences
          await supabase.from('mortgage_user_prefs').insert({
            user_id: session.user.id,
            tracked_rate_types: ['30-Year Fixed', '15-Year Fixed'],
            email_alerts_enabled: true,
          });
        }

        // Link any existing alerts by email to this user
        await supabase
          .from('rate_alerts')
          .update({ user_id: session.user.id })
          .eq('email', session.user.email)
          .is('user_id', null);
      }
    } catch (err) {
      console.error('Auth callback exception:', err);
    }
  }

  // Redirect to the intended destination
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
