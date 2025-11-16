import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lenderId = searchParams.get('lender_id');
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case '5y':
        startDate.setFullYear(now.getFullYear() - 5);
        break;
      case 'all':
        startDate = new Date('2000-01-01');
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Query historical rates
    let query = supabase
      .from('rate_history')
      .select('*')
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true });

    if (lenderId) {
      query = query.eq('lender_id', lenderId);
    }

    const { data: historyData, error } = await query;

    if (error) {
      console.error('Error fetching historical rates:', error);
      throw error;
    }

    // Group by date and aggregate rates
    const groupedData: Record<string, any> = {};

    historyData?.forEach((record) => {
      const date = new Date(record.recorded_at).toISOString().split('T')[0];
      
      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          rate_30y: [],
          rate_15y: [],
          rate_fha: [],
          rate_va: [],
          rate_arm: [],
        };
      }

      // Add rates to corresponding arrays
      if (record.term_years === 30) {
        groupedData[date].rate_30y.push(record.rate);
      } else if (record.term_years === 15) {
        groupedData[date].rate_15y.push(record.rate);
      }

      // Categorize by loan type
      if (record.loan_type === 'fha') {
        groupedData[date].rate_fha.push(record.rate);
      } else if (record.loan_type === 'va') {
        groupedData[date].rate_va.push(record.rate);
      } else if (record.loan_type === 'arm') {
        groupedData[date].rate_arm.push(record.rate);
      }
    });

    // Calculate averages
    const data = Object.values(groupedData).map((day: any) => ({
      date: day.date,
      rate_30y: day.rate_30y.length > 0 
        ? day.rate_30y.reduce((a: number, b: number) => a + b, 0) / day.rate_30y.length 
        : 0,
      rate_15y: day.rate_15y.length > 0 
        ? day.rate_15y.reduce((a: number, b: number) => a + b, 0) / day.rate_15y.length 
        : 0,
      rate_fha: day.rate_fha.length > 0 
        ? day.rate_fha.reduce((a: number, b: number) => a + b, 0) / day.rate_fha.length 
        : 0,
      rate_va: day.rate_va.length > 0 
        ? day.rate_va.reduce((a: number, b: number) => a + b, 0) / day.rate_va.length 
        : 0,
      rate_arm: day.rate_arm.length > 0 
        ? day.rate_arm.reduce((a: number, b: number) => a + b, 0) / day.rate_arm.length 
        : 0,
    }));

    return NextResponse.json({
      data,
      range,
      lender_id: lenderId,
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
    });
  } catch (error) {
    console.error('Error in historical API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}
