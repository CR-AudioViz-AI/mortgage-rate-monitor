// RateUnlock - Leads API (Automated)
// Real database, lender routing, webhook delivery
// December 24, 2025

import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Helper: Supabase request
async function supabaseRequest(
  endpoint: string,
  method: string = 'GET',
  body?: object,
  headers?: Record<string, string>
) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || 'Supabase request failed');
  }
  return data;
}

// Calculate lead quality score
function calculateQuality(lead: any): { quality: 'high' | 'medium' | 'low'; score: number } {
  let score = 0;
  
  if (lead.phone) score += 20;
  if (lead.first_name && lead.last_name) score += 15;
  if (lead.credit_score) score += 25;
  if (lead.loan_amount >= 200000 && lead.loan_amount <= 500000) score += 20;
  if (lead.home_price && lead.down_payment && (lead.down_payment / lead.home_price) >= 0.1) score += 10;
  if (lead.zip_code) score += 10;
  
  return {
    quality: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low',
    score,
  };
}

// Find matching lenders
async function findMatchingLenders(lead: any) {
  // Get active lenders with capacity
  const lenders = await supabaseRequest(
    `rateunlock_lenders?active=eq.true&current_leads_today=lt.max_leads_per_day&order=bid_amount.desc&limit=10&select=*`
  );
  
  if (!lenders || lenders.length === 0) return [];
  
  const qualityOrder = { high: 3, medium: 2, low: 1 };
  
  return lenders.filter((lender: any) => {
    // Check quality minimum
    if (qualityOrder[lead.quality as keyof typeof qualityOrder] < qualityOrder[lender.quality_minimum as keyof typeof qualityOrder]) {
      return false;
    }
    
    // Check state
    if (!lender.target_states.includes('*') && !lender.target_states.includes(lead.state)) {
      return false;
    }
    
    // Check loan type
    if (!lender.target_loan_types.includes(lead.loan_type)) {
      return false;
    }
    
    // Check loan amount range
    if (lead.loan_amount < lender.min_loan_amount || lead.loan_amount > lender.max_loan_amount) {
      return false;
    }
    
    return true;
  });
}

// Deliver lead to lender webhook
async function deliverToLender(lead: any, lender: any) {
  if (!lender.webhook_url) return null;
  
  try {
    const response = await fetch(lender.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RateUnlock-Signature': 'TODO_IMPLEMENT_HMAC',
      },
      body: JSON.stringify({
        event: 'lead.new',
        lead: {
          id: lead.id,
          email: lead.email,
          phone: lead.phone,
          firstName: lead.first_name,
          lastName: lead.last_name,
          homePrice: lead.home_price,
          loanAmount: lead.loan_amount,
          downPayment: lead.down_payment,
          creditScore: lead.credit_score,
          propertyType: lead.property_type,
          propertyUse: lead.property_use,
          state: lead.state,
          zipCode: lead.zip_code,
          loanType: lead.loan_type,
          quality: lead.quality,
          createdAt: lead.created_at,
        },
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error(`[WEBHOOK] Delivery failed to ${lender.name}:`, error);
    return false;
  }
}

// POST: Submit new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      email,
      phone,
      firstName,
      lastName,
      homePrice,
      loanAmount,
      downPayment,
      creditScore,
      propertyType,
      propertyUse,
      state,
      zipCode,
      loanType,
      loanTerm,
      interestRate,
      monthlyPayment,
      calculator,
      partnerId,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;
    
    // Validate required fields
    if (!email || !homePrice || !loanAmount || !state) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, homePrice, loanAmount, state',
      }, { status: 400 });
    }
    
    // Calculate quality
    const { quality, score } = calculateQuality({
      phone,
      first_name: firstName,
      last_name: lastName,
      credit_score: creditScore,
      loan_amount: loanAmount,
      home_price: homePrice,
      down_payment: downPayment || homePrice - loanAmount,
      zip_code: zipCode,
    });
    
    // Create lead in database
    const leadData = {
      email,
      phone,
      first_name: firstName,
      last_name: lastName,
      home_price: homePrice,
      loan_amount: loanAmount,
      down_payment: downPayment || homePrice - loanAmount,
      down_payment_percent: ((downPayment || homePrice - loanAmount) / homePrice) * 100,
      credit_score: creditScore,
      property_type: propertyType || 'single-family',
      property_use: propertyUse || 'primary',
      state,
      zip_code: zipCode,
      loan_type: loanType || 'conventional',
      loan_term: loanTerm || 30,
      interest_rate: interestRate,
      monthly_payment: monthlyPayment,
      calculator: calculator || 'true-cost',
      partner_id: partnerId || null,
      quality,
      quality_score: score,
      status: 'new',
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    };
    
    const result = await supabaseRequest('rateunlock_leads', 'POST', leadData);
    
    if (!result || result.length === 0) {
      throw new Error('Failed to create lead');
    }
    
    const lead = result[0];
    
    // Find matching lenders
    const matchingLenders = await findMatchingLenders({
      ...lead,
      quality,
    });
    
    let routedLender = null;
    let partnerPayout = 0;
    
    if (matchingLenders.length > 0) {
      // Route to highest bidder
      routedLender = matchingLenders[0];
      partnerPayout = routedLender.bid_amount * 0.5; // 50% to partner
      
      // Update lead with routing info
      await supabaseRequest(
        `rateunlock_leads?id=eq.${lead.id}`,
        'PATCH',
        {
          routed_to_lender_id: routedLender.id,
          lender_bid: routedLender.bid_amount,
          partner_payout: partnerPayout,
          status: 'contacted',
        }
      );
      
      // Increment lender's daily count
      await supabaseRequest(
        `rateunlock_lenders?id=eq.${routedLender.id}`,
        'PATCH',
        {
          current_leads_today: routedLender.current_leads_today + 1,
        }
      );
      
      // Deliver to lender webhook
      await deliverToLender(lead, routedLender);
      
      // Create payout record if partner
      if (partnerId) {
        await supabaseRequest('rateunlock_payouts', 'POST', {
          partner_id: partnerId,
          lead_id: lead.id,
          amount: partnerPayout,
          status: 'pending',
        });
        
        // Update partner stats
        await supabaseRequest(
          `rateunlock_partners?id=eq.${partnerId}`,
          'PATCH',
          {
            total_leads: lead.partner_id ? undefined : 1, // Trigger will handle this
            total_earnings: partnerPayout,
          }
        );
      }
    }
    
    // Track event
    await supabaseRequest('rateunlock_widget_events', 'POST', {
      partner_id: partnerId || null,
      event_type: 'lead_capture',
      calculator: calculator || 'true-cost',
      event_data: {
        leadId: lead.id,
        quality,
        routed: !!routedLender,
        lender: routedLender?.name,
      },
    });
    
    return NextResponse.json({
      success: true,
      leadId: lead.id,
      quality,
      qualityScore: score,
      status: routedLender ? 'routed' : 'queued',
      routing: routedLender ? {
        lenderId: routedLender.id,
        lenderName: routedLender.name,
        bidAmount: routedLender.bid_amount,
      } : null,
      payout: partnerId ? {
        partnerId,
        amount: partnerPayout,
        status: 'pending',
      } : null,
      matchingLenders: matchingLenders.length,
    });
    
  } catch (error: any) {
    console.error('[LEADS] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process lead',
    }, { status: 500 });
  }
}

// GET: Get lead status or partner stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get('id');
  const partnerId = searchParams.get('partner');
  
  try {
    if (leadId) {
      const lead = await supabaseRequest(
        `rateunlock_leads?id=eq.${leadId}&select=id,email,quality,status,lender_bid,partner_payout,payout_status,created_at`
      );
      
      if (!lead || lead.length === 0) {
        return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, lead: lead[0] });
    }
    
    if (partnerId) {
      // Get partner stats
      const partner = await supabaseRequest(
        `rateunlock_partners?id=eq.${partnerId}&select=id,company_name,total_views,total_leads,total_conversions,total_earnings`
      );
      
      if (!partner || partner.length === 0) {
        return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
      }
      
      // Get recent leads
      const leads = await supabaseRequest(
        `rateunlock_leads?partner_id=eq.${partnerId}&order=created_at.desc&limit=10&select=id,email,quality,status,partner_payout,created_at`
      );
      
      // Get pending payouts
      const payouts = await supabaseRequest(
        `rateunlock_payouts?partner_id=eq.${partnerId}&status=eq.pending&select=amount`
      );
      
      const pendingPayout = payouts?.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;
      
      return NextResponse.json({
        success: true,
        partner: partner[0],
        stats: {
          totalLeads: partner[0].total_leads,
          totalEarnings: partner[0].total_earnings,
          pendingPayout,
        },
        recentLeads: leads || [],
      });
    }
    
    // Return API info
    return NextResponse.json({
      success: true,
      api: 'RateUnlock Lead Generation API',
      version: '2.0',
      endpoints: {
        'POST /api/leads': 'Submit a new lead',
        'GET /api/leads?id=xxx': 'Get lead status',
        'GET /api/leads?partner=xxx': 'Get partner stats',
      },
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
