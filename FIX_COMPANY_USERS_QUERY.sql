-- ============================================================================
-- FIX COMPANY_USERS RLS POLICY FOR BETTER QUERY SUPPORT
-- ============================================================================
-- This fixes the RLS policy to allow users to view their own company memberships
-- and the associated company data without errors
-- ============================================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view their company memberships" ON company_users;

-- Create improved policy that allows viewing own memberships and company data
CREATE POLICY "Users can view their company memberships"
    ON company_users FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() 
        OR company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    );

-- Also ensure companies table allows viewing companies the user belongs to
DROP POLICY IF EXISTS "Users can view their companies" ON companies;

CREATE POLICY "Users can view their companies"
    ON companies FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this, test the query:
-- 
-- SELECT 
--     cu.*,
--     c.*
-- FROM company_users cu
-- LEFT JOIN companies c ON cu.company_id = c.id
-- WHERE cu.user_id = auth.uid()
-- AND cu.is_active = true;
-- ============================================================================

