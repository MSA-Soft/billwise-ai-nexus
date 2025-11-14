-- ============================================================================
-- SEED DATA: Patients with Muslim Names (CORRECTED for your table structure)
-- ============================================================================
-- This matches your actual patients table structure
-- ============================================================================

-- Insert Seed Data with Muslim Names
INSERT INTO patients (
    patient_id,
    first_name,
    last_name,
    middle_initial,
    date_of_birth,
    gender,
    phone_primary,
    email,
    address_line1,
    city,
    state,
    zip_code,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship,
    user_id,
    status,
    created_at
) VALUES
-- Patient 1
(
    'PAT-001',
    'Ahmed',
    'Ali',
    'H',
    '1985-03-15',
    'M',
    '555-0101',
    'ahmed.ali@example.com',
    '123 Main Street',
    'Springfield',
    'IL',
    '62701',
    'Fatima Ali',
    '555-0102',
    'Spouse',
    (SELECT id FROM auth.users LIMIT 1), -- Use first user or replace with specific UUID
    'active',
    NOW()
),
-- Patient 2
(
    'PAT-002',
    'Fatima',
    'Khan',
    'A',
    '1990-07-22',
    'F',
    '555-0201',
    'fatima.khan@example.com',
    '456 Oak Avenue',
    'Chicago',
    'IL',
    '60601',
    'Mohammed Khan',
    '555-0202',
    'Brother',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
),
-- Patient 3
(
    'PAT-003',
    'Mohammed',
    'Rahman',
    'I',
    '1988-11-10',
    'M',
    '555-0301',
    'mohammed.rahman@example.com',
    '789 Pine Road',
    'Peoria',
    'IL',
    '61601',
    'Aisha Rahman',
    '555-0302',
    'Sister',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
),
-- Patient 4
(
    'PAT-004',
    'Aisha',
    'Hassan',
    'Z',
    '1992-05-18',
    'F',
    '555-0401',
    'aisha.hassan@example.com',
    '321 Elm Street',
    'Rockford',
    'IL',
    '61101',
    'Omar Hassan',
    '555-0402',
    'Father',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
),
-- Patient 5
(
    'PAT-005',
    'Omar',
    'Malik',
    'Y',
    '1983-09-25',
    'M',
    '555-0501',
    'omar.malik@example.com',
    '654 Maple Drive',
    'Naperville',
    'IL',
    '60540',
    'Khadija Malik',
    '555-0502',
    'Wife',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
),
-- Patient 6
(
    'PAT-006',
    'Khadija',
    'Ahmed',
    'M',
    '1995-01-30',
    'F',
    '555-0601',
    'khadija.ahmed@example.com',
    '987 Cedar Lane',
    'Aurora',
    'IL',
    '60502',
    'Hassan Ahmed',
    '555-0602',
    'Husband',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
),
-- Patient 7
(
    'PAT-007',
    'Ibrahim',
    'Syed',
    'A',
    '1987-12-05',
    'M',
    '555-0701',
    'ibrahim.syed@example.com',
    '147 Birch Court',
    'Joliet',
    'IL',
    '60435',
    'Safiya Syed',
    '555-0702',
    'Mother',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
),
-- Patient 8
(
    'PAT-008',
    'Safiya',
    'Hussain',
    'R',
    '1993-04-12',
    'F',
    '555-0801',
    'safiya.hussain@example.com',
    '258 Willow Way',
    'Elgin',
    'IL',
    '60120',
    'Ali Hussain',
    '555-0802',
    'Brother',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
),
-- Patient 9
(
    'PAT-009',
    'Yusuf',
    'Abbas',
    'H',
    '1986-08-20',
    'M',
    '555-0901',
    'yusuf.abbas@example.com',
    '369 Spruce Street',
    'Schaumburg',
    'IL',
    '60193',
    'Zainab Abbas',
    '555-0902',
    'Sister',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
),
-- Patient 10
(
    'PAT-010',
    'Zainab',
    'Iqbal',
    'A',
    '1991-06-14',
    'F',
    '555-1001',
    'zainab.iqbal@example.com',
    '741 Ash Boulevard',
    'Waukegan',
    'IL',
    '60085',
    'Bilal Iqbal',
    '555-1002',
    'Cousin',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
),
-- Patient 11
(
    'PAT-011',
    'Bilal',
    'Shah',
    'T',
    '1984-02-28',
    'M',
    '555-1101',
    'bilal.shah@example.com',
    '852 Poplar Avenue',
    'Cicero',
    'IL',
    '60804',
    'Hafsa Shah',
    '555-1102',
    'Wife',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
),
-- Patient 12
(
    'PAT-012',
    'Hafsa',
    'Butt',
    'S',
    '1989-10-08',
    'F',
    '555-1201',
    'hafsa.butt@example.com',
    '963 Hickory Drive',
    'Bloomington',
    'IL',
    '61701',
    'Usman Butt',
    '555-1202',
    'Husband',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
),
-- Patient 13
(
    'PAT-013',
    'Usman',
    'Sheikh',
    'K',
    '1982-07-03',
    'M',
    '555-1301',
    'usman.sheikh@example.com',
    '159 Walnut Street',
    'Champaign',
    'IL',
    '61820',
    'Layla Sheikh',
    '555-1302',
    'Daughter',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
),
-- Patient 14
(
    'PAT-014',
    'Layla',
    'Mirza',
    'N',
    '1994-03-19',
    'F',
    '555-1401',
    'layla.mirza@example.com',
    '357 Cherry Lane',
    'Decatur',
    'IL',
    '62521',
    'Jamil Mirza',
    '555-1402',
    'Brother',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
),
-- Patient 15
(
    'PAT-015',
    'Jamil',
    'Ansari',
    'R',
    '1981-11-26',
    'M',
    '555-1501',
    'jamil.ansari@example.com',
    '468 Sycamore Road',
    'Arlington Heights',
    'IL',
    '60004',
    'Nadia Ansari',
    '555-1502',
    'Sister',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    NOW()
)
ON CONFLICT (patient_id) DO NOTHING;

-- Verify the insert
SELECT 
    patient_id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    phone_primary,
    email,
    city,
    state,
    status,
    created_at
FROM patients
WHERE patient_id LIKE 'PAT-%'
ORDER BY created_at DESC;

-- Count total patients
SELECT COUNT(*) as total_patients FROM patients;

-- Show success message
SELECT '✅ Successfully inserted 15 patients with Muslim names!' AS status;



