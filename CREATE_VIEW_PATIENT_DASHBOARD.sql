-- ============================================================================
-- CREATE PATIENT DASHBOARD VIEW (RUN THIS AFTER ENHANCE_PATIENTS_TABLE)
-- ============================================================================
-- This view requires the following tables to exist:
-- - patients (required)
-- - providers (optional - for preferred_provider_name)
-- - appointments (optional - for next_appointment)
-- - patient_medical_history (optional - for medical info counts)
-- - patient_documents (optional - for document counts)
-- - patient_insurance (optional - for insurance info)
-- ============================================================================

-- Drop view if it exists
DROP VIEW IF EXISTS patient_dashboard_summary;

-- Create view with ONLY tables that definitely exist
-- Add more fields later as tables are created
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
    -- Provider name (only if providers table exists)
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers')
        THEN (
            SELECT first_name || ' ' || last_name 
            FROM providers 
            WHERE id = p.preferred_provider_id
        )
        ELSE NULL
    END as preferred_provider_name,
    
    -- Emergency Contact
    p.emergency_contact_name,
    p.emergency_contact_phone,
    p.emergency_contact_relation,
    
    -- Insurance Info
    -- NOTE: Commented out because patient_insurance table or column might not exist
    -- Uncomment and adjust column name once you verify your schema:
    -- CASE 
    --     WHEN EXISTS (
    --         SELECT 1 FROM information_schema.tables t
    --         JOIN information_schema.columns c ON c.table_name = t.table_name
    --         WHERE t.table_name = 'patient_insurance' 
    --         AND c.column_name = 'primary_insurance_company'
    --     )
    --     THEN (
    --         SELECT primary_insurance_company 
    --         FROM patient_insurance 
    --         WHERE patient_id = p.id 
    --         LIMIT 1
    --     )
    --     ELSE NULL
    -- END as insurance,
    NULL::VARCHAR as insurance,  -- Placeholder - returns NULL for now
    
    -- Next Appointment (only if appointments table exists)
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments')
        THEN (
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
    
    -- Medical Info Counts (only if patient_medical_history table exists)
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_medical_history')
        THEN (
            SELECT COUNT(*) 
            FROM jsonb_array_elements(
                (SELECT allergies FROM patient_medical_history WHERE patient_id = p.id LIMIT 1)
            )
            WHERE (SELECT allergies FROM patient_medical_history WHERE patient_id = p.id LIMIT 1) IS NOT NULL
        )
        ELSE 0
    END as allergies_count,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_medical_history')
        THEN (
            SELECT COUNT(*) 
            FROM jsonb_array_elements(
                (SELECT medications FROM patient_medical_history WHERE patient_id = p.id LIMIT 1)
            )
            WHERE (SELECT medications FROM patient_medical_history WHERE patient_id = p.id LIMIT 1) IS NOT NULL
        )
        ELSE 0
    END as medications_count,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_medical_history')
        THEN (
            SELECT COUNT(*) 
            FROM jsonb_array_elements(
                (SELECT conditions FROM patient_medical_history WHERE patient_id = p.id LIMIT 1)
            )
            WHERE (SELECT conditions FROM patient_medical_history WHERE patient_id = p.id LIMIT 1) IS NOT NULL
        )
        ELSE 0
    END as conditions_count,
    
    -- Recent Documents Count (only if patient_documents table exists)
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_documents')
        THEN (
            SELECT COUNT(*) 
            FROM patient_documents pd
            WHERE pd.patient_id = p.id
            AND pd.upload_date >= CURRENT_DATE - INTERVAL '30 days'
        )
        ELSE 0
    END as recent_documents_count,
    
    p.created_at,
    p.updated_at
    
FROM patients p;

-- Test the view
SELECT '✅ View created successfully!' AS status;
SELECT COUNT(*) as total_patients FROM patient_dashboard_summary;

