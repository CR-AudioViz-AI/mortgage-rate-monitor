// CR AudioViz AI - Mortgage Rate Monitor
// Alerts API - Create alerts with email verification
// Created: December 14, 2025

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Email sending via Resend (or fallback to console log for testing)
async function sendVerificationEmail(email: string, token: string, alertDetails: any) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mortgage-rate-monitor.vercel.app'}/api/alerts/verify?token=${token}`;
  
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify Your Rate Alert</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; padding: 40px 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🏠 Mortgage Rate Monitor</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">by CR AudioViz AI</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px;">
      <h2 style="color: #1f2937; margin: 0 0 16px;">Verify Your Rate Alert</h2>
      
      <p style="color: #4b5563; line-height: 1.6;">
        Thank you for setting up a rate alert! Please verify your email address to activate it.
      </p>
      
      <!-- Alert Details -->
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="color: #374151; margin: 0 0 12px; font-size: 14px; text-transform: uppercase;">Alert Details</h3>
        <table style="width: 100%;">
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Rate Type:</td>
            <td style="color: #1f2937; font-weight: 600; text-align: right;">${alertDetails.rate_type}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Target Rate:</td>
            <td style="color: #1f2937; font-weight: 600; text-align: right;">${alertDetails.target_rate}%</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Alert When:</td>
            <td style="color: #1f2937; font-weight: 600; text-align: right;">
              ${alertDetails.direction === 'below' ? 'Rate drops to or below' : 'Rate rises to or above'} target
            </td>
          </tr>
        </table>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          ✓ Verify & Activate Alert
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Once verified, we'll monitor mortgage rates and send you an email notification as soon as the 
        ${alertDetails.rate_type} rate ${alertDetails.direction === 'below' ? 'drops to' : 'reaches'} ${alertDetails.target_rate}% or ${alertDetails.direction}.
      </p>
      
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
        If you didn't create this alert, you can safely ignore this email.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        © 2025 CR AudioViz AI, LLC. All rights reserved.<br>
        <a href="https://mortgage-rate-monitor.vercel.app" style="color: #2563eb;">mortgage-rate-monitor.vercel.app</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // Try to send via Resend if API key exists
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'Mortgage Rate Monitor <alerts@craudiovizai.com>',
          to: [email],
          subject: `Verify Your ${alertDetails.rate_type} Rate Alert - Mortgage Rate Monitor`,
          html: emailHtml,
        }),
      });

      if (response.ok) {
        console.log(`[Alerts] Verification email sent to ${email}`);
        return true;
      } else {
        console.error('[Alerts] Resend API error:', await response.text());
      }
    } catch (error) {
      console.error('[Alerts] Email send error:', error);
    }
  }

  // Fallback: Log for testing
  console.log('[Alerts] Email would be sent to:', email);
  console.log('[Alerts] Verification URL:', verifyUrl);
  return true;
}

// POST - Create a new alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rate_type, target_rate, direction, email } = body;

    // Validation
    if (!rate_type || !target_rate || !direction || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: rate_type, target_rate, direction, email' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Check for existing alert
    const { data: existingAlert } = await supabase
      .from('rate_alerts')
      .select('id, verified')
      .eq('email', email.toLowerCase())
      .eq('rate_type', rate_type)
      .eq('target_rate', target_rate)
      .eq('direction', direction)
      .single();

    if (existingAlert) {
      if (existingAlert.verified) {
        return NextResponse.json(
          { success: false, error: 'You already have this alert set up' },
          { status: 400 }
        );
      } else {
        // Resend verification email
        await sendVerificationEmail(email, verificationToken, { rate_type, target_rate, direction });
        
        // Update token
        await supabase
          .from('rate_alerts')
          .update({ 
            verification_token: verificationToken,
            token_expiry: tokenExpiry.toISOString(),
          })
          .eq('id', existingAlert.id);

        return NextResponse.json({
          success: true,
          message: 'Verification email resent. Please check your inbox.',
          requiresVerification: true,
        });
      }
    }

    // Create new alert
    const { data: newAlert, error: insertError } = await supabase
      .from('rate_alerts')
      .insert({
        email: email.toLowerCase(),
        rate_type,
        target_rate: parseFloat(target_rate),
        direction,
        active: false, // Not active until verified
        verified: false,
        verification_token: verificationToken,
        token_expiry: tokenExpiry.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      // Table might not exist, create it
      if (insertError.code === '42P01') {
        // Create table
        await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS rate_alerts (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              email VARCHAR(255) NOT NULL,
              rate_type VARCHAR(100) NOT NULL,
              target_rate DECIMAL(5,3) NOT NULL,
              direction VARCHAR(10) NOT NULL CHECK (direction IN ('below', 'above')),
              active BOOLEAN DEFAULT false,
              verified BOOLEAN DEFAULT false,
              verification_token VARCHAR(64),
              token_expiry TIMESTAMP WITH TIME ZONE,
              triggered_at TIMESTAMP WITH TIME ZONE,
              last_checked TIMESTAMP WITH TIME ZONE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(email, rate_type, target_rate, direction)
            );
          `
        });

        // Retry insert
        const { data: retryAlert, error: retryError } = await supabase
          .from('rate_alerts')
          .insert({
            email: email.toLowerCase(),
            rate_type,
            target_rate: parseFloat(target_rate),
            direction,
            active: false,
            verified: false,
            verification_token: verificationToken,
            token_expiry: tokenExpiry.toISOString(),
          })
          .select()
          .single();

        if (retryError) throw retryError;
      } else {
        throw insertError;
      }
    }

    // Send verification email
    await sendVerificationEmail(email, verificationToken, { rate_type, target_rate, direction });

    return NextResponse.json({
      success: true,
      message: 'Alert created! Please check your email to verify and activate it.',
      requiresVerification: true,
      alertId: newAlert?.id,
    });

  } catch (error) {
    console.error('[Alerts] POST error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create alert' },
      { status: 500 }
    );
  }
}

// GET - List alerts for an email (or all if admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('rate_alerts')
      .select('id, rate_type, target_rate, direction, active, verified, triggered_at, created_at')
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      alerts: data || [],
      count: data?.length || 0,
    });

  } catch (error) {
    console.error('[Alerts] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an alert
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!alertId || !email) {
      return NextResponse.json(
        { success: false, error: 'Alert ID and email required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('rate_alerts')
      .delete()
      .eq('id', alertId)
      .eq('email', email.toLowerCase());

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Alert deleted',
    });

  } catch (error) {
    console.error('[Alerts] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}
