-- ============================================================================
-- PROVIDERS TABLE SETUP
-- ============================================================================
-- This file creates the providers table with all necessary columns, indexes and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Create provider_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_type') THEN
        CREATE TYPE provider_type AS ENUM ('individual', 'organization');
    END IF;
END $$;

-- Providers Table (Complete structure)
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User association (nullable - providers are not always tied to auth users)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Provider Identification
    npi VARCHAR(10) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_initial VARCHAR(1),
    credentials VARCHAR(50), -- MD, DO, PA-C, NP, etc.
    provider_type provider_type DEFAULT 'individual',
    taxonomy_specialty VARCHAR(100),
    sequence_number VARCHAR(50),
    reference_number VARCHAR(100),
    code VARCHAR(50),
    
    -- Billing Information
    practice_for_provider VARCHAR(255),
    bill_claims_under VARCHAR(50),
    check_eligibility_under VARCHAR(50),
    use_id_number VARCHAR(100), -- EIN, SSN, Tax ID, Other
    employer_identification_number VARCHAR(50),
    bill_as VARCHAR(50), -- Individual, Organization, Group
    bill_professional_claims BOOLEAN DEFAULT false,
    bill_institutional_claims BOOLEAN DEFAULT false,
    
    -- Internal Use
    submitter_number VARCHAR(50),
    tcn_prefix VARCHAR(50),
    
    -- Contact Information
    phone VARCHAR(20), -- Primary phone (kept for backward compatibility)
    home_phone VARCHAR(20),
    cell_phone VARCHAR(20),
    fax_number VARCHAR(20),
    pager_number VARCHAR(20),
    email VARCHAR(255),
    
    -- Address Information
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    
    -- ID Numbers
    specialty_license_number VARCHAR(50),
    state_license_number VARCHAR(50),
    anesthesia_license_number VARCHAR(50),
    upin_number VARCHAR(50),
    blue_cross_number VARCHAR(50),
    tricare_champus_number VARCHAR(50),
    
    -- Claim Defaults
    rev_code VARCHAR(50),
    default_facility VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_providers_npi ON providers(npi);
CREATE INDEX IF NOT EXISTS idx_providers_active ON providers(is_active);
CREATE INDEX IF NOT EXISTS idx_providers_name ON providers(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_providers_type ON providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_providers_created_at ON providers(created_at);

-- Enable Row Level Security
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view providers" ON providers;
DROP POLICY IF EXISTS "Users can create providers" ON providers;
DROP POLICY IF EXISTS "Users can update providers" ON providers;
DROP POLICY IF EXISTS "Users can delete providers" ON providers;

-- RLS Policies
CREATE POLICY "Users can view providers"
    ON providers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create providers"
    ON providers FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update providers"
    ON providers FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete providers"
    ON providers FOR DELETE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
CREATE TRIGGER update_providers_updated_at
    BEFORE UPDATE ON providers
    FOR EACH ROW
    EXECUTE FUNCTION update_providers_updated_at();

-- Verify table was created
SELECT '✅ Providers table created successfully!' AS status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'providers'
ORDER BY ordinal_position;

