-- ============================================================================
-- FIX CLAIMS RELATIONSHIP ERROR - Refresh Schema Cache
-- ============================================================================
-- This script fixes the "Could not find a relationship between 'claims' and 'provider_id'"
-- error by refreshing the Supabase PostgREST schema cache
-- ============================================================================

-- Method 1: Notify PostgREST to reload schema (most common fix)
NOTIFY pgrst, 'reload schema';

-- Method 2: Alternative notification format
SELECT pg_notify('pgrst', 'reload schema');

-- Method 3: Reload config
NOTIFY pgrst, 'reload config';

-- Method 4: Verify foreign key constraints exist
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'claims'
ORDER BY tc.table_name, kcu.column_name;

-- Method 5: Verify claims table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'claims'
ORDER BY ordinal_position;

-- Method 6: Test direct queries to related tables
SELECT COUNT(*) as patients_count FROM patients;
SELECT COUNT(*) as providers_count FROM providers;
SELECT COUNT(*) as facilities_count FROM facilities;
SELECT COUNT(*) as insurance_payers_count FROM insurance_payers;
SELECT COUNT(*) as claims_count FROM claims;

-- Method 7: Verify RLS policies allow access
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('claims', 'patients', 'providers', 'facilities', 'insurance_payers')
ORDER BY tablename, policyname;

SELECT '✅ Schema cache refresh commands executed!' AS status;
SELECT '⚠️ Wait 1-2 minutes for PostgREST to refresh, then test your queries again.' AS note;
SELECT '💡 If the issue persists, try restarting your Supabase project in the dashboard.' AS tip;

