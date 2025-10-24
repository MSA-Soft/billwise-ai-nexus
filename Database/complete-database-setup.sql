-- Complete Database Setup for BillWise AI Nexus
-- This script creates all tables, relationships, and sample data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('patient', 'billing_staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE collection_stage AS ENUM ('early_collection', 'mid_collection', 'late_collection', 'pre_legal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE collection_status AS ENUM ('active', 'payment_plan', 'settled', 'attorney_referral', 'closed', 'dispute');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE collection_activity_type AS ENUM ('phone_call', 'email_sent', 'letter_sent', 'dispute_received', 'promise_to_pay', 'partial_payment', 'settlement_offer', 'note_added');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contact_method AS ENUM ('phone', 'email', 'mail', 'sms', 'in_person');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE communication_channel AS ENUM ('email', 'sms', 'paper', 'portal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE statement_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'viewed', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_frequency AS ENUM ('weekly', 'bi_weekly', 'monthly', 'quarterly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'billing_staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections_accounts table
CREATE TABLE IF NOT EXISTS collections_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name TEXT NOT NULL,
    patient_id TEXT,
    patient_email TEXT,
    patient_phone TEXT,
    current_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    original_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    days_overdue INTEGER DEFAULT 0,
    collection_stage collection_stage NOT NULL DEFAULT 'early_collection',
    collection_status collection_status NOT NULL DEFAULT 'active',
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_action_date TIMESTAMP WITH TIME ZONE,
    assigned_to TEXT,
    notes TEXT,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collection_activities table
CREATE TABLE IF NOT EXISTS collection_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_account_id UUID NOT NULL REFERENCES collections_accounts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    activity_type collection_activity_type NOT NULL,
    contact_method contact_method,
    outcome TEXT,
    notes TEXT,
    promise_to_pay_date DATE,
    amount_discussed DECIMAL(10,2),
    performed_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing_statements table
CREATE TABLE IF NOT EXISTS billing_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    amount_due DECIMAL(10,2) NOT NULL,
    statement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status statement_status DEFAULT 'pending',
    channel communication_channel,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    pdf_url TEXT,
    error_message TEXT,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create authorization_requests table
CREATE TABLE IF NOT EXISTS authorization_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name TEXT NOT NULL,
    patient_dob DATE,
    patient_member_id TEXT,
    payer_id TEXT,
    payer_name_custom TEXT,
    provider_name_custom TEXT,
    provider_npi_custom TEXT,
    service_type TEXT,
    service_start_date DATE,
    service_end_date DATE,
    procedure_codes TEXT[],
    diagnosis_codes TEXT[],
    clinical_indication TEXT,
    urgency_level TEXT,
    units_requested INTEGER,
    status TEXT,
    review_status TEXT,
    auth_number TEXT,
    ack_status TEXT,
    submission_ref TEXT,
    pa_required BOOLEAN,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_plans table
CREATE TABLE IF NOT EXISTS payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_id UUID REFERENCES billing_statements(id),
    user_id UUID REFERENCES profiles(id),
    total_amount DECIMAL(10,2) NOT NULL,
    monthly_payment DECIMAL(10,2) NOT NULL,
    number_of_payments INTEGER NOT NULL,
    payments_completed INTEGER DEFAULT 0,
    remaining_balance DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    down_payment DECIMAL(10,2),
    auto_pay BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_installments table
CREATE TABLE IF NOT EXISTS payment_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_amount DECIMAL(10,2),
    paid_date DATE,
    payment_method TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insurance_payers table
CREATE TABLE IF NOT EXISTS insurance_payers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    payer_id_code TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing_cycles table
CREATE TABLE IF NOT EXISTS billing_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    frequency billing_frequency NOT NULL,
    day_of_cycle INTEGER NOT NULL,
    reminder_days INTEGER[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_accounts_patient_name ON collections_accounts(patient_name);
CREATE INDEX IF NOT EXISTS idx_collections_accounts_collection_stage ON collections_accounts(collection_stage);
CREATE INDEX IF NOT EXISTS idx_collections_accounts_collection_status ON collections_accounts(collection_status);
CREATE INDEX IF NOT EXISTS idx_collections_accounts_user_id ON collections_accounts(user_id);

CREATE INDEX IF NOT EXISTS idx_collection_activities_account_id ON collection_activities(collection_account_id);
CREATE INDEX IF NOT EXISTS idx_collection_activities_user_id ON collection_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_activities_created_at ON collection_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_billing_statements_patient_id ON billing_statements(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_statements_status ON billing_statements(status);
CREATE INDEX IF NOT EXISTS idx_billing_statements_statement_date ON billing_statements(statement_date);
CREATE INDEX IF NOT EXISTS idx_billing_statements_user_id ON billing_statements(user_id);

CREATE INDEX IF NOT EXISTS idx_authorization_requests_patient_name ON authorization_requests(patient_name);
CREATE INDEX IF NOT EXISTS idx_authorization_requests_status ON authorization_requests(status);
CREATE INDEX IF NOT EXISTS idx_authorization_requests_user_id ON authorization_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_plans_statement_id ON payment_plans(statement_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_user_id ON payment_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_status ON payment_plans(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Collections accounts policies
DROP POLICY IF EXISTS "Users can view all collection accounts" ON collections_accounts;
DROP POLICY IF EXISTS "Users can insert collection accounts" ON collections_accounts;
DROP POLICY IF EXISTS "Users can update collection accounts" ON collections_accounts;
DROP POLICY IF EXISTS "Users can delete collection accounts" ON collections_accounts;

CREATE POLICY "Users can view all collection accounts" ON collections_accounts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert collection accounts" ON collections_accounts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update collection accounts" ON collections_accounts
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete collection accounts" ON collections_accounts
    FOR DELETE USING (true);

-- Collection activities policies
DROP POLICY IF EXISTS "Users can view collection activities" ON collection_activities;
DROP POLICY IF EXISTS "Users can insert collection activities" ON collection_activities;
DROP POLICY IF EXISTS "Users can update collection activities" ON collection_activities;
DROP POLICY IF EXISTS "Users can delete collection activities" ON collection_activities;

CREATE POLICY "Users can view collection activities" ON collection_activities
    FOR SELECT USING (true);

CREATE POLICY "Users can insert collection activities" ON collection_activities
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update collection activities" ON collection_activities
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete collection activities" ON collection_activities
    FOR DELETE USING (true);

-- Billing statements policies
DROP POLICY IF EXISTS "Users can view billing statements" ON billing_statements;
DROP POLICY IF EXISTS "Users can insert billing statements" ON billing_statements;
DROP POLICY IF EXISTS "Users can update billing statements" ON billing_statements;
DROP POLICY IF EXISTS "Users can delete billing statements" ON billing_statements;

CREATE POLICY "Users can view billing statements" ON billing_statements
    FOR SELECT USING (true);

CREATE POLICY "Users can insert billing statements" ON billing_statements
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update billing statements" ON billing_statements
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete billing statements" ON billing_statements
    FOR DELETE USING (true);

-- Authorization requests policies
DROP POLICY IF EXISTS "Users can view authorization requests" ON authorization_requests;
DROP POLICY IF EXISTS "Users can insert authorization requests" ON authorization_requests;
DROP POLICY IF EXISTS "Users can update authorization requests" ON authorization_requests;
DROP POLICY IF EXISTS "Users can delete authorization requests" ON authorization_requests;

CREATE POLICY "Users can view authorization requests" ON authorization_requests
    FOR SELECT USING (true);

CREATE POLICY "Users can insert authorization requests" ON authorization_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update authorization requests" ON authorization_requests
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete authorization requests" ON authorization_requests
    FOR DELETE USING (true);

-- Payment plans policies
DROP POLICY IF EXISTS "Users can view payment plans" ON payment_plans;
DROP POLICY IF EXISTS "Users can insert payment plans" ON payment_plans;
DROP POLICY IF EXISTS "Users can update payment plans" ON payment_plans;
DROP POLICY IF EXISTS "Users can delete payment plans" ON payment_plans;

CREATE POLICY "Users can view payment plans" ON payment_plans
    FOR SELECT USING (true);

CREATE POLICY "Users can insert payment plans" ON payment_plans
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update payment plans" ON payment_plans
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete payment plans" ON payment_plans
    FOR DELETE USING (true);

-- Insert sample data
INSERT INTO profiles (id, email, full_name) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@billwise.com', 'Admin User'),
    ('550e8400-e29b-41d4-a716-446655440001', 'billing@billwise.com', 'Billing Staff')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'admin'),
    ('550e8400-e29b-41d4-a716-446655440001', 'billing_staff')
ON CONFLICT DO NOTHING;

INSERT INTO collections_accounts (patient_name, patient_id, current_balance, original_balance, collection_stage, collection_status, days_overdue) VALUES 
    ('Muhammad Wasay', 'PAT-001', 1800.00, 1800.00, 'early_collection', 'active', 45),
    ('Sarah Johnson', 'PAT-002', 2500.00, 2500.00, 'mid_collection', 'active', 75),
    ('Ahmed Hassan', 'PAT-003', 1200.00, 1200.00, 'late_collection', 'payment_plan', 95),
    ('Fatima Ali', 'PAT-004', 3200.00, 3200.00, 'pre_legal', 'attorney_referral', 120)
ON CONFLICT DO NOTHING;

INSERT INTO billing_statements (patient_id, patient_name, amount_due, statement_date, status) VALUES 
    ('PAT-001', 'Muhammad Wasay', 1800.00, '2024-01-15', 'pending'),
    ('PAT-002', 'Sarah Johnson', 2500.00, '2024-01-14', 'sent'),
    ('PAT-003', 'Ahmed Hassan', 1200.00, '2024-01-13', 'delivered'),
    ('PAT-004', 'Fatima Ali', 3200.00, '2024-01-12', 'paid')
ON CONFLICT DO NOTHING;

INSERT INTO authorization_requests (patient_name, payer_name_custom, procedure_codes, diagnosis_codes, status) VALUES 
    ('Muhammad Wasay', 'Blue Cross', ARRAY['99213'], ARRAY['Z00.00'], 'pending'),
    ('Sarah Johnson', 'Aetna', ARRAY['99214'], ARRAY['I10'], 'approved'),
    ('Ahmed Hassan', 'Cigna', ARRAY['99215'], ARRAY['E11.9'], 'denied')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully! All tables, relationships, and sample data have been created.' as status;
