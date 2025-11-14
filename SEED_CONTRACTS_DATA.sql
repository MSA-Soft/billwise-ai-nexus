-- ============================================================================
-- SEED CONTRACTS DATA
-- ============================================================================
-- This file inserts sample data into the contracts and contract_procedures tables
-- Run this in Supabase SQL Editor after running CREATE_CONTRACTS_TABLE.sql
-- ============================================================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE contract_procedures CASCADE;
-- TRUNCATE TABLE contracts CASCADE;

-- Insert sample contracts
INSERT INTO contracts (name, type, sequence_number, allow_users_to_update_prices, status, is_active) VALUES
('Medicare FFS Contract', 'FFS', 'CT001', true, 'active', true),
('Blue Cross Blue Shield HMO', 'HMO', 'CT002', false, 'active', true),
('Aetna PPO Contract', 'PPO', 'CT003', true, 'active', true),
('UnitedHealthcare FFS', 'FFS', 'CT004', true, 'active', true),
('Cigna HMO Contract', 'HMO', 'CT005', false, 'active', true),
('Humana PPO', 'PPO', 'CT006', true, 'active', true),
('Medicaid FFS Contract', 'FFS', 'CT007', true, 'active', true),
('Kaiser Permanente HMO', 'HMO', 'CT008', false, 'active', true)
ON CONFLICT (sequence_number) DO NOTHING;

-- Get contract IDs for reference
DO $$
DECLARE
    contract_ct001_id UUID;
    contract_ct002_id UUID;
    contract_ct003_id UUID;
    contract_ct004_id UUID;
    contract_ct005_id UUID;
    contract_ct006_id UUID;
    contract_ct007_id UUID;
    contract_ct008_id UUID;
BEGIN
    -- Get contract IDs
    SELECT id INTO contract_ct001_id FROM contracts WHERE sequence_number = 'CT001';
    SELECT id INTO contract_ct002_id FROM contracts WHERE sequence_number = 'CT002';
    SELECT id INTO contract_ct003_id FROM contracts WHERE sequence_number = 'CT003';
    SELECT id INTO contract_ct004_id FROM contracts WHERE sequence_number = 'CT004';
    SELECT id INTO contract_ct005_id FROM contracts WHERE sequence_number = 'CT005';
    SELECT id INTO contract_ct006_id FROM contracts WHERE sequence_number = 'CT006';
    SELECT id INTO contract_ct007_id FROM contracts WHERE sequence_number = 'CT007';
    SELECT id INTO contract_ct008_id FROM contracts WHERE sequence_number = 'CT008';

    -- Insert procedures for Medicare FFS Contract (CT001)
    IF contract_ct001_id IS NOT NULL THEN
        INSERT INTO contract_procedures (contract_id, code, price, description, type, exclude, sequence_order) VALUES
        (contract_ct001_id, '71271', 150.00, 'CT THORAX LUNG CANCER SCR C-', 'Procedure', false, 1),
        (contract_ct001_id, '76536', 200.00, 'US EXAM OF HEAD AND NECK', 'Procedure', false, 2),
        (contract_ct001_id, '76705', 180.00, 'ECHO EXAM OF ABDOMEN', 'Procedure', false, 3),
        (contract_ct001_id, '76770', 220.00, 'US EXAM ABDO BACK WALL COMP', 'Procedure', false, 4),
        (contract_ct001_id, '76856', 250.00, 'US EXAM PELVIC COMPLETE', 'Procedure', false, 5),
        (contract_ct001_id, '76857', 200.00, 'US EXAM PELVIC LIMITED', 'Procedure', false, 6),
        (contract_ct001_id, '76870', 180.00, 'US EXAM SCROTUM', 'Procedure', false, 7),
        (contract_ct001_id, '77063', 300.00, 'BREAST TOMOSYNTHESIS BI', 'Procedure', false, 8),
        (contract_ct001_id, '77067', 280.00, 'SCR MAMMO BI INCL CAD', 'Procedure', false, 9),
        (contract_ct001_id, '93306', 350.00, 'TTE W/DOPPLER COMPLETE', 'Procedure', false, 10),
        (contract_ct001_id, '93880', 400.00, 'EXTRACRANIAL BILAT STUDY', 'Procedure', false, 11),
        (contract_ct001_id, '93978', 320.00, 'VASCULAR STUDY', 'Procedure', false, 12);
    END IF;

    -- Insert procedures for Blue Cross Blue Shield HMO (CT002)
    IF contract_ct002_id IS NOT NULL THEN
        INSERT INTO contract_procedures (contract_id, code, price, description, type, exclude, sequence_order) VALUES
        (contract_ct002_id, '71271', 140.00, 'CT THORAX LUNG CANCER SCR C-', 'Procedure', false, 1),
        (contract_ct002_id, '76536', 190.00, 'US EXAM OF HEAD AND NECK', 'Procedure', false, 2),
        (contract_ct002_id, '76705', 170.00, 'ECHO EXAM OF ABDOMEN', 'Procedure', false, 3),
        (contract_ct002_id, '76770', 210.00, 'US EXAM ABDO BACK WALL COMP', 'Procedure', false, 4),
        (contract_ct002_id, '76856', 240.00, 'US EXAM PELVIC COMPLETE', 'Procedure', false, 5),
        (contract_ct002_id, '76857', 190.00, 'US EXAM PELVIC LIMITED', 'Procedure', false, 6),
        (contract_ct002_id, '76870', 170.00, 'US EXAM SCROTUM', 'Procedure', false, 7),
        (contract_ct002_id, '77063', 290.00, 'BREAST TOMOSYNTHESIS BI', 'Procedure', false, 8),
        (contract_ct002_id, '77067', 270.00, 'SCR MAMMO BI INCL CAD', 'Procedure', false, 9),
        (contract_ct002_id, '93306', 340.00, 'TTE W/DOPPLER COMPLETE', 'Procedure', false, 10),
        (contract_ct002_id, '93880', 390.00, 'EXTRACRANIAL BILAT STUDY', 'Procedure', false, 11),
        (contract_ct002_id, '93978', 310.00, 'VASCULAR STUDY', 'Procedure', false, 12);
    END IF;

    -- Insert procedures for Aetna PPO Contract (CT003)
    IF contract_ct003_id IS NOT NULL THEN
        INSERT INTO contract_procedures (contract_id, code, price, description, type, exclude, sequence_order) VALUES
        (contract_ct003_id, '71271', 145.00, 'CT THORAX LUNG CANCER SCR C-', 'Procedure', false, 1),
        (contract_ct003_id, '76536', 195.00, 'US EXAM OF HEAD AND NECK', 'Procedure', false, 2),
        (contract_ct003_id, '76705', 175.00, 'ECHO EXAM OF ABDOMEN', 'Procedure', false, 3),
        (contract_ct003_id, '76770', 215.00, 'US EXAM ABDO BACK WALL COMP', 'Procedure', false, 4),
        (contract_ct003_id, '76856', 245.00, 'US EXAM PELVIC COMPLETE', 'Procedure', false, 5),
        (contract_ct003_id, '76857', 195.00, 'US EXAM PELVIC LIMITED', 'Procedure', false, 6),
        (contract_ct003_id, '76870', 175.00, 'US EXAM SCROTUM', 'Procedure', false, 7),
        (contract_ct003_id, '77063', 295.00, 'BREAST TOMOSYNTHESIS BI', 'Procedure', false, 8),
        (contract_ct003_id, '77067', 275.00, 'SCR MAMMO BI INCL CAD', 'Procedure', false, 9),
        (contract_ct003_id, '93306', 345.00, 'TTE W/DOPPLER COMPLETE', 'Procedure', false, 10),
        (contract_ct003_id, '93880', 395.00, 'EXTRACRANIAL BILAT STUDY', 'Procedure', false, 11),
        (contract_ct003_id, '93978', 315.00, 'VASCULAR STUDY', 'Procedure', false, 12);
    END IF;

    -- Insert procedures for UnitedHealthcare FFS (CT004)
    IF contract_ct004_id IS NOT NULL THEN
        INSERT INTO contract_procedures (contract_id, code, price, description, type, exclude, sequence_order) VALUES
        (contract_ct004_id, '71271', 155.00, 'CT THORAX LUNG CANCER SCR C-', 'Procedure', false, 1),
        (contract_ct004_id, '76536', 205.00, 'US EXAM OF HEAD AND NECK', 'Procedure', false, 2),
        (contract_ct004_id, '76705', 185.00, 'ECHO EXAM OF ABDOMEN', 'Procedure', false, 3),
        (contract_ct004_id, '76770', 225.00, 'US EXAM ABDO BACK WALL COMP', 'Procedure', false, 4),
        (contract_ct004_id, '76856', 255.00, 'US EXAM PELVIC COMPLETE', 'Procedure', false, 5),
        (contract_ct004_id, '76857', 205.00, 'US EXAM PELVIC LIMITED', 'Procedure', false, 6),
        (contract_ct004_id, '76870', 185.00, 'US EXAM SCROTUM', 'Procedure', false, 7),
        (contract_ct004_id, '77063', 305.00, 'BREAST TOMOSYNTHESIS BI', 'Procedure', false, 8),
        (contract_ct004_id, '77067', 285.00, 'SCR MAMMO BI INCL CAD', 'Procedure', false, 9),
        (contract_ct004_id, '93306', 355.00, 'TTE W/DOPPLER COMPLETE', 'Procedure', false, 10),
        (contract_ct004_id, '93880', 405.00, 'EXTRACRANIAL BILAT STUDY', 'Procedure', false, 11),
        (contract_ct004_id, '93978', 325.00, 'VASCULAR STUDY', 'Procedure', false, 12);
    END IF;

    -- Insert procedures for Cigna HMO Contract (CT005)
    IF contract_ct005_id IS NOT NULL THEN
        INSERT INTO contract_procedures (contract_id, code, price, description, type, exclude, sequence_order) VALUES
        (contract_ct005_id, '71271', 135.00, 'CT THORAX LUNG CANCER SCR C-', 'Procedure', false, 1),
        (contract_ct005_id, '76536', 185.00, 'US EXAM OF HEAD AND NECK', 'Procedure', false, 2),
        (contract_ct005_id, '76705', 165.00, 'ECHO EXAM OF ABDOMEN', 'Procedure', false, 3),
        (contract_ct005_id, '76770', 205.00, 'US EXAM ABDO BACK WALL COMP', 'Procedure', false, 4),
        (contract_ct005_id, '76856', 235.00, 'US EXAM PELVIC COMPLETE', 'Procedure', false, 5),
        (contract_ct005_id, '76857', 185.00, 'US EXAM PELVIC LIMITED', 'Procedure', false, 6),
        (contract_ct005_id, '76870', 165.00, 'US EXAM SCROTUM', 'Procedure', false, 7),
        (contract_ct005_id, '77063', 285.00, 'BREAST TOMOSYNTHESIS BI', 'Procedure', false, 8),
        (contract_ct005_id, '77067', 265.00, 'SCR MAMMO BI INCL CAD', 'Procedure', false, 9),
        (contract_ct005_id, '93306', 335.00, 'TTE W/DOPPLER COMPLETE', 'Procedure', false, 10),
        (contract_ct005_id, '93880', 385.00, 'EXTRACRANIAL BILAT STUDY', 'Procedure', false, 11),
        (contract_ct005_id, '93978', 305.00, 'VASCULAR STUDY', 'Procedure', false, 12);
    END IF;

    -- Insert procedures for Humana PPO (CT006)
    IF contract_ct006_id IS NOT NULL THEN
        INSERT INTO contract_procedures (contract_id, code, price, description, type, exclude, sequence_order) VALUES
        (contract_ct006_id, '71271', 148.00, 'CT THORAX LUNG CANCER SCR C-', 'Procedure', false, 1),
        (contract_ct006_id, '76536', 198.00, 'US EXAM OF HEAD AND NECK', 'Procedure', false, 2),
        (contract_ct006_id, '76705', 178.00, 'ECHO EXAM OF ABDOMEN', 'Procedure', false, 3),
        (contract_ct006_id, '76770', 218.00, 'US EXAM ABDO BACK WALL COMP', 'Procedure', false, 4),
        (contract_ct006_id, '76856', 248.00, 'US EXAM PELVIC COMPLETE', 'Procedure', false, 5),
        (contract_ct006_id, '76857', 198.00, 'US EXAM PELVIC LIMITED', 'Procedure', false, 6),
        (contract_ct006_id, '76870', 178.00, 'US EXAM SCROTUM', 'Procedure', false, 7),
        (contract_ct006_id, '77063', 298.00, 'BREAST TOMOSYNTHESIS BI', 'Procedure', false, 8),
        (contract_ct006_id, '77067', 278.00, 'SCR MAMMO BI INCL CAD', 'Procedure', false, 9),
        (contract_ct006_id, '93306', 348.00, 'TTE W/DOPPLER COMPLETE', 'Procedure', false, 10),
        (contract_ct006_id, '93880', 398.00, 'EXTRACRANIAL BILAT STUDY', 'Procedure', false, 11),
        (contract_ct006_id, '93978', 318.00, 'VASCULAR STUDY', 'Procedure', false, 12);
    END IF;

    -- Insert procedures for Medicaid FFS Contract (CT007)
    IF contract_ct007_id IS NOT NULL THEN
        INSERT INTO contract_procedures (contract_id, code, price, description, type, exclude, sequence_order) VALUES
        (contract_ct007_id, '71271', 120.00, 'CT THORAX LUNG CANCER SCR C-', 'Procedure', false, 1),
        (contract_ct007_id, '76536', 160.00, 'US EXAM OF HEAD AND NECK', 'Procedure', false, 2),
        (contract_ct007_id, '76705', 150.00, 'ECHO EXAM OF ABDOMEN', 'Procedure', false, 3),
        (contract_ct007_id, '76770', 180.00, 'US EXAM ABDO BACK WALL COMP', 'Procedure', false, 4),
        (contract_ct007_id, '76856', 200.00, 'US EXAM PELVIC COMPLETE', 'Procedure', false, 5),
        (contract_ct007_id, '76857', 160.00, 'US EXAM PELVIC LIMITED', 'Procedure', false, 6),
        (contract_ct007_id, '76870', 150.00, 'US EXAM SCROTUM', 'Procedure', false, 7),
        (contract_ct007_id, '77063', 250.00, 'BREAST TOMOSYNTHESIS BI', 'Procedure', false, 8),
        (contract_ct007_id, '77067', 230.00, 'SCR MAMMO BI INCL CAD', 'Procedure', false, 9),
        (contract_ct007_id, '93306', 300.00, 'TTE W/DOPPLER COMPLETE', 'Procedure', false, 10),
        (contract_ct007_id, '93880', 350.00, 'EXTRACRANIAL BILAT STUDY', 'Procedure', false, 11),
        (contract_ct007_id, '93978', 280.00, 'VASCULAR STUDY', 'Procedure', false, 12);
    END IF;

    -- Insert procedures for Kaiser Permanente HMO (CT008)
    IF contract_ct008_id IS NOT NULL THEN
        INSERT INTO contract_procedures (contract_id, code, price, description, type, exclude, sequence_order) VALUES
        (contract_ct008_id, '71271', 130.00, 'CT THORAX LUNG CANCER SCR C-', 'Procedure', false, 1),
        (contract_ct008_id, '76536', 180.00, 'US EXAM OF HEAD AND NECK', 'Procedure', false, 2),
        (contract_ct008_id, '76705', 160.00, 'ECHO EXAM OF ABDOMEN', 'Procedure', false, 3),
        (contract_ct008_id, '76770', 200.00, 'US EXAM ABDO BACK WALL COMP', 'Procedure', false, 4),
        (contract_ct008_id, '76856', 230.00, 'US EXAM PELVIC COMPLETE', 'Procedure', false, 5),
        (contract_ct008_id, '76857', 180.00, 'US EXAM PELVIC LIMITED', 'Procedure', false, 6),
        (contract_ct008_id, '76870', 160.00, 'US EXAM SCROTUM', 'Procedure', false, 7),
        (contract_ct008_id, '77063', 280.00, 'BREAST TOMOSYNTHESIS BI', 'Procedure', false, 8),
        (contract_ct008_id, '77067', 260.00, 'SCR MAMMO BI INCL CAD', 'Procedure', false, 9),
        (contract_ct008_id, '93306', 330.00, 'TTE W/DOPPLER COMPLETE', 'Procedure', false, 10),
        (contract_ct008_id, '93880', 380.00, 'EXTRACRANIAL BILAT STUDY', 'Procedure', false, 11),
        (contract_ct008_id, '93978', 300.00, 'VASCULAR STUDY', 'Procedure', false, 12);
    END IF;
END $$;

-- Verification
SELECT 
    c.name,
    c.type,
    c.sequence_number,
    COUNT(cp.id) as procedure_count
FROM contracts c
LEFT JOIN contract_procedures cp ON c.id = cp.contract_id
GROUP BY c.id, c.name, c.type, c.sequence_number
ORDER BY c.sequence_number;

