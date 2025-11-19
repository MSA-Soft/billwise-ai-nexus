-- Payer Relationship Management Tables
-- Run this in Supabase SQL Editor

-- ============================================================================
-- PAYER COMMUNICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payer_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_id UUID NOT NULL REFERENCES insurance_payers(id) ON DELETE CASCADE,
    
    -- Communication Details
    type VARCHAR(50) NOT NULL, -- 'email', 'phone', 'portal', 'fax', 'mail'
    subject VARCHAR(500),
    message TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'delivered', 'read', 'responded'
    sent_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    response TEXT,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PAYER PORTAL INTEGRATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payer_portal_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_id UUID NOT NULL REFERENCES insurance_payers(id) ON DELETE CASCADE,
    
    -- Portal Configuration
    portal_url VARCHAR(500),
    api_endpoint VARCHAR(500),
    api_key_encrypted TEXT, -- Encrypted API key
    username VARCHAR(255),
    
    -- Capabilities
    capabilities TEXT[], -- Array of capabilities: 'status_check', 'document_upload', 'real_time_updates'
    
    -- Status
    is_active BOOLEAN DEFAULT false,
    last_sync TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_payer_communications_payer_id ON payer_communications(payer_id);
CREATE INDEX IF NOT EXISTS idx_payer_communications_status ON payer_communications(status);
CREATE INDEX IF NOT EXISTS idx_payer_communications_created_at ON payer_communications(created_at);
CREATE INDEX IF NOT EXISTS idx_portal_integrations_payer_id ON payer_portal_integrations(payer_id);
CREATE INDEX IF NOT EXISTS idx_portal_integrations_active ON payer_portal_integrations(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE payer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payer_portal_integrations ENABLE ROW LEVEL SECURITY;

-- Policies for payer_communications
CREATE POLICY "Users can view payer communications"
    ON payer_communications FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create payer communications"
    ON payer_communications FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update payer communications"
    ON payer_communications FOR UPDATE
    TO authenticated
    USING (true);

-- Policies for payer_portal_integrations
CREATE POLICY "Users can view portal integrations"
    ON payer_portal_integrations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage portal integrations"
    ON payer_portal_integrations FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_portal_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portal_integrations_updated_at
    BEFORE UPDATE ON payer_portal_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_portal_integrations_updated_at();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Payer relationship management tables created successfully!' AS status;

