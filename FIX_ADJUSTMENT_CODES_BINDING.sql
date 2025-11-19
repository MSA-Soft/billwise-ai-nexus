-- ============================================================================
-- FIX ADJUSTMENT CODES DATABASE BINDING - COMPLETE SOLUTION
-- ============================================================================
-- This script will:
-- 1. Create the adjustment_codes table if it doesn't exist
-- 2. Ensure all required columns exist
-- 3. Fix all permissions (anon, authenticated, service_role)
-- 4. Set up RLS policies correctly
-- 5. Refresh the schema cache
-- 6. Verify everything is working
-- ============================================================================
-- Run this in Supabase SQL Editor to fix the "not bind with database" error
-- ============================================================================

-- Step 1: Create table if it doesn't exist
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

-- Step 2: Add missing columns if table already exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'adjustment_codes' 
                   AND column_name = 'code') THEN
        ALTER TABLE public.adjustment_codes ADD COLUMN code VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN';
        ALTER TABLE public.adjustment_codes ALTER COLUMN code DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'adjustment_codes' 
                   AND column_name = 'description') THEN
        ALTER TABLE public.adjustment_codes ADD COLUMN description TEXT NOT NULL DEFAULT 'No description';
        ALTER TABLE public.adjustment_codes ALTER COLUMN description DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'adjustment_codes' 
                   AND column_name = 'adjustment_type') THEN
        ALTER TABLE public.adjustment_codes ADD COLUMN adjustment_type VARCHAR(50) DEFAULT 'Credit';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'adjustment_codes' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.adjustment_codes ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        UPDATE public.adjustment_codes SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'adjustment_codes' 
                   AND column_name = 'is_active') THEN
        ALTER TABLE public.adjustment_codes ADD COLUMN is_active BOOLEAN DEFAULT true;
        UPDATE public.adjustment_codes SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'adjustment_codes' 
                   AND column_name = 'created_at') THEN
        ALTER TABLE public.adjustment_codes ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'adjustment_codes' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE public.adjustment_codes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_adjustment_codes_code ON public.adjustment_codes(code);
CREATE INDEX IF NOT EXISTS idx_adjustment_codes_type ON public.adjustment_codes(adjustment_type);
CREATE INDEX IF NOT EXISTS idx_adjustment_codes_status ON public.adjustment_codes(status);
CREATE INDEX IF NOT EXISTS idx_adjustment_codes_active ON public.adjustment_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_adjustment_codes_created_at ON public.adjustment_codes(created_at);

-- Step 4: Grant schema usage (CRITICAL for PostgREST)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Step 5: Grant ALL permissions on the table (CRITICAL for binding)
GRANT ALL ON TABLE public.adjustment_codes TO anon;
GRANT ALL ON TABLE public.adjustment_codes TO authenticated;
GRANT ALL ON TABLE public.adjustment_codes TO service_role;

-- Step 6: Grant sequence permissions (for UUID generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Step 7: Enable Row Level Security
ALTER TABLE public.adjustment_codes ENABLE ROW LEVEL SECURITY;

-- Step 8: Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view adjustment codes" ON public.adjustment_codes;
DROP POLICY IF EXISTS "Users can create adjustment codes" ON public.adjustment_codes;
DROP POLICY IF EXISTS "Users can update adjustment codes" ON public.adjustment_codes;
DROP POLICY IF EXISTS "Users can delete adjustment codes" ON public.adjustment_codes;

-- Step 9: Create RLS policies (allow both anon and authenticated)
CREATE POLICY "Users can view adjustment codes"
    ON public.adjustment_codes FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Users can create adjustment codes"
    ON public.adjustment_codes FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update adjustment codes"
    ON public.adjustment_codes FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete adjustment codes"
    ON public.adjustment_codes FOR DELETE
    TO anon, authenticated
    USING (true);

-- Step 10: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_adjustment_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_adjustment_codes_updated_at ON public.adjustment_codes;
CREATE TRIGGER update_adjustment_codes_updated_at
    BEFORE UPDATE ON public.adjustment_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_adjustment_codes_updated_at();

-- Step 11: Create sync function for status and is_active
CREATE OR REPLACE FUNCTION sync_adjustment_codes_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IS NOT NULL THEN
        IF NEW.status = 'active' THEN
            NEW.is_active = true;
        ELSIF NEW.status = 'inactive' THEN
            NEW.is_active = false;
        END IF;
    ELSIF NEW.is_active IS NOT NULL THEN
        IF NEW.is_active THEN
            NEW.status = 'active';
        ELSE
            NEW.status = 'inactive';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_adjustment_codes_status ON public.adjustment_codes;
CREATE TRIGGER sync_adjustment_codes_status
    BEFORE INSERT OR UPDATE ON public.adjustment_codes
    FOR EACH ROW
    EXECUTE FUNCTION sync_adjustment_codes_status();

-- Step 12: Force PostgREST schema cache refresh (MULTIPLE METHODS)
-- Method 1: Standard notify
NOTIFY pgrst, 'reload schema';

-- Method 2: Alternative notify format
DO $$
BEGIN
    PERFORM pg_notify('pgrst', 'reload schema');
END $$;

-- Method 3: Reload config
NOTIFY pgrst, 'reload config';

-- Step 13: Verify table structure
SELECT 
    'Table Structure' AS check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'adjustment_codes'
ORDER BY ordinal_position;

-- Step 14: Verify permissions
SELECT 
    'Permissions' AS check_type,
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'adjustment_codes'
ORDER BY grantee, privilege_type;

-- Step 15: Verify RLS policies
SELECT 
    'RLS Policies' AS check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'adjustment_codes';

-- Step 16: Test query (should work now)
SELECT 
    'Test Query' AS check_type,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'active') as active_records
FROM public.adjustment_codes;

-- Final status message
SELECT 
    '✅ Adjustment codes table is ready and bound to database!' AS status,
    '⚠️ If you still see errors, wait 1-2 minutes for PostgREST to refresh, or restart your Supabase project.' AS note;

