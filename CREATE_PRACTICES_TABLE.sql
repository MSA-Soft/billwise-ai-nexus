-- ============================================================================
-- PRACTICES TABLE SETUP
-- ============================================================================
-- This file creates the practices table with all necessary indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Create practice_status enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'practice_status') THEN
        CREATE TYPE practice_status AS ENUM ('active', 'inactive', 'pending');
    END IF;
END $$;

-- Practices Table
CREATE TABLE IF NOT EXISTS practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    npi VARCHAR(10) UNIQUE NOT NULL,
    organization_type VARCHAR(100),
    taxonomy_specialty VARCHAR(100),
    reference_number VARCHAR(100),
    tcn_prefix VARCHAR(50),
    statement_tcn_prefix VARCHAR(50),
    code VARCHAR(50),
    
    -- Primary Office Address
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    time_zone VARCHAR(50),
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(255),
    
    -- Pay-To Address (if different)
    pay_to_same_as_primary BOOLEAN DEFAULT true,
    pay_to_address_line1 TEXT,
    pay_to_address_line2 TEXT,
    pay_to_city VARCHAR(100),
    pay_to_state VARCHAR(50),
    pay_to_zip_code VARCHAR(20),
    pay_to_phone VARCHAR(20),
    pay_to_fax VARCHAR(20),
    pay_to_email VARCHAR(255),
    
    -- Status and Statistics
    status practice_status DEFAULT 'active',
    established_date DATE,
    provider_count INTEGER DEFAULT 0,
    patient_count INTEGER DEFAULT 0,
    monthly_revenue NUMERIC(12, 2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_practices_npi ON practices(npi);
CREATE INDEX IF NOT EXISTS idx_practices_status ON practices(status);
CREATE INDEX IF NOT EXISTS idx_practices_name ON practices(name);
CREATE INDEX IF NOT EXISTS idx_practices_created_at ON practices(created_at);

-- Enable Row Level Security
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view practices" ON practices;
DROP POLICY IF EXISTS "Users can create practices" ON practices;
DROP POLICY IF EXISTS "Users can update practices" ON practices;
DROP POLICY IF EXISTS "Users can delete practices" ON practices;

-- RLS Policies
CREATE POLICY "Users can view practices"
    ON practices FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create practices"
    ON practices FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update practices"
    ON practices FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete practices"
    ON practices FOR DELETE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_practices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_practices_updated_at ON practices;
CREATE TRIGGER update_practices_updated_at
    BEFORE UPDATE ON practices
    FOR EACH ROW
    EXECUTE FUNCTION update_practices_updated_at();

-- Verify table was created
SELECT '✅ Practices table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'practices'
ORDER BY ordinal_position;

