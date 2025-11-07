-- ============================================================================
-- CREATE PATIENTS TABLE (If Not Exists)
-- ============================================================================
-- Run this in Supabase SQL Editor if patients table is missing
-- ============================================================================

-- Patients Table (Full Patient Registration)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    patient_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Basic Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    ssn VARCHAR(11),
    marital_status VARCHAR(50),
    race VARCHAR(50),
    ethnicity VARCHAR(50),
    language VARCHAR(50),
    
    -- Contact Information
    phone VARCHAR(20),
    email VARCHAR(255),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Patients
-- Allow authenticated users to view all patients
CREATE POLICY "Users can view patients"
    ON patients FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert patients
CREATE POLICY "Users can insert patients"
    ON patients FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update patients
CREATE POLICY "Users can update patients"
    ON patients FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete patients (optional - remove if not needed)
-- CREATE POLICY "Users can delete patients"
--     ON patients FOR DELETE
--     TO authenticated
--     USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_patients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_patients_updated_at();

-- Verify table was created
SELECT '✅ Patients table created successfully!' AS status;

-- Check if table exists and show structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'patients'
ORDER BY ordinal_position;

