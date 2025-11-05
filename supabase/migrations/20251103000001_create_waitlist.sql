-- Create waitlist table for landing page email collection
-- This table stores emails from users who want to be notified when Valea Max launches

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  locale TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anyone to insert (for public signup)
CREATE POLICY "Anyone can join waitlist"
  ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Only admins can view waitlist (service role)
CREATE POLICY "Service role can view waitlist"
  ON waitlist
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON TABLE waitlist IS 'Stores email addresses from landing page waitlist signup';
COMMENT ON COLUMN waitlist.notified IS 'TRUE when user has been sent launch notification email';
