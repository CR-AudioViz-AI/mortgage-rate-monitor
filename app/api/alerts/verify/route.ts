// CR AudioViz AI - Mortgage Rate Monitor
// Alert Verification Endpoint
// December 17, 2025

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Resend configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mortgage Rate Monitor <alerts@craudiovizai.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mortgage-rate-monitor.vercel.app';

async function sendConfirmationEmail(to: string, alert: { rateType: string; targetRate: number; direction: string }) {
  if (!RESEND_API_KEY) return;

  const rateTypeLabels: Record<string, string> = {
    thirtyYear: '30-Year Fixed',
    fifteenYear: '15-Year Fixed',
    fiveOneArm: '5/1 ARM'
  };

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to,
      subject: '✅ Rate Alert Confirmed - Mortgage Rate Monitor',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Your Rate Alert is Active!</h2>
          <p>Great news! Your mortgage rate alert has been verified and is now active.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Rate Type:</strong> ${rateTypeLabels[alert.rateType] || alert.rateType}</p>
            <p><strong>Target Rate:</strong> ${alert.targetRate}%</p>
            <p><strong>Alert When:</strong> Rate goes ${alert.direction === 'below' ? 'below' : 'above'} target</p>
          </div>
          <p>We'll email you as soon as rates hit your target!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Mortgage Rate Monitor by CR AudioViz AI<br>
            <a href="${APP_URL}">Visit Dashboard</a>
          </p>
        </div>
      `
    })
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.redirect(new URL('/alerts?error=missing_params', APP_URL));
  }

  try {
    // Find the alert with matching token
    const { data: alert, error: findError } = await supabase
      .from('rate_alerts')
      .select('*')
      .eq('email', email)
      .eq('verification_token', token)
      .single();

    if (findError || !alert) {
      return NextResponse.redirect(new URL('/alerts?error=invalid_token', APP_URL));
    }

    if (alert.is_verified) {
      return NextResponse.redirect(new URL('/alerts?status=already_verified', APP_URL));
    }

    // Verify the alert
    const { error: updateError } = await supabase
      .from('rate_alerts')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', alert.id);

    if (updateError) {
      return NextResponse.redirect(new URL('/alerts?error=verification_failed', APP_URL));
    }

    // Send confirmation email
    await sendConfirmationEmail(email, alert);

    return NextResponse.redirect(new URL('/alerts?status=verified', APP_URL));

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(new URL('/alerts?error=server_error', APP_URL));
  }
}
