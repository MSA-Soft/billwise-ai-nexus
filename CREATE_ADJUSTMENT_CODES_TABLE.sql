-- ============================================================================
-- ADJUSTMENT CODES TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the adjustment_codes table with all necessary columns, indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Adjustment Codes Table (Complete structure matching the component interface)
CREATE TABLE IF NOT EXISTS adjustment_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    adjustment_type VARCHAR(50) DEFAULT 'Credit', -- 'Credit', 'Debit', 'Discount', 'Write-off'
    
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adjustment_codes' AND column_name = 'code') THEN
        ALTER TABLE adjustment_codes ADD COLUMN code VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN';
        ALTER TABLE adjustment_codes ALTER COLUMN code DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adjustment_codes' AND column_name = 'description') THEN
        ALTER TABLE adjustment_codes ADD COLUMN description TEXT NOT NULL DEFAULT 'No description';
        ALTER TABLE adjustment_codes ALTER COLUMN description DROP DEFAULT;
    END IF;
    
    -- Add all component fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adjustment_codes' AND column_name = 'adjustment_type') THEN
        ALTER TABLE adjustment_codes ADD COLUMN adjustment_type VARCHAR(50) DEFAULT 'Credit';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adjustment_codes' AND column_name = 'status') THEN
        ALTER TABLE adjustment_codes ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        -- Update existing rows based on is_active
        UPDATE adjustment_codes SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    
    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adjustment_codes' AND column_name = 'is_active') THEN
        ALTER TABLE adjustment_codes ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Set is_active based on status
        UPDATE adjustment_codes SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
END $$;

-- Indexes for faster queries (only create if columns exist)
DO $$ 
BEGIN
    -- Create index on code if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adjustment_codes' AND column_name = 'code') THEN
        CREATE INDEX IF NOT EXISTS idx_adjustment_codes_code ON adjustment_codes(code);
    END IF;
    
    -- Create index on adjustment_type if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adjustment_codes' AND column_name = 'adjustment_type') THEN
        CREATE INDEX IF NOT EXISTS idx_adjustment_codes_type ON adjustment_codes(adjustment_type);
    END IF;
    
    -- Create index on status if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adjustment_codes' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_adjustment_codes_status ON adjustment_codes(status);
    END IF;
    
    -- Create index on is_active if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adjustment_codes' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_adjustment_codes_active ON adjustment_codes(is_active);
    END IF;
    
    -- Create index on created_at if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adjustment_codes' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_adjustment_codes_created_at ON adjustment_codes(created_at);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE adjustment_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view adjustment codes" ON adjustment_codes;
DROP POLICY IF EXISTS "Users can create adjustment codes" ON adjustment_codes;
DROP POLICY IF EXISTS "Users can update adjustment codes" ON adjustment_codes;
DROP POLICY IF EXISTS "Users can delete adjustment codes" ON adjustment_codes;

-- RLS Policies
CREATE POLICY "Users can view adjustment codes"
    ON adjustment_codes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create adjustment codes"
    ON adjustment_codes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update adjustment codes"
    ON adjustment_codes FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete adjustment codes"
    ON adjustment_codes FOR DELETE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_adjustment_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_adjustment_codes_updated_at ON adjustment_codes;
CREATE TRIGGER update_adjustment_codes_updated_at
    BEFORE UPDATE ON adjustment_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_adjustment_codes_updated_at();

-- Sync status and is_active columns
CREATE OR REPLACE FUNCTION sync_adjustment_codes_status()
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

DROP TRIGGER IF EXISTS sync_adjustment_codes_status ON adjustment_codes;
CREATE TRIGGER sync_adjustment_codes_status
    BEFORE INSERT OR UPDATE ON adjustment_codes
    FOR EACH ROW
    EXECUTE FUNCTION sync_adjustment_codes_status();

-- Verify table was created
SELECT '✅ Adjustment codes table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'adjustment_codes'
ORDER BY ordinal_position;

