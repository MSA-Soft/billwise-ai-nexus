-- ============================================================================
-- SEED DATA FOR REMITTANCE_CODES TABLE
-- ============================================================================
-- This file contains sample Remittance code data for testing and development
-- Run this in Supabase SQL Editor after creating the remittance_codes table
-- ============================================================================

-- Insert sample Remittance codes
-- Note: Using consistent snake_case naming for all columns
INSERT INTO remittance_codes (
    code,
    type,
    information_level,
    include_on_denial_reports,
    include_on_adjustment_reports,
    report_description,
    long_description,
    use_memoline,
    status,
    is_active
) VALUES
-- Remittance Code 1: Claim Denied - Duplicate
(
    'CO-18',
    'Denial',
    'ERROR - This code represents an error condition.',
    true,
    true,
    'Duplicate claim/service',
    'Duplicate claim/service - This claim/service has already been adjudicated.',
    false,
    'active',
    true
),

-- Remittance Code 2: Adjustment - Patient Responsibility
(
    'PR-1',
    'Adj Reason',
    'INFO - This code represents general information only.',
    false,
    true,
    'Patient responsibility',
    'Patient responsibility - Amount is patient responsibility.',
    false,
    'active',
    true
),

-- Remittance Code 3: Remark - Prior Authorization Required
(
    'N380',
    'Remark',
    'WARN - This code represents a warning condition.',
    true,
    false,
    'Prior authorization required',
    'Prior authorization required - Service requires prior authorization.',
    true,
    'active',
    true
),

-- Remittance Code 4: Denial - Not Covered
(
    'CO-50',
    'Denial',
    'ERROR - This code represents an error condition.',
    true,
    true,
    'Not covered',
    'Not covered - This service is not covered under the patient''s plan.',
    false,
    'active',
    true
),

-- Remittance Code 5: Adjustment - Contractual Adjustment
(
    'CO-45',
    'Adj Reason',
    'INFO - This code represents general information only.',
    false,
    true,
    'Charge exceeds fee schedule',
    'Charge exceeds fee schedule/Maximum allowable - The charge exceeds the fee schedule or maximum allowable.',
    false,
    'active',
    true
),

-- Remittance Code 6: Remark - Coordination of Benefits
(
    'CO-22',
    'Remark',
    'INFO - This code represents general information only.',
    false,
    false,
    'Coordination of benefits',
    'Coordination of benefits - This care may be covered by another payer per coordination of benefits.',
    true,
    'active',
    true
),

-- Remittance Code 7: Denial - Medical Necessity
(
    'CO-97',
    'Denial',
    'ERROR - This code represents an error condition.',
    true,
    true,
    'Medical necessity',
    'Medical necessity - The benefit for this service is included in the payment/allowance for another service/procedure that has already been adjudicated.',
    false,
    'active',
    true
),

-- Remittance Code 8: Adjustment - Deductible
(
    'PR-2',
    'Adj Reason',
    'INFO - This code represents general information only.',
    false,
    true,
    'Deductible',
    'Deductible - Amount applied to deductible.',
    false,
    'active',
    true
),

-- Remittance Code 9: Remark - Timely Filing
(
    'CO-29',
    'Remark',
    'WARN - This code represents a warning condition.',
    true,
    false,
    'Time limit for filing',
    'Time limit for filing - The time limit for filing has expired.',
    true,
    'active',
    true
),

-- Remittance Code 10: Inactive Code (for testing)
(
    'TEST-999',
    'Adj Reason',
    'INFO - This code represents general information only.',
    false,
    false,
    'INACTIVE TEST CODE',
    NULL,
    false,
    'inactive',
    false
);

-- Verify the insert
SELECT 
    COUNT(*) as total_remittance_codes,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_remittance_codes,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_remittance_codes
FROM remittance_codes;

-- Display all inserted Remittance codes
SELECT 
    code,
    type,
    information_level,
    report_description,
    include_on_denial_reports,
    include_on_adjustment_reports,
    status,
    created_at
FROM remittance_codes
ORDER BY created_at DESC;

