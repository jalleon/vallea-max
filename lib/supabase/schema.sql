-- Organizations for multi-tenant support
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  settings JSONB DEFAULT '{"language": "fr", "currency": "CAD"}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users with roles and preferences
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  organization_id UUID REFERENCES organizations(id),
  role TEXT CHECK (role IN ('admin', 'appraiser', 'viewer')) DEFAULT 'appraiser',
  preferences JSONB DEFAULT '{"language": "fr", "currency": "CAD", "theme": "light"}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form field history for auto-complete feature
CREATE TABLE field_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  field_name TEXT NOT NULL, -- e.g., 'nas.client.nom', 'nas.evaluateur.societe'
  field_value TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, field_name, field_value)
);

-- Index for fast autocomplete queries
CREATE INDEX idx_field_history_lookup ON field_history(user_id, field_name, last_used DESC);

-- Property records (Library Module)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES users(id),

  -- Core Fields (Order 1-15 as specified)
  adresse TEXT NOT NULL,                          -- 1
  ville TEXT,                                     -- 2a
  municipalite TEXT,                              -- 2b
  code_postal TEXT,                               -- 3a
  province TEXT,                                  -- 3b
  prix_vente DECIMAL(12,2),                       -- 4a
  prix_demande DECIMAL(12,2),                     -- 4b
  date_vente DATE,                                -- 5a
  status TEXT,                                    -- 5b
  type_propriete TEXT,                            -- 6a
  genre_propriete TEXT,                           -- 6b
  annee_construction INTEGER,                     -- 7a
  zonage TEXT,                                    -- 7b
  superficie_terrain_m2 DECIMAL(10,2),            -- 8a
  superficie_terrain_pi2 DECIMAL(10,2),           -- 8b
  frontage_m2 DECIMAL(10,2),                      -- 9a
  profondeur_m2 DECIMAL(10,2),                    -- 9b
  frontage_pi2 DECIMAL(10,2),                     -- 9c
  profondeur_pi2 DECIMAL(10,2),                   -- 9d
  superficie_habitable_m2 DECIMAL(10,2),          -- 10a
  superficie_habitable_pi2 DECIMAL(10,2),         -- 10b
  nombre_chambres INTEGER,                        -- 11a
  salle_bain INTEGER,                             -- 11b
  salle_eau INTEGER,                              -- 11c
  stationnement TEXT,                             -- 12a
  dimension_garage TEXT,                          -- 12b
  type_sous_sol TEXT,                             -- 13a
  toiture TEXT,                                   -- 13b
  ameliorations_hors_sol TEXT,                    -- 14
  numero_mls TEXT,                                -- 15

  -- Historical tracking
  date_vente_precedente DATE,
  prix_vente_precedente DECIMAL(12,2),

  -- Media references (no actual files stored)
  media_references JSONB DEFAULT '[]',

  -- Metadata
  source TEXT, -- Where the record came from (manual, import, etc)
  notes TEXT,
  is_template BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT true,

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('french',
      coalesce(adresse, '') || ' ' ||
      coalesce(ville, '') || ' ' ||
      coalesce(municipalite, '') || ' ' ||
      coalesce(numero_mls, '')
    )
  ) STORED,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appraisals
CREATE TABLE appraisals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  appraiser_id UUID REFERENCES users(id),

  -- Subject property
  subject_property_id UUID REFERENCES properties(id),

  -- Type and status
  type TEXT CHECK (type IN ('RPS', 'NAS', 'Insurance', 'Custom')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),

  -- Form data (varies by type)
  form_data JSONB DEFAULT '{}',

  -- Valuation
  final_value DECIMAL(12,2),
  valuation_method TEXT CHECK (valuation_method IN ('sales_comparison', 'cost_approach', 'income_approach')),

  -- Report template for regeneration
  report_template JSONB DEFAULT '{}',

  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Comparables linked to appraisals
CREATE TABLE comparables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appraisal_id UUID REFERENCES appraisals(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id),

  -- Adjustments data
  adjustments JSONB DEFAULT '{}',

  -- Calculated values
  adjusted_value DECIMAL(12,2),
  weight DECIMAL(3,2), -- Weight in final calculation

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log for dashboard
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_properties_org ON properties(organization_id);
CREATE INDEX idx_properties_search ON properties USING GIN(search_vector);
CREATE INDEX idx_properties_type ON properties(type_propriete);
CREATE INDEX idx_properties_ville ON properties(ville);
CREATE INDEX idx_properties_created_by ON properties(created_by);
CREATE INDEX idx_appraisals_org ON appraisals(organization_id);
CREATE INDEX idx_appraisals_appraiser ON appraisals(appraiser_id);
CREATE INDEX idx_appraisals_status ON appraisals(status);
CREATE INDEX idx_appraisals_type ON appraisals(type);
CREATE INDEX idx_comparables_appraisal ON comparables(appraisal_id);
CREATE INDEX idx_activity_org ON activity_log(organization_id);
CREATE INDEX idx_activity_user ON activity_log(user_id);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparables ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organizations
CREATE POLICY "Users see own organization" ON organizations
  FOR SELECT USING (
    id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins update own organization" ON organizations
  FOR UPDATE USING (
    id = (SELECT organization_id FROM users WHERE id = auth.uid()) AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- RLS Policies for Users
CREATE POLICY "Users see org users" ON users
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins manage org users" ON users
  FOR ALL USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()) AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- RLS Policies for Field History
CREATE POLICY "Users see own field history" ON field_history
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for Properties
CREATE POLICY "Users see org properties" ON properties
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users create org properties" ON properties
  FOR INSERT WITH CHECK (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()) AND
    created_by = auth.uid()
  );

CREATE POLICY "Users update org properties" ON properties
  FOR UPDATE USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins delete org properties" ON properties
  FOR DELETE USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()) AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'appraiser')
  );

-- RLS Policies for Appraisals
CREATE POLICY "Users see org appraisals" ON appraisals
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users create own appraisals" ON appraisals
  FOR INSERT WITH CHECK (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()) AND
    appraiser_id = auth.uid()
  );

CREATE POLICY "Users update own appraisals" ON appraisals
  FOR UPDATE USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()) AND
    (appraiser_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin')
  );

CREATE POLICY "Admins delete org appraisals" ON appraisals
  FOR DELETE USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()) AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- RLS Policies for Comparables
CREATE POLICY "Users see appraisal comparables" ON comparables
  FOR SELECT USING (
    appraisal_id IN (
      SELECT id FROM appraisals
      WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users manage appraisal comparables" ON comparables
  FOR ALL USING (
    appraisal_id IN (
      SELECT id FROM appraisals
      WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- RLS Policies for Activity Log
CREATE POLICY "Users see org activity" ON activity_log
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "System creates activity" ON activity_log
  FOR INSERT WITH CHECK (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()) AND
    user_id = auth.uid()
  );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appraisals_updated_at BEFORE UPDATE ON appraisals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create organization and admin user
CREATE OR REPLACE FUNCTION create_organization_and_admin(
  org_name TEXT,
  admin_email TEXT,
  admin_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  org_id UUID;
  user_id UUID;
BEGIN
  -- Create organization
  INSERT INTO organizations (name) VALUES (org_name) RETURNING id INTO org_id;

  -- Get current user ID
  user_id := auth.uid();

  -- Create user profile
  INSERT INTO users (id, email, full_name, organization_id, role)
  VALUES (user_id, admin_email, admin_name, org_id, 'admin');

  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;