// POST /api/mortgage/alerts - Create rate alert
// Roy Henderson @ CR AudioViz AI
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, rate_type, threshold_rate, direction } = body;

    // Validate input
    if (!email || !rate_type || !threshold_rate || !direction) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, save to database
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Alert created successfully',
      alert: {
        id: Math.random().toString(36).substr(2, 9),
        email,
        rate_type,
        threshold_rate,
        direction,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
