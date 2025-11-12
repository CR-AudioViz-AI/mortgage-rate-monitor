/**
 * GET /api/rates/history
 * 
 * Retrieve historical mortgage rate data for trend analysis.
 * Great for showing rate trends on property listings in realtor app.
 * 
 * Query Parameters:
 * - location_code: Location code (required)
 * - rate_type: Rate type (required)
 * - days: Number of days back (default: 30, max: 365)
 * 
 * @timestamp 2025-11-12T14:47:00Z
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationCode = searchParams.get('location_code');
    const rateType = searchParams.get('rate_type');
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 365);

    // Validate required parameters
    if (!locationCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'location_code is required',
        },
        { status: 400 }
      );
    }

    if (!rateType) {
      return NextResponse.json(
        {
          success: false,
          error: 'rate_type is required',
        },
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Query historical rates
    const { data, error } = await supabase
      .from('mortgage_rates')
      .select('*')
      .eq('location_code', locationCode)
      .eq('rate_type', rateType)
      .gte('scraped_at', startDate.toISOString())
      .lte('scraped_at', endDate.toISOString())
      .order('scraped_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Calculate statistics
    const rates = data.map((r) => r.rate);
    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);

    // Get current vs start comparison
    const currentRate = rates[rates.length - 1];
    const startRate = rates[0];
    const change = currentRate - startRate;
    const changePercent = (change / startRate) * 100;

    return NextResponse.json({
      success: true,
      location_code: locationCode,
      rate_type: rateType,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
      statistics: {
        current: currentRate,
        average: parseFloat(avgRate.toFixed(3)),
        min: minRate,
        max: maxRate,
        change: parseFloat(change.toFixed(3)),
        changePercent: parseFloat(changePercent.toFixed(2)),
      },
      count: data.length,
      history: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] /rates/history error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
