-- =====================================================
-- FIX RLS POLICIES - REMOVE USER_METADATA REFERENCES
-- =====================================================
-- SECURITY FIX: Supabase Auth user_metadata is editable by end users
-- and should NEVER be used in a security context (RLS policies).
--
-- This migration fixes policies that previously used:
--   auth.jwt() ->> 'organization_id'  (INSECURE - reads from user_metadata)
--
-- And replaces them with:
--   (SELECT organization_id FROM users WHERE id = auth.uid())  (SECURE)
--
-- Affected tables:
--   1. floor_areas
--   2. organization_adjustment_presets
-- =====================================================

-- =====================================================
-- 1. FIX floor_areas RLS POLICIES
-- =====================================================

-- Drop any existing policies on floor_areas
DROP POLICY IF EXISTS "Users see property floor areas" ON floor_areas;
DROP POLICY IF EXISTS "Users manage property floor areas" ON floor_areas;
DROP POLICY IF EXISTS "Users can create floor areas" ON floor_areas;
DROP POLICY IF EXISTS "Users can view floor areas" ON floor_areas;
DROP POLICY IF EXISTS "Users can update floor areas" ON floor_areas;
DROP POLICY IF EXISTS "Users can delete floor areas" ON floor_areas;

-- Create secure policies that check the users table (not user_metadata)
CREATE POLICY "Users can view floor areas in their organization"
    ON floor_areas FOR SELECT
    USING (
        property_id IN (
            SELECT id FROM properties
            WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create floor areas in their organization"
    ON floor_areas FOR INSERT
    WITH CHECK (
        property_id IN (
            SELECT id FROM properties
            WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update floor areas in their organization"
    ON floor_areas FOR UPDATE
    USING (
        property_id IN (
            SELECT id FROM properties
            WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    )
    WITH CHECK (
        property_id IN (
            SELECT id FROM properties
            WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete floor areas in their organization"
    ON floor_areas FOR DELETE
    USING (
        property_id IN (
            SELECT id FROM properties
            WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- Add comments to document the security fix
COMMENT ON POLICY "Users can view floor areas in their organization" ON floor_areas
    IS 'SECURE: Uses users table lookup instead of user_metadata';
COMMENT ON POLICY "Users can create floor areas in their organization" ON floor_areas
    IS 'SECURE: Uses users table lookup instead of user_metadata';
COMMENT ON POLICY "Users can update floor areas in their organization" ON floor_areas
    IS 'SECURE: Uses users table lookup instead of user_metadata';
COMMENT ON POLICY "Users can delete floor areas in their organization" ON floor_areas
    IS 'SECURE: Uses users table lookup instead of user_metadata';

-- =====================================================
-- 2. FIX organization_adjustment_presets RLS POLICIES
-- =====================================================

-- Drop existing insecure policies
DROP POLICY IF EXISTS "Users can view presets in their organization" ON organization_adjustment_presets;
DROP POLICY IF EXISTS "Users can create presets in their organization" ON organization_adjustment_presets;
DROP POLICY IF EXISTS "Users can update presets in their organization" ON organization_adjustment_presets;
DROP POLICY IF EXISTS "Users can delete presets in their organization" ON organization_adjustment_presets;

-- Create secure policies that check the users table (not user_metadata)
CREATE POLICY "Users can view presets in their organization"
    ON organization_adjustment_presets FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create presets in their organization"
    ON organization_adjustment_presets FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update presets in their organization"
    ON organization_adjustment_presets FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete presets in their organization"
    ON organization_adjustment_presets FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Add comments to document the security fix
COMMENT ON POLICY "Users can view presets in their organization" ON organization_adjustment_presets
    IS 'SECURE: Uses users table lookup instead of user_metadata (auth.jwt())';
COMMENT ON POLICY "Users can create presets in their organization" ON organization_adjustment_presets
    IS 'SECURE: Uses users table lookup instead of user_metadata (auth.jwt())';
COMMENT ON POLICY "Users can update presets in their organization" ON organization_adjustment_presets
    IS 'SECURE: Uses users table lookup instead of user_metadata (auth.jwt())';
COMMENT ON POLICY "Users can delete presets in their organization" ON organization_adjustment_presets
    IS 'SECURE: Uses users table lookup instead of user_metadata (auth.jwt())';

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this migration, verify no policies use user_metadata:
--
-- SELECT schemaname, tablename, policyname, qual, with_check
-- FROM pg_policies
-- WHERE qual LIKE '%jwt()%' OR with_check LIKE '%jwt()%';
--
-- The above query should return 0 rows.
-- =====================================================
