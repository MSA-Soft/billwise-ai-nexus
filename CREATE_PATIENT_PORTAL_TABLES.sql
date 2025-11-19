-- Patient Portal Tables
-- Run this in Supabase SQL Editor

-- ============================================================================
-- PATIENT MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Message Details
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    message_from VARCHAR(50) NOT NULL, -- 'patient' or 'staff'
    
    -- Status
    status VARCHAR(50) DEFAULT 'unread', -- 'unread', 'read', 'archived'
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Attachments
    attachments TEXT[], -- Array of file URLs
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AUTHORIZATION DOCUMENTS TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS authorization_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authorization_request_id UUID NOT NULL REFERENCES authorization_requests(id) ON DELETE CASCADE,
    
    -- Document Details
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100), -- 'clinical_note', 'lab_result', 'imaging', 'supporting_document'
    file_url TEXT NOT NULL,
    file_size INTEGER, -- Size in bytes
    mime_type VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewed', 'approved', 'rejected'
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Metadata
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be patient or staff
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PAYMENTS TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    statement_id UUID REFERENCES billing_statements(id) ON DELETE SET NULL,
    
    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50), -- 'credit_card', 'bank_transfer', 'check', 'cash'
    transaction_id VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    
    -- Metadata
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STORAGE BUCKET FOR PATIENT DOCUMENTS
-- ============================================================================

-- Note: Create this bucket in Supabase Storage dashboard
-- Bucket name: 'patient-documents'
-- Public: false (private)
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, image/*, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_patient_messages_patient_id ON patient_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_messages_status ON patient_messages(status);
CREATE INDEX IF NOT EXISTS idx_patient_messages_created_at ON patient_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_documents_auth_id ON authorization_documents(authorization_request_id);
CREATE INDEX IF NOT EXISTS idx_auth_documents_status ON authorization_documents(status);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_statement_id ON payments(statement_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE patient_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for patient_messages
CREATE POLICY "Patients can view their own messages"
    ON patient_messages FOR SELECT
    TO authenticated
    USING (patient_id IN (SELECT id FROM patients WHERE id = auth.uid()::text));

CREATE POLICY "Patients can create messages"
    ON patient_messages FOR INSERT
    TO authenticated
    WITH CHECK (patient_id IN (SELECT id FROM patients WHERE id = auth.uid()::text));

CREATE POLICY "Staff can view all messages"
    ON patient_messages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Staff can create messages"
    ON patient_messages FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policies for authorization_documents
CREATE POLICY "Users can view authorization documents"
    ON authorization_documents FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can upload authorization documents"
    ON authorization_documents FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Staff can update authorization documents"
    ON authorization_documents FOR UPDATE
    TO authenticated
    USING (true);

-- Policies for payments
CREATE POLICY "Patients can view their own payments"
    ON payments FOR SELECT
    TO authenticated
    USING (patient_id IN (SELECT id FROM patients WHERE id = auth.uid()::text));

CREATE POLICY "Staff can view all payments"
    ON payments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can create payments"
    ON payments FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_patient_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patient_messages_updated_at
    BEFORE UPDATE ON patient_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_messages_updated_at();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Patient portal tables created successfully!' AS status;

