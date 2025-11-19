-- ============================================================================
-- FIXED COMPLETE SUPABASE DATABASE SCHEMA FOR BILLWISE AI NEXUS
-- ============================================================================
-- This is a corrected version that handles all errors gracefully
-- Execute this script in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE ENUMS (Must be done first)
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('patient', 'billing_staff', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE attorney_referral_status AS ENUM (
        'pending', 'accepted', 'in_progress', 'judgment_obtained', 
        'collecting', 'closed', 'returned'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE billing_frequency AS ENUM ('weekly', 'bi_weekly', 'monthly', 'quarterly');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE chat_status AS ENUM ('active', 'resolved', 'escalated', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE collection_activity_type AS ENUM (
        'phone_call', 'email_sent', 'letter_sent', 'dispute_received',
        'promise_to_pay', 'partial_payment', 'settlement_offer', 'note_added'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE collection_stage AS ENUM (
        'early_collection', 'mid_collection', 'late_collection', 'pre_legal'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE collection_status AS ENUM (
        'active', 'payment_plan', 'settled', 'attorney_referral', 'closed', 'dispute'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE communication_channel AS ENUM ('email', 'sms', 'paper', 'portal');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE contact_method AS ENUM ('phone', 'email', 'mail', 'sms', 'in_person');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE dispute_status AS ENUM (
        'open', 'investigating', 'resolved_patient_favor',
        'resolved_practice_favor', 'closed'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE letter_type AS ENUM (
        'initial_notice', 'second_notice', 'final_notice',
        'pre_legal_notice', 'cease_communication', 'settlement_agreement'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE settlement_status AS ENUM (
        'pending', 'accepted', 'rejected', 'expired', 'completed'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE statement_status AS ENUM (
        'pending', 'sent', 'delivered', 'failed', 'viewed', 'paid'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE prior_auth_status AS ENUM (
        'not_started', 'request_submitted', 'under_review',
        'additional_info_requested', 'approved', 'denied', 'expired', 'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE eligibility_status AS ENUM ('pending', 'verified', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- STEP 2: CREATE CORE TABLES
-- ============================================================================

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'billing_staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Facilities Table
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Providers Table
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npi VARCHAR(10) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_initial VARCHAR(1),
    title VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    specialty VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance Payers Table
CREATE TABLE IF NOT EXISTS insurance_payers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    payer_id_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collections Accounts Table
CREATE TABLE IF NOT EXISTS collections_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id VARCHAR(100),
    patient_name VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255),
    patient_phone VARCHAR(20),
    current_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
    original_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
    days_overdue INTEGER DEFAULT 0,
    collection_stage collection_stage DEFAULT 'early_collection',
    collection_status collection_status DEFAULT 'active',
    assigned_to VARCHAR(255),
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_action_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection Activities Table
CREATE TABLE IF NOT EXISTS collection_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_account_id UUID NOT NULL REFERENCES collections_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type collection_activity_type NOT NULL,
    contact_method contact_method,
    notes TEXT,
    outcome TEXT,
    amount_discussed NUMERIC(10, 2),
    promise_to_pay_date TIMESTAMP WITH TIME ZONE,
    performed_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection Letters Table
CREATE TABLE IF NOT EXISTS collection_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_account_id UUID NOT NULL REFERENCES collections_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    letter_type letter_type NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    sent_date DATE NOT NULL,
    pdf_url TEXT,
    delivery_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settlement Offers Table
CREATE TABLE IF NOT EXISTS settlement_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_account_id UUID NOT NULL REFERENCES collections_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_amount NUMERIC(10, 2) NOT NULL,
    offer_amount NUMERIC(10, 2) NOT NULL,
    offer_percentage NUMERIC(5, 2) NOT NULL,
    expiration_date DATE NOT NULL,
    payment_terms TEXT,
    settlement_status settlement_status DEFAULT 'pending',
    accepted_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attorney Referrals Table
CREATE TABLE IF NOT EXISTS attorney_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_account_id UUID NOT NULL REFERENCES collections_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    attorney_firm VARCHAR(255) NOT NULL,
    attorney_contact VARCHAR(255),
    attorney_phone VARCHAR(20),
    attorney_email VARCHAR(255),
    referral_date DATE NOT NULL,
    referral_amount NUMERIC(10, 2) NOT NULL,
    account_balance_at_referral NUMERIC(10, 2) NOT NULL,
    case_number VARCHAR(100),
    referral_status attorney_referral_status DEFAULT 'pending',
    expected_action TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dispute Claims Table
CREATE TABLE IF NOT EXISTS dispute_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_account_id UUID NOT NULL REFERENCES collections_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dispute_date DATE NOT NULL,
    dispute_reason TEXT NOT NULL,
    dispute_status dispute_status DEFAULT 'open',
    supporting_documents TEXT[],
    resolution_date DATE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing Statements Table
CREATE TABLE IF NOT EXISTS billing_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    patient_id VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    statement_date DATE NOT NULL,
    amount_due NUMERIC(10, 2) NOT NULL,
    due_date DATE,
    status statement_status DEFAULT 'pending',
    channel communication_channel,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    pdf_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Plans Table
CREATE TABLE IF NOT EXISTS payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    statement_id UUID, -- Foreign key added later
    total_amount NUMERIC(10, 2) NOT NULL,
    remaining_balance NUMERIC(10, 2) NOT NULL,
    monthly_payment NUMERIC(10, 2) NOT NULL,
    number_of_payments INTEGER NOT NULL,
    payments_completed INTEGER DEFAULT 0,
    down_payment NUMERIC(10, 2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_pay BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Installments Table
CREATE TABLE IF NOT EXISTS payment_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_amount NUMERIC(10, 2),
    paid_date DATE,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Reminders Table
CREATE TABLE IF NOT EXISTS payment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_id UUID, -- Foreign key added later
    patient_id VARCHAR(255) NOT NULL,
    reminder_type VARCHAR(50) NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    channel communication_channel NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    status statement_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Communication Preferences Table
CREATE TABLE IF NOT EXISTS patient_communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    patient_id VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255),
    patient_phone VARCHAR(20),
    preferred_channel communication_channel NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    paper_enabled BOOLEAN DEFAULT true,
    portal_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Authorization Requests Table
CREATE TABLE IF NOT EXISTS authorization_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    patient_dob DATE,
    patient_member_id VARCHAR(100),
    payer_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
    payer_name_custom VARCHAR(255),
    provider_name_custom VARCHAR(255),
    provider_npi_custom VARCHAR(10),
    service_start_date DATE,
    service_end_date DATE,
    service_type VARCHAR(100),
    procedure_codes TEXT[],
    diagnosis_codes TEXT[],
    units_requested INTEGER,
    clinical_indication TEXT,
    urgency_level VARCHAR(50),
    pa_required BOOLEAN,
    status VARCHAR(50),
    review_status VARCHAR(50),
    ack_status VARCHAR(50),
    auth_number VARCHAR(100),
    submission_ref VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Authorization Events Table
CREATE TABLE IF NOT EXISTS authorization_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authorization_request_id UUID NOT NULL REFERENCES authorization_requests(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Approval Suggestions Table
CREATE TABLE IF NOT EXISTS ai_approval_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authorization_request_id UUID NOT NULL REFERENCES authorization_requests(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100) NOT NULL,
    score NUMERIC(5, 2),
    suggestions JSONB,
    missing_elements TEXT[],
    recommended_actions TEXT[],
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing Cycles Table
CREATE TABLE IF NOT EXISTS billing_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    frequency billing_frequency NOT NULL,
    day_of_cycle INTEGER NOT NULL,
    reminder_days INTEGER[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Conversations Table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    patient_id VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    status chat_status DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    escalated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sender_name VARCHAR(255),
    is_ai BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eligibility Verifications Table
CREATE TABLE IF NOT EXISTS eligibility_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    serial_no VARCHAR(100) UNIQUE,
    description TEXT,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    provider_name VARCHAR(255),
    npp_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    npp_name VARCHAR(255),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    appointment_location VARCHAR(255),
    appointment_date DATE,
    date_of_service DATE,
    demographic VARCHAR(50),
    type_of_visit VARCHAR(100),
    service_type VARCHAR(100),
    status eligibility_status DEFAULT 'pending',
    is_self_pay BOOLEAN DEFAULT false,
    patient_id VARCHAR(100),
    patient_name VARCHAR(255),
    patient_dob DATE,
    patient_gender VARCHAR(20),
    patient_address TEXT,
    patient_city VARCHAR(100),
    patient_state VARCHAR(50),
    patient_zip VARCHAR(20),
    patient_phone VARCHAR(20),
    subscriber_is_patient BOOLEAN DEFAULT true,
    subscriber_id VARCHAR(100),
    subscriber_first_name VARCHAR(100),
    subscriber_last_name VARCHAR(100),
    subscriber_middle_initial VARCHAR(1),
    subscriber_dob DATE,
    subscriber_gender VARCHAR(20),
    subscriber_relationship VARCHAR(50),
    subscriber_address TEXT,
    subscriber_city VARCHAR(100),
    subscriber_state VARCHAR(50),
    subscriber_zip VARCHAR(20),
    primary_insurance_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
    primary_insurance_name VARCHAR(255),
    insurance_id VARCHAR(100),
    group_number VARCHAR(50),
    insurance_plan VARCHAR(255),
    plan_type VARCHAR(50),
    effective_date DATE,
    termination_date DATE,
    copay NUMERIC(10, 2),
    coinsurance NUMERIC(5, 2),
    deductible NUMERIC(10, 2),
    deductible_met NUMERIC(10, 2),
    out_of_pocket_remaining NUMERIC(10, 2),
    out_of_pocket_max NUMERIC(10, 2),
    in_network_status VARCHAR(50),
    allowed_amount NUMERIC(10, 2),
    copay_before_deductible BOOLEAN DEFAULT true,
    deductible_status VARCHAR(20),
    deductible_amount NUMERIC(10, 2),
    cpt_codes JSONB DEFAULT '[]'::jsonb,
    icd_codes JSONB DEFAULT '[]'::jsonb,
    secondary_insurance_name VARCHAR(255),
    secondary_insurance_coverage VARCHAR(255),
    secondary_insurance_id VARCHAR(100),
    secondary_group_number VARCHAR(50),
    secondary_relationship_code VARCHAR(50),
    secondary_effective_date DATE,
    secondary_termination_date DATE,
    secondary_subscriber_first_name VARCHAR(100),
    secondary_subscriber_last_name VARCHAR(100),
    secondary_subscriber_dob DATE,
    secondary_subscriber_gender VARCHAR(20),
    secondary_copay NUMERIC(10, 2),
    secondary_deductible NUMERIC(10, 2),
    secondary_deductible_met NUMERIC(10, 2),
    secondary_coinsurance NUMERIC(5, 2),
    cob_rule VARCHAR(100),
    cob_indicator VARCHAR(1),
    referral_required BOOLEAN DEFAULT false,
    referral_obtained_from VARCHAR(100),
    referral_pcp_status VARCHAR(50),
    referral_number VARCHAR(100),
    pre_authorization_required BOOLEAN DEFAULT false,
    prior_auth_number VARCHAR(100),
    prior_auth_status prior_auth_status,
    prior_auth_request_date DATE,
    prior_auth_submission_date DATE,
    prior_auth_submission_method VARCHAR(50),
    prior_auth_payer_confirmation_number VARCHAR(100),
    prior_auth_expected_response_date DATE,
    prior_auth_response_date DATE,
    prior_auth_effective_date DATE,
    prior_auth_expiration_date DATE,
    prior_auth_denial_reason_code VARCHAR(50),
    prior_auth_denial_reason TEXT,
    prior_auth_approved_quantity INTEGER,
    prior_auth_approved_frequency VARCHAR(50),
    prior_auth_service_date DATE,
    prior_auth_appeal_submitted BOOLEAN DEFAULT false,
    prior_auth_appeal_date DATE,
    prior_auth_appeal_status VARCHAR(50),
    prior_auth_appeal_decision_date DATE,
    previous_balance_credit NUMERIC(10, 2),
    patient_responsibility NUMERIC(10, 2),
    collection_amount NUMERIC(10, 2),
    estimated_cost NUMERIC(10, 2),
    billed_amount NUMERIC(10, 2),
    is_qmb BOOLEAN DEFAULT false,
    is_covered_service BOOLEAN DEFAULT true,
    primary_payment NUMERIC(10, 2),
    secondary_payment NUMERIC(10, 2),
    primary_coverage_percent NUMERIC(5, 2),
    secondary_coverage_percent NUMERIC(5, 2),
    remarks TEXT,
    date_checked DATE DEFAULT CURRENT_DATE,
    verified_by VARCHAR(255),
    verification_method VARCHAR(50) DEFAULT 'manual',
    demographic_changes_made BOOLEAN DEFAULT false,
    qa BOOLEAN DEFAULT false,
    is_eligible BOOLEAN,
    verification_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration Events Table
CREATE TABLE IF NOT EXISTS collaboration_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: ADD FOREIGN KEY CONSTRAINTS (After all tables exist)
-- ============================================================================

DO $$ 
BEGIN
    -- Add foreign key for payment_plans.statement_id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_statements') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_plans')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_plans' AND column_name = 'statement_id')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_plans_statement_id_fkey') THEN
        ALTER TABLE payment_plans 
        ADD CONSTRAINT payment_plans_statement_id_fkey 
        FOREIGN KEY (statement_id) 
        REFERENCES billing_statements(id) 
        ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key: payment_plans.statement_id';
    END IF;
    
    -- Add foreign key for payment_reminders.statement_id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_statements') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_reminders')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_reminders' AND column_name = 'statement_id')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_reminders_statement_id_fkey') THEN
        ALTER TABLE payment_reminders 
        ADD CONSTRAINT payment_reminders_statement_id_fkey 
        FOREIGN KEY (statement_id) 
        REFERENCES billing_statements(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key: payment_reminders.statement_id';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: CREATE INDEXES
-- ============================================================================

DO $$ 
BEGIN
    -- Collections Accounts Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collections_accounts') THEN
        CREATE INDEX IF NOT EXISTS idx_collections_accounts_user_id ON collections_accounts(user_id);
        CREATE INDEX IF NOT EXISTS idx_collections_accounts_patient_id ON collections_accounts(patient_id);
        CREATE INDEX IF NOT EXISTS idx_collections_accounts_status ON collections_accounts(collection_status);
        CREATE INDEX IF NOT EXISTS idx_collections_accounts_stage ON collections_accounts(collection_stage);
    END IF;
    
    -- Collection Activities Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collection_activities') THEN
        CREATE INDEX IF NOT EXISTS idx_collection_activities_account_id ON collection_activities(collection_account_id);
        CREATE INDEX IF NOT EXISTS idx_collection_activities_user_id ON collection_activities(user_id);
        CREATE INDEX IF NOT EXISTS idx_collection_activities_created_at ON collection_activities(created_at);
    END IF;
    
    -- Billing Statements Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_statements') THEN
        CREATE INDEX IF NOT EXISTS idx_billing_statements_patient_id ON billing_statements(patient_id);
        CREATE INDEX IF NOT EXISTS idx_billing_statements_status ON billing_statements(status);
        CREATE INDEX IF NOT EXISTS idx_billing_statements_statement_date ON billing_statements(statement_date);
    END IF;
    
    -- Payment Plans Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_plans') THEN
        CREATE INDEX IF NOT EXISTS idx_payment_plans_user_id ON payment_plans(user_id);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_plans' AND column_name = 'statement_id') THEN
            CREATE INDEX IF NOT EXISTS idx_payment_plans_statement_id ON payment_plans(statement_id);
        END IF;
    END IF;
    
    -- Payment Installments Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_installments') THEN
        CREATE INDEX IF NOT EXISTS idx_payment_installments_plan_id ON payment_installments(payment_plan_id);
        CREATE INDEX IF NOT EXISTS idx_payment_installments_due_date ON payment_installments(due_date);
    END IF;
    
    -- Payment Reminders Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_reminders') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_reminders' AND column_name = 'statement_id') THEN
            CREATE INDEX IF NOT EXISTS idx_payment_reminders_statement_id ON payment_reminders(statement_id);
        END IF;
    END IF;
    
    -- Authorization Requests Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'authorization_requests') THEN
        CREATE INDEX IF NOT EXISTS idx_authorization_requests_user_id ON authorization_requests(user_id);
        CREATE INDEX IF NOT EXISTS idx_authorization_requests_payer_id ON authorization_requests(payer_id);
        CREATE INDEX IF NOT EXISTS idx_authorization_requests_status ON authorization_requests(status);
    END IF;
    
    -- Eligibility Verifications Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'eligibility_verifications') THEN
        CREATE INDEX IF NOT EXISTS idx_eligibility_verifications_user_id ON eligibility_verifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_eligibility_verifications_patient_id ON eligibility_verifications(patient_id);
        CREATE INDEX IF NOT EXISTS idx_eligibility_verifications_serial_no ON eligibility_verifications(serial_no);
        CREATE INDEX IF NOT EXISTS idx_eligibility_verifications_status ON eligibility_verifications(status);
        CREATE INDEX IF NOT EXISTS idx_eligibility_verifications_appointment_date ON eligibility_verifications(appointment_date);
    END IF;
    
    -- Facilities Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'facilities') THEN
        CREATE INDEX IF NOT EXISTS idx_facilities_status ON facilities(status);
    END IF;
    
    -- Providers Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers') THEN
        CREATE INDEX IF NOT EXISTS idx_providers_npi ON providers(npi);
        CREATE INDEX IF NOT EXISTS idx_providers_is_active ON providers(is_active);
    END IF;
    
    -- Insurance Payers Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_payers') THEN
        CREATE INDEX IF NOT EXISTS idx_insurance_payers_is_active ON insurance_payers(is_active);
    END IF;
    
    -- Chat Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
        CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_conversations') THEN
        CREATE INDEX IF NOT EXISTS idx_chat_conversations_patient_id ON chat_conversations(patient_id);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating indexes: %', SQLERRM;
END $$;

-- ============================================================================
-- STEP 5: CREATE FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 6: CREATE TRIGGERS
-- ============================================================================

DO $$ 
DECLARE
    trigger_tables TEXT[] := ARRAY[
        'profiles', 'facilities', 'providers', 'insurance_payers',
        'collections_accounts', 'billing_statements', 'payment_plans',
        'eligibility_verifications'
    ];
    tbl_name TEXT;
BEGIN
    FOREACH tbl_name IN ARRAY trigger_tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name) THEN
            EXECUTE format('
                DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
                CREATE TRIGGER update_%I_updated_at 
                BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            ', tbl_name, tbl_name, tbl_name, tbl_name);
        END IF;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating triggers: %', SQLERRM;
END $$;

-- ============================================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- ============================================================================

DO $$ 
DECLARE
    table_name_list TEXT[] := ARRAY[
        'profiles', 'user_roles', 'facilities', 'providers', 'insurance_payers',
        'collections_accounts', 'collection_activities', 'collection_letters',
        'settlement_offers', 'attorney_referrals', 'dispute_claims',
        'billing_statements', 'payment_plans', 'payment_installments',
        'payment_reminders', 'patient_communication_preferences',
        'authorization_requests', 'authorization_events', 'ai_approval_suggestions',
        'billing_cycles', 'chat_conversations', 'chat_messages',
        'eligibility_verifications', 'audit_logs', 'collaboration_events'
    ];
    tbl_name TEXT;
BEGIN
    FOREACH tbl_name IN ARRAY table_name_list
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl_name);
        END IF;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error enabling RLS: %', SQLERRM;
END $$;

-- ============================================================================
-- STEP 8: INSERT DUMMY DATA
-- ============================================================================

-- Insert Facilities
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'facilities') THEN
        INSERT INTO facilities (name, status, address, city, state, zip, phone) VALUES
        ('Main Clinic', 'active', '123 Medical Center Dr', 'Springfield', 'IL', '62701', '217-555-0100'),
        ('Downtown Office', 'active', '456 Main Street', 'Springfield', 'IL', '62702', '217-555-0101'),
        ('Westside Branch', 'active', '789 Oak Avenue', 'Springfield', 'IL', '62703', '217-555-0102'),
        ('Northside Medical', 'active', '321 Elm Street', 'Springfield', 'IL', '62704', '217-555-0103'),
        ('Riverside Clinic', 'active', '654 River Road', 'Springfield', 'IL', '62705', '217-555-0104')
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Inserted facilities';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting facilities: %', SQLERRM;
END $$;

-- Insert Providers
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers') THEN
        INSERT INTO providers (npi, first_name, last_name, title, is_active, specialty, phone, email) VALUES
        ('1234567890', 'John', 'Smith', 'MD', true, 'Internal Medicine', '217-555-0200', 'john.smith@clinic.com'),
        ('9876543210', 'Sarah', 'Johnson', 'PA-C', true, 'Family Medicine', '217-555-0201', 'sarah.johnson@clinic.com'),
        ('8765432109', 'Michael', 'Brown', 'NP', true, 'Pediatrics', '217-555-0202', 'michael.brown@clinic.com'),
        ('7654321098', 'Emily', 'Davis', 'PA', true, 'Cardiology', '217-555-0203', 'emily.davis@clinic.com'),
        ('6543210987', 'Robert', 'Wilson', 'MD', true, 'Orthopedics', '217-555-0204', 'robert.wilson@clinic.com'),
        ('5432109876', 'Jennifer', 'Martinez', 'DO', true, 'Family Medicine', '217-555-0205', 'jennifer.martinez@clinic.com')
        ON CONFLICT (npi) DO NOTHING;
        RAISE NOTICE 'Inserted providers';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting providers: %', SQLERRM;
END $$;

-- Insert Insurance Payers
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_payers') THEN
        INSERT INTO insurance_payers (name, payer_id_code, is_active, phone) VALUES
        ('Blue Cross Blue Shield', 'BCBS', true, '800-555-1000'),
        ('Aetna', 'AETNA', true, '800-555-1001'),
        ('UnitedHealthcare', 'UHC', true, '800-555-1002'),
        ('Cigna', 'CIGNA', true, '800-555-1003'),
        ('Medicare', 'MEDICARE', true, '800-555-1004'),
        ('Medicaid', 'MEDICAID', true, '800-555-1005'),
        ('Humana', 'HUMANA', true, '800-555-1006'),
        ('Anthem', 'ANTHEM', true, '800-555-1007')
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Inserted insurance payers';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting insurance_payers: %', SQLERRM;
END $$;

-- Insert Billing Cycles
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_cycles') THEN
        INSERT INTO billing_cycles (name, frequency, day_of_cycle, reminder_days, is_active) VALUES
        ('Monthly Cycle', 'monthly', 1, ARRAY[7, 3, 1], true),
        ('Bi-weekly Cycle', 'bi_weekly', 1, ARRAY[5, 2], true),
        ('Weekly Cycle', 'weekly', 1, ARRAY[3, 1], true)
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Inserted billing cycles';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting billing_cycles: %', SQLERRM;
END $$;

-- ============================================================================
-- STEP 9: GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '   1. Run COMPLETE_DATABASE_SCHEMA_ADDITIONS.sql to add remaining tables';
    RAISE NOTICE '   2. Verify all tables were created';
    RAISE NOTICE '   3. Customize RLS policies based on your security needs';
    RAISE NOTICE '   4. Add more dummy data as needed';
END $$;

