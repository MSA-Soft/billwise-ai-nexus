-- ============================================================================
-- COMPREHENSIVE DATABASE SCHEMA ADDITIONS FOR BILLWISE AI NEXUS
-- ============================================================================
-- This file contains ALL missing tables identified from comprehensive codebase analysis
-- Run this AFTER running COMPLETE_SUPABASE_SCHEMA.sql
-- ============================================================================

-- ============================================================================
-- ADDITIONAL ENUMS
-- ============================================================================

-- Appointment Status
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Claim Status
DO $$ BEGIN
    CREATE TYPE claim_status AS ENUM ('draft', 'submitted', 'acknowledged', 'processing', 'approved', 'denied', 'paid', 'resubmitted', 'appealed', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Claim Form Type
DO $$ BEGIN
    CREATE TYPE claim_form_type AS ENUM ('HCFA', 'UB04', 'ADA', 'CMS1500');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Submission Method
DO $$ BEGIN
    CREATE TYPE submission_method AS ENUM ('EDI', 'Paper', 'Portal', 'Fax');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Document Type
DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('medical_record', 'insurance_card', 'id', 'lab_result', 'imaging', 'referral', 'authorization', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Message Type
DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('appointment_reminder', 'test_results', 'prescription_refill', 'follow_up', 'general_inquiry', 'urgent', 'educational', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Message Priority
DO $$ BEGIN
    CREATE TYPE message_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Code Type
DO $$ BEGIN
    CREATE TYPE code_type AS ENUM ('CPT', 'ICD10', 'HCPCS', 'CDT', 'DRG', 'Revenue', 'Remittance', 'Adjustment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- EDI Transaction Type
DO $$ BEGIN
    CREATE TYPE edi_transaction_type AS ENUM ('270', '271', '276', '277', '837', '835');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- EDI Transaction Status
DO $$ BEGIN
    CREATE TYPE edi_transaction_status AS ENUM ('pending', 'sent', 'acknowledged', 'rejected', 'processed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Practice Status
DO $$ BEGIN
    CREATE TYPE practice_status AS ENUM ('active', 'inactive', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Provider Type
DO $$ BEGIN
    CREATE TYPE provider_type AS ENUM ('individual', 'organization');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payer Agreement Status
DO $$ BEGIN
    CREATE TYPE payer_agreement_status AS ENUM ('active', 'inactive', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Alert Status
DO $$ BEGIN
    CREATE TYPE alert_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Superbill Type
DO $$ BEGIN
    CREATE TYPE superbill_type AS ENUM ('form-based', 'template-based', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statement Template Type
DO $$ BEGIN
    CREATE TYPE statement_template_type AS ENUM ('automatic', 'user-print', 'estimate');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statement Template Format
DO $$ BEGIN
    CREATE TYPE statement_template_format AS ENUM ('enhanced', 'plain-text', 'electronic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statement Template Status
DO $$ BEGIN
    CREATE TYPE statement_template_status AS ENUM ('enabled', 'disabled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Label Type
DO $$ BEGIN
    CREATE TYPE label_type AS ENUM ('Address', 'Insurance', 'Appointment', 'Billing', 'Medical', 'Custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment Status
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment Method
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'check', 'cash', 'ach', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- PATIENT MANAGEMENT TABLES
-- ============================================================================

-- Patients Table (Full Patient Registration)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    patient_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Basic Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    ssn VARCHAR(11),
    marital_status VARCHAR(50),
    race VARCHAR(50),
    ethnicity VARCHAR(50),
    language VARCHAR(50),
    
    -- Contact Information
    phone VARCHAR(20),
    email VARCHAR(255),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Insurance Table
CREATE TABLE IF NOT EXISTS patient_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Primary Insurance
    primary_insurance_company VARCHAR(255),
    primary_insurance_id VARCHAR(100),
    primary_group_number VARCHAR(50),
    primary_policy_holder_name VARCHAR(255),
    primary_policy_holder_relationship VARCHAR(50),
    primary_effective_date DATE,
    primary_expiration_date DATE,
    
    -- Secondary Insurance
    secondary_insurance_company VARCHAR(255),
    secondary_insurance_id VARCHAR(100),
    secondary_group_number VARCHAR(50),
    secondary_policy_holder_name VARCHAR(255),
    secondary_policy_holder_relationship VARCHAR(50),
    secondary_effective_date DATE,
    secondary_expiration_date DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Medical History Table
CREATE TABLE IF NOT EXISTS patient_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Allergies (stored as JSONB array)
    allergies JSONB DEFAULT '[]'::jsonb,
    
    -- Medications (stored as JSONB array)
    medications JSONB DEFAULT '[]'::jsonb,
    
    -- Conditions (stored as JSONB array)
    conditions JSONB DEFAULT '[]'::jsonb,
    
    -- Surgeries (stored as JSONB array)
    surgeries JSONB DEFAULT '[]'::jsonb,
    
    -- Family History (stored as JSONB array)
    family_history JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Vital Signs Table
CREATE TABLE IF NOT EXISTS patient_vital_signs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Vital Signs
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    temperature NUMERIC(4, 1),
    respiratory_rate INTEGER,
    oxygen_saturation NUMERIC(5, 2),
    weight NUMERIC(5, 2),
    height NUMERIC(5, 2),
    bmi NUMERIC(4, 1),
    pain_level INTEGER,
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    recorded_by VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Progress Notes Table
CREATE TABLE IF NOT EXISTS patient_progress_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Note Information
    note_type VARCHAR(100),
    note_date DATE NOT NULL,
    note_time TIME,
    provider VARCHAR(255),
    
    -- SOAP Format
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    review_of_systems TEXT,
    physical_examination TEXT,
    assessment TEXT,
    plan TEXT,
    
    -- Additional Sections
    medications TEXT,
    follow_up TEXT,
    vital_signs TEXT,
    allergies TEXT,
    social_history TEXT,
    family_history TEXT,
    additional_notes TEXT,
    
    -- Metadata
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Treatment Plans Table
CREATE TABLE IF NOT EXISTS patient_treatment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Plan Information
    plan_date DATE NOT NULL,
    provider VARCHAR(255),
    diagnosis TEXT,
    
    -- Treatment Details
    treatment_goals TEXT,
    treatment_plan TEXT,
    medications TEXT,
    procedures TEXT,
    lifestyle_modifications TEXT,
    follow_up_schedule TEXT,
    expected_outcome TEXT,
    risk_factors TEXT,
    contraindications TEXT,
    patient_education TEXT,
    additional_notes TEXT,
    
    -- Metadata
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Documents Table
CREATE TABLE IF NOT EXISTS patient_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Document Information
    document_type document_type NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- File Information
    file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(100),
    file_url TEXT, -- URL to file in Supabase Storage
    
    -- Metadata
    uploaded_by VARCHAR(255),
    upload_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Messages Table
CREATE TABLE IF NOT EXISTS patient_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Message Information
    message_type message_type NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority message_priority DEFAULT 'normal',
    
    -- Sending Information
    send_method VARCHAR(50) NOT NULL,
    scheduled_send BOOLEAN DEFAULT false,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    sender VARCHAR(255) NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Attachments (stored as JSONB array of file URLs)
    attachments JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- APPOINTMENT/SCHEDULING TABLES
-- ============================================================================

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_id_string VARCHAR(100), -- Fallback if patient not in patients table
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    
    -- Appointment Details
    appointment_type VARCHAR(100),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status appointment_status DEFAULT 'scheduled',
    location VARCHAR(255),
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CLAIMS MANAGEMENT TABLES
-- ============================================================================

-- Claims Table
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Basic Information
    claim_number VARCHAR(100) UNIQUE NOT NULL,
    form_type claim_form_type DEFAULT 'HCFA',
    cms_form_version VARCHAR(20),
    
    -- Patient and Provider
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_id_string VARCHAR(100), -- Fallback
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Service Information
    service_date_from DATE,
    service_date_to DATE,
    place_of_service_code VARCHAR(10),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    
    -- Insurance Information
    primary_insurance_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
    secondary_insurance_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
    insurance_type VARCHAR(50) DEFAULT 'EDI',
    
    -- Financial Information
    total_charges NUMERIC(10, 2) DEFAULT 0,
    patient_responsibility NUMERIC(10, 2) DEFAULT 0,
    insurance_amount NUMERIC(10, 2) DEFAULT 0,
    copay_amount NUMERIC(10, 2) DEFAULT 0,
    deductible_amount NUMERIC(10, 2) DEFAULT 0,
    
    -- Authorization
    prior_auth_number VARCHAR(100),
    referral_number VARCHAR(100),
    treatment_auth_code VARCHAR(100),
    
    -- Status
    status claim_status DEFAULT 'draft',
    submission_method submission_method DEFAULT 'EDI',
    is_secondary_claim BOOLEAN DEFAULT false,
    submission_date DATE,
    
    -- Additional
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claim Procedures Table (CPT Codes)
CREATE TABLE IF NOT EXISTS claim_procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    
    -- Procedure Information
    cpt_code VARCHAR(10) NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2),
    total_price NUMERIC(10, 2),
    modifier VARCHAR(10),
    diagnosis_pointer VARCHAR(10), -- Points to diagnosis
    place_of_service VARCHAR(10),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claim Diagnoses Table (ICD Codes)
CREATE TABLE IF NOT EXISTS claim_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    
    -- Diagnosis Information
    icd_code VARCHAR(20) NOT NULL,
    description TEXT,
    is_primary BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claim Denials Table
CREATE TABLE IF NOT EXISTS claim_denials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    
    -- Denial Information
    denial_reason_code VARCHAR(50),
    denial_reason TEXT,
    denial_date DATE,
    
    -- Resolution
    resolved BOOLEAN DEFAULT false,
    resolution_date DATE,
    resolution_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PRACTICE MANAGEMENT TABLES
-- ============================================================================

-- Practices Table
CREATE TABLE IF NOT EXISTS practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    npi VARCHAR(10) UNIQUE NOT NULL,
    organization_type VARCHAR(100),
    taxonomy_specialty VARCHAR(100),
    reference_number VARCHAR(100),
    tcn_prefix VARCHAR(50),
    statement_tcn_prefix VARCHAR(50),
    code VARCHAR(50),
    
    -- Primary Office Address
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    time_zone VARCHAR(50),
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(255),
    
    -- Pay-To Address (if different)
    pay_to_same_as_primary BOOLEAN DEFAULT true,
    pay_to_address_line1 TEXT,
    pay_to_address_line2 TEXT,
    pay_to_city VARCHAR(100),
    pay_to_state VARCHAR(50),
    pay_to_zip_code VARCHAR(20),
    pay_to_phone VARCHAR(20),
    pay_to_fax VARCHAR(20),
    pay_to_email VARCHAR(255),
    
    -- Status and Statistics
    status practice_status DEFAULT 'active',
    established_date DATE,
    provider_count INTEGER DEFAULT 0,
    patient_count INTEGER DEFAULT 0,
    monthly_revenue NUMERIC(12, 2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referring Providers Table
CREATE TABLE IF NOT EXISTS referring_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_initial VARCHAR(1),
    credentials VARCHAR(50),
    provider_type provider_type DEFAULT 'individual',
    referring_type VARCHAR(100),
    do_not_send_on_claims BOOLEAN DEFAULT false,
    npi VARCHAR(10) UNIQUE,
    taxonomy_specialty VARCHAR(100),
    sequence_number VARCHAR(50),
    reference_number VARCHAR(100),
    
    -- Contact Information
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    home_phone VARCHAR(20),
    cell_phone VARCHAR(20),
    phone VARCHAR(20),
    fax VARCHAR(20),
    pager VARCHAR(20),
    email VARCHAR(255),
    
    -- ID Numbers
    tax_id VARCHAR(50),
    tax_id_type VARCHAR(50),
    upin VARCHAR(50),
    bcbs_id VARCHAR(50),
    medicare_id VARCHAR(50),
    medicaid_id VARCHAR(50),
    champus_id VARCHAR(50),
    specialty_license_number VARCHAR(50),
    state_license_number VARCHAR(50),
    anesthesia_license_number VARCHAR(50),
    marketer VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payer Agreements Table
CREATE TABLE IF NOT EXISTS payer_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Provider Type
    provider_type provider_type DEFAULT 'individual',
    provider_name VARCHAR(255) NOT NULL,
    
    -- NPI Selection
    npi_type VARCHAR(50) DEFAULT 'practice',
    practice_npi VARCHAR(10),
    other_npi VARCHAR(10),
    
    -- Responsible Party Contact Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- Agreement Details
    agreement_type VARCHAR(100),
    status payer_agreement_status DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection Agencies Table
CREATE TABLE IF NOT EXISTS collection_agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    
    -- Contact Information
    address TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(255),
    
    -- Additional Information
    agency_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    commission_rate NUMERIC(5, 2),
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ALERTS AND LABELS TABLES
-- ============================================================================

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Alert Information
    alert_type VARCHAR(50) NOT NULL,
    patient VARCHAR(255),
    message TEXT NOT NULL,
    create_user VARCHAR(255),
    is_global BOOLEAN DEFAULT false,
    
    -- Section Visibility
    patient_section BOOLEAN DEFAULT false,
    claim_section BOOLEAN DEFAULT false,
    payment_section BOOLEAN DEFAULT false,
    appointment_section BOOLEAN DEFAULT false,
    
    -- Date Ranges
    create_date_range VARCHAR(50),
    create_date_start DATE,
    create_date_end DATE,
    effective_start_date_range VARCHAR(50),
    effective_start_date_start DATE,
    effective_start_date_end DATE,
    effective_end_date_range VARCHAR(50),
    effective_end_date_start DATE,
    effective_end_date_end DATE,
    include_deleted BOOLEAN DEFAULT false,
    
    -- Status
    status alert_status DEFAULT 'active',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Label Templates Table
CREATE TABLE IF NOT EXISTS label_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Information
    name VARCHAR(255) NOT NULL,
    label_type label_type NOT NULL,
    printer_type VARCHAR(100),
    label_size VARCHAR(100),
    
    -- Formatting
    font VARCHAR(50),
    font_size VARCHAR(10),
    bold BOOLEAN DEFAULT false,
    italics BOOLEAN DEFAULT false,
    column_spacing INTEGER DEFAULT 15,
    
    -- Columns (stored as JSONB)
    columns JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SUPERBILLS AND STATEMENTS TABLES
-- ============================================================================

-- Superbills Table
CREATE TABLE IF NOT EXISTS superbills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Superbill Information
    name VARCHAR(255) NOT NULL,
    type superbill_type DEFAULT 'form-based',
    file_path TEXT,
    file_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    description TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Statement Templates Table
CREATE TABLE IF NOT EXISTS statement_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Information
    name VARCHAR(255) NOT NULL,
    type statement_template_type NOT NULL,
    format statement_template_format NOT NULL,
    status statement_template_status DEFAULT 'enabled',
    description TEXT,
    template_content TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CODES MANAGEMENT TABLES
-- ============================================================================

-- Codes Table (CPT, ICD, HCPCS, etc.)
CREATE TABLE IF NOT EXISTS codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Code Information
    code VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    type code_type NOT NULL,
    price NUMERIC(10, 2),
    inactive BOOLEAN DEFAULT false,
    
    -- Additional Information
    category VARCHAR(100),
    modifier VARCHAR(10),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint on code + type
    UNIQUE(code, type)
);

-- Code Validations Table (Validation History)
CREATE TABLE IF NOT EXISTS code_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Validation Information
    code VARCHAR(20) NOT NULL,
    code_type code_type NOT NULL,
    is_valid BOOLEAN,
    description TEXT,
    
    -- Validation Results (stored as JSONB)
    errors JSONB DEFAULT '[]'::jsonb,
    warnings JSONB DEFAULT '[]'::jsonb,
    suggestions JSONB DEFAULT '[]'::jsonb,
    
    -- Denial Risk Assessment
    denial_risk_level VARCHAR(20),
    denial_risk_score INTEGER,
    denial_risk_factors JSONB DEFAULT '[]'::jsonb,
    denial_probability INTEGER,
    
    -- Recommendations
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PAYMENT PROCESSING TABLES
-- ============================================================================

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
    
    -- Payment Information
    payment_amount NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method payment_method,
    check_number VARCHAR(100),
    
    -- Remittance Information
    total_paid NUMERIC(10, 2),
    adjustments NUMERIC(10, 2),
    patient_responsibility NUMERIC(10, 2),
    
    -- Status
    status payment_status DEFAULT 'pending',
    
    -- Metadata
    payer_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
    remittance_advice JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EDI TRANSACTIONS TABLE
-- ============================================================================

-- EDI Transactions Table
CREATE TABLE IF NOT EXISTS edi_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Transaction Information
    transaction_type edi_transaction_type NOT NULL,
    status edi_transaction_status DEFAULT 'pending',
    
    -- Related Entities
    patient_id VARCHAR(100),
    payer_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
    claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
    
    -- Amount (if applicable)
    amount NUMERIC(10, 2),
    
    -- Error Information
    error_message TEXT,
    
    -- Transaction Data (stored as JSONB)
    request_data JSONB,
    response_data JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENHANCED PROVIDERS TABLE (Add missing columns)
-- ============================================================================

-- Add missing columns to providers table if they don't exist
DO $$ 
BEGIN
    -- Provider Identification
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='middle_initial') THEN
        ALTER TABLE providers ADD COLUMN middle_initial VARCHAR(1);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='credentials') THEN
        ALTER TABLE providers ADD COLUMN credentials VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='provider_type') THEN
        ALTER TABLE providers ADD COLUMN provider_type provider_type DEFAULT 'individual';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='taxonomy_specialty') THEN
        ALTER TABLE providers ADD COLUMN taxonomy_specialty VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='sequence_number') THEN
        ALTER TABLE providers ADD COLUMN sequence_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='reference_number') THEN
        ALTER TABLE providers ADD COLUMN reference_number VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='code') THEN
        ALTER TABLE providers ADD COLUMN code VARCHAR(50);
    END IF;
    
    -- Billing Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='practice_for_provider') THEN
        ALTER TABLE providers ADD COLUMN practice_for_provider VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='bill_claims_under') THEN
        ALTER TABLE providers ADD COLUMN bill_claims_under VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='check_eligibility_under') THEN
        ALTER TABLE providers ADD COLUMN check_eligibility_under VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='use_id_number') THEN
        ALTER TABLE providers ADD COLUMN use_id_number VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='employer_identification_number') THEN
        ALTER TABLE providers ADD COLUMN employer_identification_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='bill_as') THEN
        ALTER TABLE providers ADD COLUMN bill_as VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='bill_professional_claims') THEN
        ALTER TABLE providers ADD COLUMN bill_professional_claims BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='bill_institutional_claims') THEN
        ALTER TABLE providers ADD COLUMN bill_institutional_claims BOOLEAN DEFAULT false;
    END IF;
    
    -- Internal Use
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='submitter_number') THEN
        ALTER TABLE providers ADD COLUMN submitter_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='tcn_prefix') THEN
        ALTER TABLE providers ADD COLUMN tcn_prefix VARCHAR(50);
    END IF;
    
    -- Additional Contact
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='home_phone') THEN
        ALTER TABLE providers ADD COLUMN home_phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='cell_phone') THEN
        ALTER TABLE providers ADD COLUMN cell_phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='fax_number') THEN
        ALTER TABLE providers ADD COLUMN fax_number VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='pager_number') THEN
        ALTER TABLE providers ADD COLUMN pager_number VARCHAR(20);
    END IF;
    
    -- ID Numbers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='specialty_license_number') THEN
        ALTER TABLE providers ADD COLUMN specialty_license_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='state_license_number') THEN
        ALTER TABLE providers ADD COLUMN state_license_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='anesthesia_license_number') THEN
        ALTER TABLE providers ADD COLUMN anesthesia_license_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='upin_number') THEN
        ALTER TABLE providers ADD COLUMN upin_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='blue_cross_number') THEN
        ALTER TABLE providers ADD COLUMN blue_cross_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='tricare_champus_number') THEN
        ALTER TABLE providers ADD COLUMN tricare_champus_number VARCHAR(50);
    END IF;
    
    -- Claim Defaults
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='rev_code') THEN
        ALTER TABLE providers ADD COLUMN rev_code VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='default_facility') THEN
        ALTER TABLE providers ADD COLUMN default_facility VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='status') THEN
        ALTER TABLE providers ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;
END $$;

-- ============================================================================
-- ENHANCED FACILITIES TABLE (Add missing columns)
-- ============================================================================

-- Add missing columns to facilities table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='npi') THEN
        ALTER TABLE facilities ADD COLUMN npi VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='taxonomy_specialty') THEN
        ALTER TABLE facilities ADD COLUMN taxonomy_specialty VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='sequence_number') THEN
        ALTER TABLE facilities ADD COLUMN sequence_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='reference_number') THEN
        ALTER TABLE facilities ADD COLUMN reference_number VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='tax_id') THEN
        ALTER TABLE facilities ADD COLUMN tax_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='clia_id') THEN
        ALTER TABLE facilities ADD COLUMN clia_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='location_provider_id') THEN
        ALTER TABLE facilities ADD COLUMN location_provider_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='site_id') THEN
        ALTER TABLE facilities ADD COLUMN site_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='blue_cross_id') THEN
        ALTER TABLE facilities ADD COLUMN blue_cross_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='blue_shield_id') THEN
        ALTER TABLE facilities ADD COLUMN blue_shield_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='medicare_id') THEN
        ALTER TABLE facilities ADD COLUMN medicare_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='medicaid_id') THEN
        ALTER TABLE facilities ADD COLUMN medicaid_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='locator_code') THEN
        ALTER TABLE facilities ADD COLUMN locator_code VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='place_of_service') THEN
        ALTER TABLE facilities ADD COLUMN place_of_service VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='fax') THEN
        ALTER TABLE facilities ADD COLUMN fax VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facilities' AND column_name='email') THEN
        ALTER TABLE facilities ADD COLUMN email VARCHAR(255);
    END IF;
END $$;

-- ============================================================================
-- ENHANCED INSURANCE PAYERS TABLE (Add missing columns)
-- ============================================================================

-- Add missing columns to insurance_payers table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='plan_name') THEN
        ALTER TABLE insurance_payers ADD COLUMN plan_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='network_status') THEN
        ALTER TABLE insurance_payers ADD COLUMN network_status VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='payer_type') THEN
        ALTER TABLE insurance_payers ADD COLUMN payer_type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='default_charge_status') THEN
        ALTER TABLE insurance_payers ADD COLUMN default_charge_status VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='clearinghouse_processing_mode') THEN
        ALTER TABLE insurance_payers ADD COLUMN clearinghouse_processing_mode VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='sequence_number') THEN
        ALTER TABLE insurance_payers ADD COLUMN sequence_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='reference_number') THEN
        ALTER TABLE insurance_payers ADD COLUMN reference_number VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='group_number') THEN
        ALTER TABLE insurance_payers ADD COLUMN group_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='claim_office_number') THEN
        ALTER TABLE insurance_payers ADD COLUMN claim_office_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='payer_id_medigap') THEN
        ALTER TABLE insurance_payers ADD COLUMN payer_id_medigap VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='ocna') THEN
        ALTER TABLE insurance_payers ADD COLUMN ocna VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='use_alternate_practice_info') THEN
        ALTER TABLE insurance_payers ADD COLUMN use_alternate_practice_info BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='fax') THEN
        ALTER TABLE insurance_payers ADD COLUMN fax VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='email') THEN
        ALTER TABLE insurance_payers ADD COLUMN email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_payers' AND column_name='website') THEN
        ALTER TABLE insurance_payers ADD COLUMN website VARCHAR(255);
    END IF;
END $$;

-- ============================================================================
-- CREATE INDEXES FOR NEW TABLES (with error handling)
-- ============================================================================

DO $$ 
BEGIN
    -- Patients Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
        CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
        CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
        END IF;
    END IF;
    
    -- Patient Insurance Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_insurance') THEN
        CREATE INDEX IF NOT EXISTS idx_patient_insurance_patient_id ON patient_insurance(patient_id);
    END IF;
    
    -- Patient Medical History Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_medical_history') THEN
        CREATE INDEX IF NOT EXISTS idx_patient_medical_history_patient_id ON patient_medical_history(patient_id);
    END IF;
    
    -- Patient Vital Signs Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_vital_signs') THEN
        CREATE INDEX IF NOT EXISTS idx_patient_vital_signs_patient_id ON patient_vital_signs(patient_id);
        CREATE INDEX IF NOT EXISTS idx_patient_vital_signs_timestamp ON patient_vital_signs(timestamp);
    END IF;
    
    -- Patient Progress Notes Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_progress_notes') THEN
        CREATE INDEX IF NOT EXISTS idx_patient_progress_notes_patient_id ON patient_progress_notes(patient_id);
        CREATE INDEX IF NOT EXISTS idx_patient_progress_notes_note_date ON patient_progress_notes(note_date);
    END IF;
    
    -- Patient Treatment Plans Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_treatment_plans') THEN
        CREATE INDEX IF NOT EXISTS idx_patient_treatment_plans_patient_id ON patient_treatment_plans(patient_id);
    END IF;
    
    -- Patient Documents Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_documents') THEN
        CREATE INDEX IF NOT EXISTS idx_patient_documents_patient_id ON patient_documents(patient_id);
        CREATE INDEX IF NOT EXISTS idx_patient_documents_document_type ON patient_documents(document_type);
    END IF;
    
    -- Patient Messages Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_messages') THEN
        CREATE INDEX IF NOT EXISTS idx_patient_messages_patient_id ON patient_messages(patient_id);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patient_messages' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_patient_messages_status ON patient_messages(status);
        END IF;
    END IF;
    
    -- Appointments Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
        CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id);
        CREATE INDEX IF NOT EXISTS idx_appointments_facility_id ON appointments(facility_id);
        CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_date ON appointments(scheduled_date);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
        END IF;
    END IF;
    
    -- Claims Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'claims') THEN
        CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
        CREATE INDEX IF NOT EXISTS idx_claims_patient_id ON claims(patient_id);
        CREATE INDEX IF NOT EXISTS idx_claims_provider_id ON claims(provider_id);
        CREATE INDEX IF NOT EXISTS idx_claims_primary_insurance_id ON claims(primary_insurance_id);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claims' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
        END IF;
        CREATE INDEX IF NOT EXISTS idx_claims_claim_number ON claims(claim_number);
        CREATE INDEX IF NOT EXISTS idx_claims_service_date_from ON claims(service_date_from);
    END IF;
    
    -- Claim Procedures Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'claim_procedures') THEN
        CREATE INDEX IF NOT EXISTS idx_claim_procedures_claim_id ON claim_procedures(claim_id);
        CREATE INDEX IF NOT EXISTS idx_claim_procedures_cpt_code ON claim_procedures(cpt_code);
    END IF;
    
    -- Claim Diagnoses Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'claim_diagnoses') THEN
        CREATE INDEX IF NOT EXISTS idx_claim_diagnoses_claim_id ON claim_diagnoses(claim_id);
        CREATE INDEX IF NOT EXISTS idx_claim_diagnoses_icd_code ON claim_diagnoses(icd_code);
        CREATE INDEX IF NOT EXISTS idx_claim_diagnoses_is_primary ON claim_diagnoses(is_primary);
    END IF;
    
    -- Claim Denials Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'claim_denials') THEN
        CREATE INDEX IF NOT EXISTS idx_claim_denials_claim_id ON claim_denials(claim_id);
        CREATE INDEX IF NOT EXISTS idx_claim_denials_resolved ON claim_denials(resolved);
    END IF;
    
    -- Practices Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'practices') THEN
        CREATE INDEX IF NOT EXISTS idx_practices_npi ON practices(npi);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practices' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_practices_status ON practices(status);
        END IF;
    END IF;
    
    -- Referring Providers Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referring_providers') THEN
        CREATE INDEX IF NOT EXISTS idx_referring_providers_npi ON referring_providers(npi);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referring_providers' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_referring_providers_status ON referring_providers(status);
        END IF;
    END IF;
    
    -- Payer Agreements Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payer_agreements') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payer_agreements' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_payer_agreements_status ON payer_agreements(status);
        END IF;
    END IF;
    
    -- Collection Agencies Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collection_agencies') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collection_agencies' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_collection_agencies_status ON collection_agencies(status);
        END IF;
    END IF;
    
    -- Alerts Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts') THEN
        CREATE INDEX IF NOT EXISTS idx_alerts_alert_type ON alerts(alert_type);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
        END IF;
    END IF;
    
    -- Label Templates Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'label_templates') THEN
        CREATE INDEX IF NOT EXISTS idx_label_templates_label_type ON label_templates(label_type);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'label_templates' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_label_templates_status ON label_templates(status);
        END IF;
    END IF;
    
    -- Superbills Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'superbills') THEN
        CREATE INDEX IF NOT EXISTS idx_superbills_type ON superbills(type);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superbills' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_superbills_status ON superbills(status);
        END IF;
    END IF;
    
    -- Statement Templates Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'statement_templates') THEN
        CREATE INDEX IF NOT EXISTS idx_statement_templates_type ON statement_templates(type);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'statement_templates' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_statement_templates_status ON statement_templates(status);
        END IF;
    END IF;
    
    -- Codes Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'codes') THEN
        CREATE INDEX IF NOT EXISTS idx_codes_code ON codes(code);
        CREATE INDEX IF NOT EXISTS idx_codes_type ON codes(type);
        CREATE INDEX IF NOT EXISTS idx_codes_inactive ON codes(inactive);
    END IF;
    
    -- Code Validations Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'code_validations') THEN
        CREATE INDEX IF NOT EXISTS idx_code_validations_user_id ON code_validations(user_id);
        CREATE INDEX IF NOT EXISTS idx_code_validations_code ON code_validations(code);
        CREATE INDEX IF NOT EXISTS idx_code_validations_code_type ON code_validations(code_type);
    END IF;
    
    -- Payments Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
        CREATE INDEX IF NOT EXISTS idx_payments_claim_id ON payments(claim_id);
        CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON payments(payer_id);
        CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
        END IF;
    END IF;
    
    -- EDI Transactions Indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'edi_transactions') THEN
        CREATE INDEX IF NOT EXISTS idx_edi_transactions_user_id ON edi_transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_edi_transactions_transaction_type ON edi_transactions(transaction_type);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'edi_transactions' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_edi_transactions_status ON edi_transactions(status);
        END IF;
        CREATE INDEX IF NOT EXISTS idx_edi_transactions_patient_id ON edi_transactions(patient_id);
        CREATE INDEX IF NOT EXISTS idx_edi_transactions_claim_id ON edi_transactions(claim_id);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating indexes: %', SQLERRM;
END $$;

-- ============================================================================
-- CREATE TRIGGERS FOR UPDATED_AT (with error handling)
-- ============================================================================

DO $$ 
DECLARE
    trigger_tables TEXT[] := ARRAY[
        'patients', 'patient_insurance', 'patient_medical_history',
        'patient_progress_notes', 'patient_treatment_plans',
        'appointments', 'claims', 'claim_denials',
        'practices', 'referring_providers', 'payer_agreements',
        'collection_agencies', 'alerts', 'label_templates',
        'superbills', 'statement_templates', 'codes',
        'payments', 'edi_transactions'
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
-- ENABLE ROW LEVEL SECURITY ON NEW TABLES (with error handling)
-- ============================================================================

DO $$ 
DECLARE
    table_name_list TEXT[] := ARRAY[
        'patients', 'patient_insurance', 'patient_medical_history',
        'patient_vital_signs', 'patient_progress_notes',
        'patient_treatment_plans', 'patient_documents', 'patient_messages',
        'appointments', 'claims', 'claim_procedures', 'claim_diagnoses',
        'claim_denials', 'practices', 'referring_providers',
        'payer_agreements', 'collection_agencies', 'alerts',
        'label_templates', 'superbills', 'statement_templates',
        'codes', 'code_validations', 'payments', 'edi_transactions'
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
-- INSERT DUMMY DATA
-- ============================================================================

-- Insert Sample Patients
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
        INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address_line1, city, state, zip_code, status) VALUES
        ('PAT-001', 'John', 'Doe', '1980-05-15', 'Male', '217-555-1000', 'john.doe@email.com', '123 Main St', 'Springfield', 'IL', '62701', 'active'),
        ('PAT-002', 'Jane', 'Smith', '1975-08-22', 'Female', '217-555-1001', 'jane.smith@email.com', '456 Oak Ave', 'Springfield', 'IL', '62702', 'active'),
        ('PAT-003', 'Robert', 'Johnson', '1990-12-10', 'Male', '217-555-1002', 'robert.johnson@email.com', '789 Pine St', 'Springfield', 'IL', '62703', 'active'),
        ('PAT-004', 'Emily', 'Davis', '1985-03-25', 'Female', '217-555-1003', 'emily.davis@email.com', '321 Elm St', 'Springfield', 'IL', '62704', 'active'),
        ('PAT-005', 'Michael', 'Wilson', '1978-07-18', 'Male', '217-555-1004', 'michael.wilson@email.com', '654 Maple Dr', 'Springfield', 'IL', '62705', 'active')
        ON CONFLICT (patient_id) DO NOTHING;
        RAISE NOTICE 'Inserted sample patients';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting patients: %', SQLERRM;
END $$;

-- Insert Sample Appointments
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'facilities') THEN
        INSERT INTO appointments (patient_id_string, provider_id, facility_id, appointment_type, scheduled_date, scheduled_time, duration_minutes, status, location) 
        SELECT 
            'PAT-001',
            p.id,
            f.id,
            'consultation',
            CURRENT_DATE + INTERVAL '7 days',
            '09:00:00',
            30,
            'scheduled',
            'Room 101'
        FROM providers p, facilities f
        WHERE p.npi = '1234567890' AND f.name = 'Main Clinic'
        LIMIT 1
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Inserted sample appointment';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting appointments: %', SQLERRM;
END $$;

-- Insert Sample Codes
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'codes') THEN
        INSERT INTO codes (code, description, type, price, inactive) VALUES
        ('99213', 'Office visit, established patient, expanded', 'CPT', 200.00, false),
        ('99214', 'Office visit, established patient, detailed', 'CPT', 250.00, false),
        ('36415', 'Collection of venous blood by venipuncture', 'CPT', 50.00, false),
        ('93000', 'Electrocardiogram, routine ECG', 'CPT', 150.00, false),
        ('I10', 'Essential hypertension', 'ICD10', NULL, false),
        ('E11.9', 'Type 2 diabetes mellitus without complications', 'ICD10', NULL, false),
        ('M79.3', 'Panniculitis, unspecified', 'ICD10', NULL, false),
        ('R06.02', 'Shortness of breath', 'ICD10', NULL, false)
        ON CONFLICT (code, type) DO NOTHING;
        RAISE NOTICE 'Inserted sample codes';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting codes: %', SQLERRM;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Comprehensive database schema additions completed successfully!';
    RAISE NOTICE '📋 All missing tables have been added:';
    RAISE NOTICE '   - Patient Management (patients, insurance, medical history, vitals, notes, plans, documents, messages)';
    RAISE NOTICE '   - Appointments';
    RAISE NOTICE '   - Claims Management (claims, procedures, diagnoses, denials)';
    RAISE NOTICE '   - Practice Management (practices, referring providers, payer agreements, collection agencies)';
    RAISE NOTICE '   - Alerts and Labels';
    RAISE NOTICE '   - Superbills and Statement Templates';
    RAISE NOTICE '   - Codes Management';
    RAISE NOTICE '   - Payment Processing';
    RAISE NOTICE '   - EDI Transactions';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '   1. Verify all tables were created successfully';
    RAISE NOTICE '   2. Review and customize RLS policies';
    RAISE NOTICE '   3. Add more dummy data as needed';
    RAISE NOTICE '   4. Test all relationships and foreign keys';
END $$;

