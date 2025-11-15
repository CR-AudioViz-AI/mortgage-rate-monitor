// Javari AI Mortgage Rate Monitoring - Email Alert System
// Phase 3B: User Rate Alerts with Email Notifications
// Created: 2025-11-14 22:30 UTC
// Roy Henderson, CEO @ CR AudioViz AI, LLC

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List all alerts for authenticated user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Fetch user's alerts
    const { data: alerts, error } = await supabase
      .from('mortgage_rate_alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alerts: alerts || [],
      count: alerts?.length || 0
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/mortgage/alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new alert
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rate_type, threshold, condition, email } = body;

    // Validate input
    if (!rate_type || !threshold || !condition || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: rate_type, threshold, condition, email' },
        { status: 400 }
      );
    }

    // Validate rate_type
    const validRateTypes = ['30y_fixed', '15y_fixed', '5_1_arm'];
    if (!validRateTypes.includes(rate_type)) {
      return NextResponse.json(
        { error: 'Invalid rate_type. Must be one of: 30y_fixed, 15y_fixed, 5_1_arm' },
        { status: 400 }
      );
    }

    // Validate condition
    const validConditions = ['above', 'below'];
    if (!validConditions.includes(condition)) {
      return NextResponse.json(
        { error: 'Invalid condition. Must be either "above" or "below"' },
        { status: 400 }
      );
    }

    // Validate threshold is a positive number
    const thresholdNum = parseFloat(threshold);
    if (isNaN(thresholdNum) || thresholdNum <= 0) {
      return NextResponse.json(
        { error: 'Threshold must be a positive number' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check user's alert limit (max 10 active alerts)
    const { data: existingAlerts, error: countError } = await supabase
      .from('mortgage_rate_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (countError) {
      console.error('Error checking alert count:', countError);
      return NextResponse.json(
        { error: 'Failed to check alert limit' },
        { status: 500 }
      );
    }

    const alertCount = existingAlerts?.length || 0;
    if (alertCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum alert limit reached (10 active alerts)' },
        { status: 400 }
      );
    }

    // Create new alert
    const { data: newAlert, error: insertError } = await supabase
      .from('mortgage_rate_alerts')
      .insert({
        user_id: user.id,
        rate_type,
        threshold: thresholdNum,
        condition,
        email,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating alert:', insertError);
      return NextResponse.json(
        { error: 'Failed to create alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alert: newAlert,
      message: 'Alert created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/mortgage/alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update existing alert
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { alert_id, threshold, condition, email, is_active } = body;

    if (!alert_id) {
      return NextResponse.json(
        { error: 'Missing required field: alert_id' },
        { status: 400 }
      );
    }

    // Verify alert belongs to user
    const { data: existingAlert, error: fetchError } = await supabase
      .from('mortgage_rate_alerts')
      .select('*')
      .eq('id', alert_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingAlert) {
      return NextResponse.json(
        { error: 'Alert not found or unauthorized' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {};
    
    if (threshold !== undefined) {
      const thresholdNum = parseFloat(threshold);
      if (isNaN(thresholdNum) || thresholdNum <= 0) {
        return NextResponse.json(
          { error: 'Threshold must be a positive number' },
          { status: 400 }
        );
      }
      updates.threshold = thresholdNum;
    }

    if (condition !== undefined) {
      const validConditions = ['above', 'below'];
      if (!validConditions.includes(condition)) {
        return NextResponse.json(
          { error: 'Invalid condition. Must be either "above" or "below"' },
          { status: 400 }
        );
      }
      updates.condition = condition;
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
      updates.email = email;
    }

    if (is_active !== undefined) {
      updates.is_active = Boolean(is_active);
    }

    // Update alert
    const { data: updatedAlert, error: updateError } = await supabase
      .from('mortgage_rate_alerts')
      .update(updates)
      .eq('id', alert_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating alert:', updateError);
      return NextResponse.json(
        { error: 'Failed to update alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alert: updatedAlert,
      message: 'Alert updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error in PATCH /api/mortgage/alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete alert
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const alert_id = searchParams.get('alert_id');

    if (!alert_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: alert_id' },
        { status: 400 }
      );
    }

    // Soft delete - set is_active to false
    const { data: deletedAlert, error: deleteError } = await supabase
      .from('mortgage_rate_alerts')
      .update({ is_active: false })
      .eq('id', alert_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (deleteError || !deletedAlert) {
      return NextResponse.json(
        { error: 'Alert not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/mortgage/alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

