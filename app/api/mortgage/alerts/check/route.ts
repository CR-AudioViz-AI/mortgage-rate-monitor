import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: alerts } = await supabase
      .from('rate_alerts')
      .select('*')
      .eq('active', true);

    let triggered = 0;
    for (const alert of alerts || []) {
      const { data: rate } = await supabase
        .from('mortgage_rates_current')
        .select('rate')
        .eq('loan_type', alert.loan_type)
        .single();

      if (rate && ((alert.condition === 'below' && rate.rate <= alert.target_rate) ||
                   (alert.condition === 'above' && rate.rate >= alert.target_rate))) {
        await supabase
          .from('rate_alerts')
          .update({ active: false, triggered_at: new Date().toISOString() })
          .eq('id', alert.id);
        triggered++;
      }
    }

    return NextResponse.json({ success: true, checked: alerts?.length || 0, triggered });
  } catch (error) {
    console.error('[CRON] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
