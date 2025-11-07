-- ============================================================================
-- SEED DATA FOR ICD_PROCEDURE_CODES TABLE
-- ============================================================================
-- This file contains sample ICD Procedure code data for testing and development
-- Run this in Supabase SQL Editor after creating the icd_procedure_codes table
-- ============================================================================

-- Insert sample ICD Procedure codes
-- Note: Using consistent snake_case naming for all columns
INSERT INTO icd_procedure_codes (
    code,
    code_type,
    description,
    status,
    is_active
) VALUES
-- Code 1: Coronary Artery Bypass Graft (ICD-10-PCS)
(
    '0210093',
    'ICD-PCS',
    'Bypass Coronary Artery, One Artery, Open Approach',
    'active',
    true
),

-- Code 2: Total Hip Replacement (ICD-10-PCS)
(
    '0SR90JZ',
    'ICD-PCS',
    'Replacement of Right Hip Joint with Synthetic Substitute, Open Approach',
    'active',
    true
),

-- Code 3: Appendectomy (ICD-10-PCS)
(
    '0DTJ0ZZ',
    'ICD-PCS',
    'Excision of Appendix, Open Approach',
    'active',
    true
),

-- Code 4: Cholecystectomy (ICD-10-PCS)
(
    '0FT40ZZ',
    'ICD-PCS',
    'Resection of Gallbladder, Open Approach',
    'active',
    true
),

-- Code 5: Knee Arthroscopy (ICD-10-PCS)
(
    '0SJC3ZZ',
    'ICD-PCS',
    'Inspection of Right Knee Joint, Percutaneous Approach',
    'active',
    true
),

-- Code 6: Cardiac Catheterization (ICD-10-PCS)
(
    '4A023N7',
    'ICD-PCS',
    'Measurement of Cardiac Output, Open Approach',
    'active',
    true
),

-- Code 7: Colonoscopy (ICD-10-PCS)
(
    '0DJ08ZZ',
    'ICD-PCS',
    'Inspection of Large Intestine, Via Natural or Artificial Opening',
    'active',
    true
),

-- Code 8: Hysterectomy (ICD-10-PCS)
(
    '0UT90ZZ',
    'ICD-PCS',
    'Resection of Uterus, Open Approach',
    'active',
    true
),

-- Code 9: ICD-9 Procedure Code (for backward compatibility)
(
    '38.45',
    'ICD-9',
    'Endarterectomy, other vessels of head and neck',
    'active',
    true
),

-- Code 10: Inactive Code (for testing)
(
    '99999',
    'ICD-10',
    'INACTIVE TEST CODE',
    'inactive',
    false
);

-- Verify the insert
SELECT 
    COUNT(*) as total_icd_procedure_codes,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_icd_procedure_codes,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_icd_procedure_codes
FROM icd_procedure_codes;

-- Display all inserted ICD Procedure codes
SELECT 
    code,
    code_type,
    description,
    status,
    created_at
FROM icd_procedure_codes
ORDER BY created_at DESC;

