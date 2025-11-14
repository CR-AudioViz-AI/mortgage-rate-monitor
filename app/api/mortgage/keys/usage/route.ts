// Javari AI Mortgage Rate Monitoring - API Usage Tracking
// Phase 3D: API Key Usage Analytics
// Created: 2025-11-14 22:46 UTC
// Roy Henderson, CEO @ CR AudioViz AI, LLC

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get usage statistics for authenticated user
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

    const { searchParams } = new URL(request.url);
    const key_id = searchParams.get('key_id');
    const days = parseInt(searchParams.get('days') || '30');

    // Validate days
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 365' },
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build query
    let query = supabase
      .from('mortgage_api_usage_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('request_timestamp', startDate.toISOString())
      .lte('request_timestamp', endDate.toISOString())
      .order('request_timestamp', { ascending: false });

    if (key_id) {
      query = query.eq('api_key_id', key_id);
    }

    const { data: usageLogs, error } = await query;

    if (error) {
      console.error('Error fetching usage logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch usage data' },
        { status: 500 }
      );
    }

    if (!usageLogs || usageLogs.length === 0) {
      return NextResponse.json({
        success: true,
        usage: [],
        summary: {
          total_requests: 0,
          successful_requests: 0,
          failed_requests: 0,
          avg_response_time: 0,
          date_range: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        }
      });
    }

    // Calculate summary statistics
    const totalRequests = usageLogs.length;
    const successfulRequests = usageLogs.filter(log => log.status_code >= 200 && log.status_code < 300).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const responseTimesFiltered = usageLogs
      .map(log => log.response_time_ms)
      .filter(time => time != null && !isNaN(time));
    
    const avgResponseTime = responseTimesFiltered.length > 0
      ? responseTimesFiltered.reduce((acc, time) => acc + time, 0) / responseTimesFiltered.length
      : 0;

    // Group by endpoint
    const endpointStats: any = {};
    for (const log of usageLogs) {
      if (!endpointStats[log.endpoint]) {
        endpointStats[log.endpoint] = {
          total: 0,
          successful: 0,
          failed: 0
        };
      }
      endpointStats[log.endpoint].total++;
      if (log.status_code >= 200 && log.status_code < 300) {
        endpointStats[log.endpoint].successful++;
      } else {
        endpointStats[log.endpoint].failed++;
      }
    }

    // Group by date for daily breakdown
    const dailyStats: any = {};
    for (const log of usageLogs) {
      const date = log.request_timestamp.split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          total: 0,
          successful: 0,
          failed: 0
        };
      }
      dailyStats[date].total++;
      if (log.status_code >= 200 && log.status_code < 300) {
        dailyStats[date].successful++;
      } else {
        dailyStats[date].failed++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total_requests: totalRequests,
        successful_requests: successfulRequests,
        failed_requests: failedRequests,
        success_rate: totalRequests > 0 ? parseFloat(((successfulRequests / totalRequests) * 100).toFixed(2)) : 0,
        avg_response_time: parseFloat(avgResponseTime.toFixed(2)),
        date_range: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days
        }
      },
      endpoint_stats: endpointStats,
      daily_stats: dailyStats,
      recent_requests: usageLogs.slice(0, 100) // Last 100 requests
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/mortgage/keys/usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
