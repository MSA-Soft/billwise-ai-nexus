-- ============================================================================
-- FEE SCHEDULES SEED DATA
-- ============================================================================
-- This file contains seed data for fee_schedules and fee_schedule_procedures tables
-- Run this in Supabase SQL Editor AFTER running CREATE_FEE_SCHEDULES_TABLE.sql
-- ============================================================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE fee_schedule_procedures CASCADE;
-- TRUNCATE TABLE fee_schedules CASCADE;

-- ============================================================================
-- SEED FEE SCHEDULES
-- ============================================================================

-- Default Fee Schedule
INSERT INTO fee_schedules (
    name,
    description,
    sequence_number,
    effective_from,
    effective_to,
    price_creation_method,
    creation_settings,
    status,
    is_active
) VALUES (
    'Default Fee Schedule',
    'Default fee schedule for standard pricing',
    'FS001',
    CURRENT_DATE,
    NULL,
    'empty',
    '{}'::jsonb,
    'active',
    true
) ON CONFLICT (sequence_number) DO NOTHING
RETURNING id;

-- Medicare-Based Fee Schedule
INSERT INTO fee_schedules (
    name,
    description,
    sequence_number,
    effective_from,
    effective_to,
    price_creation_method,
    creation_settings,
    status,
    is_active
) VALUES (
    'Medicare Fee Schedule 2025',
    'Fee schedule based on Medicare pricing for 2025',
    'FS002',
    '2025-01-01',
    '2025-12-31',
    'medicare',
    '{
        "feeScheduleYear": "2025",
        "carrierMethod": "zip-code",
        "zipCode": "90210",
        "pricingMethod": "non-facility",
        "includeNonApplicable": false,
        "priceAdjustment": "no-adjustment",
        "increaseBy": "0.00",
        "decreaseBy": "0.00",
        "adjustTo": "1.0000",
        "adjustToPercent": "100.00",
        "roundUp": false
    }'::jsonb,
    'active',
    true
) ON CONFLICT (sequence_number) DO NOTHING
RETURNING id;

-- Contract-Based Fee Schedule
INSERT INTO fee_schedules (
    name,
    description,
    sequence_number,
    effective_from,
    effective_to,
    price_creation_method,
    creation_settings,
    status,
    is_active
) VALUES (
    'Contract Maximum Pricing',
    'Fee schedule using maximum contract prices',
    'FS003',
    CURRENT_DATE,
    NULL,
    'contract',
    '{
        "contractMethod": "maximum-price",
        "priceAdjustment": "increase",
        "increaseBy": "5.00",
        "decreaseBy": "0.00",
        "adjustTo": "1.0000",
        "adjustToPercent": "100.00",
        "roundUp": true
    }'::jsonb,
    'active',
    true
) ON CONFLICT (sequence_number) DO NOTHING
RETURNING id;

-- Charges-Based Fee Schedule
INSERT INTO fee_schedules (
    name,
    description,
    sequence_number,
    effective_from,
    effective_to,
    price_creation_method,
    creation_settings,
    status,
    is_active
) VALUES (
    'Historical Charges Schedule',
    'Fee schedule based on maximum charges from last 180 days',
    'FS004',
    CURRENT_DATE,
    NULL,
    'charges',
    '{
        "days": "180",
        "priceAdjustment": "no-adjustment",
        "increaseBy": "0.00",
        "decreaseBy": "0.00",
        "adjustTo": "1.0000",
        "adjustToPercent": "100.00",
        "roundUp": false
    }'::jsonb,
    'active',
    true
) ON CONFLICT (sequence_number) DO NOTHING
RETURNING id;

-- ============================================================================
-- SEED FEE SCHEDULE PROCEDURES
-- ============================================================================

-- Get the fee schedule IDs (using a subquery approach)
DO $$
DECLARE
    default_fs_id UUID;
    medicare_fs_id UUID;
    contract_fs_id UUID;
    charges_fs_id UUID;
BEGIN
    -- Get Default Fee Schedule ID
    SELECT id INTO default_fs_id FROM fee_schedules WHERE sequence_number = 'FS001';
    
    -- Get Medicare Fee Schedule ID
    SELECT id INTO medicare_fs_id FROM fee_schedules WHERE sequence_number = 'FS002';
    
    -- Get Contract Fee Schedule ID
    SELECT id INTO contract_fs_id FROM fee_schedules WHERE sequence_number = 'FS003';
    
    -- Get Charges Fee Schedule ID
    SELECT id INTO charges_fs_id FROM fee_schedules WHERE sequence_number = 'FS004';

    -- Insert procedures for Default Fee Schedule
    IF default_fs_id IS NOT NULL THEN
        INSERT INTO fee_schedule_procedures (fee_schedule_id, code, price, description, type, sequence_order) VALUES
        (default_fs_id, '99212', 75.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 1),
        (default_fs_id, '99213', 100.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 2),
        (default_fs_id, '99214', 150.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 3),
        (default_fs_id, '99215', 200.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 4),
        (default_fs_id, '71271', 250.00, 'CT THORAX LUNG CANCER SCR C-', 'Procedure', 5),
        (default_fs_id, '76536', 180.00, 'US EXAM OF HEAD AND NECK', 'Procedure', 6),
        (default_fs_id, '76705', 200.00, 'ECHO EXAM OF ABDOMEN', 'Procedure', 7),
        (default_fs_id, '76770', 220.00, 'US EXAM ABDO BACK WALL COMP', 'Procedure', 8),
        (default_fs_id, '76856', 300.00, 'US EXAM PELVIC COMPLETE', 'Procedure', 9),
        (default_fs_id, '76857', 250.00, 'US EXAM PELVIC LIMITED', 'Procedure', 10),
        (default_fs_id, '76870', 180.00, 'US EXAM SCROTUM', 'Procedure', 11),
        (default_fs_id, '77063', 350.00, 'BREAST TOMOSYNTHESIS BI', 'Procedure', 12),
        (default_fs_id, '77067', 280.00, 'SCR MAMMO BI INCL CAD', 'Procedure', 13),
        (default_fs_id, '93306', 400.00, 'TTE W/DOPPLER COMPLETE', 'Procedure', 14),
        (default_fs_id, '93880', 320.00, 'EXTRACRANIAL BILAT STUDY', 'Procedure', 15),
        (default_fs_id, '93978', 350.00, 'VASCULAR STUDY', 'Procedure', 16)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Insert procedures for Medicare Fee Schedule (with Medicare-typical pricing)
    IF medicare_fs_id IS NOT NULL THEN
        INSERT INTO fee_schedule_procedures (fee_schedule_id, code, price, description, type, sequence_order) VALUES
        (medicare_fs_id, '99212', 65.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 1),
        (medicare_fs_id, '99213', 85.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 2),
        (medicare_fs_id, '99214', 120.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 3),
        (medicare_fs_id, '99215', 165.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 4),
        (medicare_fs_id, '71271', 220.00, 'CT THORAX LUNG CANCER SCR C-', 'Procedure', 5),
        (medicare_fs_id, '76536', 150.00, 'US EXAM OF HEAD AND NECK', 'Procedure', 6),
        (medicare_fs_id, '76705', 175.00, 'ECHO EXAM OF ABDOMEN', 'Procedure', 7),
        (medicare_fs_id, '76770', 190.00, 'US EXAM ABDO BACK WALL COMP', 'Procedure', 8),
        (medicare_fs_id, '76856', 260.00, 'US EXAM PELVIC COMPLETE', 'Procedure', 9),
        (medicare_fs_id, '76857', 220.00, 'US EXAM PELVIC LIMITED', 'Procedure', 10),
        (medicare_fs_id, '76870', 150.00, 'US EXAM SCROTUM', 'Procedure', 11),
        (medicare_fs_id, '77063', 300.00, 'BREAST TOMOSYNTHESIS BI', 'Procedure', 12),
        (medicare_fs_id, '77067', 240.00, 'SCR MAMMO BI INCL CAD', 'Procedure', 13),
        (medicare_fs_id, '93306', 350.00, 'TTE W/DOPPLER COMPLETE', 'Procedure', 14),
        (medicare_fs_id, '93880', 280.00, 'EXTRACRANIAL BILAT STUDY', 'Procedure', 15),
        (medicare_fs_id, '93978', 300.00, 'VASCULAR STUDY', 'Procedure', 16)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Insert procedures for Contract-Based Fee Schedule (higher prices)
    IF contract_fs_id IS NOT NULL THEN
        INSERT INTO fee_schedule_procedures (fee_schedule_id, code, price, description, type, sequence_order) VALUES
        (contract_fs_id, '99212', 80.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 1),
        (contract_fs_id, '99213', 105.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 2),
        (contract_fs_id, '99214', 158.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 3),
        (contract_fs_id, '99215', 210.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 4),
        (contract_fs_id, '71271', 263.00, 'CT THORAX LUNG CANCER SCR C-', 'Procedure', 5),
        (contract_fs_id, '76536', 189.00, 'US EXAM OF HEAD AND NECK', 'Procedure', 6),
        (contract_fs_id, '76705', 210.00, 'ECHO EXAM OF ABDOMEN', 'Procedure', 7),
        (contract_fs_id, '76770', 231.00, 'US EXAM ABDO BACK WALL COMP', 'Procedure', 8),
        (contract_fs_id, '76856', 315.00, 'US EXAM PELVIC COMPLETE', 'Procedure', 9),
        (contract_fs_id, '76857', 263.00, 'US EXAM PELVIC LIMITED', 'Procedure', 10),
        (contract_fs_id, '76870', 189.00, 'US EXAM SCROTUM', 'Procedure', 11),
        (contract_fs_id, '77063', 368.00, 'BREAST TOMOSYNTHESIS BI', 'Procedure', 12),
        (contract_fs_id, '77067', 294.00, 'SCR MAMMO BI INCL CAD', 'Procedure', 13),
        (contract_fs_id, '93306', 420.00, 'TTE W/DOPPLER COMPLETE', 'Procedure', 14),
        (contract_fs_id, '93880', 336.00, 'EXTRACRANIAL BILAT STUDY', 'Procedure', 15),
        (contract_fs_id, '93978', 368.00, 'VASCULAR STUDY', 'Procedure', 16)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Insert procedures for Charges-Based Fee Schedule
    IF charges_fs_id IS NOT NULL THEN
        INSERT INTO fee_schedule_procedures (fee_schedule_id, code, price, description, type, sequence_order) VALUES
        (charges_fs_id, '99212', 70.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 1),
        (charges_fs_id, '99213', 95.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 2),
        (charges_fs_id, '99214', 140.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 3),
        (charges_fs_id, '99215', 185.00, 'OFFICE VISIT - ESTABLISHED PATIENT', 'Procedure', 4),
        (charges_fs_id, '71271', 235.00, 'CT THORAX LUNG CANCER SCR C-', 'Procedure', 5),
        (charges_fs_id, '76536', 165.00, 'US EXAM OF HEAD AND NECK', 'Procedure', 6),
        (charges_fs_id, '76705', 188.00, 'ECHO EXAM OF ABDOMEN', 'Procedure', 7),
        (charges_fs_id, '76770', 205.00, 'US EXAM ABDO BACK WALL COMP', 'Procedure', 8),
        (charges_fs_id, '76856', 280.00, 'US EXAM PELVIC COMPLETE', 'Procedure', 9),
        (charges_fs_id, '76857', 235.00, 'US EXAM PELVIC LIMITED', 'Procedure', 10),
        (charges_fs_id, '76870', 165.00, 'US EXAM SCROTUM', 'Procedure', 11),
        (charges_fs_id, '77063', 325.00, 'BREAST TOMOSYNTHESIS BI', 'Procedure', 12),
        (charges_fs_id, '77067', 260.00, 'SCR MAMMO BI INCL CAD', 'Procedure', 13),
        (charges_fs_id, '93306', 375.00, 'TTE W/DOPPLER COMPLETE', 'Procedure', 14),
        (charges_fs_id, '93880', 300.00, 'EXTRACRANIAL BILAT STUDY', 'Procedure', 15),
        (charges_fs_id, '93978', 325.00, 'VASCULAR STUDY', 'Procedure', 16)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - uncomment to verify data)
-- ============================================================================
-- Note: Run these queries separately, not all at once

-- Query 1: Count fee schedules
-- SELECT COUNT(*) as fee_schedule_count FROM fee_schedules;

-- Query 2: Count procedures
-- SELECT COUNT(*) as procedure_count FROM fee_schedule_procedures;

-- Query 3: Fee schedules with procedure counts
-- SELECT 
--     fs.name, 
--     fs.sequence_number, 
--     COUNT(fsp.id) as procedure_count 
-- FROM fee_schedules fs 
-- LEFT JOIN fee_schedule_procedures fsp ON fs.id = fsp.fee_schedule_id 
-- GROUP BY fs.id, fs.name, fs.sequence_number 
-- ORDER BY fs.sequence_number;

