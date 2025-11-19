-- ============================================================================
-- DIAGNOSIS CODES TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the diagnosis_codes table with all necessary columns, indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Diagnosis Codes Table (Complete structure matching the component interface)
CREATE TABLE IF NOT EXISTS diagnosis_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    code VARCHAR(50) NOT NULL,
    code_type VARCHAR(50) DEFAULT 'ICD-10', -- 'ICD-10', 'ICD-9', 'DSM-5'
    description TEXT NOT NULL,
    
    -- Dates
    effective_date DATE,
    termination_date DATE,
    
    -- Default Procedure Codes (CPT codes associated with this diagnosis)
    cpt1 VARCHAR(50),
    cpt2 VARCHAR(50),
    cpt3 VARCHAR(50),
    cpt4 VARCHAR(50),
    cpt5 VARCHAR(50),
    cpt6 VARCHAR(50),
    
    -- Superbill Options
    print_on_superbill BOOLEAN DEFAULT false,
    superbill_description TEXT,
    
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'code') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN code VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN';
        ALTER TABLE diagnosis_codes ALTER COLUMN code DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'description') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN description TEXT NOT NULL DEFAULT 'No description';
        ALTER TABLE diagnosis_codes ALTER COLUMN description DROP DEFAULT;
    END IF;
    
    -- Add all component fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'code_type') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN code_type VARCHAR(50) DEFAULT 'ICD-10';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'effective_date') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN effective_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'termination_date') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN termination_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'cpt1') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN cpt1 VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'cpt2') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN cpt2 VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'cpt3') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN cpt3 VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'cpt4') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN cpt4 VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'cpt5') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN cpt5 VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'cpt6') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN cpt6 VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'print_on_superbill') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN print_on_superbill BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'superbill_description') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN superbill_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'status') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        -- Update existing rows based on is_active
        UPDATE diagnosis_codes SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    
    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'is_active') THEN
        ALTER TABLE diagnosis_codes ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Set is_active based on status
        UPDATE diagnosis_codes SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
END $$;

-- Indexes for faster queries (only create if columns exist)
DO $$ 
BEGIN
    -- Create index on code if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'code') THEN
        CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_code ON diagnosis_codes(code);
    END IF;
    
    -- Create index on code_type if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'code_type') THEN
        CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_type ON diagnosis_codes(code_type);
    END IF;
    
    -- Create index on status if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_status ON diagnosis_codes(status);
    END IF;
    
    -- Create index on is_active if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_active ON diagnosis_codes(is_active);
    END IF;
    
    -- Create index on created_at if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_codes' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_created_at ON diagnosis_codes(created_at);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE diagnosis_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view diagnosis codes" ON diagnosis_codes;
DROP POLICY IF EXISTS "Users can create diagnosis codes" ON diagnosis_codes;
DROP POLICY IF EXISTS "Users can update diagnosis codes" ON diagnosis_codes;
DROP POLICY IF EXISTS "Users can delete diagnosis codes" ON diagnosis_codes;

-- RLS Policies
CREATE POLICY "Users can view diagnosis codes"
    ON diagnosis_codes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create diagnosis codes"
    ON diagnosis_codes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update diagnosis codes"
    ON diagnosis_codes FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete diagnosis codes"
    ON diagnosis_codes FOR DELETE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_diagnosis_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_diagnosis_codes_updated_at ON diagnosis_codes;
CREATE TRIGGER update_diagnosis_codes_updated_at
    BEFORE UPDATE ON diagnosis_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_diagnosis_codes_updated_at();

-- Sync status and is_active columns
CREATE OR REPLACE FUNCTION sync_diagnosis_codes_status()
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

DROP TRIGGER IF EXISTS sync_diagnosis_codes_status ON diagnosis_codes;
CREATE TRIGGER sync_diagnosis_codes_status
    BEFORE INSERT OR UPDATE ON diagnosis_codes
    FOR EACH ROW
    EXECUTE FUNCTION sync_diagnosis_codes_status();

-- Verify table was created
SELECT '✅ Diagnosis codes table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'diagnosis_codes'
ORDER BY ordinal_position;

