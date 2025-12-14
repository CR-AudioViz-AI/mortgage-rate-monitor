// CR AudioViz AI - Mortgage Rate Monitor
// Alerts Verification API - Verify email for alerts
// Created: December 14, 2025

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse(generateHTML('error', 'Invalid verification link'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Find alert with this token
    const { data: alert, error: findError } = await supabase
      .from('rate_alerts')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (findError || !alert) {
      return new NextResponse(generateHTML('error', 'Invalid or expired verification link. Please create a new alert.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Check if token is expired
    if (new Date(alert.token_expiry) < new Date()) {
      return new NextResponse(generateHTML('expired', 'This verification link has expired. Please create a new alert.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Check if already verified
    if (alert.verified) {
      return new NextResponse(generateHTML('already_verified', 'This alert has already been verified and is active!', alert), {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Verify and activate the alert
    const { error: updateError } = await supabase
      .from('rate_alerts')
      .update({
        verified: true,
        active: true,
        verification_token: null,
        token_expiry: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', alert.id);

    if (updateError) {
      throw updateError;
    }

    // Send confirmation email (optional)
    await sendConfirmationEmail(alert.email, alert);

    return new NextResponse(generateHTML('success', 'Your rate alert has been verified and is now active!', alert), {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('[Verify] Error:', error);
    return new NextResponse(generateHTML('error', 'Something went wrong. Please try again.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

async function sendConfirmationEmail(email: string, alert: any) {
  if (!process.env.RESEND_API_KEY) return;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Alert Activated</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; padding: 40px 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">✓</div>
      <h1 style="color: white; margin: 0; font-size: 24px;">Alert Activated!</h1>
    </div>
    
    <div style="padding: 32px;">
      <p style="color: #4b5563; line-height: 1.6;">
        Great news! Your rate alert is now active. We'll email you as soon as the ${alert.rate_type} rate 
        ${alert.direction === 'below' ? 'drops to' : 'rises to'} ${alert.target_rate}% or ${alert.direction}.
      </p>
      
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Rate Type:</td>
            <td style="color: #1f2937; font-weight: 600; text-align: right;">${alert.rate_type}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Target Rate:</td>
            <td style="color: #1f2937; font-weight: 600; text-align: right;">${alert.target_rate}%</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Direction:</td>
            <td style="color: #1f2937; font-weight: 600; text-align: right;">
              ${alert.direction === 'below' ? 'At or Below' : 'At or Above'}
            </td>
          </tr>
        </table>
      </div>

      <p style="color: #6b7280; font-size: 14px;">
        Rates are updated weekly on Thursdays. You can manage your alerts at 
        <a href="https://mortgage-rate-monitor.vercel.app/alerts" style="color: #2563eb;">mortgage-rate-monitor.vercel.app/alerts</a>
      </p>
    </div>
    
    <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        © 2025 CR AudioViz AI, LLC. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Mortgage Rate Monitor <alerts@craudiovizai.com>',
        to: [email],
        subject: `✓ Your ${alert.rate_type} Rate Alert is Active - Mortgage Rate Monitor`,
        html: emailHtml,
      }),
    });
  } catch (error) {
    console.error('[Verify] Confirmation email error:', error);
  }
}

function generateHTML(status: string, message: string, alert?: any): string {
  const statusConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
    success: { icon: '✓', color: '#059669', bgColor: 'linear-gradient(135deg, #059669, #10b981)' },
    error: { icon: '✗', color: '#dc2626', bgColor: 'linear-gradient(135deg, #dc2626, #ef4444)' },
    expired: { icon: '⏱', color: '#d97706', bgColor: 'linear-gradient(135deg, #d97706, #f59e0b)' },
    already_verified: { icon: '✓', color: '#2563eb', bgColor: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
  };

  const config = statusConfig[status] || statusConfig.error;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${status === 'success' ? 'Alert Verified' : 'Verification'} - Mortgage Rate Monitor</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #eff6ff, #e0e7ff);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
      max-width: 480px;
      width: 100%;
      overflow: hidden;
      text-align: center;
    }
    .header {
      background: ${config.bgColor};
      padding: 48px 32px;
      color: white;
    }
    .icon {
      width: 80px;
      height: 80px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 8px;
    }
    .content {
      padding: 32px;
    }
    .message {
      color: #4b5563;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .alert-details {
      background: #f9fafb;
      border-radius: 12px;
      padding: 20px;
      text-align: left;
      margin-bottom: 24px;
    }
    .alert-details h3 {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .alert-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .alert-row:last-child { border-bottom: none; }
    .alert-row .label { color: #6b7280; }
    .alert-row .value { color: #1f2937; font-weight: 600; }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s;
    }
    .btn:hover { transform: translateY(-2px); }
    .footer {
      padding: 24px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="icon">${config.icon}</div>
      <h1>${status === 'success' ? 'Alert Verified!' : status === 'already_verified' ? 'Already Verified' : status === 'expired' ? 'Link Expired' : 'Oops!'}</h1>
      <p style="opacity: 0.9;">Mortgage Rate Monitor</p>
    </div>
    
    <div class="content">
      <p class="message">${message}</p>
      
      ${alert && status === 'success' ? `
        <div class="alert-details">
          <h3>Your Active Alert</h3>
          <div class="alert-row">
            <span class="label">Rate Type</span>
            <span class="value">${alert.rate_type}</span>
          </div>
          <div class="alert-row">
            <span class="label">Target Rate</span>
            <span class="value">${alert.target_rate}%</span>
          </div>
          <div class="alert-row">
            <span class="label">Alert When</span>
            <span class="value">${alert.direction === 'below' ? 'At or Below' : 'At or Above'}</span>
          </div>
        </div>
      ` : ''}
      
      <a href="https://mortgage-rate-monitor.vercel.app/alerts" class="btn">
        ${status === 'success' ? 'Manage My Alerts' : 'Create New Alert'}
      </a>
    </div>
    
    <div class="footer">
      © 2025 CR AudioViz AI, LLC. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}
