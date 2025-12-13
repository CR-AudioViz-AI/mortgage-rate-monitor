// CR AudioViz AI - Mortgage Rate Monitor API
// /api/mortgage/rates - Ultimate Multi-Source Rate Aggregator
// Created: 2025-12-12 11:52 EST
// Roy Henderson, CEO @ CR AudioViz AI, LLC

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getAllMortgageRates, getHistoricalRates } from '@/lib/mortgage-data-aggregator';

// In-memory cache with TTL
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache: Map<string, CacheEntry> = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getFromCache(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCache(key: string, data: any, ttl: number = CACHE_TTL): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

// =============================================================================
// GET - Fetch Current Rates
// =============================================================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';
    const type = searchParams.get('type'); // Filter by rate type
    const historical = searchParams.get('historical'); // Get historical data
    const weeks = parseInt(searchParams.get('weeks') || '52');
    
    // ==========================================================================
    // Historical Data Request
    // ==========================================================================
    
    if (historical === 'true') {
      const cacheKey = `historical_${weeks}`;
      
      if (!refresh) {
        const cached = getFromCache(cacheKey);
        if (cached) {
          return NextResponse.json(cached, {
            headers: {
              'X-Cache': 'HIT',
              'X-Response-Time': `${Date.now() - startTime}ms`,
              'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
            },
          });
        }
      }
      
      const historicalData = await getHistoricalRates(weeks);
      
      const response = {
        success: true,
        data: historicalData,
        weeks: historicalData.length,
        lastUpdated: new Date().toISOString(),
      };
      
      setCache(cacheKey, response, 60 * 60 * 1000); // 1 hour cache for historical
      
      return NextResponse.json(response, {
        headers: {
          'X-Cache': 'MISS',
          'X-Response-Time': `${Date.now() - startTime}ms`,
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
        },
      });
    }
    
    // ==========================================================================
    // Current Rates Request
    // ==========================================================================
    
    const cacheKey = 'current_rates';
    
    // Check cache unless refresh requested
    if (!refresh) {
      const cached = getFromCache(cacheKey);
      if (cached) {
        let responseData = cached;
        
        // Filter by type if requested
        if (type) {
          const filteredRates = cached.rates.filter((r: any) =>
            r.rateType.toLowerCase().includes(type.toLowerCase())
          );
          responseData = { ...cached, rates: filteredRates };
        }
        
        return NextResponse.json(responseData, {
          headers: {
            'X-Cache': 'HIT',
            'X-Response-Time': `${Date.now() - startTime}ms`,
            'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800',
          },
        });
      }
    }
    
    // Fetch fresh data from all sources
    const ratesData = await getAllMortgageRates();
    
    if (!ratesData.success) {
      // Try to return stale cache if fresh fetch fails
      const staleCache = cache.get(cacheKey);
      if (staleCache) {
        return NextResponse.json(
          { ...staleCache.data, stale: true },
          {
            headers: {
              'X-Cache': 'STALE',
              'X-Response-Time': `${Date.now() - startTime}ms`,
            },
          }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to fetch rates from any source',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
    
    // Cache the successful response
    setCache(cacheKey, ratesData);
    
    // Filter by type if requested
    let responseData = ratesData;
    if (type) {
      const filteredRates = ratesData.rates.filter((r) =>
        r.rateType.toLowerCase().includes(type.toLowerCase())
      );
      responseData = { ...ratesData, rates: filteredRates };
    }
    
    return NextResponse.json(responseData, {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${Date.now() - startTime}ms`,
        'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800',
      },
    });
    
  } catch (error) {
    console.error('Mortgage rates API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST - Manual Refresh (Cron Job Compatible)
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for automated calls
    const cronSecret = request.headers.get('x-cron-secret');
    const authHeader = request.headers.get('authorization');
    
    const isAuthorized =
      cronSecret === process.env.CRON_SECRET ||
      authHeader === `Bearer ${process.env.ADMIN_API_KEY}`;
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Force refresh
    const ratesData = await getAllMortgageRates();
    
    // Clear and update cache
    cache.delete('current_rates');
    setCache('current_rates', ratesData);
    
    return NextResponse.json({
      success: true,
      message: 'Rates refreshed successfully',
      rateCount: ratesData.rates.length,
      sources: ratesData.sources,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Rates refresh error:', error);
    return NextResponse.json(
      { error: 'Refresh failed', details: String(error) },
      { status: 500 }
    );
  }
}
