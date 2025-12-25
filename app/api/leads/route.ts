// RateUnlock - Lead Generation API
// Routes leads to lenders, handles bidding and payouts
// December 24, 2025

import { NextRequest, NextResponse } from 'next/server';

// Lead types
interface Lead {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  homePrice: number;
  loanAmount: number;
  downPayment: number;
  creditScore?: string;
  propertyType: string;
  propertyUse: string;
  state: string;
  zipCode?: string;
  loanType: string;
  calculator: string;
  partnerId: string;
  createdAt: string;
  quality: 'high' | 'medium' | 'low';
}

interface LenderBid {
  lenderId: string;
  lenderName: string;
  bidAmount: number;
  maxLeadsPerDay: number;
  currentLeadsToday: number;
  qualityMinimum: 'high' | 'medium' | 'low';
  states: string[];
  loanTypes: string[];
  minLoanAmount: number;
  maxLoanAmount: number;
  active: boolean;
}

// Demo lender bids - in production this comes from database
const LENDER_BIDS: LenderBid[] = [
  {
    lenderId: 'lender_001',
    lenderName: 'National Mortgage Co',
    bidAmount: 150,
    maxLeadsPerDay: 50,
    currentLeadsToday: 23,
    qualityMinimum: 'medium',
    states: ['*'], // All states
    loanTypes: ['conventional', 'fha', 'va'],
    minLoanAmount: 100000,
    maxLoanAmount: 1000000,
    active: true,
  },
  {
    lenderId: 'lender_002',
    lenderName: 'First Home Bank',
    bidAmount: 125,
    maxLeadsPerDay: 30,
    currentLeadsToday: 12,
    qualityMinimum: 'high',
    states: ['FL', 'GA', 'TX', 'CA', 'NY'],
    loanTypes: ['conventional', 'jumbo'],
    minLoanAmount: 200000,
    maxLoanAmount: 2000000,
    active: true,
  },
  {
    lenderId: 'lender_003',
    lenderName: 'Veterans Home Loans',
    bidAmount: 175,
    maxLeadsPerDay: 20,
    currentLeadsToday: 8,
    qualityMinimum: 'medium',
    states: ['*'],
    loanTypes: ['va'],
    minLoanAmount: 50000,
    maxLoanAmount: 750000,
    active: true,
  },
  {
    lenderId: 'lender_004',
    lenderName: 'Regional Credit Union',
    bidAmount: 100,
    maxLeadsPerDay: 100,
    currentLeadsToday: 45,
    qualityMinimum: 'low',
    states: ['FL', 'GA', 'SC', 'NC', 'AL'],
    loanTypes: ['conventional', 'fha'],
    minLoanAmount: 75000,
    maxLoanAmount: 500000,
    active: true,
  },
];

// Calculate lead quality score
function calculateLeadQuality(lead: Partial<Lead>): 'high' | 'medium' | 'low' {
  let score = 0;
  
  // Has phone number (+20)
  if (lead.phone) score += 20;
  
  // Has full name (+15)
  if (lead.firstName && lead.lastName) score += 15;
  
  // Credit score provided (+25)
  if (lead.creditScore) score += 25;
  
  // Loan amount in sweet spot $200k-$500k (+20)
  if (lead.loanAmount && lead.loanAmount >= 200000 && lead.loanAmount <= 500000) score += 20;
  
  // Down payment >= 10% (+10)
  if (lead.homePrice && lead.downPayment && (lead.downPayment / lead.homePrice) >= 0.1) score += 10;
  
  // Has zip code (+10)
  if (lead.zipCode) score += 10;
  
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

// Find matching lenders sorted by bid amount
function findMatchingLenders(lead: Lead): LenderBid[] {
  return LENDER_BIDS
    .filter(lender => {
      // Check if active
      if (!lender.active) return false;
      
      // Check daily limit
      if (lender.currentLeadsToday >= lender.maxLeadsPerDay) return false;
      
      // Check quality minimum
      const qualityOrder = { high: 3, medium: 2, low: 1 };
      if (qualityOrder[lead.quality] < qualityOrder[lender.qualityMinimum]) return false;
      
      // Check state
      if (!lender.states.includes('*') && !lender.states.includes(lead.state)) return false;
      
      // Check loan type
      if (!lender.loanTypes.includes(lead.loanType)) return false;
      
      // Check loan amount range
      if (lead.loanAmount < lender.minLoanAmount || lead.loanAmount > lender.maxLoanAmount) return false;
      
      return true;
    })
    .sort((a, b) => b.bidAmount - a.bidAmount); // Highest bid first
}

// POST: Submit a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.homePrice || !body.loanAmount || !body.state) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, homePrice, loanAmount, state',
      }, { status: 400 });
    }
    
    // Create lead object
    const lead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: body.email,
      phone: body.phone,
      firstName: body.firstName,
      lastName: body.lastName,
      homePrice: body.homePrice,
      loanAmount: body.loanAmount,
      downPayment: body.downPayment || body.homePrice - body.loanAmount,
      creditScore: body.creditScore,
      propertyType: body.propertyType || 'single-family',
      propertyUse: body.propertyUse || 'primary',
      state: body.state,
      zipCode: body.zipCode,
      loanType: body.loanType || 'conventional',
      calculator: body.calculator || 'true-cost',
      partnerId: body.partnerId || 'direct',
      createdAt: new Date().toISOString(),
      quality: 'low', // Will be calculated
    };
    
    // Calculate quality
    lead.quality = calculateLeadQuality(lead);
    
    // Find matching lenders
    const matchingLenders = findMatchingLenders(lead);
    
    // Select winning lender (highest bid)
    const winningLender = matchingLenders[0];
    
    if (!winningLender) {
      // No matching lenders - store for manual review
      console.log('[LEAD] No matching lenders for:', lead.id);
      return NextResponse.json({
        success: true,
        leadId: lead.id,
        status: 'queued',
        message: 'Lead received and queued for review',
        quality: lead.quality,
        matchingLenders: 0,
      });
    }
    
    // Route lead to winning lender
    console.log(`[LEAD] Routing ${lead.id} to ${winningLender.lenderName} at $${winningLender.bidAmount}`);
    
    // In production: 
    // 1. Store lead in database
    // 2. Send to lender's webhook/CRM
    // 3. Credit partner account
    // 4. Update lender's daily count
    
    // Calculate partner payout (50% of lender bid for Pro partners)
    const partnerPayout = winningLender.bidAmount * 0.5;
    
    return NextResponse.json({
      success: true,
      leadId: lead.id,
      status: 'routed',
      quality: lead.quality,
      routing: {
        lenderId: winningLender.lenderId,
        lenderName: winningLender.lenderName,
        bidAmount: winningLender.bidAmount,
      },
      payout: {
        partnerId: lead.partnerId,
        amount: partnerPayout,
        status: 'pending', // Pending until lender confirms receipt
      },
      matchingLenders: matchingLenders.length,
    });
    
  } catch (error) {
    console.error('[LEAD] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process lead',
    }, { status: 500 });
  }
}

// GET: Get lead status or list leads
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get('id');
  const partnerId = searchParams.get('partner');
  
  // If specific lead requested
  if (leadId) {
    // In production: fetch from database
    return NextResponse.json({
      success: true,
      lead: {
        id: leadId,
        status: 'routed',
        quality: 'high',
        createdAt: new Date().toISOString(),
        // ... other fields
      },
    });
  }
  
  // If partner leads requested
  if (partnerId) {
    // In production: fetch from database
    return NextResponse.json({
      success: true,
      partner: partnerId,
      stats: {
        totalLeads: 342,
        highQuality: 89,
        mediumQuality: 178,
        lowQuality: 75,
        routed: 298,
        pending: 44,
        totalEarnings: 14900,
        pendingPayout: 2200,
      },
      recentLeads: [
        { id: 'lead_001', quality: 'high', status: 'routed', payout: 75, createdAt: '2025-12-24T10:00:00Z' },
        { id: 'lead_002', quality: 'medium', status: 'routed', payout: 50, createdAt: '2025-12-24T09:30:00Z' },
        // ...
      ],
    });
  }
  
  // Return API info
  return NextResponse.json({
    success: true,
    api: 'RateUnlock Lead Generation API',
    version: '1.0',
    endpoints: {
      'POST /api/leads': 'Submit a new lead',
      'GET /api/leads?id=xxx': 'Get lead status',
      'GET /api/leads?partner=xxx': 'Get partner stats',
    },
    qualityLevels: {
      high: 'Full contact info, credit score, optimal loan range',
      medium: 'Email + some additional info',
      low: 'Email only',
    },
    payouts: {
      high: '$50-150 per lead',
      medium: '$25-75 per lead',
      low: '$10-25 per lead',
    },
  });
}
