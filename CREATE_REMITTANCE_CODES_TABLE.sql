-- ============================================================================
-- REMITTANCE CODES TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the remittance_codes table with all necessary columns, indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Remittance Codes Table (Complete structure matching the component interface)
CREATE TABLE IF NOT EXISTS remittance_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    code VARCHAR(50) NOT NULL,
    type VARCHAR(50) DEFAULT 'Adj Reason', -- 'Adj Reason', 'Remark', 'Denial'
    information_level TEXT DEFAULT 'INFO - This code represents general information only.',
    
    -- Report Options
    include_on_denial_reports BOOLEAN DEFAULT false,
    include_on_adjustment_reports BOOLEAN DEFAULT false,
    
    -- Descriptions
    report_description TEXT,
    long_description TEXT,
    
    -- Options
    use_memoline BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active' or 'inactive'
    is_active BOOLEAN DEFAULT true, -- For backward compatibility
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists (for backward compatibility)
DO $$ 
BEGIN
    -- Ensure required columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'code') THEN
        ALTER TABLE remittance_codes ADD COLUMN code VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN';
        ALTER TABLE remittance_codes ALTER COLUMN code DROP DEFAULT;
    END IF;
    
    -- Add all component fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'type') THEN
        ALTER TABLE remittance_codes ADD COLUMN type VARCHAR(50) DEFAULT 'Adj Reason';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'information_level') THEN
        ALTER TABLE remittance_codes ADD COLUMN information_level TEXT DEFAULT 'INFO - This code represents general information only.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'include_on_denial_reports') THEN
        ALTER TABLE remittance_codes ADD COLUMN include_on_denial_reports BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'include_on_adjustment_reports') THEN
        ALTER TABLE remittance_codes ADD COLUMN include_on_adjustment_reports BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'report_description') THEN
        ALTER TABLE remittance_codes ADD COLUMN report_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'long_description') THEN
        ALTER TABLE remittance_codes ADD COLUMN long_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'use_memoline') THEN
        ALTER TABLE remittance_codes ADD COLUMN use_memoline BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'status') THEN
        ALTER TABLE remittance_codes ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        -- Update existing rows based on is_active
        UPDATE remittance_codes SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    
    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'is_active') THEN
        ALTER TABLE remittance_codes ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Set is_active based on status
        UPDATE remittance_codes SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
END $$;

-- Indexes for faster queries (only create if columns exist)
DO $$ 
BEGIN
    -- Create index on code if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'code') THEN
        CREATE INDEX IF NOT EXISTS idx_remittance_codes_code ON remittance_codes(code);
    END IF;
    
    -- Create index on type if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_remittance_codes_type ON remittance_codes(type);
    END IF;
    
    -- Create index on status if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_remittance_codes_status ON remittance_codes(status);
    END IF;
    
    -- Create index on is_active if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_remittance_codes_active ON remittance_codes(is_active);
    END IF;
    
    -- Create index on created_at if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'remittance_codes' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_remittance_codes_created_at ON remittance_codes(created_at);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE remittance_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view remittance codes" ON remittance_codes;
DROP POLICY IF EXISTS "Users can create remittance codes" ON remittance_codes;
DROP POLICY IF EXISTS "Users can update remittance codes" ON remittance_codes;
DROP POLICY IF EXISTS "Users can delete remittance codes" ON remittance_codes;

-- RLS Policies
CREATE POLICY "Users can view remittance codes"
    ON remittance_codes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create remittance codes"
    ON remittance_codes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update remittance codes"
    ON remittance_codes FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete remittance codes"
    ON remittance_codes FOR DELETE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_remittance_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_remittance_codes_updated_at ON remittance_codes;
CREATE TRIGGER update_remittance_codes_updated_at
    BEFORE UPDATE ON remittance_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_remittance_codes_updated_at();

-- Sync status and is_active columns
CREATE OR REPLACE FUNCTION sync_remittance_codes_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Keep is_active in sync with status
    IF NEW.status IS NOT NULL THEN
        IF NEW.status = 'active' THEN
            NEW.is_active = true;
        ELSIF NEW.status = 'inactive' THEN
            NEW.is_active = false;
        END IF;
    ELSIF NEW.is_active IS NOT NULL THEN
        -- If status is not set but is_active is, sync status from is_active
        IF NEW.is_active THEN
            NEW.status = 'active';
        ELSE
            NEW.status = 'inactive';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_remittance_codes_status ON remittance_codes;
CREATE TRIGGER sync_remittance_codes_status
    BEFORE INSERT OR UPDATE ON remittance_codes
    FOR EACH ROW
    EXECUTE FUNCTION sync_remittance_codes_status();

-- Verify table was created
SELECT '✅ Remittance codes table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'remittance_codes'
ORDER BY ordinal_position;

