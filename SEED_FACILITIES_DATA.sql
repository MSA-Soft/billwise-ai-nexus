-- ============================================================================
-- SEED DATA FOR FACILITIES TABLE
-- ============================================================================
-- This file contains sample facility data for testing and development
-- Run this in Supabase SQL Editor after creating the facilities table
-- ============================================================================

-- Insert sample facilities
-- Note: user_id is set to NULL since these are sample facilities not tied to specific users
INSERT INTO facilities (
    user_id,
    name,
    facility_name,
    npi,
    taxonomy_specialty,
    sequence_number,
    reference_number,
    address_line1,
    address_line2,
    city,
    state,
    zip_code,
    phone,
    fax,
    email,
    tax_id,
    clia_id,
    location_provider_id,
    site_id,
    blue_cross_id,
    blue_shield_id,
    medicare_id,
    medicaid_id,
    locator_code,
    place_of_service,
    status,
    is_active
) VALUES
-- Facility 1: Main Office
(
    NULL, -- user_id (not tied to auth user)
    'Main Street Medical Center',
    'Main Street Medical Center',
    '1234567890',
    'General Practice',
    'NEW',
    'REF001',
    '123 Main Street',
    NULL, -- address_line2
    'Chicago',
    'IL',
    '60601',
    '(312) 555-0100',
    '(312) 555-0101',
    'info@mainstreetmedical.com',
    '12-3456789',
    'CLIA12345',
    'LOC001',
    'SITE001',
    'BC123456',
    'BS123456',
    'MC123456',
    'MD123456',
    'LOC001',
    'Office',
    'active',
    true
),

-- Facility 2: Downtown Clinic
(
    NULL, -- user_id
    'Downtown Clinic',
    'Downtown Clinic',
    '2345678901',
    'Multi-Specialty',
    'NEW',
    'REF002',
    '456 Downtown Avenue',
    NULL,
    'Chicago',
    'IL',
    '60602',
    '(312) 555-0200',
    '(312) 555-0201',
    'contact@downtownclinic.com',
    '23-4567890',
    'CLIA23456',
    'LOC002',
    'SITE002',
    'BC234567',
    'BS234567',
    'MC234567',
    'MD234567',
    'LOC002',
    'Office',
    'active',
    true
),

-- Facility 3: North Branch
(
    NULL, -- user_id
    'North Branch Medical',
    'North Branch Medical',
    '3456789012',
    'Family Medicine',
    'NEW',
    'REF003',
    '789 North Boulevard',
    NULL,
    'Chicago',
    'IL',
    '60614',
    '(312) 555-0300',
    '(312) 555-0301',
    'info@northbranch.com',
    '34-5678901',
    'CLIA34567',
    'LOC003',
    'SITE003',
    'BC345678',
    'BS345678',
    'MC345678',
    'MD345678',
    'LOC003',
    'Office',
    'active',
    true
),

-- Facility 4: Urgent Care Center
(
    NULL, -- user_id
    'QuickCare Urgent Care',
    'QuickCare Urgent Care',
    '4567890123',
    'Urgent Care',
    'NEW',
    'REF004',
    '222 Commerce Street',
    NULL,
    'Phoenix',
    'AZ',
    '85001',
    '(602) 555-0400',
    '(602) 555-0401',
    'info@quickcareurgent.com',
    '45-6789012',
    'CLIA45678',
    'LOC004',
    'SITE004',
    'BC456789',
    'BS456789',
    'MC456789',
    'MD456789',
    'LOC004',
    'Urgent Care',
    'active',
    true
),

-- Facility 5: Hospital
(
    NULL, -- user_id
    'City Hospital Main Campus',
    'City Hospital Main Campus',
    '5678901234',
    'General Hospital',
    'NEW',
    'REF005',
    '777 Hospital Drive',
    NULL,
    'Miami',
    'FL',
    '33101',
    '(305) 555-0500',
    '(305) 555-0501',
    'info@cityhospital.com',
    '56-7890123',
    'CLIA56789',
    'LOC005',
    'SITE005',
    'BC567890',
    'BS567890',
    'MC567890',
    'MD567890',
    'LOC005',
    'Hospital',
    'active',
    true
),

-- Facility 6: Ambulatory Surgery Center
(
    NULL, -- user_id
    'Surgical Center of Excellence',
    'Surgical Center of Excellence',
    '6789012345',
    'Ambulatory Surgery',
    'NEW',
    'REF006',
    '888 Medical Plaza',
    NULL,
    'Houston',
    'TX',
    '77001',
    '(713) 555-0600',
    '(713) 555-0601',
    'info@surgicalcenter.com',
    '67-8901234',
    'CLIA67890',
    'LOC006',
    'SITE006',
    'BC678901',
    'BS678901',
    'MC678901',
    'MD678901',
    'LOC006',
    'Ambulatory Surgical Center',
    'active',
    true
),

-- Facility 7: Skilled Nursing Facility
(
    NULL, -- user_id
    'Sunset Nursing Home',
    'Sunset Nursing Home',
    '7890123456',
    'Skilled Nursing',
    'NEW',
    'REF007',
    '999 Care Avenue',
    NULL,
    'Seattle',
    'WA',
    '98101',
    '(206) 555-0700',
    '(206) 555-0701',
    'info@sunsetnursing.com',
    '78-9012345',
    'CLIA78901',
    'LOC007',
    'SITE007',
    'BC789012',
    'BS789012',
    'MC789012',
    'MD789012',
    'LOC007',
    'Skilled Nursing Facility',
    'active',
    true
),

-- Facility 8: Home Health
(
    NULL, -- user_id
    'Home Health Services',
    'Home Health Services',
    '8901234567',
    'Home Health',
    'NEW',
    'REF008',
    '111 Service Road',
    NULL,
    'Boston',
    'MA',
    '02101',
    '(617) 555-0800',
    '(617) 555-0801',
    'info@homehealth.com',
    '89-0123456',
    'CLIA89012',
    'LOC008',
    'SITE008',
    'BC890123',
    'BS890123',
    'MC890123',
    'MD890123',
    'LOC008',
    'Home',
    'active',
    true
),

-- Facility 9: Inactive Facility (for testing)
(
    NULL, -- user_id
    'Closed Medical Office',
    'Closed Medical Office',
    '9012345678',
    'General Practice',
    'NEW',
    'REF009',
    '222 Old Street',
    NULL,
    'Detroit',
    'MI',
    '48201',
    '(313) 555-0900',
    NULL,
    'closed@example.com',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Office',
    'inactive',
    false
);

-- Verify the insert
SELECT 
    COUNT(*) as total_facilities,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_facilities,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_facilities
FROM facilities;

-- Display all inserted facilities
SELECT 
    name,
    npi,
    taxonomy_specialty,
    city,
    state,
    status,
    place_of_service,
    created_at
FROM facilities
ORDER BY created_at DESC;

