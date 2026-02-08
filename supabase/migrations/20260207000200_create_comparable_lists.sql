-- Comparable lists: shortlists of properties tied to an appraisal + value approach
CREATE TABLE IF NOT EXISTS comparable_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  appraisal_id UUID NOT NULL REFERENCES appraisals(id) ON DELETE CASCADE,
  list_type TEXT NOT NULL, -- 'direct_comparison' | 'direct_capitalization' | 'land' | 'commercial_lease' | 'residential_lease'
  name TEXT,
  items JSONB NOT NULL DEFAULT '[]', -- Array of { property_id, sort_order, notes, added_at }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (appraisal_id, list_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comparable_lists_appraisal ON comparable_lists(appraisal_id);
CREATE INDEX IF NOT EXISTS idx_comparable_lists_org ON comparable_lists(organization_id);

-- RLS
ALTER TABLE comparable_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see org comparable lists" ON comparable_lists
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users create org comparable lists" ON comparable_lists
  FOR INSERT WITH CHECK (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Users update org comparable lists" ON comparable_lists
  FOR UPDATE USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users delete org comparable lists" ON comparable_lists
  FOR DELETE USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Auto-update updated_at
CREATE TRIGGER update_comparable_lists_updated_at BEFORE UPDATE ON comparable_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
