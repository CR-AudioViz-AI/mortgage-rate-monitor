/**
 * POST /api/alerts/test
 * 
 * Send a test email to verify email configuration.
 * Useful for testing before setting up actual alerts.
 * 
 * Request Body:
 * {
 *   email: string (required)
 * }
 * 
 * @timestamp 2025-11-12T14:47:00Z
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendRateAlert } from '@/lib/notifications/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'email is required',
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Send test email with sample data
    await sendRateAlert({
      to: email,
      location: 'Test Location (Florida)',
      rateType: '30-year-fixed',
      oldRate: 7.25,
      newRate: 6.99,
      changePercent: -3.59,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${email}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] /alerts/test error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: 'Failed to send test email. Check email configuration.',
      },
      { status: 500 }
    );
  }
}
