-- ============================================================================
-- ALTER QUERIES TO UPDATE EXISTING DATABASE TO LAST NAME, FIRST NAME FORMAT
-- ============================================================================
-- Run these queries in your Supabase SQL Editor to update existing tables

-- ============================================================================
-- UPDATE EXISTING TABLES THAT HAVE NAME FIELDS
-- ============================================================================

-- 1. Update authorization_requests table
-- This table has patient_name field that might need to be split
-- First, let's add the new columns
ALTER TABLE authorization_requests 
ADD COLUMN IF NOT EXISTS patient_last_name TEXT,
ADD COLUMN IF NOT EXISTS patient_first_name TEXT,
ADD COLUMN IF NOT EXISTS patient_middle_initial TEXT,
ADD COLUMN IF NOT EXISTS patient_suffix TEXT;

-- 2. Update billing_statements table
-- This table has patient_name field
ALTER TABLE billing_statements 
ADD COLUMN IF NOT EXISTS patient_last_name TEXT,
ADD COLUMN IF NOT EXISTS patient_first_name TEXT,
ADD COLUMN IF NOT EXISTS patient_middle_initial TEXT,
ADD COLUMN IF NOT EXISTS patient_suffix TEXT;

-- 3. Update chat_conversations table
-- This table has patient_name field
ALTER TABLE chat_conversations 
ADD COLUMN IF NOT EXISTS patient_last_name TEXT,
ADD COLUMN IF NOT EXISTS patient_first_name TEXT,
ADD COLUMN IF NOT EXISTS patient_middle_initial TEXT,
ADD COLUMN IF NOT EXISTS patient_suffix TEXT;

-- 4. Update collections_accounts table
-- This table has patient_name field
ALTER TABLE collections_accounts 
ADD COLUMN IF NOT EXISTS patient_last_name TEXT,
ADD COLUMN IF NOT EXISTS patient_first_name TEXT,
ADD COLUMN IF NOT EXISTS patient_middle_initial TEXT,
ADD COLUMN IF NOT EXISTS patient_suffix TEXT;

-- 5. Update patient_communication_preferences table
-- This table has patient_name field
ALTER TABLE patient_communication_preferences 
ADD COLUMN IF NOT EXISTS patient_last_name TEXT,
ADD COLUMN IF NOT EXISTS patient_first_name TEXT,
ADD COLUMN IF NOT EXISTS patient_middle_initial TEXT,
ADD COLUMN IF NOT EXISTS patient_suffix TEXT;

-- ============================================================================
-- CREATE NEW TABLES WITH PROPER NAME FORMAT
-- ============================================================================

-- Create patients table with proper name format
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT UNIQUE NOT NULL, -- Internal patient ID
    last_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    middle_initial TEXT,
    suffix TEXT,
    date_of_birth DATE NOT NULL,
    gender gender NOT NULL,
    ssn TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    phone_primary TEXT,
    phone_secondary TEXT,
    email TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL
);

-- Create providers table with proper name format
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npi TEXT UNIQUE NOT NULL,
    last_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    middle_initial TEXT,
    suffix TEXT,
    title TEXT, -- Dr., MD, DDS, etc.
    specialty_code TEXT,
    license_number TEXT,
    tax_id TEXT,
    phone TEXT,
    fax TEXT,
    email TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL
);

-- ============================================================================
-- CREATE ENUMS FOR NEW TABLES
-- ============================================================================

-- Create gender enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
        CREATE TYPE gender AS ENUM ('M', 'F', 'U');
    END IF;
END $$;

-- Create relationship_to_insured enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_to_insured') THEN
        CREATE TYPE relationship_to_insured AS ENUM ('self', 'spouse', 'child', 'other');
    END IF;
END $$;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_patients_last_name ON patients(last_name);
CREATE INDEX IF NOT EXISTS idx_patients_first_name ON patients(first_name);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);

CREATE INDEX IF NOT EXISTS idx_providers_last_name ON providers(last_name);
CREATE INDEX IF NOT EXISTS idx_providers_first_name ON providers(first_name);
CREATE INDEX IF NOT EXISTS idx_providers_npi ON providers(npi);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Patients table policies
DROP POLICY IF EXISTS "Users can view their own patients" ON patients;
DROP POLICY IF EXISTS "Users can insert their own patients" ON patients;
DROP POLICY IF EXISTS "Users can update their own patients" ON patients;
DROP POLICY IF EXISTS "Users can delete their own patients" ON patients;

CREATE POLICY "Users can view their own patients" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patients" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patients" ON patients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patients" ON patients
    FOR DELETE USING (auth.uid() = user_id);

-- Providers table policies
DROP POLICY IF EXISTS "Users can view their own providers" ON providers;
DROP POLICY IF EXISTS "Users can insert their own providers" ON providers;
DROP POLICY IF EXISTS "Users can update their own providers" ON providers;
DROP POLICY IF EXISTS "Users can delete their own providers" ON providers;

CREATE POLICY "Users can view their own providers" ON providers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own providers" ON providers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own providers" ON providers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own providers" ON providers
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- MIGRATION SCRIPT FOR EXISTING DATA
-- ============================================================================

-- Function to split existing patient_name into last_name and first_name
-- This function can be used to migrate existing data
CREATE OR REPLACE FUNCTION split_patient_name()
RETURNS void AS $$
BEGIN
    -- Update authorization_requests table
    UPDATE authorization_requests 
    SET 
        patient_last_name = SPLIT_PART(patient_name, ',', 1),
        patient_first_name = TRIM(SPLIT_PART(patient_name, ',', 2))
    WHERE patient_name IS NOT NULL 
    AND patient_name LIKE '%,%';
    
    -- Update billing_statements table
    UPDATE billing_statements 
    SET 
        patient_last_name = SPLIT_PART(patient_name, ',', 1),
        patient_first_name = TRIM(SPLIT_PART(patient_name, ',', 2))
    WHERE patient_name IS NOT NULL 
    AND patient_name LIKE '%,%';
    
    -- Update chat_conversations table
    UPDATE chat_conversations 
    SET 
        patient_last_name = SPLIT_PART(patient_name, ',', 1),
        patient_first_name = TRIM(SPLIT_PART(patient_name, ',', 2))
    WHERE patient_name IS NOT NULL 
    AND patient_name LIKE '%,%';
    
    -- Update collections_accounts table
    UPDATE collections_accounts 
    SET 
        patient_last_name = SPLIT_PART(patient_name, ',', 1),
        patient_first_name = TRIM(SPLIT_PART(patient_name, ',', 2))
    WHERE patient_name IS NOT NULL 
    AND patient_name LIKE '%,%';
    
    -- Update patient_communication_preferences table
    UPDATE patient_communication_preferences 
    SET 
        patient_last_name = SPLIT_PART(patient_name, ',', 1),
        patient_first_name = TRIM(SPLIT_PART(patient_name, ',', 2))
    WHERE patient_name IS NOT NULL 
    AND patient_name LIKE '%,%';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 'Database updated successfully! All tables now support Last Name, First Name format.' as status;
