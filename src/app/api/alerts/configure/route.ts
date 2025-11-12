/**
 * POST /api/alerts/configure
 * 
 * Configure rate drop alerts for users.
 * Can be integrated into realtor app user profiles.
 * 
 * Request Body:
 * {
 *   user_email: string (required)
 *   location_code: string (required)
 *   rate_type: string (required)
 *   threshold_percent: number (default: 0.25)
 *   is_active: boolean (default: true)
 * }
 * 
 * @timestamp 2025-11-12T14:47:00Z
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { user_email, location_code, rate_type } = body;

    if (!user_email || !location_code || !rate_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'user_email, location_code, and rate_type are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Validate rate type
    const validRateTypes = ['30-year-fixed', '15-year-fixed', '5-1-arm'];
    if (!validRateTypes.includes(rate_type)) {
      return NextResponse.json(
        {
          success: false,
          error: `rate_type must be one of: ${validRateTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Set defaults
    const threshold_percent = body.threshold_percent || 0.25;
    const is_active = body.is_active !== undefined ? body.is_active : true;

    // Validate threshold
    if (threshold_percent < 0.1 || threshold_percent > 5.0) {
      return NextResponse.json(
        {
          success: false,
          error: 'threshold_percent must be between 0.1 and 5.0',
        },
        { status: 400 }
      );
    }

    // Check if alert already exists
    const { data: existing } = await supabase
      .from('alert_configs')
      .select('id')
      .eq('user_email', user_email)
      .eq('location_code', location_code)
      .eq('rate_type', rate_type)
      .single();

    let result;

    if (existing) {
      // Update existing alert
      const { data, error } = await supabase
        .from('alert_configs')
        .update({
          threshold_percent,
          is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = { ...data, action: 'updated' };
    } else {
      // Create new alert
      const { data, error } = await supabase
        .from('alert_configs')
        .insert({
          user_email,
          location_code,
          rate_type,
          threshold_percent,
          is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      result = { ...data, action: 'created' };
    }

    return NextResponse.json({
      success: true,
      alert: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] /alerts/configure error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// GET method to retrieve user's alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_email = searchParams.get('user_email');

    if (!user_email) {
      return NextResponse.json(
        {
          success: false,
          error: 'user_email is required',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('alert_configs')
      .select('*')
      .eq('user_email', user_email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: data.length,
      alerts: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] /alerts/configure GET error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE method to remove an alert
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alert_id = searchParams.get('alert_id');

    if (!alert_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'alert_id is required',
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('alert_configs')
      .delete()
      .eq('id', alert_id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] /alerts/configure DELETE error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
