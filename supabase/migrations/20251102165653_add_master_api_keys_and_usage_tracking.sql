-- =====================================================
-- MASTER API KEYS & USAGE TRACKING SYSTEM
-- =====================================================
-- This migration adds:
-- 1. Admin API keys table (Valea's master keys)
-- 2. Usage tracking table (for billing)
-- 3. User quota fields for credit-based system
-- =====================================================

-- =====================================================
-- 1. ADMIN API KEYS TABLE
-- =====================================================
-- Stores Valea's master API keys for AI services
CREATE TABLE IF NOT EXISTS public.admin_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('deepseek', 'openai', 'anthropic')),
  api_key TEXT NOT NULL,
  model TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_admin_api_keys_provider_active ON public.admin_api_keys(provider, is_active, priority DESC);

ALTER TABLE public.admin_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage admin API keys"
  ON public.admin_api_keys
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 2. USAGE TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('pdf_scan', 'text_extract')),
  document_type TEXT,
  file_size_bytes BIGINT,
  page_count INTEGER,
  credits_used INTEGER NOT NULL DEFAULT 1,
  provider_used TEXT CHECK (provider_used IN ('deepseek', 'openai', 'anthropic')),
  model_used TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_estimate NUMERIC(10, 6),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usage_tracking_user_date ON public.usage_tracking(user_id, created_at DESC);
CREATE INDEX idx_usage_tracking_org_date ON public.usage_tracking(organization_id, created_at DESC);
CREATE INDEX idx_usage_tracking_created ON public.usage_tracking(created_at DESC);

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON public.usage_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all usage"
  ON public.usage_tracking
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. UPDATE USER PROFILES FOR CREDIT SYSTEM
-- =====================================================
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS can_use_own_api_keys BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS scan_credits_quota INTEGER DEFAULT 20,
  ADD COLUMN IF NOT EXISTS scan_credits_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scan_credits_reset_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 month'),
  ADD COLUMN IF NOT EXISTS api_key_secret_enabled BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_user_profiles_credits ON public.user_profiles(scan_credits_used, scan_credits_quota);

-- =====================================================
-- 4. FUNCTION TO RESET MONTHLY CREDITS
-- =====================================================
CREATE OR REPLACE FUNCTION reset_monthly_scan_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_profiles
  SET
    scan_credits_used = 0,
    scan_credits_reset_at = now() + INTERVAL '1 month'
  WHERE scan_credits_reset_at <= now();
END;
$$;

-- =====================================================
-- 5. FUNCTION TO CHECK AND CONSUME CREDITS
-- =====================================================
CREATE OR REPLACE FUNCTION consume_scan_credits(
  p_user_id UUID,
  p_credits_needed INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_used INTEGER;
  v_quota INTEGER;
BEGIN
  SELECT scan_credits_used, scan_credits_quota
  INTO v_current_used, v_quota
  FROM public.user_profiles
  WHERE user_id = p_user_id;

  IF v_quota IS NULL OR (v_current_used + p_credits_needed) <= v_quota THEN
    UPDATE public.user_profiles
    SET scan_credits_used = scan_credits_used + p_credits_needed
    WHERE user_id = p_user_id;

    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- =====================================================
-- 6. INSERT DEFAULT ADMIN API KEY (PLACEHOLDER)
-- =====================================================
INSERT INTO public.admin_api_keys (provider, api_key, model, is_active, priority, notes)
VALUES
  ('deepseek', 'YOUR_DEEPSEEK_API_KEY_HERE', 'deepseek-chat', true, 100, 'Primary DeepSeek key')
ON CONFLICT DO NOTHING;
