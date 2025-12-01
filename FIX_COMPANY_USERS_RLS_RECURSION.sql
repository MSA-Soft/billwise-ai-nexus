-- ============================================================================
-- FIX INFINITE RECURSION IN COMPANY_USERS RLS POLICY
-- ============================================================================
-- The issue: The RLS policy for company_users queries company_users itself,
-- creating an infinite recursion loop.
-- 
-- Solution: Use SECURITY DEFINER functions that bypass RLS to check permissions
-- ============================================================================

-- ============================================================================
-- 1. CREATE HELPER FUNCTION TO GET USER'S COMPANY ACCESS (BYPASSES RLS)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_accessible_company_ids(user_uuid UUID)
RETURNS TABLE(company_id UUID) AS $$
BEGIN
    -- This function runs with SECURITY DEFINER, so it bypasses RLS
    -- and can query company_users directly without recursion
    RETURN QUERY
    SELECT cu.company_id
    FROM company_users cu
    WHERE cu.user_id = user_uuid
    AND cu.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. CREATE HELPER FUNCTION TO CHECK IF USER IS ADMIN/MANAGER IN COMPANY
-- ============================================================================

CREATE OR REPLACE FUNCTION user_is_admin_in_company(user_uuid UUID, company_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- This function runs with SECURITY DEFINER, so it bypasses RLS
    RETURN EXISTS (
        SELECT 1 FROM company_users
        WHERE user_id = user_uuid
        AND company_id = company_uuid
        AND role IN ('admin', 'manager')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. FIX COMPANY_USERS SELECT POLICY (REMOVE RECURSION)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their memberships or super admin can view all" ON company_users;
DROP POLICY IF EXISTS "Users can view their company memberships" ON company_users;

CREATE POLICY "Users can view their company memberships"
    ON company_users FOR SELECT
    TO authenticated
    USING (
        -- Super admins can see all
        is_super_admin(auth.uid())
        -- Users can see their own memberships
        OR user_id = auth.uid()
        -- Admins/managers can see memberships in their companies
        OR user_is_admin_in_company(auth.uid(), company_id)
    );

-- ============================================================================
-- 4. FIX COMPANY_USERS INSERT POLICY (REMOVE RECURSION)
-- ============================================================================

DROP POLICY IF EXISTS "Super admins or company admins can add users" ON company_users;
DROP POLICY IF EXISTS "Company admins can add users" ON company_users;

CREATE POLICY "Super admins or company admins can add users"
    ON company_users FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Super admins can add users to any company
        is_super_admin(auth.uid())
        -- Admins/managers can add users to their companies
        OR user_is_admin_in_company(auth.uid(), company_id)
    );

-- ============================================================================
-- 5. FIX COMPANY_USERS UPDATE POLICY (REMOVE RECURSION)
-- ============================================================================

DROP POLICY IF EXISTS "Super admins or company admins can update user roles" ON company_users;
DROP POLICY IF EXISTS "Company admins can update user roles" ON company_users;

CREATE POLICY "Super admins or company admins can update user roles"
    ON company_users FOR UPDATE
    TO authenticated
    USING (
        -- Super admins can update any membership
        is_super_admin(auth.uid())
        -- Admins/managers can update memberships in their companies
        OR user_is_admin_in_company(auth.uid(), company_id)
    )
    WITH CHECK (
        -- Super admins can update any membership
        is_super_admin(auth.uid())
        -- Admins/managers can update memberships in their companies
        OR user_is_admin_in_company(auth.uid(), company_id)
    );

-- ============================================================================
-- 6. FIX COMPANY_USERS DELETE POLICY (REMOVE RECURSION)
-- ============================================================================

DROP POLICY IF EXISTS "Super admins or company admins can remove users" ON company_users;

CREATE POLICY "Super admins or company admins can remove users"
    ON company_users FOR DELETE
    TO authenticated
    USING (
        -- Super admins can remove users from any company
        is_super_admin(auth.uid())
        -- Admins/managers can remove users from their companies
        OR user_is_admin_in_company(auth.uid(), company_id)
    );

-- ============================================================================
-- 7. FIX COMPANIES SELECT POLICY (USE HELPER FUNCTION)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their companies or super admin can view all" ON companies;
DROP POLICY IF EXISTS "Users can view their companies" ON companies;

CREATE POLICY "Users can view their companies or super admin can view all"
    ON companies FOR SELECT
    TO authenticated
    USING (
        -- Super admins can see all companies
        is_super_admin(auth.uid())
        -- Regular users can see companies they belong to
        OR id = ANY(
            SELECT company_id FROM get_user_accessible_company_ids(auth.uid())
        )
    );

-- ============================================================================
-- 8. FIX COMPANIES UPDATE POLICY (USE HELPER FUNCTION)
-- ============================================================================

DROP POLICY IF EXISTS "Super admins or company admins can update companies" ON companies;
DROP POLICY IF EXISTS "Company admins can update their company" ON companies;

CREATE POLICY "Super admins or company admins can update companies"
    ON companies FOR UPDATE
    TO authenticated
    USING (
        -- Super admins can update any company
        is_super_admin(auth.uid())
        -- Company admins/managers can update their company
        OR user_is_admin_in_company(auth.uid(), id)
    )
    WITH CHECK (
        -- Super admins can update any company
        is_super_admin(auth.uid())
        -- Company admins/managers can update their company
        OR user_is_admin_in_company(auth.uid(), id)
    );

-- ============================================================================
-- COMPLETE
-- ============================================================================
-- This script fixes the infinite recursion by:
-- 1. Creating SECURITY DEFINER helper functions that bypass RLS
-- 2. Using these functions in RLS policies instead of direct queries
-- 3. Ensuring no policy queries the same table it protects
-- ============================================================================

