-- ============================================================================
-- INVENTORY CODES TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the inventory_codes table with all necessary columns, indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Inventory Codes Table (Complete structure matching the component interface)
CREATE TABLE IF NOT EXISTS inventory_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    code VARCHAR(50) NOT NULL,
    procedure_code VARCHAR(50),
    quantity INTEGER DEFAULT 0,
    
    -- Descriptions
    code_description TEXT,
    billing_description TEXT,
    
    -- Options
    use_alert BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active' or 'inactive'
    is_active BOOLEAN DEFAULT true, -- For backward compatibility
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint on code
    UNIQUE(code)
);

-- Add missing columns if table already exists (for backward compatibility)
DO $$ 
BEGIN
    -- Ensure required columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_codes' AND column_name = 'code') THEN
        ALTER TABLE inventory_codes ADD COLUMN code VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN';
        ALTER TABLE inventory_codes ALTER COLUMN code DROP DEFAULT;
    END IF;
    
    -- Add all component fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_codes' AND column_name = 'procedure_code') THEN
        ALTER TABLE inventory_codes ADD COLUMN procedure_code VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_codes' AND column_name = 'quantity') THEN
        ALTER TABLE inventory_codes ADD COLUMN quantity INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_codes' AND column_name = 'code_description') THEN
        ALTER TABLE inventory_codes ADD COLUMN code_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_codes' AND column_name = 'billing_description') THEN
        ALTER TABLE inventory_codes ADD COLUMN billing_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_codes' AND column_name = 'use_alert') THEN
        ALTER TABLE inventory_codes ADD COLUMN use_alert BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_codes' AND column_name = 'status') THEN
        ALTER TABLE inventory_codes ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        -- Update existing rows based on is_active
        UPDATE inventory_codes SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    
    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_codes' AND column_name = 'is_active') THEN
        ALTER TABLE inventory_codes ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Set is_active based on status
        UPDATE inventory_codes SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
END $$;

-- Indexes for faster queries
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_codes' AND column_name = 'code') THEN
        CREATE INDEX IF NOT EXISTS idx_inventory_codes_code ON inventory_codes(code);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_codes' AND column_name = 'procedure_code') THEN
        CREATE INDEX IF NOT EXISTS idx_inventory_codes_procedure_code ON inventory_codes(procedure_code);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_codes' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_inventory_codes_status ON inventory_codes(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_codes' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_inventory_codes_active ON inventory_codes(is_active);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_codes' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_inventory_codes_created_at ON inventory_codes(created_at);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE inventory_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view inventory codes" ON inventory_codes;
DROP POLICY IF EXISTS "Users can create inventory codes" ON inventory_codes;
DROP POLICY IF EXISTS "Users can update inventory codes" ON inventory_codes;
DROP POLICY IF EXISTS "Users can delete inventory codes" ON inventory_codes;

-- RLS Policies
CREATE POLICY "anon_select_inventory_codes"
    ON inventory_codes FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "authenticated_select_inventory_codes"
    ON inventory_codes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "anon_insert_inventory_codes"
    ON inventory_codes FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "authenticated_insert_inventory_codes"
    ON inventory_codes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "anon_update_inventory_codes"
    ON inventory_codes FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "authenticated_update_inventory_codes"
    ON inventory_codes FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "anon_delete_inventory_codes"
    ON inventory_codes FOR DELETE
    TO anon
    USING (true);

CREATE POLICY "authenticated_delete_inventory_codes"
    ON inventory_codes FOR DELETE
    TO authenticated
    USING (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.inventory_codes TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inventory_codes_updated_at ON inventory_codes;
CREATE TRIGGER update_inventory_codes_updated_at
    BEFORE UPDATE ON inventory_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_codes_updated_at();

-- Sync status and is_active columns
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

DROP TRIGGER IF EXISTS sync_inventory_codes_status ON inventory_codes;
CREATE TRIGGER sync_inventory_codes_status
    BEFORE INSERT OR UPDATE ON inventory_codes
    FOR EACH ROW
    EXECUTE FUNCTION sync_inventory_codes_status();

-- Verify table was created
SELECT '✅ Inventory codes table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'inventory_codes'
ORDER BY ordinal_position;

