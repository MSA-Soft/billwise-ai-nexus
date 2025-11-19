-- ============================================================================
-- FACILITIES TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the facilities table with all necessary columns, indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Facilities Table (Complete structure matching the component interface)
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- General Information
    name VARCHAR(255) NOT NULL, -- Primary name field
    facility_name TEXT, -- Alternative name field (for backward compatibility)
    npi VARCHAR(10),
    taxonomy_specialty VARCHAR(100),
    sequence_number VARCHAR(50),
    reference_number VARCHAR(100),
    
    -- Contact Information
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(255),
    
    -- ID Numbers
    tax_id VARCHAR(50),
    clia_id VARCHAR(50),
    location_provider_id VARCHAR(50),
    site_id VARCHAR(50),
    blue_cross_id VARCHAR(50),
    blue_shield_id VARCHAR(50),
    medicare_id VARCHAR(50),
    medicaid_id VARCHAR(50),
    locator_code VARCHAR(50),
    
    -- Claim Defaults
    place_of_service VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active' or 'inactive'
    is_active BOOLEAN DEFAULT true, -- For backward compatibility
    facility_type TEXT, -- Type of facility
    
    -- User association (nullable - facilities are not always tied to auth users)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists (for backward compatibility)
DO $$ 
BEGIN
    -- Ensure name/facility_name columns exist (required field)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facilities' AND column_name = 'name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facilities' AND column_name = 'facility_name'
    ) THEN
        ALTER TABLE facilities ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Unnamed Facility';
        ALTER TABLE facilities ALTER COLUMN name DROP DEFAULT;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facilities' AND column_name = 'facility_name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facilities' AND column_name = 'name'
    ) THEN
        -- If facility_name exists but name doesn't, add name and sync
        ALTER TABLE facilities ADD COLUMN name VARCHAR(255);
        UPDATE facilities SET name = facility_name WHERE name IS NULL;
        ALTER TABLE facilities ALTER COLUMN name SET NOT NULL;
    END IF;
    
    -- Ensure facility_name exists (for backward compatibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facilities' AND column_name = 'facility_name'
    ) THEN
        ALTER TABLE facilities ADD COLUMN facility_name TEXT;
        -- Sync from name if name exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'name') THEN
            UPDATE facilities SET facility_name = name WHERE facility_name IS NULL;
        END IF;
    END IF;
    
    -- Handle address columns (address_line1, address_line2 instead of address)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facilities' AND column_name = 'address_line1'
    ) THEN
        -- Check if old 'address' column exists and migrate
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'address') THEN
            ALTER TABLE facilities ADD COLUMN address_line1 TEXT;
            UPDATE facilities SET address_line1 = address WHERE address IS NOT NULL;
            ALTER TABLE facilities DROP COLUMN IF EXISTS address;
        ELSE
            ALTER TABLE facilities ADD COLUMN address_line1 TEXT;
        END IF;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facilities' AND column_name = 'address_line2'
    ) THEN
        ALTER TABLE facilities ADD COLUMN address_line2 TEXT;
    END IF;
    
    -- Ensure facility_type exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facilities' AND column_name = 'facility_type'
    ) THEN
        ALTER TABLE facilities ADD COLUMN facility_type TEXT;
    END IF;
    
    -- Handle user_id (make it nullable if it exists as NOT NULL)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facilities' AND column_name = 'user_id'
    ) THEN
        -- Make user_id nullable if it's currently NOT NULL
        ALTER TABLE facilities ALTER COLUMN user_id DROP NOT NULL;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facilities' AND column_name = 'status'
    ) THEN
        ALTER TABLE facilities ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        -- Update existing rows based on is_active
        UPDATE facilities SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    
    -- Add other missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'npi') THEN
        ALTER TABLE facilities ADD COLUMN npi VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'taxonomy_specialty') THEN
        ALTER TABLE facilities ADD COLUMN taxonomy_specialty VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'sequence_number') THEN
        ALTER TABLE facilities ADD COLUMN sequence_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'reference_number') THEN
        ALTER TABLE facilities ADD COLUMN reference_number VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'zip_code') THEN
        -- Check if zip column exists (old name)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'zip') THEN
            ALTER TABLE facilities RENAME COLUMN zip TO zip_code;
        ELSE
            ALTER TABLE facilities ADD COLUMN zip_code VARCHAR(20);
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'fax') THEN
        ALTER TABLE facilities ADD COLUMN fax VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'tax_id') THEN
        ALTER TABLE facilities ADD COLUMN tax_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'clia_id') THEN
        ALTER TABLE facilities ADD COLUMN clia_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'location_provider_id') THEN
        ALTER TABLE facilities ADD COLUMN location_provider_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'site_id') THEN
        ALTER TABLE facilities ADD COLUMN site_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'blue_cross_id') THEN
        ALTER TABLE facilities ADD COLUMN blue_cross_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'blue_shield_id') THEN
        ALTER TABLE facilities ADD COLUMN blue_shield_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'medicare_id') THEN
        ALTER TABLE facilities ADD COLUMN medicare_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'medicaid_id') THEN
        ALTER TABLE facilities ADD COLUMN medicaid_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'locator_code') THEN
        ALTER TABLE facilities ADD COLUMN locator_code VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'place_of_service') THEN
        ALTER TABLE facilities ADD COLUMN place_of_service VARCHAR(100);
    END IF;
    
    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'is_active') THEN
        ALTER TABLE facilities ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Set is_active based on status
        UPDATE facilities SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
END $$;

-- Indexes for faster queries (only create if columns exist)
DO $$ 
BEGIN
    -- Create index on name if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'name') THEN
        CREATE INDEX IF NOT EXISTS idx_facilities_name ON facilities(name);
    END IF;
    
    -- Create index on npi if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'npi') THEN
        CREATE INDEX IF NOT EXISTS idx_facilities_npi ON facilities(npi);
    END IF;
    
    -- Create index on status if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_facilities_status ON facilities(status);
    END IF;
    
    -- Create index on is_active if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_facilities_active ON facilities(is_active);
    END IF;
    
    -- Create index on created_at if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_facilities_created_at ON facilities(created_at);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view facilities" ON facilities;
DROP POLICY IF EXISTS "Users can create facilities" ON facilities;
DROP POLICY IF EXISTS "Users can update facilities" ON facilities;
DROP POLICY IF EXISTS "Users can delete facilities" ON facilities;
DROP POLICY IF EXISTS "Allow authenticated users to read facilities" ON facilities;
DROP POLICY IF EXISTS "Allow authenticated users to insert facilities" ON facilities;
DROP POLICY IF EXISTS "Allow authenticated users to update facilities" ON facilities;
DROP POLICY IF EXISTS "Allow authenticated users to delete facilities" ON facilities;

-- RLS Policies
CREATE POLICY "Users can view facilities"
    ON facilities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create facilities"
    ON facilities FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update facilities"
    ON facilities FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete facilities"
    ON facilities FOR DELETE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_facilities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_facilities_updated_at ON facilities;
CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_facilities_updated_at();

-- Sync status and is_active columns
-- Note: This function assumes status column exists (it's added above)
CREATE OR REPLACE FUNCTION sync_facilities_status()
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

DROP TRIGGER IF EXISTS sync_facilities_status ON facilities;
CREATE TRIGGER sync_facilities_status
    BEFORE INSERT OR UPDATE ON facilities
    FOR EACH ROW
    EXECUTE FUNCTION sync_facilities_status();

-- Verify table was created
SELECT '✅ Facilities table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'facilities'
ORDER BY ordinal_position;

