import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const state = searchParams.get('state');
    const loanType = searchParams.get('loanType');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('lenders')
      .select('*', { count: 'exact' })
      .eq('active', true)
      .order('name', { ascending: true })
      .limit(limit);

    if (search) query = query.ilike('name', `%${search}%`);
    if (state) query = query.contains('states_served', [state]);
    if (loanType) query = query.contains('loan_types', [loanType]);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error in GET /api/lenders:', error);
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    return NextResponse.json({ data, count, limit });
  } catch (error) {
    console.error('Error in GET /api/lenders:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
