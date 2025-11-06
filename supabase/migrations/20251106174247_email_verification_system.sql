-- Email Verification System for Valea Max
-- Stores pending email verifications before account creation

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  temp_password TEXT NOT NULL, -- Encrypted temporary password
  verification_token TEXT NOT NULL UNIQUE,
  locale TEXT NOT NULL DEFAULT 'fr',

  -- Metadata
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate pending verifications for same email
  CONSTRAINT unique_pending_email UNIQUE (email, verified)
);

-- Create index for faster lookups
CREATE INDEX idx_email_verifications_token ON email_verifications(verification_token);
CREATE INDEX idx_email_verifications_email ON email_verifications(email);
CREATE INDEX idx_email_verifications_expires_at ON email_verifications(expires_at);

-- Disable RLS for this table since it's accessed by unauthenticated API routes
-- Security is handled at the API route level with token-based verification
ALTER TABLE email_verifications DISABLE ROW LEVEL SECURITY;

-- Function to clean up expired verifications (run via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_email_verifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM email_verifications
  WHERE expires_at < NOW()
  AND verified = false;
END;
$$;

-- Comment on table
COMMENT ON TABLE email_verifications IS 'Stores pending email verifications before account creation. Tokens expire after 30 minutes.';
