-- ============================================================================
-- COMPLETE CLAIM TABLES SETUP - SEPARATE TABLES FOR PROFESSIONAL & INSTITUTIONAL
-- ============================================================================
-- This file creates separate tables for:
-- - Professional Claims (HCFA/CMS1500) - stored in professional_claims table
-- - Institutional Claims (UB04) - stored in institutional_claims table
-- 
-- Each claim type has its own:
-- - Main claim table
-- - Procedures table
-- - Diagnoses table
-- - Additional data table
-- ============================================================================

-- ============================================================================
-- PROFESSIONAL CLAIMS TABLE (HCFA/CMS1500)
-- ============================================================================

CREATE TABLE IF NOT EXISTS professional_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Basic Information
    claim_number VARCHAR(100) UNIQUE NOT NULL,
    form_type VARCHAR(20) DEFAULT 'HCFA', -- 'HCFA' or 'CMS1500'
    cms_form_version VARCHAR(20) DEFAULT '02-12',
    reference_number VARCHAR(100),
    frequency VARCHAR(50) DEFAULT '1 - Original Claim',
    office_location VARCHAR(255),
    date_of_service DATE,
    
    -- Patient and Provider
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_id_string VARCHAR(100), -- Fallback
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL, -- Rendering Provider
    billing_provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    supervising_provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    ordering_provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    referring_provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Service Information
    service_date_from DATE,
    service_date_to DATE,
    place_of_service_code VARCHAR(10),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    
    -- Insurance Information
    primary_insurance_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
    secondary_insurance_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
    tertiary_insurance_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
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
    
    -- Additional Data (JSONB for flexible storage)
    additional_data JSONB DEFAULT '{}',
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INSTITUTIONAL CLAIMS TABLE (UB04)
-- ============================================================================

CREATE TABLE IF NOT EXISTS institutional_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Basic Information
    claim_number VARCHAR(100) UNIQUE NOT NULL,
    form_type VARCHAR(20) DEFAULT 'UB04',
    cms_form_version VARCHAR(20),
    reference_number VARCHAR(100),
    frequency VARCHAR(50) DEFAULT '1 - Original Claim',
    office_location VARCHAR(255),
    date_of_service DATE,
    
    -- Patient and Provider
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_id_string VARCHAR(100), -- Fallback
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL, -- Billing Provider
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Service Information (UB04 specific)
    statement_covers_from DATE,
    statement_covers_to DATE,
    admission_date DATE,
    admission_type VARCHAR(50),
    discharge_date DATE,
    discharge_hour VARCHAR(10),
    place_of_service_code VARCHAR(10),
    
    -- Insurance Information
    primary_insurance_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
    secondary_insurance_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
    tertiary_insurance_id UUID REFERENCES insurance_payers(id) ON DELETE SET NULL,
    insurance_type VARCHAR(50) DEFAULT 'EDI',
    
    -- Financial Information
    total_charges NUMERIC(10, 2) DEFAULT 0,
    non_covered_charges NUMERIC(10, 2) DEFAULT 0,
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
    
    -- Additional Data (JSONB for flexible storage)
    additional_data JSONB DEFAULT '{}',
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROFESSIONAL CLAIM ADDITIONAL DATA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS professional_claim_additional_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES professional_claims(id) ON DELETE CASCADE,
    
    -- Form Data
    form_data JSONB DEFAULT '{}', -- Stores: referenceNumber, frequency, officeLocation, dateOfService
    
    -- Additional Info
    additional_info JSONB DEFAULT '{}', -- Stores: patientCondition, dates, claimInformation, assignmentOfBenefits, otherReferenceInfo, ambulanceInfo
    
    -- Charge Options (from right sidebar)
    charge_options JSONB DEFAULT '{}', -- Stores: updatePatientDefaults, createChargePanel, setAllChargesTo
    
    -- Payment Data (from right sidebar)
    payment_data JSONB DEFAULT '{}', -- Stores: currentBalance, newBalance, copayDue, paymentApplication, etc.
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per claim
    UNIQUE(claim_id)
);

-- ============================================================================
-- INSTITUTIONAL CLAIM ADDITIONAL DATA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS institutional_claim_additional_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES institutional_claims(id) ON DELETE CASCADE,
    
    -- Form Data
    form_data JSONB DEFAULT '{}', -- Stores: referenceNumber, frequency, officeLocation, dateOfService
    
    -- Additional Info
    additional_info JSONB DEFAULT '{}', -- Stores: patientCondition, dates, claimInformation, assignmentOfBenefits, otherReferenceInfo, ambulanceInfo
    
    -- Charge Options (from right sidebar)
    charge_options JSONB DEFAULT '{}', -- Stores: updatePatientDefaults, createChargePanel, setAllChargesTo
    
    -- Payment Data (from right sidebar)
    payment_data JSONB DEFAULT '{}', -- Stores: currentBalance, newBalance, copayDue, paymentApplication, etc.
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per claim
    UNIQUE(claim_id)
);

-- ============================================================================
-- PROFESSIONAL CLAIM PROCEDURES TABLE (CPT Codes for HCFA/CMS1500)
-- ============================================================================

CREATE TABLE IF NOT EXISTS professional_claim_procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES professional_claims(id) ON DELETE CASCADE,
    
    -- Procedure Information
    cpt_code VARCHAR(10) NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2),
    total_price NUMERIC(10, 2),
    
    -- Service Dates
    service_date_from DATE,
    service_date_to DATE,
    
    -- Modifiers
    modifier_1 VARCHAR(10),
    modifier_2 VARCHAR(10),
    modifier_3 VARCHAR(10),
    modifier_4 VARCHAR(10),
    
    -- Additional Fields
    place_of_service_code VARCHAR(10),
    type_of_service VARCHAR(10), -- TOS
    diagnosis_pointers VARCHAR(50), -- Comma-separated diagnosis pointers
    status VARCHAR(100),
    other VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INSTITUTIONAL CLAIM PROCEDURES TABLE (Revenue Codes for UB04)
-- ============================================================================

CREATE TABLE IF NOT EXISTS institutional_claim_procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES institutional_claims(id) ON DELETE CASCADE,
    
    -- Procedure Information
    revenue_code VARCHAR(10), -- Revenue code for UB04
    hcpcs_code VARCHAR(10), -- HCPCS/CPT code
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2),
    total_price NUMERIC(10, 2),
    
    -- Service Dates
    service_date_from DATE,
    service_date_to DATE,
    
    -- Additional Fields
    place_of_service_code VARCHAR(10),
    diagnosis_pointers VARCHAR(50), -- Comma-separated diagnosis pointers
    status VARCHAR(100),
    other VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROFESSIONAL CLAIM DIAGNOSES TABLE (ICD Codes for HCFA/CMS1500)
-- ============================================================================

CREATE TABLE IF NOT EXISTS professional_claim_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES professional_claims(id) ON DELETE CASCADE,
    
    -- Diagnosis Information
    icd_code VARCHAR(20) NOT NULL,
    description TEXT,
    is_primary BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INSTITUTIONAL CLAIM DIAGNOSES TABLE (ICD Codes for UB04)
-- ============================================================================

CREATE TABLE IF NOT EXISTS institutional_claim_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES institutional_claims(id) ON DELETE CASCADE,
    
    -- Diagnosis Information
    icd_code VARCHAR(20) NOT NULL,
    description TEXT,
    is_primary BOOLEAN DEFAULT false,
    diagnosis_type VARCHAR(50), -- 'principal', 'other', 'external_cause', etc.
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PROFESSIONAL CLAIMS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_professional_claims_user_id ON professional_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_claims_patient_id ON professional_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_professional_claims_provider_id ON professional_claims(provider_id);
CREATE INDEX IF NOT EXISTS idx_professional_claims_billing_provider ON professional_claims(billing_provider_id);
CREATE INDEX IF NOT EXISTS idx_professional_claims_supervising_provider ON professional_claims(supervising_provider_id);
CREATE INDEX IF NOT EXISTS idx_professional_claims_ordering_provider ON professional_claims(ordering_provider_id);
CREATE INDEX IF NOT EXISTS idx_professional_claims_referring_provider ON professional_claims(referring_provider_id);
CREATE INDEX IF NOT EXISTS idx_professional_claims_primary_insurance ON professional_claims(primary_insurance_id);
CREATE INDEX IF NOT EXISTS idx_professional_claims_secondary_insurance ON professional_claims(secondary_insurance_id);
CREATE INDEX IF NOT EXISTS idx_professional_claims_tertiary_insurance ON professional_claims(tertiary_insurance_id);
CREATE INDEX IF NOT EXISTS idx_professional_claims_status ON professional_claims(status);
CREATE INDEX IF NOT EXISTS idx_professional_claims_claim_number ON professional_claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_professional_claims_additional_data ON professional_claims USING GIN (additional_data);
CREATE INDEX IF NOT EXISTS idx_professional_claim_procedures_claim_id ON professional_claim_procedures(claim_id);
CREATE INDEX IF NOT EXISTS idx_professional_claim_diagnoses_claim_id ON professional_claim_diagnoses(claim_id);
CREATE INDEX IF NOT EXISTS idx_professional_claim_additional_data_claim_id ON professional_claim_additional_data(claim_id);
CREATE INDEX IF NOT EXISTS idx_professional_claim_additional_data_form_data ON professional_claim_additional_data USING GIN (form_data);
CREATE INDEX IF NOT EXISTS idx_professional_claim_additional_data_additional_info ON professional_claim_additional_data USING GIN (additional_info);

-- ============================================================================
-- INDEXES FOR INSTITUTIONAL CLAIMS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_institutional_claims_user_id ON institutional_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_institutional_claims_patient_id ON institutional_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_institutional_claims_provider_id ON institutional_claims(provider_id);
CREATE INDEX IF NOT EXISTS idx_institutional_claims_facility_id ON institutional_claims(facility_id);
CREATE INDEX IF NOT EXISTS idx_institutional_claims_primary_insurance ON institutional_claims(primary_insurance_id);
CREATE INDEX IF NOT EXISTS idx_institutional_claims_secondary_insurance ON institutional_claims(secondary_insurance_id);
CREATE INDEX IF NOT EXISTS idx_institutional_claims_tertiary_insurance ON institutional_claims(tertiary_insurance_id);
CREATE INDEX IF NOT EXISTS idx_institutional_claims_status ON institutional_claims(status);
CREATE INDEX IF NOT EXISTS idx_institutional_claims_claim_number ON institutional_claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_institutional_claims_additional_data ON institutional_claims USING GIN (additional_data);
CREATE INDEX IF NOT EXISTS idx_institutional_claim_procedures_claim_id ON institutional_claim_procedures(claim_id);
CREATE INDEX IF NOT EXISTS idx_institutional_claim_diagnoses_claim_id ON institutional_claim_diagnoses(claim_id);
CREATE INDEX IF NOT EXISTS idx_institutional_claim_additional_data_claim_id ON institutional_claim_additional_data(claim_id);
CREATE INDEX IF NOT EXISTS idx_institutional_claim_additional_data_form_data ON institutional_claim_additional_data USING GIN (form_data);
CREATE INDEX IF NOT EXISTS idx_institutional_claim_additional_data_additional_info ON institutional_claim_additional_data USING GIN (additional_info);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE professional_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_claim_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_claim_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_claim_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_claim_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_claim_additional_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_claim_additional_data ENABLE ROW LEVEL SECURITY;

-- Professional Claims RLS Policies
CREATE POLICY "Users can view their own professional claims"
    ON professional_claims FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own professional claims"
    ON professional_claims FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own professional claims"
    ON professional_claims FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own professional claims"
    ON professional_claims FOR DELETE
    USING (user_id = auth.uid());

-- Institutional Claims RLS Policies
CREATE POLICY "Users can view their own institutional claims"
    ON institutional_claims FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own institutional claims"
    ON institutional_claims FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own institutional claims"
    ON institutional_claims FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own institutional claims"
    ON institutional_claims FOR DELETE
    USING (user_id = auth.uid());

-- Professional Claim Procedures RLS Policies
CREATE POLICY "Users can manage their own professional claim procedures"
    ON professional_claim_procedures
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM professional_claims
            WHERE professional_claims.id = professional_claim_procedures.claim_id
            AND professional_claims.user_id = auth.uid()
        )
    );

-- Institutional Claim Procedures RLS Policies
CREATE POLICY "Users can manage their own institutional claim procedures"
    ON institutional_claim_procedures
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM institutional_claims
            WHERE institutional_claims.id = institutional_claim_procedures.claim_id
            AND institutional_claims.user_id = auth.uid()
        )
    );

-- Professional Claim Diagnoses RLS Policies
CREATE POLICY "Users can manage their own professional claim diagnoses"
    ON professional_claim_diagnoses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM professional_claims
            WHERE professional_claims.id = professional_claim_diagnoses.claim_id
            AND professional_claims.user_id = auth.uid()
        )
    );

-- Institutional Claim Diagnoses RLS Policies
CREATE POLICY "Users can manage their own institutional claim diagnoses"
    ON institutional_claim_diagnoses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM institutional_claims
            WHERE institutional_claims.id = institutional_claim_diagnoses.claim_id
            AND institutional_claims.user_id = auth.uid()
        )
    );

-- Professional Claim Additional Data RLS Policies
CREATE POLICY "Users can manage their own professional claim additional data"
    ON professional_claim_additional_data
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM professional_claims
            WHERE professional_claims.id = professional_claim_additional_data.claim_id
            AND professional_claims.user_id = auth.uid()
        )
    );

-- Institutional Claim Additional Data RLS Policies
CREATE POLICY "Users can manage their own institutional claim additional data"
    ON institutional_claim_additional_data
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM institutional_claims
            WHERE institutional_claims.id = institutional_claim_additional_data.claim_id
            AND institutional_claims.user_id = auth.uid()
        )
    );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Professional Claims triggers
CREATE TRIGGER update_professional_claims_updated_at
    BEFORE UPDATE ON professional_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_professional_claim_additional_data_updated_at
    BEFORE UPDATE ON professional_claim_additional_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Institutional Claims triggers
CREATE TRIGGER update_institutional_claims_updated_at
    BEFORE UPDATE ON institutional_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_institutional_claim_additional_data_updated_at
    BEFORE UPDATE ON institutional_claim_additional_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- TABLE COMMENTS FOR DOCUMENTATION
-- ============================================================================

-- Professional Claims
COMMENT ON TABLE professional_claims IS 'Professional claims (HCFA/CMS1500) - separate from institutional claims';
COMMENT ON TABLE professional_claim_procedures IS 'CPT codes and procedures for professional claims';
COMMENT ON TABLE professional_claim_diagnoses IS 'ICD diagnosis codes for professional claims';
COMMENT ON TABLE professional_claim_additional_data IS 'Additional form data, info, charge options, and payment data for professional claims';

-- Institutional Claims
COMMENT ON TABLE institutional_claims IS 'Institutional claims (UB04) - separate from professional claims';
COMMENT ON TABLE institutional_claim_procedures IS 'Revenue codes and procedures for institutional claims';
COMMENT ON TABLE institutional_claim_diagnoses IS 'ICD diagnosis codes for institutional claims';
COMMENT ON TABLE institutional_claim_additional_data IS 'Additional form data, info, charge options, and payment data for institutional claims';

-- ============================================================================
-- VERIFICATION QUERIES (Optional - run these to verify the setup)
-- ============================================================================
-- Professional Claims
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'professional_claims' 
-- ORDER BY ordinal_position;
--
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'professional_claim_procedures' 
-- ORDER BY ordinal_position;
--
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'professional_claim_additional_data' 
-- ORDER BY ordinal_position;
--
-- Institutional Claims
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'institutional_claims' 
-- ORDER BY ordinal_position;
--
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'institutional_claim_procedures' 
-- ORDER BY ordinal_position;
--
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'institutional_claim_additional_data' 
-- ORDER BY ordinal_position;
-- ============================================================================

