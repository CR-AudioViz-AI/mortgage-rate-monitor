/**
 * GET /api/locations
 * 
 * List all 92 supported locations for rate monitoring.
 * Perfect for populating dropdowns in realtor app.
 * 
 * Query Parameters:
 * - type: Filter by type (state, metro, regional, national)
 * - state: Filter by state code (e.g., FL, CA, NY)
 * 
 * @timestamp 2025-11-12T14:47:00Z
 */

import { NextRequest, NextResponse } from 'next/server';
import { LOCATIONS } from '@/lib/config/locations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');
    const stateFilter = searchParams.get('state');

    let filteredLocations = [...LOCATIONS];

    // Apply type filter
    if (typeFilter) {
      filteredLocations = filteredLocations.filter(
        (loc) => loc.type === typeFilter
      );
    }

    // Apply state filter
    if (stateFilter) {
      const stateCode = stateFilter.toUpperCase();
      filteredLocations = filteredLocations.filter((loc) => {
        // Check if it's a state code
        if (loc.type === 'state' && loc.code === stateCode) return true;

        // Check if it's a metro in that state
        if (loc.type === 'metro' && loc.code.endsWith(`-${stateCode.toLowerCase()}`)) {
          return true;
        }

        return false;
      });
    }

    // Group by type for easier consumption
    const grouped = {
      states: filteredLocations.filter((loc) => loc.type === 'state'),
      metros: filteredLocations.filter((loc) => loc.type === 'metro'),
      regional: filteredLocations.filter((loc) => loc.type === 'regional'),
      national: filteredLocations.filter((loc) => loc.type === 'national'),
    };

    return NextResponse.json({
      success: true,
      count: filteredLocations.length,
      locations: filteredLocations,
      grouped,
      filters: {
        type: typeFilter,
        state: stateFilter,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] /locations error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
