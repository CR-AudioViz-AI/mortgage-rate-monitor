// CR AudioViz AI - Mortgage Rate Monitor
// API: Get Lenders with STATE FILTERING  
// Fixed v2: November 18, 2025 11:33 AM EST

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Required for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filters
    const lenderType = searchParams.get('type');
    const state = searchParams.get('state');
    const loanType = searchParams.get('loan_type');
    const term = searchParams.get('term');
    const minRating = searchParams.get('min_rating');
    const sortBy = searchParams.get('sort') || 'rating';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build base query
    let query = supabase
      .from('lenders')
      .select(`
        *,
        lender_service_areas(state),
        mortgage_rates(base_rate, apr, points, loan_type, term)
      `)
      .eq('active', true);

    // Apply lender type filter
    if (lenderType) {
      query = query.eq('lender_type', lenderType);
    }

    // Apply minimum rating filter
    if (minRating) {
      query = query.gte('rating', parseFloat(minRating));
    }

    // Execute query
    const { data: allLenders, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching lenders:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch lenders', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!allLenders) {
      return NextResponse.json({
        data: [],
        count: 0,
        limit,
        offset,
        filters: { state, lender_type: lenderType, loan_type: loanType, term, min_rating: minRating, sort_by: sortBy }
      });
    }

    // STATE FILTERING LOGIC
    let filteredLenders = allLenders;
    
    if (state) {
      const stateUpper = state.toUpperCase();
      filteredLenders = allLenders.filter(lender => {
        // National lenders serve ALL states
        if (lender.lender_type === 'national') {
          return true;
        }
        
        // Regional/state lenders - check service areas
        if (lender.lender_service_areas && Array.isArray(lender.lender_service_areas)) {
          return lender.lender_service_areas.some(
            (area: { state: string }) => area.state === stateUpper
          );
        }
        
        return false;
      });
    }

    // LOAN TYPE & TERM FILTERING
    if (loanType || term) {
      filteredLenders = filteredLenders.map(lender => {
        if (!lender.mortgage_rates || !Array.isArray(lender.mortgage_rates)) {
          return lender;
        }

        let rates = lender.mortgage_rates;
        
        if (loanType) {
          rates = rates.filter((r: any) => r.loan_type === loanType);
        }
        
        if (term) {
          rates = rates.filter((r: any) => r.term === term);
        }

        return { ...lender, mortgage_rates: rates };
      });
    }

    // CALCULATE LOWEST RATES
    const lendersWithRates = filteredLenders.map(lender => {
      let lowestRate = null;
      let lowestApr = null;

      if (lender.mortgage_rates && Array.isArray(lender.mortgage_rates)) {
        const validRates = lender.mortgage_rates
          .filter((r: any) => r.base_rate != null)
          .map((r: any) => parseFloat(r.base_rate));
        
        const validAprs = lender.mortgage_rates
          .filter((r: any) => r.apr != null)
          .map((r: any) => parseFloat(r.apr));

        if (validRates.length > 0) lowestRate = Math.min(...validRates);
        if (validAprs.length > 0) lowestApr = Math.min(...validAprs);
      }

      return { ...lender, lowest_rate: lowestRate, lowest_apr: lowestApr };
    });

    // SORTING
    let sortedLenders = [...lendersWithRates];
    
    if (sortBy === 'rating') {
      sortedLenders.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'rate') {
      sortedLenders.sort((a, b) => {
        if (a.lowest_rate === null) return 1;
        if (b.lowest_rate === null) return -1;
        return a.lowest_rate - b.lowest_rate;
      });
    } else if (sortBy === 'apr') {
      sortedLenders.sort((a, b) => {
        if (a.lowest_apr === null) return 1;
        if (b.lowest_apr === null) return -1;
        return a.lowest_apr - b.lowest_apr;
      });
    } else if (sortBy === 'name') {
      sortedLenders.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'reviews') {
      sortedLenders.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    }

    // PAGINATION
    const paginatedLenders = sortedLenders.slice(offset, offset + limit);

    // CLEAN RESPONSE (remove service_areas array)
    const cleanLenders = paginatedLenders.map(lender => {
      const { lender_service_areas, ...rest } = lender;
      return rest;
    });

    return NextResponse.json({
      data: cleanLenders,
      count: filteredLenders.length,
      limit,
      offset,
      filters: {
        state: state || null,
        lender_type: lenderType || null,
        loan_type: loanType || null,
        term: term || null,
        min_rating: minRating || null,
        sort_by: sortBy
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
