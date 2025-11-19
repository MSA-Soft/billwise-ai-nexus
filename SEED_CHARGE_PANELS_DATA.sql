-- ============================================================================
-- SEED CHARGE PANELS DATA
-- ============================================================================
-- This file seeds the charge_panels and charge_panel_details tables with sample data
-- Run this in Supabase SQL Editor AFTER running CREATE_CHARGE_PANELS_TABLE.sql
-- ============================================================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE charge_panel_details CASCADE;
-- TRUNCATE TABLE charge_panels CASCADE;

-- Insert sample charge panels
INSERT INTO charge_panels (title, code, type, description, status, is_active) VALUES
('CT Billing Panel', 'CT001', 'Professional', 'Comprehensive CT scan billing panel with multiple procedure codes', 'active', true),
('Male Ultrasound Panel', 'MALE_US', 'Professional', 'Male ultrasound examination panel', 'active', true),
('Female Ultrasound Panel', 'FEMALE_US', 'Professional', 'Female ultrasound examination panel', 'active', true),
('Cardiology Panel', 'CARD001', 'Professional', 'Cardiology diagnostic panel', 'active', true),
('Laboratory Panel', 'LAB001', 'Technical', 'Standard laboratory test panel', 'active', true),
('Radiology Panel', 'RAD001', 'Technical', 'Radiology imaging panel', 'active', true),
('Emergency Panel', 'ER001', 'Facility', 'Emergency department charge panel', 'active', true),
('Surgery Panel', 'SURG001', 'Professional', 'Surgical procedure panel', 'active', true)

ON CONFLICT (code) DO NOTHING
RETURNING id, code;

-- Get panel IDs for inserting details
DO $$
DECLARE
    ct_panel_id UUID;
    male_us_panel_id UUID;
    female_us_panel_id UUID;
    card_panel_id UUID;
    lab_panel_id UUID;
    rad_panel_id UUID;
    er_panel_id UUID;
    surg_panel_id UUID;
BEGIN
    -- Get panel IDs
    SELECT id INTO ct_panel_id FROM charge_panels WHERE code = 'CT001';
    SELECT id INTO male_us_panel_id FROM charge_panels WHERE code = 'MALE_US';
    SELECT id INTO female_us_panel_id FROM charge_panels WHERE code = 'FEMALE_US';
    SELECT id INTO card_panel_id FROM charge_panels WHERE code = 'CARD001';
    SELECT id INTO lab_panel_id FROM charge_panels WHERE code = 'LAB001';
    SELECT id INTO rad_panel_id FROM charge_panels WHERE code = 'RAD001';
    SELECT id INTO er_panel_id FROM charge_panels WHERE code = 'ER001';
    SELECT id INTO surg_panel_id FROM charge_panels WHERE code = 'SURG001';

    -- CT Billing Panel Details
    IF ct_panel_id IS NOT NULL THEN
        INSERT INTO charge_panel_details (charge_panel_id, code, pos, tos, modifier_options, price, units, sequence_order) VALUES
        (ct_panel_id, '93880', '11', '1', 'Code Defaults', 'Code Default', 1.00, 1),
        (ct_panel_id, '76536', '11', '1', 'Code Defaults', 'Code Default', 1.00, 2),
        (ct_panel_id, '93306', '11', '1', 'Code Defaults', 'Code Default', 1.00, 3),
        (ct_panel_id, '71271', '11', '1', 'Code Defaults', 'Code Default', 1.00, 4);
    END IF;

    -- Male Ultrasound Panel Details
    IF male_us_panel_id IS NOT NULL THEN
        INSERT INTO charge_panel_details (charge_panel_id, code, pos, tos, modifier_options, price, units, sequence_order) VALUES
        (male_us_panel_id, '76770', '11', '1', 'Code Defaults', 'Code Default', 1.00, 1),
        (male_us_panel_id, '76870', '11', '1', 'Code Defaults', 'Code Default', 1.00, 2),
        (male_us_panel_id, '76536', '11', '1', 'Code Defaults', 'Code Default', 1.00, 3);
    END IF;

    -- Female Ultrasound Panel Details
    IF female_us_panel_id IS NOT NULL THEN
        INSERT INTO charge_panel_details (charge_panel_id, code, pos, tos, modifier_options, price, units, sequence_order) VALUES
        (female_us_panel_id, '76856', '11', '1', 'Code Defaults', 'Code Default', 1.00, 1),
        (female_us_panel_id, '76857', '11', '1', 'Code Defaults', 'Code Default', 1.00, 2),
        (female_us_panel_id, '76770', '11', '1', 'Code Defaults', 'Code Default', 1.00, 3);
    END IF;

    -- Cardiology Panel Details
    IF card_panel_id IS NOT NULL THEN
        INSERT INTO charge_panel_details (charge_panel_id, code, pos, tos, modifier_options, price, units, sequence_order) VALUES
        (card_panel_id, '93306', '11', '1', 'Code Defaults', 'Code Default', 1.00, 1),
        (card_panel_id, '93307', '11', '1', 'Code Defaults', 'Code Default', 1.00, 2),
        (card_panel_id, '93308', '11', '1', 'Code Defaults', 'Code Default', 1.00, 3),
        (card_panel_id, '93000', '11', '1', 'Code Defaults', 'Code Default', 1.00, 4);
    END IF;

    -- Laboratory Panel Details
    IF lab_panel_id IS NOT NULL THEN
        INSERT INTO charge_panel_details (charge_panel_id, code, pos, tos, modifier_options, price, units, sequence_order) VALUES
        (lab_panel_id, '80053', '11', '1', 'Code Defaults', 'Code Default', 1.00, 1),
        (lab_panel_id, '80048', '11', '1', 'Code Defaults', 'Code Default', 1.00, 2),
        (lab_panel_id, '85025', '11', '1', 'Code Defaults', 'Code Default', 1.00, 3);
    END IF;

    -- Radiology Panel Details
    IF rad_panel_id IS NOT NULL THEN
        INSERT INTO charge_panel_details (charge_panel_id, code, pos, tos, modifier_options, price, units, sequence_order) VALUES
        (rad_panel_id, '71250', '11', '1', 'Code Defaults', 'Code Default', 1.00, 1),
        (rad_panel_id, '72141', '11', '1', 'Code Defaults', 'Code Default', 1.00, 2),
        (rad_panel_id, '73721', '11', '1', 'Code Defaults', 'Code Default', 1.00, 3);
    END IF;

    -- Emergency Panel Details
    IF er_panel_id IS NOT NULL THEN
        INSERT INTO charge_panel_details (charge_panel_id, code, pos, tos, modifier_options, price, units, sequence_order) VALUES
        (er_panel_id, '99281', '23', '1', 'Code Defaults', 'Code Default', 1.00, 1),
        (er_panel_id, '99282', '23', '1', 'Code Defaults', 'Code Default', 1.00, 2),
        (er_panel_id, '99283', '23', '1', 'Code Defaults', 'Code Default', 1.00, 3),
        (er_panel_id, '99284', '23', '1', 'Code Defaults', 'Code Default', 1.00, 4),
        (er_panel_id, '99285', '23', '1', 'Code Defaults', 'Code Default', 1.00, 5);
    END IF;

    -- Surgery Panel Details
    IF surg_panel_id IS NOT NULL THEN
        INSERT INTO charge_panel_details (charge_panel_id, code, pos, tos, modifier_options, price, units, sequence_order) VALUES
        (surg_panel_id, '10021', '11', '1', 'Code Defaults', 'Code Default', 1.00, 1),
        (surg_panel_id, '10040', '11', '1', 'Code Defaults', 'Code Default', 1.00, 2),
        (surg_panel_id, '10060', '11', '1', 'Code Defaults', 'Code Default', 1.00, 3);
    END IF;
END $$;

-- Verify data was inserted
SELECT 
    'Charge Panels' AS table_name,
    COUNT(*) as total_panels,
    COUNT(*) FILTER (WHERE status = 'active') as active_panels
FROM charge_panels;

SELECT 
    'Charge Panel Details' AS table_name,
    COUNT(*) as total_details,
    COUNT(DISTINCT charge_panel_id) as panels_with_details
FROM charge_panel_details;

-- Display sample of inserted panels with their details count
SELECT 
    cp.code,
    cp.title,
    cp.type,
    COUNT(cpd.id) as detail_count
FROM charge_panels cp
LEFT JOIN charge_panel_details cpd ON cp.id = cpd.charge_panel_id
GROUP BY cp.id, cp.code, cp.title, cp.type
ORDER BY cp.code
LIMIT 10;

SELECT '✅ Charge panels seed data inserted successfully!' AS status;

