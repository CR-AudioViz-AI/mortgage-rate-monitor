// RateUnlock - Embed API Route
// Serves embeddable calculator widgets for partners
// December 24, 2025

import { NextRequest, NextResponse } from 'next/server';

// Partner configuration types
interface PartnerConfig {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  callbackUrl?: string;
  leadCapture?: boolean;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  allowedDomains?: string[];
  createdAt: string;
}

// In production, this would come from database
const PARTNER_CONFIGS: Record<string, PartnerConfig> = {
  'demo': {
    id: 'demo',
    name: 'Demo Partner',
    tier: 'free',
    leadCapture: false,
    createdAt: new Date().toISOString(),
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const partnerId = searchParams.get('partner') || 'demo';
  const calculator = searchParams.get('calc') || 'true-cost';
  const theme = searchParams.get('theme') || 'dark';
  const width = searchParams.get('width') || '100%';
  const height = searchParams.get('height') || '600';
  
  // Get partner config (or use defaults)
  const partner = PARTNER_CONFIGS[partnerId] || PARTNER_CONFIGS['demo'];
  
  // Build embed URL
  const embedUrl = `https://rateunlock.com/embed/${calculator}?partner=${partnerId}&theme=${theme}`;
  
  // Generate embed code
  const embedCode = `<!-- RateUnlock ${calculator} Calculator -->
<iframe 
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  scrolling="no"
  style="border: none; border-radius: 16px; overflow: hidden;"
  allow="clipboard-write"
  title="RateUnlock ${calculator} Calculator"
></iframe>
<script>
  // Optional: Auto-resize iframe
  window.addEventListener('message', function(e) {
    if (e.data.type === 'rateunlock-resize') {
      var iframe = document.querySelector('iframe[src*="rateunlock.com"]');
      if (iframe) iframe.style.height = e.data.height + 'px';
    }
  });
</script>
<!-- Powered by RateUnlock.com -->`;

  // Return embed configuration
  return NextResponse.json({
    success: true,
    partner: {
      id: partner.id,
      name: partner.name,
      tier: partner.tier,
    },
    embed: {
      calculator,
      url: embedUrl,
      code: embedCode,
      dimensions: { width, height },
      theme,
    },
    availableCalculators: [
      { id: 'true-cost', name: 'True Cost Calculator', description: 'Complete mortgage cost analysis' },
      { id: 'affordability', name: 'Affordability Calculator', description: 'How much home can you afford?' },
      { id: 'arm-vs-fixed', name: 'ARM vs Fixed', description: 'Compare loan types' },
      { id: 'rent-vs-buy', name: 'Rent vs Buy', description: 'Should you rent or buy?' },
      { id: 'refinance', name: 'Refinance Analyzer', description: 'Is refinancing worth it?' },
      { id: 'closing-costs', name: 'Closing Costs', description: 'Estimate closing costs' },
      { id: 'rate-lock', name: 'Rate Lock Advisor', description: 'When to lock your rate' },
      { id: 'down-payment', name: 'Down Payment Help', description: 'Find assistance programs' },
    ],
    themes: ['dark', 'light', 'auto'],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, event, data } = body;
    
    // Track embed events (views, interactions, leads)
    console.log(`[EMBED EVENT] Partner: ${partnerId}, Event: ${event}`, data);
    
    // In production: Store in database, trigger webhooks, etc.
    
    return NextResponse.json({ 
      success: true, 
      message: 'Event tracked',
      eventId: `evt_${Date.now()}`,
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid request' 
    }, { status: 400 });
  }
}
