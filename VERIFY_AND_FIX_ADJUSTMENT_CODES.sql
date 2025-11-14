-- ============================================================================
-- VERIFY AND FIX ADJUSTMENT CODES TABLE - FINAL SOLUTION
-- ============================================================================
-- This script will verify the table exists, fix all permissions, and
-- provide instructions if the issue persists
-- ============================================================================

-- Step 1: Verify table exists in public schema
SELECT 
    'Table Verification' AS step,
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name = 'adjustment_codes';

-- Step 2: If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.adjustment_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    adjustment_type VARCHAR(50) DEFAULT 'Credit',
    status VARCHAR(50) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(code)
);

-- Step 3: Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Step 4: Grant ALL permissions on the table
GRANT ALL ON TABLE public.adjustment_codes TO anon;
GRANT ALL ON TABLE public.adjustment_codes TO authenticated;
GRANT ALL ON TABLE public.adjustment_codes TO service_role;

-- Step 5: Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 6: Enable RLS
ALTER TABLE public.adjustment_codes ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop and recreate policies (ensuring anon access)
DROP POLICY IF EXISTS "Users can view adjustment codes" ON public.adjustment_codes;
DROP POLICY IF EXISTS "Users can create adjustment codes" ON public.adjustment_codes;
DROP POLICY IF EXISTS "Users can update adjustment codes" ON public.adjustment_codes;
DROP POLICY IF EXISTS "Users can delete adjustment codes" ON public.adjustment_codes;

-- Create policies that explicitly allow anon access
CREATE POLICY "anon_select_adjustment_codes"
    ON public.adjustment_codes FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "authenticated_select_adjustment_codes"
    ON public.adjustment_codes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "anon_insert_adjustment_codes"
    ON public.adjustment_codes FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "authenticated_insert_adjustment_codes"
    ON public.adjustment_codes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "anon_update_adjustment_codes"
    ON public.adjustment_codes FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "authenticated_update_adjustment_codes"
    ON public.adjustment_codes FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "anon_delete_adjustment_codes"
    ON public.adjustment_codes FOR DELETE
    TO anon
    USING (true);

CREATE POLICY "authenticated_delete_adjustment_codes"
    ON public.adjustment_codes FOR DELETE
    TO authenticated
    USING (true);

-- Step 8: Verify permissions
SELECT 
    'Permissions Check' AS step,
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name = 'adjustment_codes'
AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- Step 9: Verify RLS policies
SELECT 
    'RLS Policies Check' AS step,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'adjustment_codes'
ORDER BY policyname;

-- Step 10: Test as anon role
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    SET ROLE anon;
    SELECT COUNT(*) INTO test_count FROM public.adjustment_codes;
    RESET ROLE;
    RAISE NOTICE '✅ SUCCESS: Anon role can query adjustment_codes. Found % records.', test_count;
EXCEPTION WHEN OTHERS THEN
    RESET ROLE;
    RAISE NOTICE '❌ ERROR: Anon role cannot query: %', SQLERRM;
END $$;

-- Step 11: Force schema reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Step 12: Final verification
SELECT 
    '✅ Table is ready!' AS status,
    COUNT(*) as total_codes
FROM public.adjustment_codes;

-- IMPORTANT: If you still see errors after this, you MUST restart your Supabase project
SELECT 
    '⚠️ CRITICAL: If errors persist, go to Settings → General → Restart Project' AS instruction,
    'This is the ONLY way to force PostgREST to fully reload the schema cache' AS reason;

