// CR AudioViz AI - Mortgage Rate Monitor
// API: Get Lenders with STATE FILTERING
// Fixed: November 18, 2025 11:28 AM EST

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Required for API routes that use external APIs
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filters
    const lenderType = searchParams.get('type'); // national, state, regional
    const state = searchParams.get('state'); // State code (FL, CA, TX, etc)
    const loanType = searchParams.get('loan_type'); // conventional, fha, va, usda, jumbo
    const term = searchParams.get('term'); // 30Y, 15Y, 10Y
    const minRating = searchParams.get('min_rating'); // Minimum rating (0-5)
    const sortBy = searchParams.get('sort') || 'rating'; // rating, name, rate
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // CRITICAL: State filtering logic
    // If state is provided, we need to show:
    // 1. ALL national lenders (they serve everywhere)
    // 2. Regional/state lenders that serve this specific state
    
    let query = supabase
      .from('lenders')
      .select(`
        *,
        lender_service_areas!left(state),
        mortgage_rates(
          base_rate,
          apr,
          points,
          loan_type,
          term
        )
      `, { count: 'exact' })
      .eq('active', true);

    // Apply lender type filter
    if (lenderType) {
      query = query.eq('lender_type', lenderType);
    }

    // Apply minimum rating filter
    if (minRating) {
      query = query.gte('rating', parseFloat(minRating));
    }

    // Execute initial query
    const { data: allLenders, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('Error fetching lenders:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch lenders', details: fetchError.message },
        { status: 500 }
      );
    }

    let filteredLenders = allLenders || [];

    // STATE FILTERING LOGIC
    // This is the critical part that was missing
    if (state) {
      filteredLenders = filteredLenders.filter(lender => {
        // National lenders serve ALL states
        if (lender.lender_type === 'national') {
          return true;
        }
        
        // Regional/state lenders must explicitly serve this state
        if (lender.lender_service_areas && lender.lender_service_areas.length > 0) {
          return lender.lender_service_areas.some(
            (area: any) => area.state === state.toUpperCase()
          );
        }
        
        // If no service areas defined, exclude (shouldn't happen after our population)
        return false;
      });
    }

    // Filter by loan type and term if mortgage rates exist
    if (loanType || term) {
      filteredLenders = filteredLenders.map(lender => {
        if (!lender.mortgage_rates || lender.mortgage_rates.length === 0) {
          return lender;
        }

        let rates = lender.mortgage_rates;
        
        if (loanType) {
          rates = rates.filter((r: any) => r.loan_type === loanType);
        }
        
        if (term) {
          rates = rates.filter((r: any) => r.term === term);
        }

        return {
          ...lender,
          mortgage_rates: rates
        };
      });
    }

    // Calculate lowest rate for each lender (for sorting)
    const lendersWithRates = filteredLenders.map(lender => {
      let lowestRate = null;
      let lowestApr = null;

      if (lender.mortgage_rates && lender.mortgage_rates.length > 0) {
        const rates = lender.mortgage_rates
          .filter((r: any) => r.base_rate != null)
          .map((r: any) => r.base_rate);
        
        const aprs = lender.mortgage_rates
          .filter((r: any) => r.apr != null)
          .map((r: any) => r.apr);

        if (rates.length > 0) {
          lowestRate = Math.min(...rates);
        }
        if (aprs.length > 0) {
          lowestApr = Math.min(...aprs);
        }
      }

      return {
        ...lender,
        lowest_rate: lowestRate,
        lowest_apr: lowestApr
      };
    });

    // Sorting
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

    // Pagination
    const paginatedLenders = sortedLenders.slice(offset, offset + limit);

    // Clean up the response (remove service areas array from response)
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
