// RateUnlock - Outreach API (Automated)
// Campaign management + Resend email delivery
// December 24, 2025

import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

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
  
  return res.json().catch(() => null);
}

// Helper: Send email via Resend
async function sendEmail(to: string, subject: string, html: string, from: string = 'RateUnlock <partners@rateunlock.com>') {
  if (!RESEND_API_KEY) {
    console.log('[RESEND] API key not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }
  
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    
    const data = await res.json();
    return { success: res.ok, id: data.id, error: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Helper: Replace template variables
function renderTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

// GET: List lenders, templates, or campaigns
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    // Get email templates
    if (action === 'templates') {
      const templates = await supabaseRequest(
        'rateunlock_email_templates?active=eq.true&select=id,name,subject,variables,category'
      );
      
      return NextResponse.json({
        success: true,
        templates: templates || [],
      });
    }
    
    // Get campaigns
    if (action === 'campaigns') {
      const campaigns = await supabaseRequest(
        'rateunlock_campaigns?order=created_at.desc&limit=20&select=*'
      );
      
      return NextResponse.json({
        success: true,
        campaigns: campaigns || [],
      });
    }
    
    // Search lenders
    const state = searchParams.get('state');
    const type = searchParams.get('type');
    const minLoans = parseInt(searchParams.get('minLoans') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let query = 'rateunlock_lenders?';
    const filters: string[] = [];
    
    if (state) filters.push(`state=eq.${state}`);
    if (type) filters.push(`lender_type=eq.${type}`);
    if (minLoans > 0) filters.push(`total_loans=gte.${minLoans}`);
    
    query += filters.join('&');
    if (filters.length > 0) query += '&';
    query += `order=total_loans.desc&limit=${limit}&select=id,lei,name,state,lender_type,total_loans,approval_rate,avg_loan_amount,website,contact_email`;
    
    const lenders = await supabaseRequest(query);
    
    return NextResponse.json({
      success: true,
      count: lenders?.length || 0,
      lenders: lenders || [],
      filters: { state, type, minLoans, limit },
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// POST: Create campaign, send emails, generate from template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    // Generate email from template
    if (action === 'generate-email') {
      const { templateId, variables } = body;
      
      const templates = await supabaseRequest(
        `rateunlock_email_templates?id=eq.${templateId}&select=*`
      );
      
      if (!templates || templates.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Template not found',
        }, { status: 404 });
      }
      
      const template = templates[0];
      const subject = renderTemplate(template.subject, variables || {});
      const emailBody = renderTemplate(template.body, variables || {});
      
      return NextResponse.json({
        success: true,
        email: {
          subject,
          body: emailBody,
          templateId,
        },
      });
    }
    
    // Create campaign
    if (action === 'create-campaign') {
      const { name, description, targetSegment, templateId, lenderIds, scheduleTime, senderName, senderEmail } = body;
      
      // Create campaign
      const campaign = await supabaseRequest('rateunlock_campaigns', 'POST', {
        name,
        description,
        target_segment: targetSegment,
        template_id: templateId,
        status: 'draft',
        target_count: lenderIds?.length || 0,
        schedule_time: scheduleTime,
        sender_name: senderName || 'RateUnlock Partner Team',
        sender_email: senderEmail || 'partners@rateunlock.com',
      });
      
      if (!campaign || campaign.length === 0) {
        throw new Error('Failed to create campaign');
      }
      
      const campaignId = campaign[0].id;
      
      // Add recipients if lenderIds provided
      if (lenderIds && lenderIds.length > 0) {
        // Get lender details
        const lenders = await supabaseRequest(
          `rateunlock_lenders?id=in.(${lenderIds.join(',')})&select=id,name,contact_email`
        );
        
        if (lenders && lenders.length > 0) {
          for (const lender of lenders) {
            if (lender.contact_email) {
              await supabaseRequest('rateunlock_campaign_recipients', 'POST', {
                campaign_id: campaignId,
                lender_id: lender.id,
                email: lender.contact_email,
                company_name: lender.name,
                status: 'pending',
              });
            }
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        campaign: {
          id: campaignId,
          name,
          targetCount: lenderIds?.length || 0,
          status: 'draft',
        },
      });
    }
    
    // Send campaign emails
    if (action === 'send-campaign') {
      const { campaignId } = body;
      
      // Get campaign
      const campaigns = await supabaseRequest(
        `rateunlock_campaigns?id=eq.${campaignId}&select=*`
      );
      
      if (!campaigns || campaigns.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Campaign not found',
        }, { status: 404 });
      }
      
      const campaign = campaigns[0];
      
      // Get template
      const templates = await supabaseRequest(
        `rateunlock_email_templates?id=eq.${campaign.template_id}&select=*`
      );
      
      if (!templates || templates.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Template not found',
        }, { status: 404 });
      }
      
      const template = templates[0];
      
      // Get pending recipients
      const recipients = await supabaseRequest(
        `rateunlock_campaign_recipients?campaign_id=eq.${campaignId}&status=eq.pending&select=*`
      );
      
      if (!recipients || recipients.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No pending recipients',
        }, { status: 400 });
      }
      
      let sent = 0;
      let failed = 0;
      
      for (const recipient of recipients) {
        const variables = {
          first_name: recipient.first_name || 'there',
          company_name: recipient.company_name || 'your company',
          sender_name: campaign.sender_name,
        };
        
        const subject = renderTemplate(template.subject, variables);
        const html = `<div style="font-family: sans-serif; white-space: pre-line;">${renderTemplate(template.body, variables)}</div>`;
        
        const result = await sendEmail(
          recipient.email,
          subject,
          html,
          `${campaign.sender_name} <${campaign.sender_email}>`
        );
        
        if (result.success) {
          sent++;
          await supabaseRequest(
            `rateunlock_campaign_recipients?id=eq.${recipient.id}`,
            'PATCH',
            {
              status: 'sent',
              sent_at: new Date().toISOString(),
            }
          );
        } else {
          failed++;
          console.error(`[OUTREACH] Failed to send to ${recipient.email}:`, result.error);
        }
        
        // Rate limit: 100ms between emails
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Update campaign stats
      await supabaseRequest(
        `rateunlock_campaigns?id=eq.${campaignId}`,
        'PATCH',
        {
          status: 'active',
          sent_count: campaign.sent_count + sent,
        }
      );
      
      return NextResponse.json({
        success: true,
        results: {
          sent,
          failed,
          total: recipients.length,
        },
      });
    }
    
    // Send single email
    if (action === 'send-email') {
      const { to, subject, body: emailBody, templateId, variables } = body;
      
      let finalSubject = subject;
      let finalBody = emailBody;
      
      // Use template if provided
      if (templateId) {
        const templates = await supabaseRequest(
          `rateunlock_email_templates?id=eq.${templateId}&select=*`
        );
        
        if (templates && templates.length > 0) {
          const template = templates[0];
          finalSubject = renderTemplate(template.subject, variables || {});
          finalBody = renderTemplate(template.body, variables || {});
        }
      }
      
      const html = `<div style="font-family: sans-serif; white-space: pre-line;">${finalBody}</div>`;
      const result = await sendEmail(to, finalSubject, html);
      
      return NextResponse.json({
        success: result.success,
        emailId: result.id,
        error: result.error,
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Unknown action. Use: generate-email, create-campaign, send-campaign, send-email',
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('[OUTREACH] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Request failed',
    }, { status: 500 });
  }
}
