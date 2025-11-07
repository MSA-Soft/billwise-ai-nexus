-- ============================================================================
-- SEED DATA FOR DIAGNOSIS_CODES TABLE
-- ============================================================================
-- This file contains sample diagnosis code data for testing and development
-- Run this in Supabase SQL Editor after creating the diagnosis_codes table
-- ============================================================================

-- Insert sample diagnosis codes
-- Note: Using consistent snake_case naming for all columns
INSERT INTO diagnosis_codes (
    code,
    code_type,
    description,
    effective_date,
    termination_date,
    cpt1,
    cpt2,
    cpt3,
    cpt4,
    cpt5,
    cpt6,
    print_on_superbill,
    superbill_description,
    status,
    is_active
) VALUES
-- Diagnosis 1: Essential Hypertension
(
    'I10',
    'ICD-10',
    'Essential (primary) hypertension',
    NULL,
    NULL,
    '99213',
    '99214',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    'Hypertension',
    'active',
    true
),

-- Diagnosis 2: Type 2 Diabetes Mellitus
(
    'E11.9',
    'ICD-10',
    'Type 2 diabetes mellitus without complications',
    NULL,
    NULL,
    '99213',
    '99214',
    '99215',
    NULL,
    NULL,
    NULL,
    true,
    'Type 2 Diabetes',
    'active',
    true
),

-- Diagnosis 3: Acute Upper Respiratory Infection
(
    'J06.9',
    'ICD-10',
    'Acute upper respiratory infection, unspecified',
    NULL,
    NULL,
    '99213',
    '99214',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    'URI',
    'active',
    true
),

-- Diagnosis 4: Low Back Pain
(
    'M54.5',
    'ICD-10',
    'Low back pain',
    NULL,
    NULL,
    '99213',
    '99214',
    '97110',
    '97112',
    NULL,
    NULL,
    true,
    'Low Back Pain',
    'active',
    true
),

-- Diagnosis 5: Anxiety Disorder
(
    'F41.9',
    'ICD-10',
    'Anxiety disorder, unspecified',
    NULL,
    NULL,
    '99213',
    '99214',
    '90834',
    NULL,
    NULL,
    NULL,
    true,
    'Anxiety',
    'active',
    true
),

-- Diagnosis 6: Chronic Obstructive Pulmonary Disease
(
    'J44.9',
    'ICD-10',
    'Chronic obstructive pulmonary disease, unspecified',
    NULL,
    NULL,
    '99213',
    '99214',
    '94010',
    '94060',
    NULL,
    NULL,
    true,
    'COPD',
    'active',
    true
),

-- Diagnosis 7: Major Depressive Disorder (DSM-5)
(
    'F32.9',
    'DSM-5',
    'Major depressive disorder, single episode, unspecified',
    NULL,
    NULL,
    '99213',
    '90834',
    '90837',
    NULL,
    NULL,
    NULL,
    true,
    'Depression',
    'active',
    true
),

-- Diagnosis 8: Routine Health Check (ICD-9 for backward compatibility)
(
    'V70.0',
    'ICD-9',
    'Routine general medical examination at a health care facility',
    NULL,
    NULL,
    '99395',
    '99396',
    '99397',
    NULL,
    NULL,
    NULL,
    true,
    'Routine Exam',
    'active',
    true
),

-- Diagnosis 9: Inactive Diagnosis (for testing)
(
    'Z00.00',
    'ICD-10',
    'Encounter for general adult medical examination without abnormal findings',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    false,
    NULL,
    'inactive',
    false
);

-- Verify the insert
SELECT 
    COUNT(*) as total_diagnosis_codes,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_diagnosis_codes,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_diagnosis_codes
FROM diagnosis_codes;

-- Display all inserted diagnosis codes
SELECT 
    code,
    code_type,
    description,
    cpt1,
    cpt2,
    print_on_superbill,
    status,
    created_at
FROM diagnosis_codes
ORDER BY created_at DESC;

