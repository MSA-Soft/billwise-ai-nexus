CREATE TABLE IF NOT EXISTS public.inventory_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    procedure_code VARCHAR(50),
    quantity INTEGER DEFAULT 0,
    code_description TEXT,
    billing_description TEXT,
    use_alert BOOLEAN DEFAULT false,
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
                   AND table_name = 'inventory_codes' 
                   AND column_name = 'code') THEN
        ALTER TABLE public.inventory_codes ADD COLUMN code VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN';
        ALTER TABLE public.inventory_codes ALTER COLUMN code DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'inventory_codes' 
                   AND column_name = 'procedure_code') THEN
        ALTER TABLE public.inventory_codes ADD COLUMN procedure_code VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'inventory_codes' 
                   AND column_name = 'quantity') THEN
        ALTER TABLE public.inventory_codes ADD COLUMN quantity INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'inventory_codes' 
                   AND column_name = 'code_description') THEN
        ALTER TABLE public.inventory_codes ADD COLUMN code_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'inventory_codes' 
                   AND column_name = 'billing_description') THEN
        ALTER TABLE public.inventory_codes ADD COLUMN billing_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'inventory_codes' 
                   AND column_name = 'use_alert') THEN
        ALTER TABLE public.inventory_codes ADD COLUMN use_alert BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'inventory_codes' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.inventory_codes ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        UPDATE public.inventory_codes SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'inventory_codes' 
                   AND column_name = 'is_active') THEN
        ALTER TABLE public.inventory_codes ADD COLUMN is_active BOOLEAN DEFAULT true;
        UPDATE public.inventory_codes SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'inventory_codes' 
                   AND column_name = 'created_at') THEN
        ALTER TABLE public.inventory_codes ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'inventory_codes' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE public.inventory_codes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_codes_code ON public.inventory_codes(code);
CREATE INDEX IF NOT EXISTS idx_inventory_codes_procedure_code ON public.inventory_codes(procedure_code);
CREATE INDEX IF NOT EXISTS idx_inventory_codes_status ON public.inventory_codes(status);
CREATE INDEX IF NOT EXISTS idx_inventory_codes_active ON public.inventory_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_codes_created_at ON public.inventory_codes(created_at);

-- Step 4: Grant schema usage (CRITICAL for PostgREST)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Step 5: Grant ALL permissions on the table (CRITICAL for binding)
GRANT ALL ON TABLE public.inventory_codes TO anon;
GRANT ALL ON TABLE public.inventory_codes TO authenticated;
GRANT ALL ON TABLE public.inventory_codes TO service_role;

-- Step 6: Grant sequence permissions (for UUID generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Step 7: Enable Row Level Security
ALTER TABLE public.inventory_codes ENABLE ROW LEVEL SECURITY;

-- Step 8: Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view inventory codes" ON public.inventory_codes;
DROP POLICY IF EXISTS "Users can create inventory codes" ON public.inventory_codes;
DROP POLICY IF EXISTS "Users can update inventory codes" ON public.inventory_codes;
DROP POLICY IF EXISTS "Users can delete inventory codes" ON public.inventory_codes;
DROP POLICY IF EXISTS "anon_select_inventory_codes" ON public.inventory_codes;
DROP POLICY IF EXISTS "authenticated_select_inventory_codes" ON public.inventory_codes;
DROP POLICY IF EXISTS "anon_insert_inventory_codes" ON public.inventory_codes;
DROP POLICY IF EXISTS "authenticated_insert_inventory_codes" ON public.inventory_codes;
DROP POLICY IF EXISTS "anon_update_inventory_codes" ON public.inventory_codes;
DROP POLICY IF EXISTS "authenticated_update_inventory_codes" ON public.inventory_codes;
DROP POLICY IF EXISTS "anon_delete_inventory_codes" ON public.inventory_codes;
DROP POLICY IF EXISTS "authenticated_delete_inventory_codes" ON public.inventory_codes;

-- Step 9: Create RLS policies (allow both anon and authenticated)
CREATE POLICY "Users can view inventory codes"
    ON public.inventory_codes FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Users can create inventory codes"
    ON public.inventory_codes FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update inventory codes"
    ON public.inventory_codes FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete inventory codes"
    ON public.inventory_codes FOR DELETE
    TO anon, authenticated
    USING (true);

-- Step 10: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_inventory_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inventory_codes_updated_at ON public.inventory_codes;
CREATE TRIGGER update_inventory_codes_updated_at
    BEFORE UPDATE ON public.inventory_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_codes_updated_at();

-- Step 11: Create sync function for status and is_active
CREATE OR REPLACE FUNCTION sync_inventory_codes_status()
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

DROP TRIGGER IF EXISTS sync_inventory_codes_status ON public.inventory_codes;
CREATE TRIGGER sync_inventory_codes_status
    BEFORE INSERT OR UPDATE ON public.inventory_codes
    FOR EACH ROW
    EXECUTE FUNCTION sync_inventory_codes_status();

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
AND table_name = 'inventory_codes'
ORDER BY ordinal_position;

-- Step 14: Verify permissions
SELECT 
    'Permissions' AS check_type,
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'inventory_codes'
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
AND tablename = 'inventory_codes';

-- Step 16: Test query (should work now)
SELECT 
    'Test Query' AS check_type,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'active') as active_records
FROM public.inventory_codes;

-- Final status message
SELECT 
    '✅ Inventory codes table is ready and bound to database!' AS status,
    '⚠️ If you still see errors, wait 1-2 minutes for PostgREST to refresh, or restart your Supabase project.' AS note;



























