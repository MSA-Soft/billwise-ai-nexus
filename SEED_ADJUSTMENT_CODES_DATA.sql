-- ============================================================================
-- SEED ADJUSTMENT CODES DATA
-- ============================================================================
-- This file seeds the adjustment_codes table with sample data
-- Run this in Supabase SQL Editor AFTER running CREATE_ADJUSTMENT_CODES_TABLE.sql
-- ============================================================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE adjustment_codes CASCADE;

-- Insert sample adjustment codes
INSERT INTO adjustment_codes (code, description, adjustment_type, status, is_active) VALUES
-- Credit Adjustments
('CR001', 'Contractual Adjustment - Primary Insurance', 'Credit', 'active', true),
('CR002', 'Contractual Adjustment - Secondary Insurance', 'Credit', 'active', true),
('CR003', 'Prompt Pay Discount', 'Credit', 'active', true),
('CR004', 'Professional Courtesy', 'Credit', 'active', true),
('CR005', 'Bad Debt Write-off', 'Credit', 'active', true),
('CR006', 'Insurance Overpayment Refund', 'Credit', 'active', true),
('CR007', 'Patient Overpayment Refund', 'Credit', 'active', true),
('CR008', 'Duplicate Payment Refund', 'Credit', 'active', true),
('CR009', 'Medicare Allowable Adjustment', 'Credit', 'active', true),
('CR010', 'Medicaid Allowable Adjustment', 'Credit', 'active', true),

-- Debit Adjustments
('DB001', 'Late Payment Fee', 'Debit', 'active', true),
('DB002', 'Returned Check Fee', 'Debit', 'active', true),
('DB003', 'Collection Fee', 'Debit', 'active', true),
('DB004', 'Interest Charge', 'Debit', 'active', true),
('DB005', 'Service Fee', 'Debit', 'active', true),

-- Discount Adjustments
('DC001', 'Self-Pay Discount', 'Discount', 'active', true),
('DC002', 'Cash Discount', 'Discount', 'active', true),
('DC003', 'Senior Discount', 'Discount', 'active', true),
('DC004', 'Military Discount', 'Discount', 'active', true),
('DC005', 'Employee Discount', 'Discount', 'active', true),
('DC006', 'Charity Care Discount', 'Discount', 'active', true),
('DC007', 'Sliding Fee Scale Discount', 'Discount', 'active', true),

-- Write-off Adjustments
('WO001', 'Bad Debt Write-off', 'Write-off', 'active', true),
('WO002', 'Uncollectible Account Write-off', 'Write-off', 'active', true),
('WO003', 'Small Balance Write-off', 'Write-off', 'active', true),
('WO004', 'Statute of Limitations Write-off', 'Write-off', 'active', true),
('WO005', 'Bankruptcy Write-off', 'Write-off', 'active', true),
('WO006', 'Deceased Patient Write-off', 'Write-off', 'active', true),
('WO007', 'Duplicate Charge Write-off', 'Write-off', 'active', true),
('WO008', 'Billing Error Write-off', 'Write-off', 'active', true),

-- Additional Common Adjustments
('ADJ001', 'Prior Authorization Denial Adjustment', 'Credit', 'active', true),
('ADJ002', 'Medical Necessity Denial Adjustment', 'Credit', 'active', true),
('ADJ003', 'Coverage Termination Adjustment', 'Credit', 'active', true),
('ADJ004', 'Coordination of Benefits Adjustment', 'Credit', 'active', true),
('ADJ005', 'Third Party Liability Adjustment', 'Credit', 'active', true),
('ADJ006', 'Workers Compensation Adjustment', 'Credit', 'active', true),
('ADJ007', 'Auto Insurance Adjustment', 'Credit', 'active', true),
('ADJ008', 'Medicare Secondary Payer Adjustment', 'Credit', 'active', true),
('ADJ009', 'Medicaid Secondary Payer Adjustment', 'Credit', 'active', true),
('ADJ010', 'Timely Filing Denial Adjustment', 'Credit', 'active', true)

ON CONFLICT (code) DO NOTHING;

-- Verify data was inserted
SELECT 
    COUNT(*) as total_codes,
    COUNT(*) FILTER (WHERE adjustment_type = 'Credit') as credit_codes,
    COUNT(*) FILTER (WHERE adjustment_type = 'Debit') as debit_codes,
    COUNT(*) FILTER (WHERE adjustment_type = 'Discount') as discount_codes,
    COUNT(*) FILTER (WHERE adjustment_type = 'Write-off') as writeoff_codes,
    COUNT(*) FILTER (WHERE status = 'active') as active_codes
FROM adjustment_codes;

-- Display sample of inserted codes
SELECT 
    code,
    description,
    adjustment_type,
    status
FROM adjustment_codes
ORDER BY adjustment_type, code
LIMIT 20;

SELECT '✅ Adjustment codes seed data inserted successfully!' AS status;

