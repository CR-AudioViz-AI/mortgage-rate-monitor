// CR AudioViz AI - Mortgage Rate Monitor
// API: Get Lenders with Filtering
// Created: 2025-11-15 21:10 UTC

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filters
    const lenderType = searchParams.get('type'); // national, state, regional, local, credit_union, online
    const state = searchParams.get('state'); // State code (FL, CA, etc)
    const zip = searchParams.get('zip'); // ZIP code
    const city = searchParams.get('city'); // City name
    const loanType = searchParams.get('loan_type'); // conventional, fha, va, usda, jumbo
    const term = searchParams.get('term'); // 30_year_fixed, 15_year_fixed, etc
    const minRating = searchParams.get('min_rating'); // Minimum rating (0-5)
    const sortBy = searchParams.get('sort') || 'rating'; // rating, name, rate
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('lenders')
      .select(`
        *,
        lender_service_areas(*),
        mortgage_rates(*)
      `)
      .eq('active', true);

    // Apply filters
    if (lenderType) {
      query = query.eq('lender_type', lenderType);
    }

    if (minRating) {
      query = query.gte('rating', parseFloat(minRating));
    }

    if (state || city || zip) {
      // If location specified, join with service areas
      // This is complex - for now, return all and filter in code
    }

    // Sorting
    if (sortBy === 'rating') {
      query = query.order('rating', { ascending: false });
    } else if (sortBy === 'name') {
      query = query.order('name', { ascending: true });
    } else if (sortBy === 'reviews') {
      query = query.order('review_count', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: lenders, error, count } = await query;

    if (error) {
      console.error('Error fetching lenders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lenders' },
        { status: 500 }
      );
    }

    // Filter by location if specified
    let filteredLenders = lenders || [];
    if (state || city || zip) {
      filteredLenders = filteredLenders.filter(lender => {
        if (!lender.lender_service_areas || lender.lender_service_areas.length === 0) {
          // If no service areas defined, assume nationwide
          return true;
        }

        return lender.lender_service_areas.some((area: any) => {
          if (area.nationwide) return true;
          if (state && area.state === state) return true;
          if (city && area.cities && area.cities.includes(city)) return true;
          if (zip && area.zip_codes && area.zip_codes.includes(zip)) return true;
          return false;
        });
      });
    }

    // Filter by loan type and term if specified
    if (loanType || term) {
      filteredLenders = filteredLenders.map(lender => {
        let filteredRates = lender.mortgage_rates || [];
        
        if (loanType) {
          filteredRates = filteredRates.filter((r: any) => r.loan_type === loanType);
        }
        
        if (term) {
          filteredRates = filteredRates.filter((r: any) => r.term === term);
        }

        return {
          ...lender,
          mortgage_rates: filteredRates,
          lowest_rate: filteredRates.length > 0 
            ? Math.min(...filteredRates.map((r: any) => r.base_rate))
            : null,
          lowest_apr: filteredRates.length > 0
            ? Math.min(...filteredRates.map((r: any) => r.apr))
            : null
        };
      }).filter(lender => lender.mortgage_rates.length > 0);
    }

    // Sort by rate if requested
    if (sortBy === 'rate' && (loanType || term)) {
      filteredLenders.sort((a, b) => (a.lowest_rate || 999) - (b.lowest_rate || 999));
    }

    return NextResponse.json({
      success: true,
      lenders: filteredLenders,
      total: filteredLenders.length,
      filters: {
        lender_type: lenderType,
        state,
        city,
        zip,
        loan_type: loanType,
        term,
        min_rating: minRating
      },
      pagination: {
        limit,
        offset,
        has_more: filteredLenders.length === limit
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/lenders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
