-- ============================================================================
-- DIAGNOSE PATIENT_INSURANCE 400 ERROR
-- ============================================================================
-- This script helps diagnose why patient_insurance queries are returning 400 errors
-- ============================================================================

-- 1. Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'patient_insurance'
        ) 
        THEN '✅ patient_insurance table EXISTS'
        ELSE '❌ patient_insurance table DOES NOT EXIST'
    END as table_status;

-- 2. Check if company_id column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'patient_insurance' 
            AND column_name = 'company_id'
        ) 
        THEN '✅ company_id column EXISTS'
        ELSE '❌ company_id column DOES NOT EXIST - May need to add it'
    END as company_id_status;

-- 3. Show all columns in patient_insurance table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'patient_insurance'
ORDER BY ordinal_position;

-- 4. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'patient_insurance';

-- 5. Show RLS policies
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
WHERE schemaname = 'public' 
  AND tablename = 'patient_insurance';

-- 6. Test query (replace with actual patient_id and company_id)
-- SELECT 
--     primary_insurance_id, 
--     primary_group_number, 
--     primary_insurance_company, 
--     primary_policy_holder_name
-- FROM patient_insurance
-- WHERE patient_id = 'YOUR_PATIENT_ID_HERE'
--   AND company_id = 'YOUR_COMPANY_ID_HERE'
-- LIMIT 1;



