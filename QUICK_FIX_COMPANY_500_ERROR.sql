-- ============================================================================
-- QUICK FIX FOR HTTP 500 ERROR - COMPANY USERS
-- ============================================================================
-- Run this script to fix the 500 error when fetching companies
-- ============================================================================

-- Step 1: Ensure tables exist (if they don't, run CREATE_SAAS_MULTI_TENANT_SCHEMA.sql first)
-- This will fail if tables don't exist - that's OK, it means you need to create them first

-- Step 2: Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view their company memberships" ON company_users;
DROP POLICY IF EXISTS "Users can view their companies" ON companies;
DROP POLICY IF EXISTS "Company admins can add users" ON company_users;
DROP POLICY IF EXISTS "Company admins can update user roles" ON company_users;

-- Step 3: Create simple, permissive policies for SELECT
-- This allows users to see their own company memberships
CREATE POLICY "Users can view their company memberships"
    ON company_users FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- This allows users to see companies they belong to
CREATE POLICY "Users can view their companies"
    ON companies FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT company_id 
            FROM company_users 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- Step 4: Verify the policies were created
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN '✅ Active'
        ELSE '❌ Inactive'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('companies', 'company_users')
AND cmd = 'SELECT';

-- Step 5: Test query (should work now)
-- Replace with your actual user ID if different
SELECT 
    cu.id,
    cu.company_id,
    cu.user_id,
    cu.role,
    cu.is_primary,
    cu.is_active,
    c.name as company_name,
    c.slug as company_slug
FROM company_users cu
LEFT JOIN companies c ON cu.company_id = c.id
WHERE cu.user_id = 'f1c1befc-b508-4141-a56c-ec9926708985'
AND cu.is_active = true;

-- ============================================================================
-- If the test query above works, your app should work too!
-- Refresh your browser and the 500 error should be gone.
-- ============================================================================

