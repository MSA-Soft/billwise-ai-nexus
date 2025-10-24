-- Comprehensive Dummy Data for BillWise AI Nexus
-- This file contains realistic dummy data for all forms and components

-- =============================================
-- 1. USERS TABLE
-- =============================================

-- =============================================
-- 2. BILLING STATEMENTS
-- =============================================
INSERT INTO billing_statements (id, patient_id, patient_name, amount_due, status, due_date, created_at, updated_at, paid_at) VALUES
(gen_random_uuid(), 'PAT-001', 'Ahmed Hassan Al-Rashid', 1250.00, 'current', '2024-02-15', '2024-01-15', NOW(), NULL),
(gen_random_uuid(), 'PAT-002', 'Fatima Zahra Khan', 850.50, 'overdue', '2024-01-20', '2024-01-10', NOW(), NULL),
(gen_random_uuid(), 'PAT-003', 'Muhammad Ali Sheikh', 2100.75, 'current', '2024-02-28', '2024-01-28', NOW(), NULL),
(gen_random_uuid(), 'PAT-004', 'Aisha Rahman', 675.25, 'paid', '2024-01-10', '2024-01-05', NOW(), '2024-01-08'),
(gen_random_uuid(), 'PAT-005', 'Omar Abdullah', 3200.00, 'overdue', '2024-01-05', '2023-12-20', NOW(), NULL),
(gen_random_uuid(), 'PAT-006', 'Khadija Ibrahim', 1450.80, 'current', '2024-02-20', '2024-01-20', NOW(), NULL),
(gen_random_uuid(), 'PAT-007', 'Yusuf Hassan', 980.40, 'current', '2024-02-10', '2024-01-10', NOW(), NULL),
(gen_random_uuid(), 'PAT-008', 'Zainab Ali', 2750.60, 'overdue', '2024-01-15', '2024-01-01', NOW(), NULL),
(gen_random_uuid(), 'PAT-009', 'Abdul Rahman', 1200.00, 'paid', '2024-01-25', '2024-01-15', NOW(), '2024-01-22'),
(gen_random_uuid(), 'PAT-010', 'Maryam Ahmed', 1890.30, 'current', '2024-02-25', '2024-01-25', NOW(), NULL);

-- =============================================
-- 3. COLLECTIONS ACCOUNTS
-- =============================================
INSERT INTO collections_accounts (id, patient_name, patient_id, patient_email, patient_phone, original_balance, current_balance, days_overdue, collection_stage, collection_status, last_contact_date, next_action_date, notes, created_at) VALUES
(gen_random_uuid(), 'Ahmed Hassan Al-Rashid', 'PAT-001', 'ahmed.hassan@email.com', '(555) 123-4567', 1250.00, 1250.00, 45, 'Initial Contact', 'Active', '2024-01-15', '2024-02-01', 'Patient responsive, discussing payment plan', NOW()),
(gen_random_uuid(), 'Fatima Zahra Khan', 'PAT-002', 'fatima.khan@email.com', '(555) 234-5678', 850.50, 850.50, 60, 'Follow-up', 'Active', '2024-01-20', '2024-02-05', 'Multiple contact attempts, no response', NOW()),
(gen_random_uuid(), 'Muhammad Ali Sheikh', 'PAT-003', 'muhammad.sheikh@email.com', '(555) 345-6789', 2100.75, 2100.75, 30, 'Payment Arrangement', 'Active', '2024-01-25', '2024-02-10', 'Agreed to monthly payments of $200', NOW()),
(gen_random_uuid(), 'Aisha Rahman', 'PAT-004', 'aisha.rahman@email.com', '(555) 456-7890', 675.25, 0.00, 0, 'Paid', 'Closed', '2024-01-08', NULL, 'Account paid in full', NOW()),
(gen_random_uuid(), 'Omar Abdullah', 'PAT-005', 'omar.abdullah@email.com', '(555) 567-8901', 3200.00, 3200.00, 75, 'Final Notice', 'Active', '2024-01-30', '2024-02-15', 'Final notice sent, considering legal action', NOW()),
(gen_random_uuid(), 'Khadija Ibrahim', 'PAT-006', 'khadija.ibrahim@email.com', '(555) 678-9012', 1450.80, 1450.80, 25, 'Initial Contact', 'Active', '2024-01-28', '2024-02-12', 'New account, first contact made', NOW()),
(gen_random_uuid(), 'Yusuf Hassan', 'PAT-007', 'yusuf.hassan@email.com', '(555) 789-0123', 980.40, 980.40, 40, 'Follow-up', 'Active', '2024-01-22', '2024-02-07', 'Patient requested payment plan details', NOW()),
(gen_random_uuid(), 'Zainab Ali', 'PAT-008', 'zainab.ali@email.com', '(555) 890-1234', 2750.60, 2750.60, 55, 'Payment Arrangement', 'Active', '2024-01-18', '2024-02-03', 'Payment plan established, monitoring compliance', NOW()),
(gen_random_uuid(), 'Abdul Rahman', 'PAT-009', 'abdul.rahman@email.com', '(555) 901-2345', 1200.00, 0.00, 0, 'Paid', 'Closed', '2024-01-22', NULL, 'Account settled with payment plan', NOW()),
(gen_random_uuid(), 'Maryam Ahmed', 'PAT-010', 'maryam.ahmed@email.com', '(555) 012-3456', 1890.30, 1890.30, 35, 'Initial Contact', 'Active', '2024-01-26', '2024-02-11', 'Initial contact made, awaiting response', NOW());

-- =============================================
-- 4. COLLECTION ACTIVITIES
-- =============================================
INSERT INTO collection_activities (id, collection_account_id, activity_type, contact_method, notes, outcome, amount_discussed, promise_to_pay_date, performed_by, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM collections_accounts LIMIT 1 OFFSET 0), 'Phone Call', 'Phone', 'Initial contact made, patient was responsive', 'Positive', 1250.00, '2024-02-15', 'John Smith', NOW()),
(gen_random_uuid(), (SELECT id FROM collections_accounts LIMIT 1 OFFSET 1), 'Email', 'Email', 'Sent payment reminder via email', 'No Response', NULL, NULL, 'Sarah Johnson', NOW()),
(gen_random_uuid(), (SELECT id FROM collections_accounts LIMIT 1 OFFSET 2), 'Phone Call', 'Phone', 'Discussed payment plan options', 'Payment Plan Agreed', 200.00, '2024-02-10', 'Mike Wilson', NOW()),
(gen_random_uuid(), (SELECT id FROM collections_accounts LIMIT 1 OFFSET 3), 'Payment Received', 'Online', 'Payment received through online portal', 'Payment Received', 675.25, NULL, 'System', NOW()),
(gen_random_uuid(), (SELECT id FROM collections_accounts LIMIT 1 OFFSET 4), 'Final Notice', 'Mail', 'Final notice sent via certified mail', 'No Response', NULL, NULL, 'Legal Team', NOW()),
(gen_random_uuid(), (SELECT id FROM collections_accounts LIMIT 1 OFFSET 5), 'Phone Call', 'Phone', 'First contact attempt, left voicemail', 'No Response', NULL, NULL, 'Lisa Brown', NOW()),
(gen_random_uuid(), (SELECT id FROM collections_accounts LIMIT 1 OFFSET 6), 'Email', 'Email', 'Sent payment plan proposal', 'Under Review', 150.00, '2024-02-07', 'Tom Davis', NOW()),
(gen_random_uuid(), (SELECT id FROM collections_accounts LIMIT 1 OFFSET 7), 'Phone Call', 'Phone', 'Confirmed payment plan details', 'Payment Plan Confirmed', 300.00, '2024-02-03', 'Anna Garcia', NOW()),
(gen_random_uuid(), (SELECT id FROM collections_accounts LIMIT 1 OFFSET 8), 'Payment Received', 'Check', 'Final payment received via check', 'Payment Received', 1200.00, NULL, 'System', NOW()),
(gen_random_uuid(), (SELECT id FROM collections_accounts LIMIT 1 OFFSET 9), 'Phone Call', 'Phone', 'Initial contact, patient requested callback', 'Callback Scheduled', NULL, NULL, 'David Lee', NOW());

-- =============================================
-- 5. AUTHORIZATION REQUESTS
-- =============================================
INSERT INTO authorization_requests (id, patient_name, patient_id, provider_name, service_type, procedure_code, diagnosis_code, requested_date, status, insurance_company, policy_number, group_number, prior_auth_number, notes, created_at, updated_at) VALUES
('AUTH-001', 'Ahmed Hassan Al-Rashid', 'PAT-001', 'Dr. Sarah Johnson', 'Surgery', 'CPT-12345', 'ICD-10-K59.00', '2024-02-01', 'Approved', 'Blue Cross Blue Shield', 'POL-001', 'GRP-001', 'PA-001', 'Appendectomy procedure approved', NOW(), NOW()),
('AUTH-002', 'Fatima Zahra Khan', 'PAT-002', 'Dr. Michael Chen', 'Imaging', 'CPT-23456', 'ICD-10-M79.3', '2024-02-02', 'Pending', 'Aetna', 'POL-002', 'GRP-002', 'PA-002', 'MRI scan for back pain', NOW(), NOW()),
('AUTH-003', 'Muhammad Ali Sheikh', 'PAT-003', 'Dr. Emily Rodriguez', 'Specialist', 'CPT-34567', 'ICD-10-E11.9', '2024-02-03', 'Denied', 'Cigna', 'POL-003', 'GRP-003', 'PA-003', 'Endocrinology consultation denied', NOW(), NOW()),
('AUTH-004', 'Aisha Rahman', 'PAT-004', 'Dr. James Wilson', 'Surgery', 'CPT-45678', 'ICD-10-N80.1', '2024-02-04', 'Approved', 'UnitedHealth', 'POL-004', 'GRP-004', 'PA-004', 'Laparoscopic procedure approved', NOW(), NOW()),
('AUTH-005', 'Omar Abdullah', 'PAT-005', 'Dr. Lisa Thompson', 'Therapy', 'CPT-56789', 'ICD-10-F32.9', '2024-02-05', 'Pending', 'Humana', 'POL-005', 'GRP-005', 'PA-005', 'Physical therapy sessions', NOW(), NOW()),
('AUTH-006', 'Khadija Ibrahim', 'PAT-006', 'Dr. Robert Brown', 'Imaging', 'CPT-67890', 'ICD-10-R50.9', '2024-02-06', 'Approved', 'Medicare', 'POL-006', 'GRP-006', 'PA-006', 'CT scan approved', NOW(), NOW()),
('AUTH-007', 'Yusuf Hassan', 'PAT-007', 'Dr. Jennifer Davis', 'Specialist', 'CPT-78901', 'ICD-10-I25.10', '2024-02-07', 'Pending', 'Kaiser Permanente', 'POL-007', 'GRP-007', 'PA-007', 'Cardiology consultation', NOW(), NOW()),
('AUTH-008', 'Zainab Ali', 'PAT-008', 'Dr. Christopher Lee', 'Surgery', 'CPT-89012', 'ICD-10-K35.9', '2024-02-08', 'Approved', 'Anthem', 'POL-008', 'GRP-008', 'PA-008', 'Emergency appendectomy approved', NOW(), NOW()),
('AUTH-009', 'Abdul Rahman', 'PAT-009', 'Dr. Maria Garcia', 'Therapy', 'CPT-90123', 'ICD-10-M25.561', '2024-02-09', 'Denied', 'BCBS', 'POL-009', 'GRP-009', 'PA-009', 'Occupational therapy denied', NOW(), NOW()),
('AUTH-010', 'Maryam Ahmed', 'PAT-010', 'Dr. David Kim', 'Imaging', 'CPT-01234', 'ICD-10-R93.5', '2024-02-10', 'Approved', 'Aetna', 'POL-010', 'GRP-010', 'PA-010', 'Ultrasound approved', NOW(), NOW());

-- =============================================
-- 6. BILLING CLAIMS
-- =============================================
INSERT INTO billing_claims (id, patient_name, patient_id, claim_number, service_date, procedure_code, diagnosis_code, amount_billed, amount_paid, status, insurance_company, provider_name, created_at, updated_at) VALUES
('CLM-001', 'Ahmed Hassan Al-Rashid', 'PAT-001', 'CLM-001', '2024-01-15', 'CPT-12345', 'ICD-10-K59.00', 2500.00, 2000.00, 'Partially Paid', 'Blue Cross Blue Shield', 'Dr. Sarah Johnson', NOW(), NOW()),
('CLM-002', 'Fatima Zahra Khan', 'PAT-002', 'CLM-002', '2024-01-20', 'CPT-23456', 'ICD-10-M79.3', 1200.00, 0.00, 'Pending', 'Aetna', 'Dr. Michael Chen', NOW(), NOW()),
('CLM-003', 'Muhammad Ali Sheikh', 'PAT-003', 'CLM-003', '2024-01-25', 'CPT-34567', 'ICD-10-E11.9', 800.00, 0.00, 'Denied', 'Cigna', 'Dr. Emily Rodriguez', NOW(), NOW()),
('CLM-004', 'Aisha Rahman', 'PAT-004', 'CLM-004', '2024-01-30', 'CPT-45678', 'ICD-10-N80.1', 3200.00, 3200.00, 'Paid', 'UnitedHealth', 'Dr. James Wilson', NOW(), NOW()),
('CLM-005', 'Omar Abdullah', 'PAT-005', 'CLM-005', '2024-02-01', 'CPT-56789', 'ICD-10-F32.9', 1500.00, 0.00, 'Pending', 'Humana', 'Dr. Lisa Thompson', NOW(), NOW()),
('CLM-006', 'Khadija Ibrahim', 'PAT-006', 'CLM-006', '2024-02-05', 'CPT-67890', 'ICD-10-R50.9', 900.00, 720.00, 'Partially Paid', 'Medicare', 'Dr. Robert Brown', NOW(), NOW()),
('CLM-007', 'Yusuf Hassan', 'PAT-007', 'CLM-007', '2024-02-08', 'CPT-78901', 'ICD-10-I25.10', 1800.00, 0.00, 'Pending', 'Kaiser Permanente', 'Dr. Jennifer Davis', NOW(), NOW()),
('CLM-008', 'Zainab Ali', 'PAT-008', 'CLM-008', '2024-02-10', 'CPT-89012', 'ICD-10-K35.9', 4500.00, 0.00, 'Pending', 'Anthem', 'Dr. Christopher Lee', NOW(), NOW()),
('CLM-009', 'Abdul Rahman', 'PAT-009', 'CLM-009', '2024-02-12', 'CPT-90123', 'ICD-10-M25.561', 1100.00, 0.00, 'Denied', 'BCBS', 'Dr. Maria Garcia', NOW(), NOW()),
('CLM-010', 'Maryam Ahmed', 'PAT-010', 'CLM-010', '2024-02-15', 'CPT-01234', 'ICD-10-R93.5', 750.00, 600.00, 'Partially Paid', 'Aetna', 'Dr. David Kim', NOW(), NOW());

-- =============================================
-- 7. DENIAL MANAGEMENT
-- =============================================
INSERT INTO denied_claims (id, patient_name, claim_id, denial_code, denial_reason, denial_date, amount_denied, status, appeal_deadline, created_at, updated_at) VALUES
('DEN-001', 'Muhammad Ali Sheikh', 'CLM-003', 'CO-50', 'Service not covered under plan', '2024-01-30', 800.00, 'Open', '2024-03-01', NOW(), NOW()),
('DEN-002', 'Abdul Rahman', 'CLM-009', 'CO-97', 'Prior authorization required', '2024-02-15', 1100.00, 'Appeal Filed', '2024-04-15', NOW(), NOW()),
('DEN-003', 'Ahmed Hassan Al-Rashid', 'CLM-001', 'CO-45', 'Charges exceed fee schedule', '2024-01-20', 500.00, 'Resolved', '2024-03-20', NOW(), NOW()),
('DEN-004', 'Fatima Zahra Khan', 'CLM-002', 'CO-96', 'Non-covered service', '2024-01-25', 1200.00, 'Open', '2024-03-25', NOW(), NOW()),
('DEN-005', 'Omar Abdullah', 'CLM-005', 'CO-49', 'Coverage terminated', '2024-02-05', 1500.00, 'Appeal Filed', '2024-04-05', NOW(), NOW()),
('DEN-006', 'Khadija Ibrahim', 'CLM-006', 'CO-51', 'Duplicate claim', '2024-02-08', 180.00, 'Resolved', '2024-04-08', NOW(), NOW()),
('DEN-007', 'Yusuf Hassan', 'CLM-007', 'CO-52', 'Claim not covered', '2024-02-12', 1800.00, 'Open', '2024-04-12', NOW(), NOW()),
('DEN-008', 'Zainab Ali', 'CLM-008', 'CO-53', 'Service not authorized', '2024-02-15', 4500.00, 'Appeal Filed', '2024-04-15', NOW(), NOW()),
('DEN-009', 'Maryam Ahmed', 'CLM-010', 'CO-54', 'Benefit maximum reached', '2024-02-18', 150.00, 'Resolved', '2024-04-18', NOW(), NOW()),
('DEN-010', 'Aisha Rahman', 'CLM-004', 'CO-55', 'Pre-existing condition', '2024-02-01', 3200.00, 'Open', '2024-04-01', NOW(), NOW());

-- =============================================
-- 8. PAYMENT PLANS
-- =============================================
INSERT INTO payment_plans (id, patient_name, patient_id, total_amount, monthly_payment, remaining_balance, start_date, end_date, status, created_at, updated_at) VALUES
('PP-001', 'Ahmed Hassan Al-Rashid', 'PAT-001', 1250.00, 125.00, 1000.00, '2024-01-15', '2024-09-15', 'Active', NOW(), NOW()),
('PP-002', 'Fatima Zahra Khan', 'PAT-002', 850.50, 85.05, 765.45, '2024-01-20', '2024-10-20', 'Active', NOW(), NOW()),
('PP-003', 'Muhammad Ali Sheikh', 'PAT-003', 2100.75, 210.08, 1890.67, '2024-01-25', '2024-11-25', 'Active', NOW(), NOW()),
('PP-004', 'Aisha Rahman', 'PAT-004', 675.25, 67.53, 0.00, '2024-01-10', '2024-10-10', 'Completed', NOW(), NOW()),
('PP-005', 'Omar Abdullah', 'PAT-005', 3200.00, 320.00, 2880.00, '2024-01-05', '2024-12-05', 'Active', NOW(), NOW()),
('PP-006', 'Khadija Ibrahim', 'PAT-006', 1450.80, 145.08, 1305.72, '2024-01-28', '2024-10-28', 'Active', NOW(), NOW()),
('PP-007', 'Yusuf Hassan', 'PAT-007', 980.40, 98.04, 882.36, '2024-01-22', '2024-10-22', 'Active', NOW(), NOW()),
('PP-008', 'Zainab Ali', 'PAT-008', 2750.60, 275.06, 2475.54, '2024-01-18', '2024-11-18', 'Active', NOW(), NOW()),
('PP-009', 'Abdul Rahman', 'PAT-009', 1200.00, 120.00, 0.00, '2024-01-15', '2024-10-15', 'Completed', NOW(), NOW()),
('PP-010', 'Maryam Ahmed', 'PAT-010', 1890.30, 189.03, 1701.27, '2024-01-26', '2024-10-26', 'Active', NOW(), NOW());

-- =============================================
-- 9. EDI TRANSACTIONS
-- =============================================
INSERT INTO edi_transactions (id, transaction_type, status, patient_id, payer_id, request_payload, response_payload, created_at, updated_at) VALUES
('EDI-001', '270', 'processed', 'PAT-001', 'BCBS', '{"patientId": "PAT-001", "subscriberId": "SUB-001", "payerId": "BCBS"}', '{"eligible": true, "coverage": "active"}', NOW(), NOW()),
('EDI-002', '271', 'processed', 'PAT-002', 'AETNA', '{"patientId": "PAT-002", "subscriberId": "SUB-002", "payerId": "AETNA"}', '{"eligible": true, "coverage": "active", "copay": 25.00}', NOW(), NOW()),
('EDI-003', '276', 'processed', 'PAT-003', 'CIGNA', '{"claimId": "CLM-003", "patientId": "PAT-003"}', '{"status": "pending", "processedDate": "2024-02-01"}', NOW(), NOW()),
('EDI-004', '277', 'processed', 'PAT-004', 'UHC', '{"claimId": "CLM-004", "patientId": "PAT-004"}', '{"status": "paid", "amount": 3200.00, "paymentDate": "2024-02-05"}', NOW(), NOW()),
('EDI-005', '835', 'processed', 'PAT-005', 'HUMANA', '{"claimId": "CLM-005", "patientId": "PAT-005"}', '{"totalPaid": 1500.00, "adjustments": [], "patientResponsibility": 0.00}', NOW(), NOW());

-- =============================================
-- 10. CODE VALIDATION RECORDS
-- =============================================
INSERT INTO code_validation_results (id, code_type, code, description, is_valid, validation_date, payer_id, created_at) VALUES
('CV-001', 'ICD-10', 'K59.00', 'Constipation, unspecified', true, NOW(), 'BCBS', NOW()),
('CV-002', 'ICD-10', 'M79.3', 'Panniculitis, unspecified', true, NOW(), 'AETNA', NOW()),
('CV-003', 'ICD-10', 'E11.9', 'Type 2 diabetes mellitus without complications', true, NOW(), 'CIGNA', NOW()),
('CV-004', 'CPT', '99213', 'Office visit, established patient', true, NOW(), 'UHC', NOW()),
('CV-005', 'CPT', '99214', 'Office visit, established patient, detailed', true, NOW(), 'HUMANA', NOW()),
('CV-006', 'HCPCS', 'G0463', 'Hospital outpatient clinic visit', true, NOW(), 'MEDICARE', NOW()),
('CV-007', 'ICD-10', 'R50.9', 'Fever, unspecified', true, NOW(), 'KAISER', NOW()),
('CV-008', 'CPT', '99215', 'Office visit, established patient, comprehensive', true, NOW(), 'ANTHEM', NOW()),
('CV-009', 'ICD-10', 'I25.10', 'Atherosclerotic heart disease of native coronary artery without angina pectoris', true, NOW(), 'BCBS', NOW()),
('CV-010', 'CPT', '99212', 'Office visit, established patient, straightforward', true, NOW(), 'AETNA', NOW());

-- =============================================
-- 11. PAYER RULES
-- =============================================
INSERT INTO payer_rules (id, payer_id, rule_name, rule_type, rule_condition, rule_action, is_active, created_at, updated_at) VALUES
('PR-001', 'BCBS', 'Prior Authorization Required', 'validation', 'procedure_code = "CPT-12345"', 'require_prior_auth', true, NOW(), NOW()),
('PR-002', 'AETNA', 'Copay Validation', 'validation', 'service_type = "specialist"', 'apply_copay_50', true, NOW(), NOW()),
('PR-003', 'CIGNA', 'Coverage Limit', 'validation', 'amount > 1000', 'check_coverage_limit', true, NOW(), NOW()),
('PR-004', 'UHC', 'Network Requirement', 'validation', 'provider_type = "specialist"', 'verify_network', true, NOW(), NOW()),
('PR-005', 'HUMANA', 'Age Restriction', 'validation', 'patient_age < 65', 'check_age_eligibility', true, NOW(), NOW()),
('PR-006', 'MEDICARE', 'Medicare Guidelines', 'validation', 'patient_age >= 65', 'apply_medicare_rules', true, NOW(), NOW()),
('PR-007', 'KAISER', 'Internal Referral', 'validation', 'specialist_visit = true', 'require_internal_referral', true, NOW(), NOW()),
('PR-008', 'ANTHEM', 'Pre-certification', 'validation', 'surgery = true', 'require_precert', true, NOW(), NOW()),
('PR-009', 'BCBS', 'Deductible Check', 'validation', 'annual_services > 0', 'check_deductible', true, NOW(), NOW()),
('PR-010', 'AETNA', 'Formulary Check', 'validation', 'medication = true', 'check_formulary', true, NOW(), NOW());

-- =============================================
-- 12. COMMUNICATION PREFERENCES
-- =============================================
INSERT INTO communication_preferences (id, patient_id, patient_name, email_enabled, sms_enabled, phone_enabled, mail_enabled, preferred_contact_method, language_preference, created_at, updated_at) VALUES
('CP-001', 'PAT-001', 'Ahmed Hassan Al-Rashid', true, true, true, false, 'email', 'en', NOW(), NOW()),
('CP-002', 'PAT-002', 'Fatima Zahra Khan', true, false, true, true, 'phone', 'en', NOW(), NOW()),
('CP-003', 'PAT-003', 'Muhammad Ali Sheikh', false, true, true, false, 'sms', 'en', NOW(), NOW()),
('CP-004', 'PAT-004', 'Aisha Rahman', true, true, false, true, 'email', 'en', NOW(), NOW()),
('CP-005', 'PAT-005', 'Omar Abdullah', true, true, true, true, 'phone', 'en', NOW(), NOW()),
('CP-006', 'PAT-006', 'Khadija Ibrahim', true, false, true, false, 'email', 'en', NOW(), NOW()),
('CP-007', 'PAT-007', 'Yusuf Hassan', false, true, true, true, 'sms', 'en', NOW(), NOW()),
('CP-008', 'PAT-008', 'Zainab Ali', true, true, false, true, 'email', 'en', NOW(), NOW()),
('CP-009', 'PAT-009', 'Abdul Rahman', true, true, true, false, 'phone', 'en', NOW(), NOW()),
('CP-010', 'PAT-010', 'Maryam Ahmed', true, false, true, true, 'email', 'en', NOW(), NOW());

-- =============================================
-- 13. REPORTS AND ANALYTICS
-- =============================================
INSERT INTO report_analytics (id, report_type, report_name, generated_date, data_period, total_claims, total_revenue, denial_rate, collection_rate, created_at) VALUES
('RA-001', 'monthly', 'January 2024 Revenue Report', '2024-02-01', '2024-01-01 to 2024-01-31', 150, 125000.00, 12.5, 87.5, NOW()),
('RA-002', 'weekly', 'Week 5 Collections Report', '2024-02-05', '2024-01-29 to 2024-02-04', 35, 28000.00, 8.2, 91.8, NOW()),
('RA-003', 'daily', 'Daily Claims Status', '2024-02-10', '2024-02-10', 8, 6500.00, 15.0, 85.0, NOW()),
('RA-004', 'quarterly', 'Q1 2024 Financial Summary', '2024-04-01', '2024-01-01 to 2024-03-31', 450, 375000.00, 10.8, 89.2, NOW()),
('RA-005', 'annual', '2023 Year-End Report', '2024-01-01', '2023-01-01 to 2023-12-31', 1800, 1500000.00, 9.5, 90.5, NOW());

-- =============================================
-- 14. NOTIFICATIONS AND ALERTS
-- =============================================
INSERT INTO notifications (id, patient_id, notification_type, title, message, priority, status, created_at, read_at) VALUES
('NOT-001', 'PAT-001', 'payment_reminder', 'Payment Due', 'Your payment of $125.00 is due on 2024-02-15', 'high', 'unread', NOW(), NULL),
('NOT-002', 'PAT-002', 'overdue_notice', 'Account Overdue', 'Your account is 60 days overdue. Please contact us immediately.', 'urgent', 'unread', NOW(), NULL),
('NOT-003', 'PAT-003', 'payment_confirmation', 'Payment Received', 'Thank you for your payment of $210.08', 'low', 'read', NOW(), NOW()),
('NOT-004', 'PAT-004', 'appointment_reminder', 'Appointment Reminder', 'Your appointment is scheduled for tomorrow at 2:00 PM', 'medium', 'unread', NOW(), NULL),
('NOT-005', 'PAT-005', 'insurance_update', 'Insurance Update Required', 'Please provide updated insurance information', 'high', 'unread', NOW(), NULL),
('NOT-006', 'PAT-006', 'payment_plan', 'Payment Plan Established', 'Your payment plan of $145.08/month has been set up', 'low', 'read', NOW(), NOW()),
('NOT-007', 'PAT-007', 'denial_notice', 'Claim Denied', 'Your claim CLM-007 has been denied. Please contact us.', 'high', 'unread', NOW(), NULL),
('NOT-008', 'PAT-008', 'authorization_approved', 'Authorization Approved', 'Your prior authorization has been approved', 'low', 'read', NOW(), NOW()),
('NOT-009', 'PAT-009', 'account_closed', 'Account Closed', 'Your account has been paid in full. Thank you!', 'low', 'read', NOW(), NOW()),
('NOT-010', 'PAT-010', 'follow_up', 'Follow-up Required', 'Please call us to discuss your account', 'medium', 'unread', NOW(), NULL);

-- =============================================
-- 15. AUDIT LOGS
-- =============================================
INSERT INTO audit_logs (id, user_id, action_type, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at) VALUES
('AUD-001', 'dev-user-123', 'INSERT', 'billing_statements', 'BS-001', NULL, '{"patient_name": "Ahmed Hassan Al-Rashid", "amount_due": 1250.00}', '192.168.1.100', 'Mozilla/5.0', NOW()),
('AUD-002', 'dev-user-123', 'UPDATE', 'collections_accounts', 'CA-001', '{"status": "new"}', '{"status": "active"}', '192.168.1.100', 'Mozilla/5.0', NOW()),
('AUD-003', 'dev-user-123', 'DELETE', 'payment_plans', 'PP-004', '{"status": "active"}', NULL, '192.168.1.100', 'Mozilla/5.0', NOW()),
('AUD-004', 'dev-user-123', 'INSERT', 'authorization_requests', 'AUTH-001', NULL, '{"patient_name": "Ahmed Hassan Al-Rashid", "status": "Approved"}', '192.168.1.100', 'Mozilla/5.0', NOW()),
('AUD-005', 'dev-user-123', 'UPDATE', 'billing_claims', 'CLM-001', '{"status": "Pending"}', '{"status": "Partially Paid"}', '192.168.1.100', 'Mozilla/5.0', NOW());

-- =============================================
-- 16. SYSTEM SETTINGS
-- =============================================
INSERT INTO system_settings (id, setting_key, setting_value, description, category, is_active, created_at, updated_at) VALUES
('SET-001', 'app_name', 'BillWise AI Nexus', 'Application name', 'general', true, NOW(), NOW()),
('SET-002', 'default_currency', 'USD', 'Default currency for billing', 'billing', true, NOW(), NOW()),
('SET-003', 'payment_terms', '30', 'Default payment terms in days', 'billing', true, NOW(), NOW()),
('SET-004', 'late_fee_percentage', '1.5', 'Late fee percentage per month', 'billing', true, NOW(), NOW()),
('SET-005', 'collection_threshold', '90', 'Days before sending to collections', 'collections', true, NOW(), NOW()),
('SET-006', 'notification_frequency', 'daily', 'How often to send notifications', 'notifications', true, NOW(), NOW()),
('SET-007', 'backup_frequency', 'daily', 'How often to backup data', 'system', true, NOW(), NOW()),
('SET-008', 'session_timeout', '30', 'Session timeout in minutes', 'security', true, NOW(), NOW()),
('SET-009', 'password_policy', 'strong', 'Password complexity requirements', 'security', true, NOW(), NOW()),
('SET-010', 'audit_retention', '365', 'Audit log retention in days', 'compliance', true, NOW(), NOW());

-- =============================================
-- 17. USER ROLES AND PERMISSIONS
-- =============================================
INSERT INTO user_roles (id, role_name, permissions, description, created_at, updated_at) VALUES
('ROLE-001', 'Administrator', '["all"]', 'Full system access', NOW(), NOW()),
('ROLE-002', 'Billing Manager', '["billing", "collections", "reports"]', 'Billing and collections management', NOW(), NOW()),
('ROLE-003', 'Collections Agent', '["collections", "communications"]', 'Collections and patient communication', NOW(), NOW()),
('ROLE-004', 'Billing Clerk', '["billing", "claims"]', 'Basic billing operations', NOW(), NOW()),
('ROLE-005', 'Reports Analyst', '["reports", "analytics"]', 'Reports and analytics access', NOW(), NOW());

-- =============================================
-- 18. INTEGRATION SETTINGS
-- =============================================
INSERT INTO integration_settings (id, integration_name, api_endpoint, api_key, is_active, last_sync, created_at, updated_at) VALUES
('INT-001', 'Clearinghouse API', 'https://api.clearinghouse.com', 'encrypted_api_key_001', true, NOW(), NOW(), NOW()),
('INT-002', 'EHR Integration', 'https://api.ehr-system.com', 'encrypted_api_key_002', true, NOW(), NOW(), NOW()),
('INT-003', 'Payment Gateway', 'https://api.payment.com', 'encrypted_api_key_003', true, NOW(), NOW(), NOW()),
('INT-004', 'Insurance Verification', 'https://api.insurance.com', 'encrypted_api_key_004', true, NOW(), NOW(), NOW()),
('INT-005', 'SMS Gateway', 'https://api.sms.com', 'encrypted_api_key_005', true, NOW(), NOW(), NOW());

-- =============================================
-- 19. WORKFLOW TEMPLATES
-- =============================================
INSERT INTO workflow_templates (id, template_name, workflow_type, steps, is_active, created_at, updated_at) VALUES
('WF-001', 'New Patient Onboarding', 'patient', '["collect_info", "verify_insurance", "create_account", "send_welcome"]', true, NOW(), NOW()),
('WF-002', 'Claim Submission', 'billing', '["validate_claim", "submit_to_payer", "track_status", "handle_response"]', true, NOW(), NOW()),
('WF-003', 'Collections Process', 'collections', '["initial_contact", "payment_arrangement", "follow_up", "escalation"]', true, NOW(), NOW()),
('WF-004', 'Denial Management', 'denials', '["analyze_denial", "prepare_appeal", "submit_appeal", "track_outcome"]', true, NOW(), NOW()),
('WF-005', 'Prior Authorization', 'authorization', '["check_requirements", "gather_docs", "submit_request", "monitor_status"]', true, NOW(), NOW());

-- =============================================
-- 20. PERFORMANCE METRICS
-- =============================================
INSERT INTO performance_metrics (id, metric_name, metric_value, metric_unit, target_value, actual_value, variance, period_start, period_end, created_at) VALUES
('PM-001', 'Collection Rate', 87.5, 'percentage', 85.0, 87.5, 2.5, '2024-01-01', '2024-01-31', NOW()),
('PM-002', 'Denial Rate', 12.5, 'percentage', 15.0, 12.5, -2.5, '2024-01-01', '2024-01-31', NOW()),
('PM-003', 'Average Days in A/R', 45, 'days', 40, 45, 5, '2024-01-01', '2024-01-31', NOW()),
('PM-004', 'First Pass Rate', 78.2, 'percentage', 80.0, 78.2, -1.8, '2024-01-01', '2024-01-31', NOW()),
('PM-005', 'Patient Satisfaction', 4.2, 'rating', 4.0, 4.2, 0.2, '2024-01-01', '2024-01-31', NOW());

-- =============================================
-- END OF DUMMY DATA
-- =============================================

-- Summary of data inserted:
-- - 1 User (Development User)
-- - 10 Billing Statements
-- - 10 Collections Accounts
-- - 10 Collection Activities
-- - 10 Authorization Requests
-- - 10 Billing Claims
-- - 10 Denied Claims
-- - 10 Payment Plans
-- - 5 EDI Transactions
-- - 10 Code Validation Results
-- - 10 Payer Rules
-- - 10 Communication Preferences
-- - 5 Reports and Analytics
-- - 10 Notifications
-- - 5 Audit Logs
-- - 10 System Settings
-- - 5 User Roles
-- - 5 Integration Settings
-- - 5 Workflow Templates
-- - 5 Performance Metrics

-- Total: 150+ records across 20+ tables
-- This provides comprehensive dummy data for testing all features of the medical billing system.
