-- ============================================================================
-- FIX ADJUSTMENT CODES TABLE - COMPREHENSIVE DIAGNOSTIC AND FIX
-- ============================================================================
-- This script will:
-- 1. Verify the table exists
-- 2. Check and fix permissions
-- 3. Grant access to anon and authenticated roles
-- 4. Refresh schema cache
-- 5. Test access
-- ============================================================================

-- Step 1: Verify table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'adjustment_codes'
    ) THEN
        RAISE EXCEPTION 'Table adjustment_codes does not exist! Please run CREATE_ADJUSTMENT_CODES_TABLE.sql first.';
    ELSE
        RAISE NOTICE '✅ Table adjustment_codes exists';
    END IF;
END $$;

-- Step 2: Ensure table is in public schema (not in a different schema)
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name = 'adjustment_codes';

-- Step 3: Grant USAGE on schema (if not already granted)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Step 4: Grant SELECT, INSERT, UPDATE, DELETE on table to anon and authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.adjustment_codes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.adjustment_codes TO authenticated;
GRANT ALL ON TABLE public.adjustment_codes TO service_role;

-- Step 5: Grant usage on sequence (for UUID generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 6: Verify RLS is enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'adjustment_codes'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE adjustment_codes ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS enabled on adjustment_codes';
    ELSE
        RAISE NOTICE '✅ RLS already enabled on adjustment_codes';
    END IF;
END $$;

-- Step 7: Ensure RLS policies exist (recreate if needed)
DROP POLICY IF EXISTS "Users can view adjustment codes" ON adjustment_codes;
DROP POLICY IF EXISTS "Users can create adjustment codes" ON adjustment_codes;
DROP POLICY IF EXISTS "Users can update adjustment codes" ON adjustment_codes;
DROP POLICY IF EXISTS "Users can delete adjustment codes" ON adjustment_codes;

CREATE POLICY "Users can view adjustment codes"
    ON adjustment_codes FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Users can create adjustment codes"
    ON adjustment_codes FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update adjustment codes"
    ON adjustment_codes FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete adjustment codes"
    ON adjustment_codes FOR DELETE
    TO anon, authenticated
    USING (true);

-- Step 8: Verify permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'adjustment_codes'
ORDER BY grantee, privilege_type;

-- Step 9: Verify RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'adjustment_codes';

-- Step 10: Test query (should work now)
SELECT COUNT(*) as total_records FROM adjustment_codes;

-- Step 11: Force PostgREST schema reload (multiple methods)
-- Method 1: Standard notify
NOTIFY pgrst, 'reload schema';

-- Method 2: Alternative notify format (using DO block)
DO $$
BEGIN
    PERFORM pg_notify('pgrst', 'reload schema');
END $$;

-- Method 3: Reload config (sometimes needed)
NOTIFY pgrst, 'reload config';

-- Step 12: Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'adjustment_codes'
ORDER BY ordinal_position;

-- Final verification
SELECT 
    '✅ Adjustment codes table is ready!' AS status,
    COUNT(*) as total_codes,
    COUNT(*) FILTER (WHERE status = 'active') as active_codes
FROM adjustment_codes;

SELECT '⚠️ If you still see schema cache errors, wait 1-2 minutes or restart your Supabase project.' AS note;

