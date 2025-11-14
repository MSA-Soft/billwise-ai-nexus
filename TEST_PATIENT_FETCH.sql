-- ============================================================================
-- TEST QUERIES: Verify Patient Data Fetching
-- ============================================================================
-- Run these queries in Supabase SQL Editor to test data fetching
-- ============================================================================

-- 1. Check if patients table exists
SELECT 
    table_name,
    table_schema
FROM information_schema.tables
WHERE table_name = 'patients';

-- 2. Count total patients
SELECT COUNT(*) as total_patients FROM patients;

-- 3. Get all patients (first 20)
SELECT 
    id,
    patient_id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    phone,
    email,
    city,
    state,
    status,
    created_at
FROM patients
ORDER BY created_at DESC
LIMIT 20;

-- 4. Check RLS policies on patients table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'patients';

-- 5. Test if authenticated user can read (run this as authenticated user)
-- This simulates what the frontend does
SELECT 
    patient_id,
    first_name,
    last_name,
    date_of_birth,
    phone,
    email,
    status
FROM patients
WHERE status = 'active'
ORDER BY created_at DESC;

-- 6. Check for any errors in recent inserts
SELECT 
    patient_id,
    first_name,
    last_name,
    created_at,
    CASE 
        WHEN first_name IS NULL THEN 'Missing first_name'
        WHEN last_name IS NULL THEN 'Missing last_name'
        WHEN date_of_birth IS NULL THEN 'Missing date_of_birth'
        ELSE 'OK'
    END as validation_status
FROM patients
ORDER BY created_at DESC
LIMIT 20;



