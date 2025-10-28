-- =============================================
-- COMPREHENSIVE DUMMY DATA - NO USER_ID VERSION
-- =============================================
-- This file contains realistic dummy data for all forms and components
-- All UUIDs are generated using gen_random_uuid()
-- user_id fields are excluded to avoid foreign key constraints

-- =============================================
-- 1. BILLING STATEMENTS
-- =============================================
INSERT INTO billing_statements (id, patient_id, patient_name, amount_due, status, due_date, created_at, updated_at, paid_at) VALUES
(gen_random_uuid(), gen_random_uuid(), 'Ahmed Hassan Al-Rashid', 1250.00, 'sent', '2024-02-15', '2024-01-15', NOW(), NULL),
(gen_random_uuid(), gen_random_uuid(), 'Fatima Zahra Khan', 850.50, 'delivered', '2024-01-20', '2024-01-10', NOW(), NULL),
(gen_random_uuid(), gen_random_uuid(), 'Muhammad Ali Sheikh', 2100.75, 'viewed', '2024-02-28', '2024-01-28', NOW(), NULL),
(gen_random_uuid(), gen_random_uuid(), 'Aisha Rahman', 675.25, 'paid', '2024-01-10', '2024-01-05', NOW(), '2024-01-08'),
(gen_random_uuid(), gen_random_uuid(), 'Omar Abdullah', 3200.00, 'delivered', '2024-01-05', '2023-12-20', NOW(), NULL),
(gen_random_uuid(), gen_random_uuid(), 'Khadija Ibrahim', 1450.80, 'sent', '2024-02-20', '2024-01-20', NOW(), NULL),
(gen_random_uuid(), gen_random_uuid(), 'Yusuf Hassan', 980.40, 'viewed', '2024-02-10', '2024-01-10', NOW(), NULL),
(gen_random_uuid(), gen_random_uuid(), 'Zainab Ali', 2750.60, 'delivered', '2024-01-15', '2024-01-01', NOW(), NULL),
(gen_random_uuid(), gen_random_uuid(), 'Abdul Rahman', 1200.00, 'paid', '2024-01-25', '2024-01-15', NOW(), '2024-01-22'),
(gen_random_uuid(), gen_random_uuid(), 'Maryam Ahmed', 1890.30, 'sent', '2024-02-25', '2024-01-25', NOW(), NULL);

-- =============================================
-- 2. COLLECTIONS ACCOUNTS
-- =============================================
INSERT INTO collections_accounts (id, patient_name, patient_id, patient_email, patient_phone, original_balance, current_balance, days_overdue, collection_stage, collection_status, last_contact_date, next_action_date, notes, created_at) VALUES
(gen_random_uuid(), 'Ahmed Hassan Al-Rashid', gen_random_uuid(), 'ahmed.hassan@email.com', '(555) 123-4567', 1250.00, 1250.00, 45, 'early_collection', 'active', '2024-01-15', '2024-02-01', 'Patient responsive, discussing payment plan', NOW()),
(gen_random_uuid(), 'Fatima Zahra Khan', gen_random_uuid(), 'fatima.khan@email.com', '(555) 234-5678', 850.50, 850.50, 60, 'mid_collection', 'active', '2024-01-20', '2024-02-05', 'Multiple contact attempts, no response', NOW()),
(gen_random_uuid(), 'Muhammad Ali Sheikh', gen_random_uuid(), 'muhammad.sheikh@email.com', '(555) 345-6789', 2100.75, 2100.75, 30, 'early_collection', 'payment_plan', '2024-01-25', '2024-02-10', 'Agreed to monthly payments of $200', NOW()),
(gen_random_uuid(), 'Aisha Rahman', gen_random_uuid(), 'aisha.rahman@email.com', '(555) 456-7890', 675.25, 0.00, 0, 'early_collection', 'settled', '2024-01-08', NULL, 'Account paid in full', NOW()),
(gen_random_uuid(), 'Omar Abdullah', gen_random_uuid(), 'omar.abdullah@email.com', '(555) 567-8901', 3200.00, 3200.00, 75, 'pre_legal', 'active', '2024-01-30', '2024-02-15', 'Final notice sent, considering legal action', NOW()),
(gen_random_uuid(), 'Khadija Ibrahim', gen_random_uuid(), 'khadija.ibrahim@email.com', '(555) 678-9012', 1450.80, 1450.80, 25, 'early_collection', 'active', '2024-01-28', '2024-02-12', 'New account, first contact made', NOW()),
(gen_random_uuid(), 'Yusuf Hassan', gen_random_uuid(), 'yusuf.hassan@email.com', '(555) 789-0123', 980.40, 980.40, 40, 'mid_collection', 'active', '2024-01-22', '2024-02-07', 'Patient requested payment plan details', NOW()),
(gen_random_uuid(), 'Zainab Ali', gen_random_uuid(), 'zainab.ali@email.com', '(555) 890-1234', 2750.60, 2750.60, 55, 'mid_collection', 'payment_plan', '2024-01-18', '2024-02-03', 'Payment plan established, monitoring compliance', NOW()),
(gen_random_uuid(), 'Abdul Rahman', gen_random_uuid(), 'abdul.rahman@email.com', '(555) 901-2345', 1200.00, 0.00, 0, 'early_collection', 'settled', '2024-01-22', NULL, 'Account settled with payment plan', NOW()),
(gen_random_uuid(), 'Maryam Ahmed', gen_random_uuid(), 'maryam.ahmed@email.com', '(555) 012-3456', 1890.30, 1890.30, 35, 'early_collection', 'active', '2024-01-26', '2024-02-11', 'Initial contact made, awaiting response', NOW());

-- =============================================
-- 3. AUTHORIZATION REQUESTS
-- =============================================
INSERT INTO authorization_requests (id, patient_name, patient_id, provider_name, service_type, procedure_code, diagnosis_code, requested_date, status, insurance_company, policy_number, group_number, prior_auth_number, notes, created_at, updated_at) VALUES
(gen_random_uuid(), 'Ahmed Hassan Al-Rashid', gen_random_uuid(), 'Dr. Sarah Johnson', 'Surgery', 'CPT-12345', 'ICD-10-K59.00', '2024-02-01', 'Approved', 'Blue Cross Blue Shield', 'POL-001', 'GRP-001', 'PA-001', 'Appendectomy procedure approved', NOW(), NOW()),
(gen_random_uuid(), 'Fatima Zahra Khan', gen_random_uuid(), 'Dr. Michael Chen', 'Imaging', 'CPT-23456', 'ICD-10-M79.3', '2024-02-02', 'Pending', 'Aetna', 'POL-002', 'GRP-002', 'PA-002', 'MRI scan for back pain', NOW(), NOW()),
(gen_random_uuid(), 'Muhammad Ali Sheikh', gen_random_uuid(), 'Dr. Emily Rodriguez', 'Specialist', 'CPT-34567', 'ICD-10-E11.9', '2024-02-03', 'Denied', 'Cigna', 'POL-003', 'GRP-003', 'PA-003', 'Endocrinology consultation denied', NOW(), NOW()),
(gen_random_uuid(), 'Aisha Rahman', gen_random_uuid(), 'Dr. James Wilson', 'Surgery', 'CPT-45678', 'ICD-10-N80.1', '2024-02-04', 'Approved', 'UnitedHealth', 'POL-004', 'GRP-004', 'PA-004', 'Laparoscopic procedure approved', NOW(), NOW()),
(gen_random_uuid(), 'Omar Abdullah', gen_random_uuid(), 'Dr. Lisa Thompson', 'Therapy', 'CPT-56789', 'ICD-10-F32.9', '2024-02-05', 'Pending', 'Humana', 'POL-005', 'GRP-005', 'PA-005', 'Physical therapy sessions', NOW(), NOW()),
(gen_random_uuid(), 'Khadija Ibrahim', gen_random_uuid(), 'Dr. Robert Brown', 'Imaging', 'CPT-67890', 'ICD-10-R50.9', '2024-02-06', 'Approved', 'Medicare', 'POL-006', 'GRP-006', 'PA-006', 'CT scan approved', NOW(), NOW()),
(gen_random_uuid(), 'Yusuf Hassan', gen_random_uuid(), 'Dr. Jennifer Davis', 'Specialist', 'CPT-78901', 'ICD-10-I25.10', '2024-02-07', 'Pending', 'Kaiser Permanente', 'POL-007', 'GRP-007', 'PA-007', 'Cardiology consultation', NOW(), NOW()),
(gen_random_uuid(), 'Zainab Ali', gen_random_uuid(), 'Dr. Christopher Lee', 'Surgery', 'CPT-89012', 'ICD-10-K35.9', '2024-02-08', 'Approved', 'Anthem', 'POL-008', 'GRP-008', 'PA-008', 'Emergency appendectomy approved', NOW(), NOW()),
(gen_random_uuid(), 'Abdul Rahman', gen_random_uuid(), 'Dr. Maria Garcia', 'Therapy', 'CPT-90123', 'ICD-10-M25.561', '2024-02-09', 'Denied', 'BCBS', 'POL-009', 'GRP-009', 'PA-009', 'Occupational therapy denied', NOW(), NOW()),
(gen_random_uuid(), 'Maryam Ahmed', gen_random_uuid(), 'Dr. David Kim', 'Imaging', 'CPT-01234', 'ICD-10-R93.5', '2024-02-10', 'Approved', 'Aetna', 'POL-010', 'GRP-010', 'PA-010', 'Ultrasound approved', NOW(), NOW());

-- =============================================
-- 4. BILLING CLAIMS
-- =============================================
INSERT INTO billing_claims (id, patient_name, patient_id, claim_number, service_date, procedure_code, diagnosis_code, amount_billed, amount_paid, status, insurance_company, provider_name, created_at, updated_at) VALUES
(gen_random_uuid(), 'Ahmed Hassan Al-Rashid', gen_random_uuid(), 'CLM-001', '2024-01-15', 'CPT-12345', 'ICD-10-K59.00', 2500.00, 2000.00, 'Partially Paid', 'Blue Cross Blue Shield', 'Dr. Sarah Johnson', NOW(), NOW()),
(gen_random_uuid(), 'Fatima Zahra Khan', gen_random_uuid(), 'CLM-002', '2024-01-20', 'CPT-23456', 'ICD-10-M79.3', 1200.00, 0.00, 'Pending', 'Aetna', 'Dr. Michael Chen', NOW(), NOW()),
(gen_random_uuid(), 'Muhammad Ali Sheikh', gen_random_uuid(), 'CLM-003', '2024-01-25', 'CPT-34567', 'ICD-10-E11.9', 800.00, 0.00, 'Denied', 'Cigna', 'Dr. Emily Rodriguez', NOW(), NOW()),
(gen_random_uuid(), 'Aisha Rahman', gen_random_uuid(), 'CLM-004', '2024-01-30', 'CPT-45678', 'ICD-10-N80.1', 3200.00, 3200.00, 'Paid', 'UnitedHealth', 'Dr. James Wilson', NOW(), NOW()),
(gen_random_uuid(), 'Omar Abdullah', gen_random_uuid(), 'CLM-005', '2024-02-01', 'CPT-56789', 'ICD-10-F32.9', 1500.00, 0.00, 'Pending', 'Humana', 'Dr. Lisa Thompson', NOW(), NOW()),
(gen_random_uuid(), 'Khadija Ibrahim', gen_random_uuid(), 'CLM-006', '2024-02-05', 'CPT-67890', 'ICD-10-R50.9', 900.00, 720.00, 'Partially Paid', 'Medicare', 'Dr. Robert Brown', NOW(), NOW()),
(gen_random_uuid(), 'Yusuf Hassan', gen_random_uuid(), 'CLM-007', '2024-02-08', 'CPT-78901', 'ICD-10-I25.10', 1800.00, 0.00, 'Pending', 'Kaiser Permanente', 'Dr. Jennifer Davis', NOW(), NOW()),
(gen_random_uuid(), 'Zainab Ali', gen_random_uuid(), 'CLM-008', '2024-02-10', 'CPT-89012', 'ICD-10-K35.9', 4500.00, 0.00, 'Pending', 'Anthem', 'Dr. Christopher Lee', NOW(), NOW()),
(gen_random_uuid(), 'Abdul Rahman', gen_random_uuid(), 'CLM-009', '2024-02-12', 'CPT-90123', 'ICD-10-M25.561', 1100.00, 0.00, 'Denied', 'BCBS', 'Dr. Maria Garcia', NOW(), NOW()),
(gen_random_uuid(), 'Maryam Ahmed', gen_random_uuid(), 'CLM-010', '2024-02-15', 'CPT-01234', 'ICD-10-R93.5', 750.00, 600.00, 'Partially Paid', 'Aetna', 'Dr. David Kim', NOW(), NOW());

-- =============================================
-- 5. DENIED CLAIMS
-- =============================================
INSERT INTO denied_claims (id, patient_name, claim_id, denial_code, denial_reason, denial_date, amount_denied, status, appeal_deadline, created_at, updated_at) VALUES
(gen_random_uuid(), 'Muhammad Ali Sheikh', gen_random_uuid(), 'CO-50', 'Service not covered under plan', '2024-01-30', 800.00, 'Open', '2024-03-01', NOW(), NOW()),
(gen_random_uuid(), 'Abdul Rahman', gen_random_uuid(), 'CO-97', 'Prior authorization required', '2024-02-15', 1100.00, 'Appeal Filed', '2024-04-15', NOW(), NOW()),
(gen_random_uuid(), 'Ahmed Hassan Al-Rashid', gen_random_uuid(), 'CO-45', 'Charges exceed fee schedule', '2024-01-20', 500.00, 'Resolved', '2024-03-20', NOW(), NOW()),
(gen_random_uuid(), 'Fatima Zahra Khan', gen_random_uuid(), 'CO-96', 'Non-covered service', '2024-01-25', 1200.00, 'Open', '2024-03-25', NOW(), NOW()),
(gen_random_uuid(), 'Omar Abdullah', gen_random_uuid(), 'CO-49', 'Coverage terminated', '2024-02-05', 1500.00, 'Appeal Filed', '2024-04-05', NOW(), NOW()),
(gen_random_uuid(), 'Khadija Ibrahim', gen_random_uuid(), 'CO-51', 'Duplicate claim', '2024-02-08', 180.00, 'Resolved', '2024-04-08', NOW(), NOW()),
(gen_random_uuid(), 'Yusuf Hassan', gen_random_uuid(), 'CO-52', 'Claim not covered', '2024-02-12', 1800.00, 'Open', '2024-04-12', NOW(), NOW()),
(gen_random_uuid(), 'Zainab Ali', gen_random_uuid(), 'CO-53', 'Service not authorized', '2024-02-15', 4500.00, 'Appeal Filed', '2024-04-15', NOW(), NOW()),
(gen_random_uuid(), 'Maryam Ahmed', gen_random_uuid(), 'CO-54', 'Benefit maximum reached', '2024-02-18', 150.00, 'Resolved', '2024-04-18', NOW(), NOW()),
(gen_random_uuid(), 'Aisha Rahman', gen_random_uuid(), 'CO-55', 'Pre-existing condition', '2024-02-01', 3200.00, 'Open', '2024-04-01', NOW(), NOW());

-- =============================================
-- 6. PAYMENT PLANS
-- =============================================
INSERT INTO payment_plans (id, patient_name, patient_id, total_amount, monthly_payment, remaining_balance, start_date, end_date, status, created_at, updated_at) VALUES
(gen_random_uuid(), 'Muhammad Ali Sheikh', gen_random_uuid(), 2100.75, 200.00, 1700.75, '2024-01-25', '2024-10-25', 'Active', NOW(), NOW()),
(gen_random_uuid(), 'Zainab Ali', gen_random_uuid(), 2750.60, 300.00, 2150.60, '2024-01-18', '2024-09-18', 'Active', NOW(), NOW()),
(gen_random_uuid(), 'Ahmed Hassan Al-Rashid', gen_random_uuid(), 1250.00, 150.00, 950.00, '2024-01-15', '2024-08-15', 'Active', NOW(), NOW()),
(gen_random_uuid(), 'Fatima Zahra Khan', gen_random_uuid(), 850.50, 100.00, 650.50, '2024-01-20', '2024-08-20', 'Active', NOW(), NOW()),
(gen_random_uuid(), 'Omar Abdullah', gen_random_uuid(), 3200.00, 400.00, 2400.00, '2024-01-30', '2024-09-30', 'Active', NOW(), NOW()),
(gen_random_uuid(), 'Khadija Ibrahim', gen_random_uuid(), 1450.80, 200.00, 1050.80, '2024-01-28', '2024-08-28', 'Active', NOW(), NOW()),
(gen_random_uuid(), 'Yusuf Hassan', gen_random_uuid(), 980.40, 100.00, 780.40, '2024-01-22', '2024-09-22', 'Active', NOW(), NOW()),
(gen_random_uuid(), 'Maryam Ahmed', gen_random_uuid(), 1890.30, 250.00, 1390.30, '2024-01-26', '2024-08-26', 'Active', NOW(), NOW()),
(gen_random_uuid(), 'Abdul Rahman', gen_random_uuid(), 1200.00, 150.00, 0.00, '2024-01-22', '2024-08-22', 'Completed', NOW(), NOW()),
(gen_random_uuid(), 'Aisha Rahman', gen_random_uuid(), 675.25, 100.00, 0.00, '2024-01-08', '2024-07-08', 'Completed', NOW(), NOW());

-- =============================================
-- 7. COLLECTION ACTIVITIES
-- =============================================
INSERT INTO collection_activities (id, account_id, activity_type, contact_method, activity_date, notes, outcome, next_action_date, created_at) VALUES
(gen_random_uuid(), gen_random_uuid(), 'phone_call', 'phone', '2024-01-15', 'Initial contact call - patient responsive', 'Promise to pay in 30 days', '2024-02-15', NOW()),
(gen_random_uuid(), gen_random_uuid(), 'email_sent', 'email', '2024-01-20', 'Payment reminder email sent', 'No response', '2024-02-05', NOW()),
(gen_random_uuid(), gen_random_uuid(), 'letter_sent', 'mail', '2024-01-25', 'First notice letter mailed', 'No response', '2024-02-10', NOW()),
(gen_random_uuid(), gen_random_uuid(), 'phone_call', 'phone', '2024-01-28', 'Follow-up call - payment plan discussed', 'Payment plan established', '2024-02-28', NOW()),
(gen_random_uuid(), gen_random_uuid(), 'dispute_received', 'email', '2024-01-30', 'Patient disputes charges', 'Under investigation', '2024-02-15', NOW()),
(gen_random_uuid(), gen_random_uuid(), 'promise_to_pay', 'phone', '2024-02-01', 'Patient promised payment by end of month', 'Payment expected', '2024-03-01', NOW()),
(gen_random_uuid(), gen_random_uuid(), 'partial_payment', 'phone', '2024-02-05', 'Partial payment received', 'Remaining balance noted', '2024-03-05', NOW()),
(gen_random_uuid(), gen_random_uuid(), 'settlement_offer', 'email', '2024-02-08', 'Settlement offer sent', 'Awaiting response', '2024-02-22', NOW()),
(gen_random_uuid(), gen_random_uuid(), 'note_added', 'in_person', '2024-02-10', 'Account review - escalated to supervisor', 'Management review', '2024-02-25', NOW()),
(gen_random_uuid(), gen_random_uuid(), 'phone_call', 'phone', '2024-02-12', 'Final notice call made', 'Last attempt before legal action', '2024-02-27', NOW());

-- =============================================
-- 8. DISPUTES
-- =============================================
INSERT INTO disputes (id, patient_name, patient_id, dispute_type, dispute_reason, dispute_amount, status, dispute_date, resolution_date, notes, created_at, updated_at) VALUES
(gen_random_uuid(), 'Fatima Zahra Khan', gen_random_uuid(), 'Billing Error', 'Incorrect procedure code billed', 850.50, 'open', '2024-01-20', NULL, 'Patient claims procedure was diagnostic, not surgical', NOW(), NOW()),
(gen_random_uuid(), 'Omar Abdullah', gen_random_uuid(), 'Insurance Coverage', 'Service should be covered under plan', 3200.00, 'investigating', '2024-01-30', NULL, 'Patient provided additional documentation', NOW(), NOW()),
(gen_random_uuid(), 'Yusuf Hassan', gen_random_uuid(), 'Duplicate Billing', 'Same service billed twice', 900.00, 'resolved_patient_favor', '2024-02-05', '2024-02-15', 'Duplicate charge removed from account', NOW(), NOW()),
(gen_random_uuid(), 'Zainab Ali', gen_random_uuid(), 'Authorization Issue', 'Prior authorization was obtained', 2250.00, 'resolved_practice_favor', '2024-02-10', '2024-02-20', 'Authorization was valid, dispute denied', NOW(), NOW()),
(gen_random_uuid(), 'Khadija Ibrahim', gen_random_uuid(), 'Billing Error', 'Incorrect diagnosis code', 180.00, 'closed', '2024-02-08', '2024-02-18', 'Diagnosis code corrected, balance adjusted', NOW(), NOW()),
(gen_random_uuid(), 'Maryam Ahmed', gen_random_uuid(), 'Insurance Coverage', 'Service covered under different benefit', 150.00, 'open', '2024-02-15', NULL, 'Patient requesting review of coverage determination', NOW(), NOW()),
(gen_random_uuid(), 'Ahmed Hassan Al-Rashid', gen_random_uuid(), 'Billing Error', 'Charges exceed contracted rate', 500.00, 'investigating', '2024-01-15', NULL, 'Reviewing contract terms and billing rates', NOW(), NOW()),
(gen_random_uuid(), 'Muhammad Ali Sheikh', gen_random_uuid(), 'Authorization Issue', 'Emergency procedure authorization', 800.00, 'resolved_patient_favor', '2024-01-25', '2024-02-05', 'Emergency authorization approved retroactively', NOW(), NOW()),
(gen_random_uuid(), 'Abdul Rahman', gen_random_uuid(), 'Insurance Coverage', 'Coverage verification error', 1100.00, 'closed', '2024-02-12', '2024-02-22', 'Coverage confirmed, claim reprocessed', NOW(), NOW()),
(gen_random_uuid(), 'Aisha Rahman', gen_random_uuid(), 'Billing Error', 'Incorrect patient information', 675.25, 'resolved_practice_favor', '2024-01-30', '2024-02-10', 'Patient information verified, charges stand', NOW(), NOW());

-- =============================================
-- 9. SETTLEMENT OFFERS
-- =============================================
INSERT INTO settlement_offers (id, patient_name, patient_id, original_amount, settlement_amount, discount_percentage, offer_date, expiration_date, status, terms, created_at, updated_at) VALUES
(gen_random_uuid(), 'Ahmed Hassan Al-Rashid', gen_random_uuid(), 1250.00, 1000.00, 20.00, '2024-01-15', '2024-02-15', 'pending', 'Full payment within 30 days', NOW(), NOW()),
(gen_random_uuid(), 'Fatima Zahra Khan', gen_random_uuid(), 850.50, 680.40, 20.00, '2024-01-20', '2024-02-20', 'accepted', 'Payment plan over 6 months', NOW(), NOW()),
(gen_random_uuid(), 'Muhammad Ali Sheikh', gen_random_uuid(), 2100.75, 1680.60, 20.00, '2024-01-25', '2024-02-25', 'pending', 'Lump sum payment', NOW(), NOW()),
(gen_random_uuid(), 'Omar Abdullah', gen_random_uuid(), 3200.00, 2560.00, 20.00, '2024-01-30', '2024-03-01', 'rejected', 'Full payment required', NOW(), NOW()),
(gen_random_uuid(), 'Khadija Ibrahim', gen_random_uuid(), 1450.80, 1160.64, 20.00, '2024-01-28', '2024-02-28', 'expired', 'Payment within 30 days', NOW(), NOW()),
(gen_random_uuid(), 'Yusuf Hassan', gen_random_uuid(), 980.40, 784.32, 20.00, '2024-01-22', '2024-02-22', 'completed', 'Full payment received', NOW(), NOW()),
(gen_random_uuid(), 'Zainab Ali', gen_random_uuid(), 2750.60, 2200.48, 20.00, '2024-01-18', '2024-02-18', 'pending', 'Payment plan over 12 months', NOW(), NOW()),
(gen_random_uuid(), 'Maryam Ahmed', gen_random_uuid(), 1890.30, 1512.24, 20.00, '2024-01-26', '2024-02-26', 'accepted', 'Lump sum payment', NOW(), NOW()),
(gen_random_uuid(), 'Abdul Rahman', gen_random_uuid(), 1200.00, 960.00, 20.00, '2024-01-22', '2024-02-22', 'completed', 'Full payment received', NOW(), NOW()),
(gen_random_uuid(), 'Aisha Rahman', gen_random_uuid(), 675.25, 540.20, 20.00, '2024-01-08', '2024-02-08', 'completed', 'Full payment received', NOW(), NOW());

-- =============================================
-- 10. ATTORNEY REFERRALS
-- =============================================
INSERT INTO attorney_referrals (id, patient_name, patient_id, attorney_name, attorney_firm, referral_date, status, referral_reason, amount_referred, notes, created_at, updated_at) VALUES
(gen_random_uuid(), 'Omar Abdullah', gen_random_uuid(), 'John Smith', 'Smith & Associates', '2024-01-30', 'pending', 'High balance, unresponsive to collection efforts', 3200.00, 'Patient has not responded to multiple contact attempts', NOW(), NOW()),
(gen_random_uuid(), 'Fatima Zahra Khan', gen_random_uuid(), 'Sarah Johnson', 'Johnson Legal Group', '2024-01-20', 'accepted', 'Extended non-payment period', 850.50, 'Attorney accepted case, legal proceedings initiated', NOW(), NOW()),
(gen_random_uuid(), 'Zainab Ali', gen_random_uuid(), 'Michael Brown', 'Brown & Partners', '2024-01-18', 'in_progress', 'Complex billing dispute', 2750.60, 'Legal review of billing practices ongoing', NOW(), NOW()),
(gen_random_uuid(), 'Yusuf Hassan', gen_random_uuid(), 'Emily Davis', 'Davis Law Firm', '2024-01-22', 'judgment_obtained', 'Successful judgment obtained', 980.40, 'Court judgment in favor of practice', NOW(), NOW()),
(gen_random_uuid(), 'Khadija Ibrahim', gen_random_uuid(), 'Robert Wilson', 'Wilson & Associates', '2024-01-28', 'collecting', 'Payment plan established through attorney', 1450.80, 'Attorney negotiated payment arrangement', NOW(), NOW()),
(gen_random_uuid(), 'Maryam Ahmed', gen_random_uuid(), 'Lisa Anderson', 'Anderson Legal', '2024-01-26', 'closed', 'Case resolved without legal action', 1890.30, 'Patient paid in full before legal proceedings', NOW(), NOW()),
(gen_random_uuid(), 'Ahmed Hassan Al-Rashid', gen_random_uuid(), 'David Miller', 'Miller Law Group', '2024-01-15', 'returned', 'Attorney declined case', 1250.00, 'Attorney determined case not suitable for legal action', NOW(), NOW()),
(gen_random_uuid(), 'Muhammad Ali Sheikh', gen_random_uuid(), 'Jennifer Taylor', 'Taylor & Co', '2024-01-25', 'pending', 'High balance referral', 2100.75, 'Initial referral, awaiting attorney response', NOW(), NOW()),
(gen_random_uuid(), 'Abdul Rahman', gen_random_uuid(), 'Christopher Lee', 'Lee Legal Services', '2024-01-22', 'closed', 'Case resolved through payment plan', 1200.00, 'Attorney negotiated successful payment plan', NOW(), NOW()),
(gen_random_uuid(), 'Aisha Rahman', gen_random_uuid(), 'Amanda Garcia', 'Garcia Law Firm', '2024-01-08', 'closed', 'Case resolved through settlement', 675.25, 'Settlement agreement reached', NOW(), NOW());

-- =============================================
-- 11. COMMUNICATION PREFERENCES
-- =============================================
INSERT INTO communication_preferences (id, patient_name, patient_id, preferred_channel, contact_method, frequency, language, time_zone, opt_in_status, created_at, updated_at) VALUES
(gen_random_uuid(), 'Ahmed Hassan Al-Rashid', gen_random_uuid(), 'email', 'email', 'weekly', 'English', 'EST', true, NOW(), NOW()),
(gen_random_uuid(), 'Fatima Zahra Khan', gen_random_uuid(), 'sms', 'sms', 'bi_weekly', 'English', 'PST', true, NOW(), NOW()),
(gen_random_uuid(), 'Muhammad Ali Sheikh', gen_random_uuid(), 'portal', 'email', 'monthly', 'English', 'CST', true, NOW(), NOW()),
(gen_random_uuid(), 'Aisha Rahman', gen_random_uuid(), 'paper', 'mail', 'quarterly', 'English', 'EST', false, NOW(), NOW()),
(gen_random_uuid(), 'Omar Abdullah', gen_random_uuid(), 'email', 'email', 'weekly', 'English', 'MST', true, NOW(), NOW()),
(gen_random_uuid(), 'Khadija Ibrahim', gen_random_uuid(), 'sms', 'sms', 'bi_weekly', 'English', 'PST', true, NOW(), NOW()),
(gen_random_uuid(), 'Yusuf Hassan', gen_random_uuid(), 'portal', 'email', 'monthly', 'English', 'EST', true, NOW(), NOW()),
(gen_random_uuid(), 'Zainab Ali', gen_random_uuid(), 'email', 'email', 'weekly', 'English', 'CST', true, NOW(), NOW()),
(gen_random_uuid(), 'Abdul Rahman', gen_random_uuid(), 'paper', 'mail', 'quarterly', 'English', 'PST', false, NOW(), NOW()),
(gen_random_uuid(), 'Maryam Ahmed', gen_random_uuid(), 'sms', 'sms', 'bi_weekly', 'English', 'EST', true, NOW(), NOW());

-- =============================================
-- 12. BILLING CHAT SESSIONS
-- =============================================
INSERT INTO billing_chat_sessions (id, patient_name, patient_id, session_start, session_end, status, issue_type, resolution, notes, created_at, updated_at) VALUES
(gen_random_uuid(), 'Ahmed Hassan Al-Rashid', gen_random_uuid(), '2024-01-15 10:30:00', '2024-01-15 11:00:00', 'resolved', 'Billing Inquiry', 'Payment plan established', 'Patient called about payment options', NOW(), NOW()),
(gen_random_uuid(), 'Fatima Zahra Khan', gen_random_uuid(), '2024-01-20 14:15:00', '2024-01-20 14:45:00', 'escalated', 'Dispute', 'Referred to supervisor', 'Patient disputes charges, needs review', NOW(), NOW()),
(gen_random_uuid(), 'Muhammad Ali Sheikh', gen_random_uuid(), '2024-01-25 09:00:00', '2024-01-25 09:30:00', 'resolved', 'Payment', 'Payment processed', 'Patient made payment over phone', NOW(), NOW()),
(gen_random_uuid(), 'Aisha Rahman', gen_random_uuid(), '2024-01-30 16:20:00', '2024-01-30 16:50:00', 'closed', 'General Inquiry', 'Information provided', 'Patient asked about statement details', NOW(), NOW()),
(gen_random_uuid(), 'Omar Abdullah', gen_random_uuid(), '2024-02-01 11:45:00', '2024-02-01 12:15:00', 'active', 'Billing Error', 'Under investigation', 'Patient reports incorrect charges', NOW(), NOW()),
(gen_random_uuid(), 'Khadija Ibrahim', gen_random_uuid(), '2024-02-05 13:30:00', '2024-02-05 14:00:00', 'resolved', 'Payment Plan', 'Plan modified', 'Patient requested payment plan adjustment', NOW(), NOW()),
(gen_random_uuid(), 'Yusuf Hassan', gen_random_uuid(), '2024-02-08 15:10:00', '2024-02-08 15:40:00', 'escalated', 'Insurance', 'Referred to billing specialist', 'Complex insurance coverage issue', NOW(), NOW()),
(gen_random_uuid(), 'Zainab Ali', gen_random_uuid(), '2024-02-10 10:00:00', '2024-02-10 10:30:00', 'resolved', 'Statement', 'Statement resent', 'Patient did not receive original statement', NOW(), NOW()),
(gen_random_uuid(), 'Abdul Rahman', gen_random_uuid(), '2024-02-12 14:45:00', '2024-02-12 15:15:00', 'closed', 'Payment', 'Payment confirmed', 'Patient confirmed payment received', NOW(), NOW()),
(gen_random_uuid(), 'Maryam Ahmed', gen_random_uuid(), '2024-02-15 12:00:00', '2024-02-15 12:30:00', 'resolved', 'General Inquiry', 'Information provided', 'Patient asked about account balance', NOW(), NOW());

-- =============================================
-- 13. BILLING CYCLE CONFIGURATIONS
-- =============================================
INSERT INTO billing_cycle_configs (id, cycle_name, frequency, start_date, end_date, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'Monthly Billing Cycle', 'monthly', '2024-01-01', '2024-12-31', true, NOW(), NOW()),
(gen_random_uuid(), 'Weekly Billing Cycle', 'weekly', '2024-01-01', '2024-12-31', false, NOW(), NOW()),
(gen_random_uuid(), 'Quarterly Billing Cycle', 'quarterly', '2024-01-01', '2024-12-31', true, NOW(), NOW()),
(gen_random_uuid(), 'Bi-weekly Billing Cycle', 'bi_weekly', '2024-01-01', '2024-12-31', false, NOW(), NOW());

-- =============================================
-- 14. REPORTS AND ANALYTICS DATA
-- =============================================
INSERT INTO reports_analytics (id, report_name, report_type, generated_date, data_summary, created_at, updated_at) VALUES
(gen_random_uuid(), 'Monthly Collections Report', 'collections', '2024-01-31', '{"total_collected": 15000, "outstanding_balance": 25000, "collection_rate": 37.5}', NOW(), NOW()),
(gen_random_uuid(), 'Denial Analysis Report', 'denials', '2024-01-31', '{"total_denials": 15, "appeal_success_rate": 60, "common_denial_codes": ["CO-50", "CO-96"]}', NOW(), NOW()),
(gen_random_uuid(), 'Payment Plan Performance', 'payment_plans', '2024-01-31', '{"active_plans": 8, "completion_rate": 75, "average_payment": 200}', NOW(), NOW()),
(gen_random_uuid(), 'Billing Cycle Summary', 'billing', '2024-01-31', '{"statements_sent": 150, "delivery_rate": 95, "payment_rate": 40}', NOW(), NOW()),
(gen_random_uuid(), 'Attorney Referral Report', 'legal', '2024-01-31', '{"total_referrals": 5, "successful_collections": 3, "legal_costs": 2500}', NOW(), NOW());

-- =============================================
-- END OF DUMMY DATA
-- =============================================
-- All tables have been populated with realistic dummy data
-- All UUIDs are generated using gen_random_uuid()
-- user_id fields have been excluded to avoid foreign key constraints
-- All enum values match the database schema
-- =============================================
