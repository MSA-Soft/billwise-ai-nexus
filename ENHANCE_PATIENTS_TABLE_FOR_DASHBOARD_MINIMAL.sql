-- ============================================================================
-- ENHANCE PATIENTS TABLE FOR DASHBOARD (MINIMAL VERSION - NO DEPENDENCIES)
-- ============================================================================
-- This version ONLY adds columns to patients table
-- No views, no triggers, no dependencies on other tables
-- Run this FIRST, then add views/triggers later
-- ============================================================================

-- Add missing columns to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS preferred_provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS outstanding_balance NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_visit_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patients_risk_level ON patients(risk_level);
CREATE INDEX IF NOT EXISTS idx_patients_preferred_provider ON patients(preferred_provider_id);
CREATE INDEX IF NOT EXISTS idx_patients_outstanding_balance ON patients(outstanding_balance);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT '✅ Patients table enhanced successfully!' AS status;

-- Show new columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'patients'
AND column_name IN ('risk_level', 'preferred_provider_id', 'total_visits', 'outstanding_balance', 'last_visit_date', 'notes', 'internal_notes')
ORDER BY column_name;

-- ============================================================================
-- NOTE: Functions, Triggers, and Views are in separate files:
-- - ENHANCE_PATIENTS_TABLE_FOR_DASHBOARD_FIXED.sql (has safe view)
-- - You can add triggers/functions later when related tables exist
-- ============================================================================

