// Javari AI Mortgage Rate Monitoring - API Key Management
// Phase 3D: API Documentation & Authentication
// Created: 2025-11-14 22:44 UTC
// Roy Henderson, CEO @ CR AudioViz AI, LLC

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate secure API key
function generateApiKey(): string {
  const prefix = 'crav_mortgage';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${randomBytes}`;
}

// Hash API key for storage (using SHA-256)
function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// GET - List all API keys for authenticated user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Fetch user's API keys (excluding sensitive key_hash)
    const { data: apiKeys, error } = await supabase
      .from('mortgage_api_keys')
      .select('id, name, rate_limit, is_active, created_at, last_used_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      return NextResponse.json(
        { error: 'Failed to fetch API keys' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      api_keys: apiKeys || [],
      count: apiKeys?.length || 0
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/mortgage/keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, rate_limit } = body;

    // Validate input
    if (!name || !rate_limit) {
      return NextResponse.json(
        { error: 'Missing required fields: name, rate_limit' },
        { status: 400 }
      );
    }

    // Validate rate_limit
    const validRateLimits = [10, 100, 1000, 10000];
    if (!validRateLimits.includes(rate_limit)) {
      return NextResponse.json(
        { error: 'Invalid rate_limit. Must be one of: 10, 100, 1000, 10000' },
        { status: 400 }
      );
    }

    // Check user's API key limit (max 5 keys)
    const { count, error: countError } = await supabase
      .from('mortgage_api_keys')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (countError) {
      console.error('Error checking API key count:', countError);
      return NextResponse.json(
        { error: 'Failed to check API key limit' },
        { status: 500 }
      );
    }

    if ((count || 0) >= 5) {
      return NextResponse.json(
        { error: 'Maximum API key limit reached (5 active keys)' },
        { status: 400 }
      );
    }

    // Generate API key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);

    // Store API key
    const { data: newKey, error: insertError } = await supabase
      .from('mortgage_api_keys')
      .insert({
        user_id: user.id,
        name,
        key_hash: keyHash,
        rate_limit,
        is_active: true
      })
      .select('id, name, rate_limit, is_active, created_at')
      .single();

    if (insertError) {
      console.error('Error creating API key:', insertError);
      return NextResponse.json(
        { error: 'Failed to create API key' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      api_key: {
        ...newKey,
        key: apiKey // Only returned once on creation
      },
      message: 'API key created successfully. Save this key securely - you won\'t be able to see it again.',
      warning: 'Store this API key securely. It will not be displayed again.'
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/mortgage/keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke API key
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key_id = searchParams.get('key_id');

    if (!key_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: key_id' },
        { status: 400 }
      );
    }

    // Soft delete - set is_active to false
    const { data: revokedKey, error: deleteError } = await supabase
      .from('mortgage_api_keys')
      .update({ is_active: false })
      .eq('id', key_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (deleteError || !revokedKey) {
      return NextResponse.json(
        { error: 'API key not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully'
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/mortgage/keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
