-- CR AudioViz AI - Mortgage Rate Monitor
-- Database Migration: Create mortgage_user_prefs table
-- Run this in Supabase SQL Editor
-- December 16, 2025
--
-- This table stores mortgage-specific preferences for users
-- who are authenticated via the central craudiovizai.com auth system.
-- The user_id references the central profiles table.

-- ============================================
-- MORTGAGE USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mortgage_user_prefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User's state for lender filtering
  state VARCHAR(2),
  
  -- Saved/favorite lenders (array of lender IDs)
  saved_lenders TEXT[] DEFAULT '{}',
  
  -- User's preferred rate types to track
  tracked_rate_types TEXT[] DEFAULT ARRAY['30-Year Fixed', '15-Year Fixed'],
  
  -- Notification preferences
  email_alerts_enabled BOOLEAN DEFAULT true,
  weekly_digest_enabled BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One preference record per user
  UNIQUE(user_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE mortgage_user_prefs ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences" ON mortgage_user_prefs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences  
CREATE POLICY "Users can insert own preferences" ON mortgage_user_prefs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON mortgage_user_prefs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences" ON mortgage_user_prefs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can access all (for API operations)
CREATE POLICY "Service role access" ON mortgage_user_prefs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RATE ALERTS TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS rate_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Link to user (optional - can also use email for non-authenticated users)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  
  -- Alert configuration
  rate_type VARCHAR(100) NOT NULL,
  target_rate DECIMAL(5,3) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('below', 'above')),
  
  -- Alert status
  active BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(64),
  token_expiry TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  triggered_at TIMESTAMP WITH TIME ZONE,
  last_checked TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate alerts
  UNIQUE(email, rate_type, target_rate, direction)
);

-- RLS for rate_alerts
ALTER TABLE rate_alerts ENABLE ROW LEVEL SECURITY;

-- Users can view their own alerts (by user_id or email)
CREATE POLICY "Users can view own alerts" ON rate_alerts
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can insert alerts
CREATE POLICY "Users can insert alerts" ON rate_alerts
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own alerts
CREATE POLICY "Users can update own alerts" ON rate_alerts
  FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can delete their own alerts
CREATE POLICY "Users can delete own alerts" ON rate_alerts
  FOR DELETE
  USING (
    auth.uid() = user_id OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Service role full access
CREATE POLICY "Service role alerts access" ON rate_alerts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mortgage_prefs_user ON mortgage_user_prefs(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_alerts_user ON rate_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_alerts_email ON rate_alerts(email);
CREATE INDEX IF NOT EXISTS idx_rate_alerts_active ON rate_alerts(active) WHERE active = true;

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mortgage_prefs_updated_at
  BEFORE UPDATE ON mortgage_user_prefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_alerts_updated_at
  BEFORE UPDATE ON rate_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION COMPLETE
-- ============================================
-- Run this to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
