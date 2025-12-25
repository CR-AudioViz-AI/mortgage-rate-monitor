// RateUnlock - Partner Registration API
// Automated: Supabase + Stripe REST API + Resend
// December 25, 2025 - No external npm dependencies

import { NextRequest, NextResponse } from 'next/server';

// Supabase config
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Stripe config
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Resend config
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Plan pricing
const PLAN_PRICES: Record<string, { monthly: number; name: string }> = {
  free: { monthly: 0, name: 'Free' },
  basic: { monthly: 9900, name: 'Basic ($99/mo)' },
  pro: { monthly: 29900, name: 'Pro ($299/mo)' },
  enterprise: { monthly: 200000, name: 'Enterprise' },
};

// Helper: Supabase request
async function supabaseRequest(
  endpoint: string,
  method: string = 'GET',
  body?: object
) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Supabase request failed');
  }
  
  return res.json().catch(() => null);
}

// Helper: Create Stripe customer via REST API
async function createStripeCustomer(email: string, name: string, metadata: Record<string, string>) {
  if (!STRIPE_SECRET_KEY) {
    console.log('[STRIPE] API key not configured');
    return null;
  }
  
  try {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('name', name);
    Object.entries(metadata).forEach(([key, value]) => {
      params.append(`metadata[${key}]`, value);
    });
    
    const res = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    if (!res.ok) {
      const error = await res.json();
      console.error('[STRIPE] Customer creation failed:', error);
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('[STRIPE] Error:', error);
    return null;
  }
}

// Helper: Send email via Resend
async function sendWelcomeEmail(to: string, firstName: string, companyName: string, plan: string, subdomain: string | null, apiKey: string) {
  if (!RESEND_API_KEY) {
    console.log('[RESEND] API key not configured');
    return;
  }
  
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RateUnlock <partners@rateunlock.com>',
        to,
        subject: `Welcome to RateUnlock, ${firstName}!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin: 0;">Welcome to RateUnlock! 🎉</h1>
            </div>
            
            <p>Hi ${firstName},</p>
            
            <p>Thank you for registering <strong>${companyName}</strong> as a RateUnlock partner!</p>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e293b;">Your Partner Details</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong>Plan:</strong> ${PLAN_PRICES[plan]?.name || 'Free'}
                </li>
                <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong>Subdomain:</strong> ${subdomain ? `${subdomain}.rateunlock.com` : 'Not configured'}
                </li>
                <li style="padding: 8px 0;">
                  <strong>API Key:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${apiKey.substring(0, 16)}...</code>
                </li>
              </ul>
            </div>
            
            <h3 style="color: #1e293b;">Next Steps</h3>
            <ol style="line-height: 1.8;">
              <li><a href="https://rateunlock.com/partners/dashboard" style="color: #10b981;">Access your dashboard</a> to view analytics</li>
              <li><a href="https://rateunlock.com/widgets" style="color: #10b981;">Get your embed codes</a> to add calculators to your site</li>
              <li>Start capturing leads and earning commissions!</li>
            </ol>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b;">
              <p>Questions? Reply to this email or visit our <a href="https://rateunlock.com/help" style="color: #10b981;">help center</a>.</p>
              <p style="margin-top: 20px;">
                <strong>The RateUnlock Team</strong><br>
                <a href="https://rateunlock.com" style="color: #10b981;">rateunlock.com</a>
              </p>
            </div>
          </div>
        `,
      }),
    });
  } catch (error) {
    console.error('[RESEND] Email failed:', error);
  }
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
        error: 'Missing required fields: companyName, institutionType, firstName, lastName, email',
      }, { status: 400 });
    }
    
    // Check if email already exists
    const existing = await supabaseRequest(
      `rateunlock_partners?email=eq.${encodeURIComponent(email)}&select=id`
    );
    
    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Email already registered. Please login or use a different email.',
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
          error: 'Subdomain already taken. Please choose a different one.',
        }, { status: 400 });
      }
    }
    
    // Create Stripe customer for paid plans
    let stripeCustomerId: string | null = null;
    
    if (plan && plan !== 'free' && PLAN_PRICES[plan]) {
      const customer = await createStripeCustomer(
        email,
        `${firstName} ${lastName}`,
        {
          company: companyName,
          institutionType: institutionType,
          plan: plan,
        }
      );
      
      if (customer) {
        stripeCustomerId = customer.id;
      }
    }
    
    // Create partner in Supabase
    const partnerData = {
      company_name: companyName,
      institution_type: institutionType,
      website: website || null,
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      phone: phone || null,
      job_title: title || null,
      plan: plan || 'free',
      subdomain: subdomain || null,
      primary_color: primaryColor || '#10b981',
      secondary_color: secondaryColor || '#8b5cf6',
      stripe_customer_id: stripeCustomerId,
      status: 'active',
    };
    
    const result = await supabaseRequest('rateunlock_partners', 'POST', partnerData);
    
    if (!result || result.length === 0) {
      throw new Error('Failed to create partner record');
    }
    
    const partner = result[0];
    
    // Send welcome email
    await sendWelcomeEmail(
      email,
      firstName,
      companyName,
      plan || 'free',
      subdomain,
      partner.api_key
    );
    
    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        companyName: partner.company_name,
        email: partner.email,
        plan: partner.plan,
        subdomain: partner.subdomain,
        apiKey: partner.api_key,
        primaryColor: partner.primary_color,
        secondaryColor: partner.secondary_color,
      },
      links: {
        dashboard: 'https://rateunlock.com/partners/dashboard',
        widgets: 'https://rateunlock.com/widgets',
        embed: `https://rateunlock.com/embed/true-cost?partner=${partner.id}`,
      },
      message: 'Registration successful! Check your email for next steps.',
    });
    
  } catch (error: unknown) {
    console.error('[PARTNER REGISTER] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}

// GET: Get partner by ID, API key, or email
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
      query += `email=eq.${encodeURIComponent(email.toLowerCase())}`;
    } else {
      // Return API documentation
      return NextResponse.json({
        success: true,
        api: 'RateUnlock Partner Registration API',
        version: '2.0',
        endpoints: {
          'POST /api/partners/register': {
            description: 'Register a new partner',
            body: {
              companyName: 'string (required)',
              institutionType: 'bank|credit-union|mortgage-broker|real-estate|fintech|media|other (required)',
              firstName: 'string (required)',
              lastName: 'string (required)',
              email: 'string (required)',
              phone: 'string (optional)',
              title: 'string (optional)',
              plan: 'free|basic|pro|enterprise (default: free)',
              subdomain: 'string (optional)',
              primaryColor: 'hex color (default: #10b981)',
              secondaryColor: 'hex color (default: #8b5cf6)',
            },
          },
          'GET /api/partners/register?id=xxx': 'Get partner by ID',
          'GET /api/partners/register?apiKey=xxx': 'Get partner by API key',
          'GET /api/partners/register?email=xxx': 'Get partner by email',
        },
        pricing: PLAN_PRICES,
      });
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
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}
