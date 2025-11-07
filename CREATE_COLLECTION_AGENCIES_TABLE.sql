-- ============================================================================
-- COLLECTION AGENCIES TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the collection_agencies table with all necessary columns, indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Collection Agencies Table (Complete structure matching the component interface)
CREATE TABLE IF NOT EXISTS collection_agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    
    -- Contact Information
    address TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(255),
    
    -- Additional Information
    agency_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active', -- 'active' or 'inactive'
    is_active BOOLEAN DEFAULT true, -- For backward compatibility
    commission_rate NUMERIC(5, 2) DEFAULT 0, -- Percentage (0-100)
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists (for backward compatibility)
DO $$ 
BEGIN
    -- Ensure required columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'name') THEN
        ALTER TABLE collection_agencies ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Unknown Agency';
        ALTER TABLE collection_agencies ALTER COLUMN name DROP DEFAULT;
    END IF;
    
    -- Add all component fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'address') THEN
        ALTER TABLE collection_agencies ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'address_line2') THEN
        ALTER TABLE collection_agencies ADD COLUMN address_line2 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'city') THEN
        ALTER TABLE collection_agencies ADD COLUMN city VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'state') THEN
        ALTER TABLE collection_agencies ADD COLUMN state VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'zip_code') THEN
        -- Check if zip column exists (old name)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'zip') THEN
            ALTER TABLE collection_agencies RENAME COLUMN zip TO zip_code;
        ELSE
            ALTER TABLE collection_agencies ADD COLUMN zip_code VARCHAR(20);
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'phone') THEN
        ALTER TABLE collection_agencies ADD COLUMN phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'fax') THEN
        ALTER TABLE collection_agencies ADD COLUMN fax VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'email') THEN
        ALTER TABLE collection_agencies ADD COLUMN email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'agency_type') THEN
        ALTER TABLE collection_agencies ADD COLUMN agency_type VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'commission_rate') THEN
        ALTER TABLE collection_agencies ADD COLUMN commission_rate NUMERIC(5, 2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'notes') THEN
        ALTER TABLE collection_agencies ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'status') THEN
        ALTER TABLE collection_agencies ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        -- Update existing rows based on is_active
        UPDATE collection_agencies SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    
    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'is_active') THEN
        ALTER TABLE collection_agencies ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Set is_active based on status
        UPDATE collection_agencies SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
END $$;

-- Indexes for faster queries (only create if columns exist)
DO $$ 
BEGIN
    -- Create index on name if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'name') THEN
        CREATE INDEX IF NOT EXISTS idx_collection_agencies_name ON collection_agencies(name);
    END IF;
    
    -- Create index on status if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_collection_agencies_status ON collection_agencies(status);
    END IF;
    
    -- Create index on is_active if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_collection_agencies_active ON collection_agencies(is_active);
    END IF;
    
    -- Create index on agency_type if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'agency_type') THEN
        CREATE INDEX IF NOT EXISTS idx_collection_agencies_type ON collection_agencies(agency_type);
    END IF;
    
    -- Create index on created_at if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_collection_agencies_created_at ON collection_agencies(created_at);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE collection_agencies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view collection agencies" ON collection_agencies;
DROP POLICY IF EXISTS "Users can create collection agencies" ON collection_agencies;
DROP POLICY IF EXISTS "Users can update collection agencies" ON collection_agencies;
DROP POLICY IF EXISTS "Users can delete collection agencies" ON collection_agencies;

-- RLS Policies
CREATE POLICY "Users can view collection agencies"
    ON collection_agencies FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create collection agencies"
    ON collection_agencies FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update collection agencies"
    ON collection_agencies FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete collection agencies"
    ON collection_agencies FOR DELETE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_collection_agencies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_collection_agencies_updated_at ON collection_agencies;
CREATE TRIGGER update_collection_agencies_updated_at
    BEFORE UPDATE ON collection_agencies
    FOR EACH ROW
    EXECUTE FUNCTION update_collection_agencies_updated_at();

-- Sync status and is_active columns
CREATE OR REPLACE FUNCTION sync_collection_agencies_status()
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

DROP TRIGGER IF EXISTS sync_collection_agencies_status ON collection_agencies;
CREATE TRIGGER sync_collection_agencies_status
    BEFORE INSERT OR UPDATE ON collection_agencies
    FOR EACH ROW
    EXECUTE FUNCTION sync_collection_agencies_status();

-- Verify table was created
SELECT '✅ Collection agencies table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'collection_agencies'
ORDER BY ordinal_position;

