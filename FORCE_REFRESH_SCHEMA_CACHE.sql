-- ============================================================================
-- FORCE REFRESH SUPABASE SCHEMA CACHE - MULTIPLE METHODS
-- ============================================================================
-- Run this if FIX_ADJUSTMENT_CODES_TABLE.sql didn't resolve the issue
-- This uses multiple methods to force PostgREST to reload its schema cache
-- ============================================================================

-- Method 1: Standard PostgREST reload
NOTIFY pgrst, 'reload schema';

-- Method 2: Alternative notification format
SELECT pg_notify('pgrst', 'reload schema');

-- Method 3: Reload config
NOTIFY pgrst, 'reload config';

-- Method 4: Check if table is visible to PostgREST
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'adjustment_codes';

-- Method 5: Verify anon role can see the table
SET ROLE anon;
SELECT COUNT(*) FROM adjustment_codes;
RESET ROLE;

-- Method 6: Check table permissions for anon role
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name = 'adjustment_codes'
AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee, privilege_type;

-- Method 7: Verify RLS policies allow anon access
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'adjustment_codes';

-- Method 8: Test direct query as anon (simulated)
DO $$
DECLARE
    record_count INTEGER;
BEGIN
    SET ROLE anon;
    SELECT COUNT(*) INTO record_count FROM adjustment_codes;
    RESET ROLE;
    RAISE NOTICE '✅ Anon role can query adjustment_codes: % records found', record_count;
EXCEPTION WHEN OTHERS THEN
    RESET ROLE;
    RAISE NOTICE '❌ Anon role cannot query adjustment_codes: %', SQLERRM;
END $$;

SELECT '⚠️ After running this, wait 1-2 minutes for PostgREST to reload.' AS note;
SELECT '⚠️ If still not working, restart your Supabase project from Settings → General → Restart Project' AS note2;

