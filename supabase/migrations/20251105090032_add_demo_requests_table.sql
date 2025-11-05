-- =====================================================
-- DEMO REQUESTS TABLE
-- =====================================================
-- This migration adds the demo_requests table for storing
-- demo request submissions from the landing page
-- =====================================================

CREATE TABLE IF NOT EXISTS public.demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT,
  locale TEXT NOT NULL DEFAULT 'fr' CHECK (locale IN ('fr', 'en')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email)
);

CREATE INDEX idx_demo_requests_email ON public.demo_requests(email);
CREATE INDEX idx_demo_requests_created ON public.demo_requests(created_at DESC);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Public can insert (for landing page form)
CREATE POLICY "Anyone can add demo requests"
  ON public.demo_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Service role can view all demo requests
CREATE POLICY "Service role can view demo requests"
  ON public.demo_requests
  FOR SELECT
  TO service_role
  USING (true);

COMMENT ON TABLE public.demo_requests IS 'Stores demo request submissions from landing page';
