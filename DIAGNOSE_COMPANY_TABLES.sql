-- ============================================================================
-- DIAGNOSE COMPANY TABLES ISSUE
-- ============================================================================
-- Run this to check what's wrong with your company setup
-- ============================================================================

-- Step 1: Check if tables exist
SELECT 
    'Tables Check' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') 
        THEN '✅ companies table exists'
        ELSE '❌ companies table MISSING'
    END as companies_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_users') 
        THEN '✅ company_users table exists'
        ELSE '❌ company_users table MISSING'
    END as company_users_status;

-- Step 2: Check if RLS is enabled
SELECT 
    'RLS Check' as check_type,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'company_users');

-- Step 3: Check RLS policies
SELECT 
    'Policy Check' as check_type,
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN qual IS NOT NULL THEN '✅ Policy exists'
        ELSE '❌ No policy'
    END as policy_status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('companies', 'company_users')
ORDER BY tablename, policyname;

-- Step 4: Check your user's company access
SELECT 
    'User Access Check' as check_type,
    u.id as user_id,
    u.email,
    CASE 
        WHEN cu.id IS NOT NULL THEN '✅ Has company access'
        ELSE '❌ NO company access'
    END as access_status,
    c.name as company_name,
    cu.role,
    cu.is_active,
    cu.is_primary
FROM auth.users u
LEFT JOIN company_users cu ON u.id = cu.user_id
LEFT JOIN companies c ON cu.company_id = c.id
WHERE u.id = 'f1c1befc-b508-4141-a56c-ec9926708985';

-- Step 5: Count records
SELECT 
    'Data Check' as check_type,
    (SELECT COUNT(*) FROM companies) as companies_count,
    (SELECT COUNT(*) FROM company_users) as company_users_count,
    (SELECT COUNT(*) FROM company_users WHERE user_id = 'f1c1befc-b508-4141-a56c-ec9926708985') as your_companies_count;

