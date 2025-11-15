-- CR AudioViz AI - Mortgage Rate Monitor
-- Complete Database Schema - Option 1 Full Rebuild
-- Created: 2025-11-15 21:00 UTC
-- Roy Henderson, CEO @ CR AudioViz AI, LLC

-- =============================================================================
-- CORE LENDER TABLES
-- =============================================================================

-- Table 1: lenders - Master lender directory
CREATE TABLE IF NOT EXISTS lenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  lender_type VARCHAR(50) NOT NULL CHECK (lender_type IN ('national', 'state', 'regional', 'local', 'credit_union', 'online')),
  website VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  logo_url VARCHAR(500),
  headquarters_state VARCHAR(2),
  nmls_id VARCHAR(20) UNIQUE,
  years_in_business INTEGER,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  description TEXT,
  specialties TEXT[], -- Array of specialties like 'FHA', 'VA', 'First-time buyers'
  min_credit_score INTEGER,
  min_down_payment DECIMAL(5,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: lender_service_areas - Geographic coverage
CREATE TABLE IF NOT EXISTS lender_service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
  state VARCHAR(2) NOT NULL,
  counties TEXT[], -- Array of county names
  zip_codes TEXT[], -- Array of ZIP codes
  cities TEXT[], -- Array of city names
  nationwide BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: mortgage_rates - Current rates by lender
CREATE TABLE IF NOT EXISTS mortgage_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
  loan_type VARCHAR(50) NOT NULL CHECK (loan_type IN ('conventional', 'fha', 'va', 'usda', 'jumbo')),
  term VARCHAR(20) NOT NULL CHECK (term IN ('30_year_fixed', '15_year_fixed', '10_year_fixed', '7_1_arm', '5_1_arm', '3_1_arm')),
  base_rate DECIMAL(5,3) NOT NULL CHECK (base_rate > 0),
  apr DECIMAL(5,3) NOT NULL CHECK (apr > 0),
  points DECIMAL(4,2) DEFAULT 0,
  fees DECIMAL(10,2) DEFAULT 0,
  min_credit_score INTEGER,
  min_down_payment DECIMAL(5,2),
  max_loan_amount DECIMAL(12,2),
  states_available TEXT[], -- Array of state codes where this rate is available
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4: rate_history - Historical rate tracking
CREATE TABLE IF NOT EXISTS rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID REFERENCES lenders(id) ON DELETE CASCADE,
  loan_type VARCHAR(50) NOT NULL,
  term VARCHAR(20) NOT NULL,
  rate DECIMAL(5,3) NOT NULL,
  apr DECIMAL(5,3) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'manual' -- 'manual', 'api', 'scrape', 'fred'
);

-- =============================================================================
-- USER & AUTHENTICATION TABLES
-- =============================================================================

-- Table 5: users - Integrated with CR AudioViz
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  craudioviz_user_id UUID, -- Link to main platform user
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  user_type VARCHAR(50) DEFAULT 'buyer' CHECK (user_type IN ('buyer', 'realtor', 'lender', 'admin')),
  email_opt_in BOOLEAN DEFAULT true,
  sms_opt_in BOOLEAN DEFAULT false,
  credit_balance INTEGER DEFAULT 0, -- CR AudioViz credit integration
  subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 6: user_preferences - Search and notification preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_loan_types TEXT[], -- Array like ['conventional', 'fha']
  preferred_terms TEXT[], -- Array like ['30_year_fixed', '15_year_fixed']
  max_rate DECIMAL(5,3),
  min_down_payment DECIMAL(5,2),
  credit_score_range VARCHAR(20), -- '720-760'
  notification_frequency VARCHAR(20) DEFAULT 'instant' CHECK (notification_frequency IN ('instant', 'daily', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =============================================================================
-- LEAD CAPTURE & REALTOR TABLES
-- =============================================================================

-- Table 7: lead_submissions - Buyer lead capture
CREATE TABLE IF NOT EXISTS lead_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  property_type VARCHAR(50), -- 'single_family', 'condo', 'townhouse', 'multi_family'
  purchase_price DECIMAL(12,2),
  down_payment DECIMAL(12,2),
  down_payment_percent DECIMAL(5,2),
  credit_score_range VARCHAR(20), -- '720-760'
  loan_type_interest TEXT[], -- Array of interested loan types
  property_location TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  timeline VARCHAR(50), -- '0-3 months', '3-6 months', '6-12 months', '12+ months'
  has_realtor BOOLEAN DEFAULT false,
  is_preapproved BOOLEAN DEFAULT false,
  preferred_lenders UUID[], -- Array of lender IDs
  realtor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'lost')),
  notes TEXT,
  source VARCHAR(100) DEFAULT 'website', -- 'website', 'api', 'referral'
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 8: realtor_assignments - Lead-to-Realtor mapping
CREATE TABLE IF NOT EXISTS realtor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES lead_submissions(id) ON DELETE CASCADE,
  realtor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_contact_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'contacted', 'working', 'closed', 'declined')),
  commission_amount DECIMAL(10,2),
  commission_paid BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- RATE ALERT TABLES
-- =============================================================================

-- Table 9: rate_alerts - Email/SMS notifications
CREATE TABLE IF NOT EXISTS rate_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  loan_type VARCHAR(50) NOT NULL,
  term VARCHAR(20) NOT NULL,
  target_rate DECIMAL(5,3) NOT NULL,
  alert_type VARCHAR(20) DEFAULT 'below' CHECK (alert_type IN ('below', 'above', 'change')),
  location VARCHAR(100), -- City, State or ZIP
  lender_ids UUID[], -- Specific lenders to monitor (optional)
  notification_channel VARCHAR(20) DEFAULT 'email' CHECK (notification_channel IN ('email', 'sms', 'both')),
  active BOOLEAN DEFAULT true,
  last_checked TIMESTAMP WITH TIME ZONE,
  last_triggered TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 10: alert_notifications - Log of sent notifications
CREATE TABLE IF NOT EXISTS alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES rate_alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  lender_id UUID REFERENCES lenders(id) ON DELETE SET NULL,
  notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN ('email', 'sms')),
  triggered_rate DECIMAL(5,3) NOT NULL,
  target_rate DECIMAL(5,3) NOT NULL,
  message_content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered BOOLEAN DEFAULT false,
  opened BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false
);

-- =============================================================================
-- API & ANALYTICS TABLES
-- =============================================================================

-- Table 11: api_keys - Developer API access
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_name VARCHAR(255) NOT NULL,
  api_key VARCHAR(64) UNIQUE NOT NULL,
  key_hash VARCHAR(128) NOT NULL, -- Hashed version for security
  rate_limit INTEGER DEFAULT 100, -- Requests per hour
  tier VARCHAR(50) DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'pro', 'enterprise')),
  allowed_endpoints TEXT[], -- Array of allowed endpoint patterns
  active BOOLEAN DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 12: api_usage - API usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time INTEGER, -- Milliseconds
  request_ip VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TRACKING & ANALYTICS TABLES
-- =============================================================================

-- Table 13: user_searches - Search behavior analytics
CREATE TABLE IF NOT EXISTS user_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  search_location VARCHAR(100), -- ZIP or City, State
  loan_type VARCHAR(50),
  term VARCHAR(20),
  lender_type VARCHAR(50),
  credit_score_range VARCHAR(20),
  down_payment_percent DECIMAL(5,2),
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 14: lender_comparisons - Comparison tracking
CREATE TABLE IF NOT EXISTS lender_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  lender_ids UUID[] NOT NULL, -- Array of lender IDs being compared
  loan_type VARCHAR(50),
  term VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 15: click_tracking - Lender referral tracking
CREATE TABLE IF NOT EXISTS click_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  lender_id UUID NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
  click_type VARCHAR(50) NOT NULL CHECK (click_type IN ('website', 'phone', 'email', 'quote_request')),
  source_page VARCHAR(255),
  referrer VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Lenders
CREATE INDEX idx_lenders_type ON lenders(lender_type);
CREATE INDEX idx_lenders_state ON lenders(headquarters_state);
CREATE INDEX idx_lenders_active ON lenders(active);
CREATE INDEX idx_lenders_rating ON lenders(rating DESC);

-- Service Areas
CREATE INDEX idx_service_areas_lender ON lender_service_areas(lender_id);
CREATE INDEX idx_service_areas_state ON lender_service_areas(state);
CREATE INDEX idx_service_areas_nationwide ON lender_service_areas(nationwide);

-- Mortgage Rates
CREATE INDEX idx_rates_lender ON mortgage_rates(lender_id);
CREATE INDEX idx_rates_loan_type ON mortgage_rates(loan_type);
CREATE INDEX idx_rates_term ON mortgage_rates(term);
CREATE INDEX idx_rates_base_rate ON mortgage_rates(base_rate);
CREATE INDEX idx_rates_apr ON mortgage_rates(apr);
CREATE INDEX idx_rates_updated ON mortgage_rates(last_updated DESC);

-- Rate History
CREATE INDEX idx_rate_history_lender ON rate_history(lender_id);
CREATE INDEX idx_rate_history_recorded ON rate_history(recorded_at DESC);
CREATE INDEX idx_rate_history_type_term ON rate_history(loan_type, term);

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_crav_id ON users(craudioviz_user_id);

-- Lead Submissions
CREATE INDEX idx_leads_status ON lead_submissions(status);
CREATE INDEX idx_leads_realtor ON lead_submissions(realtor_id);
CREATE INDEX idx_leads_location ON lead_submissions(city, state);
CREATE INDEX idx_leads_submitted ON lead_submissions(submitted_at DESC);

-- Rate Alerts
CREATE INDEX idx_alerts_user ON rate_alerts(user_id);
CREATE INDEX idx_alerts_active ON rate_alerts(active);
CREATE INDEX idx_alerts_type_term ON rate_alerts(loan_type, term);

-- API Keys
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_active ON api_keys(active);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lender_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortgage_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE lender_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_tracking ENABLE ROW LEVEL SECURITY;

-- Public read access to lender data
CREATE POLICY "Public read lenders" ON lenders FOR SELECT TO public USING (active = true);
CREATE POLICY "Public read service areas" ON lender_service_areas FOR SELECT TO public USING (active = true);
CREATE POLICY "Public read rates" ON mortgage_rates FOR SELECT TO public USING (true);
CREATE POLICY "Public read rate history" ON rate_history FOR SELECT TO public USING (true);

-- Users can only see their own data
CREATE POLICY "Users see own data" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own data" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User preferences
CREATE POLICY "Users manage own preferences" ON user_preferences FOR ALL TO authenticated USING (user_id = auth.uid());

-- Lead submissions
CREATE POLICY "Users see own leads" ON lead_submissions FOR SELECT TO authenticated USING (user_id = auth.uid() OR realtor_id = auth.uid());
CREATE POLICY "Public can create leads" ON lead_submissions FOR INSERT TO public WITH CHECK (true);

-- Rate alerts
CREATE POLICY "Users manage own alerts" ON rate_alerts FOR ALL TO authenticated USING (user_id = auth.uid());

-- API keys
CREATE POLICY "Users manage own API keys" ON api_keys FOR ALL TO authenticated USING (user_id = auth.uid());

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_lenders_updated_at BEFORE UPDATE ON lenders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_areas_updated_at BEFORE UPDATE ON lender_service_areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON lead_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_realtor_assignments_updated_at BEFORE UPDATE ON realtor_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rate_alerts_updated_at BEFORE UPDATE ON rate_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
DECLARE
  characters TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'mrm_'; -- Mortgage Rate Monitor prefix
  i INTEGER;
BEGIN
  FOR i IN 1..48 LOOP
    result := result || substr(characters, floor(random() * length(characters) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

GRANT SELECT ON lenders TO anon, authenticated;
GRANT SELECT ON lender_service_areas TO anon, authenticated;
GRANT SELECT ON mortgage_rates TO anon, authenticated;
GRANT SELECT ON rate_history TO anon, authenticated;
GRANT INSERT ON lead_submissions TO anon, authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON user_preferences TO authenticated;
GRANT ALL ON rate_alerts TO authenticated;
GRANT ALL ON api_keys TO authenticated;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE lenders IS 'Master directory of all mortgage lenders';
COMMENT ON TABLE lender_service_areas IS 'Geographic areas served by each lender';
COMMENT ON TABLE mortgage_rates IS 'Current mortgage rates offered by lenders';
COMMENT ON TABLE rate_history IS 'Historical rate tracking for trend analysis';
COMMENT ON TABLE users IS 'User accounts integrated with CR AudioViz platform';
COMMENT ON TABLE lead_submissions IS 'Buyer leads captured for realtor ecosystem';
COMMENT ON TABLE rate_alerts IS 'Email/SMS alerts for rate changes';
COMMENT ON TABLE api_keys IS 'API access keys for developers';

-- Schema deployment complete!
