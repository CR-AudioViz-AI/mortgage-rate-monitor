// Javari AI Mortgage Rate Monitoring - Historical Rates API
// Phase 3C: Historical Analytics with Trend Analysis
// Created: 2025-11-14 22:38 UTC
// Roy Henderson, CEO @ CR AudioViz AI, LLC

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Calculate statistics for a data series
function calculateStatistics(data: number[]) {
  if (data.length === 0) return null;

  const sorted = [...data].sort((a, b) => a - b);
  const sum = data.reduce((acc, val) => acc + val, 0);
  const mean = sum / data.length;
  
  const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: parseFloat(mean.toFixed(4)),
    median: sorted[Math.floor(sorted.length / 2)],
    stdDev: parseFloat(stdDev.toFixed(4)),
    count: data.length
  };
}

// Calculate period-over-period changes
function calculateChanges(historicalData: any[], periods: number[]) {
  const changes: any = {};
  
  for (const period of periods) {
    if (historicalData.length >= period) {
      const current = historicalData[historicalData.length - 1].rate;
      const past = historicalData[historicalData.length - period].rate;
      const change = current - past;
      const changePercent = (change / past) * 100;
      
      changes[`${period}d`] = {
        absolute: parseFloat(change.toFixed(4)),
        percent: parseFloat(changePercent.toFixed(2)),
        from: past,
        to: current
      };
    }
  }
  
  return changes;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rateType = searchParams.get('rate_type') || '30y_fixed';
    const interval = searchParams.get('interval') || 'daily';
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 365;

    // Validate rate_type
    const validRateTypes = ['30y_fixed', '15y_fixed', '5_1_arm'];
    if (!validRateTypes.includes(rateType)) {
      return NextResponse.json(
        { error: 'Invalid rate_type. Must be one of: 30y_fixed, 15y_fixed, 5_1_arm' },
        { status: 400 }
      );
    }

    // Validate interval
    const validIntervals = ['daily', 'weekly', 'monthly'];
    if (!validIntervals.includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid interval. Must be one of: daily, weekly, monthly' },
        { status: 400 }
      );
    }

    // Validate days
    if (days < 1 || days > 3650) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 3650 (10 years)' },
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Query historical data from database with caching
    let query = supabase
      .from('mortgage_rate_history')
      .select('*')
      .eq('rate_type', rateType)
      .gte('observation_date', startDate.toISOString().split('T')[0])
      .lte('observation_date', endDate.toISOString().split('T')[0])
      .order('observation_date', { ascending: true });

    const { data: historicalData, error } = await query;

    if (error) {
      console.error('Error fetching historical data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch historical data' },
        { status: 500 }
      );
    }

    if (!historicalData || historicalData.length === 0) {
      return NextResponse.json({
        success: true,
        rate_type: rateType,
        interval,
        days,
        data: [],
        statistics: null,
        trends: null,
        message: 'No historical data available for the specified period'
      });
    }

    // Apply interval sampling if not daily
    let sampledData = historicalData;
    if (interval === 'weekly') {
      sampledData = historicalData.filter((_, index) => index % 7 === 0);
    } else if (interval === 'monthly') {
      sampledData = historicalData.filter((_, index) => index % 30 === 0);
    }

    // Calculate statistics
    const rates = sampledData.map(d => d.rate);
    const statistics = calculateStatistics(rates);

    // Calculate trends (30, 90, 365 day changes)
    const trends = calculateChanges(historicalData, [30, 90, 365]);

    // Format data for response
    const formattedData = sampledData.map(d => ({
      date: d.observation_date,
      rate: d.rate
    }));

    // Calculate volatility (annualized standard deviation)
    const volatility = statistics ? 
      parseFloat((statistics.stdDev * Math.sqrt(252)).toFixed(4)) : 
      null;

    return NextResponse.json({
      success: true,
      rate_type: rateType,
      interval,
      days,
      data: formattedData,
      statistics: {
        ...statistics,
        volatility
      },
      trends,
      meta: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_observations: historicalData.length,
        sampled_observations: sampledData.length
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/mortgage/rates/historical:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
