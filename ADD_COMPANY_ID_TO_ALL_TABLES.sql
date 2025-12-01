-- ============================================================================
-- ADD COMPANY_ID TO ALL EXISTING TABLES
-- ============================================================================
-- This script adds company_id column to all existing tables for multi-tenancy
-- Run this AFTER creating the companies table
-- ============================================================================

-- ============================================================================
-- PATIENT MANAGEMENT TABLES
-- ============================================================================

-- Patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_patients_company_id ON patients(company_id);

-- Patient Insurance
ALTER TABLE patient_insurance ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_patient_insurance_company_id ON patient_insurance(company_id);

-- Patient Medical History
ALTER TABLE patient_medical_history ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_patient_medical_history_company_id ON patient_medical_history(company_id);

-- Patient Vital Signs
ALTER TABLE patient_vital_signs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_patient_vital_signs_company_id ON patient_vital_signs(company_id);

-- Patient Progress Notes
ALTER TABLE patient_progress_notes ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_patient_progress_notes_company_id ON patient_progress_notes(company_id);

-- Patient Treatment Plans
ALTER TABLE patient_treatment_plans ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_patient_treatment_plans_company_id ON patient_treatment_plans(company_id);

-- Patient Documents
ALTER TABLE patient_documents ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_patient_documents_company_id ON patient_documents(company_id);

-- Patient Messages
ALTER TABLE patient_messages ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_patient_messages_company_id ON patient_messages(company_id);

-- ============================================================================
-- CLAIMS MANAGEMENT TABLES
-- ============================================================================

-- Professional Claims
ALTER TABLE professional_claims ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_professional_claims_company_id ON professional_claims(company_id);

-- Institutional Claims
ALTER TABLE institutional_claims ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_institutional_claims_company_id ON institutional_claims(company_id);

-- Claim Procedures
ALTER TABLE claim_procedures ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_claim_procedures_company_id ON claim_procedures(company_id);

-- Claim Diagnoses
ALTER TABLE claim_diagnoses ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_claim_diagnoses_company_id ON claim_diagnoses(company_id);

-- Claim Denials
ALTER TABLE claim_denials ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_claim_denials_company_id ON claim_denials(company_id);

-- ============================================================================
-- AUTHORIZATION TABLES
-- ============================================================================

-- Authorization Requests
ALTER TABLE authorization_requests ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_authorization_requests_company_id ON authorization_requests(company_id);

-- Authorization Tasks
ALTER TABLE authorization_tasks ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_authorization_tasks_company_id ON authorization_tasks(company_id);

-- Authorization Task History
ALTER TABLE authorization_task_history ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_authorization_task_history_company_id ON authorization_task_history(company_id);

-- Authorization Task Comments
ALTER TABLE authorization_task_comments ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_authorization_task_comments_company_id ON authorization_task_comments(company_id);

-- Authorization Audit Logs
ALTER TABLE authorization_audit_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_authorization_audit_logs_company_id ON authorization_audit_logs(company_id);

-- ============================================================================
-- BILLING TABLES
-- ============================================================================

-- Billing Statements
ALTER TABLE billing_statements ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_billing_statements_company_id ON billing_statements(company_id);

-- Payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_payments_company_id ON payments(company_id);

-- Payment Plans
ALTER TABLE payment_plans ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_payment_plans_company_id ON payment_plans(company_id);

-- Payment Installments
ALTER TABLE payment_installments ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_payment_installments_company_id ON payment_installments(company_id);

-- Payment Reminders
ALTER TABLE payment_reminders ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_payment_reminders_company_id ON payment_reminders(company_id);

-- ============================================================================
-- COLLECTIONS TABLES
-- ============================================================================

-- Collections Accounts
ALTER TABLE collections_accounts ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_collections_accounts_company_id ON collections_accounts(company_id);

-- Collection Activities
ALTER TABLE collection_activities ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_collection_activities_company_id ON collection_activities(company_id);

-- Collection Letters
ALTER TABLE collection_letters ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_collection_letters_company_id ON collection_letters(company_id);

-- Settlement Offers
ALTER TABLE settlement_offers ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_settlement_offers_company_id ON settlement_offers(company_id);

-- Attorney Referrals
ALTER TABLE attorney_referrals ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_attorney_referrals_company_id ON attorney_referrals(company_id);

-- Dispute Claims
ALTER TABLE dispute_claims ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_dispute_claims_company_id ON dispute_claims(company_id);

-- ============================================================================
-- SCHEDULING TABLES
-- ============================================================================

-- Appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_appointments_company_id ON appointments(company_id);

-- ============================================================================
-- PROVIDER & FACILITY TABLES
-- ============================================================================

-- Providers
ALTER TABLE providers ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_providers_company_id ON providers(company_id);

-- Facilities
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_facilities_company_id ON facilities(company_id);

-- Practices
ALTER TABLE practices ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_practices_company_id ON practices(company_id);

-- Referring Providers
ALTER TABLE referring_providers ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_referring_providers_company_id ON referring_providers(company_id);

-- ============================================================================
-- INSURANCE & PAYER TABLES
-- ============================================================================

-- Insurance Payers (shared across companies, but can be customized)
ALTER TABLE insurance_payers ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_insurance_payers_company_id ON insurance_payers(company_id);

-- Payer Agreements
ALTER TABLE payer_agreements ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_payer_agreements_company_id ON payer_agreements(company_id);

-- ============================================================================
-- ELIGIBILITY TABLES
-- ============================================================================

-- Eligibility Verifications
ALTER TABLE eligibility_verifications ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_eligibility_verifications_company_id ON eligibility_verifications(company_id);

-- Eligibility Audit Logs
ALTER TABLE eligibility_audit_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_eligibility_audit_logs_company_id ON eligibility_audit_logs(company_id);

-- ============================================================================
-- OTHER TABLES
-- ============================================================================

-- Superbills
ALTER TABLE superbills ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_superbills_company_id ON superbills(company_id);

-- Collection Agencies
ALTER TABLE collection_agencies ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_collection_agencies_company_id ON collection_agencies(company_id);

-- Billing Cycles
ALTER TABLE billing_cycles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_billing_cycles_company_id ON billing_cycles(company_id);

-- Patient Communication Preferences
ALTER TABLE patient_communication_preferences ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_patient_communication_preferences_company_id ON patient_communication_preferences(company_id);

-- Chat Conversations
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_company_id ON chat_conversations(company_id);

-- Chat Messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_chat_messages_company_id ON chat_messages(company_id);

-- Audit Logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);

-- ============================================================================
-- UPDATE EXISTING DATA (Optional - for migration)
-- ============================================================================
-- If you have existing data, you may want to assign it to a default company
-- Uncomment and modify as needed:

-- UPDATE patients SET company_id = (SELECT id FROM companies LIMIT 1) WHERE company_id IS NULL;
-- UPDATE professional_claims SET company_id = (SELECT id FROM companies LIMIT 1) WHERE company_id IS NULL;
-- ... (repeat for all tables)

-- ============================================================================
-- COMPLETE
-- ============================================================================

