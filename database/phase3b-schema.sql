-- Javari AI Mortgage Rate Monitoring - Phase 3B Database Schema
-- Email Alert System Tables
-- Created: 2025-11-14 22:36 UTC
-- Roy Henderson, CEO @ CR AudioViz AI, LLC

-- Table: mortgage_rate_alerts
-- Stores user-configured rate alert thresholds
CREATE TABLE IF NOT EXISTS mortgage_rate_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rate_type VARCHAR(20) NOT NULL CHECK (rate_type IN ('30y_fixed', '15y_fixed', '5_1_arm')),
  threshold DECIMAL(5,2) NOT NULL CHECK (threshold > 0),
  condition VARCHAR(10) NOT NULL CHECK (condition IN ('above', 'below')),
  email VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: mortgage_alert_logs
-- Stores history of triggered alerts
CREATE TABLE IF NOT EXISTS mortgage_alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES mortgage_rate_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rate_type VARCHAR(20) NOT NULL,
  threshold DECIMAL(5,2) NOT NULL,
  condition VARCHAR(10) NOT NULL,
  current_rate DECIMAL(5,2) NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT false,
  email_error TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mortgage_rate_alerts_user_id ON mortgage_rate_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_rate_alerts_is_active ON mortgage_rate_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_mortgage_alert_logs_alert_id ON mortgage_alert_logs(alert_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_alert_logs_user_id ON mortgage_alert_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_alert_logs_triggered_at ON mortgage_alert_logs(triggered_at DESC);

-- Row Level Security (RLS)
ALTER TABLE mortgage_rate_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortgage_alert_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mortgage_rate_alerts
CREATE POLICY "Users can view their own alerts"
  ON mortgage_rate_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
  ON mortgage_rate_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON mortgage_rate_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON mortgage_rate_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for mortgage_alert_logs
CREATE POLICY "Users can view their own alert logs"
  ON mortgage_alert_logs FOR SELECT
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
CREATE TRIGGER update_mortgage_rate_alerts_updated_at
  BEFORE UPDATE ON mortgage_rate_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Cleanup function to delete old logs (90 days)
CREATE OR REPLACE FUNCTION cleanup_old_alert_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM mortgage_alert_logs
  WHERE triggered_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON mortgage_rate_alerts TO authenticated;
GRANT ALL ON mortgage_alert_logs TO authenticated;
