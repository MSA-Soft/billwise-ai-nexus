-- ============================================================================
-- ENHANCE PATIENTS TABLE FOR DASHBOARD
-- ============================================================================
-- Add missing columns to support PatientDashboard functionality
-- Run this in Supabase SQL Editor
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

-- Create index for risk_level
CREATE INDEX IF NOT EXISTS idx_patients_risk_level ON patients(risk_level);

-- Create index for preferred_provider_id
CREATE INDEX IF NOT EXISTS idx_patients_preferred_provider ON patients(preferred_provider_id);

-- Create index for outstanding_balance (for filtering patients with balances)
CREATE INDEX IF NOT EXISTS idx_patients_outstanding_balance ON patients(outstanding_balance);

-- ============================================================================
-- FUNCTION TO UPDATE TOTAL VISITS (automatically calculated)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_patient_total_visits()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patients
    SET total_visits = (
        SELECT COUNT(*) 
        FROM appointments 
        WHERE appointments.patient_id = NEW.patient_id 
        AND appointments.status = 'completed'
    ),
    last_visit_date = (
        SELECT MAX(scheduled_date)
        FROM appointments
        WHERE appointments.patient_id = NEW.patient_id
        AND appointments.status = 'completed'
    )
    WHERE id = NEW.patient_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update total_visits when appointment status changes to 'completed'
CREATE TRIGGER update_patient_visits_on_appointment_complete
    AFTER INSERT OR UPDATE ON appointments
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_patient_total_visits();

-- ============================================================================
-- FUNCTION TO CALCULATE OUTSTANDING BALANCE (from claims)
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_patient_outstanding_balance(patient_uuid UUID)
RETURNS NUMERIC(10, 2) AS $$
DECLARE
    total_balance NUMERIC(10, 2);
BEGIN
    SELECT COALESCE(SUM(
        COALESCE(c.patient_responsibility, 0) - 
        COALESCE((SELECT SUM(amount) FROM payments WHERE claim_id = c.id), 0)
    ), 0)
    INTO total_balance
    FROM claims c
    WHERE c.patient_id = patient_uuid
    AND c.status NOT IN ('paid', 'voided');
    
    RETURN total_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to update outstanding balance for a patient
CREATE OR REPLACE FUNCTION update_patient_outstanding_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patients
    SET outstanding_balance = calculate_patient_outstanding_balance(
        COALESCE(NEW.patient_id, OLD.patient_id)
    )
    WHERE id = COALESCE(NEW.patient_id, OLD.patient_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update outstanding balance when claims or payments change
CREATE TRIGGER update_patient_balance_on_claim_change
    AFTER INSERT OR UPDATE OR DELETE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_outstanding_balance();

CREATE TRIGGER update_patient_balance_on_payment_change
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_outstanding_balance();

-- ============================================================================
-- VIEW FOR PATIENT DASHBOARD SUMMARY
-- ============================================================================
-- NOTE: View creation is commented out to avoid errors if related tables don't exist
-- Uncomment and run CREATE_VIEW_PATIENT_DASHBOARD.sql separately after
-- ensuring all related tables exist (appointments, patient_medical_history, etc.)
-- ============================================================================

-- View creation moved to separate file: CREATE_VIEW_PATIENT_DASHBOARD.sql
-- This prevents errors if related tables don't exist yet

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

