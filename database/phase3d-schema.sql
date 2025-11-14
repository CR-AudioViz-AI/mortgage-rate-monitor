-- Javari AI Mortgage Rate Monitoring - Phase 3D Database Schema
-- API Documentation & Authentication Tables
-- Created: 2025-11-14 22:48 UTC
-- Roy Henderson, CEO @ CR AudioViz AI, LLC

-- Table: mortgage_api_keys
-- Stores API keys for authenticated access
CREATE TABLE IF NOT EXISTS mortgage_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(64) NOT NULL UNIQUE,
  rate_limit INTEGER NOT NULL CHECK (rate_limit IN (10, 100, 1000, 10000)),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: mortgage_api_usage_logs
-- Stores API usage logs for analytics and monitoring
CREATE TABLE IF NOT EXISTS mortgage_api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES mortgage_api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_message TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mortgage_api_keys_user_id ON mortgage_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_api_keys_key_hash ON mortgage_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_mortgage_api_keys_is_active ON mortgage_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_mortgage_api_usage_logs_api_key_id ON mortgage_api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_api_usage_logs_user_id ON mortgage_api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_api_usage_logs_timestamp ON mortgage_api_usage_logs(request_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mortgage_api_usage_logs_endpoint ON mortgage_api_usage_logs(endpoint);

-- Row Level Security (RLS)
ALTER TABLE mortgage_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortgage_api_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mortgage_api_keys
CREATE POLICY "Users can view their own API keys"
  ON mortgage_api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys"
  ON mortgage_api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
  ON mortgage_api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
  ON mortgage_api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for mortgage_api_usage_logs
CREATE POLICY "Users can view their own usage logs"
  ON mortgage_api_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_mortgage_api_keys_updated_at
  BEFORE UPDATE ON mortgage_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to cleanup old usage logs (90 days)
CREATE OR REPLACE FUNCTION cleanup_old_api_usage_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM mortgage_api_usage_logs
  WHERE request_timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON mortgage_api_keys TO authenticated;
GRANT ALL ON mortgage_api_usage_logs TO authenticated;
