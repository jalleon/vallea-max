-- Add organization_name column to email_verifications table
ALTER TABLE email_verifications
ADD COLUMN IF NOT EXISTS organization_name TEXT;
