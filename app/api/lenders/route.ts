// CR AudioViz AI - Mortgage Rate Monitor
// API: Get Lenders with STATE FILTERING
// Fixed v4: Detailed error logging - November 18, 2025 11:43 AM EST

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filters
    const lenderType = searchParams.get('type');
    const state = searchParams.get('state');
    const loanType = searchParams.get('loan_type');
    const term = searchParams.get('term');
    const minRating = searchParams.get('min_rating');
    const sortBy = searchParams.get('sort') || 'rating';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('[API] Request params:', { state, lenderType, loanType, term, minRating, sortBy, limit, offset });

    // STEP 1: Get all lenders
    let lenderQuery = supabase
      .from('lenders')
      .select('*')
      .eq('active', true);

    if (lenderType) {
      lenderQuery = lenderQuery.eq('lender_type', lenderType);
    }

    if (minRating) {
      lenderQuery = lenderQuery.gte('rating', parseFloat(minRating));
    }

    const { data: lenders, error: lenderError } = await lenderQuery;

    if (lenderError) {
      console.error('[API] Error fetching lenders:', lenderError);
      return NextResponse.json(
        { error: 'Failed to fetch lenders', details: lenderError.message, code: lenderError.code },
        { status: 500 }
      );
    }

    console.log('[API] Fetched lenders:', lenders?.length || 0);

    if (!lenders || lenders.length === 0) {
      return NextResponse.json({
        data: [],
        count: 0,
        limit,
        offset,
        filters: { state, lender_type: lenderType, loan_type: loanType, term, min_rating: minRating, sort_by: sortBy }
      });
    }

    // STEP 2: If state filter, get service areas separately
    let filteredLenders = lenders;
    
    if (state) {
      console.log('[API] Filtering by state:', state);
      const stateUpper = state.toUpperCase();
      
      try {
        // Get all service areas for this state
        const { data: serviceAreas, error: serviceError } = await supabase
          .from('lender_service_areas')
          .select('lender_id')
          .eq('state', stateUpper)
          .eq('active', true);

        if (serviceError) {
          console.error('[API] Error fetching service areas:', serviceError);
          return NextResponse.json(
            { 
              error: 'Failed to fetch service areas', 
              details: serviceError.message, 
              code: serviceError.code,
              hint: serviceError.hint || 'Check if lender_service_areas table exists'
            },
            { status: 500 }
          );
        }

        console.log('[API] Service areas found for', state, ':', serviceAreas?.length || 0);

        // Get lender IDs that serve this state
        const lenderIdsInState = new Set(
          serviceAreas?.map(area => area.lender_id) || []
        );

        console.log('[API] Lender IDs in state:', lenderIdsInState.size);

        // Filter: include national lenders + lenders that serve this state
        filteredLenders = lenders.filter(lender => {
          const isNational = lender.lender_type === 'national';
          const servesState = lenderIdsInState.has(lender.id);
          return isNational || servesState;
        });

        console.log('[API] Filtered lenders:', filteredLenders.length);

      } catch (stateFilterError) {
        console.error('[API] Exception during state filtering:', stateFilterError);
        return NextResponse.json(
          { 
            error: 'Exception during state filtering',
            message: stateFilterError instanceof Error ? stateFilterError.message : 'Unknown',
            stack: stateFilterError instanceof Error ? stateFilterError.stack : undefined
          },
          { status: 500 }
        );
      }
    }

    // STEP 3: Get mortgage rates for filtered lenders
    const lenderIds = filteredLenders.map(l => l.id);
    
    let ratesQuery = supabase
      .from('mortgage_rates')
      .select('*')
      .in('lender_id', lenderIds);

    if (loanType) {
      ratesQuery = ratesQuery.eq('loan_type', loanType);
    }

    if (term) {
      ratesQuery = ratesQuery.eq('term', term);
    }

    const { data: rates, error: ratesError } = await ratesQuery;

    if (ratesError) {
      console.error('[API] Error fetching rates (non-fatal):', ratesError);
      // Don't fail - just continue without rates
    }

    console.log('[API] Rates fetched:', rates?.length || 0);

    // STEP 4: Attach rates to lenders and calculate lowest
    const ratesByLender = new Map();
    (rates || []).forEach(rate => {
      if (!ratesByLender.has(rate.lender_id)) {
        ratesByLender.set(rate.lender_id, []);
      }
      ratesByLender.get(rate.lender_id).push(rate);
    });

    const lendersWithRates = filteredLenders.map(lender => {
      const lenderRates = ratesByLender.get(lender.id) || [];
      
      let lowestRate = null;
      let lowestApr = null;

      if (lenderRates.length > 0) {
        const validRates = lenderRates
          .filter(r => r.base_rate != null)
          .map(r => parseFloat(r.base_rate));
        
        const validAprs = lenderRates
          .filter(r => r.apr != null)
          .map(r => parseFloat(r.apr));

        if (validRates.length > 0) lowestRate = Math.min(...validRates);
        if (validAprs.length > 0) lowestApr = Math.min(...validAprs);
      }

      return {
        ...lender,
        mortgage_rates: lenderRates,
        lowest_rate: lowestRate,
        lowest_apr: lowestApr
      };
    });

    // STEP 5: Sort
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

    // STEP 6: Paginate
    const paginatedLenders = sortedLenders.slice(offset, offset + limit);

    console.log('[API] Returning', paginatedLenders.length, 'lenders out of', filteredLenders.length);

    return NextResponse.json({
      data: paginatedLenders,
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
    console.error('[API] Top-level exception:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
