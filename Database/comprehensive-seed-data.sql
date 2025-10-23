-- Comprehensive Seed Data for BillWise AI Nexus
-- This script creates diverse patient data including Muslim names

-- Insert insurance payers
INSERT INTO insurance_payers (id, name, payer_id_code, is_active, created_at) VALUES
('payer-001', 'Medicare', 'MEDICARE', true, NOW()),
('payer-002', 'Blue Cross Blue Shield', 'BCBS', true, NOW()),
('payer-003', 'Aetna', 'AETNA', true, NOW()),
('payer-004', 'Cigna', 'CIGNA', true, NOW()),
('payer-005', 'Humana', 'HUMANA', true, NOW()),
('payer-006', 'UnitedHealth', 'UHC', true, NOW());

-- Insert billing cycles
INSERT INTO billing_cycles (id, name, frequency, day_of_cycle, is_active, reminder_days, created_at, updated_at) VALUES
('cycle-001', 'Monthly Billing', 'monthly', 1, true, ARRAY[7, 3, 1], NOW(), NOW()),
('cycle-002', 'Bi-weekly Billing', 'bi_weekly', 1, true, ARRAY[3, 1], NOW(), NOW()),
('cycle-003', 'Weekly Billing', 'weekly', 1, true, ARRAY[2, 1], NOW(), NOW());

-- Insert diverse patient data with Muslim names
INSERT INTO collections_accounts (id, patient_name, patient_id, patient_email, patient_phone, original_balance, current_balance, days_overdue, collection_stage, collection_status, last_contact_date, next_action_date, notes, user_id, created_at) VALUES
('col-001', 'Ahmad Hassan', 'PAT-001', 'ahmad.hassan@email.com', '(555) 123-4567', 450.00, 450.00, 15, 'early_collection', 'active', '2024-05-15', '2024-07-01', 'Patient prefers email communication', 'user-001', NOW()),
('col-002', 'Fatima Al-Zahra', 'PAT-002', 'fatima.alzahra@email.com', '(555) 234-5678', 1275.80, 1275.80, 38, 'mid_collection', 'active', '2024-04-22', '2024-07-05', 'Patient has payment plan request', 'user-001', NOW()),
('col-003', 'Omar Abdullah', 'PAT-003', 'omar.abdullah@email.com', '(555) 345-6789', 89.25, 89.25, 5, 'early_collection', 'active', '2024-06-10', '2024-07-15', 'Auto-pay setup pending', 'user-001', NOW()),
('col-004', 'Aisha Rahman', 'PAT-004', 'aisha.rahman@email.com', '(555) 456-7890', 2340.50, 2340.50, 106, 'pre_legal', 'active', '2024-03-15', '2024-07-10', 'Patient disputes charges', 'user-001', NOW()),
('col-005', 'Yusuf Ibrahim', 'PAT-005', 'yusuf.ibrahim@email.com', '(555) 567-8901', 675.30, 675.30, 8, 'early_collection', 'active', '2024-06-05', '2024-07-20', 'Good payment history', 'user-001', NOW()),
('col-006', 'Zainab Ali', 'PAT-006', 'zainab.ali@email.com', '(555) 678-9012', 890.75, 890.75, 32, 'mid_collection', 'active', '2024-05-20', '2024-07-25', 'Patient requested payment plan', 'user-001', NOW()),
('col-007', 'Muhammad Hassan', 'PAT-007', 'muhammad.hassan@email.com', '(555) 789-0123', 1200.00, 1200.00, 45, 'mid_collection', 'active', '2024-05-10', '2024-07-30', 'Insurance verification needed', 'user-001', NOW()),
('col-008', 'Amina Khan', 'PAT-008', 'amina.khan@email.com', '(555) 890-1234', 350.25, 350.25, 12, 'early_collection', 'active', '2024-06-18', '2024-08-01', 'Patient prefers phone calls', 'user-001', NOW());

-- Insert billing statements
INSERT INTO billing_statements (id, patient_id, patient_name, amount_due, statement_date, due_date, status, channel, user_id, created_at) VALUES
('stmt-001', 'PAT-001', 'Ahmad Hassan', 450.00, '2024-05-01', '2024-06-01', 'sent', 'email', 'user-001', NOW()),
('stmt-002', 'PAT-002', 'Fatima Al-Zahra', 1275.80, '2024-04-01', '2024-05-01', 'delivered', 'email', 'user-001', NOW()),
('stmt-003', 'PAT-003', 'Omar Abdullah', 89.25, '2024-06-01', '2024-07-01', 'viewed', 'portal', 'user-001', NOW()),
('stmt-004', 'PAT-004', 'Aisha Rahman', 2340.50, '2024-03-01', '2024-04-01', 'sent', 'paper', 'user-001', NOW()),
('stmt-005', 'PAT-005', 'Yusuf Ibrahim', 675.30, '2024-06-01', '2024-07-01', 'delivered', 'email', 'user-001', NOW()),
('stmt-006', 'PAT-006', 'Zainab Ali', 890.75, '2024-05-01', '2024-06-01', 'sent', 'email', 'user-001', NOW());

-- Insert authorization requests
INSERT INTO authorization_requests (id, patient_name, patient_dob, patient_member_id, payer_id, payer_name_custom, provider_name_custom, provider_npi_custom, procedure_codes, diagnosis_codes, clinical_indication, service_start_date, service_end_date, urgency_level, status, user_id, created_at) VALUES
('auth-001', 'Ahmad Hassan', '1985-03-15', 'MEM001', 'payer-001', 'Medicare', 'Dr. Smith', '1234567890', ARRAY['99213'], ARRAY['Z00.00'], 'Annual physical examination', '2024-07-01', '2024-07-01', 'routine', 'pending', 'user-001', NOW()),
('auth-002', 'Fatima Al-Zahra', '1990-07-22', 'MEM002', 'payer-002', 'Blue Cross Blue Shield', 'Dr. Johnson', '0987654321', ARRAY['99214', '36415'], ARRAY['E11.9'], 'Diabetes management and blood work', '2024-07-05', '2024-07-05', 'urgent', 'approved', 'user-001', NOW()),
('auth-003', 'Omar Abdullah', '1988-11-08', 'MEM003', 'payer-003', 'Aetna', 'Dr. Williams', '1122334455', ARRAY['99213'], ARRAY['M25.561'], 'Knee pain evaluation', '2024-07-10', '2024-07-10', 'routine', 'pending', 'user-001', NOW()),
('auth-004', 'Aisha Rahman', '1992-01-30', 'MEM004', 'payer-004', 'Cigna', 'Dr. Brown', '5566778899', ARRAY['99215'], ARRAY['F32.9'], 'Depression evaluation and treatment', '2024-07-15', '2024-07-15', 'urgent', 'denied', 'user-001', NOW());

-- Insert collection activities
INSERT INTO collection_activities (id, collection_account_id, activity_type, contact_method, notes, outcome, amount_discussed, promise_to_pay_date, performed_by, user_id, created_at) VALUES
('act-001', 'col-001', 'phone_call', 'phone', 'Called patient to discuss payment options', 'Patient agreed to payment plan', 450.00, '2024-07-15', 'John Smith', 'user-001', NOW()),
('act-002', 'col-002', 'email_sent', 'email', 'Sent payment reminder email', 'No response', NULL, NULL, 'System', 'user-001', NOW()),
('act-003', 'col-003', 'phone_call', 'phone', 'Patient requested auto-pay setup', 'Auto-pay setup in progress', 89.25, '2024-07-01', 'Sarah Johnson', 'user-001', NOW()),
('act-004', 'col-004', 'letter_sent', 'mail', 'Sent final notice letter', 'Patient disputes charges', NULL, NULL, 'System', 'user-001', NOW()),
('act-005', 'col-005', 'phone_call', 'phone', 'Patient made partial payment', 'Payment received', 200.00, '2024-07-20', 'Mike Davis', 'user-001', NOW());

-- Insert payment plans
INSERT INTO payment_plans (id, statement_id, total_amount, monthly_payment, number_of_payments, start_date, end_date, remaining_balance, status, auto_pay, user_id, created_at) VALUES
('plan-001', 'stmt-001', 450.00, 75.00, 6, '2024-07-01', '2024-12-01', 450.00, 'active', true, 'user-001', NOW()),
('plan-002', 'stmt-002', 1275.80, 150.00, 9, '2024-07-01', '2024-03-01', 1275.80, 'active', false, 'user-001', NOW()),
('plan-003', 'stmt-003', 89.25, 89.25, 1, '2024-07-01', '2024-07-01', 89.25, 'completed', true, 'user-001', NOW());

-- Insert payment installments
INSERT INTO payment_installments (id, payment_plan_id, installment_number, amount, due_date, status, payment_method, paid_amount, paid_date, notes, created_at) VALUES
('inst-001', 'plan-001', 1, 75.00, '2024-07-01', 'paid', 'auto_pay', 75.00, '2024-07-01', 'First installment paid', NOW()),
('inst-002', 'plan-001', 2, 75.00, '2024-08-01', 'pending', 'auto_pay', NULL, NULL, 'Next payment due', NOW()),
('inst-003', 'plan-002', 1, 150.00, '2024-07-01', 'paid', 'credit_card', 150.00, '2024-07-01', 'First installment paid', NOW()),
('inst-004', 'plan-002', 2, 150.00, '2024-08-01', 'pending', 'manual', NULL, NULL, 'Next payment due', NOW());

-- Insert patient communication preferences
INSERT INTO patient_communication_preferences (id, patient_id, patient_name, patient_email, patient_phone, preferred_channel, email_enabled, sms_enabled, paper_enabled, portal_enabled, user_id, created_at) VALUES
('pref-001', 'PAT-001', 'Ahmad Hassan', 'ahmad.hassan@email.com', '(555) 123-4567', 'email', true, false, false, true, 'user-001', NOW()),
('pref-002', 'PAT-002', 'Fatima Al-Zahra', 'fatima.alzahra@email.com', '(555) 234-5678', 'email', true, true, false, true, 'user-001', NOW()),
('pref-003', 'PAT-003', 'Omar Abdullah', 'omar.abdullah@email.com', '(555) 345-6789', 'portal', true, true, false, true, 'user-001', NOW()),
('pref-004', 'PAT-004', 'Aisha Rahman', 'aisha.rahman@email.com', '(555) 456-7890', 'paper', false, false, true, false, 'user-001', NOW()),
('pref-005', 'PAT-005', 'Yusuf Ibrahim', 'yusuf.ibrahim@email.com', '(555) 567-8901', 'email', true, true, false, true, 'user-001', NOW()),
('pref-006', 'PAT-006', 'Zainab Ali', 'zainab.ali@email.com', '(555) 678-9012', 'sms', false, true, false, true, 'user-001', NOW());

-- Insert chat conversations
INSERT INTO chat_conversations (id, patient_id, patient_name, status, started_at, ended_at, user_id, created_at) VALUES
('chat-001', 'PAT-001', 'Ahmad Hassan', 'active', NOW(), NULL, 'user-001', NOW()),
('chat-002', 'PAT-002', 'Fatima Al-Zahra', 'resolved', '2024-06-15 10:30:00', '2024-06-15 11:15:00', 'user-001', NOW()),
('chat-003', 'PAT-003', 'Omar Abdullah', 'active', NOW(), NULL, 'user-001', NOW());

-- Insert chat messages
INSERT INTO chat_messages (id, conversation_id, message, is_ai, sender_name, created_at) VALUES
('msg-001', 'chat-001', 'Hello, I have a question about my bill', false, 'Ahmad Hassan', NOW()),
('msg-002', 'chat-001', 'Hello Ahmad! I''m here to help with your billing questions. What would you like to know?', true, 'AI Assistant', NOW()),
('msg-003', 'chat-002', 'I need help setting up a payment plan', false, 'Fatima Al-Zahra', '2024-06-15 10:30:00'),
('msg-004', 'chat-002', 'I can help you set up a payment plan. Let me check your account details.', true, 'AI Assistant', '2024-06-15 10:31:00'),
('msg-005', 'chat-003', 'When will my payment be processed?', false, 'Omar Abdullah', NOW()),
('msg-006', 'chat-003', 'Your payment should be processed within 2-3 business days. I can check the status for you.', true, 'AI Assistant', NOW());