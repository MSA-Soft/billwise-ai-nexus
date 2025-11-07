-- ============================================================================
-- CPT/HCPCS CODES TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the cpt_hcpcs_codes table with all necessary columns, indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- CPT/HCPCS Codes Table (Complete structure matching the component interface)
CREATE TABLE IF NOT EXISTS cpt_hcpcs_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    code VARCHAR(50) NOT NULL,
    type VARCHAR(50) DEFAULT 'CPT®/HCPCS', -- 'CPT®/HCPCS', 'ICD-10', 'Revenue'
    dept VARCHAR(100),
    description TEXT NOT NULL,
    
    -- Claim Defaults
    exclude_from_duplicate BOOLEAN DEFAULT false,
    all_inclusive BOOLEAN DEFAULT false,
    percentage_of_claim BOOLEAN DEFAULT false,
    default_price NUMERIC(10, 2) DEFAULT 0.00,
    default_units NUMERIC(10, 2) DEFAULT 1.00,
    default_charge_status VARCHAR(50),
    rev_code VARCHAR(50),
    place_of_service VARCHAR(50),
    clia_number VARCHAR(50),
    type_of_service VARCHAR(50),
    narrative_notes TEXT,
    additional_description TEXT,
    
    -- Modifiers
    global_modifier1 VARCHAR(10),
    global_modifier2 VARCHAR(10),
    global_modifier3 VARCHAR(10),
    global_modifier4 VARCHAR(10),
    
    -- Diagnosis Codes
    icd1 VARCHAR(50),
    icd2 VARCHAR(50),
    icd3 VARCHAR(50),
    icd4 VARCHAR(50),
    
    -- Billing Alerts
    global_surgery_period VARCHAR(50) DEFAULT 'None', -- 'None', '10 days', '90 days'
    prior_auth_requirements VARCHAR(50) DEFAULT 'None', -- 'None', 'All Payers', 'Certain Payers Only'
    
    -- Drug Information
    drug_price NUMERIC(10, 2) DEFAULT 0.00,
    drug_units NUMERIC(10, 2) DEFAULT 1.00,
    drug_units_measure VARCHAR(50) DEFAULT 'Unit (UN)', -- 'Unit (UN)', 'Milligram (MG)', 'Gram (G)'
    drug_code VARCHAR(50),
    drug_code_format VARCHAR(50), -- 'NDC', 'UPC'
    
    -- Effective/Termination Dates
    effective_date DATE,
    termination_date DATE,
    
    -- Superbill Options
    print_on_superbills BOOLEAN DEFAULT false,
    category VARCHAR(100),
    superbill_description TEXT,
    
    -- Statement Options
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'code') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN code VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN';
        ALTER TABLE cpt_hcpcs_codes ALTER COLUMN code DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'description') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN description TEXT NOT NULL DEFAULT 'No description';
        ALTER TABLE cpt_hcpcs_codes ALTER COLUMN description DROP DEFAULT;
    END IF;
    
    -- Add all component fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'type') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN type VARCHAR(50) DEFAULT 'CPT®/HCPCS';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'dept') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN dept VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'exclude_from_duplicate') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN exclude_from_duplicate BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'all_inclusive') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN all_inclusive BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'percentage_of_claim') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN percentage_of_claim BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'default_price') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN default_price NUMERIC(10, 2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'default_units') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN default_units NUMERIC(10, 2) DEFAULT 1.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'default_charge_status') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN default_charge_status VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'rev_code') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN rev_code VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'place_of_service') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN place_of_service VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'clia_number') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN clia_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'type_of_service') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN type_of_service VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'narrative_notes') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN narrative_notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'additional_description') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN additional_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'global_modifier1') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN global_modifier1 VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'global_modifier2') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN global_modifier2 VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'global_modifier3') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN global_modifier3 VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'global_modifier4') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN global_modifier4 VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'icd1') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN icd1 VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'icd2') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN icd2 VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'icd3') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN icd3 VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'icd4') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN icd4 VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'global_surgery_period') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN global_surgery_period VARCHAR(50) DEFAULT 'None';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'prior_auth_requirements') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN prior_auth_requirements VARCHAR(50) DEFAULT 'None';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'drug_price') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN drug_price NUMERIC(10, 2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'drug_units') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN drug_units NUMERIC(10, 2) DEFAULT 1.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'drug_units_measure') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN drug_units_measure VARCHAR(50) DEFAULT 'Unit (UN)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'drug_code') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN drug_code VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'drug_code_format') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN drug_code_format VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'effective_date') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN effective_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'termination_date') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN termination_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'print_on_superbills') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN print_on_superbills BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'category') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN category VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'superbill_description') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN superbill_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'statement_description') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN statement_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'status') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        -- Update existing rows based on is_active
        UPDATE cpt_hcpcs_codes SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    
    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'is_active') THEN
        ALTER TABLE cpt_hcpcs_codes ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Set is_active based on status
        UPDATE cpt_hcpcs_codes SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
END $$;

-- Indexes for faster queries (only create if columns exist)
DO $$ 
BEGIN
    -- Create index on code if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'code') THEN
        CREATE INDEX IF NOT EXISTS idx_cpt_hcpcs_codes_code ON cpt_hcpcs_codes(code);
    END IF;
    
    -- Create index on type if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_cpt_hcpcs_codes_type ON cpt_hcpcs_codes(type);
    END IF;
    
    -- Create index on status if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_cpt_hcpcs_codes_status ON cpt_hcpcs_codes(status);
    END IF;
    
    -- Create index on is_active if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_cpt_hcpcs_codes_active ON cpt_hcpcs_codes(is_active);
    END IF;
    
    -- Create index on category if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_cpt_hcpcs_codes_category ON cpt_hcpcs_codes(category);
    END IF;
    
    -- Create index on created_at if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpt_hcpcs_codes' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_cpt_hcpcs_codes_created_at ON cpt_hcpcs_codes(created_at);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE cpt_hcpcs_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view cpt hcpcs codes" ON cpt_hcpcs_codes;
DROP POLICY IF EXISTS "Users can create cpt hcpcs codes" ON cpt_hcpcs_codes;
DROP POLICY IF EXISTS "Users can update cpt hcpcs codes" ON cpt_hcpcs_codes;
DROP POLICY IF EXISTS "Users can delete cpt hcpcs codes" ON cpt_hcpcs_codes;

-- RLS Policies
CREATE POLICY "Users can view cpt hcpcs codes"
    ON cpt_hcpcs_codes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create cpt hcpcs codes"
    ON cpt_hcpcs_codes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update cpt hcpcs codes"
    ON cpt_hcpcs_codes FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete cpt hcpcs codes"
    ON cpt_hcpcs_codes FOR DELETE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cpt_hcpcs_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cpt_hcpcs_codes_updated_at ON cpt_hcpcs_codes;
CREATE TRIGGER update_cpt_hcpcs_codes_updated_at
    BEFORE UPDATE ON cpt_hcpcs_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_cpt_hcpcs_codes_updated_at();

-- Sync status and is_active columns
CREATE OR REPLACE FUNCTION sync_cpt_hcpcs_codes_status()
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

DROP TRIGGER IF EXISTS sync_cpt_hcpcs_codes_status ON cpt_hcpcs_codes;
CREATE TRIGGER sync_cpt_hcpcs_codes_status
    BEFORE INSERT OR UPDATE ON cpt_hcpcs_codes
    FOR EACH ROW
    EXECUTE FUNCTION sync_cpt_hcpcs_codes_status();

-- Verify table was created
SELECT '✅ CPT/HCPCS codes table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'cpt_hcpcs_codes'
ORDER BY ordinal_position;

