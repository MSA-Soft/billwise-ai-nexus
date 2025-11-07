-- ============================================================================
-- SEED DATA FOR REVENUE_CODES TABLE
-- ============================================================================
-- This file contains sample Revenue code data for testing and development
-- Run this in Supabase SQL Editor after creating the revenue_codes table
-- ============================================================================

-- Insert sample Revenue codes
-- Note: Using consistent snake_case naming for all columns
INSERT INTO revenue_codes (
    code,
    description,
    price,
    exclude_from_duplicate,
    statement_description,
    status,
    is_active
) VALUES
-- Revenue Code 1: General Medical Services
(
    '001',
    'General Medical Services',
    150.00,
    false,
    'General Medical Services',
    'active',
    true
),

-- Revenue Code 2: Emergency Room Services
(
    '002',
    'Emergency Room Services',
    300.00,
    false,
    'Emergency Room Services',
    'active',
    true
),

-- Revenue Code 3: Laboratory Services
(
    '003',
    'Laboratory Services',
    75.00,
    false,
    'Laboratory Services',
    'active',
    true
),

-- Revenue Code 4: Radiology Services
(
    '004',
    'Radiology Services',
    200.00,
    false,
    'Radiology Services',
    'active',
    true
),

-- Revenue Code 5: Operating Room Services
(
    '010',
    'Operating Room Services',
    500.00,
    false,
    'Operating Room Services',
    'active',
    true
),

-- Revenue Code 6: Pharmacy Services
(
    '025',
    'Pharmacy Services',
    50.00,
    false,
    'Pharmacy Services',
    'active',
    true
),

-- Revenue Code 7: Physical Therapy Services
(
    '042',
    'Physical Therapy Services',
    125.00,
    false,
    'Physical Therapy Services',
    'active',
    true
),

-- Revenue Code 8: Occupational Therapy Services
(
    '043',
    'Occupational Therapy Services',
    125.00,
    false,
    'Occupational Therapy Services',
    'active',
    true
),

-- Revenue Code 9: Speech Therapy Services
(
    '044',
    'Speech Therapy Services',
    100.00,
    false,
    'Speech Therapy Services',
    'active',
    true
),

-- Revenue Code 10: Inactive Code (for testing)
(
    '999',
    'INACTIVE TEST CODE',
    0.00,
    false,
    NULL,
    'inactive',
    false
);

-- Verify the insert
SELECT 
    COUNT(*) as total_revenue_codes,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_revenue_codes,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_revenue_codes
FROM revenue_codes;

-- Display all inserted Revenue codes
SELECT 
    code,
    description,
    price,
    exclude_from_duplicate,
    status,
    created_at
FROM revenue_codes
ORDER BY created_at DESC;

