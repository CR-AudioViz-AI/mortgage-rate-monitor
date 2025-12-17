// CR AudioViz AI - Mortgage Rate Monitor
// Alert Verification Endpoint
// December 17, 2025

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [to],
        subject: `✅ Rate Alert Activated - ${alert.rateType}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1e40af; margin: 0;">🏠 Mortgage Rate Monitor</h1>
                <p style="color: #6b7280; margin: 5px 0 0;">by CR AudioViz AI</p>
              </div>
              
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 30px;">✓</span>
                </div>
              </div>
              
              <h2 style="color: #111827; text-align: center; margin-bottom: 20px;">Alert Activated!</h2>
              
              <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <p style="color: #374151; margin: 0 0 10px;"><strong>Rate Type:</strong> ${alert.rateType}</p>
                <p style="color: #374151; margin: 0 0 10px;"><strong>Target:</strong> ${alert.direction === 'below' ? 'Below' : 'Above'} ${alert.targetRate}%</p>
                <p style="color: #374151; margin: 0;"><strong>Email:</strong> ${to}</p>
              </div>
              
              <p style="color: #374151; line-height: 1.6;">
                We'll notify you as soon as ${alert.rateType} rates go ${alert.direction} ${alert.targetRate}%. 
                Rate data is updated daily from the Federal Reserve (FRED).
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/rates" 
                   style="display: inline-block; background: #1e40af; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                  View Current Rates
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                CR AudioViz AI, LLC • Fort Myers, FL<br>
                <a href="${APP_URL}/unsubscribe?email=${encodeURIComponent(to)}" style="color: #6b7280;">Manage alert preferences</a>
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      // Redirect to error page
      return NextResponse.redirect(`${APP_URL}/alerts?error=missing_token`);
    }

    // Find alert by token
    const { data: alert, error: findError } = await supabase
      .from('rate_alerts')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (findError || !alert) {
      return NextResponse.redirect(`${APP_URL}/alerts?error=invalid_token`);
    }

    // Check if token is expired
    if (new Date(alert.token_expiry) < new Date()) {
      return NextResponse.redirect(`${APP_URL}/alerts?error=token_expired`);
    }

    // Activate the alert
    const { error: updateError } = await supabase
      .from('rate_alerts')
      .update({
        active: true,
        verified: true,
        verification_token: null,
        token_expiry: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', alert.id);

    if (updateError) {
      console.error('Failed to activate alert:', updateError);
      return NextResponse.redirect(`${APP_URL}/alerts?error=activation_failed`);
    }

    // Send confirmation email
    await sendConfirmationEmail(alert.email, {
      rateType: alert.rate_type,
      targetRate: alert.target_rate,
      direction: alert.direction,
    });

    // Redirect to success page
    return NextResponse.redirect(
      `${APP_URL}/alerts?verified=true&rateType=${encodeURIComponent(alert.rate_type)}&target=${alert.target_rate}`
    );

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(`${APP_URL}/alerts?error=verification_failed`);
  }
}
