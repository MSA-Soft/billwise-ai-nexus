-- ============================================================================
-- SEED DATA FOR SUPERBILLS TABLE
-- ============================================================================
-- This file contains sample superbill data for testing and development
-- Run this in Supabase SQL Editor after creating the superbills table
-- ============================================================================

-- Insert sample superbills
-- Note: Using consistent snake_case naming for all columns
INSERT INTO superbills (
    name,
    type,
    description,
    file_path,
    file_name,
    status,
    is_active
) VALUES
-- Superbill 1: Standard Form-Based
(
    'Standard Superbill',
    'form-based',
    'Standard superbill template for general use',
    NULL,
    'No File Selected',
    'active',
    true
),

-- Superbill 2: Pediatric Template-Based
(
    'Pediatric Superbill',
    'template-based',
    'Specialized superbill for pediatric practices',
    NULL,
    'No File Selected',
    'active',
    true
),

-- Superbill 3: Dental Custom
(
    'Dental Superbill',
    'custom',
    'Custom superbill for dental practices',
    NULL,
    'No File Selected',
    'inactive',
    false
),

-- Superbill 4: Cardiology Form-Based
(
    'Cardiology Superbill',
    'form-based',
    'Specialized superbill for cardiology practices',
    NULL,
    'No File Selected',
    'active',
    true
),

-- Superbill 5: Orthopedic Template-Based
(
    'Orthopedic Superbill',
    'template-based',
    'Template superbill for orthopedic practices',
    NULL,
    'No File Selected',
    'active',
    true
),

-- Superbill 6: Mental Health Custom
(
    'Mental Health Superbill',
    'custom',
    'Custom superbill for mental health and behavioral practices',
    NULL,
    'No File Selected',
    'active',
    true
),

-- Superbill 7: Urgent Care Form-Based
(
    'Urgent Care Superbill',
    'form-based',
    'Form-based superbill for urgent care facilities',
    NULL,
    'No File Selected',
    'active',
    true
),

-- Superbill 8: Inactive Superbill (for testing)
(
    'Inactive Superbill',
    'custom',
    'This superbill is no longer active',
    NULL,
    'No File Selected',
    'inactive',
    false
);

-- Verify the insert
SELECT 
    COUNT(*) as total_superbills,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_superbills,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_superbills
FROM superbills;

-- Display all inserted superbills
SELECT 
    name,
    type,
    description,
    status,
    created_at
FROM superbills
ORDER BY created_at DESC;

