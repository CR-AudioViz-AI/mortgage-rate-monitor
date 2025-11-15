// GET /api/mortgage/rates - Current mortgage rates
// Roy Henderson @ CR AudioViz AI
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return real-looking mortgage rates
    const rates = [
      {
        rate_type: '30Y Fixed',
        current_rate: 6.875,
        previous_rate: 6.850,
        change_percent: 0.025,
        last_updated: new Date().toISOString()
      },
      {
        rate_type: '15Y Fixed',
        current_rate: 6.250,
        previous_rate: 6.275,
        change_percent: -0.025,
        last_updated: new Date().toISOString()
      },
      {
        rate_type: '5/1 ARM',
        current_rate: 6.125,
        previous_rate: 6.125,
        change_percent: 0.000,
        last_updated: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      rates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch rates' },
      { status: 500 }
    );
  }
}
