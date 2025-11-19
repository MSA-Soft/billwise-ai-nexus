-- ============================================================================
-- SEED INVENTORY CODES DATA - COMPREHENSIVE
-- ============================================================================
-- This file seeds the inventory_codes table with comprehensive sample data
-- Run this in Supabase SQL Editor AFTER running FIX_INVENTORY_CODES_BINDING.sql
-- ============================================================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE inventory_codes CASCADE;

-- Insert comprehensive inventory codes
INSERT INTO inventory_codes (code, procedure_code, quantity, code_description, billing_description, use_alert, status, is_active) VALUES
-- ============================================================================
-- MEDICAL SUPPLIES & INJECTION SUPPLIES
-- ============================================================================
('INV001', '99070', 1, 'Medical supplies and materials', 'Medical supplies and materials provided during visit', false, 'active', true),
('INV002', 'A4217', 1, 'Syringe with needle', 'Disposable syringe with needle', false, 'active', true),
('INV003', 'A4218', 1, 'Needle-free injection system', 'Needle-free injection system', true, 'active', true),
('INV004', 'A4220', 1, 'Supplies for self-administered injection', 'Supplies for self-administered injection', false, 'active', true),
('INV005', 'A4230', 1, 'Injection supplies', 'Injection supplies', false, 'active', true),
('INV006', 'A4216', 1, 'Needle, non-coring', 'Non-coring needle', false, 'active', true),
('INV007', 'A4221', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),
('INV008', 'A4222', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),
('INV009', 'A4223', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),
('INV010', 'A4224', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),

-- ============================================================================
-- DURABLE MEDICAL EQUIPMENT (DME)
-- ============================================================================
('INV011', 'E0100', 1, 'Cane, standard', 'Standard cane for mobility assistance', false, 'active', true),
('INV012', 'E0105', 1, 'Cane with tip', 'Cane with rubber tip', false, 'active', true),
('INV013', 'E0110', 1, 'Crutches, forearm', 'Forearm crutches', false, 'active', true),
('INV014', 'E0111', 1, 'Crutches, underarm', 'Underarm crutches', false, 'active', true),
('INV015', 'E0114', 1, 'Crutch accessories', 'Crutch accessories and parts', false, 'active', true),
('INV016', 'E0118', 1, 'Crutch, underarm, other than wood', 'Underarm crutch, non-wood', false, 'active', true),
('INV017', 'E0130', 1, 'Walker, rigid', 'Rigid walker', false, 'active', true),
('INV018', 'E0135', 1, 'Walker, folding', 'Folding walker', false, 'active', true),
('INV019', 'E0140', 1, 'Walker, with wheels', 'Walker with wheels', false, 'active', true),
('INV020', 'E0141', 1, 'Walker, rigid, wheeled', 'Rigid wheeled walker', false, 'active', true),

-- ============================================================================
-- LABORATORY SUPPLIES
-- ============================================================================
('INV021', '36415', 1, 'Routine venipuncture', 'Routine venipuncture for collection of specimen', false, 'active', true),
('INV022', '36416', 1, 'Collection of capillary blood', 'Collection of capillary blood specimen', false, 'active', true),
('INV023', '99000', 1, 'Handling and/or conveyance of specimen', 'Handling and/or conveyance of specimen', false, 'active', true),
('INV024', '99001', 1, 'Handling and/or conveyance of specimen', 'Handling and/or conveyance of specimen', false, 'active', true),
('INV025', '99002', 1, 'Handling and/or conveyance of specimen', 'Handling and/or conveyance of specimen', false, 'active', true),
('INV026', 'A4649', 1, 'Radiopharmaceutical diagnostic imaging agent', 'Radiopharmaceutical diagnostic imaging agent', false, 'active', true),
('INV027', 'A4650', 1, 'Contrast material', 'Contrast material for diagnostic imaging', false, 'active', true),
('INV028', 'A4651', 1, 'Contrast material, low osmolar', 'Low osmolar contrast material', false, 'active', true),
('INV029', 'A4652', 1, 'Contrast material, high osmolar', 'High osmolar contrast material', false, 'active', true),
('INV030', 'A4653', 1, 'Contrast material, oral', 'Oral contrast material', false, 'active', true),

-- ============================================================================
-- SURGICAL SUPPLIES & TRAYS
-- ============================================================================
('INV031', '99070', 1, 'Surgical tray', 'Surgical tray and supplies', false, 'active', true),
('INV032', 'A4550', 1, 'Surgical tray', 'Surgical tray', false, 'active', true),
('INV033', 'A4556', 1, 'Surgical tray - minor procedure', 'Surgical tray for minor procedure', false, 'active', true),
('INV034', 'A4557', 1, 'Surgical tray - intermediate procedure', 'Surgical tray for intermediate procedure', false, 'active', true),
('INV035', 'A4558', 1, 'Surgical tray - complex procedure', 'Surgical tray for complex procedure', true, 'active', true),
('INV036', 'A4559', 1, 'Surgical tray - major procedure', 'Surgical tray for major procedure', true, 'active', true),
('INV037', 'A4560', 1, 'Surgical tray - specialty procedure', 'Surgical tray for specialty procedure', false, 'active', true),
('INV038', 'A4561', 1, 'Surgical tray - sterile pack', 'Sterile surgical pack', false, 'active', true),
('INV039', 'A4562', 1, 'Surgical tray - disposable instruments', 'Disposable surgical instruments', false, 'active', true),
('INV040', 'A4563', 1, 'Surgical tray - biopsy', 'Biopsy surgical tray', false, 'active', true),

-- ============================================================================
-- WOUND CARE SUPPLIES
-- ============================================================================
('INV041', 'A6196', 1, 'Alginate dressing', 'Alginate wound dressing', false, 'active', true),
('INV042', 'A6197', 1, 'Foam dressing', 'Foam wound dressing', false, 'active', true),
('INV043', 'A6198', 1, 'Gauze dressing', 'Gauze wound dressing', false, 'active', true),
('INV044', 'A6199', 1, 'Composite dressing', 'Composite wound dressing', false, 'active', true),
('INV045', 'A6200', 1, 'Hydrocolloid dressing', 'Hydrocolloid wound dressing', false, 'active', true),
('INV046', 'A6201', 1, 'Hydrogel dressing', 'Hydrogel wound dressing', false, 'active', true),
('INV047', 'A6202', 1, 'Transparent film dressing', 'Transparent film wound dressing', false, 'active', true),
('INV048', 'A6203', 1, 'Wound filler', 'Wound filler dressing', false, 'active', true),
('INV049', 'A6204', 1, 'Wound pouch', 'Wound pouch dressing', false, 'active', true),
('INV050', 'A6205', 1, 'Wound cleanser', 'Wound cleanser solution', false, 'active', true),

-- ============================================================================
-- ORTHOPEDIC SUPPLIES
-- ============================================================================
('INV051', 'A4570', 1, 'Splint, prefabricated', 'Prefabricated splint', false, 'active', true),
('INV052', 'A4575', 1, 'Splint, custom', 'Custom fabricated splint', false, 'active', true),
('INV053', 'A4590', 1, 'Specialty splint', 'Specialty splint', false, 'active', true),
('INV054', 'A4595', 1, 'Strapping supplies', 'Strapping supplies for splint', false, 'active', true),
('INV055', 'A4596', 1, 'Elastic bandage', 'Elastic bandage', false, 'active', true),
('INV056', 'A4597', 1, 'Ace bandage', 'Ace wrap bandage', false, 'active', true),
('INV057', 'A4598', 1, 'Casting supplies', 'Casting supplies and materials', false, 'active', true),
('INV058', 'A4599', 1, 'Casting tape', 'Casting tape', false, 'active', true),
('INV059', 'A4600', 1, 'Sling', 'Arm sling', false, 'active', true),
('INV060', 'A4601', 1, 'Cervical collar', 'Cervical collar', false, 'active', true),

-- ============================================================================
-- RESPIRATORY SUPPLIES
-- ============================================================================
('INV061', 'A7000', 1, 'Administration set', 'Administration set for respiratory therapy', false, 'active', true),
('INV062', 'A7001', 1, 'Canister, disposable', 'Disposable canister for respiratory equipment', false, 'active', true),
('INV063', 'A7002', 1, 'Swivel adapter', 'Swivel adapter for respiratory equipment', false, 'active', true),
('INV064', 'A7003', 1, 'Water chamber', 'Water chamber for humidifier', false, 'active', true),
('INV065', 'A7004', 1, 'Nebulizer kit', 'Nebulizer kit', false, 'active', true),
('INV066', 'A7005', 1, 'Nebulizer mask', 'Nebulizer mask', false, 'active', true),
('INV067', 'A7006', 1, 'Oxygen tubing', 'Oxygen delivery tubing', false, 'active', true),
('INV068', 'A7007', 1, 'Oxygen cannula', 'Nasal oxygen cannula', false, 'active', true),
('INV069', 'A7008', 1, 'Oxygen mask', 'Oxygen delivery mask', false, 'active', true),
('INV070', 'A7009', 1, 'Ventilator circuit', 'Ventilator circuit', true, 'active', true),

-- ============================================================================
-- UROLOGICAL SUPPLIES
-- ============================================================================
('INV071', 'A4351', 1, 'Intermittent urinary catheter', 'Intermittent urinary catheter', false, 'active', true),
('INV072', 'A4352', 1, 'Intermittent urinary catheter with insertion supplies', 'Intermittent urinary catheter with insertion supplies', false, 'active', true),
('INV073', 'A4353', 1, 'Intermittent urinary catheter, closed system', 'Intermittent urinary catheter, closed system', false, 'active', true),
('INV074', 'A4354', 1, 'Intermittent urinary catheter, sterile', 'Intermittent urinary catheter, sterile', false, 'active', true),
('INV075', 'A4355', 1, 'Intermittent urinary catheter, non-sterile', 'Intermittent urinary catheter, non-sterile', false, 'active', true),
('INV076', 'A4356', 1, 'Urinary drainage bag', 'Urinary drainage bag', false, 'active', true),
('INV077', 'A4357', 1, 'Urinary drainage bag, leg', 'Leg urinary drainage bag', false, 'active', true),
('INV078', 'A4358', 1, 'Urinary drainage bag, night', 'Night urinary drainage bag', false, 'active', true),
('INV079', 'A4359', 1, 'Urinary drainage tubing', 'Urinary drainage tubing', false, 'active', true),
('INV080', 'A4360', 1, 'Urinary collection device', 'Urinary collection device', false, 'active', true),

-- ============================================================================
-- OSTOMY SUPPLIES
-- ============================================================================
('INV081', 'A4361', 1, 'Ostomy pouch, drainable', 'Drainable ostomy pouch', false, 'active', true),
('INV082', 'A4362', 1, 'Ostomy pouch, closed', 'Closed ostomy pouch', false, 'active', true),
('INV083', 'A4363', 1, 'Ostomy pouch, urostomy', 'Urostomy pouch', false, 'active', true),
('INV084', 'A4364', 1, 'Ostomy skin barrier', 'Ostomy skin barrier', false, 'active', true),
('INV085', 'A4365', 1, 'Ostomy skin barrier, extended wear', 'Extended wear ostomy skin barrier', false, 'active', true),
('INV086', 'A4366', 1, 'Ostomy belt', 'Ostomy belt', false, 'active', true),
('INV087', 'A4367', 1, 'Ostomy deodorant', 'Ostomy deodorant', false, 'active', true),
('INV088', 'A4368', 1, 'Ostomy irrigation set', 'Ostomy irrigation set', false, 'active', true),
('INV089', 'A4369', 1, 'Ostomy irrigation supply', 'Ostomy irrigation supply', false, 'active', true),
('INV090', 'A4370', 1, 'Ostomy accessory', 'Ostomy accessory', false, 'active', true),

-- ============================================================================
-- DIABETIC SUPPLIES
-- ============================================================================
('INV091', 'A4253', 1, 'Blood glucose test strip', 'Blood glucose test strip', false, 'active', true),
('INV092', 'A4254', 1, 'Blood glucose test strip, generic', 'Generic blood glucose test strip', false, 'active', true),
('INV093', 'A4255', 1, 'Blood glucose test strip, brand name', 'Brand name blood glucose test strip', false, 'active', true),
('INV094', 'A4256', 1, 'Blood glucose lancet', 'Blood glucose lancet', false, 'active', true),
('INV095', 'A4257', 1, 'Blood glucose lancet, generic', 'Generic blood glucose lancet', false, 'active', true),
('INV096', 'A4258', 1, 'Blood glucose lancet, brand name', 'Brand name blood glucose lancet', false, 'active', true),
('INV097', 'A4259', 1, 'Blood glucose monitor', 'Blood glucose monitoring device', false, 'active', true),
('INV098', 'A4260', 1, 'Blood glucose monitor, continuous', 'Continuous blood glucose monitor', true, 'active', true),
('INV099', 'A4261', 1, 'Insulin syringe', 'Insulin syringe', false, 'active', true),
('INV100', 'A4262', 1, 'Insulin pen needle', 'Insulin pen needle', false, 'active', true),

-- ============================================================================
-- DIAGNOSTIC SUPPLIES
-- ============================================================================
('INV101', '99070', 1, 'Diagnostic supplies', 'Diagnostic supplies and materials', false, 'active', true),
('INV102', 'A4649', 1, 'Radiopharmaceutical diagnostic imaging agent', 'Radiopharmaceutical diagnostic imaging agent', false, 'active', true),
('INV103', 'A4650', 1, 'Contrast material', 'Contrast material for diagnostic imaging', false, 'active', true),
('INV104', 'A4651', 1, 'Contrast material, low osmolar', 'Low osmolar contrast material', false, 'active', true),
('INV105', 'A4652', 1, 'Contrast material, high osmolar', 'High osmolar contrast material', false, 'active', true),
('INV106', 'A4653', 1, 'Contrast material, oral', 'Oral contrast material', false, 'active', true),
('INV107', 'A4654', 1, 'Contrast material, rectal', 'Rectal contrast material', false, 'active', true),
('INV108', 'A4655', 1, 'Contrast material, intravascular', 'Intravascular contrast material', false, 'active', true),
('INV109', 'A4656', 1, 'Contrast material, intrathecal', 'Intrathecal contrast material', true, 'active', true),
('INV110', 'A4657', 1, 'Contrast material, intra-articular', 'Intra-articular contrast material', false, 'active', true),

-- ============================================================================
-- GENERAL MEDICAL SUPPLIES
-- ============================================================================
('INV111', '99070', 1, 'General medical supplies', 'General medical supplies and materials', false, 'active', true),
('INV112', 'A4216', 1, 'Needle, non-coring', 'Non-coring needle', false, 'active', true),
('INV113', 'A4221', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),
('INV114', 'A4222', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),
('INV115', 'A4223', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),
('INV116', 'A4224', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),
('INV117', 'A4225', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),
('INV118', 'A4226', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),
('INV119', 'A4227', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),
('INV120', 'A4228', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),

-- ============================================================================
-- INFUSION SUPPLIES
-- ============================================================================
('INV121', 'A4213', 1, 'Infusion set', 'Infusion set', false, 'active', true),
('INV122', 'A4214', 1, 'Infusion set, with needle', 'Infusion set with needle', false, 'active', true),
('INV123', 'A4215', 1, 'Infusion set, without needle', 'Infusion set without needle', false, 'active', true),
('INV124', 'A4216', 1, 'Needle, non-coring', 'Non-coring needle for infusion', false, 'active', true),
('INV125', 'A4217', 1, 'Syringe with needle', 'Disposable syringe with needle', false, 'active', true),
('INV126', 'A4218', 1, 'Needle-free injection system', 'Needle-free injection system', true, 'active', true),
('INV127', 'A4219', 1, 'Infusion pump supply', 'Infusion pump supply', false, 'active', true),
('INV128', 'A4220', 1, 'Supplies for self-administered injection', 'Supplies for self-administered injection', false, 'active', true),
('INV129', 'A4221', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),
('INV130', 'A4222', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),

-- ============================================================================
-- ENT SUPPLIES
-- ============================================================================
('INV131', 'A4244', 1, 'Nasal cannula', 'Nasal cannula', false, 'active', true),
('INV132', 'A4245', 1, 'Nasal prong', 'Nasal prong', false, 'active', true),
('INV133', 'A4246', 1, 'Nasal mask', 'Nasal mask', false, 'active', true),
('INV134', 'A4247', 1, 'Nasal pillow', 'Nasal pillow', false, 'active', true),
('INV135', 'A4248', 1, 'Ear plug', 'Ear plug', false, 'active', true),
('INV136', 'A4249', 1, 'Ear mold', 'Ear mold', false, 'active', true),
('INV137', 'A4250', 1, 'Hearing aid battery', 'Hearing aid battery', false, 'active', true),
('INV138', 'A4251', 1, 'Hearing aid supply', 'Hearing aid supply', false, 'active', true),
('INV139', 'A4252', 1, 'Hearing aid accessory', 'Hearing aid accessory', false, 'active', true),
('INV140', 'A4253', 1, 'Blood glucose test strip', 'Blood glucose test strip', false, 'active', true),

-- ============================================================================
-- CARDIAC SUPPLIES
-- ============================================================================
('INV141', 'A4604', 1, 'Tubing with integrated filtering device', 'Tubing with integrated filtering device', false, 'active', true),
('INV142', 'A4605', 1, 'Tubing without integrated filtering device', 'Tubing without integrated filtering device', false, 'active', true),
('INV143', 'A4606', 1, 'Needle, non-coring', 'Non-coring needle', false, 'active', true),
('INV144', 'A4607', 1, 'Syringe with needle', 'Disposable syringe with needle', false, 'active', true),
('INV145', 'A4608', 1, 'Needle-free injection system', 'Needle-free injection system', true, 'active', true),
('INV146', 'A4609', 1, 'Infusion pump supply', 'Infusion pump supply', false, 'active', true),
('INV147', 'A4610', 1, 'Supplies for self-administered injection', 'Supplies for self-administered injection', false, 'active', true),
('INV148', 'A4611', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),
('INV149', 'A4612', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true),
('INV150', 'A4613', 1, 'Supplies for maintenance of drug delivery device', 'Supplies for maintenance of drug delivery device', false, 'active', true)

ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify data was inserted
SELECT 
    COUNT(*) as total_codes,
    COUNT(*) FILTER (WHERE status = 'active') as active_codes,
    COUNT(*) FILTER (WHERE use_alert = true) as alert_codes,
    COUNT(DISTINCT procedure_code) as unique_procedure_codes
FROM inventory_codes;

-- Display summary by category
SELECT 
    CASE 
        WHEN code LIKE 'INV001%' OR code LIKE 'INV002%' OR code LIKE 'INV003%' OR code LIKE 'INV004%' OR code LIKE 'INV005%' OR code LIKE 'INV006%' OR code LIKE 'INV007%' OR code LIKE 'INV008%' OR code LIKE 'INV009%' OR code LIKE 'INV010%' THEN 'Medical Supplies'
        WHEN code LIKE 'INV011%' OR code LIKE 'INV012%' OR code LIKE 'INV013%' OR code LIKE 'INV014%' OR code LIKE 'INV015%' OR code LIKE 'INV016%' OR code LIKE 'INV017%' OR code LIKE 'INV018%' OR code LIKE 'INV019%' OR code LIKE 'INV020%' THEN 'DME'
        WHEN code LIKE 'INV021%' OR code LIKE 'INV022%' OR code LIKE 'INV023%' OR code LIKE 'INV024%' OR code LIKE 'INV025%' OR code LIKE 'INV026%' OR code LIKE 'INV027%' OR code LIKE 'INV028%' OR code LIKE 'INV029%' OR code LIKE 'INV030%' THEN 'Lab Supplies'
        WHEN code LIKE 'INV031%' OR code LIKE 'INV032%' OR code LIKE 'INV033%' OR code LIKE 'INV034%' OR code LIKE 'INV035%' OR code LIKE 'INV036%' OR code LIKE 'INV037%' OR code LIKE 'INV038%' OR code LIKE 'INV039%' OR code LIKE 'INV040%' THEN 'Surgical Supplies'
        WHEN code LIKE 'INV041%' OR code LIKE 'INV042%' OR code LIKE 'INV043%' OR code LIKE 'INV044%' OR code LIKE 'INV045%' OR code LIKE 'INV046%' OR code LIKE 'INV047%' OR code LIKE 'INV048%' OR code LIKE 'INV049%' OR code LIKE 'INV050%' THEN 'Wound Care'
        WHEN code LIKE 'INV051%' OR code LIKE 'INV052%' OR code LIKE 'INV053%' OR code LIKE 'INV054%' OR code LIKE 'INV055%' OR code LIKE 'INV056%' OR code LIKE 'INV057%' OR code LIKE 'INV058%' OR code LIKE 'INV059%' OR code LIKE 'INV060%' THEN 'Orthopedic'
        WHEN code LIKE 'INV061%' OR code LIKE 'INV062%' OR code LIKE 'INV063%' OR code LIKE 'INV064%' OR code LIKE 'INV065%' OR code LIKE 'INV066%' OR code LIKE 'INV067%' OR code LIKE 'INV068%' OR code LIKE 'INV069%' OR code LIKE 'INV070%' THEN 'Respiratory'
        WHEN code LIKE 'INV071%' OR code LIKE 'INV072%' OR code LIKE 'INV073%' OR code LIKE 'INV074%' OR code LIKE 'INV075%' OR code LIKE 'INV076%' OR code LIKE 'INV077%' OR code LIKE 'INV078%' OR code LIKE 'INV079%' OR code LIKE 'INV080%' THEN 'Urological'
        WHEN code LIKE 'INV081%' OR code LIKE 'INV082%' OR code LIKE 'INV083%' OR code LIKE 'INV084%' OR code LIKE 'INV085%' OR code LIKE 'INV086%' OR code LIKE 'INV087%' OR code LIKE 'INV088%' OR code LIKE 'INV089%' OR code LIKE 'INV090%' THEN 'Ostomy'
        WHEN code LIKE 'INV091%' OR code LIKE 'INV092%' OR code LIKE 'INV093%' OR code LIKE 'INV094%' OR code LIKE 'INV095%' OR code LIKE 'INV096%' OR code LIKE 'INV097%' OR code LIKE 'INV098%' OR code LIKE 'INV099%' OR code LIKE 'INV100%' THEN 'Diabetic'
        WHEN code LIKE 'INV101%' OR code LIKE 'INV102%' OR code LIKE 'INV103%' OR code LIKE 'INV104%' OR code LIKE 'INV105%' OR code LIKE 'INV106%' OR code LIKE 'INV107%' OR code LIKE 'INV108%' OR code LIKE 'INV109%' OR code LIKE 'INV110%' THEN 'Diagnostic'
        WHEN code LIKE 'INV111%' OR code LIKE 'INV112%' OR code LIKE 'INV113%' OR code LIKE 'INV114%' OR code LIKE 'INV115%' OR code LIKE 'INV116%' OR code LIKE 'INV117%' OR code LIKE 'INV118%' OR code LIKE 'INV119%' OR code LIKE 'INV120%' THEN 'General Medical'
        WHEN code LIKE 'INV121%' OR code LIKE 'INV122%' OR code LIKE 'INV123%' OR code LIKE 'INV124%' OR code LIKE 'INV125%' OR code LIKE 'INV126%' OR code LIKE 'INV127%' OR code LIKE 'INV128%' OR code LIKE 'INV129%' OR code LIKE 'INV130%' THEN 'Infusion'
        WHEN code LIKE 'INV131%' OR code LIKE 'INV132%' OR code LIKE 'INV133%' OR code LIKE 'INV134%' OR code LIKE 'INV135%' OR code LIKE 'INV136%' OR code LIKE 'INV137%' OR code LIKE 'INV138%' OR code LIKE 'INV139%' OR code LIKE 'INV140%' THEN 'ENT'
        WHEN code LIKE 'INV141%' OR code LIKE 'INV142%' OR code LIKE 'INV143%' OR code LIKE 'INV144%' OR code LIKE 'INV145%' OR code LIKE 'INV146%' OR code LIKE 'INV147%' OR code LIKE 'INV148%' OR code LIKE 'INV149%' OR code LIKE 'INV150%' THEN 'Cardiac'
        ELSE 'Other'
    END as category,
    COUNT(*) as count
FROM inventory_codes
GROUP BY category
ORDER BY category;

-- Display sample of inserted codes
SELECT 
    code,
    procedure_code,
    quantity,
    code_description,
    use_alert,
    status
FROM inventory_codes
ORDER BY code
LIMIT 30;

SELECT '✅ Inventory codes seed data inserted successfully! Total: 150 codes' AS status;
