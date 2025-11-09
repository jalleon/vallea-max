-- =====================================================
-- FIX APPRAISALS RLS POLICIES
-- =====================================================
-- The original policies checked auth.jwt() for organization_id,
-- but organization_id is in user_metadata, not JWT claims.
-- This migration fixes the policies to check the users table instead.
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view appraisals in their organization" ON appraisals;
DROP POLICY IF EXISTS "Users can create appraisals in their organization" ON appraisals;
DROP POLICY IF EXISTS "Users can update appraisals in their organization" ON appraisals;
DROP POLICY IF EXISTS "Users can delete appraisals in their organization" ON appraisals;

-- Create new policies that check the users table
CREATE POLICY "Users can view appraisals in their organization"
    ON appraisals FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create appraisals in their organization"
    ON appraisals FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update appraisals in their organization"
    ON appraisals FOR UPDATE
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

CREATE POLICY "Users can delete appraisals in their organization"
    ON appraisals FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Verify the policies
COMMENT ON POLICY "Users can view appraisals in their organization" ON appraisals
    IS 'Allow users to view appraisals in their organization by checking users table';
COMMENT ON POLICY "Users can create appraisals in their organization" ON appraisals
    IS 'Allow users to create appraisals in their organization by checking users table';
COMMENT ON POLICY "Users can update appraisals in their organization" ON appraisals
    IS 'Allow users to update appraisals in their organization by checking users table';
COMMENT ON POLICY "Users can delete appraisals in their organization" ON appraisals
    IS 'Allow users to delete appraisals in their organization by checking users table';
