-- ============================================================================
-- INSURANCE PAYERS TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the insurance_payers table with all necessary columns, indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Insurance Payers Table (Complete structure matching the component interface)
CREATE TABLE IF NOT EXISTS insurance_payers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    plan_name VARCHAR(255),
    network_status VARCHAR(50),
    payer_type VARCHAR(50),
    default_charge_status VARCHAR(100),
    clearinghouse_processing_mode VARCHAR(255),
    sequence_number VARCHAR(50),
    reference_number VARCHAR(100),
    payer_id_code VARCHAR(50), -- X12 payer ID
    
    -- Contact Information
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- ID Numbers
    group_number VARCHAR(50),
    claim_office_number VARCHAR(50),
    payer_id_medigap VARCHAR(50),
    ocna VARCHAR(50),
    
    -- Settings
    use_alternate_practice_info BOOLEAN DEFAULT false,
    
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'name') THEN
        ALTER TABLE insurance_payers ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Unknown Payer';
        ALTER TABLE insurance_payers ALTER COLUMN name DROP DEFAULT;
    END IF;
    
    -- Add all component fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'plan_name') THEN
        ALTER TABLE insurance_payers ADD COLUMN plan_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'network_status') THEN
        ALTER TABLE insurance_payers ADD COLUMN network_status VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'payer_type') THEN
        ALTER TABLE insurance_payers ADD COLUMN payer_type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'default_charge_status') THEN
        ALTER TABLE insurance_payers ADD COLUMN default_charge_status VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'clearinghouse_processing_mode') THEN
        ALTER TABLE insurance_payers ADD COLUMN clearinghouse_processing_mode VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'sequence_number') THEN
        ALTER TABLE insurance_payers ADD COLUMN sequence_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'reference_number') THEN
        ALTER TABLE insurance_payers ADD COLUMN reference_number VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'payer_id_code') THEN
        ALTER TABLE insurance_payers ADD COLUMN payer_id_code VARCHAR(50);
    END IF;
    
    -- Ensure address column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'address') THEN
        ALTER TABLE insurance_payers ADD COLUMN address TEXT;
    END IF;
    
    -- Ensure city column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'city') THEN
        ALTER TABLE insurance_payers ADD COLUMN city VARCHAR(100);
    END IF;
    
    -- Ensure state column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'state') THEN
        ALTER TABLE insurance_payers ADD COLUMN state VARCHAR(50);
    END IF;
    
    -- Ensure phone column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'phone') THEN
        ALTER TABLE insurance_payers ADD COLUMN phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'zip_code') THEN
        -- Check if zip column exists (old name)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'zip') THEN
            ALTER TABLE insurance_payers RENAME COLUMN zip TO zip_code;
        ELSE
            ALTER TABLE insurance_payers ADD COLUMN zip_code VARCHAR(20);
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'fax') THEN
        ALTER TABLE insurance_payers ADD COLUMN fax VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'email') THEN
        ALTER TABLE insurance_payers ADD COLUMN email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'website') THEN
        ALTER TABLE insurance_payers ADD COLUMN website VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'group_number') THEN
        ALTER TABLE insurance_payers ADD COLUMN group_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'claim_office_number') THEN
        ALTER TABLE insurance_payers ADD COLUMN claim_office_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'payer_id_medigap') THEN
        ALTER TABLE insurance_payers ADD COLUMN payer_id_medigap VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'ocna') THEN
        ALTER TABLE insurance_payers ADD COLUMN ocna VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'use_alternate_practice_info') THEN
        ALTER TABLE insurance_payers ADD COLUMN use_alternate_practice_info BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'status') THEN
        ALTER TABLE insurance_payers ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        -- Update existing rows based on is_active
        UPDATE insurance_payers SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    
    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'is_active') THEN
        ALTER TABLE insurance_payers ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Set is_active based on status
        UPDATE insurance_payers SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
END $$;

-- Indexes for faster queries (only create if columns exist)
DO $$ 
BEGIN
    -- Create index on name if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'name') THEN
        CREATE INDEX IF NOT EXISTS idx_insurance_payers_name ON insurance_payers(name);
    END IF;
    
    -- Create index on payer_id_code if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'payer_id_code') THEN
        CREATE INDEX IF NOT EXISTS idx_insurance_payers_payer_id_code ON insurance_payers(payer_id_code);
    END IF;
    
    -- Create index on status if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_insurance_payers_status ON insurance_payers(status);
    END IF;
    
    -- Create index on is_active if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_insurance_payers_active ON insurance_payers(is_active);
    END IF;
    
    -- Create index on payer_type if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'payer_type') THEN
        CREATE INDEX IF NOT EXISTS idx_insurance_payers_payer_type ON insurance_payers(payer_type);
    END IF;
    
    -- Create index on created_at if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_payers' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_insurance_payers_created_at ON insurance_payers(created_at);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE insurance_payers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view insurance payers" ON insurance_payers;
DROP POLICY IF EXISTS "Users can create insurance payers" ON insurance_payers;
DROP POLICY IF EXISTS "Users can update insurance payers" ON insurance_payers;
DROP POLICY IF EXISTS "Users can delete insurance payers" ON insurance_payers;

-- RLS Policies
CREATE POLICY "Users can view insurance payers"
    ON insurance_payers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create insurance payers"
    ON insurance_payers FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update insurance payers"
    ON insurance_payers FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete insurance payers"
    ON insurance_payers FOR DELETE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_insurance_payers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_insurance_payers_updated_at ON insurance_payers;
CREATE TRIGGER update_insurance_payers_updated_at
    BEFORE UPDATE ON insurance_payers
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_payers_updated_at();

-- Sync status and is_active columns
CREATE OR REPLACE FUNCTION sync_insurance_payers_status()
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

DROP TRIGGER IF EXISTS sync_insurance_payers_status ON insurance_payers;
CREATE TRIGGER sync_insurance_payers_status
    BEFORE INSERT OR UPDATE ON insurance_payers
    FOR EACH ROW
    EXECUTE FUNCTION sync_insurance_payers_status();

-- Verify table was created
SELECT '✅ Insurance payers table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'insurance_payers'
ORDER BY ordinal_position;

