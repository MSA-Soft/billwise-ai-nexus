-- ============================================================================
-- ENHANCE PATIENTS TABLE FOR DASHBOARD (SAFE VERSION)
-- ============================================================================
-- This version handles cases where related tables might not exist
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
    -- Check if appointments table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_patient_visits_on_appointment_complete ON appointments;

-- Create trigger only if appointments table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        CREATE TRIGGER update_patient_visits_on_appointment_complete
            AFTER INSERT OR UPDATE ON appointments
            FOR EACH ROW
            WHEN (NEW.status = 'completed')
            EXECUTE FUNCTION update_patient_total_visits();
    END IF;
END $$;

-- ============================================================================
-- FUNCTION TO CALCULATE OUTSTANDING BALANCE (from claims)
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_patient_outstanding_balance(patient_uuid UUID)
RETURNS NUMERIC(10, 2) AS $$
DECLARE
    total_balance NUMERIC(10, 2);
BEGIN
    -- Check if claims table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'claims') THEN
        RETURN 0;
    END IF;
    
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

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_patient_balance_on_claim_change ON claims;
DROP TRIGGER IF EXISTS update_patient_balance_on_payment_change ON payments;

-- Create triggers only if tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'claims') THEN
        CREATE TRIGGER update_patient_balance_on_claim_change
            AFTER INSERT OR UPDATE OR DELETE ON claims
            FOR EACH ROW
            EXECUTE FUNCTION update_patient_outstanding_balance();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        CREATE TRIGGER update_patient_balance_on_payment_change
            AFTER INSERT OR UPDATE OR DELETE ON payments
            FOR EACH ROW
            EXECUTE FUNCTION update_patient_outstanding_balance();
    END IF;
END $$;

-- ============================================================================
-- VIEW FOR PATIENT DASHBOARD SUMMARY (SAFE VERSION)
-- ============================================================================
-- This view works even if some related tables don't exist
-- ============================================================================

-- Drop view if it exists (to avoid conflicts)
DROP VIEW IF EXISTS patient_dashboard_summary;

-- Create view with conditional joins
CREATE OR REPLACE VIEW patient_dashboard_summary AS
SELECT 
    p.id,
    p.patient_id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.phone,
    p.email,
    CONCAT(
        COALESCE(p.address_line1, ''), 
        CASE WHEN p.city IS NOT NULL THEN ', ' || p.city ELSE '' END,
        CASE WHEN p.state IS NOT NULL THEN ', ' || p.state ELSE '' END,
        CASE WHEN p.zip_code IS NOT NULL THEN ' ' || p.zip_code ELSE '' END
    ) as address,
    p.status,
    p.risk_level,
    p.total_visits,
    p.outstanding_balance,
    p.last_visit_date,
    p.preferred_provider_id,
    CASE 
        WHEN pp.first_name IS NOT NULL AND pp.last_name IS NOT NULL 
        THEN pp.first_name || ' ' || pp.last_name 
        ELSE NULL 
    END as preferred_provider_name,
    
    -- Emergency Contact
    p.emergency_contact_name,
    p.emergency_contact_phone,
    p.emergency_contact_relation,
    
    -- Insurance Info (safely handle if table doesn't exist)
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'patient_insurance'
        ) THEN (
            SELECT primary_insurance_company 
            FROM patient_insurance 
            WHERE patient_id = p.id 
            LIMIT 1
        )
        ELSE NULL
    END as insurance,
    
    -- Next Appointment (safely handle if table doesn't exist)
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'appointments'
        ) THEN (
            SELECT scheduled_date || ' ' || COALESCE(scheduled_time::text, '00:00:00')
            FROM appointments
            WHERE patient_id = p.id
            AND scheduled_date >= CURRENT_DATE
            AND status != 'cancelled'
            ORDER BY scheduled_date ASC
            LIMIT 1
        )
        ELSE NULL
    END as next_appointment,
    
    -- Medical Info Counts (safely handle if table doesn't exist)
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'patient_medical_history'
        ) THEN (
            SELECT COUNT(*) 
            FROM jsonb_array_elements(
                (SELECT allergies FROM patient_medical_history WHERE patient_id = p.id LIMIT 1)
            )
            WHERE (SELECT allergies FROM patient_medical_history WHERE patient_id = p.id LIMIT 1) IS NOT NULL
        )
        ELSE 0
    END as allergies_count,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'patient_medical_history'
        ) THEN (
            SELECT COUNT(*) 
            FROM jsonb_array_elements(
                (SELECT medications FROM patient_medical_history WHERE patient_id = p.id LIMIT 1)
            )
            WHERE (SELECT medications FROM patient_medical_history WHERE patient_id = p.id LIMIT 1) IS NOT NULL
        )
        ELSE 0
    END as medications_count,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'patient_medical_history'
        ) THEN (
            SELECT COUNT(*) 
            FROM jsonb_array_elements(
                (SELECT conditions FROM patient_medical_history WHERE patient_id = p.id LIMIT 1)
            )
            WHERE (SELECT conditions FROM patient_medical_history WHERE patient_id = p.id LIMIT 1) IS NOT NULL
        )
        ELSE 0
    END as conditions_count,
    
    -- Recent Documents Count (safely handle if table doesn't exist)
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'patient_documents'
        ) THEN (
            SELECT COUNT(*) 
            FROM patient_documents pd
            WHERE pd.patient_id = p.id
            AND pd.upload_date >= CURRENT_DATE - INTERVAL '30 days'
        )
        ELSE 0
    END as recent_documents_count,
    
    p.created_at,
    p.updated_at
    
FROM patients p
LEFT JOIN providers pp ON p.preferred_provider_id = pp.id;

-- ============================================================================
-- ALTERNATIVE: SIMPLER VIEW (if above is too complex)
-- ============================================================================
-- If the above view still gives errors, use this simpler version:
-- ============================================================================

-- Drop and create simpler view
DROP VIEW IF EXISTS patient_dashboard_summary_simple;

CREATE OR REPLACE VIEW patient_dashboard_summary_simple AS
SELECT 
    p.id,
    p.patient_id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.phone,
    p.email,
    CONCAT(
        COALESCE(p.address_line1, ''), 
        CASE WHEN p.city IS NOT NULL THEN ', ' || p.city ELSE '' END,
        CASE WHEN p.state IS NOT NULL THEN ', ' || p.state ELSE '' END,
        CASE WHEN p.zip_code IS NOT NULL THEN ' ' || p.zip_code ELSE '' END
    ) as address,
    p.status,
    p.risk_level,
    p.total_visits,
    p.outstanding_balance,
    p.last_visit_date,
    p.preferred_provider_id,
    p.emergency_contact_name,
    p.emergency_contact_phone,
    p.emergency_contact_relation,
    p.created_at,
    p.updated_at
FROM patients p
LEFT JOIN providers pp ON p.preferred_provider_id = pp.id;

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

-- Check which related tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('patient_insurance', 'appointments', 'patient_medical_history', 'patient_documents', 'providers')
        THEN '✅ Exists'
        ELSE '❌ Missing'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('patient_insurance', 'appointments', 'patient_medical_history', 'patient_documents', 'providers', 'patients')
ORDER BY table_name;

