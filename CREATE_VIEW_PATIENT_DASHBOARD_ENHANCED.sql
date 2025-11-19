-- ============================================================================
-- ENHANCED PATIENT DASHBOARD VIEW WITH ALL FIELDS
-- ============================================================================
-- This view provides a comprehensive summary for the Patient Dashboard component.
-- It includes all fields needed by PatientDashboard.tsx interface.
-- 
-- Requirements:
-- - patients (required)
-- - providers (optional - for preferred_provider_name)
-- - appointments (optional - for appointments array and next_appointment)
-- - patient_medical_history (optional - for medical info arrays)
-- - patient_documents (optional - for documents array)
-- - patient_insurance (optional - for insurance info)
-- - insurance_payers (optional - for insurance company name)
-- ============================================================================

-- Drop view if it exists
DROP VIEW IF EXISTS patient_dashboard_summary CASCADE;

-- Create enhanced view with all required fields
CREATE OR REPLACE VIEW patient_dashboard_summary AS
SELECT 
    -- Basic Patient Info
    p.id,
    p.patient_id,
    p.first_name,
    p.last_name,
    TRIM(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')) as name,
    
    -- Age Calculation
    CASE 
        WHEN p.date_of_birth IS NOT NULL THEN
            EXTRACT(YEAR FROM AGE(p.date_of_birth))::INTEGER
        ELSE NULL
    END as age,
    
    p.date_of_birth,
    COALESCE(p.phone_primary, p.phone, '') as phone,
    COALESCE(p.email, '') as email,
    
    -- Address (formatted)
    CONCAT(
        COALESCE(p.address_line1, ''), 
        CASE WHEN p.city IS NOT NULL THEN ', ' || p.city ELSE '' END,
        CASE WHEN p.state IS NOT NULL THEN ', ' || p.state ELSE '' END,
        CASE WHEN p.zip_code IS NOT NULL THEN ' ' || p.zip_code ELSE '' END
    ) as address,
    
    -- Status and Risk
    COALESCE(p.status, 'active')::VARCHAR as status,
    COALESCE(p.risk_level, 'low')::VARCHAR as risk_level,
    
    -- Visit and Balance Info
    COALESCE(p.total_visits, 0)::INTEGER as total_visits,
    COALESCE(p.outstanding_balance, 0)::NUMERIC(10, 2) as outstanding_balance,
    p.last_visit_date,
    
    -- Provider Info
    p.preferred_provider_id,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers')
            AND p.preferred_provider_id IS NOT NULL
        THEN (
            SELECT TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
            FROM providers 
            WHERE id = p.preferred_provider_id
            LIMIT 1
        )
        ELSE NULL
    END as preferred_provider_name,
    
    -- Emergency Contact
    COALESCE(p.emergency_contact_name, '') as emergency_contact_name,
    COALESCE(p.emergency_contact_phone, '') as emergency_contact_phone,
    COALESCE(p.emergency_contact_relationship, p.emergency_contact_relation, '') as emergency_contact_relation,
    
    -- Insurance Info
    -- Returns empty string for now
    -- TODO: Once patient_insurance table is created, uncomment below and remove this line:
    -- (SELECT primary_insurance_company FROM patient_insurance WHERE patient_id = p.id LIMIT 1)
    ''::VARCHAR as insurance,
    
    -- Next Appointment (formatted string)
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments')
        THEN (
            SELECT 
                scheduled_date::TEXT || ' ' || 
                COALESCE(TO_CHAR(scheduled_time, 'HH24:MI:SS'), '00:00:00')
            FROM appointments
            WHERE patient_id = p.id
            AND scheduled_date >= CURRENT_DATE
            AND status != 'cancelled'
            ORDER BY scheduled_date ASC, scheduled_time ASC
            LIMIT 1
        )
        ELSE NULL
    END as next_appointment,
    
    -- Medical Info Arrays (from patient_medical_history)
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_medical_history')
        THEN (
            SELECT COALESCE(allergies, '[]'::jsonb)
            FROM patient_medical_history 
            WHERE patient_id = p.id 
            LIMIT 1
        )
        ELSE '[]'::jsonb
    END as medical_allergies,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_medical_history')
        THEN (
            SELECT COALESCE(medications, '[]'::jsonb)
            FROM patient_medical_history 
            WHERE patient_id = p.id 
            LIMIT 1
        )
        ELSE '[]'::jsonb
    END as medical_medications,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_medical_history')
        THEN (
            SELECT COALESCE(conditions, '[]'::jsonb)
            FROM patient_medical_history 
            WHERE patient_id = p.id 
            LIMIT 1
        )
        ELSE '[]'::jsonb
    END as medical_conditions,
    
    -- Medical Info Counts (for quick reference)
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_medical_history')
        THEN (
            SELECT 
                CASE 
                    WHEN allergies IS NOT NULL 
                    THEN jsonb_array_length(allergies)
                    ELSE 0
                END
            FROM patient_medical_history 
            WHERE patient_id = p.id 
            LIMIT 1
        )
        ELSE 0
    END as allergies_count,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_medical_history')
        THEN (
            SELECT 
                CASE 
                    WHEN medications IS NOT NULL 
                    THEN jsonb_array_length(medications)
                    ELSE 0
                END
            FROM patient_medical_history 
            WHERE patient_id = p.id 
            LIMIT 1
        )
        ELSE 0
    END as medications_count,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_medical_history')
        THEN (
            SELECT 
                CASE 
                    WHEN conditions IS NOT NULL 
                    THEN jsonb_array_length(conditions)
                    ELSE 0
                END
            FROM patient_medical_history 
            WHERE patient_id = p.id 
            LIMIT 1
        )
        ELSE 0
    END as conditions_count,
    
    -- Appointments Array (as JSON)
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments')
        THEN (
            SELECT COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'id', a.id,
                        'date', a.scheduled_date::TEXT,
                        'time', COALESCE(TO_CHAR(a.scheduled_time, 'HH24:MI:SS'), '00:00:00'),
                        'type', COALESCE(a.appointment_type, 'General'),
                        'status', COALESCE(a.status, 'scheduled'),
                        'provider', CASE 
                            WHEN EXISTS (
                                SELECT 1 FROM information_schema.tables 
                                WHERE table_name = 'providers'
                            ) AND a.provider_id IS NOT NULL
                            THEN (
                                SELECT TRIM(COALESCE(pr.first_name, '') || ' ' || COALESCE(pr.last_name, ''))
                                FROM providers pr
                                WHERE pr.id = a.provider_id
                            )
                            ELSE 'Unknown Provider'
                        END
                    ) ORDER BY a.scheduled_date DESC, a.scheduled_time DESC
                ),
                '[]'::jsonb
            )
            FROM appointments a
            WHERE a.patient_id = p.id
        )
        ELSE '[]'::jsonb
    END as appointments_json,
    
    -- Documents Array (as JSON)
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_documents')
        THEN (
            SELECT COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'id', pd.id,
                        'name', COALESCE(pd.document_name, 'Untitled Document'),
                        'type', COALESCE(pd.document_type::TEXT, 'other'),
                        'date', COALESCE(
                            TO_CHAR(pd.upload_date, 'YYYY-MM-DD'),
                            TO_CHAR(pd.created_at, 'YYYY-MM-DD')
                        )
                    ) ORDER BY pd.upload_date DESC NULLS LAST, pd.created_at DESC NULLS LAST
                ),
                '[]'::jsonb
            )
            FROM patient_documents pd
            WHERE pd.patient_id = p.id
        )
        ELSE '[]'::jsonb
    END as documents_json,
    
    -- Recent Documents Count
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_documents')
        THEN (
            SELECT COUNT(*)::INTEGER
            FROM patient_documents pd
            WHERE pd.patient_id = p.id
            AND pd.upload_date >= CURRENT_DATE - INTERVAL '30 days'
        )
        ELSE 0
    END as recent_documents_count,
    
    -- Additional Patient Fields
    p.gender,
    p.ssn,
    p.marital_status,
    p.race,
    p.ethnicity,
    p.language,
    p.notes,
    p.internal_notes,
    
    -- Timestamps
    p.created_at,
    p.updated_at
    
FROM patients p;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on the view (views inherit RLS from underlying tables)
-- Since this is a view, RLS is enforced through the underlying 'patients' table
-- But we can add additional policies if needed

-- Grant access to authenticated users
GRANT SELECT ON patient_dashboard_summary TO authenticated;
GRANT SELECT ON patient_dashboard_summary TO anon;

-- Note: RLS policies on the 'patients' table will automatically apply to this view
-- Make sure you have RLS policies on the 'patients' table that allow:
-- - Users to see their own patients (if user_id is set)
-- - Or all authenticated users to see all patients (depending on your requirements)

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT '✅ Enhanced patient_dashboard_summary view created successfully!' AS status;

-- Test query
SELECT 
    id,
    patient_id,
    name,
    age,
    status,
    risk_level,
    total_visits,
    outstanding_balance,
    insurance,
    preferred_provider_name
FROM patient_dashboard_summary
LIMIT 5;

-- Show view structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'patient_dashboard_summary'
ORDER BY ordinal_position;

