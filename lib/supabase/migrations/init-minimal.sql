-- Minimal initialization script for Valea Max
-- Run this in Supabase SQL Editor

-- 1. Create Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  settings JSONB DEFAULT '{"language": "fr", "currency": "CAD"}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  organization_id UUID REFERENCES organizations(id),
  role TEXT CHECK (role IN ('admin', 'appraiser', 'viewer')) DEFAULT 'appraiser',
  preferences JSONB DEFAULT '{"language": "fr", "currency": "CAD", "theme": "light", "aiApiKeys": {"deepseek": null, "openai": null, "anthropic": null}, "aiModels": {"deepseek": "deepseek-chat", "openai": "gpt-4o-mini", "anthropic": "claude-3-5-haiku-20241022"}}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Users update own profile" ON users;
DROP POLICY IF EXISTS "Users read own profile" ON users;
DROP POLICY IF EXISTS "Users see org users" ON users;

-- 5. Create RLS Policies for Users
CREATE POLICY "Users update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users read own profile" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users see org users" ON users
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );
