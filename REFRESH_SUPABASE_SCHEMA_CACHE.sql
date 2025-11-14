-- ============================================================================
-- REFRESH SUPABASE SCHEMA CACHE
-- ============================================================================
-- This script forces Supabase PostgREST to refresh its schema cache
-- Run this in Supabase SQL Editor when you've created a new table but
-- PostgREST still can't find it (schema cache issue)
-- ============================================================================

-- Method 1: Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Method 2: If Method 1 doesn't work, try reloading the config
NOTIFY pgrst, 'reload config';

-- Method 3: Verify the table exists and is accessible
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name = 'adjustment_codes';

-- Method 4: Check if table has proper permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'adjustment_codes';

-- Method 5: Verify RLS is set up correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'adjustment_codes';

-- Method 6: Test direct query access
SELECT COUNT(*) as total_records FROM public.adjustment_codes;

SELECT '✅ Schema cache refresh commands executed!' AS status;
SELECT '⚠️ If the issue persists, wait 1-2 minutes for PostgREST to auto-refresh, or restart your Supabase project.' AS note;

