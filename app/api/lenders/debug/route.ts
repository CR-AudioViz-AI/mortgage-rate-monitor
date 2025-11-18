// CR AudioViz AI - Mortgage Rate Monitor
// TEST ENDPOINT - Debug state filtering
// Created: November 18, 2025 11:41 AM EST

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    
    const debug: any = {
      timestamp: new Date().toISOString(),
      state_param: state,
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    };

    // Test 1: Can we fetch lenders?
    const { data: lenders, error: lenderError } = await supabase
      .from('lenders')
      .select('id, name, lender_type')
      .limit(3);
    
    debug.test1_fetch_lenders = {
      success: !lenderError,
      count: lenders?.length || 0,
      error: lenderError?.message || null
    };

    // Test 2: Does service_areas table exist?
    const { data: serviceAreas, error: serviceError } = await supabase
      .from('lender_service_areas')
      .select('lender_id, state')
      .limit(3);
    
    debug.test2_service_areas_table = {
      success: !serviceError,
      count: serviceAreas?.length || 0,
      error: serviceError?.message || null,
      sample: serviceAreas || null
    };

    // Test 3: Can we query by state?
    if (state) {
      const { data: caAreas, error: caError } = await supabase
        .from('lender_service_areas')
        .select('lender_id')
        .eq('state', state.toUpperCase())
        .limit(5);
      
      debug.test3_query_by_state = {
        success: !caError,
        count: caAreas?.length || 0,
        error: caError?.message || null,
        sample: caAreas || null
      };
    }

    return NextResponse.json({
      status: 'debug_endpoint',
      debug
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Exception caught',
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
