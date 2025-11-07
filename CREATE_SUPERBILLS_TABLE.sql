-- ============================================================================
-- SUPERBILLS TABLE SETUP (COMPLETE)
-- ============================================================================
-- This file creates the superbills table with all necessary columns, indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Superbills Table (Complete structure matching the component interface)
CREATE TABLE IF NOT EXISTS superbills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'form-based', -- 'form-based', 'template-based', 'custom'
    description TEXT,
    
    -- File Information
    file_path TEXT,
    file_name VARCHAR(255),
    
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superbills' AND column_name = 'name') THEN
        ALTER TABLE superbills ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Unnamed Superbill';
        ALTER TABLE superbills ALTER COLUMN name DROP DEFAULT;
    END IF;
    
    -- Add all component fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superbills' AND column_name = 'type') THEN
        ALTER TABLE superbills ADD COLUMN type VARCHAR(50) DEFAULT 'form-based';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superbills' AND column_name = 'description') THEN
        ALTER TABLE superbills ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superbills' AND column_name = 'file_path') THEN
        ALTER TABLE superbills ADD COLUMN file_path TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superbills' AND column_name = 'file_name') THEN
        ALTER TABLE superbills ADD COLUMN file_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superbills' AND column_name = 'status') THEN
        ALTER TABLE superbills ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        -- Update existing rows based on is_active
        UPDATE superbills SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
    END IF;
    
    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superbills' AND column_name = 'is_active') THEN
        ALTER TABLE superbills ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Set is_active based on status
        UPDATE superbills SET is_active = (status = 'active') WHERE is_active IS NULL;
    END IF;
END $$;

-- Indexes for faster queries (only create if columns exist)
DO $$ 
BEGIN
    -- Create index on name if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superbills' AND column_name = 'name') THEN
        CREATE INDEX IF NOT EXISTS idx_superbills_name ON superbills(name);
    END IF;
    
    -- Create index on type if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superbills' AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_superbills_type ON superbills(type);
    END IF;
    
    -- Create index on status if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superbills' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_superbills_status ON superbills(status);
    END IF;
    
    -- Create index on is_active if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superbills' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_superbills_active ON superbills(is_active);
    END IF;
    
    -- Create index on created_at if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superbills' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_superbills_created_at ON superbills(created_at);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE superbills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view superbills" ON superbills;
DROP POLICY IF EXISTS "Users can create superbills" ON superbills;
DROP POLICY IF EXISTS "Users can update superbills" ON superbills;
DROP POLICY IF EXISTS "Users can delete superbills" ON superbills;

-- RLS Policies
CREATE POLICY "Users can view superbills"
    ON superbills FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create superbills"
    ON superbills FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update superbills"
    ON superbills FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete superbills"
    ON superbills FOR DELETE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_superbills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_superbills_updated_at ON superbills;
CREATE TRIGGER update_superbills_updated_at
    BEFORE UPDATE ON superbills
    FOR EACH ROW
    EXECUTE FUNCTION update_superbills_updated_at();

-- Sync status and is_active columns
CREATE OR REPLACE FUNCTION sync_superbills_status()
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

DROP TRIGGER IF EXISTS sync_superbills_status ON superbills;
CREATE TRIGGER sync_superbills_status
    BEFORE INSERT OR UPDATE ON superbills
    FOR EACH ROW
    EXECUTE FUNCTION sync_superbills_status();

-- Verify table was created
SELECT '✅ Superbills table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'superbills'
ORDER BY ordinal_position;

