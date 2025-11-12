/**
 * GET /api/rates/latest
 * 
 * Retrieve the latest mortgage rates for specified locations.
 * Perfect for integration with realtor app property listings.
 * 
 * Query Parameters:
 * - location_code: Filter by location code (optional)
 * - rate_type: Filter by rate type (optional)
 * - limit: Number of results (default: 100)
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
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    let query = supabase
      .from('latest_rates_view')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (locationCode) {
      query = query.eq('location_code', locationCode);
    }

    if (rateType) {
      query = query.eq('rate_type', rateType);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      rates: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] /rates/latest error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
