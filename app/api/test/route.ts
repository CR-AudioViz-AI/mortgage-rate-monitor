// SIMPLE TEST ENDPOINT
// Just returns whatever params it receives
// Created: November 19, 2025 12:19 AM EST

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    
    return NextResponse.json({
      test: 'success',
      state_param_received: state,
      url: request.url,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      test: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
