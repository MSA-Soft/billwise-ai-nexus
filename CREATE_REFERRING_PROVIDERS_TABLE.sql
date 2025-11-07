-- ============================================================================
-- REFERRING PROVIDERS TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the referring_providers table with all necessary columns, indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Create provider_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_type') THEN
        CREATE TYPE provider_type AS ENUM ('individual', 'organization');
    END IF;
END $$;

-- Referring Providers Table (Complete structure matching the component interface)
CREATE TABLE IF NOT EXISTS referring_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_initial VARCHAR(1),
    credentials VARCHAR(50),
    provider_type provider_type DEFAULT 'individual',
    referring_type VARCHAR(100),
    do_not_send_on_claims BOOLEAN DEFAULT false,
    npi VARCHAR(10) UNIQUE,
    taxonomy_specialty VARCHAR(100),
    sequence_number VARCHAR(50),
    reference_number VARCHAR(100),
    
    -- Contact Information
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    home_phone VARCHAR(20),
    cell_phone VARCHAR(20),
    phone VARCHAR(20),
    fax VARCHAR(20),
    pager VARCHAR(20),
    email VARCHAR(255),
    
    -- ID Numbers
    tax_id VARCHAR(50),
    tax_id_type VARCHAR(50),
    upin VARCHAR(50),
    bcbs_id VARCHAR(50),
    medicare_id VARCHAR(50),
    medicaid_id VARCHAR(50),
    champus_id VARCHAR(50),
    specialty_license_number VARCHAR(50),
    state_license_number VARCHAR(50),
    anesthesia_license_number VARCHAR(50),
    marketer VARCHAR(100),
    
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referring_providers' AND column_name = 'last_name') THEN
        ALTER TABLE referring_providers ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT 'Unknown';
        ALTER TABLE referring_providers ALTER COLUMN last_name DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referring_providers' AND column_name = 'first_name') THEN
        ALTER TABLE referring_providers ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT 'Unknown';
        ALTER TABLE referring_providers ALTER COLUMN first_name DROP DEFAULT;
    END IF;
    
    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referring_providers' AND column_name = 'is_active') THEN
        ALTER TABLE referring_providers ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Set is_active based on status
        UPDATE referring_providers SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
END $$;

-- Indexes for faster queries (only create if columns exist)
DO $$ 
BEGIN
    -- Create index on last_name if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referring_providers' AND column_name = 'last_name') THEN
        CREATE INDEX IF NOT EXISTS idx_referring_providers_last_name ON referring_providers(last_name);
    END IF;
    
    -- Create index on first_name if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referring_providers' AND column_name = 'first_name') THEN
        CREATE INDEX IF NOT EXISTS idx_referring_providers_first_name ON referring_providers(first_name);
    END IF;
    
    -- Create index on npi if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referring_providers' AND column_name = 'npi') THEN
        CREATE INDEX IF NOT EXISTS idx_referring_providers_npi ON referring_providers(npi);
    END IF;
    
    -- Create index on status if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referring_providers' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_referring_providers_status ON referring_providers(status);
    END IF;
    
    -- Create index on is_active if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referring_providers' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_referring_providers_active ON referring_providers(is_active);
    END IF;
    
    -- Create index on created_at if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referring_providers' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_referring_providers_created_at ON referring_providers(created_at);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE referring_providers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view referring providers" ON referring_providers;
DROP POLICY IF EXISTS "Users can create referring providers" ON referring_providers;
DROP POLICY IF EXISTS "Users can update referring providers" ON referring_providers;
DROP POLICY IF EXISTS "Users can delete referring providers" ON referring_providers;

-- RLS Policies
CREATE POLICY "Users can view referring providers"
    ON referring_providers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create referring providers"
    ON referring_providers FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update referring providers"
    ON referring_providers FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete referring providers"
    ON referring_providers FOR DELETE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_referring_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_referring_providers_updated_at ON referring_providers;
CREATE TRIGGER update_referring_providers_updated_at
    BEFORE UPDATE ON referring_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_referring_providers_updated_at();

-- Sync status and is_active columns
CREATE OR REPLACE FUNCTION sync_referring_providers_status()
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

DROP TRIGGER IF EXISTS sync_referring_providers_status ON referring_providers;
CREATE TRIGGER sync_referring_providers_status
    BEFORE INSERT OR UPDATE ON referring_providers
    FOR EACH ROW
    EXECUTE FUNCTION sync_referring_providers_status();

-- Verify table was created
SELECT '✅ Referring providers table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'referring_providers'
ORDER BY ordinal_position;

