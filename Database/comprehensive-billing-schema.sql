-- Comprehensive Billing Database Schema
-- This file adds all missing tables and fields to support ADA Dental, CMS-1500, and UB-04 forms
-- Run this after the existing database setup

-- ============================================================================
-- ENUMS AND TYPES
-- ============================================================================

-- Create missing enums
CREATE TYPE claim_type AS ENUM ('dental', 'medical', 'institutional');
CREATE TYPE claim_status AS ENUM ('draft', 'submitted', 'processing', 'approved', 'denied', 'paid', 'appealed', 'cancelled');
CREATE TYPE procedure_type AS ENUM ('dental', 'medical', 'surgical', 'diagnostic', 'therapeutic', 'preventive');
CREATE TYPE diagnosis_type AS ENUM ('primary', 'secondary', 'additional');
CREATE TYPE gender AS ENUM ('M', 'F', 'U');
CREATE TYPE relationship_to_insured AS ENUM ('self', 'spouse', 'child', 'other');
CREATE TYPE place_of_service AS ENUM ('office', 'hospital', 'emergency', 'urgent_care', 'home', 'nursing_facility', 'other');
CREATE TYPE admission_type AS ENUM ('emergency', 'urgent', 'elective', 'newborn', 'trauma', 'other');
CREATE TYPE admission_source AS ENUM ('physician_referral', 'clinic_referral', 'hmo_referral', 'transfer', 'emergency_room', 'court_law_enforcement', 'other');
CREATE TYPE patient_status AS ENUM ('discharged', 'still_patient', 'expired', 'ama', 'other');
CREATE TYPE tooth_surface AS ENUM ('mesial', 'distal', 'lingual', 'facial', 'occlusal', 'incisal', 'buccal', 'palatal');
CREATE TYPE tooth_system AS ENUM ('permanent', 'primary', 'mixed');
CREATE TYPE oral_cavity_area AS ENUM ('anterior', 'posterior', 'maxillary', 'mandibular', 'quadrant_1', 'quadrant_2', 'quadrant_3', 'quadrant_4');

-- ============================================================================
-- PATIENT AND DEMOGRAPHIC TABLES
-- ============================================================================

-- Patients table - Core patient information
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT UNIQUE NOT NULL, -- Internal patient ID
    last_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    middle_initial TEXT,
    suffix TEXT,
    date_of_birth DATE NOT NULL,
    gender gender NOT NULL,
    ssn TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    phone_primary TEXT,
    phone_secondary TEXT,
    email TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL
);

-- Patient insurance information
CREATE TABLE patient_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    insurance_company_id UUID NOT NULL,
    member_id TEXT NOT NULL,
    group_number TEXT,
    policy_holder_name TEXT,
    policy_holder_relationship relationship_to_insured,
    policy_holder_dob DATE,
    policy_holder_ssn TEXT,
    effective_date DATE,
    termination_date DATE,
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL
);

-- ============================================================================
-- PROVIDER AND FACILITY TABLES
-- ============================================================================

-- Providers table - Healthcare providers
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npi TEXT UNIQUE NOT NULL,
    last_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    middle_initial TEXT,
    suffix TEXT,
    title TEXT, -- Dr., MD, DDS, etc.
    specialty_code TEXT,
    license_number TEXT,
    tax_id TEXT,
    phone TEXT,
    fax TEXT,
    email TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL
);

-- Facilities table - Healthcare facilities
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_name TEXT NOT NULL,
    npi TEXT UNIQUE,
    tax_id TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    phone TEXT,
    fax TEXT,
    email TEXT,
    facility_type TEXT, -- Hospital, Clinic, Office, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL
);

-- ============================================================================
-- INSURANCE AND PAYER TABLES
-- ============================================================================

-- Insurance companies table (extends existing insurance_payers)
ALTER TABLE insurance_payers ADD COLUMN IF NOT EXISTS payer_type TEXT; -- Primary, Secondary, Tertiary
ALTER TABLE insurance_payers ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE insurance_payers ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE insurance_payers ADD COLUMN IF NOT EXISTS claims_address TEXT;
ALTER TABLE insurance_payers ADD COLUMN IF NOT EXISTS eligibility_phone TEXT;
ALTER TABLE insurance_payers ADD COLUMN IF NOT EXISTS prior_auth_required BOOLEAN DEFAULT false;

-- ============================================================================
-- PROCEDURE AND DIAGNOSIS CODE TABLES
-- ============================================================================

-- Procedure codes table
CREATE TABLE procedure_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    code_type TEXT NOT NULL, -- CPT, HCPCS, ICD-10-PCS
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagnosis codes table
CREATE TABLE diagnosis_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    code_type TEXT NOT NULL, -- ICD-10-CM
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue codes table (for UB-04)
CREATE TABLE revenue_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CLAIM TABLES
-- ============================================================================

-- Main claims table
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_number TEXT UNIQUE NOT NULL,
    claim_type claim_type NOT NULL,
    status claim_status NOT NULL DEFAULT 'draft',
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    primary_insurance_id UUID REFERENCES patient_insurance(id),
    secondary_insurance_id UUID REFERENCES patient_insurance(id),
    tertiary_insurance_id UUID REFERENCES patient_insurance(id),
    billing_provider_id UUID REFERENCES providers(id),
    treating_provider_id UUID REFERENCES providers(id),
    facility_id UUID REFERENCES facilities(id),
    service_start_date DATE,
    service_end_date DATE,
    admission_date DATE,
    discharge_date DATE,
    total_charges DECIMAL(10,2) DEFAULT 0,
    insurance_payment DECIMAL(10,2) DEFAULT 0,
    patient_responsibility DECIMAL(10,2) DEFAULT 0,
    adjustment_amount DECIMAL(10,2) DEFAULT 0,
    prior_authorization_number TEXT,
    referral_number TEXT,
    clinical_indication TEXT,
    submission_date TIMESTAMP WITH TIME ZONE,
    processing_date TIMESTAMP WITH TIME ZONE,
    denial_reason TEXT,
    appeal_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL
);

-- Claim procedures table
CREATE TABLE claim_procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    procedure_code_id UUID NOT NULL REFERENCES procedure_codes(id),
    procedure_date DATE NOT NULL,
    place_of_service place_of_service,
    tooth_number TEXT, -- For dental procedures
    tooth_surface tooth_surface[], -- For dental procedures
    tooth_system tooth_system, -- For dental procedures
    oral_cavity_area oral_cavity_area, -- For dental procedures
    diagnosis_pointer TEXT, -- Links to diagnosis
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2),
    total_charges DECIMAL(10,2),
    is_emergency BOOLEAN DEFAULT false,
    modifier_codes TEXT[], -- CPT modifiers
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claim diagnoses table
CREATE TABLE claim_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    diagnosis_code_id UUID NOT NULL REFERENCES diagnosis_codes(id),
    diagnosis_type diagnosis_type NOT NULL,
    diagnosis_pointer TEXT, -- Links to procedures
    onset_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UB-04 specific revenue codes
CREATE TABLE claim_revenue_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    revenue_code_id UUID NOT NULL REFERENCES revenue_codes(id),
    service_date DATE,
    hcpcs_code TEXT,
    units INTEGER DEFAULT 1,
    total_charges DECIMAL(10,2),
    non_covered_charges DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- DENTAL SPECIFIC TABLES
-- ============================================================================

-- Missing teeth tracking
CREATE TABLE dental_missing_teeth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    tooth_number INTEGER NOT NULL, -- 1-32 for permanent, A-T for primary
    is_missing BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orthodontic treatment details
CREATE TABLE dental_orthodontic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    is_orthodontic BOOLEAN DEFAULT false,
    appliance_placed_date DATE,
    months_remaining INTEGER,
    is_replacement BOOLEAN DEFAULT false,
    prior_placement_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INSTITUTIONAL CLAIM SPECIFIC TABLES
-- ============================================================================

-- Patient admission details
CREATE TABLE patient_admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    admission_date DATE NOT NULL,
    admission_hour TIME,
    admission_type admission_type,
    admission_source admission_source,
    discharge_date DATE,
    discharge_hour TIME,
    patient_status patient_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Physician assignments
CREATE TABLE claim_physicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    physician_id UUID NOT NULL REFERENCES providers(id),
    physician_type TEXT NOT NULL, -- referring, operating, attending, other
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SUPPORTING TABLES
-- ============================================================================

-- Claim attachments and documents
CREATE TABLE claim_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    file_url TEXT,
    attachment_type TEXT, -- radiograph, image, document, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL
);

-- Claim status history
CREATE TABLE claim_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    status claim_status NOT NULL,
    status_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    changed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claim notes and comments
CREATE TABLE claim_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    note_type TEXT NOT NULL, -- internal, patient, insurance
    note_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Patient indexes
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);

-- Provider indexes
CREATE INDEX idx_providers_npi ON providers(npi);
CREATE INDEX idx_providers_name ON providers(last_name, first_name);

-- Claim indexes
CREATE INDEX idx_claims_claim_number ON claims(claim_number);
CREATE INDEX idx_claims_patient_id ON claims(patient_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_service_date ON claims(service_start_date);

-- Procedure indexes
CREATE INDEX idx_claim_procedures_claim_id ON claim_procedures(claim_id);
CREATE INDEX idx_claim_procedures_code ON claim_procedures(procedure_code_id);

-- Diagnosis indexes
CREATE INDEX idx_claim_diagnoses_claim_id ON claim_diagnoses(claim_id);
CREATE INDEX idx_claim_diagnoses_code ON claim_diagnoses(diagnosis_code_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_revenue_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_missing_teeth ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_orthodontic ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_physicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Patients policies
CREATE POLICY "Users can view their own patients" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patients" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patients" ON patients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patients" ON patients
    FOR DELETE USING (auth.uid() = user_id);

-- Patient insurance policies
CREATE POLICY "Users can view their own patient insurance" ON patient_insurance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patient insurance" ON patient_insurance
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patient insurance" ON patient_insurance
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patient insurance" ON patient_insurance
    FOR DELETE USING (auth.uid() = user_id);

-- Providers policies
CREATE POLICY "Users can view their own providers" ON providers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own providers" ON providers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own providers" ON providers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own providers" ON providers
    FOR DELETE USING (auth.uid() = user_id);

-- Facilities policies
CREATE POLICY "Users can view their own facilities" ON facilities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own facilities" ON facilities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own facilities" ON facilities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own facilities" ON facilities
    FOR DELETE USING (auth.uid() = user_id);

-- Claims policies
CREATE POLICY "Users can view their own claims" ON claims
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own claims" ON claims
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims" ON claims
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own claims" ON claims
    FOR DELETE USING (auth.uid() = user_id);

-- Claim procedures policies
CREATE POLICY "Users can view their own claim procedures" ON claim_procedures
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can insert their own claim procedures" ON claim_procedures
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can update their own claim procedures" ON claim_procedures
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can delete their own claim procedures" ON claim_procedures
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

-- Claim diagnoses policies
CREATE POLICY "Users can view their own claim diagnoses" ON claim_diagnoses
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can insert their own claim diagnoses" ON claim_diagnoses
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can update their own claim diagnoses" ON claim_diagnoses
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can delete their own claim diagnoses" ON claim_diagnoses
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

-- Other claim-related tables policies (similar pattern)
CREATE POLICY "Users can view their own claim revenue codes" ON claim_revenue_codes
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can insert their own claim revenue codes" ON claim_revenue_codes
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can update their own claim revenue codes" ON claim_revenue_codes
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can delete their own claim revenue codes" ON claim_revenue_codes
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

-- Dental specific policies
CREATE POLICY "Users can view their own dental missing teeth" ON dental_missing_teeth
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can insert their own dental missing teeth" ON dental_missing_teeth
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can update their own dental missing teeth" ON dental_missing_teeth
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can delete their own dental missing teeth" ON dental_missing_teeth
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

-- Similar policies for other tables...
CREATE POLICY "Users can view their own dental orthodontic" ON dental_orthodontic
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can insert their own dental orthodontic" ON dental_orthodontic
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can update their own dental orthodontic" ON dental_orthodontic
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

CREATE POLICY "Users can delete their own dental orthodontic" ON dental_orthodontic
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id));

-- ============================================================================
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Insert sample procedure codes
INSERT INTO procedure_codes (code, description, code_type, category) VALUES
('D0120', 'Periodic oral evaluation', 'D', 'Preventive'),
('D0150', 'Comprehensive oral evaluation', 'D', 'Diagnostic'),
('D1110', 'Prophylaxis - adult', 'D', 'Preventive'),
('D2140', 'Amalgam - one surface, permanent', 'D', 'Restorative'),
('D2150', 'Amalgam - two surfaces, permanent', 'D', 'Restorative'),
('D2391', 'Resin-based composite - one surface, posterior', 'D', 'Restorative'),
('D2392', 'Resin-based composite - two surfaces, posterior', 'D', 'Restorative'),
('D2740', 'Crown - porcelain/ceramic substrate', 'D', 'Restorative'),
('D2750', 'Crown - porcelain fused to high noble metal', 'D', 'Restorative'),
('D6240', 'Pontic - porcelain fused to high noble metal', 'D', 'Prosthodontics');

-- Insert sample diagnosis codes
INSERT INTO diagnosis_codes (code, description, code_type, category) VALUES
('K02.9', 'Dental caries, unspecified', 'ICD-10-CM', 'Dental'),
('K03.9', 'Diseases of hard tissues of teeth, unspecified', 'ICD-10-CM', 'Dental'),
('K04.9', 'Diseases of pulp and periapical tissues, unspecified', 'ICD-10-CM', 'Dental'),
('K05.9', 'Gingivitis and periodontal diseases, unspecified', 'ICD-10-CM', 'Dental'),
('K08.9', 'Other disorders of teeth and supporting structures, unspecified', 'ICD-10-CM', 'Dental'),
('Z00.00', 'Encounter for general adult medical examination without abnormal findings', 'ICD-10-CM', 'General'),
('Z00.01', 'Encounter for general adult medical examination with abnormal findings', 'ICD-10-CM', 'General');

-- Insert sample revenue codes
INSERT INTO revenue_codes (code, description, category) VALUES
('0100', 'Room and board - general care', 'Room and Board'),
('0200', 'Room and board - intensive care', 'Room and Board'),
('0300', 'Room and board - psychiatric', 'Room and Board'),
('0400', 'Room and board - rehabilitation', 'Room and Board'),
('0500', 'Room and board - skilled nursing', 'Room and Board'),
('0600', 'Room and board - intermediate care', 'Room and Board'),
('0700', 'Room and board - nursery', 'Room and Board'),
('0800', 'Room and board - other', 'Room and Board'),
('1000', 'Medical/surgical supplies and devices', 'Supplies'),
('2000', 'Pharmacy', 'Pharmacy'),
('3000', 'Laboratory', 'Laboratory'),
('4000', 'Radiology', 'Radiology'),
('5000', 'Operating room', 'Operating Room'),
('6000', 'Emergency room', 'Emergency Room'),
('7000', 'Anesthesia', 'Anesthesia'),
('8000', 'Other diagnostic services', 'Diagnostic'),
('9000', 'Other therapeutic services', 'Therapeutic');

-- Success message
SELECT 'Comprehensive billing database schema created successfully! All missing tables and fields have been added.' as status;
