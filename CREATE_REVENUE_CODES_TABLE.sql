-- ============================================================================
-- REVENUE CODES TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the revenue_codes table with all necessary columns, indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Revenue Codes Table (Complete structure matching the component interface)
CREATE TABLE IF NOT EXISTS revenue_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0.00,
    
    -- Options
    exclude_from_duplicate BOOLEAN DEFAULT false,
    statement_description TEXT,
    
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'revenue_codes' AND column_name = 'code') THEN
        ALTER TABLE revenue_codes ADD COLUMN code VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN';
        ALTER TABLE revenue_codes ALTER COLUMN code DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'revenue_codes' AND column_name = 'description') THEN
        ALTER TABLE revenue_codes ADD COLUMN description TEXT NOT NULL DEFAULT 'No description';
        ALTER TABLE revenue_codes ALTER COLUMN description DROP DEFAULT;
    END IF;
    
    -- Add all component fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'revenue_codes' AND column_name = 'price') THEN
        ALTER TABLE revenue_codes ADD COLUMN price NUMERIC(10, 2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'revenue_codes' AND column_name = 'exclude_from_duplicate') THEN
        ALTER TABLE revenue_codes ADD COLUMN exclude_from_duplicate BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'revenue_codes' AND column_name = 'statement_description') THEN
        ALTER TABLE revenue_codes ADD COLUMN statement_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'revenue_codes' AND column_name = 'status') THEN
        ALTER TABLE revenue_codes ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        -- Update existing rows based on is_active
        UPDATE revenue_codes SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    
    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'revenue_codes' AND column_name = 'is_active') THEN
        ALTER TABLE revenue_codes ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Set is_active based on status
        UPDATE revenue_codes SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
END $$;

-- Indexes for faster queries (only create if columns exist)
DO $$ 
BEGIN
    -- Create index on code if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'revenue_codes' AND column_name = 'code') THEN
        CREATE INDEX IF NOT EXISTS idx_revenue_codes_code ON revenue_codes(code);
    END IF;
    
    -- Create index on status if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'revenue_codes' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_revenue_codes_status ON revenue_codes(status);
    END IF;
    
    -- Create index on is_active if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'revenue_codes' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_revenue_codes_active ON revenue_codes(is_active);
    END IF;
    
    -- Create index on created_at if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'revenue_codes' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_revenue_codes_created_at ON revenue_codes(created_at);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE revenue_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view revenue codes" ON revenue_codes;
DROP POLICY IF EXISTS "Users can create revenue codes" ON revenue_codes;
DROP POLICY IF EXISTS "Users can update revenue codes" ON revenue_codes;
DROP POLICY IF EXISTS "Users can delete revenue codes" ON revenue_codes;

-- RLS Policies
CREATE POLICY "Users can view revenue codes"
    ON revenue_codes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create revenue codes"
    ON revenue_codes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update revenue codes"
    ON revenue_codes FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete revenue codes"
    ON revenue_codes FOR DELETE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_revenue_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_revenue_codes_updated_at ON revenue_codes;
CREATE TRIGGER update_revenue_codes_updated_at
    BEFORE UPDATE ON revenue_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_revenue_codes_updated_at();

-- Sync status and is_active columns
CREATE OR REPLACE FUNCTION sync_revenue_codes_status()
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

DROP TRIGGER IF EXISTS sync_revenue_codes_status ON revenue_codes;
CREATE TRIGGER sync_revenue_codes_status
    BEFORE INSERT OR UPDATE ON revenue_codes
    FOR EACH ROW
    EXECUTE FUNCTION sync_revenue_codes_status();

-- Verify table was created
SELECT '✅ Revenue codes table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'revenue_codes'
ORDER BY ordinal_position;

