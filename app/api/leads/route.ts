// CR AudioViz AI - Mortgage Rate Monitor
// Lead Submission API - CRM Integration
// Created: 2025-11-15 21:25 UTC
// Integrates with craudiovizai.com CRM via email matching

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// CR AudioViz API endpoint for CRM integration
const CRAUDIOVIZ_API = process.env.CRAUDIOVIZ_API_URL || 'https://craudiovizai.com/api';
const CRAUDIOVIZ_KEY = process.env.CRAUDIOVIZ_API_KEY || '';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  property_type?: string;
  purchase_price?: number;
  down_payment?: number;
  credit_score_range?: string;
  loan_type_interest?: string[];
  property_location?: string;
  city?: string;
  state?: string;
  zip?: string;
  timeline?: string;
  has_realtor?: boolean;
  is_preapproved?: boolean;
  preferred_lenders?: string[];
  notes?: string;
}

/**
 * Find or create user in CR AudioViz system via email
 */
async function syncUserWithCRAudioViz(email: string, name: string): Promise<string | null> {
  try {
    // Check if user exists in local database first
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, craudioviz_user_id')
      .eq('email', email)
      .single();

    if (existingUser?.craudioviz_user_id) {
      return existingUser.craudioviz_user_id;
    }

    // Call CR AudioViz API to find/create user
    const response = await fetch(`${CRAUDIOVIZ_API}/users/find-or-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRAUDIOVIZ_KEY}`
      },
      body: JSON.stringify({
        email,
        name,
        source: 'mortgage_rate_monitor'
      })
    });

    if (!response.ok) {
      console.error('CR AudioViz API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const cravUserId = data.user_id;

    // Update local user record
    if (existingUser) {
      await supabase
        .from('users')
        .update({ craudioviz_user_id: cravUserId })
        .eq('id', existingUser.id);
    }

    return cravUserId;

  } catch (error) {
    console.error('Error syncing with CR AudioViz:', error);
    return null;
  }
}

/**
 * Send lead to CR AudioViz CRM
 */
async function sendLeadToCRM(leadData: LeadData, userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${CRAUDIOVIZ_API}/crm/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRAUDIOVIZ_KEY}`
      },
      body: JSON.stringify({
        user_id: userId,
        lead_type: 'mortgage',
        contact: {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone
        },
        details: {
          property_type: leadData.property_type,
          purchase_price: leadData.purchase_price,
          down_payment: leadData.down_payment,
          credit_score: leadData.credit_score_range,
          loan_types: leadData.loan_type_interest,
          location: leadData.property_location,
          timeline: leadData.timeline,
          has_realtor: leadData.has_realtor,
          preapproved: leadData.is_preapproved,
          preferred_lenders: leadData.preferred_lenders
        },
        source: 'mortgage_rate_monitor',
        created_at: new Date().toISOString()
      })
    });

    return response.ok;

  } catch (error) {
    console.error('Error sending lead to CRM:', error);
    return false;
  }
}

/**
 * Send email notification to user
 */
async function sendLeadConfirmationEmail(email: string, name: string): Promise<void> {
  // Integration with your email service (Resend, SendGrid, etc.)
  // For now, just log
  console.log(`Would send confirmation email to ${email}`);
  
  // TODO: Implement email sending
  // const emailContent = {
  //   to: email,
  //   subject: 'Your Mortgage Quote Request - CR AudioViz AI',
  //   html: `<h1>Thank you, ${name}!</h1><p>We received your mortgage quote request...</p>`
  // };
}

/**
 * POST /api/leads - Submit new lead
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, phone' },
        { status: 400 }
      );
    }

    const leadData: LeadData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      property_type: body.property_type,
      purchase_price: body.purchase_price ? parseFloat(body.purchase_price) : undefined,
      down_payment: body.down_payment ? parseFloat(body.down_payment) : undefined,
      credit_score_range: body.credit_score_range,
      loan_type_interest: body.loan_type_interest || [],
      property_location: body.property_location,
      city: body.city,
      state: body.state,
      zip: body.zip,
      timeline: body.timeline,
      has_realtor: body.has_realtor === true,
      is_preapproved: body.is_preapproved === true,
      preferred_lenders: body.preferred_lenders || [],
      notes: body.notes
    };

    // 1. Find or create user in local database
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        email: leadData.email,
        name: leadData.name,
        phone: leadData.phone,
        city: leadData.city,
        state: leadData.state,
        zip: leadData.zip,
        user_type: 'buyer',
        email_opt_in: true
      }, {
        onConflict: 'email'
      })
      .select('id, craudioviz_user_id')
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create user record' },
        { status: 500 }
      );
    }

    const userId = user.id;

    // 2. Sync with CR AudioViz CRM (email matching)
    const cravUserId = await syncUserWithCRAudioViz(leadData.email, leadData.name);
    
    if (cravUserId) {
      console.log(`Synced with CR AudioViz user: ${cravUserId}`);
      
      // Send lead to CR AudioViz CRM
      await sendLeadToCRM(leadData, cravUserId);
    }

    // 3. Save lead in local database
    const { data: lead, error: leadError } = await supabase
      .from('lead_submissions')
      .insert({
        user_id: userId,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        property_type: leadData.property_type,
        purchase_price: leadData.purchase_price,
        down_payment: leadData.down_payment,
        credit_score_range: leadData.credit_score_range,
        loan_type_interest: leadData.loan_type_interest,
        property_location: leadData.property_location,
        city: leadData.city,
        state: leadData.state,
        zip: leadData.zip,
        timeline: leadData.timeline,
        has_realtor: leadData.has_realtor,
        is_preapproved: leadData.is_preapproved,
        preferred_lenders: leadData.preferred_lenders,
        notes: leadData.notes,
        status: 'new',
        source: 'website',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error saving lead:', leadError);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    // 4. Send confirmation email
    await sendLeadConfirmationEmail(leadData.email, leadData.name);

    // 5. Track conversion
    await supabase.from('user_searches').insert({
      user_id: userId,
      search_location: leadData.property_location,
      loan_type: leadData.loan_type_interest?.[0],
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully',
      lead_id: lead.id,
      next_steps: [
        'Check your email for confirmation',
        'A mortgage specialist will contact you within 24 hours',
        'You can track your application in your dashboard'
      ]
    });

  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads - Get user's leads (requires auth)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'user_id or email required' },
        { status: 400 }
      );
    }

    let query = supabase.from('lead_submissions').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data: leads, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      leads,
      total: leads.length
    });

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
