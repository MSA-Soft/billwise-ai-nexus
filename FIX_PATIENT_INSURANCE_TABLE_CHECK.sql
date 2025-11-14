-- ============================================================================
-- CHECK IF PATIENT_INSURANCE TABLE EXISTS AND HAS CORRECT COLUMNS
-- ============================================================================
-- Run this FIRST to check your database structure
-- ============================================================================

-- Check if patient_insurance table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'patient_insurance'
        ) 
        THEN '✅ patient_insurance table EXISTS'
        ELSE '❌ patient_insurance table DOES NOT EXIST - You need to create it first'
    END as table_status;

-- If table exists, show its columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'patient_insurance'
ORDER BY ordinal_position;

-- Check if primary_insurance_company column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'patient_insurance' 
            AND column_name = 'primary_insurance_company'
        ) 
        THEN '✅ primary_insurance_company column EXISTS'
        ELSE '❌ primary_insurance_company column DOES NOT EXIST'
    END as column_status;

-- ============================================================================
-- IF TABLE DOESN'T EXIST, RUN THIS TO CREATE IT:
-- ============================================================================

-- Uncomment and run this if patient_insurance table doesn't exist:
/*
CREATE TABLE IF NOT EXISTS patient_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Primary Insurance
    primary_insurance_company VARCHAR(255),
    primary_insurance_id VARCHAR(100),
    primary_group_number VARCHAR(50),
    primary_policy_holder_name VARCHAR(255),
    primary_policy_holder_relationship VARCHAR(50),
    primary_effective_date DATE,
    primary_expiration_date DATE,
    
    -- Secondary Insurance
    secondary_insurance_company VARCHAR(255),
    secondary_insurance_id VARCHAR(100),
    secondary_group_number VARCHAR(50),
    secondary_policy_holder_name VARCHAR(255),
    secondary_policy_holder_relationship VARCHAR(50),
    secondary_effective_date DATE,
    secondary_expiration_date DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_patient_insurance_patient_id ON patient_insurance(patient_id);

-- Enable RLS
ALTER TABLE patient_insurance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view patient insurance"
    ON patient_insurance FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert patient insurance"
    ON patient_insurance FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update patient insurance"
    ON patient_insurance FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
*/

