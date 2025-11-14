-- Javari AI Mortgage Rate Monitoring - Phase 3C Database Schema
-- Historical Analytics Tables
-- Created: 2025-11-14 22:42 UTC
-- Roy Henderson, CEO @ CR AudioViz AI, LLC

-- Table: mortgage_rate_history
-- Stores historical mortgage rate data from FRED
CREATE TABLE IF NOT EXISTS mortgage_rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_type VARCHAR(20) NOT NULL CHECK (rate_type IN ('30y_fixed', '15y_fixed', '5_1_arm')),
  observation_date DATE NOT NULL,
  rate DECIMAL(5,2) NOT NULL CHECK (rate > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rate_type, observation_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mortgage_rate_history_rate_type ON mortgage_rate_history(rate_type);
CREATE INDEX IF NOT EXISTS idx_mortgage_rate_history_observation_date ON mortgage_rate_history(observation_date DESC);
CREATE INDEX IF NOT EXISTS idx_mortgage_rate_history_rate_type_date ON mortgage_rate_history(rate_type, observation_date DESC);

-- Row Level Security (RLS) - publicly readable
ALTER TABLE mortgage_rate_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy - allow public read access to historical data
CREATE POLICY "Allow public read access to historical data"
  ON mortgage_rate_history FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to read historical data
CREATE POLICY "Allow authenticated users to read historical data"
  ON mortgage_rate_history FOR SELECT
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_mortgage_rate_history_updated_at
  BEFORE UPDATE ON mortgage_rate_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON mortgage_rate_history TO anon;
GRANT SELECT ON mortgage_rate_history TO authenticated;
