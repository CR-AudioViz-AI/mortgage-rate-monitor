// RateUnlock - Partner Registration API
// Automated: Supabase + Stripe + Resend
// December 24, 2025

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Supabase config
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Plan pricing (Stripe Price IDs would go here in production)
const PLAN_PRICES: Record<string, { monthly: number; name: string }> = {
  free: { monthly: 0, name: 'Free' },
  basic: { monthly: 9900, name: 'Basic' }, // $99
  pro: { monthly: 29900, name: 'Pro' }, // $299
  enterprise: { monthly: 200000, name: 'Enterprise' }, // $2000
};

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
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Supabase request failed');
  }
  
  return res.json().catch(() => null);
}

// POST: Register new partner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      companyName,
      institutionType,
      website,
      firstName,
      lastName,
      email,
      phone,
      title,
      plan,
      subdomain,
      primaryColor,
      secondaryColor,
    } = body;
    
    // Validate required fields
    if (!companyName || !institutionType || !firstName || !lastName || !email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 });
    }
    
    // Check if email already exists
    const existing = await supabaseRequest(
      `rateunlock_partners?email=eq.${encodeURIComponent(email)}&select=id`
    );
    
    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Email already registered',
      }, { status: 400 });
    }
    
    // Check subdomain availability
    if (subdomain) {
      const existingSubdomain = await supabaseRequest(
        `rateunlock_partners?subdomain=eq.${encodeURIComponent(subdomain)}&select=id`
      );
      
      if (existingSubdomain && existingSubdomain.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'Subdomain already taken',
        }, { status: 400 });
      }
    }
    
    // Create Stripe customer (if paid plan)
    let stripeCustomerId: string | null = null;
    let stripeSubscriptionId: string | null = null;
    
    if (plan !== 'free' && PLAN_PRICES[plan]) {
      const customer = await stripe.customers.create({
        email,
        name: `${firstName} ${lastName}`,
        metadata: {
          company: companyName,
          institutionType,
          plan,
        },
      });
      stripeCustomerId = customer.id;
      
      // Note: In production, you'd create a checkout session or subscription here
      // For now, we just create the customer
    }
    
    // Create partner in Supabase
    const partnerData = {
      company_name: companyName,
      institution_type: institutionType,
      website,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      job_title: title,
      plan: plan || 'free',
      subdomain: subdomain || null,
      primary_color: primaryColor || '#10b981',
      secondary_color: secondaryColor || '#8b5cf6',
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      status: 'active',
    };
    
    const result = await supabaseRequest('rateunlock_partners', 'POST', partnerData);
    
    if (!result || result.length === 0) {
      throw new Error('Failed to create partner');
    }
    
    const partner = result[0];
    
    // Send welcome email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'RateUnlock <partners@rateunlock.com>',
            to: email,
            subject: `Welcome to RateUnlock, ${firstName}!`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #10b981;">Welcome to RateUnlock! 🎉</h1>
                <p>Hi ${firstName},</p>
                <p>Thank you for registering ${companyName} as a RateUnlock partner!</p>
                <p><strong>Your Partner Details:</strong></p>
                <ul>
                  <li>Plan: ${PLAN_PRICES[plan]?.name || 'Free'}</li>
                  <li>Subdomain: ${subdomain ? `${subdomain}.rateunlock.com` : 'Not configured'}</li>
                  <li>API Key: ${partner.api_key}</li>
                </ul>
                <p><strong>Next Steps:</strong></p>
                <ol>
                  <li><a href="https://rateunlock.com/partners/dashboard">Access your dashboard</a></li>
                  <li><a href="https://rateunlock.com/widgets">Get your embed codes</a></li>
                  <li>Start capturing leads!</li>
                </ol>
                <p>Questions? Reply to this email or visit our <a href="https://rateunlock.com/help">help center</a>.</p>
                <p>Best,<br>The RateUnlock Team</p>
              </div>
            `,
          }),
        });
      } catch (emailError) {
        console.error('[RESEND] Email failed:', emailError);
      }
    }
    
    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        companyName: partner.company_name,
        email: partner.email,
        plan: partner.plan,
        subdomain: partner.subdomain,
        apiKey: partner.api_key,
        dashboardUrl: 'https://rateunlock.com/partners/dashboard',
        widgetsUrl: 'https://rateunlock.com/widgets',
      },
      message: 'Registration successful! Check your email for next steps.',
    });
    
  } catch (error: any) {
    console.error('[PARTNER REGISTER] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Registration failed',
    }, { status: 500 });
  }
}

// GET: Get partner by ID or API key
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const apiKey = searchParams.get('apiKey');
  const email = searchParams.get('email');
  
  try {
    let query = 'rateunlock_partners?';
    
    if (id) {
      query += `id=eq.${id}`;
    } else if (apiKey) {
      query += `api_key=eq.${apiKey}`;
    } else if (email) {
      query += `email=eq.${encodeURIComponent(email)}`;
    } else {
      return NextResponse.json({
        success: false,
        error: 'Provide id, apiKey, or email',
      }, { status: 400 });
    }
    
    query += '&select=id,company_name,institution_type,first_name,last_name,email,plan,subdomain,primary_color,secondary_color,status,total_views,total_leads,total_conversions,total_earnings,created_at';
    
    const result = await supabaseRequest(query);
    
    if (!result || result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Partner not found',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      partner: result[0],
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
